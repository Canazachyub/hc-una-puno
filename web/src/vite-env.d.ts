/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del Web App de Apps Script que se fija al compilar. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
