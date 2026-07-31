import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { DashboardContent } from 'src/layouts/dashboard';
import { createUsuario } from 'src/services/usuario.service';
import { getClubs } from 'src/services/club.service';
import { ROL_USUARIO_OPTIONS, RolUsuario } from 'src/types/usuario';
import { useAuth } from 'src/auth/use-auth';
import type { ClubListItem } from 'src/types/club';

export function UserCreateView() {
  const navigate = useNavigate();
  const { user, club } = useAuth();
  const isSuperAdmin = user?.rol === 'SuperAdmin';

  const [clubs, setClubs] = useState<ClubListItem[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState(ROL_USUARIO_OPTIONS[4]?.value ?? 4);
  const [clubId, setClubId] = useState<number | ''>(isSuperAdmin ? '' : user?.clubId ?? '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const allowedRoles = isSuperAdmin
    ? ROL_USUARIO_OPTIONS
    : ROL_USUARIO_OPTIONS.filter((option) => option.value !== RolUsuario.SuperAdmin);

  useEffect(() => {
    async function fetchClubs() {
      if (!isSuperAdmin) {
        return;
      }

      setLoadingClubs(true);
      try {
        const data = await getClubs();
        setClubs(data);
      } catch (error) {
        console.error('Error al cargar clubes:', error);
      } finally {
        setLoadingClubs(false);
      }
    }

    fetchClubs();
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin) {
      setClubId(user?.clubId ?? '');
    }
  }, [isSuperAdmin, user?.clubId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await createUsuario({
        email,
        nombre,
        telefono: telefono || undefined,
        password,
        rol,
        clubId: clubId === '' ? null : Number(clubId),
      });

      navigate('/dashboard/user');
    } catch (error) {
      console.error('Error al crear usuario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Nuevo Usuario
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Card sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Datos del Usuario
            </Typography>

            <TextField fullWidth label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField fullWidth label="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              <TextField fullWidth label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Box>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField select fullWidth label="Rol" value={rol} onChange={(e) => setRol(Number(e.target.value))}>
                {allowedRoles.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label={isSuperAdmin ? 'Club (opcional)' : 'Club'}
                value={clubId}
                onChange={(e) => setClubId(e.target.value ? Number(e.target.value) : '')}
                disabled={!isSuperAdmin || loadingClubs}
                required={!isSuperAdmin}
              >
                {isSuperAdmin ? (
                  <>
                    <MenuItem value="">Sin club</MenuItem>
                    {clubs.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nombre}
                      </MenuItem>
                    ))}
                  </>
                ) : (
                  <MenuItem value={clubId}>{club?.nombre ?? 'Club actual'}</MenuItem>
                )}
              </TextField>
            </Box>

            <Stack direction="row" justifyContent="flex-end" sx={{ pt: 2 }}>
              <LoadingButton size="large" type="submit" variant="contained" loading={isSubmitting}>
                Crear Usuario
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </form>
    </DashboardContent>
  );
}
