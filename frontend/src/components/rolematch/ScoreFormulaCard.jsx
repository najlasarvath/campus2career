import { Link } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';

export default function ScoreFormulaCard() {
  const { match_score, hasSkillData, role_breakdown, critical_gaps } = useStudent();
  const summary = role_breakdown?.formula_summary || {};

  const dynamicText = !hasSkillData
    ? 'No verified competencies yet. Add your current skills to calculate your live role alignment and competency deficit.'
    : summary.explanation || (
        `Currently ${summary.matched_skills_count || 0} of ${summary.total_required_skills || 6} core required competencies are verified (${summary.core_match_percent || 0}%) resulting in ${match_score}% total alignment.${
          critical_gaps.length
            ? ` The remaining deficit is driven by ${critical_gaps.slice(0, 2).map(g => g.name).join(' and ')}.`
            : ' You meet the required benchmark qualifications!'
        }`
      );

  return (
    <div className="pro-card p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Scoring Methodology
            </span>
            <span className="text-slate-300">•</span>
            <code className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md font-semibold">
              Score = (Matched Core / Required Core) × 100 + Weighting
            </code>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            {dynamicText}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center min-w-[110px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Current Match</span>
            <span className="text-xl font-bold text-blue-700 font-mono">
              {hasSkillData ? `${match_score}%` : '0%'}
            </span>
          </div>
          <Link
            to="/student"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 transition shadow-xs flex items-center space-x-1"
          >
            <span>← Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
