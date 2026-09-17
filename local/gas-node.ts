// Apps Script sobre Node. Ejecuta backend/dist/Code.js sin cambios:
// - en memoria, para las pruebas;
// - con persistencia en disco (hojas en CSV, propiedades en JSON, audios y respaldos en carpetas), para el servidor local.

import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parsearCsv, serializarCsv } from '../shared/csv';

export interface PeticionHttp {
  url: string;
  cuerpo: Record<string, unknown>;
}

export interface OpcionesGas {
  /** Carpeta de datos. Sin ella, todo vive en memoria. */
  carpeta?: string;
  /** Falla si se escribe algo que Sheets tomaría como fórmula (para las pruebas). */
  estricto?: boolean;
  /** Respuesta simulada de Gemini. Sin ella, se llama a la API de verdad. */
  gemini?: (p: PeticionHttp) => { codigo: number; cuerpo: unknown };
  /** Variables que tienen prioridad sobre las propiedades guardadas. */
  entorno?: Record<string, string>;
  /** Copia adicional de los respaldos. */
  respaldosExtra?: string;
  /** Simula un script creado desde una hoja de cálculo: contenido de su «Hoja 1». */
  contenedor?: string[][];
  log?: (s: string) => void;
}

const ID_LIBRO = 'local';
const ID_AUDIOS = 'audios';

class Hoja {
  datos: string[][] = [];
  maxFilas = 1000;
  maxCols = 26;
  sucia = false;
  constructor(
    public nombre: string,
    private estricto: boolean,
  ) {}

  getName() {
    return this.nombre;
  }
  getLastRow() {
    for (let r = this.datos.length - 1; r >= 0; r--) if (this.datos[r]?.some((v) => v !== '')) return r + 1;
    return 0;
  }
  getLastColumn() {
    let max = 0;
    for (const f of this.datos) for (let c = (f?.length ?? 0) - 1; c >= max; c--) if (f[c] !== '') max = c + 1;
    return max;
  }
  getMaxRows() {
    return this.maxFilas;
  }
  getMaxColumns() {
    return this.maxCols;
  }
  insertRowsAfter(_n: number, k: number) {
    this.maxFilas += k;
  }
  insertColumnsAfter(_n: number, k: number) {
    this.maxCols += k;
  }
  clearContents() {
    this.datos = [];
    this.sucia = true;
    return this;
  }
  setFrozenRows() {
    return this;
  }
  leer(r: number, c: number): string {
    return this.datos[r - 1]?.[c - 1] ?? '';
  }
  escribir(r: number, c: number, v: unknown) {
    if (r > this.maxFilas || c > this.maxCols) throw new Error(`Fuera de rango ${r},${c} en ${this.nombre}`);
    let s = v === null || v === undefined ? '' : String(v);
    // Sheets consume el apóstrofo inicial y guarda texto.
    if (s.startsWith("'")) s = s.slice(1);
    else if (this.estricto && /^[=+]/.test(s)) throw new Error(`Sheets interpretaría como fórmula: ${s}`);
    if (s.length > 50000) throw new Error('Celda de más de 50 000 caracteres');
    while (this.datos.length < r) this.datos.push([]);
    const fila = this.datos[r - 1];
    while (fila.length < c) fila.push('');
    fila[c - 1] = s;
    this.sucia = true;
  }
  getRange(r: number, c: number, nr = 1, nc = 1) {
    return new Rango(this, r, c, nr, nc);
  }
  aCsv(): string {
    const filas = this.datos.slice(0, this.getLastRow());
    const ancho = this.getLastColumn();
    return `﻿${serializarCsv(filas.map((f) => Array.from({ length: ancho }, (_, i) => f[i] ?? '')))}`;
  }
  cargarCsv(texto: string) {
    this.datos = parsearCsv(texto);
    this.maxFilas = Math.max(1000, this.datos.length + 200);
    this.maxCols = Math.max(26, ...this.datos.map((f) => f.length));
  }
}

