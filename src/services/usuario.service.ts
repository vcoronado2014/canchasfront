import { api } from 'src/api/axios'; // O tu instancia configurada de axios
import type {
  UsuarioListItem,
  CrearUsuarioPayload,
  ActualizarUsuarioPayload,
} from 'src/types/usuario';

const API_URL = '/usuarios';

/**
 * Obtener listado de usuarios (con filtro opcional por clubId para SuperAdmin)
 */
export const getUsuarios = async (clubId?: number): Promise<UsuarioListItem[]> => {
  const response = await api.get<UsuarioListItem[]>(API_URL, {
    params: clubId ? { clubId } : {},
  });
  return response.data;
};

/**
 * Obtener un usuario por su ID
 */
export const getUsuarioById = async (id: number): Promise<UsuarioListItem> => {
  const response = await api.get<UsuarioListItem>(`${API_URL}/${id}`);
  return response.data;
};

/**
 * Crear un nuevo usuario
 */
export const createUsuario = async (payload: CrearUsuarioPayload): Promise<UsuarioListItem> => {
  const response = await api.post<UsuarioListItem>(API_URL, payload);
  return response.data;
};

/**
 * Actualizar datos de un usuario existente
 */
export const updateUsuario = async (
  id: number,
  payload: ActualizarUsuarioPayload
): Promise<void> => {
  await api.put(`${API_URL}/${id}`, payload);
};

/**
 * Eliminar usuario por ID
 */
export const deleteUsuario = async (id: number): Promise<void> => {
  await api.delete(`${API_URL}/${id}`);
};