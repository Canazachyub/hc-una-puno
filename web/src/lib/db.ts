// Base local (IndexedDB con Dexie): borradores, cola de sincronización y entradas pendientes.
// Con PIN, todo lo que no es índice se guarda cifrado (capa `cifrado` de Dexie, más abajo).

import Dexie from 'dexie';
import type { DBCore, DBCoreTable, Table } from 'dexie';
import { aBase64, cifradoActivo, cifrar, deBase64, descifrar } from './cifrado';
import type {
  Catalogos,
  Decision,
  Duda,
  EscalaSugerida,
  EstadoHC,
  GuardarPayload,
  OrigenEntrada,
  ResumenHC,
} from '../../../shared/types';

export interface ConflictoLocal {
  campo: string;
  local: string;
  otro: string;
  /** sync: otro dispositivo cambió el campo. entrada: lo dictado contradice lo registrado. */
  origen: 'sync' | 'entrada';
}

export interface HistoriaLocal {
  clave: string;
  dni: string;
  episodio: number;
  valores: Record<string, string>;
  /** Último valor conocido del servidor por campo. */
  base: Record<string, string>;
  /** Campos editados sin sincronizar. */
  sucio: string[];
  version: number;
  estado: EstadoHC;
  estadoSucio: boolean;
  completitud: number;
  creado_en: string;
  actualizado_en: string;
  sincronizado_en: string;
  confianza: Record<string, number>;
  sugerencias: EscalaSugerida[];
  conflictos: ConflictoLocal[];
  dudas: Duda[];
  dudasResueltasPendientes: string[];
  deshacer: { valores: Record<string, string>; fecha: string; resumen: string } | null;
}

export interface OpPendiente {
  opId: string;
  clave: string;
  action: 'hc.guardar';
  payload: GuardarPayload;
  creado: string;
  intentos: number;
  error: string;
}

export interface EntradaPendiente {
  id: string;
  clave: string;
  seccion: string;
  campoObjetivo: string;
  origen: OrigenEntrada;
  texto: string;
  audio: Blob | null;
  /** El audio en bytes: así se puede cifrar (el Blob se rearma al leer). */
  audioBytes?: Uint8Array;
  mime: string;
  duracion: number;
  /** pendiente → (audio) transcrita → el usuario la usa y se borra. */
  estado: 'pendiente' | 'transcrita' | 'error';
  error: string;
  creado: string;
}

export interface CatalogoGuardado {
  id: 'actual';
  catalogos: Catalogos;
  fecha: string;
}

export interface ResumenRemoto extends ResumenHC {
  clave: string;
}

/** Decisión sobre una diferencia con las notas, guardada aquí y subida cuando hay señal. */
export interface DecisionLocal extends Decision {
  sucio: boolean;
}

class BaseHC extends Dexie {
  historias!: Table<HistoriaLocal, string>;
  ops!: Table<OpPendiente, string>;
  entradas!: Table<EntradaPendiente, string>;
  catalogos!: Table<CatalogoGuardado, string>;
  remotas!: Table<ResumenRemoto, string>;
  decisiones!: Table<DecisionLocal, string>;

  constructor() {
    super('hc-app');
    this.version(1).stores({
      historias: 'clave, dni, actualizado_en',
      ops: 'opId, clave, creado',
      entradas: 'id, clave, estado, creado',
      catalogos: 'id',
      remotas: 'clave, dni, actualizado_en',
    });
    this.version(2).stores({ decisiones: 'punto' });
    this.use({ stack: 'dbcore', name: 'cifrado', level: -20, create: capaCifrado });
  }
}

// ---------- Cifrado transparente ----------

/** Tablas con datos de pacientes y sus campos índice (los índices quedan legibles para poder buscar). */
const INDICES: Record<string, string[]> = {
  historias: ['clave', 'dni', 'actualizado_en'],
  ops: ['opId', 'clave', 'creado'],
  entradas: ['id', 'clave', 'estado', 'creado'],
  remotas: ['clave', 'dni', 'actualizado_en'],
};
const OMITIDOS = new Set(['_c', '_a', 'audio', 'audioBytes']);
const texto = new TextEncoder();
const lector = new TextDecoder();

type Registro = Record<string, unknown>;

