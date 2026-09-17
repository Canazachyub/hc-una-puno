// Puesta en marcha: crea las 5 hojas, importa las semillas, el usuario, la carpeta y el respaldo.
// Se ejecuta una vez: desde el editor (setup) o al abrir la página de configuración (/dev).
// La hoja y la carpeta salen de HC_CONFIG (inicio de Code.gs); si no, de la hoja que contiene el script
// (Extensiones → Apps Script); si no, se crean. Si alguna está compartida con cualquiera, no se usa.

import esquemaCsv from '../../seed/esquema.csv';
import opcionesCsv from '../../seed/opciones.csv';
import { parsearCsv } from '../../shared/csv';
import { filasAEsquema } from '../../shared/catalogo';
import { CAMPOS_SISTEMA } from '../../shared/seguimiento';
import { COLUMNAS_CONTROL, COLUMNAS_KNOWLEDGE, COLUMNAS_REGISTRO } from '../../shared/types';
import type { KbCargarPayload } from '../../shared/types';
import { KB_VERSION, olvidarCatalogos } from './Catalogos';
import { llamarGemini, modelo } from './Gemini';
import {
  CABECERA_ESQUEMA,
  CABECERA_OPCIONES,
  HOJAS,
  agregarFilas,
  asegurarColumnas,
  conLock,
  escribirTabla,
  formatoTexto,
  hoja,
  usarLibro,
} from './Repo';
import { asegurarUsuario } from './Auth';
import { AVISO_CARPETA_PUBLICA, AVISO_HOJA_PUBLICA, configurado, esPublico } from './Drive';
import { ErrorApi, MODELO_POR_DEFECTO, PROPS, prop, setProp, uuid } from './Util';

const CARPETA_RESPALDOS = 'Respaldos';
const DIAS_RETENCION = 30;

function asegurarHoja(ss: GoogleAppsScript.Spreadsheet.Spreadsheet, nombre: string, cabecera: string[]): void {
  let h = ss.getSheetByName(nombre);
  if (!h) h = ss.insertSheet(nombre);
  formatoTexto(h);
  if (h.getLastRow() === 0 && cabecera.length > 0) {
    if (h.getMaxColumns() < cabecera.length) h.insertColumnsAfter(h.getMaxColumns(), cabecera.length - h.getMaxColumns());
    h.getRange(1, 1, 1, cabecera.length).setValues([cabecera]).setFontWeight('bold');
    h.setFrozenRows(1);
  }
}

function carpeta(): GoogleAppsScript.Drive.Folder {
  const id = configurado('carpeta') || prop(PROPS.CARPETA_DRIVE_ID);
  let f: GoogleAppsScript.Drive.Folder;
  if (id) {
    try {
      f = DriveApp.getFolderById(id);
    } catch {
      throw new ErrorApi(`No se puede abrir la carpeta de Drive ${id}: revisa el enlace y que sea de esta cuenta`, 'config');
    }
  } else {
    f = DriveApp.createFolder('HC App');
  }
  if (esPublico(f)) throw new ErrorApi(AVISO_CARPETA_PUBLICA, 'config');
  if (f.getId() !== prop(PROPS.CARPETA_DRIVE_ID)) setProp(PROPS.CARPETA_DRIVE_ID, f.getId());
  return f;
}

function abrirHoja(id: string): GoogleAppsScript.Spreadsheet.Spreadsheet {
  try {
    return SpreadsheetApp.openById(id);
  } catch {
    throw new ErrorApi(`No se puede abrir la hoja de cálculo ${id}: revisa el enlace y que sea de esta cuenta`, 'config');
  }
}

/** La hoja de cálculo que contiene el script, si el script se creó desde ella. */
function libroContenedor(): GoogleAppsScript.Spreadsheet.Spreadsheet | null {
  try {
    return typeof SpreadsheetApp.getActiveSpreadsheet === 'function' ? SpreadsheetApp.getActiveSpreadsheet() : null;
  } catch {
    return null;
  }
}

declare const SEMILLA_VERSION: string;
/** Versión de las semillas con que se cargó la hoja: si cambia al desplegar, se reimportan solas. */
export const PROP_SEMILLAS = 'SEMILLA_VERSION';

export interface InfoSetup {
  hoja: string;
  carpeta: string;
  usuario: string;
}

