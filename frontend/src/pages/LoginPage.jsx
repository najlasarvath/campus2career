import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── SVG Icons ─────────────────────────────────── */
const EyeOpen = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
);
const EyeOff = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
  </svg>
);

/* ─── Shared input style ─────────────────────────── */
const INPUT = {
  width: '100%',
  height: 44,
  boxSizing: 'border-box',
  background: '#fff',
  border: '1.5px solid #D1D9E6',
  borderRadius: 8,
  padding: '0 14px',
  fontSize: 13.5,
  color: '#1E293B',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
};

function inp(el) {
  el.style.borderColor = '#2563EB';
  el.style.boxShadow = '0 0 0 3px rgba(37,99,235,.12)';
}
function blr(el) {
  el.style.borderColor = '#D1D9E6';
  el.style.boxShadow = 'none';
}

/* ─── Text Input ─────────────────────────────────── */
function TInput({ label, type = 'text', value, onChange, placeholder, required, helper, helperColor, note }) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type={isPass ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          style={{ ...INPUT, paddingRight: isPass ? 44 : 14 }}
          onFocus={e => inp(e.target)}
          onBlur={e => blr(e.target)}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
              display: 'flex', alignItems: 'center', padding: 0,
            }}
          >{show ? <EyeOff /> : <EyeOpen />}</button>
        )}
      </div>
      {helper && (
        <span style={{ fontSize: 11.5, color: helperColor || '#94A3B8' }}>{helper}</span>
      )}
      {note && (
        <span style={{ fontSize: 11.5, color: '#10B981', fontWeight: 500 }}>{note}</span>
      )}
    </div>
  );
}

/* ─── Select ─────────────────────────────────────── */
function TSelect({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...INPUT, cursor: 'pointer' }}
        onFocus={e => inp(e.target)}
        onBlur={e => blr(e.target)}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

/* ─── Grid helpers ───────────────────────────────── */
const G2 = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{children}</div>
);

/* ─── Alert ──────────────────────────────────────── */
const Msg = ({ type, text }) => (
  <div style={{
    padding: '10px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 500,
    border: `1px solid ${type === 'error' ? '#FCA5A5' : '#6EE7B7'}`,
    background: type === 'error' ? '#FEF2F2' : '#ECFDF5',
    color: type === 'error' ? '#B91C1C' : '#065F46',
    display: 'flex', alignItems: 'center', gap: 8,
  }}>
    <span style={{ fontWeight: 700 }}>{type === 'error' ? '✕' : '✓'}</span>
    {text}
  </div>
);

/* ─── Primary Button ─────────────────────────────── */
const PBtn = ({ children, type = 'button', onClick, loading, disabled }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading || disabled}
    style={{
      width: '100%', height: 46, borderRadius: 9, border: 'none',
      background: loading || disabled ? '#93C5FD' : '#2563EB',
      color: '#fff', fontSize: 14, fontWeight: 600,
      cursor: loading || disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit', letterSpacing: '0.01em',
      transition: 'background .15s',
    }}
    onMouseEnter={e => { if (!loading && !disabled) e.currentTarget.style.background = '#1D4ED8'; }}
    onMouseLeave={e => { if (!loading && !disabled) e.currentTarget.style.background = '#2563EB'; }}
  >{loading ? 'Please wait…' : children}</button>
);

