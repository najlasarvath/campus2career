import { AlertTriangle } from 'lucide-react';
import { collegeAlerts } from '../../data/collegeData';

export default function CollegeAlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Alerts</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Workshop Required Alerts</h1>
      </div>

      <div className="space-y-4">
        {collegeAlerts.map((alert) => (
          <div key={alert.skill} className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle size={20} />
              <p className="text-lg font-bold">{alert.skill} — {alert.value}%</p>
            </div>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-red-700">Workshop Required</p>
          </div>
        ))}
      </div>
    </div>
  );
}
