import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import collegeService from '../../services/collegeService';

export default function CollegeWorkshopsPage() {
  const { role } = useAuth();
  const isStudent = role === 'student';

  const [searchParams] = useSearchParams();
  const initialSkill = searchParams.get('skill') || 'Power BI';

  const [workshops, setWorkshops] = useState([]);
  const [formState, setFormState] = useState({
    targetSkill: initialSkill,
    targetCohort: 'Data Analytics Students (Final Year)',
    severity: 'Critical Deficit',
    duration: '2 Days (12 Hours)',
    mode: 'Hybrid'
  });

  const [previewWorkshop, setPreviewWorkshop] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    collegeService.getWorkshops().then(data => {
      if (Array.isArray(data)) {
        setWorkshops(data);
      }
    });
    // Generate initial preview
    handleGeneratePreview(initialSkill);
  }, [initialSkill]);

  const handleGeneratePreview = (skillOverride) => {
    setIsGenerating(true);
    setSavedSuccess(false);
    setTimeout(() => {
      const state = skillOverride ? { ...formState, targetSkill: skillOverride } : formState;
      const generated = collegeService.generateWorkshop(state);
      setPreviewWorkshop(generated);
      setIsGenerating(false);
    }, 200);
  };

  const handleSaveWorkshop = async () => {
    if (isStudent || !previewWorkshop) return;
    try {

      const saved = await collegeService.createWorkshop({
        title: previewWorkshop.title,
        skill: previewWorkshop.targetSkill,
        targetCohort: previewWorkshop.targetCohort,
        duration: previewWorkshop.duration,
        deliveryMode: previewWorkshop.mode,
        learningObjectives: previewWorkshop.modules
      });
      setWorkshops(prev => [saved || previewWorkshop, ...prev]);
    } catch {
      setWorkshops(prev => [previewWorkshop, ...prev]);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const availableSkills = [
    'SQL',
    'Power BI',
    'Python',
    'Cloud & AWS',
    'Data Visualization',
    'Tableau',
    'Excel (Advanced DAX)',
    'Executive Communication'
  ];

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1.5 font-medium">
            <Link to="/college/dashboard" className="hover:text-blue-600 transition">College Portal</Link>
            <span>/</span>
            <span className="text-blue-600 font-semibold">Targeted Workshop Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Curriculum Remediation & Workshop Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Synthesize dynamic skill-gap training programs directly from AI cohort deficit audits to rapidly elevate placement eligibility.
          </p>
        </div>

        <Link
          to="/college/heatmap"
          className="px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold border border-slate-200 shadow-sm transition"
        >
          ← Inspect Skill Heatmap
        </Link>
      </div>

      {/* Main Grid: Workshop Configuration Form vs. Live Generated Syllabus Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Workshop Generator Parameters */}
        <div className="lg:col-span-5 pro-card p-6 space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Workshop Generator Parameters
            </h3>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleGeneratePreview(); }} className="space-y-4 text-xs">
            {/* Target Skill */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Target Competency / Skill Gap:
              </label>
              <select
                value={formState.targetSkill}
                onChange={(e) => setFormState(prev => ({ ...prev, targetSkill: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition"
              >
                {availableSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            {/* Target Student Cohort */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Target Student Cohort:
              </label>
              <select
                value={formState.targetCohort}
                onChange={(e) => setFormState(prev => ({ ...prev, targetCohort: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition"
              >
                <option value="Data Analytics Students (Final Year)">Data Analytics Students (Final Year)</option>
                <option value="Computer Science & IT Cohort (3rd Year)">Computer Science & IT Cohort (3rd Year)</option>
                <option value="AI & Machine Learning Specialists">AI & Machine Learning Specialists</option>
                <option value="All Engineering Branches (Remedial Group)">All Engineering Branches (Remedial Group)</option>
              </select>
            </div>

            {/* Skill Gap Severity */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Identified Deficit Severity:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Critical Deficit', 'Moderate Gap'].map(sev => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setFormState(prev => ({ ...prev, severity: sev }))}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition text-center ${
                      formState.severity === sev
                        ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Program Duration:
              </label>
              <select
                value={formState.duration}
                onChange={(e) => setFormState(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition"
              >
                <option value="1 Day (6 Hours Intensive)">1 Day (6 Hours Intensive)</option>
                <option value="2 Days (12 Hours Bootcamp)">2 Days (12 Hours Bootcamp)</option>
                <option value="3 Days (18 Hours Comprehensive)">3 Days (18 Hours Comprehensive)</option>
                <option value="1 Week (30 Hours Masterclass)">1 Week (30 Hours Masterclass)</option>
              </select>
            </div>

            {/* Mode of Delivery */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Delivery Mode:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Hybrid', 'In-Person', 'Online Lab'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormState(prev => ({ ...prev, mode }))}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition text-center ${
                      formState.mode === mode
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit / Generate Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <span>{isGenerating ? 'Synthesizing...' : '⚡ Generate Structured Syllabus'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Generated Workshop Preview */}
        <div className="lg:col-span-7 space-y-4">
          {previewWorkshop ? (
            <div className="pro-card p-6 space-y-5 border-blue-200 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    Generated Proposal Preview
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {previewWorkshop.title}
                  </h3>
                </div>

                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {previewWorkshop.expectedLift}
                </span>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Skill</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{previewWorkshop.targetSkill}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{previewWorkshop.duration}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Mode</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{previewWorkshop.mode}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Cohort</span>
                  <span className="font-bold text-blue-700 mt-0.5 block">~{previewWorkshop.enrolledCount} Students</span>
                </div>
              </div>

              {/* Modular Syllabus Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <span>Structured Learning Modules</span>
                </h4>
                <div className="space-y-2">
                  {previewWorkshop.modules.map((mod, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg text-xs flex items-start space-x-3 shadow-xs">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-800 font-medium leading-relaxed">
                        {mod}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 text-[11px]">
                  {savedSuccess ? (
                    <span className="text-emerald-700 font-bold">✓ Workshop scheduled & added to active roster!</span>
                  ) : (
                    'Ready for faculty assignment and room scheduling'
                  )}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleGeneratePreview}
                    className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 shadow-sm transition"
                  >
                    ↺ Regenerate
                  </button>
                  {isStudent ? (
                    <span
                      title="Workshop creation and scheduling is restricted to placement administrators"
                      className="px-3.5 py-2 rounded-lg bg-slate-100 text-slate-500 font-semibold border border-slate-200 text-xs flex items-center space-x-1 cursor-not-allowed"
                    >
                      <span>🔒 Scheduling Restricted</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveWorkshop}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition flex items-center space-x-1"
                    >
                      <span>Schedule Workshop</span>
                      <span>✓</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          ) : (
            <div className="pro-card p-12 text-center text-slate-500 text-xs">
              Configure parameters on the left to generate workshop syllabus.
            </div>
          )}
        </div>
      </div>

      {/* Active & Scheduled Workshops Registry */}
      <div className="pro-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Active & Scheduled Placement Workshops ({workshops.length})
            </h3>
            <p className="text-xs text-slate-500">
              Ongoing cohort remediation programs across university departments
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workshops.map(ws => (
            <div key={ws.id} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {ws.targetSkill}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    ws.status === 'In Progress'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : ws.status === 'Completed'
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {ws.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {ws.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Cohort: {ws.targetCohort}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center justify-between">
                <span>{ws.enrolledCount} Students</span>
                <span className="font-semibold text-emerald-700">{ws.expectedLift}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
