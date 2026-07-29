import { useRouter } from 'src/routes/hooks';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export function Navbar() {
  const router = useRouter();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      color="transparent"
      sx={{
        backdropFilter: 'blur(12px)',
        bgcolor: 'rgba(15,23,42,.65)',
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          <Typography
            variant="h5"
            sx={{
              cursor: 'pointer',
              fontWeight: 700,
            }}
            onClick={() => router.push('/')}
          >
            MiCancha
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Stack
            direction="row"
            spacing={1}
          >
            <Button
              color="inherit"
              onClick={() => router.push('/sign-in')}
            >
              Ingresar
            </Button>

            <Button
              variant="contained"
              onClick={() => router.push('/sign-up')}
            >
              Registrarse
            </Button>
          </Stack>

        </Toolbar>
      </Container>
    </AppBar>
  );
}