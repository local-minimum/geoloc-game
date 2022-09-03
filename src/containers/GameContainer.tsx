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

export default function GameContainer(): JSX.Element | null {
  const { enqueueSnackbar } = useSnackbar();
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const handleMapReady = React.useCallback(() => {
    if (!mapLoaded) setMapLoaded(true);
  }, [mapLoaded]);

  const [guessOptions, rndTarget] = useGuessOptions(MAP_PROJ);
  const [guesses, setGuesses] = React.useState<GuessOption[]>([]);
  const [solvedIt, setSolvedIt] = React.useState<boolean>(false);
  const [foundCountry, setFoundCountry] = React.useState<boolean>(false);
  const [assistGuesses, setAssistGuesses] = React.useState<City[]>([]);
  const [surrender, setSurrender] = React.useState(false);
  const [target, setTarget] = React.useState<City | null>(null);

  const liveTarget = target ?? rndTarget;

  const targetCountry = React.useMemo<Country | undefined>(
    () => {
      const c = guessOptions.find((opt) => isCountry(opt) && opt.name === liveTarget?.country);
      if (c === undefined) return undefined;
      return asCountry(c);
    },
    [guessOptions, liveTarget?.country],
  );

  const handleAddGuess = React.useCallback((guess: GuessOption) => {
    if (liveTarget == null) return;
    if (isSame(guess, liveTarget)) {
      setSolvedIt(true);
      enqueueSnackbar('Congratulations!', { variant: 'success' });
    }
    if (isCountry(guess) && liveTarget?.country === guess.name) {
      setFoundCountry(true);
      enqueueSnackbar('You found the correct country', { variant: 'success' });
    }

    if (isCity(guess) && foundCountry && guess.country === liveTarget?.country) {
      const sameCountryGuesses = guesses
        .filter(isCity)
        .map(asCity)
        .filter((city) => city.country === liveTarget.country);

      if (sameCountryGuesses.length > 1) {
        const unguessed = guessOptions
          .filter(isCity)
          .map(asCity)
          .filter((city) => city.country === liveTarget.country && !isSame(city, liveTarget))
          .filter((city) => !(
            sameCountryGuesses.some((g) => isSame(city, g))
            || assistGuesses.some((g) => isSame(city, g))
          ));

        const removals = sampleSize(
          unguessed,
          unguessed.length < 4 ? 0 : Math.floor(unguessed.length / 2),
        );
        setAssistGuesses([...assistGuesses, ...removals]);
      }
    }

    setGuesses([...guesses, guess]);
  }, [assistGuesses, enqueueSnackbar, foundCountry, guessOptions, guesses, liveTarget]);

  const handleSurrender = React.useCallback(() => {
    if (liveTarget == null) return;
    setSolvedIt(true);
    setGuesses([...guesses, liveTarget]);
    setSurrender(true);
    enqueueSnackbar('Better luck next time', { variant: 'info' });
  }, [enqueueSnackbar, guesses, liveTarget]);

  React.useEffect(() => {
    const challenge = new URLSearchParams(window.location.search).get('challenge');
    if (challenge !== null) {
      const rawCity = atob(challenge);
      const parsedCity = JSON.parse(rawCity.toString());
      if (isCity(parsedCity)) {
        setTarget(asCity(parsedCity));
      }
      window.history.replaceState(null, '', window.location.href.split('?')[0]);
    }
  }, []);

  if (liveTarget == null) return null;

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
        target={liveTarget}
        showMap={guesses.some((guess) => isSame(guess, liveTarget))}
        foundCountry={foundCountry ? targetCountry : undefined}
      />
      <UserHud
        options={guessOptions}
        onGuess={handleAddGuess}
        onGiveUp={handleSurrender}
        guesses={guesses}
        assists={assistGuesses}
        target={liveTarget}
        solved={solvedIt}
        foundCountry={foundCountry}
        surrender={surrender}
        playingChallenge={target != null}
      />
      <HowToPlay />
    </Box>
  );
}
