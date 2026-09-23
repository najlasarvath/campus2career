import { Link } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';

export default function DashboardScore() {
  const { match_score, target_score, target_role } = useStudent();

  const getScoreColor = (score) => {
    if (score >= 80) return { stroke: '#059669', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', label: 'Placement Ready' };
    if (score >= 70) return { stroke: '#D97706', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200 text-amber-800', label: 'Competitive' };
    return { stroke: '#E11D48', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200 text-rose-800', label: 'Action Required' };
  };

  const theme = getScoreColor(match_score);

  const radius = 64;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (match_score / 100) * circumference;
  const pointsToTarget = Math.max(0, target_score - match_score);

  return (
    <div className="pro-card p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Role Readiness Benchmark
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${theme.bg}`}>
            {theme.label}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
          {/* Clean Light Meter */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 150 150">
              <circle
                cx="75"
                cy="75"
                r={radius}
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="75"
                cy="75"
                r={radius}
                stroke={theme.stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
                fill="transparent"
              />
            </svg>

            <div className="absolute text-center flex flex-col items-center">
              <span className={`text-3xl font-bold tracking-tight ${theme.text}`}>
                {match_score}%
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Readiness</span>
            </div>
          </div>

          {/* Metric details */}
          <div className="flex-1 space-y-3 w-full">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{target_role} Benchmark</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Calculated against verified employer requirements for entry-to-mid analyst roles.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block text-[11px] font-medium">Target Benchmark</span>
                <span className="text-slate-900 font-bold text-base mt-0.5 block">{target_score}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block text-[11px] font-medium">Gap to Target</span>
                <span className={`font-bold text-base mt-0.5 block ${pointsToTarget === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {pointsToTarget === 0 ? 'Achieved ✓' : `-${pointsToTarget}%`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
        <span className="text-slate-500 text-[11px]">
          Formula: (Matched / Total Required) × 100
        </span>
        <Link
          to="/role-match"
          className="font-semibold text-blue-600 hover:text-blue-700 transition flex items-center space-x-1"
        >
          <span>View Role Delta</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
