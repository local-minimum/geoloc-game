import { faCity, faFlag, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Badge, ListItemIcon, Stack, Typography,
} from '@mui/material';
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
      <Typography component="span">
        <ListItemIcon>
          {city.capital ? (
            <Badge
              badgeContent={<FontAwesomeIcon icon={faStar} size="xs" color="red" />}
            >
              <FontAwesomeIcon icon={faCity} color="black" />
            </Badge>
          ) : (
            <FontAwesomeIcon icon={faCity} color="black" />
          )}
        </ListItemIcon>
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
    <Typography textTransform="uppercase" component="span">
      <ListItemIcon>
        <FontAwesomeIcon icon={faFlag} color="black" />
      </ListItemIcon>
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
