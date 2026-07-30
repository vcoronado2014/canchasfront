// ----------------------------------------------------------------------
// Estilo visual reutilizable para ocultar elementos accesibles (Accessibility)
// ----------------------------------------------------------------------
export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

// ----------------------------------------------------------------------
// Calcula el número de filas vacías para mantener la altura constante de la tabla
// ----------------------------------------------------------------------
export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

// ----------------------------------------------------------------------
// Comparador genérico descendente
// ----------------------------------------------------------------------
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// ----------------------------------------------------------------------
// Retorna la función comparadora para ordenamiento dinámico por columna
// ----------------------------------------------------------------------
export function getComparator<Key extends keyof any>(
  order: 'asc' | 'desc',
  orderBy: Key
): (
  a: { [key in Key]: any },
  b: { [key in Key]: any }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// ----------------------------------------------------------------------
// Función Genérica para Ordenar y Filtrar por Nombre/Texto cualquier entidad
// ----------------------------------------------------------------------
type ApplyFilterProps<T> = {
  inputData: T[];
  comparator: (a: T, b: T) => number;
  filterName?: string;
  filterProperty?: keyof T; // Nombre de la propiedad a filtrar (por defecto 'nombre')
};

export function applyFilter<T>({
  inputData,
  comparator,
  filterName = '',
  filterProperty = 'nombre' as keyof T,
}: ApplyFilterProps<T>): T[] {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let data = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    data = data.filter((item) => {
      const value = item[filterProperty];
      if (typeof value === 'string') {
        return value.toLowerCase().indexOf(filterName.toLowerCase()) !== -1;
      }
      return false;
    });
  }

  return data;
}

// ----------------------------------------------------------------------
// Formateador de Fecha Genérico
// ----------------------------------------------------------------------
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  // Usamos UTC para evitar desfases de zona horaria local
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
}