import { faCity, faDoorClosed, faFlag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Autocomplete, Badge, Button, Paper, TextField, Tooltip, Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import { last } from 'lodash';
import * as React from 'react';
import {
  City, GuessOption, isCity, isCountry, isSame,
} from '../hooks/types';
import GuessInputOption from './GuessInputOption';

interface UserHudProps {
  options: GuessOption[],
  guesses: GuessOption[],
  assists: City[],
  target: City | undefined,
  onGuess: (guess: GuessOption) => void,
  onGiveUp: () => void;
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
  options, onGuess, guesses, target, solved, foundCountry, onGiveUp, assists,
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
            (option: GuessOption) => guesses.some((g) => isSame(option, g))
              || assists.some((ass) => isSame(option, ass))
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
            const words = inputVal.toLocaleLowerCase().split(/[ -']/);
            if (inputVal.length === 0) return opts.slice(0, maxOptions);
            const candidates = opts
              .filter((opt) => guessName(opt).toLocaleLowerCase().replace(/ /g, '').includes(lower));
            const hits = candidates
              .filter(({ name }) => name.toLowerCase().replace(/ /g, '') === lower
                || name.toLowerCase().split(/[ -']/).filter((w) => words.includes(w)).length === words.length);
            if (hits.length > 0) {
              return [
                ...hits,
                ...candidates
                  .filter((opt) => !hits.some((opt2) => isSame(opt, opt2)))
                  .slice(0, Math.max(0, maxOptions - hits.length)),
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
        <Button
          disabled={solved}
          startIcon={<FontAwesomeIcon icon={faDoorClosed} />}
          onClick={onGiveUp}
          variant="outlined"
        >
          Give up
        </Button>
        <Stack>
          {target && !solved && foundCountry && <Typography>{`The city is in ${target?.country}`}</Typography>}
          {guess && (
            <Typography>
              {solved ? `Found it! It was ${target?.name ?? ''} of ${target?.country ?? 'no country'}` : `Most Recent guess: ${guess.name}`}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
