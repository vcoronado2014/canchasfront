import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { FormControl, InputLabel, Select, TablePagination, useMediaQuery } from '@mui/material';

import { useAuth } from 'src/auth/use-auth';
import { DashboardContent } from 'src/layouts/dashboard';
import { getCanchasByClub } from 'src/services/cancha.service';
import { getClubs } from 'src/services/club.service';
import {
  deleteDisponibilidad,
  getDisponividadesPorClub,
} from 'src/services/disponibilidad.service';
import { getReservasClub } from 'src/services/reserva.service';
import type { CanchaListItem } from 'src/types/cancha';
import type { ClubListItem } from 'src/types/club';
import type { DisponibilidadItem, ReservaListItem } from 'src/types/reserva';
import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';
import { ClubTableToolbar } from 'src/sections/club/club-table-toolbars';
import { useTable } from 'src/hooks/use-table';
import { DisponibilidadCompactList } from './disponibilidad-compact-list';
import { applyFilter, emptyRows, getComparator } from 'src/utils/table-utils';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadComponent } from 'src/components/tables/TableHeadComponent';
import { DisponibilidadTableRow } from 'src/sections/reserva/disponibilidad-table-row';
import { TableEmptyRow } from 'src/components/tables/TableEmptyRow';
import { TableNoData } from 'src/components/tables/TableNoData';
import { orderBy } from 'es-toolkit';

