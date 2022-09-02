import { isEqual } from 'lodash';
import { Coordinate } from 'ol/coordinate';

export interface GuessOption {
  name: string;
}

export interface City extends GuessOption {
  capital: 1 | 0;
  country: string | null;
  region: string | null;
  coordinates: [longitude: number, latitude: number];
}

enum CountryType {
  Country = 0,
  Dependency = 1,
  Disputed = 2,
  GeoCore = 3,
  GeoSubunit = 4,
  GeoUnit = 5,
  Indeterminate = 6,
  Lease = 7,
  Overlay = 8,
  SovereignCountry = 9,
  Sovereignty = 10
}

export interface Country extends GuessOption {
 continent: string;
 colorIdx: number,
 type: CountryType,
 coordinates: Coordinate[][]
}

export function isCity(guessOption: GuessOption | undefined): guessOption is City {
  if (guessOption === undefined) return false;

  return (guessOption as City).country !== undefined;
}

export function isCountry(guessOption: GuessOption | undefined): guessOption is Country {
  if (guessOption === undefined) return false;

  return (guessOption as Country).type !== undefined;
}

export function asCity(guessOption: GuessOption | undefined): City {
  if (isCity(guessOption)) return guessOption;
  throw new Error('not a city');
}

export function asCountry(guessOption: GuessOption | undefined): Country {
  if (isCountry(guessOption)) return guessOption;
  throw new Error('not a country');
}

export function isSame(guessOption: GuessOption, target: GuessOption | undefined | null): boolean {
  if (target == undefined) return false;
  if (guessOption.name !== target.name) return false;
  if (isCity(guessOption) && isCity(target)) {
    return isEqual(guessOption.coordinates, target.coordinates);
  }
  if (isCountry(guessOption) && isCountry(target)) {
    return true;
  }
  return false;
}
