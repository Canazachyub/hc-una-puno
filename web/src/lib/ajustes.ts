// Ajustes y sesión del dispositivo. Quedan en localStorage; la contraseña nunca se guarda.

import { useSyncExternalStore } from 'react';

export interface Ajustes {
  /** URL del Web App. Vacía = la que vino al compilar (VITE_API_URL). */
  url: string;
  /** Token de sesión que devuelve auth.login. */
  token: string;
  usuario: string;
  nombre: string;
  /** El estudiante eligió usar la app sin servidor. */
  soloLocal: boolean;
  /** Metros sobre el nivel del mar donde atiende (rangos de saturación y hemoglobina). */
  altitud: number;
}

const CLAVE = 'hc.ajustes';
const VACIO: Ajustes = { url: '', token: '', usuario: '', nombre: '', soloLocal: false, altitud: 3827 };
const EVENTO = 'hc-ajustes';

/** URL del servidor que trae la app publicada. */
export const URL_COMPILADA: string = (import.meta.env.VITE_API_URL ?? '').trim();

/** Apps Script, el servidor local (http o https) o una ruta relativa como ./api. */
const RE_URL = /^(https?:\/\/[^\s/]+|\.{0,2}\/)\S*$/;

let cache: Ajustes | null = null;

/** Con PIN, el token no se guarda en claro: lo guarda y lo lee seguridad.ts. */
export interface GuardaToken {
  activa(): boolean;
  guardar(token: string): void;
  leer(): string;
}
let guarda: GuardaToken | null = null;

export function registrarGuardaToken(g: GuardaToken): void {
  guarda = g;
  cache = null;
}

export function leerAjustes(): Ajustes {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(CLAVE);
    cache = raw ? { ...VACIO, ...(JSON.parse(raw) as Partial<Ajustes>) } : { ...VACIO };
  } catch {
    cache = { ...VACIO };
  }
  if (guarda?.activa()) cache = { ...cache, token: guarda.leer() };
  return cache;
}

export function guardarAjustes(cambios: Partial<Ajustes>): void {
  const a = { ...leerAjustes(), ...cambios };
  a.url = a.url.trim();
  a.nombre = a.nombre.trim();
  cache = a;
  try {
    if (guarda?.activa()) {
      if ('token' in cambios) guarda.guardar(a.token);
      localStorage.setItem(CLAVE, JSON.stringify({ ...a, token: '' }));
    } else {
      localStorage.setItem(CLAVE, JSON.stringify(a));
    }
  } catch {
    // almacenamiento bloqueado: la sesión dura lo que la pestaña
  }
  window.dispatchEvent(new Event(EVENTO));
}

/** Vuelve a leer los ajustes (al bloquear o desbloquear) y avisa a la app. */
export function refrescarAjustes(): void {
  cache = null;
  window.dispatchEvent(new Event(EVENTO));
}

/** Convierte ./api en la dirección completa respecto de la página. */
export function resolverUrl(url: string): string {
  const u = url.trim();
  if (!u) return '';
  try {
    return new URL(u, location.href).href;
  } catch {
    return u;
  }
}

export function urlServidor(): string {
  return resolverUrl(leerAjustes().url || URL_COMPILADA);
}

export function urlValida(url: string): boolean {
  return RE_URL.test(url.trim());
}

/** ¿Es la dirección que trae la app? Entonces no se guarda, para que una nueva versión la pueda cambiar. */
export function esUrlCompilada(url: string): boolean {
  return !!URL_COMPILADA && resolverUrl(url) === resolverUrl(URL_COMPILADA);
}

/** Hay servidor y sesión abierta. */
export function hayBackend(): boolean {
  return urlValida(urlServidor()) && leerAjustes().token !== '';
}

/** Hay que mostrar la pantalla de ingreso. */
export function necesitaIngreso(a: Ajustes = leerAjustes()): boolean {
  return !a.soloLocal && a.token === '';
}

export function cerrarSesionLocal(): void {
  guardarAjustes({ token: '' });
}

export function useAjustes(): Ajustes {
  return useSyncExternalStore(
    (o) => {
      window.addEventListener(EVENTO, o);
      return () => window.removeEventListener(EVENTO, o);
    },
    leerAjustes,
  );
}

export function alCambiarAjustes(fn: () => void): () => void {
  window.addEventListener(EVENTO, fn);
  return () => window.removeEventListener(EVENTO, fn);
}
