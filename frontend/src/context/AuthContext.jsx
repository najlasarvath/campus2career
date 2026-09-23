import { createContext, useContext, useState, useEffect } from 'react';
import apiClient, { tokenStorage } from '../services/api';

const AuthContext = createContext(null);

const USER_STORAGE_KEY = 'campus2career_auth_user';

// Demo credential accounts with explicit isDemo: true (clearly separated from real accounts)
export const DEMO_USERS = {
  student: {
    id: 'demo_student',
    legacyId: 'stu-8821',
    name: 'Alex Chen',
    email: 'student@campus2career.demo',
    password: 'student123',
    role: 'student',
    avatar: 'AC',
    title: 'Data Analyst Candidate',
    institution: 'Apex Institute of Technology',
    targetRole: 'Data Analyst',
    isDemo: true
  },
  college: {
    id: 'demo_college',
    name: 'College Admin',
    email: 'college@campus2career.demo',
    password: 'college123',
    role: 'college',
    avatar: 'AP',
    title: 'Placement Director',
    institution: 'Apex Institute of Technology',
    isDemo: true
  },
  company: {
    id: 'demo_company',
    name: 'Elena Rostova',
    email: 'company@campus2career.demo',
    password: 'company123',
    role: 'company',
    avatar: 'ER',
    title: 'Lead Technical Recruiter',
    institution: 'Acme Technologies',
    isDemo: true
  }
};

function formatInitials(name) {
  if (!name) return 'ST';
  return name.trim().split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function normalizeUserPayload(backendUser, role = 'student') {
  if (!backendUser) return null;
  const userRole = backendUser.role || role || 'student';
  const fullName = backendUser.fullName || backendUser.full_name || backendUser.name || (userRole === 'college' ? 'College Admin' : userRole === 'company' ? 'Recruiter' : 'Student Candidate');
  return {
    id: backendUser.id || backendUser.authUserId,
    authUserId: backendUser.authUserId || backendUser.id,
    name: fullName,
    fullName: fullName,
    email: backendUser.email,
    role: userRole,
    avatar: formatInitials(fullName),
    title: userRole === 'college' ? (backendUser.designation || 'Placement Director') : userRole === 'company' ? (backendUser.designation || 'Technical Recruiter') : (backendUser.targetRole || backendUser.target_role || 'Full Stack Developer'),
    targetRole: backendUser.targetRole || backendUser.target_role || 'Full Stack Developer',
    institution: backendUser.institution || backendUser.college || backendUser.collegeName || backendUser.companyName || (userRole === 'college' ? 'College Institution' : userRole === 'company' ? 'Partner Company' : 'University'),
    college: backendUser.college || backendUser.collegeName || '',
    collegeId: backendUser.collegeId || null,
    branch: backendUser.branch || '',
    year: backendUser.year || '',
    extractedSkills: backendUser.extractedSkills || backendUser.extracted_skills || [],
    isDemo: false
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Hydrate user session on app mount
  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      const token = tokenStorage.get();

      // If user was a demo user without a backend token, keep local session
      if (!token) {
        if (user && user.isDemo) {
          if (isMounted) setIsLoading(false);
          return;
        }
        if (isMounted) {
          setUser(null);
          localStorage.removeItem(USER_STORAGE_KEY);
          setIsLoading(false);
        }
        return;
      }

      // Verify token with backend GET /api/auth/me
      try {
        const response = await apiClient.get('/auth/me');
        if (isMounted && response && response.user) {
          const freshUser = normalizeUserPayload(response.user, user?.role || 'student');
          setUser(freshUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));
        }
      } catch (err) {
        console.warn('[AuthContext] Session expired or invalid:', err.message);
        if (isMounted) {
          tokenStorage.clear();
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync user state changes to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Storage write error:', err);
    }
  }, [user]);

  // Real API Login (with distinct demo separation)
  const login = async (email, password, role = 'student') => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const targetDemo = DEMO_USERS[role];

    // If explicit demo credentials are typed, use demo mode without hitting backend
    if (targetDemo && (
      (cleanEmail === targetDemo.email.toLowerCase() && password === targetDemo.password) ||
      (cleanEmail === 'student' && password === 'student123' && role === 'student') ||
      (cleanEmail === 'college' && password === 'college123' && role === 'college') ||
      (cleanEmail === 'company' && password === 'company123' && role === 'company')
    )) {
      tokenStorage.clear(); // Ensure no real JWT interferes with demo
      const sessionUser = { ...targetDemo };
      setUser(sessionUser);
      setIsLoading(false);
      return { success: true, user: sessionUser };
    }

    // Real API Login: POST /api/auth/login
    try {
      const response = await apiClient.post('/auth/login', {
        email: cleanEmail,
        password: password
      });

      if (!response.token) {
        throw new Error('Authentication token missing in response');
      }

      tokenStorage.set(response.token);

      const sessionUser = normalizeUserPayload(response.user, role);
      setUser(sessionUser);
      setIsLoading(false);
      return { success: true, user: sessionUser };
    } catch (err) {
      setIsLoading(false);
      return {
        success: false,
        message: err.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  // 1-Click Demo Login (Guaranteed isDemo: true, no JWT)
  const loginAsDemo = async (role = 'student') => {
    setIsLoading(true);
    tokenStorage.clear();
    const targetDemo = DEMO_USERS[role] || DEMO_USERS.student;
    const sessionUser = { ...targetDemo };
    setUser(sessionUser);
    setIsLoading(false);
    return sessionUser;
  };

  // Real API Registration: POST /api/auth/signup
  const register = async (formData, role = 'student') => {
    setIsLoading(true);
    const cleanEmail = (formData.email || '').trim().toLowerCase();

    try {
      const payload = {
        role,
        email: cleanEmail,
        password: formData.password,
        name: formData.name || formData.fullName,
        fullName: formData.name || formData.fullName,
        collegeName: formData.collegeName || formData.college || '',
        collegeDomain: formData.collegeDomain || '',
        designation: formData.designation || '',
        phone: formData.phone || '',
        companyName: formData.companyName || '',
        industry: formData.industry || '',
        website: formData.website || '',
        targetRole: formData.targetRole || 'Full Stack Developer',
        branch: formData.branch || '',
        year: formData.year || '1st Year'
      };

      const response = await apiClient.post('/auth/signup', payload);

      if (!response.token) {
        throw new Error('No authentication token received from registration');
      }

      tokenStorage.set(response.token);

      const sessionUser = normalizeUserPayload(response.user, role);
      setUser(sessionUser);
      setIsLoading(false);
      return { success: true, user: sessionUser };
    } catch (err) {
      setIsLoading(false);
      return {
        success: false,
        message: err.message || 'Registration failed. Please check your input.'
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout').catch(() => {});
    } finally {
      tokenStorage.clear();
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      isAuthenticated,
      isLoading,
      login,
      loginAsDemo,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
