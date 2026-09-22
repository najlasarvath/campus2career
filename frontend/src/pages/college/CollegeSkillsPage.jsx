import { campusSkillGaps } from '../../data/collegeData';

const getStatus = (value) => {
  if (value >= 40) return { label: 'Workshop Required', tone: 'bg-red-100 text-red-700' };
  if (value >= 20) return { label: 'Monitor', tone: 'bg-amber-100 text-amber-700' };
  return { label: 'Normal', tone: 'bg-emerald-100 text-emerald-700' };
};

export default function CollegeSkillsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Skill Gaps</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Detailed Campus Skill Analysis</h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Workshop Required when 40% or more students lack a skill.
        </p>

        <div className="mt-6 space-y-4">
          {campusSkillGaps.map((skill) => {
            const status = getStatus(skill.value);

            return (
              <div key={skill.skill} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{skill.skill}</h2>
                    <p className="mt-1 text-sm text-slate-600">{skill.value}% of students lack this skill</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${status.tone}`}>
                    {status.label}
                  </span>
                </div>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${skill.value}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
