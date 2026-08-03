import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { getCanchasByClub } from 'src/services/cancha.service';
import { getClubs } from 'src/services/club.service';
import { crearReservaPresencial } from 'src/services/reserva.service';
import { useAuth } from 'src/auth/use-auth';
import type { ClubListItem } from 'src/types/club';
import type { CanchaListItem } from 'src/types/cancha';
import { MetodoPago, type CrearReservaPresencialPayload } from 'src/types/reserva';

export function ReservaCreateView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.rol === 'SuperAdmin';

  const [clubs, setClubs] = useState<ClubListItem[]>([]);
  const [canchas, setCanchas] = useState<CanchaListItem[]>([]);
  const [clubId, setClubId] = useState<number | ''>(user?.clubId ?? '');
  const [canchaId, setCanchaId] = useState<number | ''>('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [montoTotal, setMontoTotal] = useState<number | ''>(0);
  const [pagado, setPagado] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(MetodoPago.Efectivo);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadClubs() {
      try {
        const data = await getClubs();
        const allowedClubs = isSuperAdmin
          ? data
          : data.filter((clubItem) => clubItem.id === (user?.clubId ?? 0));

        setClubs(allowedClubs);
        const initialClub = user?.clubId ?? allowedClubs[0]?.id ?? '';
        setClubId(initialClub);
      } catch (error) {
        console.error('Error al cargar clubes:', error);
      }
    }

    loadClubs();
  }, [isSuperAdmin, user?.clubId]);

  useEffect(() => {
    if (!clubId) {
      setCanchas([]);
      setCanchaId('');
      return;
    }

    async function loadCanchas() {
      try {
        const data = await getCanchasByClub(Number(clubId));
        setCanchas(data);
        if (data.length > 0) {
          setCanchaId(data[0].id);
        }
      } catch (error) {
        console.error('Error al cargar canchas:', error);
      }
    }

    loadCanchas();
  }, [clubId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!clubId || !canchaId || !fechaInicio || !fechaFin) {
      alert('Completa los datos requeridos para crear la reserva.');
      return;
    }

    setIsSubmitting(true);

    const payload: CrearReservaPresencialPayload = {
      canchaId: Number(canchaId),
      fechaInicio: new Date(fechaInicio).toISOString(),
      fechaFin: new Date(fechaFin).toISOString(),
      montoTotal: Number(montoTotal),
      pagado,
      metodoPago,
    };

    try {
      await crearReservaPresencial(payload);
      navigate('/dashboard/reservations');
    } catch (error) {
      console.error('Error al crear la reserva:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Nueva Reserva</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Card sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
          <Stack spacing={3}>
            <TextField
              select
              fullWidth
              label="Club"
              value={clubId}
              onChange={(e) => setClubId(Number(e.target.value))}
              required
              disabled={!isSuperAdmin}
            >
              {clubs.map((club) => (
                <MenuItem key={club.id} value={club.id}>
                  {club.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Cancha"
              value={canchaId}
              onChange={(e) => setCanchaId(Number(e.target.value))}
              required
            >
              {canchas.map((cancha) => (
                <MenuItem key={cancha.id} value={cancha.id}>
                  {cancha.nombre}
                </MenuItem>
              ))}
            </TextField>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Inicio"
                slotProps={{ inputLabel: { shrink: true } }}
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />

              <TextField
                fullWidth
                type="datetime-local"
                label="Fin"
                slotProps={{ inputLabel: { shrink: true } }}
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                required
              />
            </Box>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField
                fullWidth
                type="number"
                label="Monto total"
                value={montoTotal}
                onChange={(e) => setMontoTotal(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />

              <TextField
                select
                fullWidth
                label="Método de pago"
                value={metodoPago}
                onChange={(e) => setMetodoPago(Number(e.target.value))}
              >
                <MenuItem value={MetodoPago.Efectivo}>Efectivo</MenuItem>
                <MenuItem value={MetodoPago.Debito}>Débito</MenuItem>
                <MenuItem value={MetodoPago.Credito}>Crédito</MenuItem>
                <MenuItem value={MetodoPago.Transferencia}>Transferencia</MenuItem>
                <MenuItem value={MetodoPago.PresencialServicio}>Pago Presencial</MenuItem>
              </TextField>
            </Box>

            <TextField
              select
              fullWidth
              label="Estado de pago"
              value={pagado ? 1 : 0}
              onChange={(e) => setPagado(Number(e.target.value) === 1)}
            >
              <MenuItem value={0}>No pagado</MenuItem>
              <MenuItem value={1}>Pagado</MenuItem>
            </TextField>

            <Stack direction="row" justifyContent="flex-end">
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Crear reserva
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </form>
    </DashboardContent>
  );
}
