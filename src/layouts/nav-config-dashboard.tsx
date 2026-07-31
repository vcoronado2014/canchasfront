import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} />
);

export type NavItem = {
  title: string;
  path: string;
  icon?: React.ReactNode;
  info?: React.ReactNode;
  roles?: string[];
  children?: NavItem[];
};


export const navData: NavItem[] = [

  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('ic-analytics'),
    roles: [
      'SuperAdmin',
      'ClubAdmin',
      'AgendaCreator',
      'CourtManager'
    ],
  },


  {
    title: 'Clubes',
    path: '/dashboard/clubs',
    icon: icon('ic-company'),
    roles: [
      'SuperAdmin',
      'ClubAdmin',
      'AgendaCreator',
      'CourtManager'
    ],
    children: [
      {
        title: 'Listado',
        path: '/dashboard/clubs',
        icon: icon('ic-list'),
      },
      {
        title: 'Crear',
        path: '/dashboard/clubs/new',
        icon: icon('ic-add'),
        roles: [
          'SuperAdmin',
        ],
      },
    ],
  },

  {
    title: 'Canchas',
    path: '/dashboard/canchas',
    icon: icon('ic-company'),
    roles: [
      'SuperAdmin',
      'ClubAdmin',
      'AgendaCreator',
      'CourtManager'
    ],
    children: [
      {
        title: 'Listado',
        path: '/dashboard/canchas',
        icon: icon('ic-list'),
      },
      {
        title: 'Crear',
        path: '/dashboard/canchas/new',
        icon: icon('ic-add'),
        roles: [
          'SuperAdmin',
          'ClubAdmin',
        ],
      },
    ],
  },


  {
    title: 'Usuarios',
    path: '/dashboard/user',
    icon: icon('ic-user'),
    roles: [
      'SuperAdmin',
      'ClubAdmin'
    ],
    children: [
      {
        title: 'Listado',
        path: '/dashboard/user',
        icon: icon('ic-list'),
      },
      {
        title: 'Crear',
        path: '/dashboard/user/new',
        icon: icon('ic-add'),
      },
    ],
  },


  {
    title: 'Reservas',
    path: '/dashboard/reservations',
    icon: icon('ic-calendar'),
    roles: [
      'SuperAdmin',
      'ClubAdmin',
      'CourtManager'
    ],
  },

];