export function DisponibilidadView() {
  const { user } = useAuth();
  const isSuperAdmin = user?.rol === 'SuperAdmin';
  const table = useTable({
    defaultOrderBy: 'fecha',
    defaultOrder: 'desc'
  });
  const isCompactView = useMediaQuery('(max-width:830px)');

  const [clubs, setClubs] = useState<ClubListItem[]>([]);
  const [canchas, setCanchas] = useState<CanchaListItem[]>([]);
  const [items, setItems] = useState<DisponibilidadItem[]>([]);
  const [reservas, setReservas] = useState<ReservaListItem[]>([]);
  
  // Filtros
  const [selectedClubId, setSelectedClubId] = useState<number | ''>(user?.clubId ?? '');
  const [selectedCanchaId, setSelectedCanchaId] = useState<number | ''>('');
  
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [filterName, setFilterName] = useState('');

  // 1. Cargar la lista de clubes si es SuperAdmin
  useEffect(() => {
    if (isSuperAdmin) {
      getClubs().then((data) => {
        setClubs(data);
        if (data.length > 0 && !selectedClubId) {
          setSelectedClubId(data[0].id);
        }
      });
    }
  }, [isSuperAdmin]);

  // 2. Cargar canchas del club seleccionado
  useEffect(() => {
    if (!selectedClubId) {
      setCanchas([]);
      setSelectedCanchaId('');
      return;
    }

    async function loadCanchas() {
      try {
        const data = await getCanchasByClub(Number(selectedClubId));
        setCanchas(data);
      } catch (err) {
        console.error('Error al cargar canchas:', err);
        setCanchas([]);
      }
    }

    loadCanchas();
  }, [selectedClubId]);

  // 3. Cargar disponibilidades y reservas del club
  useEffect(() => {
    if (!selectedClubId) {
      setItems([]);
      setReservas([]);
      setLoading(false);
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        const [availabilityData, reservasData] = await Promise.all([
          getDisponividadesPorClub(Number(selectedClubId), fechaDesde || undefined, fechaHasta || undefined),
          getReservasClub(Number(selectedClubId), fechaDesde || undefined, fechaHasta || undefined),
        ]);
        setItems(availabilityData);
        setReservas(reservasData);
      } catch (err) {
        console.error('Error al cargar disponibilidad:', err);
        setItems([]);
        setReservas([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedClubId, fechaDesde, fechaHasta]);

  // Limpiar/Resetear Filtros
  const handleResetFilters = () => {
    setSelectedCanchaId('');
    setFilterName('');
    if (isSuperAdmin && clubs.length > 0) {
      setSelectedClubId(clubs[0].id);
    }
  };

  const hasReservationsForItem = useMemo(
    () => (item: DisponibilidadItem) => {
      const blockStart = new Date(`${item.fecha}T${item.horaInicio}`);
      const blockEnd = new Date(`${item.fecha}T${item.horaFin}`);

      return reservas.some((reserva) => {
        if (reserva.canchaId !== item.canchaId) {
          return false;
        }

        const reservaStart = new Date(reserva.fechaInicio);
        const reservaEnd = new Date(reserva.fechaFin);
        return reservaStart < blockEnd && reservaEnd > blockStart;
      });
    },
    [reservas]
  );

  const handleDelete = async (item: DisponibilidadItem) => {
    if (hasReservationsForItem(item)) {
      setError('No se puede eliminar esta disponibilidad porque ya tiene reservas asociadas.');
      return;
    }

    try {
      await deleteDisponibilidad(item.id);
      setFeedback('Disponibilidad eliminada correctamente.');
      setItems((prev) => prev.filter((value) => value.id !== item.id));
    } catch (err) {
      console.error('Error al eliminar disponibilidad:', err);
      setError('No se pudo eliminar la disponibilidad.');
    }
  };

  // Filtrar items por cancha seleccionada antes del ordenamiento/búsqueda general
  const itemsFilteredByCancha = useMemo(() => {
    if (!selectedCanchaId) return items;
    return items.filter((item) => item.canchaId === Number(selectedCanchaId));
  }, [items, selectedCanchaId]);

  const dataFiltered = applyFilter({
    inputData: itemsFilteredByCancha,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && (!!filterName || !!selectedCanchaId);

  return (
    <DashboardContent>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Disponibilidad
        </Typography>

        {selectedClubId && (
          <Button
            component={RouterLink}
            href={`/dashboard/disponibilidad/crear`}
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Nueva disponibilidad
          </Button>
        )}
      </Box>

      {/* Barra de Filtros (Club + Canchas + Reset) */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
        >
          {/* Selector de Club (Solo SuperAdmin) */}
          {isSuperAdmin && (
            <FormControl fullWidth>
              <InputLabel id="club-select-label">Seleccionar Club</InputLabel>
              <Select
                labelId="club-select-label"
                value={selectedClubId}
                label="Seleccionar Club"
                onChange={(e) => {
                  setSelectedClubId(Number(e.target.value));
                  setSelectedCanchaId(''); // Reiniciar cancha al cambiar de club
                }}
              >
                {clubs.map((club) => (
                  <MenuItem key={club.id} value={club.id}>
                    {club.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Selector de Canchas */}
          <FormControl fullWidth disabled={!selectedClubId || canchas.length === 0}>
            <InputLabel id="cancha-select-label">Todas las Canchas</InputLabel>
            <Select
              labelId="cancha-select-label"
              value={selectedCanchaId}
              label="Todas las Canchas"
              onChange={(e) => setSelectedCanchaId(e.target.value ? Number(e.target.value) : '')}
            >
              <MenuItem value="">
                <em>Todas las Canchas</em>
              </MenuItem>
              {canchas.map((cancha) => (
                <MenuItem key={cancha.id} value={cancha.id}>
                  {cancha.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Botón para Limpiar Filtros */}
          <Tooltip title="Limpiar Filtros">
            <IconButton onClick={handleResetFilters} color="error" sx={{ borderRadius: 1 }}>
              <Iconify icon="solar:trash-bin-trash-bold" width={24} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Card>

      <Card>
        <ClubTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        {isCompactView ? (
          <DisponibilidadCompactList
            loading={loading}
            items={itemsFilteredByCancha}
            dataFiltered={dataFiltered}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            selected={table.selected}
            filterName={filterName}
            notFound={notFound}
            onSelectRow={table.onSelectRow}
            onDeleteRow={() => {
              console.log('delete');
            }}
          />
        ) : (
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHeadComponent
                  order={table.order}
                  orderBy={table.orderBy}
                  rowCount={itemsFilteredByCancha.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      itemsFilteredByCancha.map((c) => c.id.toString())
                    )
                  }
                  useSelected={false}
                  headLabel={[
                    { id: 'nombreCancha', label: 'Nombre' },
                    { id: 'fecha', label: 'Fecha' },
                    { id: 'horaInicio', label: 'Horario' },
                    { id: 'motivo', label: 'Motivo' },
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
                      <DisponibilidadTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id.toString())}
                        onSelectRow={() => table.onSelectRow(row.id.toString())}
                        onDeleteRow={() => handleDelete(row)}
                      />
                    ))}

                  <TableEmptyRow
                    height={68}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  {notFound && <TableNoData message={filterName || 'No hay disponibilidades para esta cancha'} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        )}

        <TablePagination
          component="div"
          page={table.page}
          count={dataFiltered.length}
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
