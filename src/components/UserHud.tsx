import { faCity, faFlag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Autocomplete, Badge, Paper, TextField, Tooltip, Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import { last } from 'lodash';
import * as React from 'react';
import {
  City, GuessOption, isCity, isCountry,
} from '../hooks/types';
import GuessInputOption from './GuessInputOption';

interface UserHudProps {
  options: GuessOption[],
  guesses: GuessOption[],
  target: City | undefined,
  onGuess: (guess: GuessOption) => void,
  solved: boolean;
  foundCountry: boolean;
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

const maxOptions = 30;

export default function UserHud({
  options, onGuess, guesses, target, solved, foundCountry,
}: UserHudProps): JSX.Element {
  const [inputValue, setInputValue] = React.useState('');
  const guess = last(guesses);
  const cities = guesses.filter(isCity).length;
  const countries = guesses.length - cities;
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
          filterOptions={(opts, { inputValue: inputVal }) => {
            const lower = inputVal.toLocaleLowerCase().replace(/ /g, '');
            const candidates = opts
              .filter((o) => guessName(o).toLocaleLowerCase().replace(/ /g, '').includes(lower));
            const [hit] = candidates
              .filter(({ name }) => name.toLowerCase().replace(/ /g, '') === lower);
            if (hit !== undefined) {
              return [
                hit,
                ...candidates.filter((o) => o !== hit).slice(0, maxOptions - 1),
              ];
            }
            return candidates.slice(0, maxOptions);
          }}
          getOptionLabel={guessName}
          sx={{ width: 'min(400px, 80%)' }}
          // eslint-disable-next-line react/jsx-props-no-spreading
          renderInput={(params) => <TextField {...params} label="City" autoFocus />}
          renderOption={(params, opt) => (
            <li
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...params}
            >
              <GuessInputOption option={opt} />
            </li>
          )}
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
        <Typography>
          {target && !solved && foundCountry && `The city is in ${target?.country} | `}
          {guess && (
            solved ? `Found it! It was ${guess.name}` : `Most Recent: ${guess.name}`
          )}
        </Typography>
      </Stack>
    </Paper>
  );
}
