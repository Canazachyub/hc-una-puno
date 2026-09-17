// Único acceso a la hoja de cálculo. Cabeceras por nombre, nunca por posición.
// Si Sheets se queda corto, se cambia este archivo y nada más.

import { plantillaGuardada } from '../../shared/plantillas';
import { COLUMNAS_CONTROL, COLUMNAS_REGISTRO } from '../../shared/types';
import type { Duda, EstadoHC, FilaHC, ResumenHC, TipoRegistro } from '../../shared/types';
import { ErrorApi, PROPS, ahora, prop, recortarCelda, uuid } from './Util';

type Sheet = GoogleAppsScript.Spreadsheet.Sheet;
type Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;

export const HOJAS = {
  HC: 'HC',
  ESQUEMA: 'Esquema',
  OPCIONES: 'Opciones',
  KNOWLEDGE: 'Knowledge',
  REGISTRO: 'Registro',
} as const;

export const CABECERA_ESQUEMA = [
  'campo_id',
  'seccion',
  'orden',
  'label',
  'tipo',
  'obligatorio',
  'lista_id',
  'valor_normal',
  'reglas',
  'ayuda_kb',
];
export const CABECERA_OPCIONES = ['lista_id', 'nombre', 'tipo', 'orden', 'valor', 'etiqueta', 'formato_salida'];

let libroActual: Spreadsheet | null = null;

export function libro(): Spreadsheet {
  if (!libroActual) {
    const id = prop(PROPS.SPREADSHEET_ID);
    if (!id) throw new ErrorApi('Falta SPREADSHEET_ID: ejecuta setup() en el editor', 'config');
    libroActual = SpreadsheetApp.openById(id);
  }
  return libroActual;
}

export function usarLibro(ss: Spreadsheet): void {
  libroActual = ss;
}

export function hoja(nombre: string): Sheet {
  const h = libro().getSheetByName(nombre);
  if (!h) throw new ErrorApi(`Falta la hoja ${nombre}: ejecuta setup()`, 'config');
  return h;
}

/** Toda escritura va dentro del lock del script. */
export function conLock<T>(fn: () => T): T {
  const lock = LockService.getScriptLock();
  // Google abandona la respuesta a los 30 segundos: mejor avisar antes y que la app reintente.
  if (!lock.tryLock(15000)) throw new ErrorApi('La hoja está ocupada, reintentando…', 'ocupado');
  try {
    const r = fn();
    SpreadsheetApp.flush();
    return r;
  } finally {
    lock.releaseLock();
  }
}

