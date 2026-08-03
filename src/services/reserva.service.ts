import { api } from 'src/api/axios';
import type {
  CanchaOferta,
  ConsultaDisponibilidadParams,
  CrearReservaClientePayload,
  CrearReservaPresencialPayload,
  ReservaListItem,
} from 'src/types/reserva';

/**
 * PUBLICO / LANDING: Consulta la disponibilidad de canchas
 */
export async function getDisponibilidadPublica(
  params?: ConsultaDisponibilidadParams
): Promise<CanchaOferta[]> {
  const response = await api.get<CanchaOferta[]>('/Reservas/disponibilidad', {
    params,
  });
  return response.data;
}

/**
 * CLIENTE / STAFF: Consulta disponibilidad para un club específico
 */
export async function getDisponibilidadClub(
  clubId: number,
  fecha?: string
): Promise<CanchaOferta[]> {
  const params: ConsultaDisponibilidadParams = { clubId };

  if (fecha) {
    const [year, month, day] = fecha.split('-').map(Number);
    params.fechaInicio = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)).toISOString();
    params.fechaFin = new Date(Date.UTC(year, month - 1, day, 23, 59, 59)).toISOString();
  }

  const response = await api.get<CanchaOferta[]>('/Reservas/disponibilidad', {
    params,
  });
  return response.data;
}

/**
 * CLIENTE: Obtiene las reservas del cliente logueado
 */
export async function getMisReservas(
  clubId?: number,
  clienteId?: number
): Promise<ReservaListItem[]> {
  const response = await api.get<ReservaListItem[]>('/Reservas/mis-reservas', {
    params: { clubId, clienteId },
  });
  return response.data;
}

/**
 * STAFF / ADMIN: Obtiene las reservas del club
 */
export async function getReservasClub(
  clubId?: number,
  fechaInicio?: string,
  fechaFin?: string
): Promise<ReservaListItem[]> {
  const response = await api.get<ReservaListItem[]>('/Reservas', {
    params: { clubId, fechaInicio, fechaFin },
  });
  return response.data;
}

/**
 * CLIENTE: Crea una reserva online
 */
export async function crearReservaCliente(
  payload: CrearReservaClientePayload
): Promise<ReservaListItem> {
  const response = await api.post<ReservaListItem>('/Reservas/online', payload);
  return response.data;
}

/**
 * STAFF / ADMIN: Crea una reserva presencial en recepción
 */
export async function crearReservaPresencial(
  payload: CrearReservaPresencialPayload
): Promise<ReservaListItem> {
  const response = await api.post<ReservaListItem>('/Reservas/presencial', payload);
  return response.data;
}

/**
 * Cancela una reserva existente por ID
 */
export async function cancelarReserva(reservaId: number): Promise<void> {
  await api.delete(`/Reservas/${reservaId}/cancelar`);
}