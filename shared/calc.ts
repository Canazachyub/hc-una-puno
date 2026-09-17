// Campos calculados. La fórmula va en `reglas` como `formula:peso/talla^2`.
// Cada variable es el sufijo de un campo de la misma sección (`peso` → efg.peso, `ao` → efg.glasgow_ao).

import type { Campo } from './types';

type Token = { t: 'num'; v: number } | { t: 'var'; v: string } | { t: 'op'; v: string };

function tokenizar(expr: string): Token[] {
  const out: Token[] = [];
  const re = /\s*(?:(\d+(?:\.\d+)?)|([a-z_][a-z0-9_]*)|([-+*/^()]))/giy;
  let m: RegExpExecArray | null;
  while (re.lastIndex < expr.length && (m = re.exec(expr))) {
    if (m[1]) out.push({ t: 'num', v: Number(m[1]) });
    else if (m[2]) out.push({ t: 'var', v: m[2].toLowerCase() });
    else if (m[3]) out.push({ t: 'op', v: m[3] });
  }
  return out;
}

/** Evalúa con precedencia normal (^ > * / > + -). Devuelve null si falta una variable. */
export function evaluar(expr: string, vars: Record<string, number | null>): number | null {
  const tk = tokenizar(expr);
  let i = 0;
  const ver = () => tk[i];

  function primario(): number | null {
    const t = tk[i++];
    if (!t) return null;
    if (t.t === 'num') return t.v;
    if (t.t === 'var') return vars[t.v] ?? null;
    if (t.v === '(') {
      const v = suma();
      i++; // ')'
      return v;
    }
    if (t.v === '-') {
      const v = primario();
      return v === null ? null : -v;
    }
    return null;
  }
  function potencia(): number | null {
    const b = primario();
    const t = ver();
    if (t && t.t === 'op' && t.v === '^') {
      i++;
      const e = potencia();
      return b === null || e === null ? null : Math.pow(b, e);
    }
    return b;
  }
  function producto(): number | null {
    let v = potencia();
    for (let t = ver(); t && t.t === 'op' && (t.v === '*' || t.v === '/'); t = ver()) {
      i++;
      const d = potencia();
      if (v === null || d === null) v = null;
      else if (t.v === '*') v = v * d;
      else v = d === 0 ? null : v / d;
    }
    return v;
  }
  function suma(): number | null {
    let v = producto();
    for (let t = ver(); t && t.t === 'op' && (t.v === '+' || t.v === '-'); t = ver()) {
      i++;
      const d = producto();
      v = v === null || d === null ? null : t.v === '+' ? v + d : v - d;
    }
    return v;
  }
  return suma();
}

export function formulaDe(campo: Campo): string | null {
  const r = campo.reglas.find((x) => x.startsWith('formula:'));
  return r ? r.slice('formula:'.length) : null;
}

function numeroDe(v: string | undefined): number | null {
  if (!v) return null;
  const m = /-?\d+(?:[.,]\d+)?/.exec(v);
  return m ? Number(m[0].replace(',', '.')) : null;
}

/** Recalcula todos los campos calculados. Devuelve solo los que cambiaron. */
export function recalcular(esquema: Campo[], valores: Record<string, string>): Record<string, string> {
  const cambios: Record<string, string> = {};
  for (const c of esquema) {
    if (c.tipo !== 'calculado') continue;
    const f = formulaDe(c);
    if (!f) continue;
    const vars: Record<string, number | null> = {};
    for (const tok of tokenizar(f)) {
      if (tok.t !== 'var') continue;
      const origen = esquema.find(
        (o) => o.seccion === c.seccion && o.campo_id !== c.campo_id && (o.campo_id.endsWith(`.${tok.v}`) || o.campo_id.endsWith(`_${tok.v}`)),
      );
      vars[tok.v] = origen ? numeroDe(valores[origen.campo_id]) : null;
    }
    const r = evaluar(f, vars);
    const texto = r === null || !Number.isFinite(r) ? '' : String(Math.round(r * 10) / 10);
    if ((valores[c.campo_id] ?? '') !== texto) cambios[c.campo_id] = texto;
  }
  return cambios;
}
