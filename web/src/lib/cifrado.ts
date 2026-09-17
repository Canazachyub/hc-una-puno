// Cifrado de los datos del dispositivo (AES-256-GCM). La clave vive solo en memoria mientras la app
// está desbloqueada; en disco queda envuelta con el PIN o con la huella (ver seguridad.ts).
// Es síncrono (@noble/ciphers) para poder usarse dentro de la base local.

import { gcm } from '@noble/ciphers/aes.js';

let claveDatos: Uint8Array | null = null;
let activo = false;

export class Bloqueada extends Error {
  constructor() {
    super('La app está bloqueada');
  }
}

/** Hay PIN configurado: todo lo que se guarde va cifrado. */
export function cifradoActivo(): boolean {
  return activo;
}

export function marcarCifrado(valor: boolean): void {
  activo = valor;
}

export function fijarClaveDatos(k: Uint8Array | null): void {
  if (claveDatos) claveDatos.fill(0);
  claveDatos = k ? new Uint8Array(k) : null;
}

export function hayClave(): boolean {
  return claveDatos !== null;
}

function clave(): Uint8Array {
  if (!claveDatos) throw new Bloqueada();
  return claveDatos;
}

export function aleatorio(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}

/** iv (12 bytes) + texto cifrado con su etiqueta. */
export function cifrar(datos: Uint8Array): Uint8Array {
  const iv = aleatorio(12);
  const ct = gcm(clave(), iv).encrypt(datos);
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv);
  out.set(ct, iv.length);
  return out;
}

export function descifrar(datos: Uint8Array): Uint8Array {
  return gcm(clave(), datos.subarray(0, 12)).decrypt(datos.subarray(12));
}

const codificador = new TextEncoder();
const decodificador = new TextDecoder();

export function cifrarTexto(t: string): string {
  return aBase64(cifrar(codificador.encode(t)));
}

export function descifrarTexto(t: string): string {
  return decodificador.decode(descifrar(deBase64(t)));
}

export function aBase64(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
}

export function deBase64(t: string): Uint8Array {
  const s = atob(t);
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return b;
}
