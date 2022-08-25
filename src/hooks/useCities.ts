import { useMemo } from 'react';
import cities, { CityRow } from '../data/cities';

export interface City {
  name: string;
  capital: 1 | 0;
  country: string | null;
  region: string | null;
  coordinates: [longitude: number, latitude: number];
}

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
  return useMemo(() => cities.rows.map(cityRowToCity), []);
}
