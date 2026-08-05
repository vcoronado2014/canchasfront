import { CompactList } from 'src/components/compact-list';
import { DisponibilidadItem } from 'src/types/reserva';
import { DisponibilidadTableRow } from '../disponibilidad-table-row';

type DisponibilidadCompactListProps = {
  loading: boolean;
  items: DisponibilidadItem[];
  dataFiltered: DisponibilidadItem[];
  page: number;
  rowsPerPage: number;
  selected: string[];
  filterName: string;
  notFound: boolean;
  onSelectRow: (id: string) => void;
  onDeleteRow: (id: number | string) => void;
};

export function DisponibilidadCompactList({
  loading,
  items,
  dataFiltered,
  page,
  rowsPerPage,
  selected,
  filterName,
  notFound,
  onSelectRow,
  onDeleteRow,
}: DisponibilidadCompactListProps) {
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
        <DisponibilidadTableRow
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