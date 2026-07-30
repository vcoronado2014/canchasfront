import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { getCanchasByClub } from 'src/services/cancha.service';
import { getClubs } from 'src/services/club.service';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData } from 'src/components/tables/TableNoData';
import { TableHeadComponent } from 'src/components/tables/TableHeadComponent';
import { TableEmptyRow } from 'src/components/tables/TableEmptyRow';
import { RouterLink } from 'src/routes/components';
import { useAuth } from 'src/auth/use-auth';

import { CanchaTableRow } from 'src/sections/cancha/cancha-table-row';
import { ClubTableToolbar } from 'src/sections/club/club-table-toolbars'; // Puedes reutilizar la Toolbar
import { emptyRows, applyFilter, getComparator } from 'src/utils/table-utils';
import { useTable } from 'src/hooks/use-table'; // Reutiliza el hook useTable o decláralo

import type { CanchaListItem } from 'src/types/cancha';
import type { ClubListItem } from 'src/types/club';

export function CanchaView() {
  const { user } = useAuth();
  const table = useTable();

  const isSuperAdmin = user?.rol === 'SuperAdmin';

  const [clubs, setClubs] = useState<ClubListItem[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<number | ''>(user?.clubId ?? '');
  const [canchas, setCanchas] = useState<CanchaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState('');

  // 1. Cargar la lista de clubes si el usuario es SuperAdmin
  useEffect(() => {
    if (isSuperAdmin) {
      getClubs().then((data) => {
        setClubs(data);
        if (data.length > 0) {
          setSelectedClubId(data[0].id);
        }
      });
    }
  }, [isSuperAdmin]);

  // 2. Cargar canchas del club seleccionado
  useEffect(() => {
    if (selectedClubId) {
      loadCanchas(Number(selectedClubId));
    } else {
      setLoading(false);
    }
  }, [selectedClubId]);

  async function loadCanchas(clubId: number) {
    setLoading(true);
    try {
      const response = await getCanchasByClub(clubId);
      setCanchas(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const dataFiltered = applyFilter({
    inputData: canchas,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const handleDeleteRow = useCallback((id: number | string) => {
    setCanchas((prev) => prev.filter((cancha) => cancha.id !== id));
    table.onSelectRow(id.toString());
  }, [table]);

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Canchas
        </Typography>

        {selectedClubId && (
          <Button
            component={RouterLink}
            href={`/dashboard/canchas/new?clubId=${selectedClubId}`}
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Nueva cancha
          </Button>
        )}
      </Box>

      {/* Dropdown visible solo si es SuperAdmin */}
      {isSuperAdmin && (
        <Card sx={{ p: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="club-select-label">Seleccionar Club</InputLabel>
            <Select
              labelId="club-select-label"
              value={selectedClubId}
              label="Seleccionar Club"
              onChange={(e) => setSelectedClubId(Number(e.target.value))}
            >
              {clubs.map((club) => (
                <MenuItem key={club.id} value={club.id}>
                  {club.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Card>
      )}

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
                rowCount={canchas.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    canchas.map((c) => c.id.toString())
                  )
                }
                useSelected={false}
                headLabel={[
                  { id: 'foto', label: 'Imagen' },
                  { id: 'nombre', label: 'Nombre' },
                  { id: 'tipoCancha', label: 'Tipo' },
                  { id: 'precioHora', label: 'Precio/Hora' },
                  { id: 'duracionMinimaMinutos', label: 'Bloque Mín.' },
                  { id: 'activa', label: 'Estado' },
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
                    <CanchaTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id.toString())}
                      onSelectRow={() => table.onSelectRow(row.id.toString())}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                    />
                  ))}

                <TableEmptyRow
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, canchas.length)}
                />

                {notFound && <TableNoData message={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={canchas.length}
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