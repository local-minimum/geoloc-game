import { Box } from '@mui/material';
import * as React from 'react';
import GameMap from '../components/GameMap';
import UserHud from '../components/UserHud';
import { GuessOption, isCountry, isSame } from '../hooks/types';
import { useGuessOptions } from '../hooks/useGuessOptions';

export default function GameContainer(): JSX.Element {
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const handleMapReady = React.useCallback(() => {
    if (!mapLoaded) setMapLoaded(true);
  }, [mapLoaded]);

  const [guessOptions, target] = useGuessOptions();
  const [guesses, setGuesses] = React.useState<GuessOption[]>([]);
  const [solvedIt, setSolvedIt] = React.useState<boolean>(false);
  const [foundCountry, setFoundCountry] = React.useState<boolean>(false);

  const handleAddGuess = React.useCallback((guess: GuessOption) => {
    if (target === undefined) return;
    if (isSame(guess, target)) {
      setSolvedIt(true);
    }
    if (isCountry(guess) && target.country === guess.name) {
      setFoundCountry(true);
    }
    setGuesses([...guesses, guess]);
  }, [guesses, target]);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
      }}
    >
      <GameMap
        guesses={guesses}
        onReady={handleMapReady}
        target={target}
        showMap={guesses.some((guess) => isSame(guess, target))}
      />
      <UserHud
        options={guessOptions}
        onGuess={handleAddGuess}
        guesses={guesses}
        target={target}
        solved={solvedIt}
        foundCountry={foundCountry}
      />
    </Box>
  );
}
