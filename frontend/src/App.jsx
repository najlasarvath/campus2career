import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PortalPlaceholderPage from './pages/PortalPlaceholderPage';
import StudentLayout from './layouts/StudentLayout';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import RoleMatchPage from './pages/student/RoleMatchPage';
import LearnPage from './pages/student/LearnPage';
import AssistantPage from './pages/student/AssistantPage';
import MockInterviewPage from './pages/student/MockInterviewPage';
import ProgressPage from './pages/student/ProgressPage';
import CertificatePage from './pages/student/CertificatePage';
import CollegeLayout from './layouts/CollegeLayout';
import CollegeDashboardPage from './pages/college/CollegeDashboardPage';
import CollegeStudentsPage from './pages/college/CollegeStudentsPage';
import CollegeSkillsPage from './pages/college/CollegeSkillsPage';
import CollegeCertificatesPage from './pages/college/CollegeCertificatesPage';
import CollegeAlertsPage from './pages/college/CollegeAlertsPage';
import CompanyLayout from './layouts/CompanyLayout';
import CompanyDashboardPage from './pages/company/CompanyDashboardPage';
import CompanyRequirementsPage from './pages/company/CompanyRequirementsPage';
import CompanyNotificationsPage from './pages/company/CompanyNotificationsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Navigate to="/register/student" replace />} />
      <Route path="/register/student" element={<RegisterPage role="student" />} />
      <Route path="/register/college" element={<RegisterPage role="college" />} />
      <Route path="/register/company" element={<RegisterPage role="company" />} />

      <Route
        path="/student"
        element={
          <StudentLayout>
            <StudentDashboardPage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/role-match"
        element={
          <StudentLayout>
            <RoleMatchPage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/learn"
        element={
          <StudentLayout>
            <LearnPage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/assistant"
        element={
          <StudentLayout>
            <AssistantPage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/mock-interview"
        element={
          <StudentLayout>
            <MockInterviewPage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/progress"
        element={
          <StudentLayout>
            <ProgressPage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/certificate"
        element={
          <StudentLayout>
            <CertificatePage />
          </StudentLayout>
        }
      />

      <Route
        path="/college"
        element={
          <CollegeLayout>
            <CollegeDashboardPage />
          </CollegeLayout>
        }
      />
      <Route
        path="/college/students"
        element={
          <CollegeLayout>
            <CollegeStudentsPage />
          </CollegeLayout>
        }
      />
      <Route
        path="/college/skills"
        element={
          <CollegeLayout>
            <CollegeSkillsPage />
          </CollegeLayout>
        }
      />
      <Route
        path="/college/certificates"
        element={
          <CollegeLayout>
            <CollegeCertificatesPage />
          </CollegeLayout>
        }
      />
      <Route
        path="/college/alerts"
        element={
          <CollegeLayout>
            <CollegeAlertsPage />
          </CollegeLayout>
        }
      />

      <Route
        path="/company"
        element={
          <CompanyLayout>
            <CompanyDashboardPage />
          </CompanyLayout>
        }
      />
      <Route
        path="/company/requirements"
        element={
          <CompanyLayout>
            <CompanyRequirementsPage />
          </CompanyLayout>
        }
      />
      <Route
        path="/company/notifications"
        element={
          <CompanyLayout>
            <CompanyNotificationsPage />
          </CompanyLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
