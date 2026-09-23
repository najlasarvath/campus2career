import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import companyService from '../../services/companyService';

export default function CompanyRequirementsPage() {
  const [requirements, setRequirements] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [formState, setFormState] = useState({
    company: 'Acme Technologies',
    role: 'Associate Data Analyst',
    department: 'Business Intelligence & AI',
    requiredSkills: ['SQL & Querying', 'Power BI', 'Data Visualization'],
    minReadiness: 75,
    experience: '0–2 Years',
    openings: 3,
    location: 'Hybrid (San Francisco, CA)'
  });

  const [publishSuccess, setPublishSuccess] = useState(false);

  useEffect(() => {
    setAvailableSkills(companyService.getAvailableSkills());
    companyService.getRequirements().then(res => setRequirements(res));
  }, []);

  const handleToggleSkill = (skill) => {
    setFormState(prev => {
      const exists = prev.requiredSkills.includes(skill);
      if (exists) {
        return { ...prev, requiredSkills: prev.requiredSkills.filter(s => s !== skill) };
      } else {
        return { ...prev, requiredSkills: [...prev.requiredSkills, skill] };
      }
    });
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (formState.requiredSkills.length === 0) {
      alert('Please select at least one required skill.');
      return;
    }

    const newReq = await companyService.publishRequirement(formState);
    setRequirements(prev => [newReq, ...prev]);
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 3500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="executive-badge-navy text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {formState.company}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">Employer Talent Requisition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Publish Hiring Rubrics & Skill Criteria
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Broadcast verified readiness thresholds to campus candidate pools. Students meeting criteria trigger high-match recruiter alerts.
          </p>
        </div>

        <Link
          to="/company/notifications"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#173B8F] to-[#2563EB] hover:from-[#132E70] hover:to-[#1D4ED8] text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5 shrink-0"
        >
          <span>Verified Alerts</span>
          <span>→</span>
        </Link>
      </div>

      {/* Prototype Preview Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900">
            Demo Prototype Preview
          </span>
          <span className="text-amber-800">
            Company talent portal is out of MVP scope per project rules. Active requisitions use local simulated state.
          </span>
        </div>
      </div>

      {/* Main Grid: Requirement Form vs. Active Published Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Requirements Form */}
        <div className="lg:col-span-6 pro-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Create Requisition Rubric
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Zero noise • AI verified only
            </span>
          </div>

          <form onSubmit={handlePublish} className="space-y-4 text-xs">
            {/* Target Role & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Target Role Title:</label>
                <input
                  type="text"
                  value={formState.role}
                  onChange={(e) => setFormState(prev => ({ ...prev, role: e.target.value }))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Department / Team:</label>
                <input
                  type="text"
                  value={formState.department}
                  onChange={(e) => setFormState(prev => ({ ...prev, department: e.target.value }))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Required Skills Multi-Tagger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 block">
                  Mandatory Verified Skills ({formState.requiredSkills.length} selected):
                </label>
                <span className="text-[10px] text-slate-400">Click to toggle</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200/70 max-h-40 overflow-y-auto">
                {availableSkills.map(skill => {
                  const isSelected = formState.requiredSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimum Readiness Threshold Slider */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Minimum Candidate Readiness Score:</label>
                <span className="font-bold text-sm font-mono text-blue-700">{formState.minReadiness}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={formState.minReadiness}
                onChange={(e) => setFormState(prev => ({ ...prev, minReadiness: Number(e.target.value) }))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                <span>60% (Broad Pipeline)</span>
                <span>75% (Recommended)</span>
                <span>90% (Elite Ready)</span>
              </div>
            </div>

            {/* Experience & Openings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Experience Level:</label>
                <select
                  value={formState.experience}
                  onChange={(e) => setFormState(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
                >
                  <option value="0–1 Years (Fresh Graduate)">0–1 Years (Fresh Graduate)</option>
                  <option value="0–2 Years (Entry to Junior)">0–2 Years (Entry to Junior)</option>
                  <option value="1–3 Years (Junior Associate)">1–3 Years (Junior Associate)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Target Headcount:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formState.openings}
                  onChange={(e) => setFormState(prev => ({ ...prev, openings: Number(e.target.value) }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Workplace Arrangement:</label>
              <input
                type="text"
                value={formState.location}
                onChange={(e) => setFormState(prev => ({ ...prev, location: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <span>Publish Requirements to Pipeline</span>
                <span>→</span>
              </button>
            </div>

            {publishSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold text-center animate-in fade-in">
                ✓ Requisition published! Matched candidates will appear in your notification feed.
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Published Requirements Registry */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Active Published Job Criteria ({requirements.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">Auto-matching active</span>
          </div>

          <div className="space-y-3.5">
            {requirements.map(req => (
              <div key={req.id} className="pro-card p-5 space-y-3.5 hover:border-slate-300 transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{req.role}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {req.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{req.department} • {req.location}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Min Threshold</span>
                    <span className="text-sm font-bold text-blue-700 font-mono">{req.minReadiness}%</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Required Skills:</span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {req.requiredSkills.map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Stats & Link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {req.openings} Openings • Experience: {req.experience}
                  </span>
                  <Link
                    to="/company/notifications"
                    className="font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <span>{req.matchedCandidatesCount} Matched Candidates</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
