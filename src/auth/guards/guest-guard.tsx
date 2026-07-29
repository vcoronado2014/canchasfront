import { Navigate } from 'react-router-dom';

import { useAuth } from 'src/auth/use-auth';

type Props = {
  children: React.ReactNode;
};

export function GuestGuard({ children }: Props) {
  const { token, tipo } = useAuth();

/*   if (token) {
    if (tipo === 'Cliente') {
      return <Navigate to="/cliente" replace />;
    }

    return <Navigate to="/" replace />;
  } */
 if (token) {

    if (tipo === "Cliente") {
        return <Navigate to="/cliente" replace />;
    }

    return <Navigate to="/dashboard" replace />;
}

  return children;
}