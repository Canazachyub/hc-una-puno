// Acciones sobre las historias: listar, obtener, crear y guardar.

import { PLANTILLA_POR_DEFECTO, plantillaValida } from '../../shared/plantillas';
import { CAMPOS_CLAVE } from '../../shared/secciones';
import { CAMPOS_SISTEMA, esCampoSistema, validarSistema } from '../../shared/seguimiento';
import { COLUMNAS_CONTROL } from '../../shared/types';
import type {
  ClavePayload,
  ConflictoGuardado,
  CrearPayload,
  CrearRespuesta,
  GuardarPayload,
  GuardarRespuesta,
  ListarPayload,
  ListarRespuesta,
  ObtenerRespuesta,
} from '../../shared/types';
import { validarValor } from '../../shared/valores';
import { catalogos } from './Catalogos';
import {
  asegurarColumnas,
  buscarFila,
  buscarFilasDni,
  cambiarEstadoRegistro,
  conLock,
  dudasDe,
  escribirFilaHC,
  leerFilaHC,
  listarResumenes,
  mapaAFila,
  registrar,
  siguienteFilaHC,
} from './Repo';
import { ErrorApi, ahora, requerir, requerirEpisodio } from './Util';

const RE_DNI = /^[A-Za-z0-9-]{6,15}$/;

function dniValido(v: unknown): string {
  const dni = requerir(v, 'dni');
  if (!RE_DNI.test(dni)) throw new ErrorApi('DNI inválido', 'payload');
  return dni;
}

/** La plantilla con la que se llena una historia: la que manda la app o, si no, la de su fila. */
export function plantillaDeHistoria(pedida: string | undefined, dni: string, episodio: number): string {
  const p = String(pedida ?? '').trim();
  if (p && plantillaValida(p) === p) return p;
  try {
    const cab = asegurarColumnas([]);
    const n = buscarFila(dniValido(dni), Number(episodio) || 0, cab);
    if (n !== null) return plantillaValida(leerFilaHC(n, cab).plantilla ?? '');
  } catch {
    // historia todavía sin fila: se usa la de siempre
  }
  return PLANTILLA_POR_DEFECTO;
}

export function listar(p: ListarPayload): ListarRespuesta {
  const limite = Math.min(Math.max(Number(p.limite) || 100, 1), 500);
  const cursor = Math.max(Number(p.cursor) || 0, 0);
  const todas = listarResumenes();
  const filas = todas.slice(cursor, cursor + limite);
  return { filas, cursor: cursor + limite < todas.length ? cursor + limite : null };
}

export function obtener(p: ClavePayload): ObtenerRespuesta {
  const dni = dniValido(p.dni);
  const ep = requerirEpisodio(p.episodio);
  const cab = asegurarColumnas([]);
  const n = buscarFila(dni, ep, cab);
  if (n === null) throw new ErrorApi(`No existe la historia ${dni} episodio ${ep}`, 'no_existe');
  return { fila: mapaAFila(leerFilaHC(n, cab)), dudas: dudasDe(dni, ep) };
}

export function crear(p: CrearPayload): CrearRespuesta {
  const dni = dniValido(p.dni);
  const { esquema, listas, version } = catalogos();
  const iniciales: Record<string, string> = {};
  for (const [id, valor] of Object.entries(p.valores ?? {})) {
    const campo = esquema.find((c) => c.campo_id === id);
    if (!campo || CAMPOS_CLAVE.includes(id)) continue;
    const r = validarValor(campo, String(valor), listas);
    if (r.ok && r.valor) iniciales[id] = r.valor;
  }

  return conLock(() => {
    const cab = asegurarColumnas([...esquema.map((c) => c.campo_id), ...CAMPOS_SISTEMA]);
    const filas = buscarFilasDni(dni, cab);
    const episodios = filas.map((n) => Number(leerFilaHC(n, cab).episodio) || 0);
    const episodio = episodios.length ? Math.max(...episodios) + 1 : 1;
    const t = ahora();
    const mapa: Record<string, string> = {
      ...iniciales,
      dni,
      episodio: String(episodio),
      plantilla: plantillaValida(String(p.plantilla ?? '')),
      estado: 'borrador',
      completitud: '0',
      version: '1',
      esquema_version: version,
      creado_en: t,
      actualizado_en: t,
      'fil.dni': dni,
    };
    escribirFilaHC(siguienteFilaHC(), cab, mapa);
    registrar([{ tipo: 'auditoria', dni, episodio, contenido: 'crear' }]);
    return { fila: mapaAFila(mapa) };
  });
}

