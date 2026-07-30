import { api } from 'src/api/axios';
import type { CanchaListItem, CrearCanchaPayload, CanchaFoto } from 'src/types/cancha';

// Obtener canchas de un club específico
export async function getCanchasByClub(clubId: number): Promise<CanchaListItem[]> {
  const response = await api.get(`/Canchas/club/${clubId}`);
  return response.data;
}

// Obtener detalle de una cancha
export async function getCanchaById(id: number): Promise<CanchaListItem> {
  const response = await api.get(`/Canchas/${id}`);
  return response.data;
}

// Crear cancha
export async function createCancha(payload: CrearCanchaPayload): Promise<{ id: number }> {
  const response = await api.post('/Canchas', payload);
  return response.data;
}

// Actualizar cancha
export async function updateCancha(id: number, payload: Omit<CrearCanchaPayload, 'clubId'>): Promise<void> {
  await api.put(`/Canchas/${id}`, payload);
}

// Eliminar cancha
export async function deleteCancha(id: number): Promise<void> {
  await api.delete(`/Canchas/${id}`);
}

// Subir Foto a Cancha (Multipart/Form-Data)
export async function uploadCanchaFoto(canchaId: number, file: File, esPrincipal = false): Promise<CanchaFoto> {
  const formData = new FormData();
  formData.append('Archivo', file);
  formData.append('EsPrincipal', String(esPrincipal));

  const response = await api.post(`/CanchasFotos/cancha/${canchaId}/subir`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// Eliminar Foto de Cancha
export async function deleteCanchaFoto(fotoId: number): Promise<void> {
  await api.delete(`/CanchasFotos/${fotoId}`);
}
