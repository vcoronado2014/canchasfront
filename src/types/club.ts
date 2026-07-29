export interface ClubListItem {
id: number;
  nombre: string;
  subdominio: string;
  direccion?: string | null;
  telefono?: string | null;
  estadoSuscripcion: EstadoSuscripcionClub;
  fechaProxVencimiento?: string | null;
  regionNombre?: string | null;
  comunaNombre?: string | null;
  owner?: string | null;
}
export enum EstadoSuscripcionClub {
  Activo = 0,
  PendientePago = 1,
  Suspendido = 2,
  Cancelado = 3,
}

export function getEstadoSuscripcionLabel(
  estado: EstadoSuscripcionClub
): string {
  switch (estado) {
    case EstadoSuscripcionClub.Activo:
      return 'Activo';

    case EstadoSuscripcionClub.PendientePago:
      return 'Pendiente de pago';

    case EstadoSuscripcionClub.Suspendido:
      return 'Suspendido';

    case EstadoSuscripcionClub.Cancelado:
      return 'Cancelado';

    default:
      return 'Desconocido';
  }
}
// --- TIPOS NUEVOS PARA CREACIÓN Y DETALLE ---

export interface CreateClubPayload {
  nombreClub: string;
  subdominio: string;
  direccion: string;
  telefono?: string;
  descripcion?: string;
  regionCodigo?: string;
  regionNombre?: string;
  comunaCodigo?: string;
  comunaNombre?: string;
  metodosPagoHabilitados: string[];
  estadoSuscripcion: EstadoSuscripcionClub;
  fechaProxVencimiento?: string | null;
}

export interface CreateClubResponse {
  clubId: number;
  mensaje: string;
}

export interface ClubOwnerInfo {
  id: number;
  email: string;
}

export interface ClubDetail {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string | null;
  regionCodigo?: string | null;
  regionNombre?: string | null;
  comunaCodigo?: string | null;
  comunaNombre?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  metodosPagoHabilitados?: string[];
  configPagos?: string | null;
  amenitiesJson?: string | null;
  fotoPrincipalUrl?: string | null;
  descripcion?: string | null;
  subdominio: string;
  estadoSuscripcion: EstadoSuscripcionClub;
  fechaProxVencimiento?: string | null;
  owner?: ClubOwnerInfo | null;
}

export interface UpdateClubPayload {
  nombreClub: string;
  subdominio: string;
  direccion: string;
  telefono?: string;
  descripcion?: string;
  regionCodigo?: string;
  regionNombre?: string;
  comunaCodigo?: string;
  comunaNombre?: string;
  metodosPagoHabilitados: string[];
  estadoSuscripcion: EstadoSuscripcionClub;
  fechaProxVencimiento?: string | null;
}