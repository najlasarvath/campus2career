import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { useStudent } from '../../context/StudentContext';

export default function RoleDeltaChart({ onOpenSkillEditor }) {
  const { role_breakdown, hasSkillData, target_role } = useStudent();
  const data = role_breakdown?.skills_comparison || [];

  const getDemonstratedColor = (status) => {
    if (status === 'acquired') return '#059669'; // emerald
    if (status === 'critical_gap') return '#E11D48'; // rose
    return '#D97706'; // amber
  };

  if (!hasSkillData || data.length === 0) {
    return (
      <div className="pro-card p-10 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto text-xl font-bold border border-blue-200/60">
          📊
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">No Skill Data Available Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Add your verified or self-assessed skills to compare your competency directly against <strong className="text-slate-800">{target_role}</strong> industry benchmark requirements.
          </p>
        </div>
        {onOpenSkillEditor && (
          <button
            onClick={onOpenSkillEditor}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <span>+ Add Skills & Generate Analysis</span>
          </button>
        )}
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const delta = item.demonstratedLevel - item.requiredLevel;

      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1 shadow-lg">
          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">{label}</div>
          <div className="flex justify-between gap-4 text-slate-600">
            <span>Required Level:</span>
            <span className="text-slate-900 font-mono font-semibold">{item.requiredLevel}%</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-600">
            <span>Demonstrated:</span>
            <span className="font-mono font-bold" style={{ color: getDemonstratedColor(item.status) }}>
              {item.demonstratedLevel}%
            </span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-slate-100">
            <span className="font-medium text-slate-700">Delta Gap:</span>
            <span className={`font-mono font-bold ${delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {delta >= 0 ? `+${delta}%` : `${delta}%`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pro-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Required vs. Demonstrated Competency Distribution
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative analysis of candidate demonstrated level against target market requirements.
          </p>
        </div>

        {/* Clean pill legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Required Benchmark</span>
          </span>
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Acquired</span>
          </span>
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>Critical Gap</span>
          </span>
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>Secondary</span>
          </span>
        </div>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
            barCategoryGap="22%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="skill"
              stroke="#94A3B8"
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#94A3B8"
              domain={[0, 100]}
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="requiredLevel"
              name="Required Benchmark"
              fill="#2563EB"
              radius={[3, 3, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="demonstratedLevel"
              name="Demonstrated Level"
              radius={[3, 3, 0, 0]}
              maxBarSize={24}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getDemonstratedColor(entry.status)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
