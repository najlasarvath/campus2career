import { useState } from 'react';

function App() {
  const [targetRole, setTargetRole] = useState('Full Stack Developer');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
            C2C
          </div>
          <span className="font-semibold text-lg tracking-tight">Campus2Career</span>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            Scaffold Ready
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-medium bg-indigo-950 text-indigo-300 border border-indigo-800">
          Vite + React + Tailwind CSS
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
          Bridge the Gap from <span className="text-indigo-400">Campus</span> to <span className="text-emerald-400">Career</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
          Personalized AI-powered roadmap generation, resume skill extraction, and real-time campus skill heatmaps.
        </p>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Frontend Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              React + Vite configured with Tailwind CSS utility styling and clean modular folders.
            </p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Backend Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Node.js + Express API with Supabase integration, Gemini AI SDK, and pdf-parse.
            </p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Contract Spec</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              API endpoints for auth, resume upload, extraction, roadmap, and heatmap defined in API_SPEC.md.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        Campus2Career Hackathon Project — Built strictly to rules.md spec
      </footer>
    </div>
  );
}

export default App;
