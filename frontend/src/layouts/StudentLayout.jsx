import { Home, Sparkles, Bot, Mic, Trophy, User, Target, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/student', icon: Home },
  { label: 'My Role', to: '/student/role-match', icon: Target },
  { label: 'Learn', to: '/student/learn', icon: Sparkles },
  { label: 'AI Assistant', to: '/student/assistant', icon: Bot },
  { label: 'Mock Interview', to: '/student/mock-interview', icon: Mic },
  { label: 'My Progress', to: '/student/progress', icon: Trophy },
];

export default function StudentLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('campus2career-user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 lg:block lg:space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">C2C</div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Student</p>
                <p className="text-lg font-bold text-slate-900">Campus2Career</p>
              </div>
            </div>
          </div>

          <nav className="hidden gap-2 px-4 py-5 lg:flex lg:flex-col">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ].join(' ')
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}

            <div className="mt-6 border-t border-slate-200 pt-5 space-y-2">
              <NavLink
                to="/student/certificate"
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ].join(' ')
                }
              >
                <User size={18} />
                Profile
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </nav>

          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur sm:px-4 lg:hidden">
            <div className="grid grid-cols-3 gap-2 px-2 py-2">
              {navItems.slice(0, 3).map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    [
                      'flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium',
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-600',
                    ].join(' ')
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 px-2 pb-2">
              {navItems.slice(3).map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    [
                      'flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium',
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-600',
                    ].join(' ')
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
              <NavLink
                to="/student/certificate"
                className={({ isActive }) =>
                  [
                    'flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium',
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600',
                  ].join(' ')
                }
              >
                <User size={16} />
                Profile
              </NavLink>
            </div>
          </div>
        </aside>

        <main className="flex-1 pb-28 pt-6 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}
