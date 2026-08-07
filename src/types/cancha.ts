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
  7: 'Fútbol 11',
  8: 'Futbolito Techado',
  9: 'Raquetbol',
  10: 'Squash',
  11: 'Hockey',
  12: 'Multicancha Techada',
  13: 'Rugby',
  14: 'E-Karting',
  15: 'Tenis de Mesa',
  16: 'Fútbol 6',
  17: 'Voleibol',
  18: 'Handball',
  19: 'Fútbol 9',
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
  { value: 7, label: 'Fútbol 11' },
  { value: 8, label: 'Futbolito Techado' },
  { value: 9, label: 'Raquetbol' },
  { value: 10, label: 'Squash' },
  { value: 11, label: 'Hockey' },
  { value: 12, label: 'Multicancha Techada' },
  { value: 13, label: 'Rugby' },
  { value: 14, label: 'E-Karting' },
  { value: 15, label: 'Tenis de Mesa' },
  { value: 16, label: 'Fútbol 6' },
  { value: 17, label: 'Voleibol' },
  { value: 18, label: 'Handball' },
  { value: 19, label: 'Fútbol 9' },
];