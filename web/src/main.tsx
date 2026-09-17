import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { precargarWord } from './lib/docx/descargar';
import { migrarLocal } from './lib/historia';
import { bloqueada, iniciarAutobloqueo } from './lib/seguridad';
import { iniciarSync } from './lib/sync';
import './styles.css';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Con PIN, la base se lee después de desbloquear.
const migrar = () => (bloqueada() ? Promise.resolve() : migrarLocal().catch(() => undefined));
void migrar().finally(iniciarSync);
window.addEventListener('hc-seguridad', () => void migrar());
iniciarAutobloqueo();

// El generador de Word se carga en segundo plano para que funcione aunque luego se pierda la señal.
setTimeout(() => void precargarWord().catch(() => undefined), 1500);

// Pide al navegador que no borre IndexedDB por falta de espacio.
void navigator.storage?.persist?.().catch(() => undefined);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(async (reg) => {
        await navigator.serviceWorker.ready;
        (reg.active ?? navigator.serviceWorker.controller)?.postMessage({ tipo: 'precache' });
      })
      .catch(() => undefined);
  });
}