class Rango {
  constructor(
    private h: Hoja,
    private r: number,
    private c: number,
    private nr: number,
    private nc: number,
  ) {}
  getRow() {
    return this.r;
  }
  getDisplayValues() {
    return Array.from({ length: this.nr }, (_, i) => Array.from({ length: this.nc }, (_, j) => this.h.leer(this.r + i, this.c + j)));
  }
  getDisplayValue() {
    return this.h.leer(this.r, this.c);
  }
  setValues(v: unknown[][]) {
    if (v.length !== this.nr || v.some((f) => f.length !== this.nc)) throw new Error('setValues: dimensiones distintas');
    v.forEach((f, i) => f.forEach((x, j) => this.h.escribir(this.r + i, this.c + j, x)));
    return this;
  }
  setValue(v: unknown) {
    this.h.escribir(this.r, this.c, v);
    return this;
  }
  setNumberFormat() {
    return this;
  }
  setFontWeight() {
    return this;
  }
  createTextFinder(texto: string) {
    let entera = false;
    const buscar = () => {
      const out: Rango[] = [];
      for (let i = 0; i < this.nr; i++) {
        const v = this.h.leer(this.r + i, this.c);
        if (entera ? v === texto : v.includes(texto)) out.push(new Rango(this.h, this.r + i, this.c, 1, 1));
      }
      return out;
    };
    const tf = {
      matchEntireCell(x: boolean) {
        entera = x;
        return tf;
      },
      matchCase() {
        return tf;
      },
      findAll: buscar,
      findNext: () => buscar()[0] ?? null,
    };
    return tf;
  }
}

class Libro {
  hojas: Hoja[] = [];
  borradas: string[] = [];
  constructor(
    public id: string,
    private estricto: boolean,
    private carpeta?: string,
  ) {}
  getId() {
    return this.id;
  }
  getUrl() {
    return this.carpeta ? join(this.carpeta, 'hojas') : `memoria://${this.id}`;
  }
  getSheetByName(n: string) {
    return this.hojas.find((h) => h.nombre === n) ?? null;
  }
  insertSheet(n: string) {
    const h = new Hoja(n, this.estricto);
    h.sucia = true;
    this.hojas.push(h);
    return h;
  }
  getSheets() {
    return this.hojas;
  }
  deleteSheet(h: Hoja) {
    this.hojas = this.hojas.filter((x) => x !== h);
    this.borradas.push(h.nombre);
  }
}

function formatearFecha(d: Date, zona: string, formato: string): string {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: zona,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return formato
    .replace('yyyy', partes.year)
    .replace('MM', partes.month)
    .replace('dd', partes.day)
    .replace('HH', partes.hour)
    .replace('mm', partes.minute)
    .replace('ss', partes.second);
}

// Apps Script es síncrono: la petición HTTP se hace en un proceso hijo y se espera su resultado.
const HIJO_FETCH = `
let entrada = '';
process.stdin.setEncoding('utf8');
for await (const t of process.stdin) entrada += t;
const p = JSON.parse(entrada);
try {
  const r = await fetch(p.url, { method: p.method, headers: p.headers, body: p.body });
  process.stdout.write(JSON.stringify({ codigo: r.status, texto: await r.text() }));
} catch (e) {
  process.stdout.write(JSON.stringify({ codigo: 599, texto: JSON.stringify({ error: { message: 'Sin conexión con Gemini: ' + String(e && e.cause ? e.cause.code || e.cause : e) } }) }));
}`;

function fetchSincrono(url: string, metodo: string, headers: Record<string, string>, cuerpo: string): { codigo: number; texto: string } {
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', HIJO_FETCH], {
    input: JSON.stringify({ url, method: metodo.toUpperCase(), headers, body: cuerpo }),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 180_000,
    windowsHide: true,
  });
  if (r.error || !r.stdout) return { codigo: 599, texto: JSON.stringify({ error: { message: `Fallo la llamada HTTP: ${r.error?.message ?? r.stderr}` } }) };
  return JSON.parse(r.stdout) as { codigo: number; texto: string };
}

function escribirAtomico(ruta: string, contenido: string | Buffer): void {
  const tmp = `${ruta}.tmp`;
  writeFileSync(tmp, contenido);
  renameSync(tmp, ruta);
}

