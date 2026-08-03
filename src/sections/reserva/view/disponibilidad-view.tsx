import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAuth } from 'src/auth/use-auth';
import { DashboardContent } from 'src/layouts/dashboard';
import { getCanchasByClub } from 'src/services/cancha.service';
import { getClubs } from 'src/services/club.service';
import {
  crearDisponibilidadRango,
  deleteDisponibilidad,
  getDisponividadesPorClub,
  updateDisponibilidad,
} from 'src/services/disponibilidad.service';
import { getReservasClub } from 'src/services/reserva.service';
import type { CanchaListItem } from 'src/types/cancha';
import type { ClubListItem } from 'src/types/club';
import type { CrearDisponibilidadRangoPayload, DisponibilidadItem, ReservaListItem } from 'src/types/reserva';

export function DisponibilidadView() {
  const { user } = useAuth();
  const isSuperAdmin = user?.rol === 'SuperAdmin';

  const [clubs, setClubs] = useState<ClubListItem[]>([]);
  const [canchas, setCanchas] = useState<CanchaListItem[]>([]);
  const [items, setItems] = useState<DisponibilidadItem[]>([]);
  const [reservas, setReservas] = useState<ReservaListItem[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<number | ''>(user?.clubId ?? '');
  const [selectedCanchaId, setSelectedCanchaId] = useState<number | ''>('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().slice(0, 10));
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('10:00');
  const [motivo, setMotivo] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClubs() {
      try {
        const data = await getClubs();
        const allowedClubs = isSuperAdmin ? data : data.filter((clubItem) => clubItem.id === (user?.clubId ?? 0));
        setClubs(allowedClubs);
        const initialClub = user?.clubId ?? allowedClubs[0]?.id ?? '';
        setSelectedClubId(initialClub);
      } catch (err) {
        console.error('Error al cargar clubs:', err);
      }
    }

    loadClubs();
  }, [isSuperAdmin, user?.clubId]);

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
        if (data.length > 0) {
          setSelectedCanchaId(data[0].id);
        }
      } catch (err) {
        console.error('Error al cargar canchas:', err);
      }
    }

    loadCanchas();
  }, [selectedClubId]);

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
          getDisponividadesPorClub(Number(selectedClubId), fechaFiltro),
          getReservasClub(Number(selectedClubId)),
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
  }, [selectedClubId, fechaFiltro]);

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

  const resetForm = () => {
    setEditingId(null);
    setFechaDesde('');
    setFechaHasta('');
    setHoraInicio('09:00');
    setHoraFin('10:00');
    setMotivo('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    setError(null);

    if (!selectedClubId || !selectedCanchaId || !fechaDesde || !fechaHasta) {
      setError('Selecciona club, cancha y rango de fechas para crear la disponibilidad.');
      setSaving(false);
      return;
    }

    const payload: CrearDisponibilidadRangoPayload = {
      canchaId: Number(selectedCanchaId),
      fechaDesde: new Date(`${fechaDesde}T00:00:00.000Z`).toISOString(),
      fechaHasta: new Date(`${fechaHasta}T00:00:00.000Z`).toISOString(),
      horaInicio,
      horaFin,
      motivo: motivo || undefined,
      diasSemana: [],
    };

    try {
      if (editingId) {
        await updateDisponibilidad(editingId, payload);
        setFeedback('Disponibilidad actualizada correctamente.');
      } else {
        await crearDisponibilidadRango(payload);
        setFeedback('Disponibilidad creada correctamente.');
      }

      resetForm();
      setFechaFiltro(fechaDesde);
      setSelectedCanchaId(Number(selectedCanchaId));
    } catch (err) {
      console.error('Error al guardar disponibilidad:', err);
      setError('No se pudo guardar la disponibilidad.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: DisponibilidadItem) => {
    if (hasReservationsForItem(item)) {
      setError('No se puede editar esta disponibilidad porque ya tiene reservas asociadas.');
      return;
    }

    setEditingId(item.id);
    setFechaDesde(item.fecha);
    setFechaHasta(item.fecha);
    setHoraInicio(item.horaInicio);
    setHoraFin(item.horaFin);
    setMotivo(item.motivo ?? '');
  };

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

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4">Disponibilidad</Typography>
            <Typography variant="body2" color="text.secondary">
              Crea bloques de disponibilidad por club y cancha, y gestiona los que aún no tienen reservas asociadas.
            </Typography>
          </Box>
        </Box>

        {feedback && <Alert severity="success">{feedback}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                select
                fullWidth
                label="Club"
                value={selectedClubId}
                onChange={(event) => setSelectedClubId(Number(event.target.value))}
                required
                disabled={!isSuperAdmin}
              >
                {clubs.map((clubItem) => (
                  <MenuItem key={clubItem.id} value={clubItem.id}>
                    {clubItem.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Cancha"
                value={selectedCanchaId}
                onChange={(event) => setSelectedCanchaId(Number(event.target.value))}
                required
              >
                {canchas.map((cancha) => (
                  <MenuItem key={cancha.id} value={cancha.id}>
                    {cancha.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha desde"
                  value={fechaDesde}
                  onChange={(event) => setFechaDesde(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha hasta"
                  value={fechaHasta}
                  onChange={(event) => setFechaHasta(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
              </Box>

              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                <TextField
                  fullWidth
                  type="time"
                  label="Hora inicio"
                  value={horaInicio}
                  onChange={(event) => setHoraInicio(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
                <TextField
                  fullWidth
                  type="time"
                  label="Hora fin"
                  value={horaFin}
                  onChange={(event) => setHoraFin(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
              </Box>

              <TextField
                fullWidth
                label="Motivo"
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
              />

              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                {editingId ? (
                  <Button variant="outlined" color="inherit" onClick={resetForm}>
                    Cancelar
                  </Button>
                ) : null}
                <Button type="submit" variant="contained" disabled={saving}>
                  {editingId ? 'Guardar cambios' : 'Crear disponibilidad'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6">Bloques de disponibilidad</Typography>
              <TextField
                type="date"
                label="Filtrar por fecha"
                value={fechaFiltro}
                onChange={(event) => setFechaFiltro(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: 220 }}
              />
            </Box>

            {loading ? (
              <Typography color="text.secondary">Cargando bloques...</Typography>
            ) : items.length === 0 ? (
              <Typography color="text.secondary">No hay bloques de disponibilidad para esta fecha.</Typography>
            ) : (
              <Stack spacing={2}>
                {items.map((item) => {
                  const reservado = hasReservationsForItem(item);
                  return (
                    <Card key={item.id} variant="outlined" sx={{ p: 2 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1">{item.cancha?.nombre ?? `Cancha ${item.canchaId}`}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.fecha} · {item.horaInicio} - {item.horaFin}
                          </Typography>
                          {item.motivo ? <Typography variant="body2">Motivo: {item.motivo}</Typography> : null}
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button variant="outlined" size="small" onClick={() => handleEdit(item)} disabled={reservado}>
                            Editar
                          </Button>
                          <Button variant="text" color="error" size="small" onClick={() => handleDelete(item)} disabled={reservado}>
                            Eliminar
                          </Button>
                        </Stack>
                      </Stack>
                      {reservado ? <Typography variant="caption" color="error">No editable por reservas tomadas.</Typography> : null}
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
