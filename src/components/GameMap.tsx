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
  Circle, Fill, Stroke, Style,
} from 'ol/style';
import { City } from '../hooks/useCities';

const fill = new Fill({
  color: 'rgba(255,255,255,0.4)',
});
const stroke = new Stroke({
  color: '#3399CC',
  width: 1.25,
});
const styles = [
  new Style({
    image: new Circle({
      fill,
      stroke,
      radius: 100,
    }),
    fill,
    stroke,
  }),
];

interface GameMapProps {
  cities?: City[];
  onReady: () => void;
}

export default function GameMap({
  cities = [], onReady,
}: GameMapProps): JSX.Element {
  const [, causeRefresh] = React.useState<null | undefined>();

  const citiesSource = React.useRef<VectorSource | null>(null);
  const mapRef = React.useRef<Map | null>();
  const mapElement = React.useRef<HTMLDivElement | null>();

  React.useEffect(() => {
    if (citiesSource.current === null) return;

    citiesSource.current.clear();
    citiesSource.current.addFeatures(cities.map(({ name, coordinates }) => new Feature({
      name,
      geometry: new Point(coordinates),
    })));
    mapRef.current?.render();
  }, [cities]);

  React.useEffect(() => {
    const citiesVectorSource = new VectorSource({
      features: [],
    });

    mapRef.current = new Map({
      target: mapElement.current ?? undefined,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          }),
        }),
        new VectorLayer({
          source: citiesVectorSource,
          style: styles,
          visible: true,
        }),
      ],
      view: new View({ center: [0, 0], zoom: 2 }),
    });
    mapRef.current.on('loadend', onReady);
    citiesSource.current = citiesVectorSource;
    causeRefresh(null);
  }, [onReady]);

  return (
    <Box
      ref={mapElement}
      component="div"
      sx={{ height: '100%', width: '100%', overflow: 'hidden' }}
      className="map-container"
    />
  );
}
