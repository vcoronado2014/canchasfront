import { Navigate } from 'react-router-dom';

import { useAuth } from '../use-auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    /* return <Navigate to="/sign-in" replace />; */
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}