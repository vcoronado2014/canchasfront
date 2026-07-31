import type { Key, ReactNode } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { EmptyState } from 'src/components/tables/EmptyState';

type CompactListProps<T> = {
  loading: boolean;
  items: T[];
  page: number;
  rowsPerPage: number;
  emptyMessage: string;
  notFound: boolean;
  filterName: string;
  getItemKey: (item: T, index: number) => Key;
  renderItem: (item: T, index: number) => ReactNode;
};

export function CompactList<T>({
  loading,
  items,
  page,
  rowsPerPage,
  emptyMessage,
  notFound,
  filterName,
  getItemKey,
  renderItem,
}: CompactListProps<T>) {
  const visibleItems = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {visibleItems.map((item, index) => (
            <Box key={getItemKey(item, index)}>{renderItem(item, index)}</Box>
          ))}

          {!loading && (
            <>
              {notFound ? (
                <EmptyState compact message={`No se encontraron resultados con “${filterName}”.`} />
              ) : !items.length ? (
                <EmptyState compact message={emptyMessage} />
              ) : null}
            </>
          )}
        </>
      )}
    </Box>
  );
}
