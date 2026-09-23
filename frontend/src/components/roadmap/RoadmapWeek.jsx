import { useStudent } from '../../context/StudentContext';

export default function RoadmapWeek({ weekData, isLast = false }) {
  const { toggleMilestone } = useStudent();
  const {
    week,
    topic,
    focusSkill,
    status,
    objective,
    milestones = [],
    updatedDueToInterview,
    detectedWeakness
  } = weekData;

  const getStatusTokens = (st) => {
    if (st === 'done') {
      return {
        label: 'Sprint Completed',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        nodeBg: 'bg-emerald-600 text-white shadow-xs',
        cardBorder: 'border-slate-200 bg-white'
      };
    }
    if (st === 'in-progress') {
      return {
        label: 'Active Sprint',
        color: 'text-blue-700 bg-blue-50 border-blue-200 font-semibold',
        nodeBg: 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-100',
        cardBorder: 'border-blue-300 bg-white shadow-xs'
      };
    }
    return {
      label: 'Locked',
      color: 'text-slate-400 bg-slate-100 border-slate-200',
      nodeBg: 'bg-slate-200 text-slate-500 border border-slate-300',
      cardBorder: 'border-slate-200 bg-slate-50/60 opacity-80'
    };
  };

  const tokens = getStatusTokens(status);

  return (
    <div className="relative flex items-start space-x-4 sm:space-x-6">
      {/* Vertical Connecting Spine */}
      {!isLast && (
        <div className="absolute left-4 sm:left-5 top-12 bottom-0 w-0.5 bg-slate-200" />
      )}

      {/* Week Circle Node */}
      <div
        className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${tokens.nodeBg}`}
      >
        W{week}
      </div>

      {/* Week Card Content */}
      <div
        className={`flex-1 mb-8 rounded-xl p-6 border pro-card transition-all duration-150 ${
          updatedDueToInterview
            ? 'border-amber-300 ring-1 ring-amber-200'
            : tokens.cardBorder
        }`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider">Week 0{week}</span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-700 font-semibold">{focusSkill}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              {topic}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {updatedDueToInterview && (
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center space-x-1">
                <span>⚡</span>
                <span>AI Injected Focus</span>
              </span>
            )}
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${tokens.color}`}>
              {tokens.label}
            </span>
          </div>
        </div>

        {/* Objective */}
        <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
          {objective}
        </p>

        {/* Detected Weakness Feedback */}
        {updatedDueToInterview && detectedWeakness && (
          <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg text-xs">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-bold text-amber-800">
                Remedial Focus: {detectedWeakness.subtopic}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed pl-4">
              {detectedWeakness.impactOnRoadmap}
            </p>
          </div>
        )}

        {/* Milestones Checklist */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Required Sprints & Verifications:
          </span>
          {milestones.map((m) => (
            <label
              key={m.id}
              className={`flex items-start space-x-3 p-3 rounded-lg text-xs transition cursor-pointer border ${
                m.isRemedial
                  ? 'bg-amber-50/60 text-amber-900 border-amber-200'
                  : m.completed
                  ? 'bg-slate-50 border-slate-200/60 text-slate-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={m.completed}
                onChange={() => toggleMilestone(week, m.id)}
                disabled={status === 'locked'}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-40"
              />
              <span className={`flex-1 ${m.completed ? 'line-through text-slate-400 font-normal' : 'font-medium'}`}>
                {m.title}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
