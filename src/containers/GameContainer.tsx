import { sample } from 'lodash';
import { Box } from '@mui/material';
import * as React from 'react';
import GameMap from '../components/GameMap';
import UserHud from '../components/UserHud';
import useCities, { City } from '../hooks/useCities';
import { CityWithTargetInfo } from '../ExtendedCity';
import { getMapDistance } from '../utils/geo';

export default function GameContainer(): JSX.Element {
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const handleMapReady = React.useCallback(() => {
    if (!mapLoaded) setMapLoaded(true);
  }, [mapLoaded]);

  const cities = useCities();
  const target = React.useMemo(() => sample(cities), [cities]);
  const [guesses, setGuesses] = React.useState<CityWithTargetInfo[]>([]);
  const handleAddGuess = React.useCallback((city: City) => {
    if (target === undefined) return;
    const sameCountry = city.country === target?.country;
    const sameRegion = sameCountry && city.region === target?.region;
    const guess: CityWithTargetInfo = {
      ...city,
      sameCountry,
      sameRegion,
      isSame: sameRegion && city.name === target?.name,
      distance: getMapDistance(city, target),
    };
    setGuesses([...guesses, guess]);
  }, [guesses, target]);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
      }}
    >
      <GameMap cities={guesses} onReady={handleMapReady} />
      <UserHud cities={cities} onGuessCity={handleAddGuess} guesses={guesses} target={target} />
    </Box>
  );
}
