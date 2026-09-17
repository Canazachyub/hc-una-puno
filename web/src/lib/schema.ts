// Catálogos: Esquema, Opciones e índice de Knowledge.
// Arranca con las semillas empaquetadas (funciona sin backend) y se actualiza desde la hoja.

import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import esquemaCsv from '../../../seed/esquema.csv?raw';
import opcionesCsv from '../../../seed/opciones.csv?raw';
import { filasAEsquema, filasAOpciones } from '../../../shared/catalogo';
import { parsearCsv } from '../../../shared/csv';
import type { Campo, Catalogos, KnowledgeIndice } from '../../../shared/types';
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

let vistaCache: { fuente: Catalogos; vista: CatalogoVista } | null = null;

export function vistaDe(c: Catalogos): CatalogoVista {
  if (vistaCache && (vistaCache.fuente === c || vistaCache.vista.version === c.version)) return vistaCache.vista;
  const vista = armarVista(c);
  vistaCache = { fuente: c, vista };
  return vista;
}

export async function catalogoActual(): Promise<CatalogoVista> {
  const g = await db.catalogos.get('actual');
  return vistaDe(g?.catalogos ?? catalogosSemilla());
}

export function useCatalogo(): CatalogoVista {
  const guardado = useLiveQuery(() => db.catalogos.get('actual'), []);
  const c = guardado?.catalogos ?? catalogosSemilla();
  return useMemo(() => vistaDe(c), [c]);
}

/** Pide los catálogos a la hoja. Devuelve true si cambiaron. */
export async function actualizarCatalogos(): Promise<boolean> {
  const g = await db.catalogos.get('actual');
  const r = await llamar('catalogos.get', { desde: g?.catalogos.version });
  if ('sinCambios' in r) return false;
  if (r.esquema.length === 0) return false;
  await db.catalogos.put({ id: 'actual', catalogos: r, fecha: new Date().toISOString() });
  return true;
}

/** Títulos de las notas de Semiología relacionadas con un campo. */
export function notasDeCampo(cat: CatalogoVista, campo: Campo): KnowledgeIndice[] {
  if (!campo.ayuda_kb) return [];
  return cat.knowledge.filter((k) => k.id.startsWith(`${campo.ayuda_kb}.`));
}
