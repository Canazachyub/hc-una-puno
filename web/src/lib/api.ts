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

export async function llamar<A extends Accion>(
  action: A,
  payload: ApiMapa[A][0],
  opciones: { opId?: string; timeoutMs?: number; url?: string } = {},
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
    throw new ErrorApi(control.signal.aborted ? 'El servidor tardó demasiado' : 'No se pudo conectar con el servidor', 'red');
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new ErrorApi(`El servidor respondió ${res.status}`, 'red');
  let cuerpo: Respuesta<ApiMapa[A][1]>;
  try {
    cuerpo = (await res.json()) as Respuesta<ApiMapa[A][1]>;
  } catch {
    throw new ErrorApi('Respuesta no válida. ¿La dirección del servidor es correcta?', 'red');
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
  const r = await llamar('auth.login', { usuario: usuario.trim(), clave }, { url: destino, timeoutMs: 30_000 });
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
