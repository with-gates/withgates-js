import Gates, { GateProvider } from '@withgates/react-native';
import { StrictMode } from 'react';
import {App} from './App';
import { registerRootComponent } from 'expo';

export const gates = new Gates('<YOUR_GATES_API_KEY>', {
  appUserId: '00000-22222',
  alwaysFetch: false,
});

registerRootComponent(() => 
  <StrictMode>
    <GateProvider gates={gates}>
      <App />
    </GateProvider>
  </StrictMode>
);