export function crearEntorno(o: OpcionesGas = {}) {
  const estricto = !!o.estricto;
  const carpeta = o.carpeta;
  const dirHojas = carpeta ? join(carpeta, 'hojas') : '';
  const dirAudios = carpeta ? join(carpeta, 'audios') : '';
  const dirRespaldos = carpeta ? join(carpeta, 'respaldos') : '';
  const archivoProps = carpeta ? join(carpeta, 'propiedades.json') : '';
  if (carpeta) for (const d of [dirHojas, dirAudios, dirRespaldos]) mkdirSync(d, { recursive: true });

  const props = new Map<string, string>(
    archivoProps && existsSync(archivoProps) ? Object.entries(JSON.parse(readFileSync(archivoProps, 'utf8')) as Record<string, string>) : [],
  );
  const guardarProps = () => {
    if (archivoProps) escribirAtomico(archivoProps, JSON.stringify(Object.fromEntries(props), null, 2));
  };
  const deEntorno: Record<string, string | undefined> = {
    API_KEY_GEMINI: o.entorno?.GEMINI_API_KEY,
    MODELO: o.entorno?.GEMINI_MODELO,
  };

  const cache = new Map<string, string>();
  const vence = new Map<string, number>();
  const libros = new Map<string, Libro>();
  const archivosDrive: { nombre: string; bytes: number }[] = [];
  const logs: string[] = [];
  const llamadasGemini: PeticionHttp[] = [];

  if (carpeta && existsSync(dirHojas) && readdirSync(dirHojas).some((f) => f.endsWith('.csv'))) {
    const l = new Libro(ID_LIBRO, estricto, carpeta);
    for (const f of readdirSync(dirHojas).filter((x) => x.endsWith('.csv'))) {
      const h = new Hoja(f.slice(0, -4), estricto);
      h.cargarCsv(readFileSync(join(dirHojas, f), 'utf8'));
      l.hojas.push(h);
    }
    libros.set(l.id, l);
  }

  /** Escribe en disco las hojas que cambiaron. */
  const guardar = () => {
    if (!carpeta) return;
    for (const l of libros.values()) {
      for (const h of l.hojas) {
        if (!h.sucia) continue;
        escribirAtomico(join(dirHojas, `${h.nombre}.csv`), h.aCsv());
        h.sucia = false;
      }
      for (const n of l.borradas.splice(0)) rmSync(join(dirHojas, `${n}.csv`), { force: true });
    }
  };

  const archivoDe = (ruta: string) => ({
    getDateCreated: () => statSync(ruta).birthtime,
    setTrashed: (b: boolean) => {
      if (b) rmSync(ruta, { recursive: true, force: true });
    },
  });

  const carpetaRespaldos = {
    getId: () => 'respaldos',
    getUrl: () => dirRespaldos,
    getFiles: () => {
      const lista = dirRespaldos && existsSync(dirRespaldos) ? readdirSync(dirRespaldos).map((n) => archivoDe(join(dirRespaldos, n))) : [];
      let i = 0;
      return { hasNext: () => i < lista.length, next: () => lista[i++] };
    },
    copiar: (nombre: string) => {
      if (!carpeta) return;
      guardar();
      for (const base of [dirRespaldos, o.respaldosExtra].filter((x): x is string => !!x)) {
        const destino = join(base, nombre);
        mkdirSync(destino, { recursive: true });
        for (const f of readdirSync(dirHojas).filter((x) => x.endsWith('.csv'))) copyFileSync(join(dirHojas, f), join(destino, f));
      }
    },
  };

  const carpetaAudios = {
    getId: () => ID_AUDIOS,
    getUrl: () => dirAudios || 'memoria://audios',
    createFile: (blob: { nombre: string; bytes: Buffer }) => {
      archivosDrive.push({ nombre: blob.nombre, bytes: blob.bytes.length });
      if (dirAudios) writeFileSync(join(dirAudios, blob.nombre), blob.bytes);
      return { getId: () => blob.nombre };
    },
    getFoldersByName: () => {
      let dado = false;
      return { hasNext: () => !dado, next: () => ((dado = true), carpetaRespaldos) };
    },
    createFolder: () => carpetaRespaldos,
  };

  const log = (s: string) => {
    logs.push(s);
    o.log?.(s);
  };

  const globales = {
    console,
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k: string) => deEntorno[k] || props.get(k) || null,
        setProperty: (k: string, v: string) => {
          if (v.length > 9000) throw new Error(`Propiedad ${k} pasa de 9 KB`);
          props.set(k, v);
          guardarProps();
        },
        deleteProperty: (k: string) => {
          props.delete(k);
          guardarProps();
        },
      }),
    },
    SpreadsheetApp: {
      openById: (id: string) => {
        const l = libros.get(id);
        if (!l) throw new Error(`No existe el libro ${id}`);
        return l;
      },
      create: () => {
        const l = new Libro(carpeta ? ID_LIBRO : `libro-${libros.size + 1}`, estricto, carpeta);
        l.insertSheet('Hoja 1');
        libros.set(l.id, l);
        return l;
      },
      getActiveSpreadsheet: () => {
        if (!o.contenedor) return null;
        let l = libros.get('contenedor');
        if (!l) {
          l = new Libro('contenedor', estricto, carpeta);
          l.insertSheet('Hoja 1').datos = o.contenedor.map((f) => [...f]);
          libros.set(l.id, l);
        }
        return l;
      },
      flush: () => undefined,
    },
    LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock: () => undefined, releaseLock: () => undefined }) },
    CacheService: {
      getScriptCache: () => ({
        get: (k: string) => {
          const v = vence.get(k);
          if (v !== undefined && v < Date.now()) {
            cache.delete(k);
            vence.delete(k);
          }
          return cache.get(k) ?? null;
        },
        put: (k: string, v: string, segundos = 600) => {
          cache.set(k, v);
          vence.set(k, Date.now() + segundos * 1000);
        },
        remove: (k: string) => {
          cache.delete(k);
          vence.delete(k);
        },
      }),
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256', MD5: 'md5' },
      Charset: { UTF_8: 'utf8' },
      computeDigest: (alg: string, texto: string) =>
        [...createHash(alg).update(texto, 'utf8').digest()].map((b) => (b > 127 ? b - 256 : b)),
      getUuid: () => randomUUID(),
      formatDate: formatearFecha,
      base64Decode: (s: string) => Buffer.from(s, 'base64'),
      newBlob: (bytes: Buffer, _mime: string, nombre: string) => ({ bytes, nombre }),
      sleep: (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms),
    },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (s: string) => {
        const t = { setMimeType: () => t, getContent: () => s };
        return t;
      },
    },
    UrlFetchApp: {
      fetch: (url: string, op: { method?: string; payload: string; headers?: Record<string, string>; contentType?: string }) => {
        const p = { url, cuerpo: JSON.parse(op.payload) as Record<string, unknown> };
        llamadasGemini.push(p);
        let codigo: number;
        let texto: string;
        if (o.gemini) {
          const r = o.gemini(p);
          codigo = r.codigo;
          texto = JSON.stringify(r.cuerpo);
        } else {
          const headers = { ...(op.headers ?? {}), 'Content-Type': op.contentType ?? 'application/json' };
          ({ codigo, texto } = fetchSincrono(url, op.method ?? 'get', headers, op.payload));
        }
        return { getResponseCode: () => codigo, getContentText: () => texto };
      },
    },
    DriveApp: {
      createFolder: () => carpetaAudios,
      getFolderById: (id: string) => (id === 'respaldos' ? carpetaRespaldos : carpetaAudios),
      getFileById: () => ({
        moveTo: () => undefined,
        makeCopy: (nombre: string) => carpetaRespaldos.copiar(nombre),
      }),
    },
    ScriptApp: {
      getProjectTriggers: () => [],
      deleteTrigger: () => undefined,
      newTrigger: () => {
        const t = { timeBased: () => t, everyDays: () => t, atHour: () => t, create: () => t };
        return t;
      },
    },
    Logger: { log },
  };

  return { globales, props, cache, libros, logs, archivosDrive, llamadasGemini, guardar, guardarProps, dirRespaldos };
}
