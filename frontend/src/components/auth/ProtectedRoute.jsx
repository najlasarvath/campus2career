import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const defaultRole = allowedRoles?.[0] || 'student';
    return <Navigate to={`/login?role=${defaultRole}`} state={{ from: location }} replace />;
  }

  // If user role is not allowed on this route, redirect to their own portal
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') return <Navigate to="/student" replace />;
    if (user.role === 'college') return <Navigate to="/college/dashboard" replace />;
    if (user.role === 'company') return <Navigate to="/company/requirements" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
