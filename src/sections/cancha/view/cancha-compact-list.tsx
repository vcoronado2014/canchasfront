import { CompactList } from 'src/components/compact-list';
import { CanchaTableRow } from '../cancha-table-row';
import type { CanchaListItem } from 'src/types/cancha';

type CanchaCompactListProps = {
  loading: boolean;
  canchas: CanchaListItem[];
  dataFiltered: CanchaListItem[];
  page: number;
  rowsPerPage: number;
  selected: string[];
  filterName: string;
  notFound: boolean;
  onSelectRow: (id: string) => void;
  onDeleteRow: (id: number | string) => void;
};

export function CanchaCompactList({
  loading,
  canchas,
  dataFiltered,
  page,
  rowsPerPage,
  selected,
  filterName,
  notFound,
  onSelectRow,
  onDeleteRow,
}: CanchaCompactListProps) {
  return (
    <CompactList
      loading={loading}
      items={dataFiltered}
      page={page}
      rowsPerPage={rowsPerPage}
      emptyMessage="No hay canchas registradas."
      notFound={notFound}
      filterName={filterName}
      getItemKey={(row) => row.id}
      renderItem={(row) => (
        <CanchaTableRow
          compact
          row={row}
          selected={selected.includes(row.id.toString())}
          onSelectRow={() => onSelectRow(row.id.toString())}
          onDeleteRow={() => onDeleteRow(row.id)}
        />
      )}
    />
  );
}
