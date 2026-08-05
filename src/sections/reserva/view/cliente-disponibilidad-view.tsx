import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';

import { ClientContent } from 'src/layouts/client/client-content';
import { getComunas, getRegiones } from 'src/services/location.service';
import { crearReservaCliente, getDisponibilidadPublica } from 'src/services/reserva.service';
import { MetodoPago, type CanchaOferta, type CrearReservaClientePayload, type ConsultaDisponibilidadParams } from 'src/types/reserva';
import type { Comuna, Region } from 'src/services/location.service';

interface SubBloque {
  id: string;
  fechaInicioMs: number;
  fechaFinMs: number;
  fechaInicioIso: string;
  fechaFinIso: string;
  horaInicioTexto: string;
  horaFinTexto: string;
  fechaTexto: string;
  fechaKey: string;
  disponible: boolean;
  precio: number;
  turno: 'Mañana' | 'Tarde' | 'Noche';
}

// Helper para convertir timestamp a String ISO respetando la hora local (evita desfase UTC)
function toLocalISOString(dateMs: number): string {
  const date = new Date(dateMs);
  const pad = (num: number) => String(Math.floor(Math.abs(num))).padStart(2, '0');

  return (
    date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes()) +
    ':' + pad(date.getSeconds()) +
    '.000Z'
  );
}

