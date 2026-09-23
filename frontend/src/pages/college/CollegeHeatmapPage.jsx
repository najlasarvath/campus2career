import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import collegeService from '../../services/collegeService';

export default function CollegeHeatmapPage() {
  const [skills, setSkills] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'MODERATE' | 'HEALTHY'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    collegeService.getHeatmap().then(res => {
      setSkills(res.skills);
      setLoading(false);
    });
  }, []);

  const filteredSkills = skills.filter(item => {
    const matchesSearch = item.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'CRITICAL') return item.status === 'Critical Deficit';
    if (filter === 'MODERATE') return item.status === 'Moderate Gap';
    if (filter === 'HEALTHY') return item.status === 'Healthy';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        Loading Skill Heatmap...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1.5 font-medium">
            <Link to="/college/dashboard" className="hover:text-blue-600 transition">College Portal</Link>
            <span>/</span>
            <span className="text-blue-600 font-semibold">Skill Heatmap & Gap Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Campus Skill Heatmap & Demand Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Evaluate cohort competency density across beginner, intermediate, and advanced levels against live employer demand rubrics.
          </p>
        </div>

        <Link
          to="/college/workshops"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
        >
          <span>Remediate via Workshop</span>
          <span>→</span>
        </Link>
      </div>

      {/* Heatmap Matrix Overview Card */}
      <div className="pro-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Student Proficiency Distribution by Skill
            </h3>
            <p className="text-xs text-slate-500">
              Stacked headcount of students at Low (&lt;60%), Medium (60–79%), and High (80%+) capability
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
              <span className="text-slate-600">Low</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
              <span className="text-slate-600">Medium</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" />
              <span className="text-slate-600">High</span>
            </span>
          </div>
        </div>

        {/* Stacked Bar Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={skills}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="skill"
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-xs space-y-1">
                        <span className="font-bold text-slate-900 block">{d.skill} ({d.category})</span>
                        <div className="text-rose-700">Low Proficiency: <strong>{d.lowProficiency}</strong> students</div>
                        <div className="text-amber-700">Medium Proficiency: <strong>{d.mediumProficiency}</strong> students</div>
                        <div className="text-emerald-700">High Proficiency: <strong>{d.highProficiency}</strong> students</div>
                        <div className="pt-1 border-t border-slate-100 text-slate-600">
                          Employer Demand: <strong className="text-blue-700">{d.demandScore}%</strong>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="lowProficiency" name="Low (<60%)" fill="#F43F5E" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="mediumProficiency" name="Medium (60–79%)" fill="#F59E0B" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="highProficiency" name="High (80%+)" fill="#10B981" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'ALL', label: 'All Competencies' },
            { key: 'CRITICAL', label: 'Critical Deficits' },
            { key: 'MODERATE', label: 'Moderate Gaps' },
            { key: 'HEALTHY', label: 'Healthy Skills' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                filter === tab.key
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skill or category..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Heatmap Matrix Grid Table */}
      <div className="pro-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Skill & Category</th>
                <th className="py-3 px-4">Employer Demand</th>
                <th className="py-3 px-4">Proficiency Distribution (Low / Med / High)</th>
                <th className="py-3 px-4">Avg Readiness</th>
                <th className="py-3 px-4">Gap Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSkills.map(item => {
                const total = item.studentCount;
                const lowPct = Math.round((item.lowProficiency / total) * 100);
                const medPct = Math.round((item.mediumProficiency / total) * 100);
                const highPct = Math.round((item.highProficiency / total) * 100);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.skill}</div>
                      <div className="text-[11px] text-slate-500">{item.category} • {item.studentCount} students</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${item.demandScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 font-mono">{item.demandScore}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 min-w-[220px]">
                      <div className="space-y-1">
                        <div className="h-2.5 w-full bg-slate-100 rounded-full flex overflow-hidden">
                          <div style={{ width: `${lowPct}%` }} className="bg-rose-500" title={`Low: ${item.lowProficiency} (${lowPct}%)`} />
                          <div style={{ width: `${medPct}%` }} className="bg-amber-400" title={`Medium: ${item.mediumProficiency} (${medPct}%)`} />
                          <div style={{ width: `${highPct}%` }} className="bg-emerald-500" title={`High: ${item.highProficiency} (${highPct}%)`} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span className="text-rose-600">{lowPct}% Low</span>
                          <span className="text-amber-600">{medPct}% Med</span>
                          <span className="text-emerald-600">{highPct}% High</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 font-mono text-sm">
                      {item.averageReadiness}%
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === 'Critical Deficit'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : item.status === 'Moderate Gap'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {item.status !== 'Healthy' ? (
                        <Link
                          to="/college/workshops"
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-transparent transition"
                        >
                          Plan Workshop
                        </Link>
                      ) : (
                        <span className="text-[11px] text-slate-400">On Track</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
