import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const targetRoles = ['Data Analyst', 'Full Stack Developer', 'AI/ML Engineer', 'Backend Developer', 'Cloud Engineer'];

const defaultForm = {
  student: {
    fullName: '',
    collegeName: 'ABC College',
    collegeEmail: 'student@abccollege.edu',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    targetRole: 'AI/ML Engineer',
    password: '',
    confirmPassword: '',
  },
  college: {
    collegeName: 'ABC College',
    officialEmail: 'placement@abccollege.edu',
    domain: 'abccollege.edu',
    placementOfficer: 'Dr. Ahmed Khan',
    designation: 'Placement Officer',
    phoneNumber: '+91 XXXXX XXXXX',
    password: '',
    confirmPassword: '',
  },
  company: {
    companyName: 'TechNova',
    officialEmail: 'hr@technova.com',
    recruiterName: 'Rahul Sharma',
    designation: 'Talent Acquisition',
    industry: 'Information Technology',
    website: 'www.technova.com',
    password: '',
    confirmPassword: '',
  },
};

export default function RegisterPage({ role = 'student' }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm[role]);
  const [errors, setErrors] = useState({});
  const [successText, setSuccessText] = useState('');

  const roleMeta = useMemo(
    () => ({
      student: {
        title: 'Create Your Student Profile',
        subtitle: 'Student will be associated with ABC College',
        route: '/student',
      },
      college: {
        title: 'Register Your College',
        subtitle: 'Placement-cell access for managing campus skill insights',
        route: '/college',
      },
      company: {
        title: 'Create Company Account',
        subtitle: 'Company profile and hiring requirements access',
        route: '/company',
      },
    }),
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setSuccessText('');
  };

  const validate = () => {
    const nextErrors = {};

    if (role === 'student') {
      if (!form.fullName.trim()) nextErrors.fullName = 'Please enter your full name.';
      if (!form.collegeName.trim()) nextErrors.collegeName = 'Please enter your college name.';
      if (!form.collegeEmail.trim()) nextErrors.collegeEmail = 'Please enter your college email.';
      else if (!/\S+@\S+\.\S+/.test(form.collegeEmail)) nextErrors.collegeEmail = 'Please enter a valid email address.';
      if (!form.branch.trim()) nextErrors.branch = 'Please enter your branch.';
      if (!form.year) nextErrors.year = 'Please select your year.';
      if (!form.targetRole) nextErrors.targetRole = 'Please select a target role.';
      if (!form.password) nextErrors.password = 'Please create a password.';
      if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
      if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    if (role === 'college') {
      if (!form.collegeName.trim()) nextErrors.collegeName = 'Please enter the college name.';
      if (!form.officialEmail.trim()) nextErrors.officialEmail = 'Please enter the official college email.';
      if (!form.domain.trim()) nextErrors.domain = 'Please enter the college email domain.';
      if (!form.placementOfficer.trim()) nextErrors.placementOfficer = 'Please enter the placement officer name.';
      if (!form.password) nextErrors.password = 'Please create a password.';
      if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
      if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    if (role === 'company') {
      if (!form.companyName.trim()) nextErrors.companyName = 'Please enter the company name.';
      if (!form.officialEmail.trim()) nextErrors.officialEmail = 'Please enter the company email.';
      if (!form.recruiterName.trim()) nextErrors.recruiterName = 'Please enter the recruiter name.';
      if (!form.industry.trim()) nextErrors.industry = 'Please enter the company industry.';
      if (!form.password) nextErrors.password = 'Please create a password.';
      if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
      if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (role === 'student') {
      const collegeEmailRecognized = form.collegeEmail.toLowerCase().includes('@abccollege.edu');
      const payload = {
        role: 'student',
        name: form.fullName,
        college: form.collegeName,
        collegeEmail: form.collegeEmail,
        branch: form.branch,
        year: form.year,
        targetRole: form.targetRole,
        loggedIn: true,
      };
      localStorage.setItem('campus2career-user', JSON.stringify(payload));
      setSuccessText(collegeEmailRecognized ? '✓ College email recognized. Student will be associated with ABC College.' : '✓ Student profile created.');
      navigate('/student');
      return;
    }

    if (role === 'college') {
      const payload = {
        role: 'college',
        collegeName: form.collegeName,
        officialEmail: form.officialEmail,
        domain: form.domain,
        placementOfficer: form.placementOfficer,
        designation: form.designation,
        loggedIn: true,
      };
      localStorage.setItem('campus2career-user', JSON.stringify(payload));
      setSuccessText('✓ College registered successfully.');
      navigate('/college');
      return;
    }

    const payload = {
      role: 'company',
      companyName: form.companyName,
      officialEmail: form.officialEmail,
      recruiterName: form.recruiterName,
      designation: form.designation,
      industry: form.industry,
      website: form.website,
      loggedIn: true,
    };
    localStorage.setItem('campus2career-user', JSON.stringify(payload));
    setSuccessText('✓ Company account created successfully.');
    navigate('/company');
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">{role}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{roleMeta[role].title}</h1>
          <p className="mt-2 text-sm text-slate-500">{roleMeta[role].subtitle}</p>
        </div>

        {successText && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {successText}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          {role === 'student' && (
            <>
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
                <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Nehreen" />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="collegeName" className="mb-2 block text-sm font-medium text-slate-700">College Name</label>
                <input id="collegeName" name="collegeName" value={form.collegeName} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                {errors.collegeName && <p className="mt-1 text-sm text-red-600">{errors.collegeName}</p>}
              </div>

              <div>
                <label htmlFor="branch" className="mb-2 block text-sm font-medium text-slate-700">Branch</label>
                <input id="branch" name="branch" value={form.branch} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Computer Science & Engineering" />
                {errors.branch && <p className="mt-1 text-sm text-red-600">{errors.branch}</p>}
              </div>

              <div>
                <label htmlFor="collegeEmail" className="mb-2 block text-sm font-medium text-slate-700">College Email</label>
                <input id="collegeEmail" name="collegeEmail" type="email" value={form.collegeEmail} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="student@abccollege.edu" />
                {form.collegeEmail && form.collegeEmail.toLowerCase().includes('@abccollege.edu') && (
                  <p className="mt-1 text-sm text-emerald-600">✓ College email recognized</p>
                )}
                {errors.collegeEmail && <p className="mt-1 text-sm text-red-600">{errors.collegeEmail}</p>}
              </div>

              <div>
                <label htmlFor="year" className="mb-2 block text-sm font-medium text-slate-700">Year</label>
                <select id="year" name="year" value={form.year} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
                {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="targetRole" className="mb-2 block text-sm font-medium text-slate-700">Target Career Role</label>
                <select id="targetRole" name="targetRole" value={form.targetRole} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                  {targetRoles.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                {errors.targetRole && <p className="mt-1 text-sm text-red-600">{errors.targetRole}</p>}
              </div>

              <div>
                <label htmlFor="student-password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input id="student-password" name="password" type="password" value={form.password} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Create password" />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="student-confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
                <input id="student-confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Re-enter password" />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </>
          )}

          {role === 'college' && (
            <>
              <div className="sm:col-span-2">
                <label htmlFor="collegeName" className="mb-2 block text-sm font-medium text-slate-700">College Name</label>
                <input id="collegeName" name="collegeName" value={form.collegeName} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="ABC College" />
                {errors.collegeName && <p className="mt-1 text-sm text-red-600">{errors.collegeName}</p>}
              </div>

              <div>
                <label htmlFor="officialEmail" className="mb-2 block text-sm font-medium text-slate-700">Official College Email</label>
                <input id="officialEmail" name="officialEmail" type="email" value={form.officialEmail} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="placement@abccollege.edu" />
                {errors.officialEmail && <p className="mt-1 text-sm text-red-600">{errors.officialEmail}</p>}
              </div>

              <div>
                <label htmlFor="domain" className="mb-2 block text-sm font-medium text-slate-700">College Email Domain</label>
                <input id="domain" name="domain" value={form.domain} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="abccollege.edu" />
                {errors.domain && <p className="mt-1 text-sm text-red-600">{errors.domain}</p>}
              </div>

              <div>
                <label htmlFor="placementOfficer" className="mb-2 block text-sm font-medium text-slate-700">Placement Officer Name</label>
                <input id="placementOfficer" name="placementOfficer" value={form.placementOfficer} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Dr. Ahmed Khan" />
                {errors.placementOfficer && <p className="mt-1 text-sm text-red-600">{errors.placementOfficer}</p>}
              </div>

              <div>
                <label htmlFor="designation" className="mb-2 block text-sm font-medium text-slate-700">Designation</label>
                <input id="designation" name="designation" value={form.designation} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Placement Officer" />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
                <input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="+91 XXXXX XXXXX" />
              </div>

              <div>
                <label htmlFor="college-password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input id="college-password" name="password" type="password" value={form.password} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Create password" />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="college-confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
                <input id="college-confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Re-enter password" />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </>
          )}

          {role === 'company' && (
            <>
              <div className="sm:col-span-2">
                <label htmlFor="companyName" className="mb-2 block text-sm font-medium text-slate-700">Company Name</label>
                <input id="companyName" name="companyName" value={form.companyName} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="TechNova" />
                {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
              </div>

              <div>
                <label htmlFor="company-officialEmail" className="mb-2 block text-sm font-medium text-slate-700">Official Company Email</label>
                <input id="company-officialEmail" name="officialEmail" type="email" value={form.officialEmail} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="hr@technova.com" />
                {errors.officialEmail && <p className="mt-1 text-sm text-red-600">{errors.officialEmail}</p>}
              </div>

              <div>
                <label htmlFor="recruiterName" className="mb-2 block text-sm font-medium text-slate-700">HR / Recruiter Name</label>
                <input id="recruiterName" name="recruiterName" value={form.recruiterName} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Rahul Sharma" />
                {errors.recruiterName && <p className="mt-1 text-sm text-red-600">{errors.recruiterName}</p>}
              </div>

              <div>
                <label htmlFor="designation" className="mb-2 block text-sm font-medium text-slate-700">Designation</label>
                <input id="designation" name="designation" value={form.designation} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Talent Acquisition" />
              </div>

              <div>
                <label htmlFor="industry" className="mb-2 block text-sm font-medium text-slate-700">Industry</label>
                <input id="industry" name="industry" value={form.industry} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Information Technology" />
                {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
              </div>

              <div>
                <label htmlFor="website" className="mb-2 block text-sm font-medium text-slate-700">Company Website</label>
                <input id="website" name="website" value={form.website} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="www.technova.com" />
              </div>

              <div>
                <label htmlFor="company-password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input id="company-password" name="password" type="password" value={form.password} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Create password" />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="company-confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
                <input id="company-confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Re-enter password" />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </>
          )}

          <button type="submit" className="sm:col-span-2 mt-2 rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-700">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
