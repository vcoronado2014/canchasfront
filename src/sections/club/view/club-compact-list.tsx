import { CompactList } from 'src/components/compact-list';
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
    <CompactList
      loading={loading}
      items={dataFiltered}
      page={page}
      rowsPerPage={rowsPerPage}
      emptyMessage="No hay clubes registrados."
      notFound={notFound}
      filterName={filterName}
      getItemKey={(row) => row.id}
      renderItem={(row) => (
        <ClubTableRow
          compact
          row={row}
          selected={selected.includes(row.id.toString())}
          onSelectRow={() => onSelectRow(row.id.toString())}
          onDeleteRow={() => onDeleteRow(row.id)}
          onRefreshList={onRefreshList}
        />
      )}
    />
  );
}
