import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { getDisponibilidadPublica } from 'src/services/reserva.service';
import { getComunas, getRegiones } from 'src/services/location.service';
import type { CanchaOferta, ConsultaDisponibilidadParams } from 'src/types/reserva';
import type { Comuna, Region } from 'src/services/location.service';

export function LandingDisponibilidad() {
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedComuna, setSelectedComuna] = useState('');
  const [ofertas, setOfertas] = useState<CanchaOferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [regionesData] = await Promise.all([getRegiones()]);
        setRegiones(regionesData);
      } catch (err) {
        console.error('Error al cargar regiones:', err);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadDisponibilidad() {
      setLoading(true);
      setError(null);

      const params: ConsultaDisponibilidadParams = {};
      if (selectedRegion) params.region = selectedRegion;
      if (selectedComuna) params.comuna = selectedComuna;

      try {
        const data = await getDisponibilidadPublica(params);
        setOfertas(data);
      } catch (err) {
        console.error('Error al cargar disponibilidad pública:', err);
        setError('No se pudo cargar la disponibilidad.');
        setOfertas([]);
      } finally {
        setLoading(false);
      }
    }

    loadDisponibilidad();
  }, [selectedRegion, selectedComuna]);

  const handleRegionChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const regionCode = event.target.value;
    setSelectedRegion(regionCode);
    setSelectedComuna('');

    try {
      const data = await getComunas(regionCode);
      setComunas(data);
    } catch (err) {
      console.error('Error al cargar comunas:', err);
      setComunas([]);
    }
  };

  const totalDisponibles = useMemo(
    () => ofertas.reduce((acc, cancha) => acc + cancha.horariosDisponibles.filter((slot) => slot.disponible).length, 0),
    [ofertas]
  );

  return (
    <Card sx={{ p: 3, my: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5">Disponibilidad pública</Typography>
          <Typography variant="body2" color="text.secondary">
            Consulta disponibilidad general y luego refina por región y comuna.
          </Typography>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
          <TextField select fullWidth label="Región" value={selectedRegion} onChange={handleRegionChange}>
            {regiones.map((region) => (
              <MenuItem key={region.codigo} value={region.codigo}>
                {region.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField select fullWidth label="Comuna" value={selectedComuna} onChange={(event) => setSelectedComuna(event.target.value)} disabled={!selectedRegion}>
            {comunas.map((comuna) => (
              <MenuItem key={comuna.codigo} value={comuna.codigo}>
                {comuna.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {loading ? 'Cargando disponibilidad...' : `${totalDisponibles} horarios disponibles`}
        </Typography>

        {loading ? null : ofertas.length === 0 ? (
          <Alert severity="info">No hay disponibilidad para los filtros seleccionados.</Alert>
        ) : (
          <Stack spacing={2}>
            {ofertas.map((cancha) => (
              <Card key={cancha.canchaId} variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1">{cancha.nombreCancha}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Base: ${cancha.precioHoraBase.toLocaleString('es-CL')}/hora
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {cancha.horariosDisponibles.map((slot, index) => (
                      <Button key={`${cancha.canchaId}-${index}`} variant="outlined" color={slot.disponible ? 'primary' : 'inherit'} disabled={!slot.disponible}>
                        {new Date(slot.fechaInicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        {' — '}
                        {new Date(slot.fechaFin).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </Button>
                    ))}
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
