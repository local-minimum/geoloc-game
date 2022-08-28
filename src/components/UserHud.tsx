import { Autocomplete, Paper, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import { last } from 'lodash';
import * as React from 'react';
import {
  City, GuessOption, isCity, isCountry, isSame,
} from '../hooks/types';

interface UserHudProps {
  options: GuessOption[],
  guesses: GuessOption[],
  target: City | undefined,
  onGuess: (guess: GuessOption) => void,
}

function guessName(option: GuessOption): string {
  if (isCity(option)) {
    if (option.country == null && option.region == null) return option.name;
    if (option.region == null) return `${option.name} || ${option.country}`;
    if (option.country == null) return `${option.name} | ${option.region} |`;
    return `${option.name} | ${option.region} | ${option.country}`;
  }
  if (isCountry(option)) {
    return option.name;
  }
  return option.name;
}

export default function UserHud({
  options, onGuess, guesses, target,
}: UserHudProps): JSX.Element {
  const [inputValue, setInputValue] = React.useState('');
  const guess = last(guesses);
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
      <Stack direction="row">
        <Autocomplete
          disabled={target === undefined}
          size="small"
          inputValue={inputValue}
          disablePortal
          options={options}
          clearOnBlur
          clearOnEscape
          getOptionDisabled={
            (option: GuessOption) => guesses.some((g) => guessName(g) === guessName(option))
          }
          onChange={(_, option) => option !== null && onGuess(option)}
          onInputChange={(_, value, reason) => {
            switch (reason) {
              case 'input':
                setInputValue(value);
                break;
              case 'clear':
              case 'reset':
                setInputValue('');
                break;
            }
          }}
          getOptionLabel={guessName}
          sx={{ width: 'min(400px, 80%)' }}
          // eslint-disable-next-line react/jsx-props-no-spreading
          renderInput={(params) => <TextField {...params} label="City" autoFocus />}
        />
        {guess && (
          isSame(guess, target) ? `Found it! It was ${guess.name}` : `Most Recent: ${guess.name}`
        )}
      </Stack>
    </Paper>
  );
}
