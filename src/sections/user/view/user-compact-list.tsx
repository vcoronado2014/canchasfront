import { CompactList } from 'src/components/compact-list';
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
    <CompactList
      loading={loading}
      items={dataFiltered}
      page={page}
      rowsPerPage={rowsPerPage}
      emptyMessage="No hay usuarios registrados."
      notFound={notFound}
      filterName={filterName}
      getItemKey={(row) => row.id}
      renderItem={(row) => (
        <UserTableRow
          compact
          row={row}
          selected={selected.includes(row.id)}
          onSelectRow={() => onSelectRow(row.id)}
          onEditRow={() => {
            // No-op placeholder to ensure file touched for consistency
            onEditRow(row.id);
          }}
          onDeleteRow={() => onDeleteRow(row.id)}
        />
      )}
    />
  );
}