// Sheets interpreta como fórmula lo que empieza con = + - @. El apóstrofo lo fuerza a texto.
export function aCelda(v: string): string {
  return /^[=+\-@']/.test(v) ? `'${v}` : v;
}

export function deCelda(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  return s.startsWith("'") ? s.slice(1) : s;
}

export function formatoTexto(h: Sheet): void {
  h.getRange(1, 1, h.getMaxRows(), h.getMaxColumns()).setNumberFormat('@');
}

export function leerTabla(nombre: string): string[][] {
  const h = hoja(nombre);
  const lr = h.getLastRow();
  const lc = h.getLastColumn();
  if (lr === 0 || lc === 0) return [];
  return h
    .getRange(1, 1, lr, lc)
    .getDisplayValues()
    .map((f) => f.map(deCelda));
}

/** Reemplaza el contenido completo de una hoja. */
export function escribirTabla(nombre: string, filas: string[][]): void {
  const h = hoja(nombre);
  h.clearContents();
  if (filas.length === 0) return;
  const ancho = Math.max(...filas.map((f) => f.length));
  if (h.getMaxRows() < filas.length) h.insertRowsAfter(h.getMaxRows(), filas.length - h.getMaxRows());
  if (h.getMaxColumns() < ancho) h.insertColumnsAfter(h.getMaxColumns(), ancho - h.getMaxColumns());
  formatoTexto(h);
  const datos = filas.map((f) => {
    const fila = f.map((v) => aCelda(recortarCelda(v)));
    while (fila.length < ancho) fila.push('');
    return fila;
  });
  h.getRange(1, 1, datos.length, ancho).setValues(datos);
}

/** Agrega filas al final de una hoja existente. */
export function agregarFilas(nombre: string, filas: string[][]): void {
  if (filas.length === 0) return;
  const h = hoja(nombre);
  const desde = h.getLastRow() + 1;
  asegurarFilas(h, desde + filas.length - 1);
  const ancho = filas[0].length;
  h.getRange(desde, 1, filas.length, ancho).setValues(filas.map((f) => f.map((v) => aCelda(recortarCelda(v)))));
}

function asegurarFilas(h: Sheet, hasta: number): void {
  const max = h.getMaxRows();
  if (hasta <= max) return;
  const extra = Math.max(hasta - max, 200);
  h.insertRowsAfter(max, extra);
  h.getRange(max + 1, 1, extra, h.getMaxColumns()).setNumberFormat('@');
}

// ---------- HC ----------

export function cabeceraHC(): string[] {
  const h = hoja(HOJAS.HC);
  const lc = h.getLastColumn();
  if (lc === 0) return [];
  return h
    .getRange(1, 1, 1, lc)
    .getDisplayValues()[0]
    .map((s) => s.trim());
}

/** Agrega al final las columnas que falten. Agregar un campo no rompe nada. */
export function asegurarColumnas(ids: string[]): string[] {
  const h = hoja(HOJAS.HC);
  const cab = cabeceraHC();
  // Las dos plantillas comparten campos: un id repetido es una sola columna.
  const faltan = [...new Set(ids)].filter((id) => !cab.includes(id));
  if (faltan.length === 0) return cab;
  const desde = cab.length + 1;
  const necesarias = desde + faltan.length - 1;
  if (h.getMaxColumns() < necesarias) h.insertColumnsAfter(h.getMaxColumns(), necesarias - h.getMaxColumns());
  h.getRange(1, desde, h.getMaxRows(), faltan.length).setNumberFormat('@');
  h.getRange(1, desde, 1, faltan.length).setValues([faltan]);
  return [...cab, ...faltan];
}

function columna(cab: string[], nombre: string): number {
  const i = cab.indexOf(nombre);
  if (i < 0) throw new ErrorApi(`La hoja HC no tiene la columna ${nombre}`, 'config');
  return i + 1;
}

export function buscarFilasDni(dni: string, cab: string[]): number[] {
  const h = hoja(HOJAS.HC);
  const lr = h.getLastRow();
  if (lr < 2) return [];
  return h
    .getRange(2, columna(cab, 'dni'), lr - 1, 1)
    .createTextFinder(dni)
    .matchEntireCell(true)
    .matchCase(true)
    .findAll()
    .map((r) => r.getRow());
}

export function leerFilaHC(n: number, cab: string[]): Record<string, string> {
  const valores = hoja(HOJAS.HC).getRange(n, 1, 1, cab.length).getDisplayValues()[0];
  const mapa: Record<string, string> = {};
  cab.forEach((k, i) => {
    if (k) mapa[k] = deCelda(valores[i]);
  });
  return mapa;
}

export function buscarFila(dni: string, episodio: number, cab: string[]): number | null {
  const colEp = columna(cab, 'episodio');
  const h = hoja(HOJAS.HC);
  for (const n of buscarFilasDni(dni, cab)) {
    if (Number(h.getRange(n, colEp).getDisplayValue()) === episodio) return n;
  }
  return null;
}

export function escribirFilaHC(n: number, cab: string[], mapa: Record<string, string>): void {
  const h = hoja(HOJAS.HC);
  asegurarFilas(h, n);
  h.getRange(n, 1, 1, cab.length).setValues([cab.map((k) => aCelda(recortarCelda(mapa[k] ?? '')))]);
}

export function siguienteFilaHC(): number {
  return hoja(HOJAS.HC).getLastRow() + 1;
}

export function mapaAFila(mapa: Record<string, string>): FilaHC {
  const valores: Record<string, string> = {};
  for (const [k, v] of Object.entries(mapa)) {
    if (!(COLUMNAS_CONTROL as readonly string[]).includes(k) && v !== '') valores[k] = v;
  }
  return {
    dni: mapa.dni ?? '',
    episodio: Number(mapa.episodio) || 0,
    plantilla: plantillaGuardada(mapa.plantilla),
    estado: (mapa.estado === 'completa' ? 'completa' : 'borrador') as EstadoHC,
    completitud: Number(mapa.completitud) || 0,
    version: Number(mapa.version) || 0,
    esquema_version: mapa.esquema_version ?? '',
    creado_en: mapa.creado_en ?? '',
    actualizado_en: mapa.actualizado_en ?? '',
    valores,
  };
}

export function listarResumenes(): ResumenHC[] {
  const h = hoja(HOJAS.HC);
  const ultima = h.getLastRow();
  if (ultima < 2) return [];
  const cab = cabeceraHC();
  // Con dos plantillas la hoja pasa de 500 columnas: se leen solo las diez que hacen falta.
  const nombres = ['dni', 'episodio', 'plantilla', 'estado', 'completitud', 'version', 'actualizado_en', 'fil.apellidos', 'fil.nombres', 'ea.sintoma_guia'];
  const columnas: Record<string, string[]> = {};
  for (const n of nombres) {
    const c = cab.indexOf(n);
    columnas[n] = c < 0 ? [] : h.getRange(2, c + 1, ultima - 1, 1).getDisplayValues().map((f) => deCelda(f[0]));
  }
  const filas = Array.from({ length: ultima - 1 }, (_, n) => nombres.map((k) => columnas[k][n] ?? ''));
  const idx = (k: string) => nombres.indexOf(k);
  const i = {
    dni: idx('dni'),
    episodio: idx('episodio'),
    plantilla: idx('plantilla'),
    estado: idx('estado'),
    completitud: idx('completitud'),
    version: idx('version'),
    actualizado_en: idx('actualizado_en'),
    apellidos: idx('fil.apellidos'),
    nombres: idx('fil.nombres'),
    sintoma_guia: idx('ea.sintoma_guia'),
  };
  const get = (f: string[], j: number) => (j >= 0 ? (f[j] ?? '') : '');
  return filas
    .filter((f) => get(f, i.dni) !== '')
    .map((f) => ({
      dni: get(f, i.dni),
      episodio: Number(get(f, i.episodio)) || 0,
      plantilla: plantillaGuardada(get(f, i.plantilla)),
      estado: (get(f, i.estado) === 'completa' ? 'completa' : 'borrador') as EstadoHC,
      completitud: Number(get(f, i.completitud)) || 0,
      version: Number(get(f, i.version)) || 0,
      actualizado_en: get(f, i.actualizado_en),
      apellidos: get(f, i.apellidos),
      nombres: get(f, i.nombres),
      sintoma_guia: get(f, i.sintoma_guia),
    }))
    .sort((a, b) => b.actualizado_en.localeCompare(a.actualizado_en));
}

// ---------- Registro ----------

export interface EventoRegistro {
  id?: string;
  tipo: TipoRegistro;
  dni?: string;
  episodio?: number;
  seccion?: string;
  campo_id?: string;
  contenido?: string;
  estado?: string;
}

export function registrar(eventos: EventoRegistro[]): string[] {
  const ids: string[] = [];
  const filas = eventos.map((e) => {
    const id = e.id ?? uuid();
    ids.push(id);
    const fila: Record<(typeof COLUMNAS_REGISTRO)[number], string> = {
      id,
      tipo: e.tipo,
      dni: e.dni ?? '',
      episodio: e.episodio === undefined ? '' : String(e.episodio),
      seccion: e.seccion ?? '',
      campo_id: e.campo_id ?? '',
      contenido: e.contenido ?? '',
      estado: e.estado ?? '',
      fecha: ahora(),
    };
    return COLUMNAS_REGISTRO.map((k) => fila[k]);
  });
  agregarFilas(HOJAS.REGISTRO, filas);
  return ids;
}

function filaRegistro(id: string): number | null {
  const h = hoja(HOJAS.REGISTRO);
  const lr = h.getLastRow();
  if (lr < 2) return null;
  const r = h.getRange(2, 1, lr - 1, 1).createTextFinder(id).matchEntireCell(true).matchCase(true).findNext();
  return r ? r.getRow() : null;
}

export function leerRegistro(id: string): Record<string, string> | null {
  const n = filaRegistro(id);
  if (!n) return null;
  const v = hoja(HOJAS.REGISTRO).getRange(n, 1, 1, COLUMNAS_REGISTRO.length).getDisplayValues()[0];
  const o: Record<string, string> = {};
  COLUMNAS_REGISTRO.forEach((k, i) => {
    o[k] = deCelda(v[i]);
  });
  return o;
}

/** Crea o reemplaza un evento con id fijo (decisiones de la revisión). */
export function guardarRegistro(e: EventoRegistro & { id: string }): void {
  const n = filaRegistro(e.id);
  if (n === null) {
    registrar([e]);
    return;
  }
  const fila: Record<(typeof COLUMNAS_REGISTRO)[number], string> = {
    id: e.id,
    tipo: e.tipo,
    dni: e.dni ?? '',
    episodio: e.episodio === undefined ? '' : String(e.episodio),
    seccion: e.seccion ?? '',
    campo_id: e.campo_id ?? '',
    contenido: e.contenido ?? '',
    estado: e.estado ?? '',
    fecha: ahora(),
  };
  hoja(HOJAS.REGISTRO)
    .getRange(n, 1, 1, COLUMNAS_REGISTRO.length)
    .setValues([COLUMNAS_REGISTRO.map((k) => aCelda(recortarCelda(fila[k])))]);
}

/** Todos los eventos de un tipo. */
export function registrosDeTipo(tipo: TipoRegistro): Record<string, string>[] {
  const h = hoja(HOJAS.REGISTRO);
  const lr = h.getLastRow();
  if (lr < 2) return [];
  const colTipo = COLUMNAS_REGISTRO.indexOf('tipo') + 1;
  return h
    .getRange(2, colTipo, lr - 1, 1)
    .createTextFinder(tipo)
    .matchEntireCell(true)
    .matchCase(true)
    .findAll()
    .map((r) => {
      const v = h.getRange(r.getRow(), 1, 1, COLUMNAS_REGISTRO.length).getDisplayValues()[0].map(deCelda);
      return Object.fromEntries(COLUMNAS_REGISTRO.map((k, i) => [k, v[i]])) as Record<string, string>;
    });
}

export function cambiarEstadoRegistro(ids: string[], estado: string): void {
  const col = COLUMNAS_REGISTRO.indexOf('estado') + 1;
  const h = hoja(HOJAS.REGISTRO);
  for (const id of ids) {
    const n = filaRegistro(id);
    if (n) h.getRange(n, col).setValue(estado);
  }
}

export function dudasDe(dni: string, episodio: number): Duda[] {
  const h = hoja(HOJAS.REGISTRO);
  const lr = h.getLastRow();
  if (lr < 2) return [];
  const colDni = COLUMNAS_REGISTRO.indexOf('dni') + 1;
  const filas = h
    .getRange(2, colDni, lr - 1, 1)
    .createTextFinder(dni)
    .matchEntireCell(true)
    .findAll()
    .map((r) => r.getRow());
  const dudas: Duda[] = [];
  for (const n of filas) {
    const v = h
      .getRange(n, 1, 1, COLUMNAS_REGISTRO.length)
      .getDisplayValues()[0]
      .map(deCelda);
    const o = Object.fromEntries(COLUMNAS_REGISTRO.map((k, i) => [k, v[i]])) as Record<string, string>;
    if (o.tipo !== 'duda' || Number(o.episodio) !== episodio) continue;
    dudas.push({
      id: o.id,
      seccion: o.seccion,
      campo_id: o.campo_id,
      pregunta: o.contenido,
      estado: o.estado === 'resuelta' ? 'resuelta' : 'pendiente',
      fecha: o.fecha,
    });
  }
  return dudas;
}
