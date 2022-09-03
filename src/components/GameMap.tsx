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
import { fromLonLat } from 'ol/proj';
import CircleStyle from 'ol/style/Circle';
import { last } from 'lodash';
import {
  asCity,
  City, Country, GuessOption, isCity, isCountry, isSame,
} from '../hooks/types';
import usePrevious from '../hooks/usePrevious';
import { getMapDistance } from '../utils/geo';
import {
  withAreaStyle, withBorderStyle, cityStyle, countryStyle,
} from './mapStyles';

interface GameMapProps {
  guesses?: GuessOption[];
  target?: City;
  onReady: () => void;
  showMap?: boolean,
  projection: string,
  foundCountry?: Country,
}

enum MapFeatureTypes {
  CityGuess,
  WithinArea,
  WithinBorder,
}

const N_CIRLCES = 1;
const N_CIRCLE_OUTLINES = 5;

export default function GameMap({
  guesses = [], onReady, showMap = false, target, projection, foundCountry,
}: GameMapProps): JSX.Element {
  const [, causeRefresh] = React.useState<null | undefined>();
  const countriesSource = React.useRef<VectorSource | null>(null);
  const citiesSource = React.useRef<VectorSource | null>(null);
  const tileLayer = React.useRef<TileLayer<XYZ> | null>(null);
  const mapRef = React.useRef<Map | null>(null);
  const mapElement = React.useRef<HTMLDivElement | null>(null);
  const prevMap = usePrevious(mapRef.current);
  const prevFoundCountry = usePrevious(foundCountry);
  const mapReady = mapRef.current !== prevMap;

  const lastGuess = last(guesses);
  const isTarget = isSame(lastGuess, target);
  const wasTarget = usePrevious(isTarget);

  React.useEffect(() => {
    const view = mapRef.current?.getView();

    if (foundCountry !== undefined && prevFoundCountry === undefined) {
      view?.fit(
        new Polygon(foundCountry.coordinates),
        {
          padding: [100, 20, 20, 20],
          duration: 1000,
        },
      );
    } else if (isTarget && !wasTarget) {
      const lastCity = asCity(lastGuess);
      view?.fit(
        new Point(fromLonLat(lastCity.coordinates)).getExtent(),
        {
          padding: [100, 20, 20, 20],
          duration: 1000,
          maxZoom: 6,
        },
      );
    }
  }, [foundCountry, isTarget, lastGuess, prevFoundCountry, wasTarget]);

  React.useEffect(() => {
    if (mapReady) onReady();
  }, [mapReady, onReady]);

  React.useEffect(() => {
    tileLayer.current?.setVisible(showMap);
  }, [showMap]);

  React.useEffect(() => {
    if (citiesSource.current === null) return;

    const cities = guesses.filter((guess) => isCity(guess)) as City[];
    if (
      cities.length + N_CIRLCES + N_CIRCLE_OUTLINES
      !== citiesSource.current.getFeatures().length
    ) {
      citiesSource.current.clear();
      const cityFeatures = cities.map((city) => {
        const { coordinates } = city;
        const mapCoords = fromLonLat(coordinates, projection);
        return new Feature({
          geometry: new Point(mapCoords),
          featureType: MapFeatureTypes.CityGuess,
          name: city.name,
          isTarget: isSame(city, target),
        });
      });
      citiesSource.current.addFeatures(cityFeatures);

      const withinFeatures = cities
        .filter((city) => !isSame(city, target))
        .slice(Math.max(0, cities.length - (N_CIRLCES + N_CIRCLE_OUTLINES)))
        .map((city, idx, arr) => {
          const { coordinates } = city;
          const mapCoords = fromLonLat(coordinates, projection);
          const featureType = idx < (arr.length - N_CIRLCES)
            ? MapFeatureTypes.WithinBorder
            : MapFeatureTypes.WithinArea;
          const distance = target == null ? 0 : getMapDistance(city, target);

          return new Feature({
            geometry: new Point(mapCoords),
            featureType,
            city,
            age: arr.length - idx,
            distance,
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
          correctCountry: target?.country === country.name,
        });
      });
      countriesSource.current?.addFeatures(countryFeatures);
    }
  }, [guesses, mapReady, projection, target]);

  React.useEffect(() => {
    if (mapRef.current !== null) {
      return;
    }
    const countryVectorSource = new VectorSource();
    const countryVectorLayer = new VectorLayer({
      source: countryVectorSource,
      visible: true,
      zIndex: 10,
      style: function styleFeature(feature) {
        const fill = countryStyle.getFill();
        if (feature.get('correctCountry')) {
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
            if (feature.get('isTarget')) {
              const targetStyle = cityStyle.clone();
              targetStyle.getText()?.setText([feature.get('name'), 'bold 16px']);
              targetStyle.getText()?.setOffsetY(-16);
              targetStyle.getText()?.setScale(2);
              return targetStyle;
            }
            cityStyle.getText()?.setText(feature.get('name'));
            return cityStyle;
          case MapFeatureTypes.WithinArea:
            // eslint-disable-next-line no-case-declarations
            const style = withAreaStyle.clone();
            (style.getImage() as CircleStyle).setRadius(
              (feature.get('distance') as number) * (2 ** (mapRef.current?.getView()?.getZoom() ?? 1)),
            );
            return style;
          case MapFeatureTypes.WithinBorder:
            // eslint-disable-next-line no-case-declarations
            const style2 = withBorderStyle.clone();
            // eslint-disable-next-line no-case-declarations
            const img = (style2.getImage() as CircleStyle);
            img.getStroke()?.setColor(alpha(
              '#222',
              0.7 - (feature.get('age') as number) / (2 * (N_CIRCLE_OUTLINES + N_CIRLCES)),
            ));
            img.setRadius((feature.get('distance') as number) * (2 ** (mapRef.current?.getView()?.getZoom() ?? 1)));
            return style2;
          default:
            return undefined;
        }
      },
    });
    tileLayer.current = new TileLayer({
      source: new XYZ({
        url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
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
        maxZoom: 13,
      }),
    });
    citiesSource.current = citiesVectorSource;
    countriesSource.current = countryVectorSource;
    mapRef.current.on('moveend', (evt) => {
      cityVectorLayer.changed();
    });
    causeRefresh(null);
  }, [showMap, projection]);

  return (
    <Box
      ref={mapElement}
      component="div"
      sx={{ height: '100%', width: '100%' }}
      className="map-container"
    />
  );
}
