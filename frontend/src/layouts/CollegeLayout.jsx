import { AlertTriangle, BarChart3, BookCheck, BriefcaseBusiness, Home, Users, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/college', icon: Home },
  { label: 'Skill Gaps', to: '/college/skills', icon: BarChart3 },
  { label: 'Students', to: '/college/students', icon: Users },
  { label: 'Certificates', to: '/college/certificates', icon: BookCheck },
  { label: 'Alerts', to: '/college/alerts', icon: AlertTriangle },
];

export default function CollegeLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('campus2career-user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">C2C</div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">College</p>
                <p className="text-lg font-bold text-slate-900">Campus2Career</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-2 px-4 py-5">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ].join(' ')
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-4 pb-10 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
