import { Coordinate } from 'ol/coordinate';
import { LineString } from 'ol/geom';
import { City } from '../hooks/useCities';

export function getMapDistance(
  city: City,
  target: City,
  converter: (coordinates: Coordinate) => Coordinate,
): number {
  return new LineString(
    [converter(city.coordinates), converter(target.coordinates)],
    'XY',
  ).getLength();
}
