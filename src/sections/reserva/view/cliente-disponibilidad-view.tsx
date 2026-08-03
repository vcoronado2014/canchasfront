import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAuth } from 'src/auth/use-auth';
import { ClientContent } from 'src/layouts/client/client-content';
import { crearReservaCliente, getDisponibilidadClub } from 'src/services/reserva.service';
import { MetodoPago, type CanchaOferta, type CrearReservaClientePayload, type SlotDisponibilidad } from 'src/types/reserva';

export function ClienteDisponibilidadView() {
  const { user, club } = useAuth();

  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [ofertas, setOfertas] = useState<CanchaOferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{ canchaId: number; slot: SlotDisponibilidad } | null>(null);

  const clubId = user?.clubId ?? club?.id;

  useEffect(() => {
    if (!clubId) {
      setOfertas([]);
      setLoading(false);
      return () => undefined;
    }

    let isMounted = true;

    async function loadDisponibilidad() {
      setLoading(true);
      try {
        const data = await getDisponibilidadClub(Number(clubId), fecha);
        if (isMounted) {
          setOfertas(data);
        }
      } catch (error) {
        console.error('Error al obtener disponibilidad:', error);
        if (isMounted) {
          setOfertas([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDisponibilidad();

    return () => {
      isMounted = false;
    };
  }, [clubId, fecha]);

  const handleFechaChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFecha(event.target.value);
    setSelectedSlot(null);
  };

  const handleReservar = async () => {
    if (!selectedSlot) return;

    const payload: CrearReservaClientePayload = {
      canchaId: selectedSlot.canchaId,
      fechaInicio: selectedSlot.slot.fechaInicio,
      fechaFin: selectedSlot.slot.fechaFin,
      montoTotal: selectedSlot.slot.precio,
      metodoPago: MetodoPago.Efectivo,
    };

    try {
      await crearReservaCliente(payload);
      setSelectedSlot(null);
      alert('Reserva creada con éxito');
    } catch (error) {
      console.error('Error al crear reserva desde cliente:', error);
      alert('No se pudo crear la reserva');
    }
  };

  const totalDisponibles = useMemo(
    () => ofertas.reduce((acc, cancha) => acc + cancha.horariosDisponibles.filter((slot) => slot.disponible).length, 0),
    [ofertas]
  );

  return (
    <ClientContent>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4">Disponibilidad para reservar</Typography>
            <Typography variant="body2" color="text.secondary">
              Elige una fecha y reserva un horario disponible.
            </Typography>
          </Box>

          <Chip label={`${totalDisponibles} horarios disponibles`} color="success" variant="outlined" />
        </Box>

        <TextField
          fullWidth
          type="date"
          label="Fecha"
          value={fecha}
          onChange={handleFechaChange}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        {loading ? (
          <Typography>Cargando disponibilidad...</Typography>
        ) : (
          <Stack spacing={2}>
            {ofertas.map((cancha) => (
              <Card key={cancha.canchaId} sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="h6">{cancha.nombreCancha}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Base: ${cancha.precioHoraBase.toLocaleString('es-CL')}/hora
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {cancha.horariosDisponibles.map((slot, index) => {
                      const isSelected = selectedSlot?.canchaId === cancha.canchaId && selectedSlot?.slot === slot;
                      return (
                        <Button
                          key={`${cancha.canchaId}-${index}`}
                          variant={isSelected ? 'contained' : 'outlined'}
                          color={slot.disponible ? 'primary' : 'inherit'}
                          disabled={!slot.disponible}
                          onClick={() => setSelectedSlot({ canchaId: cancha.canchaId, slot })}
                        >
                          {new Date(slot.fechaInicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                          {' — '}
                          {new Date(slot.fechaFin).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                          {' '}({slot.precio.toLocaleString('es-CL')})
                        </Button>
                      );
                    })}
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}

        {selectedSlot && (
          <Card sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">Reserva seleccionada</Typography>
              <Typography>
                Inicio: {new Date(selectedSlot.slot.fechaInicio).toLocaleString('es-CL')}
              </Typography>
              <Typography>
                Fin: {new Date(selectedSlot.slot.fechaFin).toLocaleString('es-CL')}
              </Typography>
              <Typography>Monto: {selectedSlot.slot.precio.toLocaleString('es-CL')}</Typography>
              <Button variant="contained" onClick={handleReservar}>
                Confirmar reserva
              </Button>
            </Stack>
          </Card>
        )}
      </Stack>
    </ClientContent>
  );
}
