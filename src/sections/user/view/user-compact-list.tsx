import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { UserTableRow } from '../user-table-row';
import type { UsuarioListItem } from 'src/types/usuario';

type UserCompactListProps = {
  loading: boolean;
  users: UsuarioListItem[];
  dataFiltered: UsuarioListItem[];
  page: number;
  rowsPerPage: number;
  selected: number[];
  filterName: string;
  notFound: boolean;
  onSelectRow: (id: number) => void;
  onEditRow: (id: number) => void;
  onDeleteRow: (id: number) => Promise<void> | void;
};

export function UserCompactList({
  loading,
  users,
  dataFiltered,
  page,
  rowsPerPage,
  selected,
  filterName,
  notFound,
  onSelectRow,
  onEditRow,
  onDeleteRow,
}: UserCompactListProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {dataFiltered
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row) => (
              <UserTableRow
                key={row.id}
                compact
                row={row}
                selected={selected.includes(row.id)}
                onSelectRow={() => onSelectRow(row.id)}
                onEditRow={() => onEditRow(row.id)}
                onDeleteRow={() => onDeleteRow(row.id)}
              />
            ))}

          {!loading && !users.length && (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No hay usuarios registrados.
              </Typography>
            </Box>
          )}

          {!loading && notFound && (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No se encontraron usuarios con “{filterName}”.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
