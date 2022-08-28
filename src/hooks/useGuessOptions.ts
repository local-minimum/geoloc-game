import { flatten, sample } from 'lodash';
import { ProjectionLike } from 'ol/proj';
import { useMemo } from 'react';
import { deepFromLonLat } from '../utils/geo';
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

export function useGuessOptions(projection: ProjectionLike): [GuessOption[], City] {
  const rawCities = useCities();
  const cities = useMemo(() => rawCities.map(({ country, ...rest }) => ({
    country: CountryTranslations[country ?? ''] === undefined ? country : CountryTranslations[country ?? ''],
    ...rest,
  })) as GuessOption[], [rawCities]);

  const rawCountries = useCountries();
  const countries = useMemo(() => rawCountries.map(({ coordinates, ...rest }) => ({
    coordinates: deepFromLonLat(coordinates, projection),
    ...rest,
  })) as GuessOption[], [rawCountries, projection]);

  return useMemo(() => [
    flatten([cities, countries])
      .sort(({ name: a }, { name: b }) => (a > b ? 1 : -1)),
    asCity(sample(cities)),
  ], [cities, countries]);
}
