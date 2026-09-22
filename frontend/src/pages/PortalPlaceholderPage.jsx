import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PortalPlaceholderPage({ portalName }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Portal</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">{portalName}</h1>
        <p className="mt-3 text-slate-600">
          This portal is staged for the next implementation phase.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
