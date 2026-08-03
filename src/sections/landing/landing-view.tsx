import Box from '@mui/material/Box';
import { Hero } from './components/hero';
import { Navbar } from './components/navbar';
import { _clubs } from 'src/_mock';
import { FeaturedClubs } from './components/feaured-club';
import { Sports } from './components/sports';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { LandingDisponibilidad } from './components/landing-disponibilidad';

/* import { Hero } from './hero';
import { Footer } from './footer';
import { Sports } from './sports';
import { HowItWorks } from './how-it-works';
import { FeaturedClubs } from './featured-clubs'; */

export function LandingView() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
        <Navbar/>
        <Hero/>
        <LandingDisponibilidad />
        <FeaturedClubs clubs={_clubs} />

        <Sports/>
        <HowItWorks/>
        <Footer/>
    </Box>
  );
}