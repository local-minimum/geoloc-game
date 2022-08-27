import { City } from './hooks/useCities';

export interface CityWithTargetInfo extends City {
  sameCountry: boolean;
  sameRegion: boolean;
  isSame: boolean;
}
