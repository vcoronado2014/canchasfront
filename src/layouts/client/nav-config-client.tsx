import { SvgColor } from 'src/components/svg-color';


const icon = (name:string) => (
    <SvgColor src={`/assets/icons/navbar/${name}.svg`} />
);

export type NavItemClient = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};


export const clientNavData: NavItemClient[] = [

    {
        title:'Inicio',
        path:'/cliente',
        icon:icon('ic-home'),
    },


    {
        title:'Disponibilidad',
        path:'/cliente/disponibilidad',
        icon:icon('ic-calendar'),
    },

    {
        title:'Mis reservas',
        path:'/cliente/mis-reservas',
        icon:icon('ic-calendar'),
    },


    {
        title:'Mi perfil',
        path:'/cliente/perfil',
        icon:icon('ic-user'),
    },

];