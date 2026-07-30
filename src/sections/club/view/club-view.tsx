import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { getClubs } from 'src/services/club.service';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';


import { TableNoData } from 'src/components/tables/TableNoData';
import { ClubTableRow } from '../club-table-row';
import { TableHeadComponent } from 'src/components/tables/TableHeadComponent';

import { TableEmptyRow } from 'src/components/tables/TableEmptyRow';
import { ClubTableToolbar } from '../club-table-toolbars';
import { applyFilter, getComparator, emptyRows, visuallyHidden } from 'src/utils/table-utils';

import type { ClubProps } from '../club-table-row';
import type { ClubListItem } from 'src/types/club';
import { RouterLink } from 'src/routes/components';
import { useAuth } from 'src/auth/use-auth';

// ----------------------------------------------------------------------

export function ClubView() {
    const { user } = useAuth();
  const table = useTable();

    const [clubs, setClubs] = useState<ClubListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterName, setFilterName] = useState('');

    useEffect(() => {
        loadClubs();
    }, []);

    async function loadClubs() {
        try {
            const response = await getClubs();
            setClubs(response);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

  const dataFiltered: ClubProps[] = applyFilter({
    inputData: clubs,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

    const handleDeleteRow = useCallback((id: number | string) => {
        setClubs((prevClubs) => prevClubs.filter((club) => club.id !== id));
        // Opcional: si la fila eliminada estaba seleccionada, la quitamos de selected
        table.onSelectRow(id.toString());
    }, [table]);

  const notFound = !dataFiltered.length && !!filterName;

if (!loading) {
    return (
        <DashboardContent>
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    Clubes
                </Typography>
                {
                    user?.rol === 'SuperAdmin' && (
                        <Button
                            component={RouterLink}
                            href="/dashboard/clubs/new"
                            variant="contained"
                            color="inherit"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            Nuevo club
                        </Button>
                    )
                }

            </Box>

            <Card>
                <ClubTableToolbar
                    numSelected={table.selected.length}
                    filterName={filterName}
                    onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setFilterName(event.target.value);
                        table.onResetPage();
                    }}
                /> 

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHeadComponent
                                order={table.order}
                                orderBy={table.orderBy}
                                rowCount={clubs.length}
                                numSelected={table.selected.length}
                                onSort={table.onSort}
                                onSelectAllRows={(checked) =>
                                    table.onSelectAllRows(
                                        checked,
                                        clubs.map((club) => club.id.toString())
                                    )
                                }
                                useSelected={false}
                                headLabel={[
                                    { id: 'nombre', label: 'Nombre' },
                                    /* { id: 'owner', label: 'Administrador' }, */
                                    { id: 'regionNombre', label: 'Región' },
                                    { id: 'comunaNombre', label: 'Comuna' },
                                    { id: 'fechaProxVencimiento', label: 'Vencimiento' },
                                    { id: 'subdominio', label: 'Subdominio' },
                                    { id: 'estadoSuscripcion', label: 'Estado' },
                                    { id: '' },
                                ]}
                            />
                            <TableBody>
                                {dataFiltered
                                    .slice(
                                        table.page * table.rowsPerPage,
                                        table.page * table.rowsPerPage + table.rowsPerPage
                                    )
                                    .map((row) => (
                                        <ClubTableRow
                                            key={row.id}
                                            row={row}
                                            selected={table.selected.includes(row.id.toString())}
                                            onSelectRow={() => table.onSelectRow(row.id.toString())}
                                            onDeleteRow={() => handleDeleteRow(row.id)}
                                        />
                                    ))}

                                <TableEmptyRow
                                    height={68}
                                    emptyRows={emptyRows(table.page, table.rowsPerPage, clubs.length)}
                                /> 

                                {notFound && <TableNoData message={filterName} />}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>

                <TablePagination
                    component="div"
                    page={table.page}
                    count={clubs.length}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    rowsPerPageOptions={[5, 10, 25]}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                    }
                />
            </Card>
        </DashboardContent>
    );
}
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

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

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}