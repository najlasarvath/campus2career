import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { useStudent } from '../../context/StudentContext';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { activePortal, switchPortal } = usePortal();
  const studentContext = useStudent();
  const { student, collegeSelectedStudentId, setCollegeSelectedStudentId } = studentContext || {};
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Portal-specific navigation items
  const portalNavs = {
    student: [
      { label: 'Dashboard', path: '/student' },
      { label: 'Role Match', path: '/student/role-match' },
      { label: 'Roadmap', path: '/student/roadmap' },
      { label: 'Resources', path: '/student/resources' },
      { label: 'Mock Drill', path: '/student/interview' }
    ],
    college: [
      { label: 'Overview', path: '/college/dashboard' },
      { label: 'Skill Heatmap', path: '/college/heatmap' },
      { label: 'Workshops', path: '/college/workshops' },
      { label: 'Certificates', path: '/college/certificates' }
    ],
    company: [
      { label: 'Job Requirements', path: '/company/requirements' },
      { label: 'Candidate Alerts', path: '/company/notifications' }
    ]
  };

  const currentNavItems = portalNavs[activePortal] || portalNavs.student;

  const handlePortalSwitch = (targetRole) => {
    // If user's current role matches targetRole, simply switch active view
    if (role === targetRole) {
      switchPortal(targetRole);
    } else if (role === 'college' && targetRole === 'student') {
      // College user can seamlessly view Student Experience without logging out!
      switchPortal('student');
    } else if (role === 'student' && targetRole === 'college') {
      // Student can seamlessly view College Portal in READ-ONLY mode!
      switchPortal('college');
      navigate('/college/dashboard');
    } else {
      // Redirect to login for that role so authentication is not bypassed
      navigate(`/login?role=${targetRole}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCollegeViewingStudent = role === 'college' && activePortal === 'student';
  const isStudentViewingCollege = role === 'student' && activePortal === 'college';

  return (
    <>
      {/* College Viewing Student Mode Indicator Banner */}
      {isCollegeViewingStudent && (
        <div className="bg-[#0F1E36] text-amber-200 border-b border-amber-500/20 text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/30">
                Institutional Access
              </span>
              <span className="text-slate-200 font-medium">
                Previewing as {user?.institution || 'College'}:
              </span>
              <select
                value={collegeSelectedStudentId || 'demo_student'}
                onChange={(e) => setCollegeSelectedStudentId?.(e.target.value)}
                className="bg-slate-900 border border-amber-400/40 text-amber-200 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-amber-300"
              >
                <option value="demo_student">Demo Student (Alex Chen - 68%)</option>
                {user?.role === 'student' && !user.isDemo && (
                  <option value={user.id}>
                    Active Student: {user.name} ({user.targetRole || 'Full Stack Developer'})
                  </option>
                )}
              </select>
            </div>
            <button
              onClick={() => switchPortal('college')}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
            >
              <span>← Return to College Portal</span>
            </button>
          </div>
        </div>
      )}

      {/* Student Viewing College Portal in Read-Only Mode Indicator Banner */}
      {isStudentViewingCollege && (
        <div className="bg-[#0B1528] text-blue-200 border-b border-blue-500/30 text-xs py-2 px-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/40">
                🔒 Student Read-Only Mode
              </span>
              <span className="text-slate-200 font-medium">
                Viewing Institutional Readiness & Cohort Diagnostics for {user?.institution || 'Apex Institute of Technology'}
              </span>
            </div>
            <button
              onClick={() => { switchPortal('student'); navigate('/student'); }}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
            >
              <span>← Return to Student Portal</span>
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand & Portal Switcher */}
            <div className="flex items-center space-x-6">
              <NavLink to="/" className="flex items-center space-x-3 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#173B8F] to-[#0A225C] flex items-center justify-center font-bold text-white text-xs shadow-sm ring-1 ring-blue-900/10">
                  C2C
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-900 text-sm tracking-tight leading-none group-hover:text-blue-900 transition">
                    Campus2Career
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mt-0.5">
                    Enterprise
                  </span>
                </div>
              </NavLink>

              {/* Portal Switcher Tabs */}
              <div className="flex items-center p-0.5 rounded-lg bg-slate-100/90 border border-slate-200/90 text-xs font-semibold">
                <button
                  onClick={() => handlePortalSwitch('student')}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
                    activePortal === 'student'
                      ? 'bg-white text-blue-900 shadow-xs font-bold border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={role === 'college' ? 'Preview Student Experience' : 'Student Portal'}
                >
                  <span>🎓</span>
                  <span>Student</span>
                  {role === 'college' && (
                    <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-bold uppercase">
                      Preview
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handlePortalSwitch('college')}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
                    activePortal === 'college'
                      ? 'bg-white text-blue-900 shadow-xs font-bold border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={role === 'student' ? 'View College Readiness (Read-Only)' : 'College Portal'}
                >
                  <span>🏫</span>
                  <span>College</span>
                  {role === 'student' && (
                    <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                      Read-Only
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handlePortalSwitch('company')}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
                    activePortal === 'company'
                      ? 'bg-white text-blue-900 shadow-xs font-bold border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={role !== 'company' ? 'Switch to Company Account' : 'Company Portal'}
                >
                  <span>🏢</span>
                  <span>Company</span>
                </button>
              </div>
            </div>

            {/* Desktop Sub-Nav Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {currentNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/student' || item.path === '/'}
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'text-blue-900 font-bold bg-blue-50/90 shadow-2xs border border-blue-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              {/* If college user is in College view, offer a direct "View Student Experience" CTA */}
              {role === 'college' && activePortal === 'college' && (
                <button
                  onClick={() => switchPortal('student')}
                  className="ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 transition flex items-center space-x-1.5"
                >
                  <span>View Student Experience</span>
                  <span className="text-[10px]">→</span>
                </button>
              )}
            </nav>

          {/* User Profile Menu & Logout */}
          <div className="flex items-center space-x-3">
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition focus:outline-none"
                aria-label="User Profile Menu"
              >
                <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700">
                  {user?.avatar || (role === 'student' ? 'AC' : role === 'college' ? 'AP' : 'ER')}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 text-xs z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{user?.name || 'Demo User'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || 'user@campus2career.demo'}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {user?.role || role} Portal
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setIsProfileOpen(false); alert(`Viewing profile for ${user?.name}. Institution: ${user?.institution || 'Apex Institute'}`); }}
                      className="w-full text-left px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 transition"
                    >
                      Profile & Details
                    </button>
                    <button
                      onClick={() => { setIsProfileOpen(false); alert('Settings preferences saved.'); }}
                      className="w-full text-left px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 transition"
                    >
                      Account Settings
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-1.5 text-rose-600 font-semibold hover:bg-rose-50 transition flex items-center space-x-1.5"
                    >
                      <span>Sign Out</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-2 border-t border-slate-200 space-y-1">
            {currentNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/student' || item.path === '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-xs font-medium ${
                    isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-xs font-semibold text-rose-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
        </div>
      </header>
    </>
  );
}



