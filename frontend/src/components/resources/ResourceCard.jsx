export default function ResourceCard({ resource }) {
  const {
    title,
    platform,
    tier,
    costText,
    costBadge,
    difficulty,
    duration,
    url,
    whyRecommended
  } = resource;

  const displayCost = costText || costBadge || (tier === 'FREE' ? 'Free' : 'Paid');

  return (
    <div className="pro-card hover:border-slate-300 rounded-xl p-6 transition-all duration-150 flex flex-col justify-between shadow-sm group">
      <div>
        {/* Top Header: Platform, Tier & Cost */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
            {platform}
          </span>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase border ${
              tier === 'FREE' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {tier}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-700 font-semibold">
              {displayCost}
            </span>
          </div>
        </div>

        {/* Resource Title */}
        <h4 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
          {title}
        </h4>

        {/* Meta items: Duration & Difficulty */}
        <div className="flex items-center space-x-2 my-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center space-x-1">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{duration}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="capitalize">{difficulty} Level</span>
        </div>

        {/* Why Recommended */}
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
            Curriculum Alignment Rationale:
          </span>
          <p className="text-slate-700 leading-relaxed text-xs">
            {whyRecommended}
          </p>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 text-[11px] font-medium">Verified External Module</span>
        <a
          href={url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-blue-600 hover:text-white px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-transparent transition-all flex items-center space-x-1"
        >
          <span>Start Learning</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
}


