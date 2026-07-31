import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { getClubById, updateClub } from 'src/services/club.service';
import { getRegiones, getComunas } from 'src/services/location.service';
import { EstadoSuscripcionClub } from 'src/types/club';
import { useAuth } from 'src/auth/use-auth';
import type { Region, Comuna } from 'src/services/location.service';

const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'Transbank', 'MercadoPago', 'Otro'];

export function ClubEditView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Comprobar si el usuario actual es SuperAdmin
  const isSuperAdmin = user?.rol === 'SuperAdmin' || user?.rol?.includes('SuperAdmin');

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

  // Cargas y bloqueos
  const [loadingClub, setLoadingClub] = useState(true);
  const [loadingComunas, setLoadingComunas] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del Club al montar el componente
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [regionesData, clubData] = await Promise.all([
          getRegiones(),
          getClubById(Number(id)),
        ]);

        setRegiones(regionesData);
        setNombre(clubData.nombre ?? '');
        setSubdominio(clubData.subdominio ?? '');
        setDireccion(clubData.direccion ?? '');
        setTelefono(clubData.telefono ?? '');
        setDescripcion(clubData.descripcion ?? '');
        setEstadoSuscripcion(clubData.estadoSuscripcion);
        setMetodosPago(clubData.metodosPagoHabilitados ?? ['Efectivo']);

        if (clubData.fechaProxVencimiento) {
          setFechaProxVencimiento(clubData.fechaProxVencimiento.substring(0, 10));
        }

        if (clubData.regionCodigo) {
          setSelectedRegion(clubData.regionCodigo);
          const comunasData = await getComunas(clubData.regionCodigo);
          setComunas(comunasData);
          setSelectedComuna(clubData.comunaCodigo ?? '');
        }
      } catch (error) {
        console.error('Error al cargar datos del club:', error);
      } finally {
        setLoadingClub(false);
      }
    }

    loadData();
  }, [id]);

  // Manejar cambio de región (solo para SuperAdmin)
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

  // Checkbox de métodos de pago
  const handlePaymentToggle = (method: string) => {
    if (!isSuperAdmin) return;
    setMetodosPago((prev) =>
      prev.includes(method) ? prev.filter((item) => item !== method) : [...prev, method]
    );
  };

  // Guardar cambios
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    const regObj = regiones.find((r) => r.codigo === selectedRegion);
    const comObj = comunas.find((c) => c.codigo === selectedComuna);

    try {
      await updateClub(Number(id), {
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
      console.error('Error al actualizar el club:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingClub) {
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
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center', 
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>Editar Club</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Card sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Datos del Club
            </Typography>

            <TextField
              fullWidth
              label="Nombre del Club"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={!isSuperAdmin}
              required
            />

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField
                fullWidth
                label="Subdominio"
                value={subdominio}
                onChange={(e) => setSubdominio(e.target.value)}
                disabled={!isSuperAdmin}
                required
              />

              {/* Teléfono: SIEMPRE EDITABLE */}
              <TextField
                fullWidth
                label="Teléfono de Contacto"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </Box>

            <TextField
              fullWidth
              label="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              disabled={!isSuperAdmin}
              required
            />

            <Typography variant="h6" sx={{ color: 'text.secondary', pt: 1 }}>
              Ubicación
            </Typography>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField
                select
                fullWidth
                label="Región"
                value={selectedRegion}
                onChange={handleRegionChange}
                disabled={!isSuperAdmin}
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
                disabled={!isSuperAdmin || loadingComunas}
                required
              >
                {comunas.map((comuna) => (
                  <MenuItem key={comuna.codigo} value={comuna.codigo}>
                    {comuna.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Descripción: SIEMPRE EDITABLE */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />

            <Typography variant="h6" sx={{ color: 'text.secondary', pt: 1 }}>
              Suscripción y Configuración
            </Typography>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField
                select
                fullWidth
                label="Estado de Suscripción"
                value={estadoSuscripcion}
                onChange={(e) => setEstadoSuscripcion(Number(e.target.value))}
                disabled={!isSuperAdmin}
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
                disabled={!isSuperAdmin}
              />
            </Box>

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
                        disabled={!isSuperAdmin}
                      />
                    }
                    label={method}
                  />
                ))}
              </FormGroup>
            </FormControl>

            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ pt: 2 }}>
              <LoadingButton
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                Guardar Cambios
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </form>
    </DashboardContent>
  );
}