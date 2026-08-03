import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Button from '@mui/material/Button';

import { DashboardContent } from 'src/layouts/dashboard';
import { getReservasClub } from 'src/services/reserva.service';
import { getCanchasByClub } from 'src/services/cancha.service';
import { getClubs } from 'src/services/club.service';
import type { ClubListItem } from 'src/types/club';
import type { CanchaListItem } from 'src/types/cancha';
import { EstadoReserva, MetodoPago } from 'src/types/reserva';

export function ReservaEditView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [clubs, setClubs] = useState<ClubListItem[]>([]);
  const [canchas, setCanchas] = useState<CanchaListItem[]>([]);
  const [clubId, setClubId] = useState<number | ''>('');
  const [canchaId, setCanchaId] = useState<number | ''>('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [montoTotal, setMontoTotal] = useState<number | ''>('');
  const [estado, setEstado] = useState<EstadoReserva>(EstadoReserva.Pendiente);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(MetodoPago.Efectivo);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const clubData = await getClubs();
        setClubs(clubData);

        const reservas = await getReservasClub();
        const reserva = reservas.find((item) => item.id === Number(id));

        if (reserva) {
          const inicio = new Date(reserva.fechaInicio).toISOString().slice(0, 16);
          const fin = new Date(reserva.fechaFin).toISOString().slice(0, 16);
          setFechaInicio(inicio);
          setFechaFin(fin);
          setMontoTotal(reserva.montoTotal);
          setEstado(reserva.estado);
          setMetodoPago(reserva.metodoPago ?? MetodoPago.Efectivo);

          if (clubData.length > 0) {
            setClubId(clubData[0].id);
          }

          const canchasData = await getCanchasByClub(clubData[0]?.id ?? 0);
          setCanchas(canchasData);
          setCanchaId(reserva.canchaId);
        }
      } catch (error) {
        console.error('Error al cargar datos de reserva:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadInitialData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Editar Reserva</Typography>
      </Box>

      <Card sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
        <Stack spacing={3}>
            <TextField
              select
              fullWidth
              label="Club"
              value={clubId}
              onChange={(e) => setClubId(Number(e.target.value))}
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
              />

              <TextField
                fullWidth
                type="datetime-local"
                label="Fin"
                slotProps={{ inputLabel: { shrink: true } }}
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </Box>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField
                fullWidth
                type="number"
                label="Monto total"
                value={montoTotal}
                onChange={(e) => setMontoTotal(e.target.value === '' ? '' : Number(e.target.value))}
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
              label="Estado"
              value={estado}
              onChange={(e) => setEstado(Number(e.target.value))}
            >
              <MenuItem value={EstadoReserva.Pendiente}>Pendiente</MenuItem>
              <MenuItem value={EstadoReserva.Confirmada}>Confirmada</MenuItem>
              <MenuItem value={EstadoReserva.Completada}>Completada</MenuItem>
              <MenuItem value={EstadoReserva.Cancelada}>Cancelada</MenuItem>
            </TextField>

            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={() => navigate('/dashboard/reservations')}>
                Volver al listado
              </Button>
            </Stack>
          </Stack>
        </Card>
    </DashboardContent>
  );
}
