import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

/** Emite la lista de archivos del build para que el service worker los guarde y la app funcione sin señal. */
function listaPrecache(): Plugin {
  return {
    name: 'lista-precache',
    apply: 'build',
    generateBundle(_opciones, bundle) {
      const archivos = Object.keys(bundle).filter((f) => !f.endsWith('.map'));
      this.emitFile({
        type: 'asset',
        fileName: 'precache.json',
        source: JSON.stringify({ generado: new Date().toISOString(), archivos }),
      });
    },
  };
}

export default defineConfig({
  base: './',
  // VITE_API_URL se lee del .env.local de la raíz del proyecto.
  envDir: '..',
  plugins: [react(), listaPrecache()],
  server: { fs: { allow: ['..'] } },
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
});
