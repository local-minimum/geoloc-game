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
import { LineString, Point } from 'ol/geom';
import {
  Fill, Stroke, Style,
} from 'ol/style';
import { fromLonLat } from 'ol/proj';
import CircleStyle from 'ol/style/Circle';
import { City } from '../hooks/useCities';
import usePrevious from '../hooks/usePrevious';

const style = new Style({
  image: new CircleStyle({
    radius: 10,
    fill: new Fill({ color: 'black' }),
    stroke: new Stroke({
      color: [255, 0, 0],
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
  const mapRef = React.useRef<Map | null>();
  const mapElement = React.useRef<HTMLDivElement | null>();
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
    citiesSource.current.addFeature(
      new Feature({
        name: 'hello',
        geometry: new LineString(cities.map(({ coordinates }) => coordinates)),
      }),
    );
    // Just for testing zoom to somewhere
    const view = mapRef.current?.getView();
    const focus = features[0]?.getGeometry()?.getCoordinates();
    if (focus !== undefined) view?.fit(focus, { minResolution: 12, maxZoom: 12 });
    // End test
  }, [cities, mapReady]);

  React.useEffect(() => {
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
          opacity: 50,
          style: function styleFeature(feature) {
            return style;
          },
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
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
