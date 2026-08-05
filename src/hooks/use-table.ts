import { useState, useCallback } from 'react';

type UseTableProps = {
  defaultOrder?: 'asc' | 'desc';
  defaultOrderBy?: string;
  defaultRowsPerPage?: number;
};

export function useTable(props?: UseTableProps) {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState(props?.defaultOrderBy ?? 'nombre');
  const [rowsPerPage, setRowsPerPage] = useState(props?.defaultRowsPerPage ?? 5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>(props?.defaultOrder ?? 'asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback((inputValue: string) => {
    setSelected((prevSelected) => {
      const newSelected = prevSelected.includes(inputValue)
        ? prevSelected.filter((value) => value !== inputValue)
        : [...prevSelected, inputValue];
      return newSelected;
    });
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  return {
    page,
    order,
    orderBy,
    rowsPerPage,
    selected,
    onSort,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}