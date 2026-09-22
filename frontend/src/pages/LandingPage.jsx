import { ArrowRight, BriefcaseBusiness, GraduationCap, School, Sparkles } from 'lucide-react';

const flowSteps = [
  'Resume',
  'AI Skill Analysis',
  'Skill Gap',
  'Learning',
  'AI Mock Interview',
  'Skill Verified',
];

const roleCards = [
  {
    title: 'Student',
    description: 'Find your skill gaps',
    icon: GraduationCap,
    href: '/login',
    variant: 'primary',
  },
  {
    title: 'College',
    description: 'Understand campus skill gaps',
    icon: School,
    href: '/login',
    variant: 'secondary',
  },
  {
    title: 'Company',
    description: 'Define industry requirements',
    icon: BriefcaseBusiness,
    href: '/login',
    variant: 'tertiary',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm">
              C2C
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">CAMPUS2CAREER AI</p>
            </div>
          </div>
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Login
            <ArrowRight size={16} />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              <Sparkles size={14} />
              From Skill Gaps to Industry Readiness
            </div>

            <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              CAMPUS2CAREER AI
            </h1>

            <p className="mt-4 max-w-xl text-xl text-slate-600">
              Know what you lack. Learn what matters. Prove what you know.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {roleCards.map(({ title, description, icon: Icon, href, variant }) => (
                <a
                  key={title}
                  href={href}
                  className={[
                    'rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                    variant === 'primary' && 'border-blue-200 bg-blue-50',
                    variant === 'secondary' && 'border-amber-200 bg-amber-50',
                    variant === 'tertiary' && 'border-emerald-200 bg-emerald-50',
                  ].join(' ')}
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm">
                    <Icon size={20} />
                  </div>
                  <p className="text-xl font-bold text-slate-900">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{description}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4">
                {flowSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                      {step}
                    </div>
                    {index < flowSteps.length - 1 && (
                      <div className="text-slate-400">
                        <ArrowRight size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
