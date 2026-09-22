import { AlertCircle } from 'lucide-react';
import { notifications } from '../../data/companyData';

export default function CompanyNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Notifications</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Skill Verified Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.map((note) => (
          <div key={note.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3 text-blue-700">
              <AlertCircle size={20} />
              <p className="text-sm font-semibold uppercase tracking-[0.12em]">Skill Verified</p>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <p>A student has successfully demonstrated a required skill.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="font-medium text-slate-700">Role:</span> {note.role}
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="font-medium text-slate-700">Skill:</span> ✓ {note.skill}
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="font-medium text-slate-700">College:</span> {note.college}
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="font-medium text-slate-700">Status:</span> {note.status}
                </div>
              </div>
            </div>

            <button type="button" className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
