// Lee Esquema, Opciones y Knowledge. La versión es un hash del contenido:
// si cambias la hoja, la app lo nota sola.

import { filasAEsquema, filasAKnowledge, filasAOpciones, indexarListas } from '../../shared/catalogo';
import type { Campo, CatalogosPayload, CatalogosRespuesta, KnowledgeFila, Opcion } from '../../shared/types';
import { HOJAS, leerTabla } from './Repo';
import { PROP_SEMILLAS, reimportarSemillas } from './Setup';
import { md5Hex, prop } from './Util';

/** Cambia cada vez que se carga Knowledge, para que la app refresque el índice. */
export const KB_VERSION = 'KB_VERSION';

interface Cargado {
  esquema: Campo[];
  opciones: Opcion[];
  listas: Map<string, Opcion[]>;
  version: string;
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

export function catalogos(): Cargado {
  if (memo) return memo;
  asegurarSemillas();
  const filasEsquema = leerTabla(HOJAS.ESQUEMA);
  const filasOpciones = leerTabla(HOJAS.OPCIONES);
  const esquema = filasAEsquema(filasEsquema);
  const opciones = filasAOpciones(filasOpciones);
  const version = md5Hex(JSON.stringify([filasEsquema, filasOpciones, prop(KB_VERSION)])).slice(0, 12);
  memo = { esquema, opciones, listas: indexarListas(opciones), version };
  return memo;
}

export function knowledge(): KnowledgeFila[] {
  if (!memoKb) memoKb = filasAKnowledge(leerTabla(HOJAS.KNOWLEDGE));
  return memoKb;
}

export function olvidarCatalogos(): void {
  memo = null;
  memoKb = null;
}

export function obtenerCatalogos(p: CatalogosPayload): CatalogosRespuesta {
  const c = catalogos();
  if (p.desde && p.desde === c.version) return { sinCambios: true, version: c.version };
  return {
    version: c.version,
    esquema: c.esquema,
    opciones: c.opciones,
    knowledge: knowledge().map(({ id, seccion, titulo, origen_archivo }) => ({ id, seccion, titulo, origen_archivo })),
  };
}
