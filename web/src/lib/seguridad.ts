// Bloqueo del dispositivo: PIN (y huella si el teléfono lo permite), datos cifrados y cierre automático.
// La clave de los datos es aleatoria; en disco solo queda envuelta con el PIN (PBKDF2 de 600 000
// iteraciones) y, opcionalmente, con un secreto de la huella (WebAuthn con la extensión PRF).
// Sin la clave, nadie puede leer las historias ni la sesión guardadas en el teléfono.

import { useSyncExternalStore } from 'react';
import { guardarAjustes, refrescarAjustes, registrarGuardaToken } from './ajustes';
import { aBase64, aleatorio, cifradoActivo, cifrarTexto, deBase64, descifrarTexto, fijarClaveDatos, hayClave, marcarCifrado } from './cifrado';
import { db, reescribirTodo } from './db';

const CLAVE = 'hc.seguridad';
const ITERACIONES = 600_000;
const EVENTO = 'hc-seguridad';

interface Envoltorio {
  iv: string;
  ct: string;
}

interface Config {
  v: 1;
  sal: string;
  iter: number;
  pin: Envoltorio;
  huella: { credId: string; sal: string; dek: Envoltorio } | null;
  /** Minutos sin uso para bloquear (0 = solo al salir de la app). */
  minutos: number;
  /** Token de sesión cifrado con la clave de datos. */
  token: string;
  fallos: number;
  esperarHasta: number;
  /** Quedó a medias el cifrado de los datos: se termina al desbloquear. */
  pendiente: boolean;
}

let config: Config | null = leerConfig();
let tokenEnMemoria = '';
/** Durante el cierre: la interfaz ya muestra el bloqueo aunque la clave siga un instante en memoria. */
let cerrando = false;
let version = 0;

function leerConfig(): Config | null {
  try {
    const raw = localStorage.getItem(CLAVE);
    return raw ? (JSON.parse(raw) as Config) : null;
  } catch {
    return null;
  }
}

function guardarConfig(c: Config | null): void {
  config = c;
  try {
    if (c) localStorage.setItem(CLAVE, JSON.stringify(c));
    else localStorage.removeItem(CLAVE);
  } catch {
    // sin almacenamiento no hay bloqueo persistente
  }
  avisar();
}

function avisar(): void {
  version++;
  window.dispatchEvent(new Event(EVENTO));
}

marcarCifrado(config !== null);

// El token de sesión viaja cifrado con la clave de datos.
registrarGuardaToken({
  activa: () => config !== null,
  leer: () => tokenEnMemoria,
  guardar: (token) => {
    tokenEnMemoria = token;
    if (!config) return;
    if (!token) guardarConfig({ ...config, token: '' });
    else if (hayClave()) guardarConfig({ ...config, token: cifrarTexto(token) });
  },
});

// ---------- Estado observable ----------

export interface EstadoSeguridad {
  activa: boolean;
  bloqueada: boolean;
  huella: boolean;
  minutos: number;
  esperarHasta: number;
  fallos: number;
}

let foto: EstadoSeguridad | null = null;
let fotoVersion = -1;

function estado(): EstadoSeguridad {
  if (foto && fotoVersion === version) return foto;
  fotoVersion = version;
  foto = {
    activa: config !== null,
    bloqueada: config !== null && (!hayClave() || cerrando),
    huella: !!config?.huella,
    minutos: config?.minutos ?? 5,
    esperarHasta: config?.esperarHasta ?? 0,
    fallos: config?.fallos ?? 0,
  };
  return foto;
}

export function useSeguridad(): EstadoSeguridad {
  return useSyncExternalStore(
    (o) => {
      window.addEventListener(EVENTO, o);
      return () => window.removeEventListener(EVENTO, o);
    },
    estado,
  );
}

export function seguridadActiva(): boolean {
  return config !== null;
}

export function bloqueada(): boolean {
  return config !== null && (!hayClave() || cerrando);
}

// ---------- Envolver la clave de datos ----------

const bufer = (b: Uint8Array): ArrayBuffer => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;

async function claveDePin(pin: string, sal: Uint8Array, iter: number): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bufer(sal), iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
}

async function envolver(kek: CryptoKey, dek: Uint8Array): Promise<Envoltorio> {
  const iv = aleatorio(12);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: bufer(iv) }, kek, bufer(dek)));
  return { iv: aBase64(iv), ct: aBase64(ct) };
}

async function desenvolver(kek: CryptoKey, e: Envoltorio): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bufer(deBase64(e.iv)) }, kek, bufer(deBase64(e.ct))));
}

export function pinValido(pin: string): string {
  if (!/^\d{6,12}$/.test(pin)) return 'El PIN debe tener de 6 a 12 números';
  if (/^(\d)\1+$/.test(pin) || '0123456789012'.includes(pin) || '9876543210987'.includes(pin)) return 'Ese PIN es muy fácil de adivinar';
  return '';
}

