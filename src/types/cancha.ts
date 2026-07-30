export interface CanchaFoto {
  id: number;
  url: string;
  esPrincipal: boolean;
  orden: number;
}

export interface CanchaListItem {
  id: number;
  clubId: number;
  nombre: string;
  tipoCancha: string;
  precioHora: number;
  horarioInicio: string;
  horarioFin: string;
  duracionMinimaMinutos: number;
  activa: boolean;
  fotos: CanchaFoto[];
  horariosTarifasCount?: number;
  bloqueosActivosCount?: number;
}

export interface CrearCanchaPayload {
  clubId: number;
  nombre: string;
  tipoCancha: number;
  precioHora: number;
  horarioInicio: string;
  horarioFin: string;
  duracionMinimaMinutos: number;
  activa: boolean;
}
// Mapeo basado en el Enum de C#
export const TIPO_CANCHA_MAP: Record<number, string> = {
  0: 'Pádel Doble',
  1: 'Pádel Single',
  2: 'Futbolito 7',
  3: 'Futbolito 8',
  4: 'Tenis',
  5: 'Multicancha',
  6: 'Otro',
};

// Lista para iterar en los <MenuItem> de tu formulario
export const TIPOS_CANCHA_OPTIONS = [
  { value: 0, label: 'Pádel Doble' },
  { value: 1, label: 'Pádel Single' },
  { value: 2, label: 'Futbolito 7' },
  { value: 3, label: 'Futbolito 8' },
  { value: 4, label: 'Tenis' },
  { value: 5, label: 'Multicancha' },
  { value: 6, label: 'Otro' },
];