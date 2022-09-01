import * as React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography,
} from '@mui/material';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

interface HowToPlayProps {
  open?: boolean;
  onClose?: () => void;
}

export function HowToPlay({
  onClose, open = true,
}: HowToPlayProps): JSX.Element | null {
  const [dismiss, setDismiss] = useState(false);

  const handleClose = React.useCallback(() => {
    setDismiss(true);
    onClose?.();
  }, [onClose]);

  if (!open || dismiss) return null;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>How to play</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          The aim is to guess the city that the computer
          {' '}
          <em>thinks</em>
          {' '}
          about.
          The computer will let you know roughly how far your guess is from the target.
          <em>
            Note that this is not exact, especially close to the poles
            or when your guess is far off.
          </em>
        </Typography>
        <Typography gutterBottom>
          If you guess a country it will be drawn out which can help understanding
          distances on the map.
          If the country you guessed is the correct one it will get a distinct color.
        </Typography>
        <Typography gutterBottom>
          The map starts out completely blank and will remain so until you
          fill it with your guesses.
        </Typography>
        <Typography variant="caption">
          <strong>Credits</strong>
          <br />
          Map tiles by
          {' '}
          <a href="http://stamen.com">Stamen Design</a>
          , under
          {' '}
          <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>
          . Data by
          {' '}
          <a href="http://openstreetmap.org">OpenStreetMap</a>
          , under
          {' '}
          <a href="http://www.openstreetmap.org/copyright">ODbL</a>
          .
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={handleClose}
          startIcon={<FontAwesomeIcon icon={faClose} />}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
