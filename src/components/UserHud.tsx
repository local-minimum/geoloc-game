import {
  faCirclePlay,
  faCity, faDoorClosed, faFlag, faMedal,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Badge, Button, Paper, Tooltip, Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import { first, last } from 'lodash';
import * as React from 'react';
import {
  City, GuessOption, isCity,
} from '../hooks/types';
import GuessInput from './GuessInput';
import Victory from './Victory';

interface UserHudProps {
  options: GuessOption[],
  guesses: GuessOption[],
  assists: City[],
  target: City | undefined,
  onGuess: (guess: GuessOption) => void,
  onGiveUp: () => void;
  solved: boolean;
  foundCountry: boolean;
  surrender: boolean;
  playingChallenge: boolean;
}

export default function UserHud({
  options, onGuess, guesses, target, solved, foundCountry, onGiveUp, assists, surrender,
  playingChallenge,
}: UserHudProps): JSX.Element {
  const [showVictory, setShowVictory] = React.useState(true);
  const start = first(guesses);
  const guess = last(guesses);
  const cities = guesses.filter(isCity).length;
  const countries = guesses.length - cities;

  const handleNewGame = () => {
    window.location.reload();
  };

  const actionButton = (): JSX.Element => {
    if (solved && !surrender) {
      return (
        <Button
          disabled={showVictory}
          startIcon={<FontAwesomeIcon icon={faMedal} />}
          onClick={() => setShowVictory(true)}
          variant="outlined"
        >
          Show victory
        </Button>
      );
    }
    if (surrender) {
      return (
        <Button
          variant="outlined"
          onClick={handleNewGame}
          startIcon={<FontAwesomeIcon icon={faCirclePlay} />}
        >
          New Game
        </Button>
      );
    }

    return (
      <Button
        disabled={solved}
        startIcon={<FontAwesomeIcon icon={faDoorClosed} />}
        onClick={onGiveUp}
        variant="outlined"
      >
        Give up
      </Button>
    );
  };

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'fixed',
        top: 5,
        left: 'max(5%, 50px)',
        right: 'max(5%, 50px)',
        padding: 2,
      }}
    >
      <Stack direction="row" gap={2} alignItems="center">
        <GuessInput
          options={options}
          guesses={guesses}
          assists={assists}
          target={target}
          foundCountry={foundCountry}
          onGuess={onGuess}
          onGiveUp={onGiveUp}
        />
        <Tooltip title="City guesses">
          <Badge badgeContent={cities} color="primary">
            <FontAwesomeIcon icon={faCity} size="2x" />
          </Badge>
        </Tooltip>
        <Tooltip title="Country guesses">
          <Badge badgeContent={countries} color="secondary">
            <FontAwesomeIcon icon={faFlag} size="2x" />
          </Badge>
        </Tooltip>
        {actionButton()}
        <Stack>
          {target && !solved && foundCountry && <Typography>{`The city is in ${target?.country}`}</Typography>}
          {guess && (
            <Typography>
              {solved ? `${surrender ? '' : 'Found it! '}It was ${target?.name ?? ''} of ${target?.country ?? 'no country'}` : `Most Recent guess: ${guess.name}`}
            </Typography>
          )}
        </Stack>
      </Stack>
      <Victory
        playingChallenge={playingChallenge}
        open={solved && !surrender && showVictory}
        onClose={() => setShowVictory(false)}
        target={target}
        start={start}
        cities={cities}
        countries={countries}
        onNewGame={handleNewGame}
      />
    </Paper>
  );
}
