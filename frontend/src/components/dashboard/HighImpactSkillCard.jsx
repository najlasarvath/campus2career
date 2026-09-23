import { Link } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';

export default function HighImpactSkillCard() {
  const { highest_impact_skill, critical_gaps, match_score } = useStudent();
  const isTargetSkillCleared = !critical_gaps.some(g => g.name === highest_impact_skill.skill);

  return (
    <div className="pro-card p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Priority Gap Spotlight
          </span>
          {isTargetSkillCleared ? (
            <span className="text-xs text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center space-x-1">
              <span>✓</span>
              <span>Acquired</span>
            </span>
          ) : (
            <span className="text-xs text-rose-800 font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">
              #1 Blocker
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          {highest_impact_skill.skill}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Closing this single technical capability yields the highest ROI for your candidacy across 40+ entry-level requisitions.
        </p>

        {/* Projected Lift Spotlight Card */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              {highest_impact_skill.potential_lift}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5 font-medium">
              Projected Placement Lift
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs px-2.5 py-1 rounded-md bg-white text-slate-800 font-semibold border border-slate-200 inline-block shadow-xs">
              {match_score}% → {Math.min(100, match_score + 12)}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Threshold Pass
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
        <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Est. 2-Week Sprint</span>
        </div>
        <Link
          to="/roadmap"
          className="font-semibold text-blue-600 hover:text-blue-700 transition flex items-center space-x-1"
        >
          <span>Launch Week 1 Sprint</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
