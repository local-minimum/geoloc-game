import { Coordinate } from 'ol/coordinate';
import { LineString } from 'ol/geom';
import { fromLonLat, ProjectionLike } from 'ol/proj';
import { City } from '../hooks/types';

type AnyCoordinate = Coordinate | Coordinate[] | Coordinate[][];

function isCoordinate(coordinates: unknown): coordinates is Coordinate {
  return Array.isArray(coordinates) && coordinates.every((v) => typeof v === 'number');
}

export function getMapDistance(
  city: City,
  target: City,
): number {
  const [fromLon, fromLat] = city.coordinates;
  const [toLon, toLat] = target.coordinates;

  if (Math.abs(fromLon - toLon) > 180) {
    if (fromLon < toLon) {
      return Math.ceil(new LineString(
        [
          [fromLon + 360, fromLat],
          [toLon, toLat],
        ],
        'XY',
      ).getLength());
    }

    return Math.ceil(new LineString(
      [
        [fromLon, fromLat],
        [toLon + 360, toLat],
      ],
      'XY',
    ).getLength());
  }

  return Math.ceil(new LineString(
    [city.coordinates, target.coordinates],
    'XY',
  ).getLength());
}

export function deepFromLonLat(coordinates: AnyCoordinate, proj: ProjectionLike): AnyCoordinate {
  if (isCoordinate(coordinates)) {
    return fromLonLat(coordinates, proj);
  }
  return coordinates.map((c) => deepFromLonLat(c, proj)) as AnyCoordinate;
}
