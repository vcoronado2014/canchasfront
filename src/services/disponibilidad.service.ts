import { api } from 'src/api/axios';
import type {
  CrearDisponibilidadRangoPayload,
  DisponibilidadItem,
} from 'src/types/reserva';

/**
 * Genera bloques de disponibilidad masiva por rango de fechas
 */
export async function crearDisponibilidadRango(
  payload: CrearDisponibilidadRangoPayload
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/Disponibilidad/rango', payload);
  return response.data;
}

/**
 * Actualiza un bloque de disponibilidad existente
 */
export async function updateDisponibilidad(
  id: number,
  payload: Partial<CrearDisponibilidadRangoPayload>
): Promise<DisponibilidadItem> {
  const response = await api.put<DisponibilidadItem>(`/Disponibilidad/${id}`, payload);
  return response.data;
}

/**
 * Lista los bloques de disponibilidad configurados para un club
 */
export async function getDisponividadesPorClub(
  clubId: number,
  fecha?: string
): Promise<DisponibilidadItem[]> {
  const response = await api.get<DisponibilidadItem[]>(`/Disponibilidad/club/${clubId}`, {
    params: fecha ? { fecha } : undefined,
  });
  return response.data;
}

/**
 * Elimina un bloque de disponibilidad específico
 */
export async function deleteDisponibilidad(id: number): Promise<void> {
  await api.delete(`/Disponibilidad/${id}`);
}