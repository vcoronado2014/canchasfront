import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { ClubTableRow } from '../club-table-row';
import type { ClubProps } from '../club-table-row';
import type { ClubListItem } from 'src/types/club';

type ClubCompactListProps = {
  loading: boolean;
  clubs: ClubListItem[];
  dataFiltered: ClubProps[];
  page: number;
  rowsPerPage: number;
  selected: string[];
  filterName: string;
  notFound: boolean;
  onSelectRow: (id: string) => void;
  onDeleteRow: (id: number | string) => void;
  onRefreshList?: () => void;
};

export function ClubCompactList({
  loading,
  clubs,
  dataFiltered,
  page,
  rowsPerPage,
  selected,
  filterName,
  notFound,
  onSelectRow,
  onDeleteRow,
  onRefreshList,
}: ClubCompactListProps) {
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
              <ClubTableRow
                key={row.id}
                compact
                row={row}
                selected={selected.includes(row.id.toString())}
                onSelectRow={() => onSelectRow(row.id.toString())}
                onDeleteRow={() => onDeleteRow(row.id)}
                onRefreshList={onRefreshList}
              />
            ))}

          {!loading && !clubs.length && (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No hay clubes registrados.
              </Typography>
            </Box>
          )}

          {!loading && notFound && (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No se encontraron clubes con “{filterName}”.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
