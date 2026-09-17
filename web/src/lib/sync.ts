// Cola, reintentos y conflictos. El dispositivo manda; la hoja es el respaldo compartido.

import { useSyncExternalStore } from 'react';
import type { Duda, FilaHC, GuardarRespuesta, ListarRespuesta, OrganizarRespuesta, ResumenHC } from '../../../shared/types';
import { OrganizarRespuestaSchema } from '../../../shared/schemas';
import { valoresClinicos } from '../../../shared/seguimiento';
import { alCambiarAjustes, hayBackend, leerAjustes } from './ajustes';
import { ErrorApi, enLinea, llamar, mensaje, uuid } from './api';
import { claveDe, db } from './db';
import type { HistoriaLocal, OpPendiente } from './db';
import { aplicarOrganizar, historiaDesdeFila } from './historia';
import { actualizarCatalogos, catalogoActual } from './schema';
import { programarSync, registrarSincronizador } from './sync-cola';

// ---------- Estado observable ----------

export interface EstadoSync {
  sincronizando: boolean;
  enLinea: boolean;
  ultimo: string;
  error: string;
}

let estado: EstadoSync = { sincronizando: false, enLinea: navigator.onLine, ultimo: '', error: '' };
const oyentes = new Set<() => void>();

function fijar(parcial: Partial<EstadoSync>): void {
  estado = { ...estado, ...parcial };
  oyentes.forEach((o) => o());
}

export function useEstadoSync(): EstadoSync {
  return useSyncExternalStore(
    (o) => {
      oyentes.add(o);
      return () => oyentes.delete(o);
    },
    () => estado,
  );
}

// ---------- Fusión ----------

/** Trae lo del servidor sin pisar lo editado localmente ni lo que está en conflicto. */
export function fusionarFila(h: HistoriaLocal, fila: FilaHC): HistoriaLocal {
  const valores = { ...h.valores };
  const base = { ...h.base };
  const enConflicto = new Set(h.conflictos.filter((c) => c.origen === 'sync').map((c) => c.campo));
  const ids = new Set([...Object.keys(fila.valores), ...Object.keys(h.base)]);
  for (const id of ids) {
    const srv = fila.valores[id] ?? '';
    if (h.sucio.includes(id) || enConflicto.has(id)) continue;
    if (srv === '') {
      delete valores[id];
      delete base[id];
    } else {
      valores[id] = srv;
      base[id] = srv;
    }
  }
  return {
    ...h,
    valores,
    base,
    version: fila.version,
    estado: h.estadoSucio ? h.estado : fila.estado,
    sincronizado_en: new Date().toISOString(),
  };
}

function fusionarDudas(locales: Duda[], remotas: Duda[], pendientes: string[]): Duda[] {
  const porId = new Map(locales.map((d) => [d.id, d]));
  for (const r of remotas) {
    const l = porId.get(r.id);
    if (l && pendientes.includes(r.id)) continue;
    porId.set(r.id, r);
  }
  return [...porId.values()];
}

// ---------- Guardado ----------

async function prepararOps(): Promise<void> {
  const historias = await db.historias.toArray();
  const conOp = new Set((await db.ops.toArray()).map((o) => o.clave));
  for (const h of historias) {
    if (conOp.has(h.clave)) continue;
    const enConflicto = new Set(h.conflictos.filter((c) => c.origen === 'sync').map((c) => c.campo));
    const campos = h.sucio
      .filter((id) => !enConflicto.has(id))
      .map((id) => ({ id, valor: h.valores[id] ?? '', base: h.base[id] ?? '' }));
    if (campos.length === 0 && !h.estadoSucio && h.dudasResueltasPendientes.length === 0 && h.version > 0) continue;
    const op: OpPendiente = {
      opId: uuid(),
      clave: h.clave,
      action: 'hc.guardar',
      payload: {
        dni: h.dni,
        episodio: h.episodio,
        version: h.version,
        campos,
        estado: h.estado,
        completitud: h.completitud,
        dudas_resueltas: [...h.dudasResueltasPendientes],
      },
      creado: new Date().toISOString(),
      intentos: 0,
      error: '',
    };
    await db.ops.put(op);
  }
}

