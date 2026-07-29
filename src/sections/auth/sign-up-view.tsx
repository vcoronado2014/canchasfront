import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { getApiError } from 'src/api/api-error';
import { register } from 'src/auth/auth-service';

export function SignUpView() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = useCallback(async () => {
    try {
      setError('');
      setSuccess('');

      if (!nombre.trim()) {
        setError('Debe ingresar su nombre.');
        return;
      }

      if (!email.trim()) {
        setError('Debe ingresar su correo electrónico.');
        return;
      }

      if (!password) {
        setError('Debe ingresar una contraseña.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }

      setLoading(true);

      await register({
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
        password,
      });

      setSuccess('Cuenta creada correctamente.');

      setTimeout(() => {
        router.push('/sign-in');
      }, 1500);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [
    nombre,
    email,
    telefono,
    password,
    confirmPassword,
    router,
  ]);

  return (
    <>
      <Box
        sx={{
          gap: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h4">
          Crear cuenta
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >
          Regístrate para reservar canchas.
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
      >
        <TextField
          fullWidth
          label="Nombre"
          value={nombre}
          disabled={loading}
          onChange={(e) => setNombre(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Correo electrónico"
          value={email}
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Teléfono"
          value={telefono}
          disabled={loading}
          onChange={(e) => setTelefono(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          value={password}
          disabled={loading}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Iconify
                      icon={
                        showPassword
                          ? 'solar:eye-bold'
                          : 'solar:eye-closed-bold'
                      }
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          fullWidth
          label="Confirmar contraseña"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          disabled={loading}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 3 }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    <Iconify
                      icon={
                        showConfirmPassword
                          ? 'solar:eye-bold'
                          : 'solar:eye-closed-bold'
                      }
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
          >
            {success}
          </Alert>
        )}

        <Button
          fullWidth
          type="submit"
          size="large"
          variant="contained"
          color="inherit"
          disabled={loading}
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>

        <Typography
          variant="body2"
          sx={{
            mt: 3,
            textAlign: 'center',
          }}
        >
          ¿Ya tienes una cuenta?{' '}
          <Link
            component="button"
            underline="hover"
            onClick={() => router.push('/sign-in')}
          >
            Inicia sesión
          </Link>
        </Typography>
      </Box>
    </>
  );
}