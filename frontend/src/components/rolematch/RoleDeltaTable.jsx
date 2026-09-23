import { Link } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';

export default function RoleDeltaTable() {
  const { role_breakdown, hasSkillData } = useStudent();
  const skills = role_breakdown?.skills_comparison || [];

  const getStatusBadge = (status) => {
    if (status === 'acquired') {
      return (
        <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
          <span>✓</span>
          <span>Acquired</span>
        </span>
      );
    }
    if (status === 'critical_gap') {
      return (
        <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
          <span>!</span>
          <span>Critical Gap</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-medium">
        Secondary
      </span>
    );
  };

  if (!hasSkillData || skills.length === 0) {
    return (
      <div className="pro-card p-8 text-center text-slate-500 text-xs">
        No competency breakdown data available yet. Add your skills to generate your audit matrix.
      </div>
    );
  }

  return (
    <div className="pro-card overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Competency Breakdown & Audit Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side gap audit of benchmark requirements and individual candidate readiness deltas.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto border border-slate-200">
          {skills.length} Competencies Evaluated
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-5">Skill Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Required Benchmark</th>
              <th className="py-3 px-4 text-center">Demonstrated</th>
              <th className="py-3 px-4 text-center">Delta Gap</th>
              <th className="py-3 px-5 text-right">Action Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {skills.map((item) => {
              const delta = item.demonstratedLevel - item.requiredLevel;
              const isPositive = delta >= 0;

              return (
                <tr
                  key={item.skill}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <span className="font-semibold text-slate-900 text-sm block">
                      {item.skill}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(item.status)}
                  </td>

                  <td className="py-3.5 px-4 text-center text-slate-600 font-mono font-medium">
                    {item.requiredLevel}%
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                    {item.demonstratedLevel}%
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`font-mono font-bold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isPositive ? `+${delta}%` : `${delta}%`}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    {item.status === 'acquired' ? (
                      <span className="text-slate-400 text-xs font-medium">✓ Verified</span>
                    ) : item.status === 'critical_gap' ? (
                      <Link
                        to="/resources"
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-white px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 transition shadow-xs"
                      >
                        <span>Remediate</span>
                        <span>→</span>
                      </Link>
                    ) : (
                      <Link
                        to="/roadmap"
                        className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md hover:bg-slate-100 border border-slate-200 bg-white transition"
                      >
                        Sprint →
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