/**
 * Guarda campo por campo. Cada campo trae el valor del servidor sobre el que se editó (`base`):
 * si el servidor ya tiene otro valor, no se pisa y se devuelve como conflicto.
 * Si la fila no existe (historia creada sin señal), se crea.
 */
export function guardar(p: GuardarPayload): GuardarRespuesta {
  const dni = dniValido(p.dni);
  const ep = requerirEpisodio(p.episodio);
  if (ep < 1) throw new ErrorApi('Episodio inválido', 'payload');
  if (!Array.isArray(p.campos)) throw new ErrorApi('Faltan campos', 'payload');
  const { esquema, version } = catalogos();
  const conocidos = new Set(esquema.map((c) => c.campo_id));
  const campos = p.campos.filter((c) => !CAMPOS_CLAVE.includes(c.id));
  for (const c of campos) {
    if (esCampoSistema(c.id)) {
      // Evoluciones y laboratorio: JSON validado.
      try {
        validarSistema(c.id, String(c.valor ?? ''));
      } catch (e) {
        throw new ErrorApi(e instanceof Error ? e.message : String(e), 'payload');
      }
      continue;
    }
    if (!conocidos.has(c.id) || (COLUMNAS_CONTROL as readonly string[]).includes(c.id)) {
      throw new ErrorApi(`Campo desconocido: ${c.id}`, 'payload');
    }
  }

  return conLock(() => {
    const cab = asegurarColumnas([...esquema.map((c) => c.campo_id), ...CAMPOS_SISTEMA]);
    let n = buscarFila(dni, ep, cab);
    const t = ahora();
    const nueva = n === null;
    let mapa: Record<string, string>;
    if (n === null) {
      n = siguienteFilaHC();
      mapa = {
        dni,
        episodio: String(ep),
        plantilla: plantillaValida(String(p.plantilla ?? '')),
        estado: 'borrador',
        completitud: '0',
        version: '0',
        esquema_version: version,
        creado_en: t,
        actualizado_en: t,
        'fil.dni': dni,
      };
    } else {
      mapa = leerFilaHC(n, cab);
    }

    const conflictos: ConflictoGuardado[] = [];
    const cambiados: string[] = [];
    for (const c of campos) {
      const actual = mapa[c.id] ?? '';
      const valor = String(c.valor ?? '');
      if (actual === valor) continue;
      if (actual !== String(c.base ?? '')) {
        conflictos.push({ id: c.id, servidor: actual, enviado: valor });
        continue;
      }
      mapa[c.id] = valor;
      cambiados.push(c.id);
    }

    let cambioControl = nueva;
    if (p.estado && p.estado !== mapa.estado) {
      mapa.estado = p.estado;
      cambioControl = true;
    }
    const completitud = typeof p.completitud === 'number' ? String(Math.round(p.completitud)) : null;
    if (completitud !== null && completitud !== mapa.completitud) {
      mapa.completitud = completitud;
      cambioControl = true;
    }

    if (cambiados.length > 0 || cambioControl) {
      mapa.version = String((Number(mapa.version) || 0) + 1);
      mapa.actualizado_en = t;
      mapa.esquema_version = version;
      escribirFilaHC(n, cab, mapa);
      if (cambiados.length > 0) {
        registrar([{ tipo: 'auditoria', dni, episodio: ep, contenido: cambiados.join(',') }]);
      }
    }
    if (p.dudas_resueltas && p.dudas_resueltas.length > 0) {
      cambiarEstadoRegistro(p.dudas_resueltas, 'resuelta');
    }
    return { fila: mapaAFila(mapa), conflictos };
  });
}
