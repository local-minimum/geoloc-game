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
import { Point } from 'ol/geom';
import {
  Fill, Stroke, Style,
} from 'ol/style';
import { fromLonLat } from 'ol/proj';
import CircleStyle from 'ol/style/Circle';
import { City } from '../hooks/useCities';
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
  cities?: City[];
  target?: City;
  onReady: () => void;
  showMap?: boolean,
}

const MAP_PROJ = 'EPSG:3857'; // 'EPSG:4326';

enum MapFeatureTypes {
  CityGuess,
  WithinArea,
}

export default function GameMap({
  cities = [], onReady, showMap = false, target,
}: GameMapProps): JSX.Element {
  const [, causeRefresh] = React.useState<null | undefined>();

  const citiesSource = React.useRef<VectorSource | null>(null);
  const mapRef = React.useRef<Map | null>(null);
  const mapElement = React.useRef<HTMLDivElement | null>(null);
  const prevMap = usePrevious(mapRef.current);
  const mapReady = mapRef.current !== prevMap;

  React.useEffect(() => {
    if (mapReady) onReady();
  }, [mapReady, onReady]);

  React.useEffect(() => {
    if (citiesSource.current === null) return;

    citiesSource.current.clear();

    const cityFeatures = cities.map((city) => {
      const { coordinates } = city;
      const mapCoords = fromLonLat(coordinates, MAP_PROJ);
      return new Feature({
        geometry: new Point(mapCoords),
        featureType: MapFeatureTypes.CityGuess,
        city,
      });
    });
    citiesSource.current.addFeatures(cityFeatures);

    const withinFeatures = cities.slice(cities.length - 1).map((city) => {
      const { coordinates } = city;
      const mapCoords = fromLonLat(coordinates, MAP_PROJ);
      return new Feature({
        geometry: new Point(mapCoords),
        featureType: MapFeatureTypes.WithinArea,
        city,
      });
    });
    citiesSource.current.addFeatures(withinFeatures);
  }, [cities, mapReady]);

  React.useEffect(() => {
    if (mapRef.current !== null || target === undefined) {
      return;
    }
    const citiesVectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: citiesVectorSource,
      visible: true,
      zIndex: 100,
      style: function styleFeature(feature) {
        switch (feature.get('featureType') as MapFeatureTypes) {
          case MapFeatureTypes.CityGuess:
            return cityStyle;
          case MapFeatureTypes.WithinArea:
            // eslint-disable-next-line no-case-declarations
            const style = withAreaStyle.clone();
            (style.getImage() as CircleStyle).setRadius(getMapDistance(
              feature.get('city') as City,
              target,
              // (coordinates) => fromLonLat(coordinates, MAP_PROJ),
              (coordinates) => coordinates,
            ) * ((mapRef.current?.getView()?.getZoom() ?? 1) ** 2));
            return style;
          default:
            return undefined;
        }
      },
    });
    mapRef.current = new Map({
      target: mapElement.current ?? undefined,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          }),
          zIndex: 1,
          visible: showMap,
        }),
        vectorLayer,
      ],
      view: new View({
        center: [0, 0],
        zoom: 1,
        projection: MAP_PROJ,
      }),
    });
    citiesSource.current = citiesVectorSource;
    mapRef.current.on('moveend', (evt) => {
      vectorLayer.changed();
    });
    causeRefresh(null);
  }, [showMap, target]);

  return (
    <Box
      ref={mapElement}
      component="div"
      sx={{ height: '100%', width: '100%' }}
      className="map-container"
    />
  );
}
