import { Autocomplete, Paper, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import { last } from 'lodash';
import * as React from 'react';
import { CityWithTargetInfo } from '../ExtendedCity';
import { City } from '../hooks/useCities';

interface UserHudProps {
  cities: City[],
  guesses: CityWithTargetInfo[],
  target: City | undefined,
  onGuessCity: (guess: City) => void,
}

function guessName(city: City): string {
  if (city.country == null && city.region == null) return city.name;
  if (city.region == null) return `${city.name} || ${city.country}`;
  if (city.country == null) return `${city.name} | ${city.region} |`;
  return `${city.name} | ${city.region} | ${city.country}`;
}

export default function UserHud({
  cities, onGuessCity, guesses, target,
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
          options={cities}
          clearOnBlur
          clearOnEscape
          getOptionDisabled={
            (option: City) => guesses.some((g) => guessName(g) === guessName(option))
          }
          onChange={(_, city) => city !== null && onGuessCity(city)}
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
          getOptionLabel={(option: City) => guessName(option)}
          sx={{ width: 'min(400px, 80%)' }}
          // eslint-disable-next-line react/jsx-props-no-spreading
          renderInput={(params) => <TextField {...params} label="City" autoFocus />}
        />
        {guess && (
          guess.isSame ? `Found it! It was ${guess.name}` : `Most Recent: ${guess.name}`
        )}
      </Stack>
    </Paper>
  );
}
