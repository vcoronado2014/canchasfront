// Enums alineados con el backend C#
export enum EstadoReserva {
  Pendiente = 0,
  Confirmada = 1,
  Completada = 2,
  Cancelada = 3,
}

export enum MetodoPago {
  Efectivo = 0,
  Debito = 1,
  Credito = 2,
  Transferencia = 3,
  PresencialServicio = 4,
}

export enum TipoCancha {
  Tenis = 0,
  Padel = 1,
  Futbol = 2,
  Otro = 3,
}

// Mapeos para mostrar etiquetas legibles en la interfaz de React
export const ESTADO_RESERVA_MAP: Record<EstadoReserva, string> = {
  [EstadoReserva.Pendiente]: 'Pendiente',
  [EstadoReserva.Confirmada]: 'Confirmada',
  [EstadoReserva.Completada]: 'Completada',
  [EstadoReserva.Cancelada]: 'Cancelada',
};

export const METODO_PAGO_MAP: Record<MetodoPago, string> = {
  [MetodoPago.Efectivo]: 'Efectivo',
  [MetodoPago.Debito]: 'Débito',
  [MetodoPago.Credito]: 'Crédito',
  [MetodoPago.Transferencia]: 'Transferencia',
  [MetodoPago.PresencialServicio]: 'Pago Presencial',
};

// Types para Disponibilidad / Oferta
export type SlotDisponibilidad = {
  fechaInicio: string; // ISO String
  fechaFin: string;    // ISO String
  precio: number;
  disponible: boolean;
  motivoOcupado?: string;
};

/* export type CanchaOferta = {
  canchaId: number;
  nombreCancha: string;
  tipoCancha: TipoCancha;
  precioHoraBase: number;
  fotoPrincipalUrl?: string;
  horariosDisponibles: SlotDisponibilidad[];
}; */

export type CanchaOferta = {
  // Datos del Club
  clubId: number;
  nombreClub: string;
  direccionClub: string;
  comunaNombre: string;
  regionNombre: string;
  fotoClubUrl?: string | null;

  // Datos de la Cancha
  canchaId: number;
  nombreCancha: string;
  tipoCancha: TipoCancha;
  precioHoraBase: number;
  fotoPrincipalUrl?: string | null;

  // Slots
  horariosDisponibles: SlotDisponibilidad[];
};

// Parámetros de búsqueda para la Landing Page
export type ConsultaDisponibilidadParams = {
  clubId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  lat?: number;
  lon?: number;
  radiusKm?: number;
  comuna?: string;
  region?: string;
};

// DTO para la creación de reserva online por parte del cliente
/* export type CrearReservaClientePayload = {
  canchaId: number;
  fechaInicio: string; // ISO String
  fechaFin: string;    // ISO String
  montoTotal: number;
  metodoPago: MetodoPago;
}; */

export interface BloqueReservaPayload {
  fechaInicio: string; // ISO String local
  fechaFin: string;    // ISO String local
}

// DTO para la creación de reserva online por parte del cliente (Lote de bloques)
export type CrearReservaClientePayload = {
  canchaId: number;
  montoTotal: number;
  metodoPago: MetodoPago;
  bloques: BloqueReservaPayload[];
};

// DTO para la creación de reserva presencial (Staff)
export type CrearReservaPresencialPayload = {
  canchaId: number;
  clienteId?: number;
  nombreClienteManual?: string;
  telefonoClienteManual?: string;
  fechaInicio: string; // ISO String: "2026-08-01T10:00:00Z"
  fechaFin: string;    // ISO String: "2026-08-01T11:00:00Z"
  montoTotal: number;
  pagado: boolean;
  metodoPago?: MetodoPago;
};

export type ActualizarReservaPayload = {
  canchaId?: number;
  clienteId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  montoTotal?: number;
  estado?: EstadoReserva;
  pagado?: boolean;
  metodoPago?: MetodoPago;
};

// Respuesta completa de la reserva obtenida desde la API
export type ReservaListItem = {
  id: number;
  canchaId: number;
  nombreCancha: string;
  clienteId?: number;
  nombreCliente?: string;
  fechaInicio: string;
  fechaFin: string;
  montoTotal: number;
  estado: EstadoReserva;
  metodoPago?: MetodoPago;
  montoPagado?: number;
  fechaPagoReal?: string;
  createdByUserId: number;
  creadoPorUsuario: string;
};

// Types para la gestión de Disponibilidad (DisponibilidadController)
export type CrearDisponibilidadRangoPayload = {
  canchaId: number;
  fechaDesde: string; // "YYYY-MM-DDT00:00:00Z"
  fechaHasta: string; // "YYYY-MM-DDT00:00:00Z"
  horaInicio: string; // "HH:mm:ss"
  horaFin: string;    // "HH:mm:ss"
  motivo?: string;
  diasSemana?: number[];
};

export type DisponibilidadItem = {
  id: number;
  canchaId: number;
  nombreCancha: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
};