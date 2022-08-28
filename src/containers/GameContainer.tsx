import { Box } from '@mui/material';
import * as React from 'react';
import GameMap from '../components/GameMap';
import UserHud from '../components/UserHud';
import { GuessOption, isSame } from '../hooks/types';
import { useGuessOptions } from '../hooks/useGuessOptions';

export default function GameContainer(): JSX.Element {
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const handleMapReady = React.useCallback(() => {
    if (!mapLoaded) setMapLoaded(true);
  }, [mapLoaded]);

  const [guessOptions, target] = useGuessOptions();
  const [guesses, setGuesses] = React.useState<GuessOption[]>([]);
  const handleAddGuess = React.useCallback((guess: GuessOption) => {
    if (target === undefined) return;
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
      />
    </Box>
  );
}
