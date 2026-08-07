import { Navigate } from 'react-router-dom';
import { useAuth } from 'src/auth/use-auth';

type Props = {
  children: React.ReactNode;
};

export function GuestGuard({ children }: Props) {
  const { token, tipo } = useAuth();

  if (token) {
    if (tipo === "Cliente") {
      // 1. Revisamos si hay una ruta guardada previamente
      const redirectTo = sessionStorage.getItem('redirectTo');

      if (redirectTo) {
        // 2. Limpiamos la variable de sesión
        sessionStorage.removeItem('redirectTo');
        // 3. Redirigimos a la ruta deseada (/cliente/disponibilidad)
        return <Navigate to={redirectTo} replace />;
      }

      // 4. Si no hay nada guardado, va al inicio normal del cliente
      return <Navigate to="/cliente/disponibilidad" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
}