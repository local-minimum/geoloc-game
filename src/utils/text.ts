import { GuessOption, isCity, isCountry } from '../hooks/types';

export function guessName(option: GuessOption | undefined): string {
  if (option === undefined) return '';
  if (isCity(option)) {
    if (option.country == null && option.region == null) return option.name;
    if (option.region == null) return `${option.name} || ${option.country}`;
    if (option.country == null) return `${option.name} | ${option.region} |`;
    return `${option.name} | ${option.region} | ${option.country}`;
  }
  if (isCountry(option)) {
    return option.name;
  }
  return option.name;
}
