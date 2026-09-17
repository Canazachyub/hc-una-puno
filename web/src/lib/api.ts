// Único punto de contacto con Apps Script.
// text/plain y token de sesión en el cuerpo: sin preflight de CORS.

import { ACCIONES_PUBLICAS } from '../../../shared/types';
import type { Accion, ApiMapa, Respuesta } from '../../../shared/types';
import {
  cerrarSesionLocal,
  esUrlCompilada,
  guardarAjustes,
  hayBackend,
  leerAjustes,
  resolverUrl,
  urlServidor,
  urlValida,
} from './ajustes';

export class ErrorApi extends Error {
  constructor(
    message: string,
    public codigo: string = 'error',
  ) {
    super(message);
  }
}

export function enLinea(): boolean {
  return navigator.onLine && hayBackend();
}

/** Esperas antes de cada reintento; el último valor se repite hasta agotar el tiempo de la operación. */
const REINTENTOS = [1500, 3000, 5000, 8000];
/** El servidor todavía procesa la primera ejecución, o la hoja está ocupada: se reintenta. */
const CODIGOS_REINTENTO = new Set(['pendiente', 'ocupado']);
/** Pocas llamadas a la vez: Apps Script y la hoja se atascan con muchas y las respuestas se pierden. */
const MAX_SIMULTANEAS = 3;

/** Error de entrega: la acción pudo ejecutarse en el servidor, pero la respuesta no llegó. */
class ErrorEntrega extends ErrorApi {
  constructor(message: string) {
    super(message, 'red');
  }
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

let activas = 0;
const cola: (() => void)[] = [];

async function turno<T>(fn: () => Promise<T>): Promise<T> {
  if (activas >= MAX_SIMULTANEAS) await new Promise<void>((r) => cola.push(r));
  activas++;
  try {
    return await fn();
  } finally {
    activas--;
    cola.shift()?.();
  }
}

/**
 * Apps Script entrega cada respuesta por un enlace de un solo uso (script.googleusercontent.com/macros/echo).
 * A veces ese enlace ya no está cuando el navegador lo pide y Google responde 404 u otra página.
 * Google además deja de esperar a los 30 segundos. Se reintenta con el mismo opId hasta el tiempo límite:
 * el servidor devuelve lo que ya hizo (o espera a que termine), sin repetirlo.
 */
export async function llamar<A extends Accion>(
  action: A,
  payload: ApiMapa[A][0],
  opciones: { opId?: string; timeoutMs?: number; url?: string } = {},
): Promise<ApiMapa[A][1]> {
  const opId = opciones.opId ?? uuid();
  const limite = Date.now() + (opciones.timeoutMs ?? 90_000);
  for (let intento = 0; ; intento++) {
    try {
      const restante = limite - Date.now();
      return await turno(() => unaLlamada(action, payload, { ...opciones, opId, timeoutMs: Math.max(restante, 15_000) }));
    } catch (e) {
      const reintentable = e instanceof ErrorEntrega || (e instanceof ErrorApi && CODIGOS_REINTENTO.has(e.codigo));
      const pausa = REINTENTOS[Math.min(intento, REINTENTOS.length - 1)];
      if (!reintentable || !navigator.onLine || Date.now() + pausa >= limite) {
        throw e instanceof ErrorApi && CODIGOS_REINTENTO.has(e.codigo) ? new ErrorApi('El servidor está ocupado. Intenta de nuevo en un momento.', 'red') : e;
      }
      await esperar(pausa);
    }
  }
}

async function unaLlamada<A extends Accion>(
  action: A,
  payload: ApiMapa[A][0],
  opciones: { opId: string; timeoutMs?: number; url?: string },
): Promise<ApiMapa[A][1]> {
  const publica = ACCIONES_PUBLICAS.includes(action);
  const url = opciones.url ?? urlServidor();
  const { token } = leerAjustes();
  if (!urlValida(url)) throw new ErrorApi('Falta la dirección del servidor', 'config');
  if (!publica && !token) throw new ErrorApi('Ingresa con tu usuario y contraseña', 'auth');
  if (!navigator.onLine) throw new ErrorApi('Sin señal', 'red');

  const control = new AbortController();
  const timer = setTimeout(() => control.abort(), opciones.timeoutMs ?? 90_000);
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, token: publica ? '' : token, opId: opciones.opId, payload }),
      redirect: 'follow',
      signal: control.signal,
    });
  } catch {
    if (control.signal.aborted) throw new ErrorApi('El servidor tardó demasiado', 'red');
    // Una redirección de Google sin permisos de CORS también llega aquí.
    throw new ErrorEntrega('No se pudo conectar con el servidor');
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new ErrorEntrega(`Google no entregó la respuesta del servidor (${res.status}). Intenta de nuevo.`);
  let cuerpo: Respuesta<ApiMapa[A][1]>;
  try {
    cuerpo = (await res.json()) as Respuesta<ApiMapa[A][1]>;
  } catch {
    throw new ErrorEntrega(
      /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url) || url.endsWith('/api')
        ? 'Google no entregó una respuesta válida del servidor. Intenta de nuevo.'
        : 'Respuesta no válida. ¿La dirección del servidor es correcta?',
    );
  }
  if (!cuerpo.ok) {
    // Sesión vencida o cerrada en otro lado: se vuelve a pedir el ingreso, sin tocar los datos locales.
    if (cuerpo.codigo === 'auth' && !publica) cerrarSesionLocal();
    throw new ErrorApi(cuerpo.error, cuerpo.codigo);
  }
  return cuerpo.data;
}

// ---------- Sesión ----------

export async function iniciarSesion(usuario: string, clave: string, url: string): Promise<void> {
  const destino = resolverUrl(url);
  // Tras un rato sin uso, Apps Script tarda en despertar: el ingreso puede necesitar reintentos.
  const r = await llamar('auth.login', { usuario: usuario.trim(), clave }, { url: destino, timeoutMs: 90_000 });
  guardarAjustes({ token: r.token, usuario: r.usuario, soloLocal: false, url: esUrlCompilada(destino) ? '' : destino });
}

export async function cerrarSesion(): Promise<void> {
  if (navigator.onLine && hayBackend()) {
    try {
      await llamar('auth.salir', {}, { timeoutMs: 10_000 });
    } catch {
      // sin respuesta: la sesión vence sola
    }
  }
  guardarAjustes({ token: '', soloLocal: false });
}

export async function cambiarClave(claveActual: string, claveNueva: string, usuarioNuevo: string): Promise<void> {
  const r = await llamar('auth.cambiar', {
    clave_actual: claveActual,
    clave_nueva: claveNueva,
    usuario_nuevo: usuarioNuevo.trim() || undefined,
  });
  guardarAjustes({ usuario: r.usuario });
}

/** randomUUID solo existe en https; en http (celular por la red local) se arma con getRandomValues. */
export function uuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function mensaje(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
