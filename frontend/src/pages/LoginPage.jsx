import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, GraduationCap, School } from 'lucide-react';
import { demoAccounts } from '../data/demoAccounts';

const roleOptions = [
  { key: 'student', label: 'Student', description: 'Find your skill gap', icon: GraduationCap },
  { key: 'college', label: 'College', description: 'Track campus skills', icon: School },
  { key: 'company', label: 'Company', description: 'Define job skills', icon: BriefcaseBusiness },
];

const fieldLabels = {
  student: { email: 'College Email', note: 'Use your college-verified email to connect your profile with your college.' },
  college: { email: 'Official College Email', note: 'Placement-cell access for managing campus skill insights.' },
  company: { email: 'Company Email', note: 'Recruitment and skill verification access.' },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('student');
  const [form, setForm] = useState({ email: 'student@abccollege.edu', password: 'student123' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey);
    const account = demoAccounts[roleKey];
    setForm({ email: account.email, password: account.password });
    setError('');
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const email = form.email.trim();
    const password = form.password.trim();

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const account = demoAccounts[selectedRole];
    if (!account || account.email.toLowerCase() !== email.toLowerCase() || account.password !== password) {
      setError('Invalid demo credentials for this role. Please use the demo login shown below.');
      return;
    }

    const user = {
      role: selectedRole,
      name: account.name,
      email,
      loggedIn: true,
      ...(selectedRole === 'student' && { college: 'ABC College', targetRole: 'AI/ML Engineer' }),
      ...(selectedRole === 'college' && { collegeName: 'ABC College' }),
      ...(selectedRole === 'company' && { companyName: 'TechNova' }),
    };

    localStorage.setItem('campus2career-user', JSON.stringify(user));
    setError('');

    if (selectedRole === 'student') navigate('/student');
    if (selectedRole === 'college') navigate('/college');
    if (selectedRole === 'company') navigate('/company');
  };

  const selectedRoleConfig = roleOptions.find((role) => role.key === selectedRole);
  const emailLabel = fieldLabels[selectedRole].email;
  const helperNote = fieldLabels[selectedRole].note;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
            C2C
          </div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">CAMPUS2CAREER AI</h1>
          <p className="mt-2 text-lg text-slate-600">From Skill Gaps to Industry Readiness</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {roleOptions.map(({ key, label, description, icon: Icon }) => {
            const active = selectedRole === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectRole(key)}
                className={[
                  'rounded-2xl border p-4 text-left transition',
                  active ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-slate-300',
                ].join(' ')}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm">
                  <Icon size={22} />
                </div>
                <p className="text-xl font-bold text-slate-900">{label}</p>
                <p className="mt-1 text-sm text-slate-600">{description}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">{selectedRoleConfig.label}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Login</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700">
                {emailLabel}
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder={selectedRole === 'student' ? 'student@abccollege.edu' : selectedRole === 'college' ? 'placement@abccollege.edu' : 'hr@technova.com'}
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your password"
              />
            </div>

            <p className="text-xs text-slate-500">{helperNote}</p>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
              >
                Login as {selectedRoleConfig.label}
                <ArrowRight size={18} />
              </button>

              <Link
                to={`/register/${selectedRole}`}
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Create {selectedRoleConfig.label} Account
              </Link>
            </div>
          </form>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
            <p className="mb-2 font-semibold text-slate-800">Demo Login</p>
            <p>
              {selectedRoleConfig.label}: {demoAccounts[selectedRole].email}
            </p>
            <p>Password: {demoAccounts[selectedRole].password}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
