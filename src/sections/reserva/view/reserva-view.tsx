import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useAuth } from 'src/auth/use-auth';
import { DashboardContent } from 'src/layouts/dashboard';
import { RouterLink } from 'src/routes/components';
import { getClubs } from 'src/services/club.service';
import { cancelarReserva, getReservasClub } from 'src/services/reserva.service';
import {
  ESTADO_RESERVA_MAP,
  METODO_PAGO_MAP,
  type ReservaListItem,
} from 'src/types/reserva';
import type { ClubListItem } from 'src/types/club';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

export function ReservaView() {
  const { user, club } = useAuth();
  const isSuperAdmin = user?.rol === 'SuperAdmin';

  const [reservas, setReservas] = useState<ReservaListItem[]>([]);
  const [clubs, setClubs] = useState<ClubListItem[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<number | ''>(user?.clubId ?? club?.id ?? '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSuperAdmin) {
      getClubs()
        .then((data) => {
          setClubs(data);
          if (!selectedClubId && data.length > 0) {
            setSelectedClubId(data[0].id);
          }
        })
        .catch((error) => console.error('Error al cargar clubes:', error));
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    loadReservas();
  }, [selectedClubId, club?.id, user?.clubId]);

  async function loadReservas() {
    if (isSuperAdmin && !selectedClubId) {
      setReservas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const targetClubId = isSuperAdmin ? Number(selectedClubId) : (user?.clubId ?? club?.id);
      const data = await getReservasClub(targetClubId);
      setReservas(data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = async (id: number) => {
    try {
      await cancelarReserva(id);
      await loadReservas();
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Reservas
        </Typography>

        <Button
          component={RouterLink}
          href="/dashboard/reservations/new"
          variant="contained"
          color="inherit"
        >
          Nueva reserva
        </Button>
      </Box>

      {isSuperAdmin && (
        <Card sx={{ p: 2, mb: 3 }}>
          <TextField
            select
            fullWidth
            label="Seleccionar club"
            value={selectedClubId}
            onChange={(event) => setSelectedClubId(Number(event.target.value))}
          >
            {clubs.map((clubItem) => (
              <MenuItem key={clubItem.id} value={clubItem.id}>
                {clubItem.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Card>
      )}

      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>Cancha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Inicio</TableCell>
                <TableCell>Fin</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Método</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Cargando reservas...
                  </TableCell>
                </TableRow>
              ) : reservas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No hay reservas registradas.
                  </TableCell>
                </TableRow>
              ) : (
                reservas.map((reserva) => (
                  <TableRow key={reserva.id} hover>
                    <TableCell>{reserva.nombreCancha}</TableCell>
                    <TableCell>{reserva.nombreCliente ?? 'Sin cliente'}</TableCell>
                    <TableCell>{new Date(reserva.fechaInicio).toLocaleString('es-CL')}</TableCell>
                    <TableCell>{new Date(reserva.fechaFin).toLocaleString('es-CL')}</TableCell>
                    <TableCell>{reserva.montoTotal.toLocaleString('es-CL')}</TableCell>
                    <TableCell>{ESTADO_RESERVA_MAP[reserva.estado]}</TableCell>
                    <TableCell>{reserva.metodoPago !== undefined ? METODO_PAGO_MAP[reserva.metodoPago] : '—'}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          component={RouterLink}
                          href={`/dashboard/reservations/${reserva.id}/edit`}
                          size="small"
                          variant="outlined"
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="error"
                          onClick={() => handleCancel(reserva.id)}
                        >
                          Cancelar
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </DashboardContent>
  );
}
