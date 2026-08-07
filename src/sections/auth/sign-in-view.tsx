import { useState, useCallback } from 'react';
import { useAuth } from 'src/auth/use-auth';
import { getApiError } from "src/api/api-error";

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';


// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


/*   const handleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const auth = await login(email, password);

      if (auth.tipo === "Cliente") {
        // 1. Leemos el destino guardado
        const redirectTo = sessionStorage.getItem("redirectTo");

        if (redirectTo) {
          // 2. Limpiamos la clave para que no afecte logins futuros
          sessionStorage.removeItem("redirectTo");
          router.push('/cliente/disponibilidad');
        } else {
          // 3. Flujo normal: entra directo a /cliente
          router.push("/cliente/disponibilidad");
        }
      } else {
        router.push("/dashboard");
      }

    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [email, password, login, router]); */
  
  const handleSignIn = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    // Solo ejecutas el login, GuestGuard se encarga de la redirección automáticamente
    await login(email, password);

  } catch (err) {
    setError(getApiError(err));
  } finally {
    setLoading(false);
  }
}, [email, password, login]);

  const renderForm = (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSignIn();
      }}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      <TextField
        disabled={loading}
        value={email}
        fullWidth
        name="email"
        label="Email address"
        /* defaultValue="hello@gmail.com" */
        onChange={(e)=>setEmail(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
        Forgot password?
      </Link>

      <TextField
        disabled={loading}
        value={password}
        fullWidth
        name="password"
        label="Password"
        /* defaultValue="@demo1234" */
        type={showPassword ? 'text' : 'password'}
        onChange={(e)=>setPassword(e.target.value)}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      {
        error &&
        <Typography
          color="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Typography>
      }

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        disabled={loading}
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Ingresar</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          No tienes cuenta?
          <Link 
            variant="subtitle2" sx={{ ml: 0.5 }}
            onClick={() => router.push("/sign-up")}
          >
            Registrate
          </Link>
        </Typography>
      </Box>
      {renderForm}
    </>
  );
}
