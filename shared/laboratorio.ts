// Catálogo de parámetros de laboratorio (seed/laboratorio.csv): nombre completo, sinónimos, rangos y semáforo.
// La hemoglobina se ajusta por altura con la tabla de la Organización Mundial de la Salud (2011) antes de buscar anemia.

import type { ContextoClinico, GrupoEdad } from './contexto';
import { ALTITUD_PUNO } from './contexto';
import { parsearCsv } from './csv';
import type { Gravedad } from './gravedad';
import { clave } from './valores';

export interface ParametroLab {
  parametro: string;
  examen: string;
  sinonimos: string[];
  unidad: string;
  sexo: '' | 'M' | 'F';
  grupo: GrupoEdad;
  min: number | null;
  max: number | null;
  bajo: string;
  nivelBajo: Gravedad;
  alto: string;
  nivelAlto: Gravedad;
  alto2Desde: number | null;
  alto2: string;
  nivelAlto2: Gravedad;
  bajo2Hasta: number | null;
  bajo2: string;
  nivelBajo2: Gravedad;
  fuente: string;
}

const num = (x: string | undefined): number | null => {
  const t = (x ?? '').trim().replace(',', '.');
  return t !== '' && Number.isFinite(Number(t)) ? Number(t) : null;
};
const nivel = (x: string | undefined, porDefecto: Gravedad): Gravedad => {
  const n = Number(x);
  return ([0, 1, 2, 3].includes(n) ? n : porDefecto) as Gravedad;
};

export function parsearLaboratorio(csv: string): ParametroLab[] {
  const [cab, ...filas] = parsearCsv(csv);
  if (!cab) return [];
  const i = (n: string) => cab.indexOf(n);
  const g = (f: string[], n: string) => (i(n) >= 0 ? (f[i(n)] ?? '').trim() : '');
  return filas
    .filter((f) => g(f, 'parametro'))
    .map((f) => ({
      parametro: g(f, 'parametro'),
      examen: g(f, 'examen'),
      sinonimos: g(f, 'sinonimos')
        .split('|')
        .map((s) => clave(s))
        .filter(Boolean),
      unidad: g(f, 'unidad'),
      sexo: (['M', 'F'].includes(g(f, 'sexo')) ? g(f, 'sexo') : '') as ParametroLab['sexo'],
      grupo: g(f, 'grupo') as GrupoEdad,
      min: num(g(f, 'min')),
      max: num(g(f, 'max')),
      bajo: g(f, 'bajo'),
      nivelBajo: nivel(g(f, 'nivel_bajo'), 2),
      alto: g(f, 'alto'),
      nivelAlto: nivel(g(f, 'nivel_alto'), 2),
      alto2Desde: num(g(f, 'alto2_desde')),
      alto2: g(f, 'alto2'),
      nivelAlto2: nivel(g(f, 'nivel_alto2'), 3),
      bajo2Hasta: num(g(f, 'bajo2_hasta')),
      bajo2: g(f, 'bajo2'),
      nivelBajo2: nivel(g(f, 'nivel_bajo2'), 3),
      fuente: g(f, 'fuente'),
    }));
}

