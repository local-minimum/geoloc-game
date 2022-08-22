import { Box } from '@mui/material';
import * as React from 'react';
import GameMap from '../components/GameMap';
import useCities from '../hooks/useCities';

export default function GameContainer(): JSX.Element {
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const handleMapReady = React.useCallback(() => {
    if (!mapLoaded) setMapLoaded(true);
  }, [mapLoaded]);

  const cities = useCities({ disabled: !mapLoaded, randomPopulate: true });

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <GameMap cities={cities} onReady={handleMapReady} />
    </Box>
  );
}
