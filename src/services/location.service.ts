// Types para Región y Comuna
export interface Region {
  id: number;
  codigo: string;
  nombre: string;
}

export interface Comuna {
  id: number;
  codigo: string;
  nombre: string;
  regionCodigo: string;
}

// Reemplaza 'axios' o tu instancia de fetch según configures tus peticiones
import { api } from "src/api/axios";

export async function getRegiones(): Promise<Region[]> {
  const response = await api.get('/location/regiones');
  return response.data;
}

export async function getComunas(regionCodigo: string): Promise<Comuna[]> {
  const response = await api.get(`/location/comunas/${regionCodigo}`);
  return response.data;
}