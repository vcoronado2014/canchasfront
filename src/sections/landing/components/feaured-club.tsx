import { _clubs } from 'src/_mock';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { Club } from 'src/auth/auth-types';

type Props = {
  clubs: Club[];
};

export function FeaturedClubs({ clubs }: Props) {
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
          Clubes destacados
        </Typography>

        <Grid container spacing={4}>
          {_clubs.map((club) => (
            <Grid
              key={club.id}
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                }}
              >
                <CardMedia
                  component="img"
                  height="240"
                  image={club.fotoPrincipalUrl}
                  alt={club.nombre}
                />

                <CardContent>

                  <Typography variant="h5">
                    {club.nombre}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      minHeight: 48,
                    }}
                  >
                    {club.descripcion}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 2,
                    }}
                  >
                    📍 {club.comunaNombre}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 3,
                    }}
                  >
                    Ver Club
                  </Button>

                </CardContent>

              </Card>
            </Grid>
          ))}
        </Grid>

      </Container>
    </Box>
  );
}