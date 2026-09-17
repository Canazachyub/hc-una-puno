// Un solo doPost, router por acción.
// El token de sesión va en el cuerpo (text/plain) para evitar el preflight de CORS, que Apps Script no responde.

import { ACCIONES_PUBLICAS } from '../../shared/types';
import type { Accion, ApiMapa, OpLote, Peticion, Respuesta, ResultadoLote } from '../../shared/types';
import { cambiarClave, login, salir, sesionValida } from './Auth';
import { obtenerCatalogos, catalogos } from './Catalogos';
import { organizar, transcribir } from './Entrada';
import { geminiConfigurado, modelo } from './Gemini';
import { crear, guardar, listar, obtener } from './HC';
import { conLock, leerRegistro, registrar } from './Repo';
import { revisar } from './Revisar';
import { listarDecisiones, decidir } from './Decisiones';
import { leerLaboratorioFoto, redactar } from './Redaccion';
import { asegurarTareas, cargarKnowledge } from './Setup';
import { ErrorApi, ahora, json, mensajeError, recortarCelda } from './Util';

type Manejador<A extends Accion> = (payload: ApiMapa[A][0]) => ApiMapa[A][1];
type Manejadores = { [A in Accion]: Manejador<A> };

/** Token de la petición en curso (Apps Script atiende una petición por ejecución). */
let tokenActual = '';

const MANEJADORES: Manejadores = {
  'auth.login': login,
  'auth.cambiar': (p) => cambiarClave(p, tokenActual),
  'auth.salir': () => salir(tokenActual),
  ping: () => ({
    esquema_version: catalogos().version,
    modelo: modelo(),
    gemini: geminiConfigurado(),
    hora: ahora(),
  }),
  'catalogos.get': obtenerCatalogos,
  'hc.list': listar,
  'hc.get': obtener,
  'hc.crear': crear,
  'hc.guardar': guardar,
  'entrada.transcribir': transcribir,
  'entrada.organizar': organizar,
  'hc.revisar': revisar,
  'sync.lote': (p) => ({ resultados: (p.ops ?? []).map(ejecutarOp) }),
  'kb.cargar': cargarKnowledge,
  'entrada.laboratorio': leerLaboratorioFoto,
  'entrada.redactar': redactar,
  'revision.decidir': decidir,
  'revision.listar': listarDecisiones,
};

/** Acciones que escriben: se protegen con opId (el resultado queda en caché y en Registro). */
const IDEMPOTENTES = new Set<Accion>(['hc.crear', 'hc.guardar', 'entrada.transcribir', 'entrada.organizar', 'entrada.laboratorio', 'revision.decidir']);
/** Solo leen pero tardan (Gemini): si la respuesta se pierde, el reintento recoge lo ya calculado (solo en caché). */
const RECUPERABLES = new Set<Accion>(['entrada.redactar', 'hc.revisar']);

const CACHE_TTL = 6 * 3600;
/**
 * Google deja de esperar a los 30 segundos y la respuesta se pierde, aunque la ejecución siga.
 * Un reintento con el mismo opId espera hasta 20 segundos a que termine la primera, en vez de repetirla.
 */
const ESPERA_SEGUNDOS = 20;
const enCurso = (opId: string) => `op:${opId}:en_curso`;

function resultadoGuardado(opId: string, conHoja: boolean): Respuesta<unknown> | null {
  const cache = CacheService.getScriptCache();
  const enCache = cache.get(`op:${opId}`);
  if (enCache) return JSON.parse(enCache) as Respuesta<unknown>;
  if (!conHoja) return null;
  const fila = leerRegistro(opId);
  if (fila && fila.tipo === 'opid' && fila.contenido) {
    try {
      return JSON.parse(fila.contenido) as Respuesta<unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

function guardarResultado(opId: string, r: Respuesta<unknown>, enHoja: boolean): void {
  const texto = JSON.stringify(r);
  if (texto.length < 90000) CacheService.getScriptCache().put(`op:${opId}`, texto, CACHE_TTL);
  if (enHoja && texto.length < 49000) {
    conLock(() => registrar([{ id: opId, tipo: 'opid', contenido: recortarCelda(texto) }]));
  }
}

/** Resultado de una ejecución anterior con el mismo opId; si todavía corre, lo espera un rato. */
function esperarResultado(opId: string, conHoja: boolean): Respuesta<unknown> | null {
  const previo = resultadoGuardado(opId, conHoja);
  if (previo) return previo;
  const cache = CacheService.getScriptCache();
  for (let i = 0; i < ESPERA_SEGUNDOS; i++) {
    if (!cache.get(enCurso(opId))) return resultadoGuardado(opId, false);
    Utilities.sleep(1000);
    const listo = resultadoGuardado(opId, false);
    if (listo) return listo;
  }
  return { ok: false, error: 'Todavía se está procesando. Reintentando…', codigo: 'pendiente' };
}

function ejecutar<A extends Accion>(action: A, payload: ApiMapa[A][0], opId?: string): Respuesta<ApiMapa[A][1]> {
  const manejador = MANEJADORES[action] as Manejador<A> | undefined;
  if (!manejador) return { ok: false, error: `Acción desconocida: ${String(action)}`, codigo: 'accion' };

  const escribe = IDEMPOTENTES.has(action);
  const idem = !!opId && (escribe || RECUPERABLES.has(action));
  const cache = CacheService.getScriptCache();
  if (idem) {
    const previo = esperarResultado(opId, escribe);
    if (previo) return previo as Respuesta<ApiMapa[A][1]>;
    cache.put(enCurso(opId), '1', 600);
  }
  let r: Respuesta<ApiMapa[A][1]>;
  try {
    r = { ok: true, data: manejador(payload ?? ({} as ApiMapa[A][0])) };
  } catch (e) {
    console.error(`${action}: ${mensajeError(e)}`);
    r = { ok: false, error: mensajeError(e), codigo: e instanceof ErrorApi ? e.codigo : 'interno' };
  }
  if (idem) {
    if (r.ok) guardarResultado(opId, r, escribe);
    cache.remove(enCurso(opId));
  }
  return r;
}

function ejecutarOp(op: OpLote): ResultadoLote {
  if (op.action !== 'hc.guardar') return { opId: op.opId, ok: false, error: 'Solo hc.guardar va en lote', codigo: 'accion' };
  const r = ejecutar('hc.guardar', op.payload, op.opId);
  return r.ok ? { opId: op.opId, ok: true, data: r.data } : { opId: op.opId, ok: false, error: r.error, codigo: r.codigo };
}

export function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  let peticion: Peticion;
  try {
    peticion = JSON.parse(e.postData.contents) as Peticion;
  } catch {
    return json({ ok: false, error: 'Petición mal formada', codigo: 'payload' });
  }
  const publica = ACCIONES_PUBLICAS.includes(peticion.action);
  if (!publica && !sesionValida(peticion.token)) {
    return json({ ok: false, error: 'La sesión venció. Vuelve a ingresar.', codigo: 'auth' });
  }
  tokenActual = publica ? '' : String(peticion.token);
  if (!publica) asegurarTareas();
  return json(ejecutar(peticion.action, peticion.payload, publica ? undefined : peticion.opId));
}

