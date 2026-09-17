// Puesta en marcha: crea las 5 hojas, importa las semillas, el token, la carpeta y el respaldo.
// Se ejecuta una vez desde el editor de Apps Script: setup().

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
  const id = prop(PROPS.CARPETA_DRIVE_ID);
  if (id) return DriveApp.getFolderById(id);
  const f = DriveApp.createFolder('HC App');
  setProp(PROPS.CARPETA_DRIVE_ID, f.getId());
  return f;
}

declare const SEMILLA_VERSION: string;
/** Versión de las semillas con que se cargó la hoja: si cambia al desplegar, se reimportan solas. */
export const PROP_SEMILLAS = 'SEMILLA_VERSION';

export interface InfoSetup {
  hoja: string;
  usuario: string;
}

export function setup(): InfoSetup {
  const f = carpeta();
  let ssId = prop(PROPS.SPREADSHEET_ID);
  let ss: GoogleAppsScript.Spreadsheet.Spreadsheet;
  if (ssId) {
    ss = SpreadsheetApp.openById(ssId);
  } else {
    ss = SpreadsheetApp.create('HC App · datos (privado)');
    ssId = ss.getId();
    setProp(PROPS.SPREADSHEET_ID, ssId);
    DriveApp.getFileById(ssId).moveTo(f);
  }
  usarLibro(ss);

  const esquema = filasAEsquema(parsearCsv(esquemaCsv));
  asegurarHoja(ss, HOJAS.HC, [...COLUMNAS_CONTROL, ...esquema.map((c) => c.campo_id)]);
  asegurarHoja(ss, HOJAS.ESQUEMA, CABECERA_ESQUEMA);
  asegurarHoja(ss, HOJAS.OPCIONES, CABECERA_OPCIONES);
  asegurarHoja(ss, HOJAS.KNOWLEDGE, [...COLUMNAS_KNOWLEDGE]);
  asegurarHoja(ss, HOJAS.REGISTRO, [...COLUMNAS_REGISTRO]);
  const hoja1 = ss.getSheetByName('Hoja 1') ?? ss.getSheetByName('Sheet1');
  if (hoja1 && ss.getSheets().length > 1) ss.deleteSheet(hoja1);

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
  Logger.log('No compartas la hoja: contiene nombres y DNI de pacientes.');
  return { hoja: ss.getUrl(), usuario: prop(PROPS.USUARIO) };
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
