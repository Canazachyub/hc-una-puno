// Guía de llenado empaquetada con la app: funciona sin señal y no pasa por el servidor.

import guiasCsv from '../../../seed/guias.csv?raw';
import { contextoDe } from '../../../shared/contexto';
import type { ContextoClinico } from '../../../shared/contexto';
import { ambitosDeCampo, cortesDeGuia, parsearGuias, umbrales } from '../../../shared/guias';
import { leerAjustes } from './ajustes';
import type { EntradaGuia, Umbral } from '../../../shared/guias';

export const GUIAS: EntradaGuia[] = parsearGuias(guiasCsv);
const POR_AMBITO = new Map<string, EntradaGuia[]>();
for (const g of GUIAS) {
  const l = POR_AMBITO.get(g.ambito);
  if (l) l.push(g);
  else POR_AMBITO.set(g.ambito, [g]);
}

export const UMBRALES: Umbral[] = umbrales(GUIAS);
export const CORTES = cortesDeGuia(GUIAS);

/** Grupo de edad, sexo y altitud del paciente para interpretar sus cifras. */
export function contextoHistoria(valores: Record<string, string>): ContextoClinico {
  return contextoDe(valores, leerAjustes().altitud, CORTES);
}

export function guiasDe(ambitos: string[]): EntradaGuia[] {
  return ambitos.flatMap((a) => (POR_AMBITO.get(a) ?? []).filter((g) => g.tipo !== 'umbral'));
}

export function guiasDeCampo(campoId: string): EntradaGuia[] {
  return guiasDe(ambitosDeCampo(campoId));
}

export function ambitosConPrefijo(prefijo: string): string[] {
  return [...POR_AMBITO.keys()].filter((a) => a.startsWith(prefijo));
}

export function hayGuia(ambito: string): boolean {
  return (POR_AMBITO.get(ambito)?.length ?? 0) > 0;
}
