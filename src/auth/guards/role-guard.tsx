import { Navigate } from 'react-router-dom';

import { useAuth } from '../use-auth';

type Props = {
  children: React.ReactNode;
  roles: string[];
};

export function RoleGuard({
  children,
  roles,
}: Props) {

  const { tipo, user } = useAuth();

  const currentRole =
    tipo === 'Cliente'
      ? 'Cliente'
      : user?.rol;

  const autorizado =
    currentRole
      ? roles.includes(currentRole)
      : false;

  console.log('==========================');
  console.log('Tipo:', tipo);
  console.log('Rol:', user?.rol);
  console.log('CurrentRole:', currentRole);
  console.log('Roles permitidos:', roles);
  console.log('Autorizado:', autorizado);
  console.log('==========================');

  if (!currentRole) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!autorizado) {
    return <Navigate to="/404" replace />;
  }

  return children;
}