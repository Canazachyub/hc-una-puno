// Catálogos: Esquema, Opciones e índice de Knowledge.
// Arranca con las semillas empaquetadas (funciona sin backend) y se actualiza desde la hoja.

import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import esquemaCsv from '../../../seed/esquema.csv?raw';
import opcionesCsv from '../../../seed/opciones.csv?raw';
import { filasAEsquema, filasAOpciones } from '../../../shared/catalogo';
import { parsearCsv } from '../../../shared/csv';
import type { Campo, Catalogos, KnowledgeIndice } from '../../../shared/types';
import { PLANTILLA_POR_DEFECTO } from '../../../shared/plantillas';
import { llamar } from './api';
import { db } from './db';
import { armarVista } from './vista';
import type { CatalogoVista } from './vista';

export type { CatalogoVista };

let semilla: Catalogos | null = null;

export function catalogosSemilla(): Catalogos {
  if (!semilla) {
    semilla = {
      version: 'semilla',
      esquema: filasAEsquema(parsearCsv(esquemaCsv)),
      opciones: filasAOpciones(parsearCsv(opcionesCsv)),
      knowledge: [],
    };
  }
  return semilla;
}

const vistaCache = new Map<string, { fuente: Catalogos; vista: CatalogoVista }>();

export function vistaDe(c: Catalogos, plantilla = PLANTILLA_POR_DEFECTO): CatalogoVista {
  const guardada = vistaCache.get(plantilla);
  if (guardada && (guardada.fuente === c || guardada.vista.version === c.version)) return guardada.vista;
  const vista = armarVista(c, plantilla);
  vistaCache.set(plantilla, { fuente: c, vista });
  return vista;
}

export async function catalogoActual(plantilla = PLANTILLA_POR_DEFECTO): Promise<CatalogoVista> {
  const g = await db.catalogos.get('actual');
  return vistaDe(g?.catalogos ?? catalogosSemilla(), plantilla);
}

export function useCatalogo(plantilla = PLANTILLA_POR_DEFECTO): CatalogoVista {
  const guardado = useLiveQuery(() => db.catalogos.get('actual'), []);
  const c = guardado?.catalogos ?? catalogosSemilla();
  return useMemo(() => vistaDe(c, plantilla), [c, plantilla]);
}

/** Pide los catálogos a la hoja. Devuelve true si cambiaron. */
export async function actualizarCatalogos(): Promise<boolean> {
  const g = await db.catalogos.get('actual');
  const r = await llamar('catalogos.get', { desde: g?.catalogos.version });
  if ('sinCambios' in r) {
    if (g) await db.catalogos.update('actual', { fecha: new Date().toISOString() });
    return false;
  }
  if (r.esquema.length === 0) return false;
  await db.catalogos.put({ id: 'actual', catalogos: r, fecha: new Date().toISOString() });
  return true;
}

/** Títulos de las notas de Semiología relacionadas con un campo. */
export function notasDeCampo(cat: CatalogoVista, campo: Campo): KnowledgeIndice[] {
  if (!campo.ayuda_kb) return [];
  return cat.knowledge.filter((k) => k.id.startsWith(`${campo.ayuda_kb}.`));
}
