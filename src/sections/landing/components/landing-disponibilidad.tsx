import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { getDisponibilidadPublica } from 'src/services/reserva.service';
import { getComunas, getRegiones } from 'src/services/location.service';
import type { CanchaOferta, ConsultaDisponibilidadParams } from 'src/types/reserva';
import type { Comuna, Region } from 'src/services/location.service';

import { useAuth } from 'src/auth/use-auth';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';

const OpcionesRadio = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 15, label: '15 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
];

export function LandingDisponibilidad() {
  const router = useRouter();
  const { isAuthenticated, tipo } = useAuth();

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

  // Geolocalización y Radio
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radioKm, setRadioKm] = useState<number>(10);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Estados y refs para el carrusel
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Calcula cuántos ítems se muestran por pantalla según el ancho
  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 900) return 2;
    return 3;
  };

  // Detecta la posición del scroll para activar el punto (dot) correspondiente
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth === 0) return;
    const newIndex = Math.round(scrollLeft / clientWidth);
    setActiveIndex(newIndex);
  };

  // Desplaza el carrusel a una página específica
  const scrollToPage = (pageIndex: number) => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: pageIndex * clientWidth,
      behavior: 'smooth',
    });
    setActiveIndex(pageIndex);
  };

  // Toggle de Ubicación (Activar / Desactivar)
  const handleToggleUbicacion = () => {
    if (coords) {
      setCoords(null);
      setGeoError(null);
      return;
    }

    if (!navigator.geolocation) {
      setGeoError('La geolocalización no está soportada por tu navegador.');
      return;
    }

    setLoadingGeo(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingGeo(false);
      },
      (err) => {
        setLoadingGeo(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Permiso denegado para acceder a la ubicación.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('La información de ubicación no está disponible.');
            break;
          case err.TIMEOUT:
            setGeoError('Tiempo de espera agotado al obtener la ubicación.');
            break;
          default:
            setGeoError('Ocurrió un error al obtener la ubicación.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

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

  // Consulta de disponibilidad según filtros
  useEffect(() => {
    async function loadDisponibilidad() {
      setLoading(true);
      setError(null);

      const params: ConsultaDisponibilidadParams = {};
      if (selectedRegion) params.region = selectedRegion;
      if (selectedComuna) params.comuna = selectedComuna;

      // Parámetros geográficos enviados solo si está activo "Cerca de mí"
      if (coords) {
        params.lat = coords.lat;
        params.lon = coords.lng;
        params.radiusKm = radioKm;
      }

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
  }, [selectedRegion, selectedComuna, coords, radioKm]);

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
    setCoords(null);
    setRadioKm(10);
    setGeoError(null);
  };

  const handleReservar = () => {
    const esCliente = isAuthenticated && tipo === 'Cliente';

    if (esCliente) {
      router.push('/cliente/disponibilidad');
    } else {
      sessionStorage.setItem('redirectTo', '/cliente/disponibilidad');
      router.push('/sign-in');
    }
  };

  const totalPages = Math.ceil(resumenPorClub.length / getItemsPerPage());

  // Autoplay temporizado cada 4 segundos
  useEffect(() => {
    if (isPaused || totalPages <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = prevIndex >= totalPages - 1 ? 0 : prevIndex + 1;

        if (scrollRef.current) {
          const { clientWidth } = scrollRef.current;
          scrollRef.current.scrollTo({
            left: nextIndex * clientWidth,
            behavior: 'smooth',
          });
        }

        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, totalPages]);

  // Handlers para pausar/reanudar en interacciones táctiles de móviles
  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  return (
    <Container maxWidth="xl">
      <Card sx={{ p: 3, my: 4 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h5">Disponibilidad pública</Typography>
              <Typography variant="body2" color="text.secondary">
                Revisa los clubes que tienen disponibilidad para los próximos días y entra como cliente para reservar horarios.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              onClick={handleClearFilters}
              disabled={!selectedRegion && !selectedComuna && !coords}
            >
              Limpiar filtros
            </Button>
          </Box>

          {/* Errores */}
          {error && <Alert severity="error">{error}</Alert>}
          {geoError && <Alert severity="warning">{geoError}</Alert>}

          {/* Grid de Filtros */}
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr auto auto' }}
            gap={2}
            alignItems="center"
          >
            <TextField
              select
              fullWidth
              label="Región"
              value={selectedRegion}
              onChange={handleRegionChange}
            >
              <MenuItem value="">Todas las regiones</MenuItem>
              {regiones.map((region) => (
                <MenuItem key={region.codigo} value={region.codigo}>
                  {region.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Comuna"
              value={selectedComuna}
              onChange={(event) => setSelectedComuna(event.target.value)}
              disabled={!selectedRegion}
            >
              <MenuItem value="">Todas las comunas</MenuItem>
              {comunas.map((comuna) => (
                <MenuItem key={comuna.codigo} value={comuna.codigo}>
                  {comuna.nombre}
                </MenuItem>
              ))}
            </TextField>

            <Button
              sx={{ height: 56, minWidth: 160 }}
              variant={coords ? 'contained' : 'outlined'}
              color={coords ? 'success' : 'primary'}
              onClick={handleToggleUbicacion}
              disabled={loadingGeo}
              startIcon={<Iconify icon={coords ? 'solar:map-point-bold' : 'solar:map-point-line-duotone'} />}
            >
              {loadingGeo ? 'Obteniendo...' : coords ? 'Ubicación activa' : 'Cerca de mí'}
            </Button>

            {/* Selector de Radio (Solo se habilita si las coordenadas están activas) */}
            <TextField
              select
              label="Radio"
              value={radioKm}
              onChange={(e) => setRadioKm(Number(e.target.value))}
              disabled={!coords}
              sx={{ minWidth: 110 }}
            >
              {OpcionesRadio.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Indicador de estado del filtro activo */}
          {coords && (
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={`Filtro activo: a menos de ${radioKm} km`}
                color="success"
                variant="outlined"
                onDelete={() => setCoords(null)}
              />
            </Box>
          )}

          {/* Carga y Resultados */}
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Cargando disponibilidad...
            </Typography>
          ) : resumenPorClub.length === 0 ? (
            <Alert severity="info">No hay disponibilidad para los filtros seleccionados.</Alert>
          ) : (
            <Box
              sx={{ position: 'relative' }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Header con Flechas de Navegación */}
              {totalPages > 1 && (
                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1} sx={{ mb: 2 }}>
                  <IconButton
                    onClick={() => scrollToPage(Math.max(activeIndex - 1, 0))}
                    disabled={activeIndex === 0}
                    sx={{
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Iconify icon="solar:alt-arrow-left-bold" width={18} />
                  </IconButton>

                  <IconButton
                    onClick={() => scrollToPage(Math.min(activeIndex + 1, totalPages - 1))}
                    disabled={activeIndex >= totalPages - 1}
                    sx={{
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Iconify icon="solar:alt-arrow-right-bold" width={18} />
                  </IconButton>
                </Stack>
              )}

              {/* Riel de Desplazamiento (Scroll Track) */}
              <Box
                ref={scrollRef}
                onScroll={handleScroll}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                sx={{
                  display: 'flex',
                  gap: 3,
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch', // Scroll fluido con inercia en Safari iOS
                  touchAction: 'pan-x pan-y',
                  py: 1,
                  px: 0.5,
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                }}
              >
                {resumenPorClub.map(({ cancha }) => (
                  <Box
                    key={`${cancha.clubId}-${cancha.canchaId}`}
                    sx={{
                      flex: {
                        xs: '0 0 100%',
                        sm: '0 0 calc(50% - 12px)',
                        md: '0 0 calc(33.333% - 16px)',
                      },
                      scrollSnapAlign: 'start',
                      scrollSnapStop: 'always',
                    }}
                  >
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
                          onClick={handleReservar}
                          sx={{ mt: 3 }}
                        >
                          Reservar
                        </Button>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>

              {/* Puntos de Paginación (Dots) */}
              {totalPages > 1 && (
                <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 3 }}>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => scrollToPage(index)}
                      sx={{
                        width: activeIndex === index ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: activeIndex === index ? 'primary.main' : 'text.disabled',
                        opacity: activeIndex === index ? 1 : 0.3,
                        cursor: 'pointer',
                        transition: (theme) =>
                          theme.transitions.create(['width', 'background-color', 'opacity'], {
                            duration: theme.transitions.duration.short,
                          }),
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </Stack>
      </Card>
    </Container>
  );
}