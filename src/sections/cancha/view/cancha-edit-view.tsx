import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { getCanchaById, updateCancha, uploadCanchaFoto, deleteCanchaFoto } from 'src/services/cancha.service';
import { getClubs } from 'src/services/club.service';
import { useAuth } from 'src/auth/use-auth';
import type { ClubListItem } from 'src/types/club';
import type { CanchaFoto } from 'src/types/cancha';

import { CanchaFotoManager } from 'src/sections/cancha/cancha.foto-manager';

const TIPOS_CANCHA_OPTIONS = [
  { value: 0, label: 'Pádel' },
  { value: 1, label: 'Tenis' },
  { value: 2, label: 'Futbol 5' },
  { value: 3, label: 'Futbol 7' },
  { value: 4, label: 'Squash' },
  { value: 5, label: 'Otro' },
];

export function CanchaEditView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isSuperAdmin = user?.rol === 'SuperAdmin';

  // Estados de Carga
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(false);

  // Lista de Clubes para SuperAdmin
  const [clubs, setClubs] = useState<ClubListItem[]>([]);

  // Campos del Formulario
  const [clubId, setClubId] = useState<number | ''>('');
  const [nombre, setNombre] = useState('');
  const [tipoCancha, setTipoCancha] = useState<number>(0);
  const [precioHora, setPrecioHora] = useState<number | ''>('');
  const [horarioInicio, setHorarioInicio] = useState('08:00');
  const [horarioFin, setHorarioFin] = useState('23:00');
  const [duracionMinimaMinutos, setDuracionMinimaMinutos] = useState<number>(60);
  const [activa, setActiva] = useState(true);

  // Estados para la gestión de fotos
  const [fotosExistentes, setFotosExistentes] = useState<CanchaFoto[]>([]);
  const [nuevasFotos, setNuevasFotos] = useState<File[]>([]);

  // 1. Cargar lista de clubes si es SuperAdmin
  useEffect(() => {
    if (isSuperAdmin) {
      setLoadingClubs(true);
      getClubs()
        .then((data) => setClubs(data))
        .catch((err) => console.error('Error al cargar clubes:', err))
        .finally(() => setLoadingClubs(false));
    }
  }, [isSuperAdmin]);

  // 2. Cargar los datos actuales de la Cancha
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getCanchaById(Number(id))
        .then((data) => {
          if (data) {
            setClubId(data.clubId ?? '');
            setNombre(data.nombre || '');
            
            // Asigna el número directo o evalúa la conversión si viniera string
            setTipoCancha(typeof data.tipoCancha === 'number' ? data.tipoCancha : 0);
            
            setPrecioHora(data.precioHora ?? '');
            setHorarioInicio(data.horarioInicio ? data.horarioInicio.substring(0, 5) : '08:00');
            setHorarioFin(data.horarioFin ? data.horarioFin.substring(0, 5) : '23:00');
            setDuracionMinimaMinutos(data.duracionMinimaMinutos || 60);
            setActiva(data.activa ?? true);

            // Carga las fotos provenientes del backend
            if (data.fotos && Array.isArray(data.fotos)) {
              setFotosExistentes(data.fotos);
            }
          }
        })
        .catch((err) => console.error('Error al obtener la cancha:', err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  // 3. Eliminar foto guardada en el backend
    const handleDeleteFotoExistente = async (fotoId: number) => {
        try {
            await deleteCanchaFoto(fotoId);
            setFotosExistentes((prev) => prev.filter((f) => f.id !== fotoId));
        } catch (error) {
            console.error('Error al eliminar la foto:', error);
        }
    };

  // 4. Guardar los cambios
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!id) return;

    setIsSubmitting(true);

    try {
      const formattedInicio = horarioInicio.length === 5 ? `${horarioInicio}:00` : horarioInicio;
      const formattedFin = horarioFin.length === 5 ? `${horarioFin}:00` : horarioFin;

      // Actualizar datos de la cancha (Sin pasar clubId)
      await updateCancha(Number(id), {
        nombre,
        tipoCancha,
        precioHora: Number(precioHora),
        horarioInicio: formattedInicio,
        horarioFin: formattedFin,
        duracionMinimaMinutos,
        activa,
      });

      // Subir fotos nuevas seleccionadas
      if (nuevasFotos.length > 0) {
        const tieneFotosActualmente = fotosExistentes.length > 0;
        await Promise.all(
          nuevasFotos.map((file, index) =>
            uploadCanchaFoto(
              Number(id),
              file,
              !tieneFotosActualmente && index === 0 // Es principal solo si no tenía fotos antes
            )
          )
        );
      }

      navigate('/dashboard/canchas');
    } catch (error) {
      console.error('Error al actualizar la cancha:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Spinner de Carga Inicial
  if (isLoading) {
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
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1, pl: 7 }}>
          Editar Cancha
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
                slotProps={{ inputLabel: { shrink: true } }}
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
                slotProps={{ inputLabel: { shrink: true } }}
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
              fotosExistentes={fotosExistentes}
              onDeleteFotoExistente={handleDeleteFotoExistente}
              nuevosArchivos={nuevasFotos}
              onArchivosChange={setNuevasFotos}
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
                Guardar Cambios
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </form>
    </DashboardContent>
  );
}