// Revisión local de la escritura: abreviaturas y diminutivos coloquiales. Funciona sin señal.

import { detectarAbreviaturas, detectarDiminutivos, expandirAbreviaturas } from '../../../shared/abreviaturas';
import { CAMPOS_CLAVE } from '../../../shared/secciones';
import type { Campo } from '../../../shared/types';
import { editar } from './historia';
import type { CatalogoVista } from './vista';

const LIBRES = new Set(['texto', 'texto_largo', 'narrativa', 'lista', 'opcion_otro']);
// En estos campos las siglas son datos (nombres, direcciones), no redacción.
const EXCLUIDOS = new Set([...CAMPOS_CLAVE, 'fil.apellidos', 'fil.nombres', 'fil.direccion', 'fil.elaborado_por', 'fil.persona_responsable', 'fil.celular_responsable']);

export interface ObservacionEscritura {
  campo: Campo;
  siglas: string[];
  diminutivos: string[];
  actual: string;
  sugerido: string;
}

export function revisarEscritura(valores: Record<string, string>, cat: CatalogoVista): ObservacionEscritura[] {
  const out: ObservacionEscritura[] = [];
  for (const campo of cat.esquema) {
    if (!LIBRES.has(campo.tipo) || EXCLUIDOS.has(campo.campo_id)) continue;
    const actual = valores[campo.campo_id] ?? '';
    if (!actual.trim()) continue;
    const siglas = detectarAbreviaturas(actual);
    const diminutivos = detectarDiminutivos(actual);
    if (siglas.length === 0 && diminutivos.length === 0) continue;
    out.push({ campo, siglas, diminutivos, actual, sugerido: expandirAbreviaturas(actual) });
  }
  return out;
}

/** Escribe completas las abreviaturas de todos los campos observados. Los diminutivos se corrigen a mano. */
export async function expandirEnHistoria(clave: string, obs: ObservacionEscritura[], cat: CatalogoVista): Promise<number> {
  const cambios: Record<string, string> = {};
  for (const o of obs) if (o.siglas.length && o.sugerido !== o.actual) cambios[o.campo.campo_id] = o.sugerido;
  if (Object.keys(cambios).length) await editar(clave, cambios, cat);
  return Object.keys(cambios).length;
}

/** Aviso tras escribir completo: "1 campo escrito completo", y recuerda los diminutivos pendientes. */
export function avisoEscritura(n: number, obs: ObservacionEscritura[]): string {
  const hecho = n === 0 ? 'No había siglas por escribir' : n === 1 ? '1 campo escrito completo' : `${n} campos escritos completos`;
  return obs.some((o) => o.diminutivos.length) ? `${hecho}. Los diminutivos se corrigen a mano.` : hecho;
}
