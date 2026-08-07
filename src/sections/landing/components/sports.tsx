import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

const sports = [
  {
    icon: 'solar:tennis-bold',
    title: 'Pádel Doble',
  },
  {
    icon: 'solar:tennis-bold',
    title: 'Pádel Single',
  },
  {
    icon: 'solar:football-bold',
    title: 'Futbolito 6',
  },
  {
    icon: 'solar:football-bold',
    title: 'Futbolito 7',
  },
  {
    icon: 'solar:football-bold',
    title: 'Futbolito 8',
  },
  {
    icon: 'solar:football-bold',
    title: 'Fútbol 9',
  },
  {
    icon: 'solar:football-bold',
    title: 'Fútbol 11',
  },
  {
    icon: 'solar:football-bold',
    title: 'Futbolito Techado',
  },
  {
    icon: 'solar:tennis-bold',
    title: 'Tenis',
  },
  {
    icon: 'mdi:racquetball',
    title: 'Raquetbol',
  },
  {
    icon: 'mdi:squash',
    title: 'Squash',
  },
  {
    icon: 'mdi:hockey-sticks',
    title: 'Hockey',
  },
  {
    icon: 'solar:basketball-bold',
    title: 'Multicancha',
  },
  {
    icon: 'solar:basketball-bold',
    title: 'Multicancha Techada',
  },
  {
    icon: 'mdi:rugby',
    title: 'Rugby',
  },
  {
    icon: 'mdi:go-kart',
    title: 'E-Karting',
  },
  {
    icon: 'mdi:table-tennis',
    title: 'Tenis de Mesa',
  },
  {
    icon: 'mdi:volleyball',
    title: 'Voleibol',
  },
/*   {
    icon: 'mdi:handball',
    title: 'Handball',
  }, */
];

export function Sports() {
  return (
    <Box
      sx={{
        py: 10,
        bgcolor: 'background.neutral',
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
                sm: 4,
                md: 3,
                lg: 2,
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  py: 5,
                  px: 2,
                  height: '100%',
                  borderRadius: 3,
                  textAlign: 'center',
                  transition: 'all .25s',

                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: (theme) => theme.shadows[10],
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify
                    icon={sport.icon}
                    width={64}
                    sx={{
                      color: 'primary.main',
                    }}
                  />
                </Box>

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