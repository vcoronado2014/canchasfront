import { useRouter } from 'src/routes/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export function Hero() {
  const router = useRouter();

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 700,
        display: 'flex',
        alignItems: 'center',
        color: 'common.white',
        overflow: 'hidden',

        backgroundImage: `
          linear-gradient(
            rgba(0,0,0,.65),
            rgba(0,0,0,.65)
          ),
          url("https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1800&q=80")
        `,

        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container maxWidth="lg">

        <Stack
            spacing={4}
            maxWidth={700}
            sx={{
                pt: {
                    xs: 10,
                    md: 6,
                },
            }}
        >

          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            RESERVA ONLINE
          </Typography>

          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
            }}
          >
            Encuentra y reserva tu cancha favorita
          </Typography>

          <Typography
            variant="h5"
            sx={{
              opacity: .9,
            }}
          >
            Reserva canchas de fútbol, pádel, tenis y básquet
            desde cualquier dispositivo.
          </Typography>

          <Stack
            direction="row"
            spacing={2}
          >
            <Button
              size="large"
              variant="contained"
              onClick={() => router.push('/sign-up')}
            >
              Registrarse
            </Button>

            <Button
              size="large"
              color="inherit"
              variant="outlined"
              onClick={() => router.push('/sign-in')}
            >
              Ingresar
            </Button>
          </Stack>

        </Stack>

      </Container>
    </Box>
  );
}