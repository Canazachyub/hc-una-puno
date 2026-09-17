// Validación y normalización de valores contra el esquema y las listas.

import { aplicarFormato, marcadores, opcionDeTexto } from './formato';
import { SEP } from './types';
import type { Campo, Opcion } from './types';

export function partes(v: string | undefined): string[] {
  if (!v) return [];
  return v
    .split('|')
    .map((p) => p.trim())
    .filter(Boolean);
}

export function unir(items: string[]): string {
  return items.map((i) => i.trim()).filter(Boolean).join(SEP);
}

export function unirSinRepetir(a: string[], b: string[]): string[] {
  const vistos = new Set(a.map(clave));
  const out = [...a];
  for (const x of b) {
    const k = clave(x);
    if (!vistos.has(k)) {
      vistos.add(k);
      out.push(x);
    }
  }
  return out;
}

/** Minúsculas, sin tildes ni espacios repetidos. Para comparar. */
export function clave(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Opciones que excluyen a las demás en un campo multi. */
export const EXCLUYENTES = ['ninguno', 'ninguna', 'normal', 'normales', 'no recuerda', 'no porta carne'];

export type Validacion = { ok: true; valor: string } | { ok: false; motivo: string };

function opcionPorValor(lista: Opcion[], v: string): Opcion | undefined {
  const k = clave(v);
  const exacta = lista.find((o) => clave(o.valor) === k) ?? lista.find((o) => clave(o.etiqueta) === k && o.etiqueta !== '');
  if (exacta) return exacta;
  // «Edema (Acumulación de líquido en el intersticio)»: el valor seguido de su definición entre paréntesis.
  const m = /^(.+?)\s*\((.+)\)$/.exec(v.trim());
  if (!m) return undefined;
  return lista.find((o) => clave(o.valor) === clave(m[1]) && (!o.etiqueta || clave(o.etiqueta) === clave(m[2])));
}

function validarItemLista(lista: Opcion[], v: string, detalles: Record<string, string>): Validacion {
  const exacto = opcionDeTexto(lista, v);
  if (exacto && exacto.opcion.valor !== v.trim()) return { ok: true, valor: v.trim() };
  const op = exacto?.opcion ?? opcionPorValor(lista, v);
  if (!op) return { ok: false, motivo: `"${v}" no está en la lista` };
  if (op.formato_salida) return { ok: true, valor: aplicarFormato(op.formato_salida, op.valor, detalles) };
  return { ok: true, valor: op.valor };
}

export function normalizarNumero(v: string): string | null {
  const t = v.trim().replace(',', '.');
  if (t === '') return '';
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return String(n);
}

export function normalizarFecha(v: string): string | null {
  const t = v.trim();
  if (t === '') return '';
  let m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(t);
  if (m) return `${m[1]}-${m[2]}-${m[3]}${m[4] ? `T${m[4]}:${m[5]}` : ''}`;
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(t);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}

/**
 * Comprueba que `valor` es aceptable para el campo. Un campo con lista no acepta
 * texto libre salvo que sea `opcion_otro`.
 */
export function validarValor(
  campo: Campo,
  valor: string,
  listas: Map<string, Opcion[]>,
  detalles: Record<string, string> = {},
): Validacion {
  const v = (valor ?? '').trim();
  if (v === '') return { ok: true, valor: '' };
  const lista = campo.lista_id ? listas.get(campo.lista_id) : undefined;

  switch (campo.tipo) {
    case 'numero': {
      const n = normalizarNumero(v);
      return n === null ? { ok: false, motivo: `"${v}" no es un número` } : { ok: true, valor: n };
    }
    case 'fecha': {
      const f = normalizarFecha(v);
      return f === null ? { ok: false, motivo: `"${v}" no es una fecha` } : { ok: true, valor: f };
    }
    case 'calculado':
      return { ok: false, motivo: 'campo calculado' };
    case 'opcion':
    case 'opcion_otro': {
      if (!lista) return { ok: true, valor: v };
      const op = opcionPorValor(lista, v);
      if (op) return { ok: true, valor: op.valor };
      return campo.tipo === 'opcion_otro' ? { ok: true, valor: v } : { ok: false, motivo: `"${v}" no está en la lista` };
    }
    case 'escala': {
      if (!lista) return { ok: false, motivo: 'escala sin lista' };
      return validarItemLista(lista, v, detalles);
    }
    case 'multi': {
      if (!lista) return { ok: true, valor: unir(partes(v)) };
      const items: string[] = [];
      for (const p of partes(v)) {
        const r = validarItemLista(lista, p, detalles);
        if (!r.ok) return r;
        items.push(r.valor);
      }
      return { ok: true, valor: unir(items) };
    }
    case 'lista':
      return { ok: true, valor: unir(partes(v)) };
    case 'narrativa':
    case 'texto_largo':
    case 'texto':
    default:
      return { ok: true, valor: v };
  }
}

/** ¿Qué marcadores hay que preguntar al elegir esta opción? */
export function marcadoresDeOpcion(op: Opcion): string[] {
  if (op.tipo === 'frase') return marcadores(op.etiqueta);
  return op.formato_salida ? marcadores(op.formato_salida) : [];
}

export function estaLleno(v: string | undefined): boolean {
  return !!v && v.trim() !== '';
}
