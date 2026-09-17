// Acceso con usuario y contraseña. Un solo usuario.
// La contraseña se guarda con sal y hash; cada ingreso crea una sesión de 30 días
// cuyo token viaja en el cuerpo de las peticiones.

import type { CambiarClavePayload, LoginPayload, LoginRespuesta } from '../../shared/types';
import { conLock } from './Repo';
import { ErrorApi, PROPS, borrarProp, prop, setProp, sha256Hex, uuid } from './Util';

const DIAS_SESION = 30;
const MAX_SESIONES = 20;
const MAX_FALLOS = 5;
const BLOQUEO_SEGUNDOS = 15 * 60;
const ITERACIONES = 300;
const CLAVE_FALLOS = 'auth:fallos';

interface Sesion {
  h: string;
  exp: number;
}

function hashClave(clave: string, sal: string): string {
  let h = sha256Hex(`${sal}:${clave}`);
  for (let i = 0; i < ITERACIONES; i++) h = sha256Hex(`${h}${sal}`);
  return h;
}

function fijarClave(clave: string): void {
  const sal = uuid().replace(/-/g, '');
  setProp(PROPS.CLAVE_HASH, `${sal}:${hashClave(clave, sal)}`);
  borrarProp(PROPS.CLAVE_INICIAL);
}

/** CLAVE_INICIAL tiene prioridad: así se recupera el acceso si se olvida la contraseña. */
function claveCorrecta(clave: string): boolean {
  const inicial = prop(PROPS.CLAVE_INICIAL);
  if (inicial) {
    if (clave !== inicial) return false;
    fijarClave(clave);
    return true;
  }
  const [sal, h] = prop(PROPS.CLAVE_HASH).split(':');
  return !!sal && !!h && hashClave(clave, sal) === h;
}

function leerSesiones(): Sesion[] {
  try {
    const s = JSON.parse(prop(PROPS.SESIONES) || '[]') as Sesion[];
    return Array.isArray(s) ? s : [];
  } catch {
    return [];
  }
}

function guardarSesiones(s: Sesion[]): void {
  const vigentes = s.filter((x) => x.exp > Date.now());
  setProp(PROPS.SESIONES, JSON.stringify(vigentes.slice(-MAX_SESIONES)));
}

export function sesionValida(token: unknown): boolean {
  if (typeof token !== 'string' || token.length < 20) return false;
  const h = sha256Hex(token);
  const ahora = Date.now();
  return leerSesiones().some((s) => s.h === h && s.exp > ahora);
}

function verificarBloqueo(): void {
  const fallos = Number(CacheService.getScriptCache().get(CLAVE_FALLOS) ?? 0);
  if (fallos >= MAX_FALLOS) throw new ErrorApi('Demasiados intentos fallidos. Espera 15 minutos.', 'bloqueado');
}

function sumarFallo(): void {
  const cache = CacheService.getScriptCache();
  cache.put(CLAVE_FALLOS, String(Number(cache.get(CLAVE_FALLOS) ?? 0) + 1), BLOQUEO_SEGUNDOS);
}

export function login(p: LoginPayload): LoginRespuesta {
  verificarBloqueo();
  const esperado = prop(PROPS.USUARIO);
  if (!esperado) throw new ErrorApi('Aún no hay usuario: ejecuta setup() en Apps Script', 'config');
  const usuario = String(p?.usuario ?? '').trim();
  const clave = String(p?.clave ?? '');
  const ok = usuario.toLowerCase() === esperado.toLowerCase() && clave !== '' && claveCorrecta(clave);
  if (!ok) {
    sumarFallo();
    throw new ErrorApi('Usuario o contraseña incorrectos', 'credenciales');
  }
  CacheService.getScriptCache().remove(CLAVE_FALLOS);

  const token = `${uuid()}${uuid()}`.replace(/-/g, '');
  const exp = Date.now() + DIAS_SESION * 24 * 3600 * 1000;
  conLock(() => guardarSesiones([...leerSesiones(), { h: sha256Hex(token), exp }]));
  return { token, usuario: esperado, expira: new Date(exp).toISOString() };
}

/** Cambia la contraseña (y el usuario, si se pide). Cierra las demás sesiones. */
export function cambiarClave(p: CambiarClavePayload, tokenActual: string): { usuario: string } {
  verificarBloqueo();
  if (!claveCorrecta(String(p?.clave_actual ?? ''))) {
    sumarFallo();
    throw new ErrorApi('La contraseña actual no es correcta', 'credenciales');
  }
  const nueva = String(p?.clave_nueva ?? '');
  // Servidor en internet: contraseña de al menos 8 caracteres.
  if (nueva.length < 8) throw new ErrorApi('La contraseña nueva debe tener al menos 8 caracteres', 'payload');
  const usuarioNuevo = String(p?.usuario_nuevo ?? '').trim();
  if (usuarioNuevo && !/^[\w.@-]{3,40}$/.test(usuarioNuevo)) {
    throw new ErrorApi('El usuario solo puede tener letras, números, punto, guion y arroba (3 a 40)', 'payload');
  }
  conLock(() => {
    fijarClave(nueva);
    if (usuarioNuevo) setProp(PROPS.USUARIO, usuarioNuevo);
    const h = sha256Hex(tokenActual);
    guardarSesiones(leerSesiones().filter((s) => s.h === h));
  });
  return { usuario: prop(PROPS.USUARIO) };
}

export function salir(tokenActual: string): { ok: boolean } {
  const h = sha256Hex(tokenActual);
  conLock(() => guardarSesiones(leerSesiones().filter((s) => s.h !== h)));
  return { ok: true };
}

/** Contraseña temporal legible. */
export function claveTemporal(): string {
  return uuid().replace(/-/g, '').slice(0, 10);
}

/** Crea el usuario la primera vez. Devuelve las credenciales solo si las acaba de crear. */
export function asegurarUsuario(): { usuario: string; clave: string } | null {
  if (!prop(PROPS.USUARIO)) setProp(PROPS.USUARIO, 'admin');
  if (prop(PROPS.CLAVE_HASH) || prop(PROPS.CLAVE_INICIAL)) return null;
  const clave = claveTemporal();
  setProp(PROPS.CLAVE_INICIAL, clave);
  return { usuario: prop(PROPS.USUARIO), clave };
}

/** Si olvidaste la contraseña: genera una temporal y cierra todas las sesiones. */
export function restablecerClave(): void {
  const clave = claveTemporal();
  setProp(PROPS.CLAVE_INICIAL, clave);
  setProp(PROPS.SESIONES, '[]');
  CacheService.getScriptCache().remove(CLAVE_FALLOS);
  Logger.log(`Usuario: ${prop(PROPS.USUARIO)} · Contraseña temporal: ${clave}`);
  Logger.log('Entra a la app con ella y cámbiala en Ajustes.');
}
