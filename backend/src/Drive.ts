// Hoja y carpeta de Drive elegidas por el dueño, y la regla de oro: nunca públicas,
// porque guardan nombres, DNI, audios y fotos de pacientes.

import { ErrorApi, PROPS, prop } from './Util';

/** Enlaces escritos al inicio de Code.gs (o en Config.js al desplegar con clasp). */
declare const HC_CONFIG: { hoja?: string; carpeta?: string } | undefined;

/** Id de un enlace de Drive u Hojas de cálculo («…/d/ID/…», «…/folders/ID?…», «?id=ID») o el id solo. */
export function idDeEnlace(texto: string): string {
  const t = String(texto ?? '').trim();
  const m = /\/(?:d|folders)\/([\w-]{3,})/.exec(t) ?? /[?&]id=([\w-]{3,})/.exec(t);
  if (m) return m[1];
  return /^[\w-]{3,}$/.test(t) ? t : '';
}

export function configurado(clave: 'hoja' | 'carpeta'): string {
  const c = typeof HC_CONFIG === 'undefined' ? undefined : HC_CONFIG;
  return idDeEnlace(c?.[clave] ?? '');
}

export const AVISO_CARPETA_PUBLICA =
  'La carpeta de Drive está compartida con cualquiera que tenga el enlace y ahí van audios, fotos y respaldos de pacientes. En Drive: clic derecho → Compartir → Acceso general → «Restringido». Luego vuelve a abrir esta página.';
export const AVISO_HOJA_PUBLICA =
  'La hoja de cálculo está compartida con cualquiera que tenga el enlace y guarda nombres y DNI de pacientes. En la hoja: Compartir → Acceso general → «Restringido». Luego vuelve a abrir esta página.';

/** Compartido con cualquiera que tenga el enlace, o público en la web. */
export function esPublico(item: object): boolean {
  const conAcceso = item as { getSharingAccess?: () => unknown };
  if (typeof DriveApp.Access === 'undefined' || typeof conAcceso.getSharingAccess !== 'function') return false;
  const a = conAcceso.getSharingAccess();
  return a === DriveApp.Access.ANYONE || a === DriveApp.Access.ANYONE_WITH_LINK;
}

/** La carpeta de datos, comprobada como privada (la comprobación se recuerda 10 minutos). */
export function carpetaDatos(): GoogleAppsScript.Drive.Folder {
  const id = prop(PROPS.CARPETA_DRIVE_ID);
  if (!id) throw new ErrorApi('Falta la carpeta de Drive: abre la configuración del servidor', 'config');
  const f = DriveApp.getFolderById(id);
  const cache = CacheService.getScriptCache();
  const clave = `carpeta_privada:${id}`;
  if (cache.get(clave) !== '1') {
    if (esPublico(f)) throw new ErrorApi(AVISO_CARPETA_PUBLICA, 'config');
    cache.put(clave, '1', 600);
  }
  return f;
}