function sellar(tabla: string, v: unknown): unknown {
  if (!v || typeof v !== 'object') return v;
  const r = v as Registro;
  const bytes = r.audioBytes instanceof Uint8Array ? r.audioBytes : undefined;
  if (!cifradoActivo()) {
    const plano: Registro = { ...r };
    delete plano._c;
    delete plano._a;
    // Con los bytes guardados, el Blob se rearma al leer.
    if (bytes) delete plano.audio;
    return plano;
  }
  const libre: Registro = {};
  const resto: Registro = {};
  for (const [k, x] of Object.entries(r)) {
    if (INDICES[tabla].includes(k)) libre[k] = x;
    else if (!OMITIDOS.has(k)) resto[k] = x;
  }
  if (r.audio instanceof Blob && !bytes) throw new Error('Audio sin bytes: no se puede guardar cifrado');
  libre._c = aBase64(cifrar(texto.encode(JSON.stringify(resto))));
  if (bytes) libre._a = cifrar(bytes);
  return libre;
}

function abrir(tabla: string, v: unknown): unknown {
  if (!v || typeof v !== 'object') return v;
  let r = v as Registro;
  if (typeof r._c === 'string') {
    const resto = JSON.parse(lector.decode(descifrar(deBase64(r._c)))) as Registro;
    const libre: Registro = {};
    for (const k of INDICES[tabla]) if (k in r) libre[k] = r[k];
    r = { ...resto, ...libre };
    if ((v as Registro)._a instanceof Uint8Array) r.audioBytes = descifrar((v as Registro)._a as Uint8Array);
  }
  if (tabla === 'entradas' && r.audioBytes instanceof Uint8Array) {
    r = { ...r, audio: new Blob([r.audioBytes as Uint8Array<ArrayBuffer>], { type: (r.mime as string) || 'application/octet-stream' }) };
  }
  return r;
}

function capaCifrado(abajo: DBCore): DBCore {
  return {
    ...abajo,
    table(nombre: string): DBCoreTable {
      const t = abajo.table(nombre);
      if (!(nombre in INDICES)) return t;
      return {
        ...t,
        mutate: (req) =>
          req.type === 'add' || req.type === 'put' ? t.mutate({ ...req, values: req.values.map((v) => sellar(nombre, v)) }) : t.mutate(req),
        get: (req) => t.get(req).then((v) => abrir(nombre, v)),
        getMany: (req) => t.getMany(req).then((vs) => vs.map((v) => abrir(nombre, v))),
        query: (req) => t.query(req).then((r) => (req.values ? { ...r, result: r.result.map((v) => abrir(nombre, v)) } : r)),
        openCursor: (req) =>
          t.openCursor(req).then((c) => {
            if (!c) return c;
            let crudo: unknown;
            let abierto: unknown;
            return Object.create(c, {
              value: {
                get: () => {
                  if (c.value !== crudo) {
                    crudo = c.value;
                    abierto = abrir(nombre, crudo);
                  }
                  return abierto;
                },
              },
            });
          }),
      };
    },
  };
}

export const db = new BaseHC();

/** Vuelve a escribir todo (cifrado o en claro según el estado actual). */
export async function reescribirTodo(): Promise<void> {
  // Los audios viejos (solo Blob) pasan a bytes antes de la transacción: leer un Blob no es parte de IndexedDB.
  const entradas = await db.entradas.toArray();
  for (const e of entradas) if (e.audio && !e.audioBytes) e.audioBytes = new Uint8Array(await e.audio.arrayBuffer());
  const [historias, ops, remotas] = await Promise.all([db.historias.toArray(), db.ops.toArray(), db.remotas.toArray()]);
  await db.transaction('rw', db.historias, db.ops, db.entradas, db.remotas, async () => {
    await db.historias.bulkPut(historias);
    await db.ops.bulkPut(ops);
    await db.entradas.bulkPut(entradas);
    await db.remotas.bulkPut(remotas);
  });
}

export function claveDe(dni: string, episodio: number): string {
  return `${dni}~${episodio}`;
}

export function partirClave(clave: string): { dni: string; episodio: number } {
  const [dni, ep] = clave.split('~');
  return { dni, episodio: Number(ep) || 1 };
}

export function historiaVacia(dni: string, episodio: number): HistoriaLocal {
  const t = new Date().toISOString();
  return {
    clave: claveDe(dni, episodio),
    dni,
    episodio,
    valores: { 'fil.dni': dni },
    base: {},
    sucio: [],
    version: 0,
    estado: 'borrador',
    estadoSucio: false,
    completitud: 0,
    creado_en: t,
    actualizado_en: t,
    sincronizado_en: '',
    confianza: {},
    sugerencias: [],
    conflictos: [],
    dudas: [],
    dudasResueltasPendientes: [],
    deshacer: null,
  };
}
