import { AlertTriangle, BookOpenCheck, Users, WalletCards } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { campusSkillGaps, collegeStats } from '../../data/collegeData';

const statusColor = (value) => {
  if (value >= 40) return '#dc2626';
  if (value >= 20) return '#f59e0b';
  return '#22c55e';
};

const getStatusLabel = (value) => {
  if (value >= 40) return 'Workshop Required';
  if (value >= 20) return 'Monitor';
  return 'Normal';
};

export default function CollegeDashboardPage() {
  const { collegeName, registeredStudents, studentsWithSkillGaps, skillsCompleted, workshopsRequired } = collegeStats;

  const stats = [
    { label: 'Registered Students', value: registeredStudents, icon: Users, tone: 'blue' },
    { label: 'Students With Skill Gaps', value: studentsWithSkillGaps, icon: WalletCards, tone: 'amber' },
    { label: 'Skills Completed', value: skillsCompleted, icon: BookOpenCheck, tone: 'green' },
    { label: 'Workshops Required', value: workshopsRequired, icon: AlertTriangle, tone: 'red' },
  ];

  const alarmingSkills = campusSkillGaps.filter((item) => item.value >= 40);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">College</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{collegeName}</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
              </div>
              <div className={[
                'flex h-12 w-12 items-center justify-center rounded-2xl',
                tone === 'blue' && 'bg-blue-100 text-blue-600',
                tone === 'amber' && 'bg-amber-100 text-amber-600',
                tone === 'green' && 'bg-emerald-100 text-emerald-600',
                tone === 'red' && 'bg-red-100 text-red-600',
              ].join(' ')}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Campus Skill Gaps</h2>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campusSkillGaps} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="skill" tick={{ fontSize: 12, fill: '#475569' }} interval={0} angle={-10} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip formatter={(value) => [`${value}%`, 'Students lacking skill']} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {alarmingSkills.length > 0 && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3 text-red-700">
            <AlertTriangle size={20} />
            <h2 className="text-xl font-bold">⚠️ WORKSHOP REQUIRED</h2>
          </div>

          <div className="space-y-4">
            {alarmingSkills.map((skill) => (
              <div key={skill.skill} className="rounded-2xl border border-red-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">{skill.skill}</h3>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-red-700">
                    {getStatusLabel(skill.value)}
                  </span>
                </div>
                <p className="mt-2 text-slate-600">{skill.value}% of students lack this skill.</p>
                <p className="mt-2 text-sm font-medium text-red-700">The 40% workshop threshold has been reached.</p>
                <button type="button" className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                  View Skill Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">Skill Gap Summary</h2>
        </div>
        <div className="space-y-3">
          {campusSkillGaps.map((item) => (
            <div key={item.skill} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm font-medium">
                <span className="text-slate-700">{item.skill}</span>
                <span style={{ color: statusColor(item.value) }}>{item.value}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: statusColor(item.value) }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