async function aplicarGuardado(op: OpPendiente, r: GuardarRespuesta): Promise<void> {
  await db.transaction('rw', db.historias, db.ops, async () => {
    const h = await db.historias.get(op.clave);
    await db.ops.delete(op.opId);
    if (!h) return;
    const conflictivos = new Set(r.conflictos.map((c) => c.id));
    for (const c of op.payload.campos) {
      if (conflictivos.has(c.id)) continue;
      if (c.valor === '') delete h.base[c.id];
      else h.base[c.id] = c.valor;
      if ((h.valores[c.id] ?? '') === c.valor) h.sucio = h.sucio.filter((s) => s !== c.id);
    }
    for (const c of r.conflictos) {
      h.base[c.id] = c.servidor;
      h.conflictos = h.conflictos.filter((k) => k.campo !== c.id);
      h.conflictos.push({ campo: c.id, local: h.valores[c.id] ?? '', otro: c.servidor, origen: 'sync' });
    }
    if (h.estado === op.payload.estado) h.estadoSucio = false;
    const enviadas = op.payload.dudas_resueltas ?? [];
    h.dudasResueltasPendientes = h.dudasResueltasPendientes.filter((d) => !enviadas.includes(d));
    await db.historias.put(fusionarFila(h, r.fila));
  });
}

async function enviarOps(): Promise<void> {
  const ops = await db.ops.orderBy('creado').toArray();
  for (let i = 0; i < ops.length; i += 10) {
    const lote = ops.slice(i, i + 10);
    const { resultados } = await llamar('sync.lote', {
      ops: lote.map((o) => ({ action: o.action, opId: o.opId, payload: o.payload })),
    });
    for (const res of resultados) {
      const op = lote.find((o) => o.opId === res.opId);
      if (!op) continue;
      if (res.ok && res.data) {
        await aplicarGuardado(op, res.data);
      } else {
        if (res.codigo === 'auth' || res.codigo === 'config') throw new ErrorApi(res.error ?? 'Error', res.codigo);
        // Tras tres fallos se rehace la operación con los datos del momento (los campos siguen marcados).
        if (op.intentos >= 2) await db.ops.delete(op.opId);
        else await db.ops.update(op.opId, { intentos: op.intentos + 1, error: res.error ?? 'Error' });
        fijar({ error: res.error ?? 'Error al guardar' });
      }
    }
  }
}

// ---------- Decisiones de la revisión con las notas ----------

async function subirDecisiones(): Promise<void> {
  const sucias = await db.decisiones.filter((d) => d.sucio).toArray();
  if (sucias.length === 0) return;
  await llamar('revision.decidir', { decisiones: sucias.map(({ sucio: _s, ...d }) => d) }, { opId: uuid() });
  await db.transaction('rw', db.decisiones, async () => {
    for (const d of sucias) {
      const actual = await db.decisiones.get(d.punto);
      // Si se volvió a cambiar mientras se subía, queda marcada para la próxima vez.
      if (actual && actual.fecha === d.fecha) await db.decisiones.put({ ...actual, sucio: false });
    }
  });
}

/** Trae las decisiones guardadas en el servidor (desde otro dispositivo, por ejemplo). */
export async function traerDecisiones(): Promise<void> {
  const { decisiones } = await llamar('revision.listar', {});
  await db.transaction('rw', db.decisiones, async () => {
    for (const d of decisiones) {
      const local = await db.decisiones.get(d.punto);
      if (!local?.sucio) await db.decisiones.put({ ...d, sucio: false });
    }
  });
}

// ---------- Entradas pendientes (voz y texto sin señal) ----------

export function validarOrganizar(r: unknown): OrganizarRespuesta {
  const v = OrganizarRespuestaSchema.safeParse(r);
  if (!v.success) throw new ErrorApi('La respuesta del organizador no es válida', 'formato');
  return v.data;
}

export async function blobABase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function procesarEntradas(): Promise<void> {
  const pendientes = await db.entradas.where('estado').equals('pendiente').sortBy('creado');
  const cat = await catalogoActual();
  for (const e of pendientes) {
    const h = await db.historias.get(e.clave);
    if (!h) {
      await db.entradas.delete(e.id);
      continue;
    }
    try {
      if (e.audio) {
        const r = await llamar(
          'entrada.transcribir',
          { audioBase64: await blobABase64(e.audio), mime: e.mime, dni: h.dni, episodio: h.episodio, seccion: e.seccion },
          { opId: e.id, timeoutMs: 180_000 },
        );
        await db.entradas.update(e.id, { estado: 'transcrita', texto: r.transcripcion, audio: null, audioBytes: undefined, error: '' });
      } else {
        const r = validarOrganizar(
          await llamar(
            'entrada.organizar',
            {
              texto: e.texto,
              origen: e.origen,
              dni: h.dni,
              episodio: h.episodio,
              seccion: e.seccion,
              campo_objetivo: e.campoObjetivo || undefined,
              contexto: valoresClinicos(h.valores),
            },
            { opId: e.id, timeoutMs: 180_000 },
          ),
        );
        await aplicarOrganizar(e.clave, r, cat);
        await db.entradas.delete(e.id);
      }
    } catch (err) {
      if (err instanceof ErrorApi && (err.codigo === 'red' || err.codigo === 'auth' || err.codigo === 'config')) throw err;
      await db.entradas.update(e.id, { estado: 'error', error: mensaje(err) });
    }
  }
}

