import { flatten, sample } from 'lodash';
import { useMemo } from 'react';
import {
  asCity, GuessOption, City,
} from './types';
import useCities from './useCities';
import useCountries from './useCountries';

const CountryTranslations: Record<string, string> = {
  China: 'People\'s Republic of China',
  'Congo (Kinshasa)': 'Democratic Republic of the Congo',
  'Guinea Bissau': 'Guinea-Bissau',
  'Congo (Brazzaville)': 'Republic of the Congo',
  'Hong Kong S.A.R.': 'Hong Kong',
  eSwatini: 'Eswatini',
  Czechia: 'Czech Republic',
  'Sao Tome and Principe': 'São Tomé and Príncipe',
  Vatican: 'Vatican City',
};

export function useGuessOptions(): [GuessOption[], City] {
  const cities = useCities().map(({ country, ...rest }) => ({
    country: CountryTranslations[country ?? ''] === undefined ? country : CountryTranslations[country ?? ''],
    ...rest,
  })) as GuessOption[];
  const countries = useCountries() as GuessOption[];
  return useMemo(() => [
    flatten([cities, countries])
      .sort(({ name: a }, { name: b }) => (a > b ? 1 : -1)),
    asCity(sample(cities)),
  ], [cities, countries]);
}
