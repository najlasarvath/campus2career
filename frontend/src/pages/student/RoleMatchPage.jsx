import { useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, MoveRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { studentProfile } from '../../data/studentData';

const skillsMap = [
  { label: 'Docker', impact: 5 },
  { label: 'TensorFlow', impact: 4 },
  { label: 'Deep Learning', impact: 7 },
  { label: 'Cloud', impact: 3 },
];

export default function RoleMatchPage() {
  const { role, matchScore, acquiredSkills, criticalGaps, secondarySkills } = studentProfile;
  const [selectedSkill, setSelectedSkill] = useState('Docker');

  const currentImpact = useMemo(() => {
    const found = skillsMap.find((skill) => skill.label === selectedSkill);
    return found ? found.impact : 0;
  }, [selectedSkill]);

  const updatedMatch = matchScore + currentImpact;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Role Match</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Your Role Match</h1>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-medium text-slate-600">Role</p>
              <p className="text-2xl font-bold text-slate-900">{role}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-3xl font-black text-blue-700">
                {matchScore}%
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={18} />
              <p className="text-sm font-semibold uppercase tracking-[0.12em]">Acquired Skills</p>
            </div>
            <div className="space-y-3">
              {acquiredSkills.map((skill) => (
                <div key={skill} className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-red-600">
              <Sparkles size={18} />
              <p className="text-sm font-semibold uppercase tracking-[0.12em]">Critical Gaps</p>
            </div>
            <div className="space-y-3">
              {criticalGaps.map((skill) => (
                <div key={skill} className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-amber-600">
              <BarChart3 size={18} />
              <p className="text-sm font-semibold uppercase tracking-[0.12em]">Secondary Skills</p>
            </div>
            <div className="space-y-3">
              {secondarySkills.map((skill) => (
                <div key={skill} className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">Your skills vs Required skills</h2>
            <Link
              to="/student/learn"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Fix My Skill Gaps
              <MoveRight size={16} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Current skills</p>
              <div className="space-y-2">
                {acquiredSkills.map((skill) => (
                  <div key={skill} className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2">
                    <span className="text-sm font-medium text-slate-700">{skill}</span>
                    <span className="text-xs font-semibold text-emerald-600">Acquired</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Required skills</p>
              <div className="space-y-2">
                {[...acquiredSkills, ...criticalGaps, ...secondarySkills].map((skill) => (
                  <div key={`${skill}-required`} className="flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2">
                    <span className="text-sm font-medium text-slate-700">{skill}</span>
                    <span className="text-xs font-semibold text-blue-600">Required</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Career What-If</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_0.8fr]">
            <div>
              <label htmlFor="skill-select" className="mb-2 block text-sm font-medium text-slate-700">
                Select a skill
              </label>
              <select
                id="skill-select"
                value={selectedSkill}
                onChange={(event) => setSelectedSkill(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {skillsMap.map((skill) => (
                  <option key={skill.label} value={skill.label}>
                    {skill.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Current Match</p>
              <div className="mt-2 text-3xl font-black text-slate-900">{matchScore}%</div>
              <div className="mt-4 text-sm text-slate-600">
                If you learn {selectedSkill}: <span className="font-bold text-emerald-600">{updatedMatch}%</span>
              </div>
              <div className="mt-2 text-sm font-medium text-emerald-600">+{currentImpact}%</div>
            </div>
          </div>

          <button
            type="button"
            className="mt-6 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Add to Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}