export function ClienteDisponibilidadView() {
  const defaultFechaInicio = new Date().toISOString().slice(0, 10);
  const defaultFechaFin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [regiones, setRegiones] = useState<Region[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);

  // Filtros
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedComuna, setSelectedComuna] = useState('');
  const [fechaInicio, setFechaInicio] = useState(defaultFechaInicio);
  const [fechaFin, setFechaFin] = useState(defaultFechaFin);

  const [ofertas, setOfertas] = useState<CanchaOferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selección de día activo por cancha: { [canchaId]: 'YYYY-MM-DD' }
  const [activeDateByCancha, setActiveDateByCancha] = useState<{ [key: number]: string }>({});

  // Selección múltiple de bloques
  const [canchaSeleccionadaId, setCanchaSeleccionadaId] = useState<number | null>(null);
  const [bloquesSeleccionados, setBloquesSeleccionados] = useState<SubBloque[]>([]);

  // 1. Cargar Regiones
  useEffect(() => {
    async function loadInitialRegiones() {
      try {
        const data = await getRegiones();
        setRegiones(data);
        if (data.length > 0) {
          const firstRegion = data[0].codigo;
          setSelectedRegion(firstRegion);
          const comunasData = await getComunas(firstRegion);
          setComunas(comunasData);
        }
      } catch (err) {
        console.error('Error al cargar regiones:', err);
      }
    }
    loadInitialRegiones();
  }, []);

  // 2. Función reutilizable para cargar disponibilidad (soporta re-fetch post-reserva)
  const loadDisponibilidad = useCallback(async () => {
    if (!selectedRegion) return;

    setLoading(true);
    setError(null);

    const params: ConsultaDisponibilidadParams = {
      region: selectedRegion,
    };

    if (selectedComuna) params.comuna = selectedComuna;
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    try {
      const data = await getDisponibilidadPublica(params);
      setOfertas(data);
    } catch (err) {
      console.error('Error al cargar disponibilidad:', err);
      setError('No se pudo cargar la disponibilidad.');
      setOfertas([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedComuna, fechaInicio, fechaFin]);

  useEffect(() => {
    loadDisponibilidad();
  }, [loadDisponibilidad]);

  // Formateador local de fecha
  const getLocalDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generador de sub-bloques
  const generarSubBloques = (cancha: CanchaOferta): { [fechaKey: string]: SubBloque[] } => {
    const bloquesPorFecha: { [fechaKey: string]: SubBloque[] } = {};

    const duracionMinutos =
      (cancha as any).duracionMinimaMinutos ||
      (cancha.nombreCancha.toLowerCase().includes('padel') ? 30 : 60);

    const precioPorSubBloque = cancha.precioHoraBase;

    cancha.horariosDisponibles.forEach((slot) => {
      const startMs = new Date(slot.fechaInicio).getTime();
      const endMs = new Date(slot.fechaFin).getTime();
      const stepMs = duracionMinutos * 60 * 1000;

      let actualMs = startMs;

      while (actualMs + stepMs <= endMs) {
        const dateStart = new Date(actualMs);
        const dateEnd = new Date(actualMs + stepMs);

        const fechaKey = getLocalDateKey(dateStart);
        const horaNum = dateStart.getHours();

        let turno: 'Mañana' | 'Tarde' | 'Noche' = 'Mañana';
        if (horaNum >= 12 && horaNum < 18) turno = 'Tarde';
        if (horaNum >= 18) turno = 'Noche';

        const horaInicioTexto = dateStart.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
        const horaFinTexto = dateEnd.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
        const fechaTexto = dateStart.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });

        if (!bloquesPorFecha[fechaKey]) {
          bloquesPorFecha[fechaKey] = [];
        }

        bloquesPorFecha[fechaKey].push({
          id: `${cancha.canchaId}-${actualMs}`,
          fechaInicioMs: actualMs,
          fechaFinMs: actualMs + stepMs,
          fechaInicioIso: dateStart.toISOString(),
          fechaFinIso: dateEnd.toISOString(),
          horaInicioTexto,
          horaFinTexto,
          fechaTexto,
          fechaKey,
          disponible: slot.disponible,
          precio: precioPorSubBloque,
          turno,
        });

        actualMs += stepMs;
      }
    });

    return bloquesPorFecha;
  };

  // Manejo de selecciones
  const handleToggleSubBloque = (canchaId: number, subBloque: SubBloque, todosLosBloques: SubBloque[]) => {
    if (!subBloque.disponible) return;

    if (canchaSeleccionadaId !== canchaId) {
      setCanchaSeleccionadaId(canchaId);
      setBloquesSeleccionados([subBloque]);
      return;
    }

    const yaSeleccionado = bloquesSeleccionados.some((b) => b.id === subBloque.id);

    if (yaSeleccionado) {
      const filtrados = bloquesSeleccionados.filter((b) => b.id !== subBloque.id);
      if (filtrados.length === 0) setCanchaSeleccionadaId(null);
      setBloquesSeleccionados(filtrados);
    } else {
      const nuevaLista = [...bloquesSeleccionados, subBloque].sort((a, b) => a.fechaInicioMs - b.fechaInicioMs);
      const primerMs = nuevaLista[0].fechaInicioMs;
      const ultimoMs = nuevaLista[nuevaLista.length - 1].fechaFinMs;

      const subRango = todosLosBloques.filter((b) => b.fechaInicioMs >= primerMs && b.fechaFinMs <= ultimoMs);
      const sonTodosDisponibles = subRango.every((b) => b.disponible);

      if (sonTodosDisponibles) {
        setBloquesSeleccionados(subRango);
      } else {
        setBloquesSeleccionados([subBloque]);
      }
    }
  };

  const handleRegionChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const regionCode = event.target.value;
    setSelectedRegion(regionCode);
    setSelectedComuna('');
    limpiarSeleccionReserva();

    if (!regionCode) {
      setComunas([]);
      return;
    }

    try {
      const data = await getComunas(regionCode);
      setComunas(data);
    } catch (err) {
      console.error('Error al cargar comunas:', err);
      setComunas([]);
    }
  };

  const limpiarSeleccionReserva = () => {
    setCanchaSeleccionadaId(null);
    setBloquesSeleccionados([]);
  };

  const handleClearFilters = async () => {
    limpiarSeleccionReserva();
    setSelectedComuna('');
    setFechaInicio(defaultFechaInicio);
    setFechaFin(defaultFechaFin);

    if (regiones.length > 0) {
      const firstRegion = regiones[0].codigo;
      setSelectedRegion(firstRegion);
      try {
        const data = await getComunas(firstRegion);
        setComunas(data);
      } catch (err) {
        console.error('Error al recargar comunas:', err);
      }
    }
  };

  // Creación de reserva por Lote
  const handleReservar = async () => {
    if (!canchaSeleccionadaId || bloquesSeleccionados.length === 0) return;

    const montoTotalCalculado = bloquesSeleccionados.reduce((acc, b) => acc + b.precio, 0);

    const payload: CrearReservaClientePayload = {
      canchaId: canchaSeleccionadaId,
      montoTotal: montoTotalCalculado,
      metodoPago: MetodoPago.Efectivo,
      bloques: bloquesSeleccionados.map((b) => ({
        fechaInicio: toLocalISOString(b.fechaInicioMs),
        fechaFin: toLocalISOString(b.fechaFinMs),
      })),
    };

    try {
      await crearReservaCliente(payload);
      limpiarSeleccionReserva();
      alert('¡Reserva realizada con éxito!');
      await loadDisponibilidad();
    } catch (err: any) {
      console.error('Error al crear reserva:', err);
      alert(err?.response?.data?.message || 'No se pudo procesar la reserva. Verifica la disponibilidad.');
    }
  };

  const resumenReserva = useMemo(() => {
    if (!canchaSeleccionadaId || bloquesSeleccionados.length === 0) return null;

    const primerBloque = bloquesSeleccionados[0];
    const ultimoBloque = bloquesSeleccionados[bloquesSeleccionados.length - 1];
    const totalMonto = bloquesSeleccionados.reduce((acc, b) => acc + b.precio, 0);

    return {
      fecha: primerBloque.fechaTexto,
      horaInicio: primerBloque.horaInicioTexto,
      horaFin: ultimoBloque.horaFinTexto,
      duracionTotalMin: (ultimoBloque.fechaFinMs - primerBloque.fechaInicioMs) / (1000 * 60),
      totalMonto,
    };
  }, [canchaSeleccionadaId, bloquesSeleccionados]);

  return (
    <ClientContent>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4">Disponibilidad para reservar</Typography>
            <Typography variant="body2" color="text.secondary">
              Selecciona los tramos de tu preferencia para reservar la cancha.
            </Typography>
          </Box>

          <Button variant="outlined" color="inherit" onClick={handleClearFilters}>
            Limpiar filtros
          </Button>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Filtros */}
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }} gap={2}>
          <TextField select fullWidth required label="Región *" value={selectedRegion} onChange={handleRegionChange}>
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
            onChange={(e) => {
              setSelectedComuna(e.target.value);
              limpiarSeleccionReserva();
            }}
            disabled={!selectedRegion}
          >
            <MenuItem value="">Todas las comunas</MenuItem>
            {comunas.map((comuna) => (
              <MenuItem key={comuna.codigo} value={comuna.codigo}>
                {comuna.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            type="date"
            label="Fecha inicio"
            value={fechaInicio}
            onChange={(e) => {
              setFechaInicio(e.target.value);
              limpiarSeleccionReserva();
            }}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            fullWidth
            type="date"
            label="Fecha fin"
            value={fechaFin}
            onChange={(e) => {
              setFechaFin(e.target.value);
              limpiarSeleccionReserva();
            }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>

        {loading ? (
          <Typography color="text.secondary">Cargando disponibilidades...</Typography>
        ) : ofertas.length === 0 ? (
          <Alert severity="info">No hay disponibilidad para los filtros seleccionados.</Alert>
        ) : (
          <Stack spacing={3}>
            {ofertas.map((cancha) => {
              const subBloquesPorFecha = generarSubBloques(cancha);
              const fechasDisponibles = Object.keys(subBloquesPorFecha);

              if (fechasDisponibles.length === 0) return null;

              const activeDate = activeDateByCancha[cancha.canchaId] || fechasDisponibles[0];
              const bloquesDelDia = subBloquesPorFecha[activeDate] || [];
              const todosLosBloquesCancha = Object.values(subBloquesPorFecha).flat();

              const jornadas = {
                Mañana: bloquesDelDia.filter((b) => b.turno === 'Mañana'),
                Tarde: bloquesDelDia.filter((b) => b.turno === 'Tarde'),
                Noche: bloquesDelDia.filter((b) => b.turno === 'Noche'),
              };

              return (
                <Card key={`${cancha.clubId}-${cancha.canchaId}`} sx={{ p: 3, borderRadius: 2 }}>
                  <Stack spacing={2.5}>
                    {/* Header Cancha */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="h6">{cancha.nombreClub}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>{cancha.nombreCancha}</strong> — 📍 {cancha.comunaNombre}, {cancha.direccionClub}
                        </Typography>
                      </Box>
                      <Chip
                        label={`Base: $${cancha.precioHoraBase.toLocaleString('es-CL')}/hr`}
                        color="primary"
                        //variant="soft"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>

                    {/* Selector de Días mediante Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs
                        value={activeDate}
                        onChange={(_, newDate) =>
                          setActiveDateByCancha((prev) => ({ ...prev, [cancha.canchaId]: newDate }))
                        }
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        {fechasDisponibles.map((fechaKey) => {
                          const primerSub = subBloquesPorFecha[fechaKey][0];
                          return (
                            <Tab
                              key={fechaKey}
                              value={fechaKey}
                              label={`📅 ${primerSub?.fechaTexto}`}
                              sx={{ textTransform: 'none', fontWeight: 'medium' }}
                            />
                          );
                        })}
                      </Tabs>
                    </Box>

                    {/* Bloques organizados por Jornada */}
                    <Stack spacing={2}>
                      {(['Mañana', 'Tarde', 'Noche'] as const).map((turno) => {
                        const bloquesJornada = jornadas[turno];
                        if (bloquesJornada.length === 0) return null;

                        const iconoJornada = turno === 'Mañana' ? '☀️' : turno === 'Tarde' ? '🌤️' : '🌙';

                        return (
                          <Paper key={turno} variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1.5 }}>
                              {iconoJornada} {turno.toUpperCase()}
                            </Typography>

                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 1 }}>
                              {bloquesJornada.map((subSlot) => {
                                const isSelected =
                                  canchaSeleccionadaId === cancha.canchaId &&
                                  bloquesSeleccionados.some((b) => b.id === subSlot.id);

                                return (
                                  <Button
                                    key={subSlot.id}
                                    size="small"
                                    variant={isSelected ? 'contained' : 'outlined'}
                                    color={isSelected ? 'primary' : 'inherit'}
                                    disabled={!subSlot.disponible}
                                    onClick={() =>
                                      handleToggleSubBloque(cancha.canchaId, subSlot, todosLosBloquesCancha)
                                    }
                                    sx={{
                                      py: 0.8,
                                      borderRadius: 1,
                                      fontSize: '0.8125rem',
                                      fontWeight: isSelected ? 'bold' : 'normal',
                                      bgcolor: isSelected ? undefined : 'background.paper',
                                    }}
                                  >
                                    {subSlot.horaInicioTexto} - {subSlot.horaFinTexto}
                                  </Button>
                                );
                              })}
                            </Box>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}

        {/* Resumen de Reserva Selección */}
        {resumenReserva && (
          <Card
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              border: '2px solid',
              borderColor: 'primary.main',
              boxShadow: (theme) => theme.customShadows?.z12,
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="h6" color="primary.main">
                Reserva seleccionada
              </Typography>
              <Divider />
              <Typography variant="body2">
                <strong>Fecha:</strong> {resumenReserva.fecha}
              </Typography>
              <Typography variant="body2">
                <strong>Horario total:</strong> {resumenReserva.horaInicio} hrs — {resumenReserva.horaFin} hrs ({resumenReserva.duracionTotalMin} min)
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                Monto Total: ${resumenReserva.totalMonto.toLocaleString('es-CL')}
              </Typography>
              <Button variant="contained" size="large" onClick={handleReservar} sx={{ mt: 1 }}>
                Confirmar reserva
              </Button>
            </Stack>
          </Card>
        )}
      </Stack>
    </ClientContent>
  );
}