// Cómo se lee un valor guardado, en pantalla y en el Word.

import type { Campo } from '../../../shared/types';
import { partes } from '../../../shared/valores';

/** 2026-09-15 → 15/09/2026 · 2026-09-15T14:30 → 15/09/2026, 14:30 horas */
export function fechaLegible(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}${m[4] ? `, ${m[4]}:${m[5]} horas` : ''}`;
}

/** En español el decimal va con coma: 36.5 → 36,5 */
export function decimalConComa(v: string): string {
  return /^-?\d+\.\d+$/.test(v) ? v.replace('.', ',') : v;
}

export function mostrarValor(campo: Campo | undefined, valor: string | undefined): string {
  const v = (valor ?? '').trim();
  if (!v || !campo) return v;
  switch (campo.tipo) {
    case 'fecha':
      return fechaLegible(v);
    case 'numero':
    case 'calculado':
      return decimalConComa(v);
    case 'multi':
      return partes(v).join(', ');
    case 'lista':
      return partes(v).join('; ');
    default:
      return v;
  }
}

/** Une frases en un párrafo, cuidando la puntuación. */
export function unirFrases(frases: string[]): string {
  return frases
    .map((f) => f.trim())
    .filter(Boolean)
    .map((f) => (/[.!?…:]$/.test(f) ? f : `${f}.`))
    .join(' ');
}
