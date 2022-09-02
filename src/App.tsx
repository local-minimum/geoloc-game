import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import GameContainer from './containers/GameContainer';

export default function App(): JSX.Element {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      preventDuplicate
      autoHideDuration={2000}
    >
      <GameContainer />
    </SnackbarProvider>
  );
}
