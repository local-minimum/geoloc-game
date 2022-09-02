import * as React from 'react';
import {
  Button,
  Dialog, DialogActions, DialogContent, DialogTitle, Typography,
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
}

const sx = {
  diplay: 'block', marginLeft: 4, fontWeight: 600, marginTop: 1, marginBottom: 1,
};

export default function Victory({
  open, onClose, cities, countries, start, target, onNewGame,
}: VictoryProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();

  const handleBrag = () => {
    const msg = `I found my way from ${start?.name} to ${target?.name} using ${cities} 🏙️ and ${countries} 🏳️`;
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
        <Button
          variant="outlined"
          onClick={handleBrag}
          startIcon={<FontAwesomeIcon icon={faHandPeace} />}
        >
          Brag
        </Button>
        <Button
          variant="outlined"
          onClick={() => { /* no-op */ }}
          disabled
          startIcon={<FontAwesomeIcon icon={faPeopleArrows} />}
        >
          Challange
        </Button>
        <Button
          variant="outlined"
          onClick={onNewGame}
          startIcon={<FontAwesomeIcon icon={faCirclePlay} />}
        >
          New Game
        </Button>
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<FontAwesomeIcon icon={faClose} />}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
