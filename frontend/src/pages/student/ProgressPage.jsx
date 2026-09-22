import { CheckCheck, CircleDashed, TimerReset } from 'lucide-react';

const skillStatus = [
  { skill: 'Python', complete: true },
  { skill: 'SQL', complete: true },
  { skill: 'Statistics', complete: true },
  { skill: 'Git', complete: true },
  { skill: 'Machine Learning', complete: true },
  { skill: 'Deep Learning', complete: false },
];

const timeline = [
  'Resume skill review complete',
  'Machine Learning fundamentals started',
  'Mock interview completed',
  'Next milestone: Deep Learning',
];

export default function ProgressPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Progress</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">My Progress</h1>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-medium text-slate-600">AI/ML Engineer</p>
              <p className="text-3xl font-black text-slate-900">68% → 78%</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              Mock Interviews: 2 completed
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {skillStatus.map(({ skill, complete }) => (
              <div key={skill} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  {complete ? <CheckCheck className="text-emerald-600" size={18} /> : <CircleDashed className="text-slate-400" size={18} />}
                  <span className="text-sm font-medium text-slate-700">{skill}</span>
                </div>
                <span className={complete ? 'text-xs font-semibold text-emerald-600' : 'text-xs font-semibold text-slate-500'}>
                  {complete ? 'Complete' : 'Locked'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-600">Skills Demonstrated</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-2xl font-black text-slate-900">5 / 6</div>
              <div className="h-2.5 w-40 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-600" style={{ width: '83%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-slate-900">
            <TimerReset size={18} />
            <h2 className="text-xl font-bold">Progress Timeline</h2>
          </div>

          <div className="space-y-5">
            {timeline.map((item, index) => (
              <div key={item} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  {index < timeline.length - 1 && <div className="mt-2 h-12 w-px bg-slate-200" />}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
