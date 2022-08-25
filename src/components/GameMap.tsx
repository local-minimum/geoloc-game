import * as React from 'react';
import Map from 'ol/Map';
import { Box } from '@mui/material';
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

/*
438db6
c2ddd0
d8ecde
ec957d
e77158
c3c3a8
*/

const cityStyle = new Style({
  image: new CircleStyle({
    radius: 4,
    fill: new Fill({ color: '#ec957d' }),
    stroke: new Stroke({
      color: '#e77158',
      width: 2,
    }),
  }),
});

interface GameMapProps {
  cities?: City[];
  onReady: () => void;
}

const MAP_PROJ = 'EPSG:3857'; // 'EPSG:4326';

export default function GameMap({
  cities = [], onReady,
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

    const features = cities.map(({ name, coordinates }) => {
      const mapCoords = fromLonLat(coordinates, MAP_PROJ);
      return new Feature({
        name,
        geometry: new Point(mapCoords),
      });
    });
    citiesSource.current.addFeatures(features);
  }, [cities, mapReady]);

  React.useEffect(() => {
    if (mapRef.current !== null) {
      return;
    }
    const citiesVectorSource = new VectorSource();
    mapRef.current = new Map({
      target: mapElement.current ?? undefined,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          }),
          zIndex: 1,
          visible: true,
        }),
        new VectorLayer({
          source: citiesVectorSource,
          visible: true,
          zIndex: 100,
          style: function styleFeature(feature) {
            return cityStyle;
          },
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 1,
        projection: MAP_PROJ,
      }),
    });
    citiesSource.current = citiesVectorSource;
    causeRefresh(null);
  }, []);

  return (
    <Box
      ref={mapElement}
      component="div"
      sx={{ height: '100%', width: '100%' }}
      className="map-container"
    />
  );
}
