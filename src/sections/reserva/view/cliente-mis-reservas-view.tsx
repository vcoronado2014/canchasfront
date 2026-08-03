import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useAuth } from 'src/auth/use-auth';
import { ClientContent } from 'src/layouts/client/client-content';
import { getMisReservas } from 'src/services/reserva.service';
import { ESTADO_RESERVA_MAP, METODO_PAGO_MAP, type ReservaListItem } from 'src/types/reserva';

export function ClienteMisReservasView() {
  const { user, club } = useAuth();
  const [reservas, setReservas] = useState<ReservaListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadReservas() {
      setLoading(true);
      try {
        const clubId = user?.clubId ?? club?.id;
        const data = await getMisReservas(clubId);
        if (isMounted) {
          setReservas(data);
        }
      } catch (error) {
        console.error('Error al cargar reservas del cliente:', error);
        if (isMounted) {
          setReservas([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReservas();

    return () => {
      isMounted = false;
    };
  }, [club?.id, user?.clubId]);

  return (
    <ClientContent>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4">Mis reservas</Typography>
            <Typography variant="body2" color="text.secondary">
              Aquí verás tus reservas confirmadas o pendientes.
            </Typography>
          </Box>
          <Chip label={`${reservas.length} reservas`} color="info" variant="outlined" />
        </Box>

        {loading ? (
          <Typography>Cargando tus reservas...</Typography>
        ) : reservas.length === 0 ? (
          <Card sx={{ p: 3 }}>
            <Typography>No tienes reservas registradas aún.</Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {reservas.map((reserva) => (
              <Card key={reserva.id} sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1">{reserva.nombreCancha}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(reserva.fechaInicio).toLocaleString('es-CL')} — {new Date(reserva.fechaFin).toLocaleString('es-CL')}
                  </Typography>
                  <Typography>Monto: {reserva.montoTotal.toLocaleString('es-CL')}</Typography>
                  <Typography>Estado: {ESTADO_RESERVA_MAP[reserva.estado]}</Typography>
                  <Typography>Método de pago: {reserva.metodoPago !== undefined ? METODO_PAGO_MAP[reserva.metodoPago] : '—'}</Typography>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </ClientContent>
  );
}
