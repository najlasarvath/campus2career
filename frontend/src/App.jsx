import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StudentProvider } from './context/StudentContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortalProvider, usePortal } from './context/PortalContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import AssistantChat from './components/assistant/AssistantChat';

// Auth / Landing Page
import LoginPage from './pages/LoginPage';

// Student Portal Pages (Existing)
import DashboardPage from './pages/DashboardPage';
import RoleMatchPage from './pages/RoleMatchPage';
import RoadmapPage from './pages/RoadmapPage';
import ResourcesPage from './pages/ResourcesPage';
import InterviewPage from './pages/InterviewPage';

// College Portal Pages (New)
import CollegeDashboardPage from './pages/college/CollegeDashboardPage';
import CollegeHeatmapPage from './pages/college/CollegeHeatmapPage';
import CollegeWorkshopsPage from './pages/college/CollegeWorkshopsPage';
import CollegeCertificatesPage from './pages/college/CollegeCertificatesPage';

// Company Portal Pages (New)
import CompanyRequirementsPage from './pages/company/CompanyRequirementsPage';
import CompanyNotificationsPage from './pages/company/CompanyNotificationsPage';

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role === 'college') return <Navigate to="/college/dashboard" replace />;
  if (role === 'company') return <Navigate to="/company/requirements" replace />;
  return <Navigate to="/student" replace />;
}

function AppContent() {
  const location = useLocation();
  const { activePortal } = usePortal();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F4] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Persistent Multi-Portal Top Navigation */}
      <Navbar />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Default Root Redirect */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ==================== 1. STUDENT PORTAL ROUTES ==================== */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student', 'college']}>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          {/* Legacy student routes (100% backward compatible) */}
          <Route path="/role-match" element={
            <ProtectedRoute allowedRoles={['student', 'college']}>
              <RoleMatchPage />
            </ProtectedRoute>
          } />
          <Route path="/roadmap" element={
            <ProtectedRoute allowedRoles={['student', 'college']}>
              <RoadmapPage />
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute allowedRoles={['student', 'college']}>
              <ResourcesPage />
            </ProtectedRoute>
          } />
          <Route path="/interview" element={
            <ProtectedRoute allowedRoles={['student', 'college']}>
              <InterviewPage />
            </ProtectedRoute>
          } />

          {/* New /student/* aliases */}
          <Route path="/student/role-match" element={
            <ProtectedRoute allowedRoles={['student', 'college']}>
              <RoleMatchPage />
            </ProtectedRoute>
          } />
          <Route path="/student/roadmap" element={
            <ProtectedRoute allowedRoles={['student', 'college']}>
              <RoadmapPage />
            </ProtectedRoute>
          } />
          <Route path="/student/resources" element={
            <ProtectedRoute allowedRoles={['student', 'college']}>
              <ResourcesPage />
            </ProtectedRoute>
          } />
          <Route path="/student/interview" element={
            <ProtectedRoute allowedRoles={['student', 'college']}>
              <InterviewPage />
            </ProtectedRoute>
          } />

          {/* ==================== 2. COLLEGE PORTAL ROUTES (Students have read-only access) ==================== */}
          <Route path="/college" element={
            <ProtectedRoute allowedRoles={['college', 'student']}>
              <Navigate to="/college/dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/college/dashboard" element={
            <ProtectedRoute allowedRoles={['college', 'student']}>
              <CollegeDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/college/heatmap" element={
            <ProtectedRoute allowedRoles={['college', 'student']}>
              <CollegeHeatmapPage />
            </ProtectedRoute>
          } />
          <Route path="/college/workshops" element={
            <ProtectedRoute allowedRoles={['college', 'student']}>
              <CollegeWorkshopsPage />
            </ProtectedRoute>
          } />
          <Route path="/college/certificates" element={
            <ProtectedRoute allowedRoles={['college', 'student']}>
              <CollegeCertificatesPage />
            </ProtectedRoute>
          } />


          {/* ==================== 3. COMPANY PORTAL ROUTES ==================== */}
          <Route path="/company" element={
            <ProtectedRoute allowedRoles={['company']}>
              <Navigate to="/company/requirements" replace />
            </ProtectedRoute>
          } />
          <Route path="/company/requirements" element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyRequirementsPage />
            </ProtectedRoute>
          } />
          <Route path="/company/notifications" element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyNotificationsPage />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating AI Career Assistant (for Student portal) */}
      {activePortal === 'student' && <AssistantChat />}

      {/* App Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-800 font-semibold tracking-tight">Campus2Career Unified Enterprise</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium capitalize">
              {activePortal === 'student' ? 'Student Intelligence Portal' : activePortal === 'college' ? 'Institutional Placement Intelligence' : 'Employer Recruitment Console'}
            </span>
          </div>
          <div className="text-slate-500 flex items-center space-x-4">
            <span className="font-medium text-slate-600">Enterprise Edition 2.4</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center space-x-1.5">
              <span>Status:</span>
              <strong className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">Operational (99.98%)</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StudentProvider>
          <PortalProvider>
            <AppContent />
          </PortalProvider>
        </StudentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

