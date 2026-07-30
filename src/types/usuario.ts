// Mapeo exacto según el Enum de C#
export enum RolUsuario {
  SuperAdmin = 0,
  ClubAdmin = 1,
  AgendaCreator = 2,
  CourtManager = 3,
  Cliente = 4,
}

// Mapa de nombres amigables para mostrar en tablas / badges
export const ROL_USUARIO_MAP: Record<number, string> = {
  [RolUsuario.SuperAdmin]: 'Super Admin',
  [RolUsuario.ClubAdmin]: 'Admin de Club',
  [RolUsuario.AgendaCreator]: 'Creador de Agendas',
  [RolUsuario.CourtManager]: 'Gestor de Canchas',
  [RolUsuario.Cliente]: 'Cliente / Jugador',
};

// Lista de opciones para iterar en los <MenuItem> de los selects del formulario
export const ROL_USUARIO_OPTIONS = [
  { value: RolUsuario.SuperAdmin, label: 'Super Admin' },
  { value: RolUsuario.ClubAdmin, label: 'Admin de Club' },
  { value: RolUsuario.AgendaCreator, label: 'Creador de Agendas' },
  { value: RolUsuario.CourtManager, label: 'Gestor de Canchas' },
  { value: RolUsuario.Cliente, label: 'Cliente / Jugador' },
];

// Interface del objeto Usuario devuelto por la API
export interface UsuarioListItem {
  id: number;
  email: string;
  nombre: string;
  telefono?: string;
  rol: RolUsuario;
  clubId?: number;
  nombreClub?: string;
}

// Payloads para peticiones POST y PUT
export interface CrearUsuarioPayload {
  email: string;
  nombre: string;
  telefono?: string;
  password: string;
  rol: RolUsuario;
  clubId?: number | null;
}

export interface ActualizarUsuarioPayload {
  email: string;
  nombre: string;
  telefono?: string;
  password?: string; // Opcional en actualización
  rol: RolUsuario;
  clubId?: number | null;
}