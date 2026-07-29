import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const steps = [
  {
    number: "1",
    title: "Busca",
    description: "Encuentra un club deportivo cercano.",
  },
  {
    number: "2",
    title: "Reserva",
    description: "Selecciona fecha y horario.",
  },
  {
    number: "3",
    title: "Disfruta",
    description: "Solo llega y juega.",
  },
];

export function HowItWorks() {
  return (
    <Box
      sx={{
        py: 10,
      }}
    >
      <Container maxWidth="lg">

        <Typography
          variant="h3"
          align="center"
          sx={{ mb: 6 }}
        >
          ¿Cómo funciona?
        </Typography>

        <Grid container spacing={4}>

          {steps.map((step) => (
            <Grid
              key={step.number}
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <Paper
                sx={{
                  p: 5,
                  borderRadius: 3,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h2"
                  color="primary"
                >
                  {step.number}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{ mt: 2 }}
                >
                  {step.title}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  {step.description}
                </Typography>

              </Paper>
            </Grid>
          ))}

        </Grid>

      </Container>
    </Box>
  );
}