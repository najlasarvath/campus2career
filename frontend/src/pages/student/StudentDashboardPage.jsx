import { ArrowRight, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { studentProfile } from '../../data/studentData';

const skillTone = {
  acquired: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  gap: 'bg-red-100 text-red-700 border-red-200',
  secondary: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function StudentDashboardPage() {
  const { name, role, matchScore, acquiredSkills, criticalGaps, secondarySkills, topSkill, upcomingMilestone, skillsDemonstrated, totalSkills } = studentProfile;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Good morning, {name} 👋</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">You’re working toward {role}</h1>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="text-5xl font-black text-slate-900">{matchScore}%</div>
                <p className="mt-2 text-base font-medium text-slate-600">Role Match</p>
                <p className="mt-3 text-sm text-slate-500">You’re on your way. You have 2 critical skills to improve.</p>
              </div>

              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 ring-8 ring-blue-100">
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-600 to-blue-400" style={{ clipPath: `conic-gradient(#2563eb ${matchScore * 3.6}deg, #e2e8f0 0deg)` }} />
                <div className="absolute inset-5 flex items-center justify-center rounded-full bg-white text-xl font-bold text-slate-900">
                  {matchScore}%
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="text-blue-600" size={18} />
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Skill focus</p>
            </div>
            <div className="text-2xl font-bold text-slate-900">{skillsDemonstrated} / {totalSkills}</div>
            <p className="mt-2 text-sm text-slate-500">Skills demonstrated</p>
            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${(skillsDemonstrated / totalSkills) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Your Skills</h2>

            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-emerald-600">Acquired</p>
                <div className="flex flex-wrap gap-2">
                  {acquiredSkills.map((skill) => (
                    <span key={skill} className={`rounded-full border px-3 py-1.5 text-sm font-medium ${skillTone.acquired}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-red-600">Critical Gaps</p>
                <div className="flex flex-wrap gap-2">
                  {criticalGaps.map((skill) => (
                    <span key={skill} className={`rounded-full border px-3 py-1.5 text-sm font-medium ${skillTone.gap}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-amber-600">Secondary</p>
                <div className="flex flex-wrap gap-2">
                  {secondarySkills.map((skill) => (
                    <span key={skill} className={`rounded-full border px-3 py-1.5 text-sm font-medium ${skillTone.secondary}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-orange-700">
              <Flame size={18} />
              <p className="text-sm font-semibold uppercase tracking-[0.12em]">Your next best step</p>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{upcomingMilestone}</h3>
            <p className="mt-2 text-sm text-slate-600">Your highest-impact skill for {role}.</p>
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700">
              <CheckCircle2 className="text-emerald-600" size={18} />
              {topSkill} is your highest-impact gap
            </div>
            <Link
              to="/student/learn"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Start Learning
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
