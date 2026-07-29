import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import LoadingButton from '@mui/lab/LoadingButton';

import { DashboardContent } from 'src/layouts/dashboard';
import { createClub } from 'src/services/club.service';
import { getRegiones, getComunas } from 'src/services/location.service';
import { EstadoSuscripcionClub } from 'src/types/club';
import type { Region, Comuna } from 'src/services/location.service';

// Métodos de pago disponibles
const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'Transbank', 'MercadoPago', 'Otro'];

export function ClubCreateView() {
  const navigate = useNavigate();

  // Estados de Ubicación
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedComuna, setSelectedComuna] = useState<string>('');

  // Estados del Formulario
  const [nombre, setNombre] = useState('');
  const [subdominio, setSubdominio] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [estadoSuscripcion, setEstadoSuscripcion] = useState<EstadoSuscripcionClub>(
    EstadoSuscripcionClub.PendientePago
  );
  const [fechaProxVencimiento, setFechaProxVencimiento] = useState<string>('');
  const [metodosPago, setMetodosPago] = useState<string[]>(['Efectivo']);

  // Cargas
  const [loadingRegiones, setLoadingRegiones] = useState(true);
  const [loadingComunas, setLoadingComunas] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar Regiones
  useEffect(() => {
    async function fetchRegiones() {
      try {
        const data = await getRegiones();
        setRegiones(data);
      } catch (error) {
        console.error('Error al cargar regiones:', error);
      } finally {
        setLoadingRegiones(false);
      }
    }
    fetchRegiones();
  }, []);

  // Cargar Comunas al cambiar Región
  const handleRegionChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const code = event.target.value;
    setSelectedRegion(code);
    setSelectedComuna('');
    setComunas([]);

    if (!code) return;

    setLoadingComunas(true);
    try {
      const data = await getComunas(code);
      setComunas(data);
    } catch (error) {
      console.error('Error al cargar comunas:', error);
    } finally {
      setLoadingComunas(false);
    }
  };

  const handlePaymentToggle = (method: string) => {
    setMetodosPago((prev) =>
      prev.includes(method) ? prev.filter((item) => item !== method) : [...prev, method]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const regObj = regiones.find((r) => r.codigo === selectedRegion);
    const comObj = comunas.find((c) => c.codigo === selectedComuna);

    try {
      await createClub({
        nombreClub: nombre,
        subdominio,
        direccion,
        telefono,
        descripcion,
        regionCodigo: selectedRegion,
        regionNombre: regObj ? regObj.nombre : '',
        comunaCodigo: selectedComuna,
        comunaNombre: comObj ? comObj.nombre : '',
        metodosPagoHabilitados: metodosPago,
        estadoSuscripcion,
        fechaProxVencimiento: fechaProxVencimiento
          ? new Date(fechaProxVencimiento).toISOString()
          : null,
      });

      navigate('/dashboard/clubs');
    } catch (error) {
      console.error('Error al crear el club:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1, pl: 7 }}>Nuevo Club</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Card sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
          <Stack spacing={3}>
            {/* --- SECCIÓN: INFORMACIÓN PRINCIPAL --- */}
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Detalles del Club
            </Typography>

            {/* Nombre Completo */}
            <TextField
              fullWidth
              label="Nombre del Club"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />

            {/* Subdominio y Teléfono en la misma línea */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField
                fullWidth
                label="Subdominio"
                placeholder="miclub"
                value={subdominio}
                onChange={(e) => setSubdominio(e.target.value)}
                helperText="Identificador en la URL del sistema."
                required
              />

              <TextField
                fullWidth
                label="Teléfono de Contacto"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </Box>

            {/* Dirección Completa */}
            <TextField
              fullWidth
              label="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
            />

            {/* --- SECCIÓN: UBICACIÓN --- */}
            <Typography variant="h6" sx={{ color: 'text.secondary', pt: 1 }}>
              Ubicación
            </Typography>

            {/* Región y Comuna en la misma línea */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField
                select
                fullWidth
                label="Región"
                value={selectedRegion}
                onChange={handleRegionChange}
                disabled={loadingRegiones}
                required
              >
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
                onChange={(e) => setSelectedComuna(e.target.value)}
                disabled={!selectedRegion || loadingComunas}
                required
              >
                {comunas.map((comuna) => (
                  <MenuItem key={comuna.codigo} value={comuna.codigo}>
                    {comuna.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* --- SECCIÓN: SUSCRIPCIÓN Y CONFIGURACIÓN --- */}
            <Typography variant="h6" sx={{ color: 'text.secondary', pt: 1 }}>
              Suscripción y Configuración
            </Typography>

            {/* Estado y Fecha de Próximo Vencimiento en la misma línea */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField
                select
                fullWidth
                label="Estado de Suscripción"
                value={estadoSuscripcion}
                onChange={(e) => setEstadoSuscripcion(Number(e.target.value))}
              >
                <MenuItem value={EstadoSuscripcionClub.Activo}>Activo</MenuItem>
                <MenuItem value={EstadoSuscripcionClub.PendientePago}>Pendiente de pago</MenuItem>
                <MenuItem value={EstadoSuscripcionClub.Suspendido}>Suspendido</MenuItem>
                <MenuItem value={EstadoSuscripcionClub.Cancelado}>Cancelado</MenuItem>
              </TextField>

              <TextField
                fullWidth
                type="date"
                label="Próximo Vencimiento"
                slotProps={{ inputLabel: { shrink: true } }}
                value={fechaProxVencimiento}
                onChange={(e) => setFechaProxVencimiento(e.target.value)}
              />
            </Box>

            {/* Descripción */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />

            {/* Métodos de Pago */}
            <FormControl component="fieldset" variant="standard" sx={{ pt: 1 }}>
              <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
                Métodos de Pago Habilitados
              </FormLabel>
              <FormGroup row>
                {PAYMENT_METHODS.map((method) => (
                  <FormControlLabel
                    key={method}
                    control={
                      <Checkbox
                        checked={metodosPago.includes(method)}
                        onChange={() => handlePaymentToggle(method)}
                      />
                    }
                    label={method}
                  />
                ))}
              </FormGroup>
            </FormControl>

            {/* Botón de envío alineado a la derecha */}
            <Stack direction="row" justifyContent="flex-end" sx={{ pt: 2 }}>
              <LoadingButton
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                Guardar Club
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </form>
    </DashboardContent>
  );
}