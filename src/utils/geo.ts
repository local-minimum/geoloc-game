import { LineString } from 'ol/geom';
import { City } from '../hooks/useCities';

export function getMapDistance(city: City, target: City): number {
  return new LineString([city.coordinates, target.coordinates]).getLength();
}
