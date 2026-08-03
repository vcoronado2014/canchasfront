// src/types/disponibilidad.ts

export interface CrearDisponibilidadRangoPayload {
  canchaId: number;
  fechaDesde: string; // "YYYY-MM-DDT00:00:00Z"
  fechaHasta: string; // "YYYY-MM-DDT00:00:00Z"
  horaInicio: string; // "HH:mm:ss" (Importante incluir segundos)
  horaFin: string;    // "HH:mm:ss"
  motivo?: string;
  diasSemana?: number[];
}

export interface DisponibilidadItem {
  id: number;
  canchaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string | null;
  cancha?: {
    id: number;
    nombre: string;
    clubId: number;
  };
}

export interface RespuestaCrearRango {
  message: string;
}