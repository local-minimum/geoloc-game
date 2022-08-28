import { faCity, faFlag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Stack, Typography } from '@mui/material';
import * as React from 'react';
import {
  City, Country, GuessOption, isCity, isCountry,
} from '../hooks/types';

interface RenderCityOptionProps {
  city: City;
}

function RenderCityOption({ city }: RenderCityOptionProps): JSX.Element {
  return (
    <Stack>
      <Typography>
        <FontAwesomeIcon icon={faCity} />
        {' '}
        {city.name}
      </Typography>
      <Typography variant="caption">
        {city.region ?? ''}
        {' | '}
        {city.country ?? ''}
      </Typography>
    </Stack>
  );
}

interface RenderCountryProps {
  country: Country;
}

function RenderCountry({ country }: RenderCountryProps): JSX.Element {
  return (
    <Typography textTransform="uppercase">
      <FontAwesomeIcon icon={faFlag} />
      {' '}
      {country.name}
    </Typography>
  );
}

interface GuessInputOptionProps {
  option: GuessOption;
}

export default function GuessInputOption({ option }: GuessInputOptionProps): JSX.Element {
  if (isCity(option)) {
    return <RenderCityOption city={option} />;
  }
  if (isCountry(option)) {
    return <RenderCountry country={option} />;
  }
  return <div />;
}
