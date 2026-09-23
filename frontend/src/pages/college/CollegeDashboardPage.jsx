import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import collegeService from '../../services/collegeService';
import WorkshopModal from '../../components/workshop/WorkshopModal';

export default function CollegeDashboardPage() {
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [heatmapSkills, setHeatmapSkills] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [threshold, setThreshold] = useState(40);
  const [conductedWorkshops, setConductedWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      collegeService.getHeatmap(),
      collegeService.getAlerts(),
      collegeService.getConductedWorkshops()
    ]).then(([heatmapRes, alertRes, conductedRes]) => {
      setHeatmapSkills(heatmapRes?.skills || []);
      if (alertRes && alertRes.alerts) {
        setAlerts(alertRes.alerts);
        if (alertRes.threshold) {
          setThreshold(alertRes.threshold);
        }
      }
      if (Array.isArray(conductedRes)) {
        setConductedWorkshops(conductedRes);
      }
      const total = alertRes?.totalStudents || 28;
      setStats(collegeService.getInstitutionStats(total));
      setDepartments(collegeService.getDepartments(total));
      setLoading(false);
    });
  }, []);


  const handleOpenWorkshop = (workshop) => {
    if (!workshop) return;
    setSelectedWorkshop(workshop);
    setIsWorkshopModalOpen(true);
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        Loading Institutional Analytics...
      </div>
    );
  }

  const criticalDeficit = heatmapSkills.find(s => s.status === 'Critical Deficit') || { skill: 'Power BI', demandScore: 90 };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-200">
      {/* 40% Campus Skill Alert Area - Displays at most TWO representative cards (>=40% and <40%) */}
      {alerts && alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.slice(0, 2).map((alert, idx) => {
            const deficit = alert.deficitPercentage ?? alert.lackingPercentage;
            const lacking = alert.affectedStudents ?? alert.lackingCount;
            const total = alert.totalStudentsAnalyzed ?? alert.totalAssessed ?? alert.totalStudents;
            const isAboveThreshold = alert.isCritical ?? (deficit >= threshold);
            const hasConductedWorkshop = alert.hasWorkshop && alert.workshop;

            if (isAboveThreshold) {
              // Critical Card (>= 40% Deficit)
              return (
                <div
                  key={alert.skill || idx}
                  className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 border-2 border-rose-500/70 text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                >
                  <div className="space-y-1.5 z-10">
                    <div className="flex items-center space-x-2">
                      <span className="bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                        🚨 CAMPUS SKILL ALERT
                      </span>
                      <span className="text-rose-300 text-xs font-semibold">
                        Deficit Threshold Exceeded (Threshold: {threshold}%)
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      {deficit}% of students lack {alert.skill}
                    </h3>
                    <div className="text-xs text-rose-200/90 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                      <span>Affected students: <strong>{lacking} / {total}</strong></span>
                      <span>•</span>
                      <span>Recommended Action: <strong>{alert.recommendedAction || `Conduct ${alert.skill} Industry Readiness Workshop.`}</strong></span>
                    </div>
                  </div>

                  <div className="shrink-0 z-10 flex flex-wrap items-center gap-2">
                    {hasConductedWorkshop ? (
                      <button
                        type="button"
                        onClick={() => handleOpenWorkshop(alert.workshop)}
                        className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center space-x-2 cursor-pointer"
                      >
                        <span>{alert.workshopActionText || `Watch ${alert.skill} Workshop`}</span>
                        <span>▶</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="px-4 py-2.5 rounded-xl bg-slate-800/80 text-slate-400 font-semibold text-xs border border-slate-700/60 cursor-not-allowed">
                          No conducted workshop available
                        </span>
                        <Link
                          to={`/college/workshops?skill=${encodeURIComponent(alert.skill)}`}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-1"
                        >
                          <span>Schedule Workshop</span>
                          <span>⚡</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Normal/Non-Critical Card (< 40% Deficit)
            return (
              <div
                key={alert.skill || idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition hover:border-slate-300"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      ✓ Competency Healthy
                    </span>
                    <span className="text-slate-500 text-xs font-semibold">
                      Below intervention threshold ({threshold}%)
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {deficit}% of students lack {alert.skill}
                  </h3>
                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                    <span>Affected students: <strong className="text-slate-900">{lacking} / {total}</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="text-emerald-700 font-semibold">Within Acceptable Benchmark</strong></span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {hasConductedWorkshop ? (
                    <button
                      type="button"
                      onClick={() => handleOpenWorkshop(alert.workshop)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center space-x-2 cursor-pointer border border-slate-200"
                    >
                      <span>{alert.workshopActionText || `Watch ${alert.skill} Workshop`}</span>
                      <span>▶</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200/60">
                      No workshop required
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-center text-slate-600 shadow-xs">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 text-lg mb-2">
            ✓
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Critical Skill Deficits Detected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            All monitored competencies currently meet or exceed the institutional readiness threshold benchmark ({threshold}%).
          </p>
        </div>
      )}

      {/* 1. Executive Institutional Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="executive-badge-navy text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {stats.name}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">Institutional Placement Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Institutional Placement Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            Cohort competency metrics and deficit diagnostics across {stats.totalStudents.toLocaleString()} registered candidates.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            to="/student"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#173B8F] bg-[#F0F4FC] hover:bg-[#E2ECFC] border border-[#D0DCF5] transition flex items-center space-x-1.5 shadow-2xs"
          >
            <span>🎓 View Student Experience</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* 2. 4 Core Institutional KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Campus Readiness */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#173B8F]"></div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Cohort Readiness
          </span>
          <span className="text-3xl font-black text-slate-900">{stats.averageReadiness}%</span>
          <span className="text-[11px] text-slate-500 block mt-1 font-medium">Placement Benchmark: 80%</span>
        </div>

        {/* KPI 2: Major Skill Deficit */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Critical Deficit
          </span>
          <span className="text-2xl font-black text-rose-600 truncate block">{criticalDeficit.skill}</span>
          <span className="text-[11px] text-rose-700 font-semibold block mt-1">Requisition Impact: {criticalDeficit.demandScore}%</span>
        </div>

        {/* KPI 3: Students At Risk */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Intervention Needed
          </span>
          <span className="text-3xl font-black text-amber-700">{stats.atRiskStudents}</span>
          <span className="text-[11px] text-slate-500 block mt-1 font-medium">&lt;60% Role Readiness</span>
        </div>

        {/* KPI 4: Next Recommended Action */}
        <div className="bg-white border border-blue-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
              Intervention Action
            </span>
            <span className="text-xs font-bold text-slate-800 block">Launch Remedial Workshop</span>
          </div>
          <Link
            to="/college/workshops"
            className="mt-3 text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center space-x-1"
          >
            <span>Generate Curriculum →</span>
          </Link>
        </div>
      </div>

      {/* 3. Departmental Readiness Comparison Chart */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Departmental Readiness Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Average candidate benchmark scores across major engineering cohorts
            </p>
          </div>
          <Link to="/college/heatmap" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
            Inspect Skill Heatmap →
          </Link>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departments}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="department"
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                cursor={{ fill: '#F8FAFC' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm text-xs space-y-1">
                        <span className="font-bold text-slate-900 block">{data.department}</span>
                        <span className="text-slate-600 block">Avg Readiness: <strong className="text-blue-700">{data.avgScore}%</strong></span>
                        <span className="text-slate-500 block">{data.assessed} students assessed</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={80} stroke="#2563EB" strokeDasharray="4 4" label={{ value: '80% Target', fill: '#2563EB', fontSize: 10, position: 'top' }} />
              <Bar
                dataKey="avgScore"
                fill="#2563EB"
                radius={[4, 4, 0, 0]}
                barSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Previously Conducted Workshops Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Previously Conducted Workshops
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {conductedWorkshops.length} Archived Sessions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Archived university masterclasses, industry faculty recordings, and curriculum remediation sessions.
            </p>
          </div>
          <Link
            to="/college/workshops"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center space-x-1"
          >
            <span>Workshop Engine</span>
            <span>→</span>
          </Link>
        </div>

        {conductedWorkshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {conductedWorkshops.map((ws) => (
              <div
                key={ws.id}
                className="p-5 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 hover:border-slate-300 hover:shadow-sm transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                      {ws.skill}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {ws.duration || '1h 12m'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {ws.title}
                  </h4>

                  <div className="text-[11px] text-slate-500 space-y-0.5 font-medium">
                    <div>📅 Conducted: <strong className="text-slate-700">{ws.conductedDate || (ws.conductedAt ? new Date(ws.conductedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Sep 18, 2026')}</strong></div>
                    <div className="truncate" title={ws.instructor}>👨‍🏫 {ws.instructor || 'Senior Technical Architect'}</div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                    {ws.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ● Conducted
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenWorkshop(ws)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Watch Workshop</span>
                    <span>▶</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
            No previously conducted workshops found.
          </div>
        )}
      </div>

      {/* 5. Quick Portal Navigation Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <Link
          to="/college/heatmap"
          className="p-4 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 transition shadow-xs space-y-1 block"
        >
          <span className="font-bold text-slate-900 block text-sm">Skill Heatmap Matrix</span>
          <p className="text-slate-500 text-[11px]">Audit student capability distributions against employer demand.</p>
        </Link>

        <Link
          to="/college/workshops"
          className="p-4 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 transition shadow-xs space-y-1 block"
        >
          <span className="font-bold text-slate-900 block text-sm">Workshop Generator</span>
          <p className="text-slate-500 text-[11px]">Generate customized syllabus plans to close critical cohort gaps.</p>
        </Link>

        <Link
          to="/college/certificates"
          className="p-4 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 transition shadow-xs space-y-1 block"
        >
          <span className="font-bold text-slate-900 block text-sm">Certificates Registry</span>
          <p className="text-slate-500 text-[11px]">Review and verify credentials issued upon milestone completion.</p>
        </Link>
      </div>

      {/* Workshop Detail & Video Modal */}
      <WorkshopModal
        workshop={selectedWorkshop}
        isOpen={isWorkshopModalOpen}
        onClose={() => setIsWorkshopModalOpen(false)}
      />
    </div>
  );
}

