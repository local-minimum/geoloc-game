import { City } from './hooks/types';

export interface CityWithTargetInfo extends City {
  sameCountry: boolean;
  sameRegion: boolean;
  isSame: boolean;
}
