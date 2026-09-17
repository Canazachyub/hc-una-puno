// Contexto clínico para interpretar cifras: grupo de edad, sexo y altitud.
// La edad se toma de la fecha de nacimiento (a la fecha de ingreso) o, si no hay, de la edad en años.

import { edadEnAnios } from './fechas';

export type GrupoEdad = 'rn' | 'lactante' | 'transicional' | 'preescolar' | 'escolar' | 'adolescente' | '' | 'mayor';

export interface ContextoClinico {
  /** '' = adulto. */
  grupo: GrupoEdad;
  /** Edad en días, si se conoce. */
  dias: number | null;
  sexo: 'M' | 'F' | '';
  /** Metros sobre el nivel del mar del lugar de atención. */
  altitud: number;
}

/** Altitud por defecto: Puno. */
export const ALTITUD_PUNO = 3827;
/** Desde esta altitud se usan los rangos de altura. */
export const ALTITUD_ALTA = 2500;

export interface CorteEdad {
  grupo: GrupoEdad;
  nombre: string;
  desde: number;
  hasta: number;
}

/** Cortes en días (se pueden reemplazar con los de las notas al cargar la guía). */
export const CORTES_EDAD: CorteEdad[] = [
  { grupo: 'rn', nombre: 'Recién nacido', desde: 0, hasta: 28 },
  { grupo: 'lactante', nombre: 'Lactante', desde: 29, hasta: 364 },
  { grupo: 'preescolar', nombre: 'Preescolar', desde: 365, hasta: 6 * 365 - 1 },
  { grupo: 'escolar', nombre: 'Escolar', desde: 6 * 365, hasta: 12 * 365 - 1 },
  { grupo: 'adolescente', nombre: 'Adolescente', desde: 12 * 365, hasta: 18 * 365 - 1 },
  { grupo: '', nombre: 'Adulto', desde: 18 * 365, hasta: 60 * 365 - 1 },
  { grupo: 'mayor', nombre: 'Adulto mayor', desde: 60 * 365, hasta: 200 * 365 },
];

export const NOMBRE_GRUPO: Record<GrupoEdad, string> = {
  rn: 'Recién nacido',
  lactante: 'Lactante',
  transicional: 'Niño de 1 a 2 años',
  preescolar: 'Preescolar',
  escolar: 'Escolar',
  adolescente: 'Adolescente',
  '': 'Adulto',
  mayor: 'Adulto mayor',
};

export const PEDIATRICOS: GrupoEdad[] = ['rn', 'lactante', 'transicional', 'preescolar', 'escolar', 'adolescente'];

function fechaUTC(s: string | undefined): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s ?? '');
  return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

export function grupoPorDias(dias: number, cortes: CorteEdad[] = CORTES_EDAD): GrupoEdad {
  // El corte más específico que contiene la edad (el adulto es el de respaldo).
  const encontrados = cortes.filter((c) => dias >= c.desde && dias <= c.hasta);
  const especifico = encontrados.find((c) => c.grupo !== '') ?? encontrados[0];
  return especifico?.grupo ?? '';
}

export function contextoDe(valores: Record<string, string>, altitud: number = ALTITUD_PUNO, cortes: CorteEdad[] = CORTES_EDAD): ContextoClinico {
  const nac = fechaUTC(valores['fil.fecha_nacimiento']);
  const ref = fechaUTC(valores['fil.fecha_ingreso']) ?? fechaUTC(valores['fil.fecha_elaboracion']) ?? Date.now();
  let dias: number | null = null;
  if (nac !== null && ref >= nac) dias = Math.floor((ref - nac) / 86400000);
  else {
    const anios = Number(String(valores['fil.edad'] ?? '').replace(',', '.'));
    if (valores['fil.edad'] && Number.isFinite(anios) && anios >= 0) dias = Math.floor(anios * 365.25);
  }
  const sexo = /^m/i.test(valores['fil.sexo'] ?? '') ? 'M' : /^f/i.test(valores['fil.sexo'] ?? '') ? 'F' : '';
  return { grupo: dias === null ? '' : grupoPorDias(dias, cortes), dias, sexo, altitud: Number.isFinite(altitud) ? altitud : ALTITUD_PUNO };
}

export function esAltura(ctx: Pick<ContextoClinico, 'altitud'> | undefined): boolean {
  return (ctx?.altitud ?? ALTITUD_PUNO) >= ALTITUD_ALTA;
}

/** Texto corto del contexto: «Lactante · 3827 m» (sin separador de miles, como se escribe la altitud). */
export function describirContexto(ctx: ContextoClinico): string {
  return `${NOMBRE_GRUPO[ctx.grupo]} · ${Math.round(ctx.altitud)} m`;
}

/**
 * Edad para redactar: la escrita en filiación o, si falta, la calculada con la fecha de nacimiento
 * a la fecha de ingreso («62 años», «5 meses», «12 días»).
 */
export function edadLegible(valores: Record<string, string>): string {
  const escrita = (valores['fil.edad'] ?? '').trim();
  if (escrita) return /[a-z]/i.test(escrita) ? escrita : `${escrita} ${escrita === '1' ? 'año' : 'años'}`;
  const ctx = contextoDe(valores);
  if (ctx.dias === null) return '';
  const ref = (valores['fil.fecha_ingreso'] || valores['fil.fecha_elaboracion'] || '').slice(0, 10) || undefined;
  const anios = edadEnAnios(valores['fil.fecha_nacimiento'] ?? '', ref);
  if (anios !== null && anios >= 1) return `${anios} ${anios === 1 ? 'año' : 'años'}`;
  const meses = Math.floor(ctx.dias / 30.44);
  if (meses >= 1) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  return `${ctx.dias} ${ctx.dias === 1 ? 'día' : 'días'}`;
}
