export default function DailyTaskCard({ task, onToggle }) {
  if (!task) return null;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
        task.completed
          ? 'bg-slate-50/80 border-slate-200 opacity-80'
          : task.isRemedial
          ? 'bg-amber-50/60 border-amber-300 shadow-xs ring-1 ring-amber-400/20'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
            task.completed
              ? 'bg-emerald-100 text-emerald-800'
              : task.isRemedial
              ? 'bg-amber-200 text-amber-900 font-extrabold'
              : 'bg-blue-100 text-blue-800'
          }`}>
            Day {task.day < 10 ? `0${task.day}` : task.day}
          </span>
          <span className="text-slate-300">•</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
            {task.skill}
          </span>
          {task.isRemedial && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
              ⚡ Targeted Remediation
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold text-slate-500 font-mono">
            ⏱ {task.duration || '45 mins'}
          </span>
          <button
            type="button"
            onClick={() => onToggle && onToggle(task.id)}
            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
              task.completed
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'bg-white border-slate-300 hover:border-blue-500 text-transparent'
            }`}
            title={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
          >
            <span className="text-xs font-bold leading-none">✓</span>
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-1.5 mb-3">
        <h4 className={`text-sm font-bold text-slate-900 tracking-tight ${task.completed ? 'line-through text-slate-500' : ''}`}>
          {task.title}
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          {task.description}
        </p>
      </div>

      {/* Practice Challenge & Resource Footnote */}
      <div className="pt-3 border-t border-slate-100/90 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {task.practiceActivity && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              🛠️ Practice Activity:
            </span>
            <span className="text-slate-800 text-[11px] font-medium leading-normal block">
              {task.practiceActivity}
            </span>
          </div>
        )}

        {task.learningResource && (
          <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-200/60 space-y-0.5">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              📖 Recommended Resource:
            </span>
            <span className="text-blue-950 text-[11px] font-medium truncate block" title={task.learningResource}>
              {task.learningResource}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
