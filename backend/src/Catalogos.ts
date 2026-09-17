// Lee Esquema, Opciones y Knowledge. La versión es un hash del contenido:
// si cambias la hoja, la app lo nota sola (en media hora como máximo, cuando la tarea `calentar` la vuelve a leer).
// Cada petición es una ejecución nueva de Apps Script: lo leído se guarda en la caché del script
// para no volver a leer la hoja en cada una (con la hoja, una petición pasaba de 30 segundos y Google perdía la respuesta).

import { filasAEsquema, filasAKnowledge, filasAOpciones, indexarListas } from '../../shared/catalogo';
import type { Campo, CatalogosPayload, CatalogosRespuesta, KnowledgeFila, KnowledgeIndice, Opcion } from '../../shared/types';
import { borrarGrande, guardarGrande, leerGrande } from './Cache';
import { HOJAS, leerTabla } from './Repo';
import { PROP_SEMILLAS, reimportarSemillas } from './Setup';
import { md5Hex, prop } from './Util';

/** Cambia cada vez que se carga Knowledge, para que la app refresque el índice. */
export const KB_VERSION = 'KB_VERSION';

/** Seis horas: el máximo de CacheService. La tarea `calentar` la renueva cada media hora. */
const DURACION = 6 * 3600;
const CLAVE_CATALOGO = 'catalogo';
const CLAVE_KB = 'knowledge';
const CLAVE_KB_INDICE = 'knowledge_indice';

interface Guardado {
  esquema: Campo[];
  opciones: Opcion[];
  version: string;
}

interface Cargado extends Guardado {
  listas: Map<string, Opcion[]>;
}

let memo: Cargado | null = null;
let memoKb: KnowledgeFila[] | null = null;

declare const SEMILLA_VERSION: string;

/** Si se desplegó una versión con otras semillas, Esquema y Opciones se reimportan una vez. */
function asegurarSemillas(): void {
  if (!SEMILLA_VERSION || prop('SPREADSHEET_ID') === '') return;
  if (prop(PROP_SEMILLAS) === SEMILLA_VERSION) return;
  reimportarSemillas();
}

function desdeHoja(): Guardado {
  const filasEsquema = leerTabla(HOJAS.ESQUEMA);
  const filasOpciones = leerTabla(HOJAS.OPCIONES);
  return {
    esquema: filasAEsquema(filasEsquema),
    opciones: filasAOpciones(filasOpciones),
    version: md5Hex(JSON.stringify([filasEsquema, filasOpciones, prop(KB_VERSION)])).slice(0, 12),
  };
}

export function catalogos(): Cargado {
  if (memo) return memo;
  asegurarSemillas();
  let g: Guardado | null = null;
  const enCache = leerGrande(CLAVE_CATALOGO);
  if (enCache) {
    try {
      g = JSON.parse(enCache) as Guardado;
    } catch {
      g = null;
    }
  }
  if (!g) {
    g = desdeHoja();
    guardarGrande(CLAVE_CATALOGO, JSON.stringify(g), DURACION);
  }
  memo = { ...g, listas: indexarListas(g.opciones) };
  return memo;
}

export function knowledge(): KnowledgeFila[] {
  if (memoKb) return memoKb;
  const enCache = leerGrande(`${CLAVE_KB}:${prop(KB_VERSION)}`);
  if (enCache) {
    try {
      memoKb = JSON.parse(enCache) as KnowledgeFila[];
      return memoKb;
    } catch {
      // se relee de la hoja
    }
  }
  memoKb = filasAKnowledge(leerTabla(HOJAS.KNOWLEDGE));
  guardarGrande(`${CLAVE_KB}:${prop(KB_VERSION)}`, JSON.stringify(memoKb), DURACION);
  return memoKb;
}

/** Solo títulos (lo que pide la app): no hace falta traer las notas completas. */
function indiceKnowledge(): KnowledgeIndice[] {
  const clave = `${CLAVE_KB_INDICE}:${prop(KB_VERSION)}`;
  const enCache = leerGrande(clave);
  if (enCache) {
    try {
      return JSON.parse(enCache) as KnowledgeIndice[];
    } catch {
      // se arma de nuevo
    }
  }
  const indice = knowledge().map(({ id, seccion, titulo, origen_archivo }) => ({ id, seccion, titulo, origen_archivo }));
  guardarGrande(clave, JSON.stringify(indice), DURACION);
  return indice;
}

/** Tras escribir Esquema, Opciones o Knowledge. */
export function olvidarCatalogos(): void {
  memo = null;
  memoKb = null;
  borrarGrande(CLAVE_CATALOGO);
}

/** Tarea cada media hora: relee la hoja (así se notan los cambios hechos a mano) y renueva la caché. */
export function calentar(): void {
  memo = null;
  memoKb = null;
  asegurarSemillas();
  const g = desdeHoja();
  guardarGrande(CLAVE_CATALOGO, JSON.stringify(g), DURACION);
  memo = { ...g, listas: indexarListas(g.opciones) };
  borrarGrande(`${CLAVE_KB}:${prop(KB_VERSION)}`);
  borrarGrande(`${CLAVE_KB_INDICE}:${prop(KB_VERSION)}`);
  indiceKnowledge();
}

export function obtenerCatalogos(p: CatalogosPayload): CatalogosRespuesta {
  const c = catalogos();
  if (p.desde && p.desde === c.version) return { sinCambios: true, version: c.version };
  return { version: c.version, esquema: c.esquema, opciones: c.opciones, knowledge: indiceKnowledge() };
}
