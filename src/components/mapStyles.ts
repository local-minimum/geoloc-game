import { alpha } from '@mui/material';
import {
  Fill, Stroke, Style, Text,
} from 'ol/style';
import CircleStyle from 'ol/style/Circle';

/*
#438db6
#c2ddd0
#d8ecde
#ec957d
#e77158
#c3c3a8
*/

const countryFillColor = '#438db6';
export const countryStyle = new Style({
  zIndex: 10,
  fill: new Fill({ color: countryFillColor }),
  stroke: new Stroke({
    color: '#c2ddd0',
    width: 1,
  }),
});

export const cityStyle = new Style({
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
    fill: new Fill({ color: '#222' }),
    stroke: new Stroke({ color: '#333', width: 1 }),
    offsetY: -12,
  }),
});

export const withAreaStyle = new Style({
  zIndex: 10,
  image: new CircleStyle({
    radius: 1,
    fill: new Fill({ color: alpha('#c2ddd0', 0.5) }),
    stroke: new Stroke({
      color: alpha('#222', 0.5),
      width: 2,
    }),
  }),
});

export const withBorderStyle = new Style({
  zIndex: 10,
  image: new CircleStyle({
    radius: 1,
    stroke: new Stroke({
      color: alpha('#222', 0.3),
      width: 2,
    }),
  }),
});
