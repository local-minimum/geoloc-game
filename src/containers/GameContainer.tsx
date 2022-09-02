import { Box } from '@mui/material';
import { sampleSize } from 'lodash';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import GameMap from '../components/GameMap';
import { HowToPlay } from '../components/HowToPlay';
import UserHud from '../components/UserHud';
import {
  asCity, asCountry, City, Country, GuessOption, isCity, isCountry, isSame,
} from '../hooks/types';
import { useGuessOptions } from '../hooks/useGuessOptions';

const MAP_PROJ = 'EPSG:3857'; // 'EPSG:4326';

export default function GameContainer(): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const handleMapReady = React.useCallback(() => {
    if (!mapLoaded) setMapLoaded(true);
  }, [mapLoaded]);

  const [guessOptions, target] = useGuessOptions(MAP_PROJ);
  const [guesses, setGuesses] = React.useState<GuessOption[]>([]);
  const [solvedIt, setSolvedIt] = React.useState<boolean>(false);
  const [foundCountry, setFoundCountry] = React.useState<boolean>(false);
  const [assistGuesses, setAssistGuesses] = React.useState<City[]>([]);
  const [surrender, setSurrender] = React.useState(false);

  const targetCountry = React.useMemo<Country | undefined>(
    () => {
      const c = guessOptions.find((opt) => isCountry(opt) && opt.name === target.country);
      if (c === undefined) return undefined;
      return asCountry(c);
    },
    [guessOptions, target.country],
  );

  const handleAddGuess = React.useCallback((guess: GuessOption) => {
    if (target === undefined) return;
    if (isSame(guess, target)) {
      setSolvedIt(true);
      enqueueSnackbar('Congratulations!', { variant: 'success' });
    }
    if (isCountry(guess) && target.country === guess.name) {
      setFoundCountry(true);
      enqueueSnackbar('You found the correct country', { variant: 'success' });
    }

    if (isCity(guess) && foundCountry && guess.country === target.country) {
      const unguessed = guessOptions
        .filter(isCity)
        .map(asCity)
        .filter((city) => city.country === target.country && !isSame(city, target))
        .filter((city) => !guesses.some((g) => isSame(city, g)));
      const removals = sampleSize(
        unguessed,
        unguessed.length < 4 ? 0 : Math.floor(unguessed.length / 2),
      );
      setAssistGuesses([...assistGuesses, ...removals]);
    }

    setGuesses([...guesses, guess]);
  }, [assistGuesses, enqueueSnackbar, foundCountry, guessOptions, guesses, target]);

  const handleSurrender = React.useCallback(() => {
    if (target === undefined) return;
    setSolvedIt(true);
    setGuesses([...guesses, target]);
    setSurrender(true);
    enqueueSnackbar('Better luck next time', { variant: 'info' });
  }, [enqueueSnackbar, guesses, target]);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
      }}
    >
      <GameMap
        projection={MAP_PROJ}
        guesses={guesses}
        onReady={handleMapReady}
        target={target}
        showMap={guesses.some((guess) => isSame(guess, target))}
        foundCountry={foundCountry ? targetCountry : undefined}
      />
      <UserHud
        options={guessOptions}
        onGuess={handleAddGuess}
        onGiveUp={handleSurrender}
        guesses={guesses}
        assists={assistGuesses}
        target={target}
        solved={solvedIt}
        foundCountry={foundCountry}
        surrender={surrender}
      />
      <HowToPlay />
    </Box>
  );
}
