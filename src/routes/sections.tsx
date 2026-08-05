import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { ClientLayout } from 'src/layouts/client';
import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard } from 'src/auth/guards/auth-guard';
import { GuestGuard } from 'src/auth/guards/guest-guard';
import { RoleGuard } from 'src/auth/guards/role-guard';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const LandingPage = lazy(
  () => import('src/pages/landing')
);

export const ClientHomePage = lazy(
  () => import('src/pages/client-home')
);
export const ClienteDisponibilidadPage = lazy(
  () => import('src/pages/cliente/disponibilidad')
);
export const ClienteMisReservasPage = lazy(
  () => import('src/pages/cliente/mis-reservas')
);

export const SignInPage = lazy(
  () => import('src/pages/sign-in')
);

export const SignUpPage = lazy(
  () => import('src/pages/sign-up')
);

export const Page404 = lazy(
  () => import('src/pages/page-not-found')
);
export const ClubPage = lazy(() => import('src/pages/club'));

export const ClubListPage = lazy(() => import('src/pages/club'));
export const ClubCreatePage = lazy(() => import('src/pages/club-create'));
export const ClubEditPage = lazy(() => import('src/pages/club-edit'));

//cancha
export const CanchaPage = lazy(() => import('src/pages/cancha'));
export const CanchaListPage = lazy(() => import('src/pages/cancha'));
export const CanchaCreatePage = lazy(() => import('src/pages/cancha-create'));
export const CanchaEditPage = lazy(() => import('src/pages/cancha-edit'));

//reservas
export const ReservaPage = lazy(() => import('src/pages/reserva'));
export const ReservaCreatePage = lazy(() => import('src/pages/reserva-create'));
export const ReservaEditPage = lazy(() => import('src/pages/reserva-edit'));
export const DisponibilidadPage = lazy(() => import('src/pages/disponibilidad'));
export const DisponibilidadCrearPage = lazy(() => import('src/pages/disponibilidad-crear'));

//users
export const UserCreatePage = lazy(() => import('src/pages/user-create'));
export const UserEditPage = lazy(() => import('src/pages/user-edit'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) =>
          varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: {
          bgcolor: 'text.primary',
        },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [

  //====================================================
  // STAFF
  //====================================================

  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <RoleGuard
          roles={[
            'SuperAdmin',
            'ClubAdmin',
            'AgendaCreator',
            'CourtManager',
          ]}
        >
          <DashboardLayout>
            <Suspense fallback={renderFallback()}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      //{ path: 'user', element: <UserPage /> },
      {
        path: 'user',
        children: [
          { index: true, element: <UserPage /> },
          {
            path: 'new',
            element: (
              <RoleGuard roles={['SuperAdmin', 'ClubAdmin']}>
                <UserCreatePage />
              </RoleGuard>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <RoleGuard roles={['SuperAdmin', 'ClubAdmin']}>
                <UserEditPage />
              </RoleGuard>
            ),
          },
        ],
      },
      //{ path: 'club', element: <ClubPage /> },
      {
        path: 'clubs',
        children: [
          { index: true, element: <ClubListPage /> },
          {
            path: 'new',
            element: (
              <RoleGuard roles={['SuperAdmin']}>
                <ClubCreatePage />
              </RoleGuard>
            ),
          },
          { path: ':id/edit', element: <ClubEditPage /> },
        ],
      },
      {
        path: 'canchas',
        children: [
          { index: true, element: <CanchaListPage /> },
          {
            path: 'new',
            element: (
              <RoleGuard roles={['SuperAdmin', 'ClubAdmin']}>
                <CanchaCreatePage />
              </RoleGuard>
            ),
          },
          { path: ':id/edit', element: <CanchaEditPage /> },
        ],
      },
      {
        path: 'reservations',
        children: [
          { index: true, element: <ReservaPage /> },
          {
            path: 'new',
            element: (
              <RoleGuard roles={['SuperAdmin', 'ClubAdmin', 'CourtManager']}>
                <ReservaCreatePage />
              </RoleGuard>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <RoleGuard roles={['SuperAdmin', 'ClubAdmin', 'CourtManager']}>
                <ReservaEditPage />
              </RoleGuard>
            ),
          },
        ],
      },
      {
        path: 'disponibilidad',
        element: (
          <RoleGuard roles={['SuperAdmin', 'ClubAdmin', 'AgendaCreator', 'CourtManager']}>
            <DisponibilidadPage />
          </RoleGuard>
        ),
      },
      {
        path: 'disponibilidad/crear',
        element: (
          <RoleGuard roles={['SuperAdmin', 'ClubAdmin', 'AgendaCreator', 'CourtManager']}>
            <DisponibilidadCrearPage />
          </RoleGuard>
        ),
      },
      { path: 'blog', element: <BlogPage /> },
    ],
  },

  //====================================================
  // CLIENTES
  //====================================================

  {
    path: 'cliente',
    element: (
      <AuthGuard>
        <RoleGuard roles={['Cliente']}>
          <ClientLayout>
            <Suspense fallback={renderFallback()}>
              <Outlet />
            </Suspense>
          </ClientLayout>
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <ClientHomePage />,
      },
      {
        path: 'disponibilidad',
        element: <ClienteDisponibilidadPage />,
      },
      {
        path: 'mis-reservas',
        element: <ClienteMisReservasPage />,
      },
    ],
  },

  //====================================================
  // PUBLICAS
  //====================================================

  {
    path: 'sign-in',
    element: (
      <GuestGuard>
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      </GuestGuard>
    ),
  },

  {
    path: 'sign-up',
    element: (
      <GuestGuard>
        <AuthLayout>
          <SignUpPage />
        </AuthLayout>
      </GuestGuard>
    ),
  },

  {
    path: '/',
    element: (
      <Suspense fallback={renderFallback()}>
        <LandingPage />
      </Suspense>
    ),
  },

  {
    path: '404',
    element: <Page404 />,
  },

  {
    path: '*',
    element: <Page404 />,
  },
];
