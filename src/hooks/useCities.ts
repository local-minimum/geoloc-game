import { useMemo } from 'react';
import cities, { CityRow } from '../data/cities';
import { City } from './types';

function cityRowToCity(row: CityRow): City {
  const [name, capital, country, region, longitude, latitude] = row;
  return {
    name,
    capital,
    country,
    region,
    coordinates: [longitude, latitude],
  };
}

export default function useCities(): City[] {
  return useMemo(
    () => cities.rows.sort(([a], [b]) => (a > b ? 1 : -1)).map(cityRowToCity),
    [],
  );
}
