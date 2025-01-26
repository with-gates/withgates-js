import Gates, { GateProvider } from '@withgates/react-web';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

export const gates = new Gates('<YOUR_GATES_API_KEY>', {
  appUserId: '00000-22222',
  alwaysFetch: false,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GateProvider gates={gates}>
      <App />
    </GateProvider>
  </StrictMode>
);
