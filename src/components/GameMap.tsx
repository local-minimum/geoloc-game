import * as React from 'react';
import Map from 'ol/Map';
import { alpha, Box } from '@mui/material';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import 'ol/ol.css';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { Feature } from 'ol';
import { Point, Polygon } from 'ol/geom';
import {
  Fill, Stroke, Style, Text,
} from 'ol/style';
import { fromLonLat } from 'ol/proj';
import CircleStyle from 'ol/style/Circle';
// import { Coordinate } from 'ol/coordinate';
import {
  City, Country, GuessOption, isCity, isCountry,
} from '../hooks/types';
import usePrevious from '../hooks/usePrevious';
import { getMapDistance } from '../utils/geo';

/*
#438db6
#c2ddd0
#d8ecde
#ec957d
#e77158
#c3c3a8
*/

const countryStyle = new Style({
  zIndex: 10,
  fill: new Fill({ color: '#438db6' }),
  stroke: new Stroke({
    color: '#c2ddd0',
    width: 1,
  }),
});

const cityStyle = new Style({
  zIndex: 100,
  image: new CircleStyle({
    radius: 4,
    fill: new Fill({ color: '#ec957d' }),
    stroke: new Stroke({
      color: '#e77158',
      width: 2,
    }),
  }),
  text: new Text({
    placement: 'point',
    fill: new Fill({ color: '#ec957d' }),
    stroke: new Stroke({ color: '#ec957d', width: 1 }),
    offsetY: -12,
  }),
});

const withAreaStyle = new Style({
  zIndex: 10,
  image: new CircleStyle({
    radius: 4,
    fill: new Fill({ color: alpha('#c2ddd0', 0.4) }),
    stroke: new Stroke({
      color: alpha('#d8ecde', 0.7),
      width: 2,
    }),
  }),
});

interface GameMapProps {
  guesses?: GuessOption[];
  target?: City;
  onReady: () => void;
  showMap?: boolean,
  projection: string,
}

enum MapFeatureTypes {
  CityGuess,
  WithinArea,
}

/*
type AnyCoordinate = Coordinate | Coordinate[] | Coordinate[][] | Coordinate[][][];

function isCoordinate(coordinates: unknown): coordinates is Coordinate {
  return Array.isArray(coordinates) && coordinates.every((v) => typeof v === 'number');
}

function getDepth(coordinate: AnyCoordinate, depth = 0): number {
  if (isCoordinate(coordinate)) return depth;
  return getDepth(coordinate[0], depth + 1);
}

function anyCoordinateToGeom(coordinates: AnyCoordinate): Polygon | MultiPolygon {
  const depth = getDepth(coordinates);
  if (depth === 0) return new Polygon([[coordinates]] as unknown as Coordinate[][]);
  if (depth === 1) return new Polygon([coordinates] as unknown as Coordinate[][]);
  if (depth === 2) return new Polygon(coordinates as unknown as Coordinate[][]);
  // if (depth === 2) return new MultiPolygon([coordinates] as unknown as Coordinate[][][]);
  return new MultiPolygon(coordinates as unknown as Coordinate[][][]);
}
*/

const N_CIRLCES = 1;

export default function GameMap({
  guesses = [], onReady, showMap = false, target, projection,
}: GameMapProps): JSX.Element {
  const [, causeRefresh] = React.useState<null | undefined>();

  const countriesSource = React.useRef<VectorSource | null>(null);
  const citiesSource = React.useRef<VectorSource | null>(null);
  const tileLayer = React.useRef<TileLayer<XYZ> | null>(null);
  const mapRef = React.useRef<Map | null>(null);
  const mapElement = React.useRef<HTMLDivElement | null>(null);
  const prevMap = usePrevious(mapRef.current);
  const mapReady = mapRef.current !== prevMap;

  React.useEffect(() => {
    if (mapReady) onReady();
  }, [mapReady, onReady]);

  React.useEffect(() => {
    tileLayer.current?.setVisible(showMap);
  }, [showMap]);

  React.useEffect(() => {
    if (citiesSource.current === null) return;

    const cities = guesses.filter((guess) => isCity(guess)) as City[];
    if (cities.length + N_CIRLCES !== citiesSource.current.getFeatures().length) {
      citiesSource.current.clear();
      const cityFeatures = cities.map((city) => {
        const { coordinates } = city;
        const mapCoords = fromLonLat(coordinates, projection);
        return new Feature({
          geometry: new Point(mapCoords),
          featureType: MapFeatureTypes.CityGuess,
          city,
        });
      });
      citiesSource.current.addFeatures(cityFeatures);

      const withinFeatures = cities.slice(cities.length - N_CIRLCES).map((city) => {
        const { coordinates } = city;
        const mapCoords = fromLonLat(coordinates, projection);
        return new Feature({
          geometry: new Point(mapCoords),
          featureType: MapFeatureTypes.WithinArea,
          city,
        });
      });
      citiesSource.current.addFeatures(withinFeatures);
    }

    const countries = guesses.filter((guess) => isCountry(guess)) as Country[];
    if (countries.length !== countriesSource.current?.getFeatures().length) {
      countriesSource.current?.clear();

      const countryFeatures = countries.map((country) => {
        const { coordinates } = country;
        return new Feature({
          geometry: new Polygon(coordinates),
          country,
        });
      });
      countriesSource.current?.addFeatures(countryFeatures);
    }
  }, [guesses, mapReady, projection]);

  React.useEffect(() => {
    if (mapRef.current !== null || target === undefined) {
      return;
    }
    const countryVectorSource = new VectorSource();
    const countryVectorLayer = new VectorLayer({
      source: countryVectorSource,
      visible: true,
      zIndex: 10,
      style: function styleFeature(feature) {
        const fill = countryStyle.getFill();
        if ((feature.get('country') as Country).name === target.country) {
          fill.setColor('#d8ecde');
        } else {
          fill.setColor('#438db6');
        }
        return countryStyle;
      },
    });
    const citiesVectorSource = new VectorSource();
    const cityVectorLayer = new VectorLayer({
      source: citiesVectorSource,
      visible: true,
      zIndex: 100,
      style: function styleFeature(feature) {
        switch (feature.get('featureType') as MapFeatureTypes) {
          case MapFeatureTypes.CityGuess:
            cityStyle.getText()?.setText((feature.get('city') as City).name);
            return cityStyle;
          case MapFeatureTypes.WithinArea:
            // eslint-disable-next-line no-case-declarations
            const style = withAreaStyle.clone();
            (style.getImage() as CircleStyle).setRadius(getMapDistance(
              feature.get('city') as City,
              target,
            ) * ((mapRef.current?.getView()?.getZoom() ?? 1) ** 2));
            return style;
          default:
            return undefined;
        }
      },
    });
    tileLayer.current = new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      }),
      zIndex: 1,
      visible: showMap,
    });

    mapRef.current = new Map({
      target: mapElement.current ?? undefined,
      layers: [tileLayer.current, countryVectorLayer, cityVectorLayer],
      view: new View({
        center: [0, 0],
        zoom: 1,
        projection,
      }),
    });
    citiesSource.current = citiesVectorSource;
    countriesSource.current = countryVectorSource;
    mapRef.current.on('moveend', (evt) => {
      cityVectorLayer.changed();
    });
    causeRefresh(null);
  }, [showMap, target, projection]);

  return (
    <Box
      ref={mapElement}
      component="div"
      sx={{ height: '100%', width: '100%' }}
      className="map-container"
    />
  );
}
