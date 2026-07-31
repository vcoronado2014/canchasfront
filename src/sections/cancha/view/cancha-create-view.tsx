import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import LoadingButton from '@mui/lab/LoadingButton';

import { DashboardContent } from 'src/layouts/dashboard';
import { createCancha, uploadCanchaFoto } from 'src/services/cancha.service';
import { getClubs } from 'src/services/club.service';
import { useAuth } from 'src/auth/use-auth';
import type { ClubListItem } from 'src/types/club';

// Componente para la gestión visual de fotos
import { CanchaFotoManager } from 'src/sections/cancha/cancha.foto-manager';

const TIPOS_CANCHA_OPTIONS = [
  { value: 0, label: 'Pádel' },
  { value: 1, label: 'Tenis' },
  { value: 2, label: 'Futbol 5' },
  { value: 3, label: 'Futbol 7' },
  { value: 4, label: 'Squash' },
  { value: 5, label: 'Otro' },
];

export function CanchaCreateView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const isSuperAdmin = user?.rol === 'SuperAdmin';
  const queryClubId = searchParams.get('clubId');

  // Estado para la lista de clubes (SuperAdmin)
  const [clubs, setClubs] = useState<ClubListItem[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);

  // Estados del Formulario
  const [clubId, setClubId] = useState<number | ''>(
    queryClubId ? Number(queryClubId) : user?.clubId ?? ''
  );
  const [nombre, setNombre] = useState('');
  const [tipoCancha, setTipoCancha] = useState<number>(0);
  const [precioHora, setPrecioHora] = useState<number | ''>(12000);
  const [horarioInicio, setHorarioInicio] = useState('08:00');
  const [horarioFin, setHorarioFin] = useState('23:00');
  const [duracionMinimaMinutos, setDuracionMinimaMinutos] = useState<number>(60);
  const [activa, setActiva] = useState(true);

  // 💡 ESTADO PARA ALMACENAR LAS FOTOS SELECCIONADAS
  const [archivosFotos, setArchivosFotos] = useState<File[]>([]);

  // Estado de Carga
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar lista de clubes si es SuperAdmin
  useEffect(() => {
    if (isSuperAdmin) {
      setLoadingClubs(true);
      getClubs()
        .then((data) => {
          setClubs(data);
          if (!clubId && data.length > 0) {
            setClubId(data[0].id);
          }
        })
        .catch((err) => console.error('Error al cargar clubes:', err))
        .finally(() => setLoadingClubs(false));
    }
  }, [isSuperAdmin]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!clubId) {
      alert('Debes seleccionar un club válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedInicio = horarioInicio.length === 5 ? `${horarioInicio}:00` : horarioInicio;
      const formattedFin = horarioFin.length === 5 ? `${horarioFin}:00` : horarioFin;

      // 1. Crear la cancha en la BD
      const nuevaCancha = await createCancha({
        clubId: Number(clubId),
        nombre,
        tipoCancha,
        precioHora: Number(precioHora),
        horarioInicio: formattedInicio,
        horarioFin: formattedFin,
        duracionMinimaMinutos,
        activa,
      });

      // 2. Si seleccionó fotos, subirlas usando tu servicio uploadCanchaFoto
      if (archivosFotos.length > 0 && nuevaCancha?.id) {
        await Promise.all(
          archivosFotos.map((file, index) =>
            uploadCanchaFoto(nuevaCancha.id, file, index === 0) // La primera se asigna como Principal
          )
        );
      }

      navigate('/dashboard/canchas');
    } catch (error) {
      console.error('Error al crear la cancha o subir fotos:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Nueva Cancha
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Card sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
          <Stack spacing={3}>
            {/* --- SECCIÓN: CLUB ASOCIADO --- */}
            {isSuperAdmin && (
              <>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  Asignación de Club
                </Typography>

                <TextField
                  select
                  fullWidth
                  label="Club"
                  value={clubId}
                  onChange={(e) => setClubId(Number(e.target.value))}
                  disabled={loadingClubs}
                  required
                >
                  {clubs.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}

            {/* --- SECCIÓN: INFORMACIÓN DE LA CANCHA --- */}
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Detalles de la Cancha
            </Typography>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField
                fullWidth
                label="Nombre de la Cancha"
                placeholder="Ej. Cancha 1 (Cristal)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />

              <TextField
                select
                fullWidth
                label="Tipo de Cancha"
                value={tipoCancha}
                onChange={(e) => setTipoCancha(Number(e.target.value))}
                required
              >
                {TIPOS_CANCHA_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField
                fullWidth
                type="number"
                label="Precio por Hora ($)"
                value={precioHora}
                onChange={(e) => setPrecioHora(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />

              <TextField
                select
                fullWidth
                label="Duración Mínima Bloque"
                value={duracionMinimaMinutos}
                onChange={(e) => setDuracionMinimaMinutos(Number(e.target.value))}
                required
              >
                <MenuItem value={30}>30 Minutos</MenuItem>
                <MenuItem value={60}>60 Minutos (1 Hora)</MenuItem>
                <MenuItem value={90}>90 Minutos (1.5 Horas)</MenuItem>
                <MenuItem value={120}>120 Minutos (2 Horas)</MenuItem>
              </TextField>
            </Box>

            {/* --- SECCIÓN: HORARIOS Y DISPONIBILIDAD --- */}
            <Typography variant="h6" sx={{ color: 'text.secondary', pt: 1 }}>
              Horario de Operación
            </Typography>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField
                fullWidth
                type="time"
                label="Hora de Apertura"
                slotProps={{ inputLabel: { shrink: true } }}
                value={horarioInicio}
                onChange={(e) => setHorarioInicio(e.target.value)}
                required
              />

              <TextField
                fullWidth
                type="time"
                label="Hora de Cierre"
                slotProps={{ inputLabel: { shrink: true } }}
                value={horarioFin}
                onChange={(e) => setHorarioFin(e.target.value)}
                required
              />
            </Box>

            {/* --- SECCIÓN: GESTIÓN DE FOTOS --- */}
            <CanchaFotoManager
              nuevosArchivos={archivosFotos}
              onArchivosChange={setArchivosFotos}
            />

            {/* Estado Activo */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={activa}
                  onChange={(e) => setActiva(e.target.checked)}
                />
              }
              label="Cancha disponible para reservas (Activa)"
            />

            {/* Botón de Envío */}
            <Stack direction="row" justifyContent="flex-end" sx={{ pt: 2 }}>
              <LoadingButton
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                Guardar Cancha
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </form>
    </DashboardContent>
  );
}