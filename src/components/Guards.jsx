import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PhoneVerificationModal from './PhoneVerificationModal';

// Guard for authenticated users
export function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and save previous path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const needsPhone = !profile?.phone || profile.phone.trim() === '';
  if (needsPhone) {
    return <PhoneVerificationModal />;
  }

  return children;
}

// Guard for agent-only administrative areas
export function AgentRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile?.is_agent) {
    // If user is not an agent, send them to properties page
    return <Navigate to="/properties" replace />;
  }

  return children;
}