const limpiarNombre = (t: string) => clave(t).replace(/[^a-z0-9%+/# ]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Busca el parámetro por su nombre o cualquier sinónimo (sin tildes ni mayúsculas).
 * Con el examen se resuelven los nombres ambiguos: «pH» de gasometría o de orina, «leucocitos» en sangre o en orina.
 */
export function buscarParametro(catalogo: ParametroLab[], nombre: string, examen = ''): ParametroLab | null {
  const k = limpiarNombre(nombre);
  if (!k) return null;
  const ex = clave(examen);
  const delExamen = ex ? catalogo.filter((p) => p.examen === ex) : [];
  const exacto = (l: ParametroLab[]) => l.find((p) => limpiarNombre(p.parametro) === k || p.sinonimos.includes(k));
  const empieza = (l: ParametroLab[]) => l.find((p) => limpiarNombre(p.parametro).startsWith(`${k} `));
  return (
    exacto(delExamen) ??
    empieza(delExamen) ??
    exacto(catalogo) ??
    catalogo.find((p) => p.sinonimos.some((sin) => sin.length >= 4 && k.startsWith(`${sin} `))) ??
    null
  );
}

/** Filas del catálogo para el parámetro, elegidas por sexo y grupo de edad. */
export function rangoPara(catalogo: ParametroLab[], parametro: string, ctx?: Pick<ContextoClinico, 'sexo' | 'grupo'>): ParametroLab | null {
  const filas = catalogo.filter((p) => p.parametro === parametro);
  if (filas.length === 0) return null;
  const puntaje = (p: ParametroLab) =>
    (p.grupo === (ctx?.grupo ?? '') ? 4 : p.grupo === '' ? 1 : -10) + (p.sexo === (ctx?.sexo ?? '') ? 2 : p.sexo === '' ? 1 : -10);
  return [...filas].sort((a, b) => puntaje(b) - puntaje(a))[0];
}

/** Ajuste de hemoglobina por altitud (Organización Mundial de la Salud, 2011), en g/dl. */
export function ajusteHemoglobina(altitud: number): number {
  const tabla: [number, number][] = [
    [4500, 4.5],
    [4000, 3.5],
    [3500, 2.7],
    [3000, 1.9],
    [2500, 1.3],
    [2000, 0.8],
    [1500, 0.5],
    [1000, 0.2],
  ];
  return tabla.find(([desde]) => altitud >= desde)?.[1] ?? 0;
}

export interface Lectura {
  etiqueta: string;
  nivel: Gravedad;
  /** Explicación corta: rango usado, conversión de unidad, ajuste por altura. */
  detalle: string;
}

export function leerNumero(valor: string): number | null {
  // «10.500» o «10 500» son miles; «0.200» es un decimal.
  const m = /-?\d+(?:[.,]\d+)?/.exec(valor.replace(/\b([1-9]\d{0,2})[\s.](?=\d{3}\b)/g, '$1'));
  return m ? Number(m[0].replace(',', '.')) : null;
}

const fmt = (n: number) => String(Math.round(n * 1000) / 1000).replace('.', ',');

/** Rango impreso en el informe: «12 - 16», «12 a 16», «< 0,04», «hasta 40», «> 60». */
export function rangoDeReferencia(texto: string): { min: number | null; max: number | null } | null {
  const t = clave(texto).replace(/,/g, '.');
  const n = '(-?\\d+(?:\\.\\d+)?)';
  let m = new RegExp(`${n}\\s*(?:-|a|–|al)\\s*${n}`).exec(t);
  if (m) return { min: Number(m[1]), max: Number(m[2]) };
  m = new RegExp(`(?:<|<=|≤|hasta|menor de|menos de)\\s*${n}`).exec(t);
  if (m) return { min: null, max: Number(m[1]) };
  m = new RegExp(`(?:>|>=|≥|mayor de|mas de)\\s*${n}`).exec(t);
  if (m) return { min: Number(m[1]), max: null };
  return null;
}

/**
 * Lleva el valor del informe a la unidad del catálogo.
 * Los informes suelen traer miles por microlitro, U/L, gramos o milisegundos.
 */
export function convertirUnidad(p: ParametroLab, v: number, unidadInforme: string): { v: number; nota: string } {
  const u = clave(unidadInforme);
  const pu = clave(p.unidad);
  if (/microlitro|mm3/.test(pu) && p.max !== null && p.max >= 1000) {
    if (/10\s*\^?\s*(3|³)|10e3|x\s*10|mil|\bk\b|10\^9|10 9/.test(u) || (v > 0 && v < 1000 && !u)) {
      return { v: v * 1000, nota: `se multiplicó por 1 000 (el informe usa miles por microlitro)` };
    }
  }
  if (pu === 'u/dl' && /u\/l/.test(u)) return { v: v / 10, nota: 'se pasó de U/L a U/dl' };
  if (pu.startsWith('mg') && /^g(\b|\/| )/.test(u)) return { v: v * 1000, nota: 'se pasó de gramos a miligramos' };
  if (pu === 'segundos' && /^ms|milisegundo/.test(u)) return { v: v / 1000, nota: 'se pasó de milisegundos a segundos' };
  if (/densidad/.test(clave(p.parametro)) && v > 100) return { v: v / 1000, nota: 'densidad escrita sin coma' };
  if (pu === '%' && p.min !== null && p.min > 1 && v > 0 && v <= 1) return { v: v * 100, nota: 'se pasó de fracción a porcentaje' };
  return { v, nota: '' };
}

export interface ResultadoAInterpretar {
  parametro: string;
  valor: string;
  unidad?: string;
  referencia?: string;
  examen?: string;
}

/** Interpreta un resultado con el catálogo, según sexo, edad y altitud. Sin catálogo, usa el rango del informe. */
export function interpretarLab(
  catalogo: ParametroLab[],
  r: ResultadoAInterpretar,
  ctx?: Pick<ContextoClinico, 'sexo' | 'grupo' | 'altitud'>,
): Lectura | null {
  const leido = leerNumero(r.valor);
  if (leido === null) return null;
  const encontrado = buscarParametro(catalogo, r.parametro, r.examen);
  const p = encontrado ? rangoPara(catalogo, encontrado.parametro, ctx) : null;

  // Sin rango en el catálogo (troponina, parámetros no catalogados): el del informe.
  if (!p || (p.min === null && p.max === null)) {
    const ref = rangoDeReferencia(r.referencia ?? '');
    if (!ref) return null;
    const detalle = `Según el rango del informe: ${r.referencia}`;
    if (ref.min !== null && leido < ref.min) return { etiqueta: 'Por debajo del rango del informe', nivel: 2, detalle };
    if (ref.max !== null && leido > ref.max) return { etiqueta: 'Por encima del rango del informe', nivel: 2, detalle };
    return { etiqueta: 'Dentro del rango del informe', nivel: 0, detalle };
  }

  const { v, nota } = convertirUnidad(p, leido, r.unidad ?? '');
  const rango = p.min !== null && p.max !== null ? `${fmt(p.min)} a ${fmt(p.max)}` : p.min !== null ? `${fmt(p.min)} o más` : `hasta ${fmt(p.max ?? 0)}`;
  const partes = [`Normal: ${rango} ${p.unidad}`.trim()];
  if (nota) partes.push(nota);
  const altitud = ctx?.altitud ?? ALTITUD_PUNO;
  const nombre = clave(p.parametro);
  let paraBajo = v;

  if (nombre === 'hemoglobina') {
    const ajuste = ajusteHemoglobina(altitud);
    if (ajuste > 0) {
      paraBajo = v - ajuste;
      partes.push(`ajustada por altura: ${fmt(paraBajo)} g/dl (se restan ${fmt(ajuste)}, Organización Mundial de la Salud)`);
    }
  }
  const detalle = partes.join(' · ');

  // En altura (2 500 m o más), la saturación y la presión de oxígeno normales son menores.
  if (altitud >= 2500 && nombre === 'saturacion de oxigeno') {
    const d = `${detalle} · en altura se toma 90 % como normal`;
    if (v >= 90) return { etiqueta: 'Normal para la altura', nivel: 0, detalle: d };
    if (v >= 88) return { etiqueta: 'Hipoxemia leve para la altura', nivel: 1, detalle: d };
    if (v >= 80) return { etiqueta: 'Hipoxemia', nivel: 2, detalle: d };
    return { etiqueta: 'Hipoxemia severa', nivel: 3, detalle: d };
  }
  if (altitud >= 2500 && nombre === 'presion arterial de oxigeno' && p.min !== null && v < p.min && v >= 50) {
    return { etiqueta: 'Menor que a nivel del mar: esperable en altura', nivel: 1, detalle: `${detalle} · en altura la presión de oxígeno normal es menor (fuera de notas)` };
  }

  if (p.bajo2Hasta !== null && paraBajo < p.bajo2Hasta && p.bajo2) return { etiqueta: p.bajo2, nivel: p.nivelBajo2, detalle };
  if (p.min !== null && paraBajo < p.min) return { etiqueta: p.bajo || 'Por debajo de lo normal', nivel: p.nivelBajo, detalle };
  // El corte alto se compara con el valor medido (la eritrocitosis de altura no se ajusta).
  if (p.alto2Desde !== null && v >= p.alto2Desde && p.alto2) return { etiqueta: p.alto2, nivel: p.nivelAlto2, detalle };
  if (p.max !== null && v > p.max) return { etiqueta: p.alto || 'Por encima de lo normal', nivel: p.nivelAlto, detalle };
  return { etiqueta: 'Normal', nivel: 0, detalle };
}