/* ─── Outlined Button ────────────────────────────── */
const OBtn = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      width: '100%', height: 46, borderRadius: 9,
      border: '1.5px solid #D1D5DB', background: '#fff',
      color: '#374151', fontSize: 14, fontWeight: 500,
      cursor: 'pointer', fontFamily: 'inherit',
      transition: 'background .15s, border-color .15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
  >{children}</button>
);

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login, loginAsDemo, register, isAuthenticated, user, isLoading } = useAuth();

  const initialRole = searchParams.get('role') || 'student';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [authMode, setAuthMode] = useState(initialMode);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register
  const emptyReg = {
    name: '', email: '', collegeName: '', branch: '',
    year: '1st Year', targetRole: 'Data Analyst',
    password: '', confirmPassword: '',
    collegeDomain: '', designation: '', phone: '',
    companyName: '', industry: '', website: '',
  };
  const [reg, setReg] = useState(emptyReg);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const r = searchParams.get('role');
    if (r && ['student', 'college', 'company'].includes(r)) setSelectedRole(r);
  }, [searchParams]);

  useEffect(() => { setError(''); setSuccess(''); }, [selectedRole, authMode]);

  useEffect(() => {
    if (isAuthenticated && user) toPortal(user.role);
  }, [isAuthenticated, user]);

  const toPortal = (role) => {
    const from = location.state?.from?.pathname;
    if (from && !from.includes('/login')) { navigate(from, { replace: true }); return; }
    if (role === 'student') navigate('/student', { replace: true });
    else if (role === 'college') navigate('/college/dashboard', { replace: true });
    else if (role === 'company') navigate('/company/requirements', { replace: true });
    else navigate('/student', { replace: true });
  };

  const setF = (k, v) => setReg(p => ({ ...p, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!loginEmail.trim() || !loginPass) { setError('Please enter your email and password.'); return; }
    const res = await login(loginEmail, loginPass, selectedRole);
    if (res.success) toPortal(res.user.role);
    else setError(res.message || 'Invalid credentials. Please try again.');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (reg.password !== reg.confirmPassword) { setError('Passwords do not match.'); return; }
    if (reg.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    const res = await register(reg, selectedRole);
    if (res.success) {
      setSuccess('Account created! Redirecting to your dashboard…');
      setTimeout(() => toPortal(res.user.role), 700);
    } else setError(res.message || 'Failed to create account. Please try again.');
  };

  const handleDemo = async (role) => {
    setError('');
    const u = await loginAsDemo(role);
    toPortal(u.role);
  };

  /* ── Role config ── */
  const roles = {
    student: {
      label: 'STUDENT', icon: '🎓', desc: 'Find your skill gap',
      emailLabel: 'College Email', emailPH: 'Enter your college email',
      passLabel: 'Password', passPH: 'Create password',
      helper: 'Use your college-verified email to connect your profile with your college.',
      loginBtn: 'Login as Student', regBtn: 'Create Student Account',
      regTitle: 'Create Your Student Profile',
      regSub: 'Build your profile to personalize your career readiness journey.',
      demoEmail: 'student@abccollege.edu', demoPass: 'student123',
    },
    college: {
      label: 'COLLEGE', icon: '🏫', desc: 'Track campus skills',
      emailLabel: 'Official College Email', emailPH: 'Enter official college email',
      passLabel: 'Password', passPH: 'Create password',
      helper: 'Use your official college email to access campus skill insights.',
      loginBtn: 'Login as College', regBtn: 'Create College Account',
      regTitle: 'Register Your College',
      regSub: 'Placement-cell access for managing campus skill insights.',
      demoEmail: 'college@abccollege.edu', demoPass: 'college123',
    },
    company: {
      label: 'COMPANY', icon: '💼', desc: 'Define job skills',
      emailLabel: 'Official Company Email', emailPH: 'Enter official company email',
      passLabel: 'Password', passPH: 'Create password',
      helper: 'Use your official company email to access hiring requirements and verified candidate matches.',
      loginBtn: 'Login as Company', regBtn: 'Create Company Account',
      regTitle: 'Create Company Account',
      regSub: 'Company profile and hiring requirements access.',
      demoEmail: 'company@technova.com', demoPass: 'company123',
    },
  };

  const cfg = roles[selectedRole];

  /* ── Page wrapper ── */
  const pageStyle = {
    minHeight: '100vh',
    background: '#EEF2F7',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    padding: '32px 16px',
    boxSizing: 'border-box',
  };

  /* ── Card ── */
  const cardStyle = (wide) => ({
    width: '100%',
    maxWidth: wide ? 720 : 480,
    background: '#fff',
    borderRadius: 18,
    padding: '36px 40px',
    boxShadow: '0 4px 24px rgba(15,23,42,.08)',
    boxSizing: 'border-box',
  });

  /* ── Role card ── */
  const roleCard = (key) => {
    const active = selectedRole === key;
    return {
      flex: 1,
      padding: '14px 16px',
      borderRadius: 12,
      border: active ? '2px solid #2563EB' : '1.5px solid #D8E0EA',
      background: active ? '#EFF6FF' : '#F8FAFC',
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit',
      transition: 'all .15s',
      outline: 'none',
    };
  };

  return (
    <div style={pageStyle}>

      {/* ══════════════════════════════════════════
          LOGIN VIEW
      ══════════════════════════════════════════ */}
      {authMode === 'login' && (
        <div style={cardStyle(false)}>

          {/* Branding */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 42, height: 42, background: '#2563EB', borderRadius: 10,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#fff', fontSize: 10.5, letterSpacing: '.03em', marginBottom: 12,
            }}>C2C</div>
            <h1 style={{ margin: '0 0 5px', fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
              CAMPUS2CAREER AI
            </h1>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748B' }}>
              From Skill Gaps to Industry Readiness
            </p>
          </div>

          {/* Role Selector */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {Object.entries(roles).map(([key, r]) => (
              <button key={key} style={roleCard(key)}
                onClick={() => setSelectedRole(key)}
                type="button"
              >
                <div style={{ fontSize: 18, marginBottom: 5 }}>{r.icon}</div>
                <div style={{
                  fontSize: 12.5, fontWeight: 700,
                  color: selectedRole === key ? '#1E40AF' : '#1E293B',
                  marginBottom: 2,
                }}>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                <div style={{
                  fontSize: 11, color: selectedRole === key ? '#3B82F6' : '#64748B',
                }}>{r.desc}</div>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 4px' }}>
              {cfg.label}
            </p>
            <h2 style={{ margin: '0 0 18px', fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
              Login
            </h2>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <TInput
                label={cfg.emailLabel}
                type="email"
                value={loginEmail}
                onChange={setLoginEmail}
                placeholder={cfg.emailPH}
                required
              />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Password</label>
                  <button type="button"
                    onClick={() => alert('Password reset link sent to registered email.')}
                    style={{ fontSize: 12, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, fontWeight: 500 }}
                  >Forgot password?</button>
                </div>
                <TInput label="" type="password" value={loginPass} onChange={setLoginPass} placeholder="Enter your password" required />
              </div>

              <p style={{ fontSize: 12, color: '#94A3B8', margin: '-4px 0 0' }}>
                {cfg.helper}
              </p>

              {error && <Msg type="error" text={error} />}

              <PBtn type="submit" loading={isLoading}>{cfg.loginBtn} →</PBtn>
            </form>
          </div>

          <OBtn onClick={() => { setAuthMode('register'); setReg(emptyReg); setError(''); setSuccess(''); }}>
            {cfg.regBtn}
          </OBtn>

          {/* Demo */}
          <div style={{
            marginTop: 20, padding: '12px 14px',
            background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 9,
          }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 7px' }}>
              Demo Login
            </p>
            <div style={{ fontSize: 12, color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '4px 20px', marginBottom: 8 }}>
              <span><span style={{ color: '#94A3B8' }}>{cfg.label.charAt(0) + cfg.label.slice(1).toLowerCase()}:</span>{' '}
                <code style={{ color: '#334155' }}>{cfg.demoEmail}</code></span>
              <span><span style={{ color: '#94A3B8' }}>Password:</span>{' '}
                <code style={{ color: '#334155' }}>{cfg.demoPass}</code></span>
            </div>
            <button type="button" onClick={() => handleDemo(selectedRole)}
              style={{
                fontSize: 12, fontWeight: 600, color: '#2563EB',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', padding: 0,
                textDecoration: 'underline', textUnderlineOffset: 2,
              }}
            >
              Use {cfg.label.charAt(0) + cfg.label.slice(1).toLowerCase()} demo →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          REGISTRATION VIEW
      ══════════════════════════════════════════ */}
      {authMode === 'register' && (
        <div style={cardStyle(true)}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 5px' }}>
              {cfg.label}
            </p>
            <h2 style={{ margin: '0 0 5px', fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
              {cfg.regTitle}
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
              {cfg.regSub}
            </p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* ── STUDENT ── */}
            {selectedRole === 'student' && (<>
              <TInput label="Full Name" value={reg.name} onChange={v => setF('name', v)} placeholder="Enter your full name" required />

              <G2>
                <TInput label="College Name" value={reg.collegeName} onChange={v => setF('collegeName', v)} placeholder="Enter your college name" required />
                <TInput label="Branch" value={reg.branch} onChange={v => setF('branch', v)} placeholder="e.g. Computer Science" required />
              </G2>

              <G2>
                <TInput
                  label="College Email"
                  type="email"
                  value={reg.email}
                  onChange={v => setF('email', v)}
                  placeholder="name@college.edu"
                  required
                  note={reg.email && reg.email.includes('@') ? '✓ College email recognized' : undefined}
                />
                <TSelect
                  label="Year"
                  value={reg.year}
                  onChange={v => setF('year', v)}
                  options={[
                    { value: '1st Year', label: '1st Year' },
                    { value: '2nd Year', label: '2nd Year' },
                    { value: '3rd Year', label: '3rd Year' },
                    { value: 'Final Year', label: 'Final Year' },
                  ]}
                />
              </G2>

              <TSelect
                label="Target Career Role"
                value={reg.targetRole}
                onChange={v => setF('targetRole', v)}
                options={[
                  { value: 'Data Analyst', label: 'Data Analyst' },
                  { value: 'AI/ML Engineer', label: 'AI/ML Engineer' },
                  { value: 'Cloud DevOps Engineer', label: 'Cloud DevOps Engineer' },
                  { value: 'Full Stack Developer', label: 'Full Stack Developer' },
                  { value: 'Cybersecurity Analyst', label: 'Cybersecurity Analyst' },
                  { value: 'Business Intelligence Analyst', label: 'Business Intelligence Analyst' },
                  { value: 'Software Engineer', label: 'Software Engineer' },
                  { value: 'Product Manager', label: 'Product Manager' },
                  { value: 'Other', label: 'Other' },
                ]}
              />

              <G2>
                <TInput label="Password" type="password" value={reg.password} onChange={v => setF('password', v)} placeholder="Create password" required />
                <TInput label="Confirm Password" type="password" value={reg.confirmPassword} onChange={v => setF('confirmPassword', v)} placeholder="Re-enter password" required />
              </G2>
            </>)}

            {/* ── COLLEGE ── */}
            {selectedRole === 'college' && (<>
              <TInput label="College Name" value={reg.collegeName} onChange={v => setF('collegeName', v)} placeholder="Enter college name" required />

              <G2>
                <TInput label="Official College Email" type="email" value={reg.email} onChange={v => setF('email', v)} placeholder="placement@college.edu" required />
                <TInput label="College Email Domain" value={reg.collegeDomain} onChange={v => setF('collegeDomain', v)} placeholder="e.g. @abccollege.edu" required />
              </G2>

              <G2>
                <TInput label="Placement Officer Name" value={reg.name} onChange={v => setF('name', v)} placeholder="Enter officer name" required />
                <TInput label="Designation" value={reg.designation} onChange={v => setF('designation', v)} placeholder="e.g. Placement Officer" required />
              </G2>

              <G2>
                <TInput label="Phone Number" type="tel" value={reg.phone} onChange={v => setF('phone', v)} placeholder="+91 XXXXX XXXXX" required />
                <TInput label="Password" type="password" value={reg.password} onChange={v => setF('password', v)} placeholder="Create password" required />
              </G2>

              <TInput label="Confirm Password" type="password" value={reg.confirmPassword} onChange={v => setF('confirmPassword', v)} placeholder="Re-enter password" required />
            </>)}

            {/* ── COMPANY ── */}
            {selectedRole === 'company' && (<>
              <TInput label="Company Name" value={reg.companyName} onChange={v => setF('companyName', v)} placeholder="Enter company name" required />

              <G2>
                <TInput label="Official Company Email" type="email" value={reg.email} onChange={v => setF('email', v)} placeholder="hr@company.com" required />
                <TInput label="HR / Recruiter Name" value={reg.name} onChange={v => setF('name', v)} placeholder="Enter your full name" required />
              </G2>

              <G2>
                <TInput label="Designation" value={reg.designation} onChange={v => setF('designation', v)} placeholder="e.g. Talent Acquisition" required />
                <TInput label="Industry" value={reg.industry} onChange={v => setF('industry', v)} placeholder="e.g. Information Technology" required />
              </G2>

              <G2>
                <TInput label="Company Website" type="url" value={reg.website} onChange={v => setF('website', v)} placeholder="www.company.com" required />
                <TInput label="Password" type="password" value={reg.password} onChange={v => setF('password', v)} placeholder="Create password" required />
              </G2>

              <TInput label="Confirm Password" type="password" value={reg.confirmPassword} onChange={v => setF('confirmPassword', v)} placeholder="Re-enter password" required />
            </>)}

            {error && <Msg type="error" text={error} />}
            {success && <Msg type="success" text={success} />}

            <PBtn type="submit" loading={isLoading}>Create Account</PBtn>
          </form>

          {/* Back to login */}
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#64748B' }}>
            Already have an account?{' '}
            <button type="button"
              onClick={() => { setAuthMode('login'); setError(''); setSuccess(''); }}
              style={{ color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: 0 }}
            >Sign in →</button>
          </p>
        </div>
      )}

      {/* Footer */}
      <p style={{ marginTop: 22, fontSize: 11.5, color: '#94A3B8', textAlign: 'center' }}>
        © 2026 Campus2Career AI · Enterprise Placement Intelligence
      </p>
    </div>
  );
}
