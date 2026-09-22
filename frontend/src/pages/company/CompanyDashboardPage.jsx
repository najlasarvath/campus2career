import { Bell, BriefcaseBusiness, CheckCheck } from 'lucide-react';
import { companyProfile } from '../../data/companyData';

export default function CompanyDashboardPage() {
  const { name, activeRoles, verifiedSkills, recentNotifications } = companyProfile;

  const stats = [
    { label: 'Active Roles', value: activeRoles, icon: BriefcaseBusiness, tone: 'blue' },
    { label: 'Verified Skills', value: verifiedSkills, icon: CheckCheck, tone: 'green' },
    { label: 'Recent Notifications', value: recentNotifications, icon: Bell, tone: 'amber' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Company</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{name}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
              </div>
              <div className={[
                'flex h-12 w-12 items-center justify-center rounded-2xl',
                tone === 'blue' && 'bg-blue-100 text-blue-600',
                tone === 'green' && 'bg-emerald-100 text-emerald-600',
                tone === 'amber' && 'bg-amber-100 text-amber-600',
              ].join(' ')}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
