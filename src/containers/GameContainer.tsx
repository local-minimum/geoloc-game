import { Box } from '@mui/material';
import * as React from 'react';
import GameMap from '../components/GameMap';
import UserHud from '../components/UserHud';
import useCities, { City } from '../hooks/useCities';

export default function GameContainer(): JSX.Element {
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const handleMapReady = React.useCallback(() => {
    if (!mapLoaded) setMapLoaded(true);
  }, [mapLoaded]);

  const cities = useCities();
  const [guesses, setGuesses] = React.useState<City[]>([]);
  const handleAddGuess = React.useCallback((city: City) => {
    setGuesses([...guesses, city]);
  }, [guesses]);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
      }}
    >
      <GameMap cities={guesses} onReady={handleMapReady} />
      <UserHud cities={cities} onGuessCity={handleAddGuess} guesses={guesses} />
    </Box>
  );
}