/** Abre la app con la clave ya desenvuelta: recupera la sesión y termina un cifrado a medias. */
async function abrirCon(dek: Uint8Array): Promise<void> {
  fijarClaveDatos(dek);
  dek.fill(0);
  if (!config) return;
  try {
    tokenEnMemoria = config.token ? descifrarTexto(config.token) : '';
  } catch {
    tokenEnMemoria = '';
  }
  guardarConfig({ ...config, fallos: 0, esperarHasta: 0 });
  if (config.pendiente) {
    await reescribirTodo();
    guardarConfig({ ...config, pendiente: false });
  }
  refrescarAjustes();
  tocar();
}

// ---------- PIN ----------

/** Activa el bloqueo: crea la clave de datos, la envuelve con el PIN y cifra todo lo guardado. */
export async function crearPin(pin: string, minutos = 5): Promise<void> {
  const error = pinValido(pin);
  if (error) throw new Error(error);
  const dek = aleatorio(32);
  const sal = aleatorio(16);
  const envuelta = await envolver(await claveDePin(pin, sal, ITERACIONES), dek);
  const tokenActual = (() => {
    try {
      return (JSON.parse(localStorage.getItem('hc.ajustes') ?? '{}') as { token?: string }).token ?? '';
    } catch {
      return '';
    }
  })();
  fijarClaveDatos(dek);
  // Primero la configuración (con la tarea pendiente), después los datos: si se corta, se retoma.
  marcarCifrado(true);
  guardarConfig({ v: 1, sal: aBase64(sal), iter: ITERACIONES, pin: envuelta, huella: null, minutos, token: tokenActual ? cifrarTexto(tokenActual) : '', fallos: 0, esperarHasta: 0, pendiente: true });
  tokenEnMemoria = tokenActual;
  dek.fill(0);
  // Reescribe los ajustes sin el token en claro.
  guardarAjustes({ token: tokenActual });
  await reescribirTodo();
  if (config) guardarConfig({ ...config, pendiente: false });
  tocar();
}

export async function desbloquearConPin(pin: string): Promise<boolean> {
  if (!config) return true;
  if (Date.now() < config.esperarHasta) return false;
  try {
    const kek = await claveDePin(pin, deBase64(config.sal), config.iter);
    await abrirCon(await desenvolver(kek, config.pin));
    return true;
  } catch {
    const fallos = config.fallos + 1;
    // Espera creciente: 30 segundos desde el quinto intento, 5 minutos desde el octavo.
    const espera = fallos >= 8 ? 5 * 60_000 : fallos >= 5 ? 30_000 : 0;
    guardarConfig({ ...config, fallos, esperarHasta: espera ? Date.now() + espera : 0 });
    return false;
  }
}

export async function cambiarPin(actual: string, nuevo: string): Promise<void> {
  if (!config) throw new Error('No hay PIN configurado');
  const error = pinValido(nuevo);
  if (error) throw new Error(error);
  let dek: Uint8Array;
  try {
    dek = await desenvolver(await claveDePin(actual, deBase64(config.sal), config.iter), config.pin);
  } catch {
    throw new Error('El PIN actual no es correcto');
  }
  const sal = aleatorio(16);
  const pinNuevo = await envolver(await claveDePin(nuevo, sal, ITERACIONES), dek);
  dek.fill(0);
  guardarConfig({ ...config, sal: aBase64(sal), iter: ITERACIONES, pin: pinNuevo });
}

/** Quita el bloqueo: deja los datos en claro. Pide el PIN. */
export async function desactivar(pin: string): Promise<void> {
  if (!config) return;
  try {
    const dek = await desenvolver(await claveDePin(pin, deBase64(config.sal), config.iter), config.pin);
    fijarClaveDatos(dek);
    dek.fill(0);
  } catch {
    throw new Error('El PIN no es correcto');
  }
  const token = tokenEnMemoria;
  marcarCifrado(false);
  await reescribirTodo();
  guardarConfig(null);
  fijarClaveDatos(null);
  guardarAjustes({ token });
}

export function fijarMinutos(minutos: number): void {
  if (config) guardarConfig({ ...config, minutos: Math.max(0, Math.min(60, Math.round(minutos))) });
}

/** Cierra la app: la interfaz pasa a la pantalla de bloqueo y después se borra la clave de la memoria. */
export function bloquear(): void {
  if (!config || !hayClave() || cerrando) return;
  // Primero se desmonta la interfaz (que deja de leer la base), luego se olvida la clave.
  cerrando = true;
  tokenEnMemoria = '';
  refrescarAjustes();
  avisar();
  setTimeout(() => {
    fijarClaveDatos(null);
    cerrando = false;
    avisar();
  }, 50);
}

