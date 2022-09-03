import * as React from 'react';
import {
  Button,
  Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography,
} from '@mui/material';
import {
  faHandPeace, faClose, faCirclePlay, faPeopleArrows,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSnackbar } from 'notistack';
import { City, GuessOption } from '../hooks/types';
import { guessName } from '../utils/text';
import { pluralize } from '../utils/plural';

interface VictoryProps {
  open: boolean;
  onClose: () => void;
  cities: number,
  countries: number,
  start?: GuessOption,
  target?: City,
  onNewGame: () => void;
  playingChallenge: boolean;
  isSmall: boolean;
}

const sx = {
  diplay: 'block', marginLeft: 4, fontWeight: 600, marginTop: 1, marginBottom: 1,
};

export default function Victory({
  open, onClose, cities, countries, start, target, onNewGame, playingChallenge, isSmall,
}: VictoryProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();

  const handleBrag = () => {
    const msg = playingChallenge
      ? `I found the challenge target using ${cities} 🏙️ and ${countries} 🏳️`
      : `I found my way from ${start?.name} to ${target?.name} using ${cities} 🏙️ and ${countries} 🏳️`;
    navigator.clipboard.writeText(msg);
    enqueueSnackbar('Copied message to clipboard', { variant: 'info' });
  };

  const handleChallenge = () => {
    const s = JSON.stringify(target);
    const chall = btoa(s);
    const url = `${window.location.href.split('?')[0]}?challenge=${chall}`;
    const msg = `I found my way to this goal using ${cities} 🏙️ and ${countries} 🏳️: ${url}`;
    navigator.clipboard.writeText(msg);
    enqueueSnackbar('Copied message to clipboard', { variant: 'info' });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Victory!
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          You found your way from
          <Typography sx={sx}>
            {guessName(start)}
          </Typography>
          to
          <Typography sx={sx}>
            {guessName(target)}
          </Typography>
          using
          {' '}
          {cities}
          {' '}
          city and
          {' '}
          {countries}
          {' '}
          {pluralize('guess', cities + countries)}
        </Typography>
      </DialogContent>
      <DialogActions>
        {isSmall ? (
          <IconButton
            onClick={handleBrag}
            title="Brag"
            color="primary"
          >
            <FontAwesomeIcon icon={faHandPeace} />
          </IconButton>
        ) : (
          <Button
            variant="outlined"
            onClick={handleBrag}
            startIcon={<FontAwesomeIcon icon={faHandPeace} />}
          >
            Brag
          </Button>
        )}
        {isSmall ? (
          <IconButton
            title="Challenge"
            color="primary"
            onClick={handleChallenge}
          >
            <FontAwesomeIcon icon={faPeopleArrows} />
          </IconButton>
        ) : (
          <Button
            variant="outlined"
            onClick={handleChallenge}
            startIcon={<FontAwesomeIcon icon={faPeopleArrows} />}
          >
            Challange
          </Button>
        )}
        {isSmall ? (
          <IconButton
            onClick={onNewGame}
            title="New Game"
            color="primary"
          >
            <FontAwesomeIcon icon={faCirclePlay} />
          </IconButton>
        ) : (
          <Button
            variant="outlined"
            onClick={onNewGame}
            startIcon={<FontAwesomeIcon icon={faCirclePlay} />}
          >
            New Game
          </Button>
        )}
        {isSmall ? (
          <IconButton
            onClick={onClose}
            title="Close"
            color="primary"
          >
            <FontAwesomeIcon icon={faClose} />
          </IconButton>
        ) : (
          <Button
            variant="outlined"
            onClick={onClose}
            startIcon={<FontAwesomeIcon icon={faClose} />}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
