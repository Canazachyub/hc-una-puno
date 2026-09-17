// Razonamiento sindrómico orientativo: cruza lo registrado con los criterios de cada síndrome
// (seed/sindromes.json, sacados de las notas) y dice qué falta explorar. No diagnostica.

import { clave } from './valores';

export type TipoCriterio = 'sintoma' | 'signo' | 'vital' | 'examen';

export interface Criterio {
  texto: string;
  tipo: TipoCriterio;
  cardinal: boolean;
  claves: string[];
  explorar: string;
  fuera_de_notas?: boolean;
}

export interface Sindrome {
  id: string;
  nombre: string;
  sistema: string;
  fuente: string;
  criterios: Criterio[];
  duplicado_de?: string;
}

/** Un texto de la historia con el campo de donde sale. */
export interface TextoClinico {
  campo: string;
  texto: string;
}

export interface Hallado {
  criterio: Criterio;
  campo: string;
  fragmento: string;
}

export interface SindromeCompatible {
  sindrome: Sindrome;
  /** 0 a 100: peso de lo hallado sobre el total (los cardinales pesan doble). */
  puntaje: number;
  hallados: Hallado[];
  /** Lo que el paciente negó o salió negativo. */
  negados: Hallado[];
  faltan: Criterio[];
  cardinales: number;
}

const NEGACION_ANTES = /(?:^|[\s,(])(sin|no|niega|niegan|nego|ni|ausencia de|descarta|descartado)\s+(?:\S+\s+){0,4}$/;
const NEGACION_DESPUES = /^\S*\s*(?:\S+\s+){0,2}(negativ|ausente|abolid[oa] el signo|niega|no refiere)/;

/** Texto normalizado para buscar: minúsculas, sin tildes, signos como espacios. */
export function normalizar(t: string): string {
  return ` ${clave(t).replace(/[^a-z0-9+/%]+/g, ' ').replace(/\s+/g, ' ')} `;
}

function buscar(texto: string, claveBuscada: string): { negado: boolean; fragmento: string } | null {
  const k = normalizar(claveBuscada).trim();
  // Una clave que termina en espacio es palabra completa («tos »: no vale dentro de «movimientos»).
  const completa = /\s$/.test(claveBuscada);
  if (k.length < (completa ? 3 : 4)) return null;
  const aguja = completa ? ` ${k} ` : ` ${k}`;
  let desde = 0;
  let hallado: { negado: boolean; fragmento: string } | null = null;
  while (desde < texto.length) {
    // La clave debe empezar al inicio de una palabra.
    const i = texto.indexOf(aguja, desde);
    if (i < 0) break;
    // La negación vale dentro de la misma oración (el punto se convirtió en espacio: se mira poco hacia atrás).
    const antes = texto.slice(Math.max(0, i - 40), i + 1);
    const despues = texto.slice(i + 1 + k.length, i + 1 + k.length + 30);
    const negado = NEGACION_ANTES.test(antes) || NEGACION_DESPUES.test(despues.trim());
    const fragmento = texto.slice(Math.max(0, i - 25), i + 1 + k.length + 25).trim();
    if (!negado) return { negado: false, fragmento };
    hallado = hallado ?? { negado: true, fragmento };
    desde = i + 1;
  }
  return hallado;
}

/** Divide en oraciones para que la negación de una no alcance a la siguiente. */
function oraciones(t: string): string[] {
  return t
    .split(/[.;\n|]+/)
    .map((o) => normalizar(o))
    .filter((o) => o.trim().length > 0);
}

export function sugerirSindromes(
  sindromes: Sindrome[],
  textos: TextoClinico[],
  opciones: { maximo?: number; minimoHallados?: number } = {},
): SindromeCompatible[] {
  const partes = textos.flatMap((t) => oraciones(t.texto).map((o) => ({ campo: t.campo, o })));
  const out: SindromeCompatible[] = [];
  for (const s of sindromes) {
    if (s.duplicado_de) continue;
    const hallados: Hallado[] = [];
    const negados: Hallado[] = [];
    const faltan: Criterio[] = [];
    for (const c of s.criterios) {
      let si: Hallado | null = null;
      let no: Hallado | null = null;
      for (const p of partes) {
        for (const k of c.claves) {
          const r = buscar(p.o, k);
          if (!r) continue;
          if (!r.negado) si = { criterio: c, campo: p.campo, fragmento: r.fragmento };
          else no = no ?? { criterio: c, campo: p.campo, fragmento: r.fragmento };
          if (si) break;
        }
        if (si) break;
      }
      if (si) hallados.push(si);
      else if (no) negados.push(no);
      else faltan.push(c);
    }
    const peso = (c: Criterio) => (c.cardinal ? 2 : 1);
    const total = s.criterios.reduce((n, c) => n + peso(c), 0);
    const logrado = hallados.reduce((n, h) => n + peso(h.criterio), 0);
    const cardinales = hallados.filter((h) => h.criterio.cardinal).length;
    if (cardinales === 0 || hallados.length < (opciones.minimoHallados ?? 2)) continue;
    out.push({
      sindrome: s,
      puntaje: total ? Math.round((logrado / total) * 100) : 0,
      hallados,
      negados,
      // Primero los cardinales que faltan: son los que más orientan.
      faltan: [...faltan].sort((a, b) => Number(b.cardinal) - Number(a.cardinal)),
      cardinales,
    });
  }
  return out
    .sort((a, b) => b.cardinales - a.cardinales || b.puntaje - a.puntaje || b.hallados.length - a.hallados.length)
    .slice(0, opciones.maximo ?? 8);
}

export function parsearSindromes(json: string): Sindrome[] {
  try {
    const x: unknown = JSON.parse(json);
    if (!Array.isArray(x)) return [];
    return (x as Sindrome[]).filter((s) => s && typeof s.id === 'string' && Array.isArray(s.criterios));
  } catch {
    return [];
  }
}
