import { useState } from 'react';
import { useStudent } from '../../context/StudentContext';

export default function SkillEditorModal({ isOpen, onClose }) {
  const { rawSkills, addOrUpdateSkill, removeSkill, target_role } = useStudent();
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState(80);
  const [savedSuccess, setSavedSuccess] = useState('');

  if (!isOpen) return null;

  const quickSuggestions = [
    'SQL', 'Python', 'Power BI', 'Data Visualization', 'Excel', 'Statistics', 'Tableau', 'Git', 'JavaScript', 'React'
  ];

  const handleSave = (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    addOrUpdateSkill(skillName.trim(), Number(skillLevel));
    setSavedSuccess(`✓ Saved ${skillName.trim()} (${skillLevel}%)`);
    setTimeout(() => setSavedSuccess(''), 2500);
    setSkillName('');
    setSkillLevel(80);
  };

  const handleSelectQuick = (name) => {
    setSkillName(name);
    // If user already has this skill, prepopulate level
    const existing = rawSkills.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setSkillLevel(existing.level);
    }
  };

  const handleRemove = (name) => {
    removeSkill(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0F1E36] px-5 py-4 flex items-center justify-between text-white">
          <div>
            <h3 className="text-sm font-bold tracking-tight">Manage Your Candidate Skills</h3>
            <p className="text-[11px] text-slate-300">
              Targeting: <strong className="text-blue-300 font-semibold">{target_role}</strong> • Real-time analytics update
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center justify-between">
              <span>{savedSuccess}</span>
              <span className="text-emerald-600 text-xs">Updated</span>
            </div>
          )}

          {/* Form to Add / Update */}
          <form onSubmit={handleSave} className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Skill Name</label>
              <input
                type="text"
                value={skillName}
                onChange={e => setSkillName(e.target.value)}
                placeholder="e.g. Python, SQL, Power BI..."
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Quick Suggestions */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Quick Select:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickSuggestions.map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSelectQuick(name)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-700 transition"
                  >
                    + {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Proficiency Level Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800">
                  Proficiency Level: <strong className="text-blue-700 font-mono text-sm">{skillLevel}%</strong>
                </label>
                <span className="text-[11px] text-slate-500">
                  {skillLevel >= 80 ? 'Advanced / Offer Ready' : skillLevel >= 50 ? 'Intermediate' : 'Foundational'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={skillLevel}
                onChange={e => setSkillLevel(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              Save Skill to Profile
            </button>
          </form>

          {/* Current Skills List */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Your Current Skills ({rawSkills.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Changes save automatically</span>
            </h4>

            {rawSkills.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-500 bg-slate-50">
                No skills recorded yet. Add your first skill above to generate your readiness analysis!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                {rawSkills.map(s => (
                  <div key={s.name} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-slate-900 text-xs">{s.name}</span>
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {s.level}%
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => { setSkillName(s.name); setSkillLevel(s.level); }}
                        className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(s.name)}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            Stored under your authenticated account
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
