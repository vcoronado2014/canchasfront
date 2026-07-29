import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export function Footer() {
  return (
    <Box
      sx={{
        bgcolor: "grey.900",
        color: "common.white",
        mt: 10,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          py: 6,
        }}
      >

        <Typography
          variant="h5"
          gutterBottom
        >
          MiCancha
        </Typography>

        <Typography
          sx={{
            color: "grey.400",
          }}
        >
          Plataforma para administrar y reservar
          canchas deportivas.
        </Typography>

        <Divider
          sx={{
            my: 4,
            borderColor: "grey.800",
          }}
        />

        <Typography
          align="center"
          color="grey.500"
        >
          © {new Date().getFullYear()} MiCancha.
          Todos los derechos reservados.
        </Typography>

      </Container>
    </Box>
  );
}