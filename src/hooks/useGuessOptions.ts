import { flatten, sample } from 'lodash';
import { useMemo } from 'react';
import { asCity, GuessOption, City } from './types';
import useCities from './useCities';
import useCountries from './useCountries';

export function useGuessOptions(): [GuessOption[], City] {
  const cities = useCities() as GuessOption[];
  const countries = useCountries() as GuessOption[];
  return useMemo(() => [
    flatten([cities, countries])
      .sort(({ name: a }, { name: b }) => (a > b ? 1 : -1)),
    asCity(sample(cities)),
  ], [cities, countries]);
}
