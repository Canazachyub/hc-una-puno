// Variables de .env.local (las del sistema mandan) y llamadas a la API para los scripts.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ApiMapa, LoginRespuesta, Respuesta } from '../shared/types';

export const RAIZ = join(import.meta.dirname, '..');

export function leerEnv(): Record<string, string> {
  const archivo = join(RAIZ, '.env.local');
  const env: Record<string, string> = {};
  if (existsSync(archivo)) {
    for (const linea of readFileSync(archivo, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z_]+)\s*=\s*(.*)\s*$/.exec(linea);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  const delSistema = Object.entries(process.env).filter(([k]) => k.startsWith('HC_') || k === 'VITE_API_URL');
  return { ...env, ...(Object.fromEntries(delSistema) as Record<string, string>) };
}

export async function post<T>(url: string, cuerpo: object): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(cuerpo),
    redirect: 'follow',
  });
  const texto = await res.text();
  let r: Respuesta<T>;
  try {
    r = JSON.parse(texto) as Respuesta<T>;
  } catch {
    // Apps Script responde HTML cuando el Web App no está publicado para «cualquier usuario» o falta autorizarlo.
    throw new Error(`El servidor no respondió JSON (HTTP ${res.status}): ${texto.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 160)}`);
  }
  if (!r.ok) throw new Error(r.error);
  return r.data;
}

/** Sesión con usuario y contraseña; `cerrar` la termina. */
export async function sesion(url: string, usuario: string, clave: string) {
  const { token } = await post<LoginRespuesta>(url, { action: 'auth.login', token: '', payload: { usuario, clave } });
  return {
    llamar: <A extends keyof ApiMapa>(action: A, payload: ApiMapa[A][0], opId?: string) =>
      post<ApiMapa[A][1]>(url, { action, token, opId, payload }),
    cerrar: () => post(url, { action: 'auth.salir', token, payload: {} }).catch(() => undefined),
  };
}
