import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { VemetricScript } from '@vemetric/react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VemetricScript
      token="o1rySsGlUtFCyflo"
      host="https://hub.vemetric.local"
      scriptUrl="https://cdn.vemetric.local/main.js"
      onInit={() => {
        console.log('Vemetric initialized');
      }}
    />
    <App />
  </StrictMode>,
);
