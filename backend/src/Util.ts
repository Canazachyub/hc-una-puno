// Utilidades de Apps Script: propiedades, hash, fechas y errores con código.

export class ErrorApi extends Error {
  constructor(
    message: string,
    public codigo: string = 'error',
  ) {
    super(message);
  }
}

export const PROPS = {
  API_KEY_GEMINI: 'API_KEY_GEMINI',
  MODELO: 'MODELO',
  CARPETA_DRIVE_ID: 'CARPETA_DRIVE_ID',
  SPREADSHEET_ID: 'SPREADSHEET_ID',
  /** Nombre de usuario para entrar a la app. */
  USUARIO: 'USUARIO',
  /** Contraseña en texto: se usa una vez y se reemplaza por CLAVE_HASH al primer ingreso. */
  CLAVE_INICIAL: 'CLAVE_INICIAL',
  CLAVE_HASH: 'CLAVE_HASH',
  SESIONES: 'SESIONES',
} as const;

export const MODELO_POR_DEFECTO = 'gemini-3.8-flash';

export function prop(nombre: string): string {
  return PropertiesService.getScriptProperties().getProperty(nombre) ?? '';
}

export function setProp(nombre: string, valor: string): void {
  PropertiesService.getScriptProperties().setProperty(nombre, valor);
}

export function borrarProp(nombre: string): void {
  PropertiesService.getScriptProperties().deleteProperty(nombre);
}

export function sha256Hex(texto: string): string {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto, Utilities.Charset.UTF_8);
  return bytes.map((b) => ((b + 256) % 256).toString(16).padStart(2, '0')).join('');
}

export function md5Hex(texto: string): string {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, texto, Utilities.Charset.UTF_8);
  return bytes.map((b) => ((b + 256) % 256).toString(16).padStart(2, '0')).join('');
}

export function ahora(): string {
  return new Date().toISOString();
}

export function hoy(): string {
  return Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd');
}

export function uuid(): string {
  return Utilities.getUuid();
}

export function json(obj: unknown): GoogleAppsScript.Content.TextOutput {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

export function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Límite de una celda de Sheets (50 000) con margen. */
export function recortarCelda(s: string, max = 49000): string {
  return s.length > max ? `${s.slice(0, max)}…[recortado]` : s;
}

export function requerir(valor: unknown, nombre: string): string {
  if (typeof valor !== 'string' || valor.trim() === '') throw new ErrorApi(`Falta ${nombre}`, 'payload');
  return valor.trim();
}

export function requerirEpisodio(valor: unknown): number {
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 0) throw new ErrorApi('Episodio inválido', 'payload');
  return n;
}
