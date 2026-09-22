import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { collegeStudents } from '../../data/collegeData';

const statusColors = {
  'Workshop Required': 'bg-red-100 text-red-700',
  Monitor: 'bg-amber-100 text-amber-700',
  Normal: 'bg-emerald-100 text-emerald-700',
};

export default function CollegeStudentsPage() {
  const [query, setQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return collegeStudents;

    return collegeStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.targetRole.toLowerCase().includes(term) ||
        student.skillGaps.toLowerCase().includes(term)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Students</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{collegeStudents.length} Registered Students</h1>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student or role"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Student</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Target Role</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Match Score</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Skill Gaps</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((student) => (
                <tr key={student.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedStudent(student)}>
                  <td className="px-4 py-4 font-semibold text-slate-900">{student.name}</td>
                  <td className="px-4 py-4 text-slate-600">{student.targetRole}</td>
                  <td className="px-4 py-4 text-slate-700">{student.matchScore}%</td>
                  <td className="px-4 py-4 text-slate-600">{student.skillGaps}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[student.status]}`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">{selectedStudent.name}</h2>
              <button type="button" onClick={() => setSelectedStudent(null)} className="rounded-full bg-slate-100 p-2 text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-medium text-slate-700">Target Role:</span> {selectedStudent.targetRole}
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-medium text-slate-700">Match Score:</span> {selectedStudent.matchScore}%
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-medium text-slate-700">Skill Gaps:</span> {selectedStudent.skillGaps}
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-medium text-slate-700">Status:</span>{' '}
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColors[selectedStudent.status]}`}>
                  {selectedStudent.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
