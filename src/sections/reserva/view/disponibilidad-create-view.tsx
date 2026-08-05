import { useEffect, useState } from 'react';

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
import { crearDisponibilidadRango } from 'src/services/disponibilidad.service';
import type { CanchaListItem } from 'src/types/cancha';
import type { ClubListItem } from 'src/types/club';
import type { CrearDisponibilidadRangoPayload } from 'src/types/reserva';

export function DisponibilidadCreateView() {
  const { user } = useAuth();
  const isSuperAdmin = user?.rol === 'SuperAdmin';

  const [clubs, setClubs] = useState<ClubListItem[]>([]);
  const [canchas, setCanchas] = useState<CanchaListItem[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<number | ''>(user?.clubId ?? '');
  const [selectedCanchaId, setSelectedCanchaId] = useState<number | ''>('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('10:00');
  const [motivo, setMotivo] = useState('');
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
        if (data.length > 0) setSelectedCanchaId(data[0].id);
      } catch (err) {
        console.error('Error al cargar canchas:', err);
      }
    }

    loadCanchas();
  }, [selectedClubId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFeedback(null);

    if (!selectedClubId || !selectedCanchaId || !fechaDesde || !fechaHasta) {
      setError('Selecciona club, cancha y rango de fechas.');
      setSaving(false);
      return;
    }

    const formatTimeSpan = (timeStr: string) => {
      if (!timeStr) return timeStr;
      return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    };

    const payload: CrearDisponibilidadRangoPayload = {
      canchaId: Number(selectedCanchaId),
      fechaDesde: new Date(`${fechaDesde}T00:00:00.000Z`).toISOString(),
      fechaHasta: new Date(`${fechaHasta}T00:00:00.000Z`).toISOString(),
      horaInicio: formatTimeSpan(horaInicio),
      horaFin: formatTimeSpan(horaFin),
      motivo: motivo || undefined,
      diasSemana: [],
    };

    console.log('Payload enviado:', JSON.stringify(payload, null, 2));

    try {
      await crearDisponibilidadRango(payload);
      setFeedback('Disponibilidad creada correctamente.');
      setFechaDesde('');
      setFechaHasta('');
      setHoraInicio('09:00');
      setHoraFin('10:00');
      setMotivo('');
    } catch (err) {
      console.error('Error al crear disponibilidad:', err);
      setError('No se pudo crear la disponibilidad.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4">Crear disponibilidad</Typography>
          <Typography variant="body2" color="text.secondary">Crea bloques de disponibilidad por club y cancha.</Typography>
        </Box>

        {feedback && <Box sx={{ color: 'success.main' }}>{feedback}</Box>}
        {error && <Box sx={{ color: 'error.main' }}>{error}</Box>}

        <Card sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField select fullWidth label="Club" value={selectedClubId} onChange={(ev) => setSelectedClubId(Number(ev.target.value))} disabled={!isSuperAdmin} required>
                {clubs.map((club) => (
                  <MenuItem key={club.id} value={club.id}>{club.nombre}</MenuItem>
                ))}
              </TextField>

              <TextField select fullWidth label="Cancha" value={selectedCanchaId} onChange={(ev) => setSelectedCanchaId(Number(ev.target.value))} required>
                {canchas.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                ))}
              </TextField>

              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                <TextField fullWidth type="date" label="Fecha desde" value={fechaDesde} onChange={(ev) => setFechaDesde(ev.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
                <TextField fullWidth type="date" label="Fecha hasta" value={fechaHasta} onChange={(ev) => setFechaHasta(ev.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
              </Box>

              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                <TextField fullWidth type="time" label="Hora inicio" value={horaInicio} onChange={(ev) => setHoraInicio(ev.target.value)} required />
                <TextField fullWidth type="time" label="Hora fin" value={horaFin} onChange={(ev) => setHoraFin(ev.target.value)} required />
              </Box>

              <TextField fullWidth label="Motivo" value={motivo} onChange={(ev) => setMotivo(ev.target.value)} />

              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button variant="contained" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear disponibilidad'}</Button>
              </Stack>
            </Stack>
          </form>
        </Card>
      </Stack>
    </DashboardContent>
  );
}

export default DisponibilidadCreateView;
