import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import SkillEditorModal from '../components/dashboard/SkillEditorModal';
import ResumeUploadCard from '../components/dashboard/ResumeUploadCard';
import WorkshopModal from '../components/workshop/WorkshopModal';
import CertificateModal from '../components/certificate/CertificateModal';
import apiClient from '../services/api';

export default function DashboardPage() {
  const {
    student,
    hasSkillData,
    target_role,
    match_score,
    target_score,
    acquired_skills,
    critical_gaps,
    secondary_gaps,
    highest_impact_skill,
    score_progression,
    setScoreStage,
    apiError,
    isLoading
  } = useStudent();

  const [isSkillEditorOpen, setIsSkillEditorOpen] = useState(false);
  
  // Daily Tasks state
  const [dailyTasks, setDailyTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Workshops state
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);

  // Certificates state
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  useEffect(() => {
    // 1. Fetch Daily Tasks
    setTasksLoading(true);
    apiClient.get('/tasks/daily')
      .then(res => {
        if (res && res.success && Array.isArray(res.tasks)) {
          setDailyTasks(res.tasks);
        }
      })
      .catch(() => {})
      .finally(() => setTasksLoading(false));

    // 2. Fetch Workshops
    apiClient.get('/workshops')
      .then(res => {
        if (res && res.success && Array.isArray(res.workshops)) {
          setWorkshops(res.workshops);
        }
      })
      .catch(() => {});

    // 3. Fetch Certificates
    apiClient.get('/certificates')
      .then(res => {
        if (res && res.success && Array.isArray(res.certificates)) {
          setCertificates(res.certificates);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleDailyTask = async (taskId) => {
    try {
      const res = await apiClient.put(`/tasks/daily/${taskId}/toggle`);
      if (res && res.success) {
        setDailyTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: res.completed } : t));
      }
    } catch {
      // Local toggle
      setDailyTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    }
  };

  const handleOpenWorkshop = (ws) => {
    setSelectedWorkshop(ws);
    setIsWorkshopModalOpen(true);
  };

  const handleOpenCertificate = (certOrWorkshop) => {
    if (certOrWorkshop?.issuer) {
      setSelectedCertificate(certOrWorkshop);
      setSelectedWorkshop(null);
    } else {
      setSelectedWorkshop(certOrWorkshop);
      setSelectedCertificate(null);
    }
    setIsCertificateModalOpen(true);
  };

  const gap = Math.max(0, target_score - match_score);
  const isTargetCleared = !critical_gaps.some(g => g.name === highest_impact_skill.skill);

  // Filter tasks: find first uncompleted task as "Today's Task"
  const todaysTask = dailyTasks.find(t => !t.completed) || dailyTasks[0];
  const completedTaskCount = dailyTasks.filter(t => t.completed).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-200">
      {/* 1. Executive Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="executive-badge-navy text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {student?.name || 'Candidate'} · {student?.isDemo ? 'Demo Mode' : 'Verified Candidate'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">Live Candidacy Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Readiness & Competency Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            Real-time candidate qualification index benchmarked for <strong className="text-slate-900 font-bold">{target_role}</strong> requisitions.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => setIsSkillEditorOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#173B8F] bg-[#F0F4FC] hover:bg-[#E2ECFC] border border-[#D0DCF5] transition shadow-2xs cursor-pointer flex items-center space-x-1.5"
          >
            <span>⚡ Manage Skills</span>
          </button>
          <span className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-slate-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Active Assessment</span>
          </span>
        </div>
      </div>

      {/* Backend API Error Banner */}
      {apiError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{apiError}</span>
          </div>
        </div>
      )}

      {/* Resume Upload Card (Preserved & Protected) */}
      <ResumeUploadCard />

      {/* Onboarding Banner for Real Students without Skills */}
      {!hasSkillData && !student?.isDemo && (
        <div className="bg-gradient-to-r from-[#0F1E36] to-[#1E3A8A] text-white rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-blue-900">
          <div className="space-y-1.5">
            <span className="executive-badge-gold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
              Skill Profile Setup Required
            </span>
            <h2 className="text-xl font-bold tracking-tight">Complete Your Skill Profile</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Add your current skills (e.g. Python, SQL, Power BI) and proficiency levels to calculate your personalized readiness score and target role delta.
            </p>
          </div>
          <button
            onClick={() => setIsSkillEditorOpen(true)}
            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition self-start sm:self-auto cursor-pointer"
          >
            + Add Skills & Generate Analysis
          </button>
        </div>
      )}

      {/* 2. Core Focus: Current Status & Biggest Gap */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Readiness Metric Panel */}
        <div className="md:col-span-6 bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#173B8F] to-[#2563EB]"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Aggregate Readiness Index
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                Standard Rubric
              </span>
            </div>
            
            <div className="flex items-baseline space-x-3 my-2">
              <span className="text-5xl sm:text-6xl font-black text-[#0F172A] tracking-tight">
                {match_score}%
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700">Demonstrated Score</span>
                <span className="text-[11px] text-slate-500">Tier-1 Threshold: {target_score}%</span>
              </div>
            </div>

            {/* Progress bar visual */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#173B8F] to-[#2563EB] h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, match_score)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-slate-100 text-xs">
            <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3]">
              <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">Benchmark Target</span>
              <span className="text-slate-900 font-extrabold text-lg mt-0.5 block">{target_score}%</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3]">
              <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">Variance to Offer</span>
              <span className={`font-extrabold text-lg mt-0.5 block ${gap === 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {gap === 0 ? 'Target Met ✓' : `-${gap}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Priority Gap & Next Action Panel */}
        <div className="md:col-span-6 bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-rose-500"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Primary Acquisition Blocker
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                #1 Requisition Filter
              </span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {highest_impact_skill.skill}
            </h3>
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              Demonstrating verified proficiency in <strong className="text-slate-900 font-semibold">{highest_impact_skill.skill}</strong> clears the primary qualification barrier across active enterprise postings.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Recommended Next Step</span>
              <span className="text-xs font-bold text-slate-900">
                {isTargetCleared ? 'Validate in Mock Technical Drill' : `Execute Adaptive ${highest_impact_skill.skill} Sprint`}
              </span>
            </div>
            <Link
              to="/roadmap"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#173B8F] to-[#2563EB] hover:from-[#132E70] hover:to-[#1D4ED8] text-white text-xs font-bold shadow-sm transition inline-flex items-center justify-center space-x-1.5 shrink-0"
            >
              <span>View Daily Tasks</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ADAPTIVE DAILY TASKS: TODAY'S FOCUS */}
      {todaysTask && (
        <div className="bg-white border-2 border-blue-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Today's Adaptive Task · Day {todaysTask.day}
                </span>
                <span className="text-xs font-bold text-slate-500">{todaysTask.estimatedDuration}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {todaysTask.title}
              </h3>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleDailyTask(todaysTask.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs ${
                  todaysTask.completed
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <span>{todaysTask.completed ? '✓ Completed' : 'Mark Done'}</span>
              </button>
              <Link
                to="/roadmap"
                className="text-xs font-bold text-blue-700 hover:text-blue-900"
              >
                All Days →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
            <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Core Concept Focus</span>
              <p className="text-slate-800 font-medium">{todaysTask.description}</p>
            </div>
            <div className="space-y-1 bg-blue-50/50 p-3.5 rounded-xl border border-blue-200/60">
              <span className="text-[10px] uppercase font-bold text-blue-700 block">⚡ Hands-On Practice Activity</span>
              <p className="text-slate-800 font-semibold">{todaysTask.practiceActivity || 'Implement guided practice exercise'}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Sprint Progress: {completedTaskCount} of {dailyTasks.length} daily tasks verified</span>
            <div className="w-48 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${dailyTasks.length ? (completedTaskCount / dailyTasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* RECOMMENDED PLACEMENT WORKSHOPS */}
      {workshops && workshops.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Recommended Industry Placement Workshops
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted bootcamps and video masterclasses mapped to your verified competency gaps
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {workshops.length} Active Tracks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workshops.map(ws => (
              <div
                key={ws.id}
                className="p-5 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 hover:border-slate-300 transition shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {ws.skill}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {ws.duration || '1h 12m'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{ws.title}</h3>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between font-medium">
                    <span>📅 {ws.conductedDate || (ws.conductedAt ? new Date(ws.conductedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Archived')}</span>
                    <span className="truncate max-w-[150px]" title={ws.instructor}>👨‍🏫 {ws.instructor || 'Senior Technical Architect'}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {ws.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Recorded Masterclass + Assessment</span>
                  <button
                    type="button"
                    onClick={() => handleOpenWorkshop(ws)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-2xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Watch Workshop</span>
                    <span>▶</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VERIFIED PLACEMENT CREDENTIALS & CERTIFICATES */}
      {certificates && certificates.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Verified Placement Credentials & Certificates
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official college-branded credential ledger verifying candidate skills
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700">
              {certificates.length} Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {certificates.map(cert => (
              <div
                key={cert.id}
                onClick={() => handleOpenCertificate(cert)}
                className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 cursor-pointer transition shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {cert.id}
                  </span>
                  <span className="text-emerald-700 font-bold text-xs">Grade: {cert.assessmentScore || cert.score}%</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs truncate">{cert.workshopTitle || cert.program}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>{cert.collegeName || 'Apex Institute'}</span>
                  <span className="font-bold text-blue-700">Inspect ↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Progress: 4-Stage Stepper */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Placement Trajectory Progression
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Interactive progression simulator across hiring milestones
            </p>
          </div>
          <span className="executive-badge-gold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
            Stage {score_progression.findIndex(s => s.score >= match_score) + 1} of 4
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {score_progression.map((item, idx) => {
            const isCompleted = item.score <= match_score;
            const isCurrent = (
              item.score === match_score ||
              (idx < score_progression.length - 1 && match_score >= item.score && match_score < score_progression[idx + 1].score)
            );

            return (
              <button
                type="button"
                key={item.stage}
                onClick={() => setScoreStage(item.score, item.stage)}
                className={`text-left p-4 rounded-xl border transition-all relative ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-600/20 shadow-xs'
                    : isCompleted
                    ? 'bg-[#F8F7F4] border-slate-200 text-slate-700 hover:border-slate-300'
                    : 'bg-white border-slate-200/80 text-slate-400 opacity-60 hover:opacity-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Phase 0{idx + 1}
                  </span>
                  <span className={`font-mono font-bold text-xs ${isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {item.score}%
                  </span>
                </div>
                <span className="text-xs font-bold block text-slate-900 truncate">
                  {item.stage}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {isCompleted ? '✓ Completed Milestone' : 'Pending Verification'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Concise Skill Gaps Overview */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Enterprise Competency Architecture
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified credentials mapped against high-demand candidate requirements
            </p>
          </div>
          <Link
            to="/role-match"
            className="text-xs font-bold text-blue-700 hover:text-blue-900 transition flex items-center space-x-1"
          >
            <span>Audit Role Delta</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* Column 1: Verified */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Verified ({acquired_skills.length})
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="space-y-1.5">
              {acquired_skills.slice(0, 3).map(s => (
                <div key={s.name} className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold shadow-2xs flex items-center justify-between">
                  <span>{s.name}</span>
                  <span className="text-emerald-600 font-bold text-xs">✓</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Critical Gaps */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-rose-50/40 border border-rose-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                Priority Gaps ({critical_gaps.length})
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            </div>
            <div className="space-y-1.5">
              {critical_gaps.slice(0, 3).map(s => (
                <div key={s.name} className="p-2.5 rounded-lg bg-white border border-rose-200 text-rose-950 font-semibold shadow-2xs flex items-center justify-between">
                  <span>{s.name}</span>
                  <span className="text-rose-600 font-bold text-xs">!</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Secondary */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Differentiators ({secondary_gaps.length})
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <div className="space-y-1.5">
              {secondary_gaps.slice(0, 3).map(s => (
                <div key={s.name} className="p-2.5 rounded-lg bg-white border border-amber-200/80 text-slate-800 font-semibold shadow-2xs flex items-center justify-between">
                  <span>{s.name}</span>
                  <span className="text-amber-600 font-bold text-xs">★</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Skill Editor Modal */}
      <SkillEditorModal
        isOpen={isSkillEditorOpen}
        onClose={() => setIsSkillEditorOpen(false)}
      />

      {/* Workshop Modal */}
      <WorkshopModal
        workshop={selectedWorkshop}
        isOpen={isWorkshopModalOpen}
        onClose={() => setIsWorkshopModalOpen(false)}
        onOpenCertificate={handleOpenCertificate}
      />

      {/* Certificate Modal */}
      <CertificateModal
        certificate={selectedCertificate}
        workshop={selectedWorkshop}
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
      />
    </div>
  );
}

