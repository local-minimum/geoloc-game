import { City } from './hooks/useCities';

export interface CityWithTargetInfo extends City {
  distance: number;
  sameCountry: boolean;
  sameRegion: boolean;
  isSame: boolean;
}
