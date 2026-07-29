import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const sports = [
  {
    emoji: "⚽",
    title: "Fútbol",
  },
  {
    emoji: "🎾",
    title: "Tenis",
  },
  {
    emoji: "🏓",
    title: "Pádel",
  },
  {
    emoji: "🏀",
    title: "Básquet",
  },
];

export function Sports() {
  return (
    <Box
      sx={{
        py: 10,
        bgcolor: "background.neutral",
      }}
    >
      <Container maxWidth="lg">

        <Typography
          variant="h3"
          align="center"
          sx={{ mb: 6 }}
        >
          Deportes disponibles
        </Typography>

        <Grid container spacing={4}>

          {sports.map((sport) => (
            <Grid
              key={sport.title}
              size={{
                xs: 6,
                md: 3,
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  py: 5,
                  textAlign: "center",
                  borderRadius: 3,
                }}
              >
                <Typography variant="h1">
                  {sport.emoji}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{ mt: 2 }}
                >
                  {sport.title}
                </Typography>

              </Paper>
            </Grid>
          ))}

        </Grid>

      </Container>
    </Box>
  );
}