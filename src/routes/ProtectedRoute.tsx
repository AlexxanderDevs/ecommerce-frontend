import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  roles?: string[];
}

export function ProtectedRoute({ roles = [] }: ProtectedRouteProps) {
  const { loading, isAuthenticated, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0) {
    const allowed = roles.some((role) => hasRole(role));

    if (!allowed) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}