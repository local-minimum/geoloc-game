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

function notUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

interface UseCitiesProps {
  names?: string[]
  disabled?: boolean;
  randomPopulate?: boolean;
  randomCount?: number;
}

export default function useCities({
  disabled = true,
  names = [],
  randomPopulate = false,
  randomCount = 3,
}: UseCitiesProps): City[] {
  return useMemo(() => {
    if (disabled) return [];
    if (randomPopulate) {
      const order = [...new Array(cities.rows.length).keys()]
        .sort(() => (Math.random() > 0.5 ? 1 : -1));
      return [...new Array(randomCount).keys()]
        .map((idx) => cityRowToCity(cities.rows[order[idx]]));
    }
    return names
      .map((name) => cities.rows.find(([cName]) => cName === name))
      .filter(notUndefined)
      .map(cityRowToCity);
  }, [disabled, names, randomCount, randomPopulate]);
}
