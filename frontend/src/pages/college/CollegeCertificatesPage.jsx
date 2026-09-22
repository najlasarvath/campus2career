import { Eye } from 'lucide-react';
import { collegeCertificates } from '../../data/collegeData';

export default function CollegeCertificatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Certificates</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Completed Student Skills</h1>
      </div>

      <div className="space-y-4">
        {collegeCertificates.map((certificate) => (
          <div key={certificate.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-bold text-slate-900">{certificate.studentName}</p>
              <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
                <span className="font-medium text-slate-700">{certificate.skill}</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  {certificate.status}
                </span>
              </div>
            </div>

            <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
              <Eye size={16} />
              View Certificate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