export function setup(): InfoSetup {
  const f = carpeta();
  let ssId = configurado('hoja') || prop(PROPS.SPREADSHEET_ID);
  let ss: GoogleAppsScript.Spreadsheet.Spreadsheet;
  let creada = false;
  if (ssId) {
    ss = abrirHoja(ssId);
  } else {
    const contenedor = libroContenedor();
    if (contenedor) {
      ss = contenedor;
    } else {
      ss = SpreadsheetApp.create('HC App · datos (privado)');
      creada = true;
    }
    ssId = ss.getId();
  }
  if (!creada && esPublico(DriveApp.getFileById(ssId))) throw new ErrorApi(AVISO_HOJA_PUBLICA, 'config');
  if (creada) DriveApp.getFileById(ssId).moveTo(f);
  if (ssId !== prop(PROPS.SPREADSHEET_ID)) setProp(PROPS.SPREADSHEET_ID, ssId);
  usarLibro(ss);

  const esquema = filasAEsquema(parsearCsv(esquemaCsv));
  asegurarHoja(ss, HOJAS.HC, [...COLUMNAS_CONTROL, ...esquema.map((c) => c.campo_id)]);
  asegurarHoja(ss, HOJAS.ESQUEMA, CABECERA_ESQUEMA);
  asegurarHoja(ss, HOJAS.OPCIONES, CABECERA_OPCIONES);
  asegurarHoja(ss, HOJAS.KNOWLEDGE, [...COLUMNAS_KNOWLEDGE]);
  asegurarHoja(ss, HOJAS.REGISTRO, [...COLUMNAS_REGISTRO]);
  // La hoja vacía que trae todo libro nuevo sobra; si tiene algo tuyo, se queda.
  const hoja1 = ss.getSheetByName('Hoja 1') ?? ss.getSheetByName('Sheet1');
  if (hoja1 && hoja1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(hoja1);

  // Las semillas solo se importan si la hoja está vacía, para no pisar lo que edites a mano.
  if (hoja(HOJAS.ESQUEMA).getLastRow() <= 1) escribirTabla(HOJAS.ESQUEMA, parsearCsv(esquemaCsv));
  if (hoja(HOJAS.OPCIONES).getLastRow() <= 1) escribirTabla(HOJAS.OPCIONES, parsearCsv(opcionesCsv));
  asegurarColumnas([...esquema.map((c) => c.campo_id), ...CAMPOS_SISTEMA]);
  if (!prop(PROP_SEMILLAS)) setProp(PROP_SEMILLAS, SEMILLA_VERSION);

  if (!prop(PROPS.MODELO)) setProp(PROPS.MODELO, MODELO_POR_DEFECTO);
  const acceso = asegurarUsuario();
  instalarRespaldo();

  Logger.log(`Hoja de datos: ${ss.getUrl()}`);
  Logger.log(`Carpeta de audios: ${f.getUrl()}`);
  Logger.log(`Modelo: ${modelo()}`);
  if (acceso) {
    Logger.log(`ACCESO A LA APP → Usuario: ${acceso.usuario} · Contraseña temporal: ${acceso.clave}`);
    Logger.log('Entra con esos datos y cambia usuario y contraseña en Ajustes.');
  } else {
    Logger.log(`Usuario de la app: ${prop(PROPS.USUARIO)} (si olvidaste la contraseña, ejecuta restablecerClave)`);
  }
  if (!prop(PROPS.API_KEY_GEMINI)) {
    Logger.log('Falta API_KEY_GEMINI: pégala en la página de configuración (URL /dev del script).');
  }
  Logger.log('No compartas la hoja ni la carpeta: contienen nombres y DNI de pacientes.');
  return { hoja: ss.getUrl(), carpeta: f.getUrl(), usuario: prop(PROPS.USUARIO) };
}

/** Sobrescribe Esquema y Opciones con los CSV semilla del repositorio. */
export function reimportarSemillas(): void {
  conLock(() => {
    escribirTabla(HOJAS.ESQUEMA, parsearCsv(esquemaCsv));
    escribirTabla(HOJAS.OPCIONES, parsearCsv(opcionesCsv));
    asegurarColumnas([...filasAEsquema(parsearCsv(esquemaCsv)).map((c) => c.campo_id), ...CAMPOS_SISTEMA]);
  });
  setProp(PROP_SEMILLAS, SEMILLA_VERSION);
  olvidarCatalogos();
  Logger.log('Esquema y Opciones reimportados.');
}

export function instalarRespaldo(): void {
  for (const t of ScriptApp.getProjectTriggers()) {
    if (t.getHandlerFunction() === 'respaldoDiario') ScriptApp.deleteTrigger(t);
  }
  ScriptApp.newTrigger('respaldoDiario').timeBased().everyDays(1).atHour(3).create();
}

/** Copia diaria de la hoja, con 30 días de retención. */
export function respaldoDiario(): void {
  const ssId = prop(PROPS.SPREADSHEET_ID);
  if (!ssId) return;
  // Si la carpeta se volvió pública, falla a propósito: Google avisa por correo al dueño.
  const base = carpeta();
  const it = base.getFoldersByName(CARPETA_RESPALDOS);
  const destino = it.hasNext() ? it.next() : base.createFolder(CARPETA_RESPALDOS);
  const fecha = Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd');
  DriveApp.getFileById(ssId).makeCopy(`HC respaldo ${fecha}`, destino);

  const limite = Date.now() - DIAS_RETENCION * 24 * 3600 * 1000;
  const archivos = destino.getFiles();
  while (archivos.hasNext()) {
    const a = archivos.next();
    if (a.getDateCreated().getTime() < limite) a.setTrashed(true);
  }
}

export function probarGemini(): void {
  const r = llamarGemini({ partes: [{ type: 'text', text: 'Responde solo: listo' }], pensamiento: 'low', maxTokens: 50 });
  Logger.log(`Gemini (${modelo()}): ${r}`);
}

/** Carga los fragmentos de las notas de Semiología (lo llama scripts/kb-build.ts). */
export function cargarKnowledge(p: KbCargarPayload): { total: number } {
  if (!Array.isArray(p.filas)) throw new ErrorApi('Faltan filas', 'payload');
  const filas = p.filas.map((k) => COLUMNAS_KNOWLEDGE.map((c) => String(k[c] ?? '')));
  const total = conLock(() => {
    if (p.reemplazar) escribirTabla(HOJAS.KNOWLEDGE, [[...COLUMNAS_KNOWLEDGE], ...filas]);
    else agregarFilas(HOJAS.KNOWLEDGE, filas);
    return hoja(HOJAS.KNOWLEDGE).getLastRow() - 1;
  });
  setProp(KB_VERSION, uuid());
  olvidarCatalogos();
  return { total };
}
