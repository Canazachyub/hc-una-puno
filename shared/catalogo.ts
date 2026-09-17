// Convierte filas (del CSV o de la hoja) en Campo y Opcion, y los indexa.

import { filasAObjetos } from './csv';
import { textoOpcion } from './formato';
import { ordenSeccion } from './secciones';
import { TIPOS_CAMPO, TIPOS_OPCION } from './types';
import type { Campo, KnowledgeFila, Opcion, TipoCampo, TipoOpcion } from './types';

function num(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Los campos de una plantilla, en el orden en que se llenan. */
export function camposDePlantilla(esquema: Campo[], plantilla: string): Campo[] {
  return esquema.filter((c) => c.plantilla === plantilla);
}

export function filasAEsquema(filas: string[][]): Campo[] {
  return filasAObjetos(filas)
    .filter((o) => o.campo_id)
    .map((o) => {
      const tipo = (TIPOS_CAMPO as readonly string[]).includes(o.tipo) ? (o.tipo as TipoCampo) : 'texto';
      return {
        campo_id: o.campo_id,
        seccion: o.seccion,
        orden: num(o.orden),
        label: o.label,
        tipo,
        obligatorio: /^(si|sí|true|1)$/i.test(o.obligatorio),
        lista_id: o.lista_id ?? '',
        valor_normal: o.valor_normal ?? '',
        reglas: (o.reglas ?? '')
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean),
        ayuda_kb: o.ayuda_kb ?? '',
        plantilla: o.plantilla || 'fmh',
        subtitulo: o.subtitulo ?? '',
      };
    })
    .sort((a, b) => ordenSeccion(a.seccion) - ordenSeccion(b.seccion) || a.orden - b.orden);
}

export function filasAOpciones(filas: string[][]): Opcion[] {
  return filasAObjetos(filas)
    .filter((o) => o.lista_id && o.valor !== undefined && o.valor !== '')
    .map((o) => ({
      lista_id: o.lista_id,
      nombre: o.nombre,
      tipo: (TIPOS_OPCION as readonly string[]).includes(o.tipo) ? (o.tipo as TipoOpcion) : 'opcion',
      orden: num(o.orden),
      valor: o.valor,
      etiqueta: o.etiqueta ?? '',
      formato_salida: o.formato_salida ?? '',
    }));
}

export function filasAKnowledge(filas: string[][]): KnowledgeFila[] {
  return filasAObjetos(filas)
    .filter((o) => o.id)
    .map((o) => ({
      id: o.id,
      seccion: o.seccion,
      titulo: o.titulo,
      contenido: o.contenido ?? '',
      origen_archivo: o.origen_archivo ?? '',
    }));
}

export function indexarListas(opciones: Opcion[]): Map<string, Opcion[]> {
  const m = new Map<string, Opcion[]>();
  for (const o of opciones) {
    const l = m.get(o.lista_id);
    if (l) l.push(o);
    else m.set(o.lista_id, [o]);
  }
  for (const l of m.values()) l.sort((a, b) => a.orden - b.orden);
  return m;
}

/** Tipo de una lista: el de su primera opción. */
export function tipoLista(lista: Opcion[] | undefined): TipoOpcion | null {
  return lista && lista.length > 0 ? lista[0].tipo : null;
}

/** El valor "normal" de un campo, ya armado como se guarda (frase completa en escalas con formato). */
export function valorNormal(campo: Campo, listas: Map<string, Opcion[]>): string {
  if (!campo.valor_normal) return '';
  const lista = campo.lista_id ? listas.get(campo.lista_id) : undefined;
  if (!lista) return campo.valor_normal;
  const op = lista.find((o) => o.valor === campo.valor_normal);
  if (!op) return '';
  return textoOpcion(op);
}

/** Valor de una regla con parámetro: `escalas:eva|nyha` → ['eva', 'nyha']. */
export function reglaConValores(campo: Campo, nombre: string): string[] | null {
  const r = campo.reglas.find((x) => x === nombre || x.startsWith(`${nombre}:`));
  if (!r) return null;
  return r
    .slice(nombre.length + 1)
    .split('|')
    .map((x) => x.trim())
    .filter(Boolean);
}

export function tieneRegla(campo: Campo, nombre: string): boolean {
  return reglaConValores(campo, nombre) !== null;
}

/** Tope de elementos de una lista, escrito en las reglas como `max_3` o `max_6`. Sin regla, sin tope. */
export function maximoDeLista(campo: Campo): number {
  const r = campo.reglas.find((x) => /^max_\d+$/.test(x));
  return r ? Number(r.slice(4)) : Infinity;
}

/**
 * Escalas que tienen sentido en este campo, según la teoría: las que declara `escalas:` en reglas
 * y, si el campo es una escala, la suya. Nada de Bristol en la cabeza.
 */
export function escalasDeCampo(campo: Campo, listas: Map<string, Opcion[]>): string[] {
  const propias = campo.lista_id && tipoLista(listas.get(campo.lista_id)) === 'escala' ? [campo.lista_id] : [];
  const declaradas = reglaConValores(campo, 'escalas') ?? [];
  return [...new Set([...propias, ...declaradas])].filter((id) => tipoLista(listas.get(id)) === 'escala');
}
