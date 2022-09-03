import * as React from 'react';
import {
  faCirclePlay, faDoorClosed, faMedal,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, IconButton,
} from '@mui/material';

interface ActionButtonProps {
  isSmall: boolean;
  solved: boolean;
  surrender: boolean;
  onShowVictory: () => void;
  onGiveUp: () => void;
  onNewGame: () => void;
  showVictory: boolean;
}

export default function ActionButton({
  isSmall, solved, surrender, onShowVictory, showVictory, onGiveUp, onNewGame,
}: ActionButtonProps): JSX.Element {
  if (solved && !surrender) {
    if (isSmall) {
      return (
        <IconButton
          title="Show victory"
          disabled={showVictory}
          onClick={onShowVictory}
          color="primary"
        >
          <FontAwesomeIcon icon={faMedal} />
        </IconButton>
      );
    }
    return (
      <Button
        disabled={showVictory}
        startIcon={<FontAwesomeIcon icon={faMedal} />}
        onClick={onShowVictory}
        variant="outlined"
      >
        Show victory
      </Button>
    );
  }
  if (surrender) {
    if (isSmall) {
      return (
        <IconButton
          title="New Game"
          onClick={onNewGame}
          color="primary"
        >
          <FontAwesomeIcon icon={faCirclePlay} />
        </IconButton>
      );
    }
    return (
      <Button
        variant="outlined"
        onClick={onNewGame}
        startIcon={<FontAwesomeIcon icon={faCirclePlay} />}
      >
        New Game
      </Button>
    );
  }

  if (isSmall) {
    return (
      <IconButton
        title="Give up"
        onClick={onGiveUp}
        color="primary"
      >
        <FontAwesomeIcon icon={faDoorClosed} />
      </IconButton>
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
}
