import { ArrowRight, BookOpen, Briefcase, Clock3, PlayCircle, Sparkles } from 'lucide-react';
import { learningResources } from '../../data/studentData';

const roadmap = [
  'Week 1 → Fundamentals',
  'Week 2 → Supervised Learning',
  'Week 3 → Projects',
  'Week 4 → Mock Interview',
];

export default function LearnPage() {
  const freeResources = learningResources.filter((resource) => resource.type === 'Free');
  const paidResources = learningResources.filter((resource) => resource.type === 'Paid');

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Learning Plan</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Your Learning Plan</h1>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-blue-600">
                <BookOpen size={18} />
                <span className="text-sm font-semibold uppercase tracking-[0.12em]">Highest impact skill</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Machine Learning</h2>
            </div>
            <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
              Estimated learning: 4 weeks
            </div>
          </div>

          <p className="mt-4 text-slate-600">“It’s one of your biggest gaps for your selected role.”</p>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-emerald-600">
                <Sparkles size={18} />
                <h2 className="text-xl font-bold text-slate-900">START HERE — FREE</h2>
              </div>

              <div className="space-y-4">
                {freeResources.map((resource) => (
                  <div key={resource.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{resource.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{resource.type}</span>
                          <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">{resource.level}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <PlayCircle size={16} />
                        Start Learning
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{resource.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-violet-600">
                <Briefcase size={18} />
                <h2 className="text-xl font-bold text-slate-900">PAID OPTIONS</h2>
              </div>

              <div className="space-y-4">
                {paidResources.map((resource) => (
                  <div key={resource.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{resource.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                          <span className="rounded-full bg-violet-100 px-2 py-1 text-violet-700">Paid</span>
                          <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">{resource.level}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                      >
                        View Course
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{resource.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2 text-slate-900">
              <Clock3 size={18} />
              <h2 className="text-xl font-bold">Roadmap</h2>
            </div>

            <div className="space-y-5">
              {roadmap.map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    {index < roadmap.length - 1 && <div className="mt-2 h-12 w-px bg-slate-200" />}
                  </div>
                  <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