/** Olvidé mi PIN: borra los datos del dispositivo y la sesión. Lo que ya está en el servidor se conserva. */
export async function olvidarPin(): Promise<void> {
  marcarCifrado(false);
  fijarClaveDatos(null);
  tokenEnMemoria = '';
  guardarConfig(null);
  await Promise.all([db.historias.clear(), db.ops.clear(), db.entradas.clear(), db.remotas.clear()]);
  guardarAjustes({ token: '' });
}

// ---------- Huella (WebAuthn con PRF) ----------

interface ResultadosPrf {
  prf?: { enabled?: boolean; results?: { first?: ArrayBuffer } };
}

export async function huellaPosible(): Promise<boolean> {
  try {
    return !!window.PublicKeyCredential && (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
  } catch {
    return false;
  }
}

async function secretoHuella(credId: Uint8Array, sal: Uint8Array): Promise<Uint8Array> {
  const cred = (await navigator.credentials.get({
    publicKey: {
      challenge: bufer(aleatorio(32)),
      allowCredentials: [{ type: 'public-key', id: bufer(credId) }],
      userVerification: 'required',
      timeout: 60_000,
      extensions: { prf: { eval: { first: bufer(sal) } } } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null;
  const r = (cred?.getClientExtensionResults() as ResultadosPrf | undefined)?.prf?.results?.first;
  if (!r) throw new Error('Este teléfono no entrega el secreto de la huella al navegador');
  return new Uint8Array(r);
}

async function claveDeSecreto(secreto: Uint8Array): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest('SHA-256', bufer(secreto));
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

/** Registra la huella (o el rostro) del teléfono para desbloquear. Pide el PIN para envolver la clave. */
export async function activarHuella(pin: string, usuario: string): Promise<void> {
  if (!config) throw new Error('Primero crea un PIN');
  let dek: Uint8Array;
  try {
    dek = await desenvolver(await claveDePin(pin, deBase64(config.sal), config.iter), config.pin);
  } catch {
    throw new Error('El PIN no es correcto');
  }
  const sal = aleatorio(32);
  const cred = (await navigator.credentials.create({
    publicKey: {
      rp: { name: 'HC App' },
      user: { id: bufer(aleatorio(16)), name: usuario || 'hc-app', displayName: usuario || 'HC App' },
      challenge: bufer(aleatorio(32)),
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
      timeout: 60_000,
      extensions: { prf: { eval: { first: bufer(sal) } } } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null;
  if (!cred) throw new Error('No se registró la huella');
  const ext = cred.getClientExtensionResults() as ResultadosPrf;
  if (!ext.prf?.enabled && !ext.prf?.results?.first) {
    dek.fill(0);
    throw new Error('Este teléfono o navegador no permite desbloquear con huella; sigue usando el PIN');
  }
  const credId = new Uint8Array(cred.rawId);
  const secreto = ext.prf.results?.first ? new Uint8Array(ext.prf.results.first) : await secretoHuella(credId, sal);
  const envuelta = await envolver(await claveDeSecreto(secreto), dek);
  secreto.fill(0);
  dek.fill(0);
  guardarConfig({ ...config, huella: { credId: aBase64(credId), sal: aBase64(sal), dek: envuelta } });
}

export async function desbloquearConHuella(): Promise<boolean> {
  const h = config?.huella;
  if (!h) return false;
  try {
    const secreto = await secretoHuella(deBase64(h.credId), deBase64(h.sal));
    const dek = await desenvolver(await claveDeSecreto(secreto), h.dek);
    secreto.fill(0);
    await abrirCon(dek);
    return true;
  } catch {
    return false;
  }
}

export function quitarHuella(): void {
  if (config) guardarConfig({ ...config, huella: null });
}

// ---------- Cierre automático ----------

let ultimoUso = Date.now();
let ocultaDesde = 0;

function tocar(): void {
  ultimoUso = Date.now();
}

export function iniciarAutobloqueo(): void {
  for (const ev of ['pointerdown', 'keydown', 'touchstart', 'scroll']) window.addEventListener(ev, tocar, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!config || !hayClave()) return;
    if (document.visibilityState === 'hidden') {
      ocultaDesde = Date.now();
      return;
    }
    // Al volver: si estuvo fuera más de un minuto (o del tiempo elegido), se bloquea.
    const limite = Math.min(60_000, (config.minutos || 1) * 60_000);
    if (ocultaDesde && Date.now() - ocultaDesde > limite) bloquear();
    ocultaDesde = 0;
    tocar();
  });
  setInterval(() => {
    if (!config || !hayClave() || !config.minutos) return;
    if (Date.now() - ultimoUso > config.minutos * 60_000) bloquear();
  }, 15_000);
}

/** Para las pruebas y el diagnóstico: ¿los datos se escriben cifrados? */
export function datosCifrados(): boolean {
  return cifradoActivo();
}
