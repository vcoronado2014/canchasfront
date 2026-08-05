import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { getDisponibilidadPublica } from 'src/services/reserva.service';
import { getComunas, getRegiones } from 'src/services/location.service';
import type { CanchaOferta, ConsultaDisponibilidadParams } from 'src/types/reserva';
import type { Comuna, Region } from 'src/services/location.service';
import { Container } from '@mui/material';

export function LandingDisponibilidad() {
  const baseFotos = (import.meta.env.VITE_URL_FOTOS ?? '').toString();
  const pref = (url?: string | null) => {
    if (!url) return undefined;
    if (/^https?:\/\//.test(url)) return url;
    const base = baseFotos.replace(/\/+$/, '');
    return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
  };

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

  const handleRegionChange = async (event: ChangeEvent<HTMLInputElement>) => {
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

  const resumenPorClub = useMemo(
    () =>
      ofertas.map((cancha) => {
        const disponibles = cancha.horariosDisponibles.filter((slot) => slot.disponible);
        const proximosDias = Array.from(new Set(disponibles.map((slot) => slot.fechaInicio.slice(0, 10)))).slice(0, 3);

        return {
          cancha,
          disponiblesCount: disponibles.length,
          proximosDias,
        };
      }),
    [ofertas]
  );

  const handleClearFilters = () => {
    setSelectedRegion('');
    setSelectedComuna('');
    setComunas([]);
  };

  return (
    <Container maxWidth="xl">
      <Card sx={{ p: 3, my: 4 }}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h5">Disponibilidad pública</Typography>
              <Typography variant="body2" color="text.secondary">
                Revisa los clubes que tienen disponibilidad para los próximos días y entra como cliente para reservar horarios.
              </Typography>
            </Box>

            <Button variant="outlined" onClick={handleClearFilters} disabled={!selectedRegion && !selectedComuna}>
              Limpiar filtros
            </Button>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
            <TextField select fullWidth label="Región" value={selectedRegion} onChange={handleRegionChange}>
              <MenuItem value="">Todas las regiones</MenuItem>
              {regiones.map((region) => (
                <MenuItem key={region.codigo} value={region.codigo}>
                  {region.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField select fullWidth label="Comuna" value={selectedComuna} onChange={(event) => setSelectedComuna(event.target.value)} disabled={!selectedRegion}>
              <MenuItem value="">Todas las comunas</MenuItem>
              {comunas.map((comuna) => (
                <MenuItem key={comuna.codigo} value={comuna.codigo}>
                  {comuna.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {/* {loading ? 'Cargando disponibilidad...' : `${resumenPorClub.reduce((acc, item) => acc + item.disponiblesCount, 0)} bloques disponibles`} */}
            {loading ? 'Cargando disponibilidad...' : ''}
          </Typography>

          {loading ? null : resumenPorClub.length === 0 ? (
            <Alert severity="info">No hay disponibilidad para los filtros seleccionados.</Alert>
          ) : (
            <Grid container spacing={3}>
              {resumenPorClub.map(({ cancha, disponiblesCount, proximosDias }) => (
                <Grid key={`${cancha.clubId}-${cancha.canchaId}`} size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%', borderRadius: 3 }}>
                    <CardMedia
                      component="img"
                      height="220"
                      image={pref(cancha.fotoPrincipalUrl ?? cancha.fotoClubUrl) ?? '/assets/images/cover/cover-2.jpg'}
                      alt={cancha.nombreClub}
                    />

                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                      <Typography variant="h6">{cancha.nombreClub}</Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>{cancha.nombreCancha}</strong> 
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 35 }}>
                        📍 {cancha.regionNombre}, {cancha.comunaNombre}, {cancha.direccionClub}
                      </Typography>
                      <Typography variant="body2">
                        Base: ${cancha.precioHoraBase.toLocaleString('es-CL')}/hora
                      </Typography>

                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          mt: 3,
                        }}
                      >
                        Reservar
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Card>
    </Container>
  );
}
