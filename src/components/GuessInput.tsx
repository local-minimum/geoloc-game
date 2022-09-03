import * as React from 'react';
import {
  Autocomplete, TextField,
} from '@mui/material';
import {
  asCity, City, GuessOption, isCity, isSame,
} from '../hooks/types';
import { guessName } from '../utils/text';
import GuessInputOption from './GuessInputOption';

interface GuessInputProps {
  options: GuessOption[],
  guesses: GuessOption[],
  assists: City[],
  target: City | undefined,
  onGuess: (guess: GuessOption) => void,
  onGiveUp: () => void;
  foundCountry: boolean;
}

const maxOptions = 40;

export default function GuessInput({
  target, options, assists, guesses, onGuess, foundCountry,
}: GuessInputProps): JSX.Element {
  const [inputValue, setInputValue] = React.useState('');

  return (
    <Autocomplete
      disabled={target === undefined}
      size="small"
      inputValue={inputValue}
      disablePortal
      options={options}
      clearOnBlur
      clearOnEscape
      componentsProps={{
        popper: {
          sx: {
            minWidth: 'min(95%, 400px)',
          },
        },
      }}
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
        const sorter = (a: GuessOption, b: GuessOption) => (
          ( // Promote those that are not yet guessed
            (guesses.some((g) => isSame(g, a)) || assists.some((ass) => isSame(ass, a)))
            && !(guesses.some((g) => isSame(g, b) || assists.some((ass) => isSame(ass, b))))
          ) || ( // Promote those in target country if found
            foundCountry
              && !(isCity(a) && asCity(a).country === target?.country)
              && (isCity(b) && asCity(b).country === target?.country)
          )
            ? 1 : -1);

        if (hits.length > 0) {
          return [
            ...hits,
            ...candidates
              .filter((opt) => !hits.some((opt2) => isSame(opt, opt2)))
              .sort(sorter)
              .slice(0, Math.max(0, maxOptions - hits.length)),
          ];
        }

        return candidates.sort(sorter).slice(0, maxOptions);
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
  );
}
