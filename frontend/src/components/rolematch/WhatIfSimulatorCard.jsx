import { useState } from 'react';
import apiClient from '../../services/api';
import { useStudent } from '../../context/StudentContext';

export default function WhatIfSimulatorCard() {
  const { student, rawSkills } = useStudent();
  const [hypotheticalSkill, setHypotheticalSkill] = useState('Docker');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simError, setSimError] = useState(null);

  const quickSkills = ['Docker', 'TypeScript', 'PostgreSQL', 'Redis', 'Tailwind CSS', 'AWS', 'Python', 'React'];

  const handleSimulate = async (skillToTest) => {
    const testSkill = skillToTest || hypotheticalSkill;
    if (!testSkill.trim()) return;

    setIsSimulating(true);
    setSimError(null);

    try {
      const currentSkills = (rawSkills || []).map(s => s.name || s);

      // POST /api/whatif/simulate
      const response = await apiClient.post('/whatif/simulate', {
        hypotheticalSkill: testSkill.trim(),
        currentSkills: currentSkills.length > 0 ? currentSkills : ['JavaScript', 'HTML5', 'CSS3']
      });

      if (response && response.success) {
        setSimulationResult(response);
      } else {
        throw new Error(response?.message || 'Simulation failed');
      }
    } catch (err) {
      console.error('[WhatIfSimulator] Error:', err);
      setSimError(err.message || 'Failed to simulate skill impact');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="pro-card p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Gemini AI What-If Skill Simulator
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
          Live AI Impact Engine
        </span>
      </div>

      <p className="text-xs text-slate-600">
        Simulate acquiring a target competency to calculate projected readiness score jumps across multiple enterprise roles using the backend AI engine.
      </p>

      {/* Input & Quick Select */}
      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={hypotheticalSkill}
            onChange={(e) => setHypotheticalSkill(e.target.value)}
            placeholder="Enter a skill (e.g. Docker, TypeScript, Redis)..."
            className="flex-1 bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
          />
          <button
            type="button"
            onClick={() => handleSimulate()}
            disabled={isSimulating || !hypotheticalSkill.trim()}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
          >
            {isSimulating && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isSimulating ? 'Simulating...' : 'Simulate Lift →'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Quick Test:
          </span>
          {quickSkills.map((sk) => (
            <button
              key={sk}
              type="button"
              onClick={() => {
                setHypotheticalSkill(sk);
                handleSimulate(sk);
              }}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-700 transition"
            >
              + {sk}
            </button>
          ))}
        </div>
      </div>

      {simError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
          ⚠️ {simError}
        </div>
      )}

      {/* Simulation Result Presentation */}
      {simulationResult && (
        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-3.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
            <span className="text-xs font-bold text-indigo-950">
              Projected Lift for Competency: <strong className="text-indigo-700">{simulationResult.hypotheticalSkill}</strong>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Verified AI Analysis
            </span>
          </div>

          {/* Role Delta Grid */}
          {Array.isArray(simulationResult.roleImpacts) && simulationResult.roleImpacts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {simulationResult.roleImpacts.map((imp, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 text-center space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 block truncate">
                    {imp.role}
                  </span>
                  <div className="flex items-baseline justify-center space-x-2">
                    <span className="text-xs text-slate-400 font-mono">{imp.beforePercent}%</span>
                    <span className="text-slate-300">→</span>
                    <span className="text-sm font-bold text-emerald-700 font-mono">{imp.afterPercent}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
                    +{imp.delta || (imp.afterPercent - imp.beforePercent)}% Lift
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* AI Explanation Text */}
          {simulationResult.explanation && (
            <div className="p-3 bg-white border border-indigo-100 rounded-lg text-xs text-slate-700 leading-relaxed space-y-1">
              <span className="font-bold text-indigo-900 block text-[11px] uppercase tracking-wider">
                Coach Assessment:
              </span>
              <p>{simulationResult.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