// ---------- Ciclo ----------

let enCurso: Promise<void> | null = null;

export function sincronizar(): Promise<void> {
  if (enCurso) return enCurso;
  if (!enLinea()) {
    fijar({ enLinea: navigator.onLine });
    return Promise.resolve();
  }
  enCurso = (async () => {
    fijar({ sincronizando: true, enLinea: true });
    try {
      await prepararOps();
      await enviarOps();
      await subirDecisiones();
      await procesarEntradas();
      fijar({ ultimo: new Date().toISOString(), error: '' });
    } catch (e) {
      fijar({ error: mensaje(e) });
    } finally {
      fijar({ sincronizando: false });
      enCurso = null;
    }
  })();
  return enCurso;
}

registrarSincronizador(sincronizar);

/** Trae una historia del servidor y la fusiona con la copia local. */
export async function descargarHistoria(dni: string, episodio: number): Promise<string> {
  const { fila, dudas } = await llamar('hc.get', { dni, episodio });
  const clave = claveDe(dni, episodio);
  await db.transaction('rw', db.historias, async () => {
    const local = await db.historias.get(clave);
    if (!local) {
      await db.historias.put({ ...historiaDesdeFila(fila), dudas });
      return;
    }
    const f = fusionarFila(local, fila);
    f.dudas = fusionarDudas(local.dudas, dudas, local.dudasResueltasPendientes);
    await db.historias.put(f);
  });
  return clave;
}

export async function refrescarRemotas(): Promise<void> {
  const todas: ResumenHC[] = [];
  let cursor: number | null = 0;
  while (cursor !== null) {
    const r: ListarRespuesta = await llamar('hc.list', { limite: 500, cursor });
    todas.push(...r.filas);
    cursor = r.cursor;
  }
  await db.transaction('rw', db.remotas, async () => {
    await db.remotas.clear();
    await db.remotas.bulkPut(todas.map((f) => ({ ...f, clave: claveDe(f.dni, f.episodio) })));
  });
}

/** Arranque: sincroniza al abrir, al recuperar señal, al volver a la app y cada minuto. */
export function iniciarSync(): void {
  const alRecuperar = () => {
    fijar({ enLinea: navigator.onLine });
    if (navigator.onLine) programarSync(300);
  };
  window.addEventListener('online', alRecuperar);
  window.addEventListener('offline', () => fijar({ enLinea: false }));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') programarSync(300);
  });
  setInterval(() => {
    if (document.visibilityState === 'visible') void sincronizar();
  }, 60_000);
  const traerDeLaNube = () => {
    if (!hayBackend() || !navigator.onLine) return;
    void actualizarCatalogos().catch(() => undefined);
    void refrescarRemotas().catch(() => undefined);
    void traerDecisiones().catch(() => undefined);
  };
  // Al ingresar (o al cambiar de servidor) se trae lo de la nube y se sube lo pendiente.
  let sesion = hayBackend() ? leerAjustes().token : '';
  alCambiarAjustes(() => {
    const actual = hayBackend() ? leerAjustes().token : '';
    if (actual && actual !== sesion) {
      traerDeLaNube();
      programarSync(100);
    }
    sesion = actual;
    fijar({ error: '' });
  });
  traerDeLaNube();
  programarSync(500);
}

export async function contarPendientes(): Promise<{ ops: number; entradas: number; sucias: number }> {
  const [ops, entradas, historias] = await Promise.all([
    db.ops.count(),
    db.entradas.where('estado').anyOf('pendiente', 'error').count(),
    db.historias.toArray(),
  ]);
  return { ops, entradas, sucias: historias.filter((h) => h.sucio.length > 0 || h.estadoSucio).length };
}

export { programarSync };
