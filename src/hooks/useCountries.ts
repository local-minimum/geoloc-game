// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useMemo } from 'react';
import countries from '../data/countries';
import { Country } from './types';

type AnyCoordinate = Coordinate | Coordinate[] | Coordinate[][] | Coordinate[][][];

function isCoordinate(coordinates: unknown): coordinates is Coordinate {
  return Array.isArray(coordinates) && coordinates.every((v) => typeof v === 'number');
}

function getDepth(coordinate: AnyCoordinate, depth = 0): number {
  if (isCoordinate(coordinate)) return depth;
  return getDepth(coordinate[0], depth + 1);
}

function groupCountries(values: Country[]): Country[] {
  const grouped: Record<string, Country> = {};
  values.forEach((country) => {
    if (grouped[country.name] === undefined) {
      grouped[country.name] = country;
    } else if (getDepth(country.coordinates) === 2) {
      grouped[country.name].coordinates = [grouped[country.name].coordinates, country.coordinates];
    } else {
      grouped[country.name].coordinates.push(country.coordinates);
    }
  });

  return [...Object.values(grouped)];
}

function contryRowToCountry(row: unknown[]): Country {
  const [name, continent, colorIdx, type, coordinates] = row;
  return {
    name,
    continent,
    colorIdx,
    type,
    coordinates,
  } as Country;
}

export default function useCountries(): Country[] {
  return useMemo(
    () => groupCountries(
      countries
        .rows
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(contryRowToCountry),
    ),
    [],
  );
}
