export default function ScoreBar({ name, score, benchmark = 70 }) {
  const getStatusTokens = (s) => {
    if (s >= 75) {
      return {
        fill: 'bg-emerald-600',
        text: 'text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Strong Match'
      };
    }
    if (s >= 70) {
      return {
        fill: 'bg-blue-600',
        text: 'text-blue-700',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'Meets Standard'
      };
    }
    return {
      fill: 'bg-rose-500',
      text: 'text-rose-700',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'Remedial Focus'
    };
  };

  const tokens = getStatusTokens(score);

  return (
    <div className="space-y-2.5 bg-slate-50 border border-slate-200/80 p-4 rounded-xl shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-900 text-sm">{name}</span>
        <div className="flex items-center space-x-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tokens.badge}`}>
            {tokens.label}
          </span>
          <span className="text-slate-300">•</span>
          <span className={`font-mono font-bold text-base ${tokens.text}`}>
            {score}%
          </span>
        </div>
      </div>

      {/* Progress Track with Benchmark Indicator */}
      <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${tokens.fill}`}
          style={{ width: `${score}%` }}
        />
        {/* Benchmark Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10 opacity-70"
          style={{ left: `${benchmark}%` }}
          title={`Benchmark: ${benchmark}%`}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
        <span>0%</span>
        <span className="font-medium text-slate-600">Recruiter Benchmark: <strong className="text-slate-900">{benchmark}%</strong></span>
        <span>100%</span>
      </div>
    </div>
  );
}


