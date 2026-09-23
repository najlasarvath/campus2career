import { Link } from 'react-router-dom';

export default function SkillColumn({
  type = 'acquired',
  title,
  badgeColor = 'emerald',
  skills = [],
  description
}) {
  const meta = {
    emerald: {
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      tag: 'Verified Match'
    },
    rose: {
      dot: 'bg-rose-500',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
      tag: 'Role Blocker'
    },
    amber: {
      dot: 'bg-amber-500',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      tag: 'Differentiator'
    }
  }[badgeColor] || {
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    tag: 'Competency'
  };

  return (
    <div className="pro-card p-5 flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
        <div className="flex items-center space-x-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {skills.length}
        </span>
      </div>

      {/* Skill List */}
      <div className="space-y-2.5 flex-1">
        {skills.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
            No items in this category.
          </div>
        ) : (
          skills.map((skill) => (
            <div
              key={skill.id || skill.name}
              className="bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-lg p-3 flex items-center justify-between transition-colors"
            >
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  {skill.name}
                </h4>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-[11px] text-slate-500">
                    {skill.category}
                  </span>
                  <span className="text-slate-300 text-[10px]">•</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${meta.badge}`}>
                    {meta.tag}
                  </span>
                </div>
              </div>

              <div>
                {type === 'acquired' && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200">
                    <span>✓</span>
                    <span className="hidden sm:inline">Demonstrated</span>
                  </span>
                )}

                {type === 'critical' && (
                  <Link
                    to="/resources"
                    className="text-xs font-semibold text-white px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 transition flex items-center space-x-1 shadow-xs"
                  >
                    <span>Learn</span>
                    <span>→</span>
                  </Link>
                )}

                {type === 'secondary' && (
                  <Link
                    to="/roadmap"
                    className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md hover:bg-slate-200/60 border border-slate-200 bg-white transition"
                  >
                    Roadmap
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
