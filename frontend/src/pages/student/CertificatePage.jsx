import { Download, Eye, Printer } from 'lucide-react';
import { useState } from 'react';

export default function CertificatePage() {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
    window.print();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Certificate</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Skill Completion Certificate</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              <Eye size={16} />
              View Certificate
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Download size={16} />
              Download Certificate
            </button>
          </div>
        </div>

        {downloaded && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            Certificate download started successfully.
          </div>
        )}

        <div className="rounded-[28px] border-[10px] border-amber-200 bg-gradient-to-br from-slate-50 to-white p-8 text-center shadow-inner">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Certificate of Skill Completion</p>
          <p className="mt-8 text-sm text-slate-600">This certifies that</p>
          <p className="mt-3 text-4xl font-black tracking-tight text-slate-900">NEHREEN</p>
          <p className="mt-4 text-sm text-slate-600">has successfully completed the required learning and assessment for</p>
          <p className="mt-3 text-3xl font-bold text-blue-700">MACHINE LEARNING</p>
          <p className="mt-4 text-sm text-slate-600">and demonstrated the required competency.</p>

          <div className="mt-10 flex items-end justify-between border-t border-slate-200 pt-6 text-left">
            <div>
              <p className="text-sm font-semibold text-slate-700">ABC COLLEGE</p>
              <p className="mt-2 text-xs text-slate-500">Date</p>
            </div>
            <div className="text-right">
              <div className="mb-3 border-b border-slate-200 pb-2 text-lg font-semibold text-slate-700">Placement Officer</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center text-slate-500">
          <Printer size={16} />
          <span className="ml-2 text-sm">Printable preview</span>
        </div>
      </div>
    </div>
  );
}
