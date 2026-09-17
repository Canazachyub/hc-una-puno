// Representación intermedia del documento. La usan el Word y la vista previa,
// así lo que se ve en pantalla es lo que sale impreso.

import { CAMPOS_CLAVE, esVisible } from '../../../../shared/secciones';
import { partes } from '../../../../shared/valores';
import { CAMPO_EVOLUCIONES, CAMPO_LABORATORIO, VITALES_DIA, diaHospitalizacion, leerEvoluciones, leerLaboratorio } from '../../../../shared/seguimiento';
import type { ResultadoLab } from '../../../../shared/seguimiento';
import { fechaLegible, mostrarValor } from '../texto';
import type { Campo } from '../../../../shared/types';
import type { CatalogoVista } from '../vista';
import { ESTRUCTURA, IDS_VITALES, VITALES } from './estructura';
import type { Bloque, Lector } from './estructura';

export type Elemento =
  | { t: 'titulo'; texto: string }
  | { t: 'seccion'; texto: string }
  | { t: 'sub'; texto: string; nivel: 1 | 2 | 3 }
  | { t: 'campo'; etiqueta: string; valor: string; ref: string }
  | { t: 'narrativa'; etiqueta: string; parrafos: string[]; ref: string }
  | { t: 'lista'; etiqueta: string; items: string[]; comillas: boolean; ref: string }
  | { t: 'pares'; filas: { etiqueta: string; valor: string }[][]; ref: string }
  | { t: 'forma'; filas: FilaForma[]; refs: string[] }
  | { t: 'tabla'; titulo: string; encabezados: string[]; filas: string[][]; ref: string };

/** Una fila del formulario calcado del documento: título de grupo, dato con su casilla, o bloque largo. */
export type FilaForma =
  | { f: 'titulo'; texto: string }
  | { f: 'campo'; etiqueta: string; valor: string; ref: string; opciones?: { texto: string; marcada: boolean }[] }
  | { f: 'largo'; etiqueta: string; parrafos: string[]; ref: string };

export interface DatosDocumento {
  dni: string;
  episodio: number;
  valores: Record<string, string>;
}

export interface OpcionesDocumento {
  /** lineas: los campos vacíos salen con línea para llenar a mano. omitir: solo lo registrado. */
  vacios: 'lineas' | 'omitir';
  /** Interpretación de un resultado de laboratorio (la pone el navegador; sin ella la columna va vacía). */
  interpretarLab?: (r: ResultadoLab) => string;
}

const NARRATIVOS = new Set(['narrativa', 'texto_largo']);

function parrafos(texto: string): string[] {
  return texto
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function rango(e: Elemento): number {
  if (e.t === 'titulo') return -1;
  if (e.t === 'seccion') return 0;
  if (e.t === 'sub') return e.nivel;
  return 99;
}

function tieneContenido(e: Elemento): boolean {
  switch (e.t) {
    case 'campo':
      return e.valor !== '';
    case 'narrativa':
      return e.parrafos.length > 0;
    case 'lista':
      return e.items.length > 0;
    case 'pares':
      return e.filas.some((f) => f.some((c) => c.valor));
    case 'forma':
      return e.filas.some((f) => (f.f === 'campo' && f.valor) || (f.f === 'largo' && f.parrafos.length > 0));
    case 'tabla':
      return e.filas.length > 0;
    default:
      return false;
  }
}

/** Quita lo vacío y los títulos que se quedaron sin contenido. */
function soloRegistrado(elementos: Elemento[]): Elemento[] {
  const llenos = elementos
    .map((e): Elemento | null => {
      if (rango(e) < 99) return e;
      if (e.t === 'pares') {
        const filas = e.filas.map((f) => f.filter((c) => c.valor)).filter((f) => f.length);
        return filas.length ? { ...e, filas } : null;
      }
      return tieneContenido(e) ? e : null;
    })
    .filter((e): e is Elemento => e !== null);
  return llenos.filter((e, i) => {
    const r = rango(e);
    if (r === 99 || r === -1) return true;
    for (let j = i + 1; j < llenos.length; j++) {
      const rj = rango(llenos[j]);
      if (rj === 99) return true;
      if (rj <= r) return false;
    }
    return false;
  });
}

/** Hasta cuántas opciones caben en la fila para marcarlas, como en el papel. */
const MAX_OPCIONES_EN_FILA = 6;

/**
 * El documento de la plantilla detallada es una rejilla de tablas: etiqueta en gris, casilla al lado
 * y las opciones en celdas para marcar. Esto arma esa rejilla, sección por sección.
 */
function formularioDeSeccion(campos: Campo[], cat: CatalogoVista, lector: Lector, valores: Record<string, string>): Elemento | null {
  const filas: FilaForma[] = [];
  const refs: string[] = [];
  let subtitulo = '';
  for (const c of campos) {
    if (CAMPOS_CLAVE.includes(c.campo_id) || !esVisible(c.campo_id, valores)) continue;
    if (c.subtitulo && c.subtitulo !== subtitulo) filas.push({ f: 'titulo', texto: c.subtitulo });
    subtitulo = c.subtitulo;
    refs.push(c.campo_id);
    const valor = lector.t(c.campo_id);
    if (NARRATIVOS.has(c.tipo) || c.tipo === 'lista') {
      filas.push({
        f: 'largo',
        etiqueta: c.label,
        parrafos: c.tipo === 'lista' ? partes(valores[c.campo_id] ?? '') : parrafos(valor),
        ref: c.campo_id,
      });
      continue;
    }
    const opciones = cat.listas.get(c.lista_id) ?? [];
    const elegidas = new Set(partes(valores[c.campo_id] ?? ''));
    filas.push({
      f: 'campo',
      etiqueta: c.label,
      valor,
      ref: c.campo_id,
      opciones:
        opciones.length > 0 && opciones.length <= MAX_OPCIONES_EN_FILA
          ? opciones.map((o) => ({ texto: o.valor, marcada: elegidas.has(o.valor) || valor === o.valor }))
          : undefined,
    });
  }
  return filas.length ? { t: 'forma', filas, refs } : null;
}

function armarFormulario(cat: CatalogoVista, lector: Lector, valores: Record<string, string>): Elemento[] {
  const out: Elemento[] = [{ t: 'titulo', texto: 'HISTORIA CLÍNICA' }];
  for (const s of cat.secciones) {
    const forma = formularioDeSeccion(cat.porSeccion.get(s.id) ?? [], cat, lector, valores);
    if (!forma) continue;
    out.push({ t: 'seccion', texto: s.titulo.toUpperCase() });
    out.push(forma);
  }
  return out;
}

export function armarDocumento(h: DatosDocumento, cat: CatalogoVista, op: OpcionesDocumento): Elemento[] {
  const valores: Record<string, string> = { ...h.valores, 'fil.dni': h.dni };
  const impresos = new Set<string>(IDS_VITALES);
  const lector: Lector = {
    v: (id) => (valores[id] ?? '').trim(),
    t: (id) => mostrarValor(cat.porId.get(id), valores[id]),
  };
  const etiquetaDe = (id: string) => cat.porId.get(id)?.label ?? id;
  const visible = (id: string) => esVisible(id, valores) && cat.porId.has(id);
  const out: Elemento[] = [{ t: 'titulo', texto: 'HISTORIA CLÍNICA' }];

  const bloque = (b: Bloque): void => {
    switch (b.tipo) {
      case 'seccion':
        out.push({ t: 'seccion', texto: b.titulo });
        break;
      case 'subseccion':
        out.push({ t: 'sub', texto: b.titulo, nivel: 1 });
        break;
      case 'subtitulo':
        out.push({ t: 'sub', texto: b.titulo, nivel: b.nivel ?? 2 });
        break;
      case 'campo': {
        if (!visible(b.id)) return;
        impresos.add(b.id);
        const campo = cat.porId.get(b.id);
        const valor = lector.t(b.id);
        const etiqueta = b.label ?? etiquetaDe(b.id);
        if (campo && NARRATIVOS.has(campo.tipo) && valor.length > 90) {
          out.push({ t: 'narrativa', etiqueta, parrafos: parrafos(valor), ref: b.id });
        } else {
          out.push({ t: 'campo', etiqueta, valor: valor && b.sufijo ? `${valor} ${b.sufijo}` : valor, ref: b.id });
        }
        break;
      }
      case 'combinado': {
        const ids = b.ids.filter((id) => cat.porId.has(id));
        if (ids.length === 0) return;
        ids.forEach((id) => impresos.add(id));
        const etiqueta = typeof b.label === 'function' ? b.label(lector) : b.label;
        out.push({ t: 'campo', etiqueta, valor: b.armar(lector), ref: ids[0] });
        break;
      }
      case 'narrativa':
        if (!visible(b.id)) return;
        impresos.add(b.id);
        out.push({ t: 'narrativa', etiqueta: b.label ?? etiquetaDe(b.id), parrafos: parrafos(lector.v(b.id)), ref: b.id });
        break;
      case 'parrafo': {
        const ids = b.ids.filter((id) => cat.porId.has(id));
        if (ids.length === 0) return;
        ids.forEach((id) => impresos.add(id));
        out.push({ t: 'narrativa', etiqueta: b.label ?? '', parrafos: parrafos(b.armar(lector)), ref: ids[ids.length - 1] });
        break;
      }
      case 'lista':
        if (!visible(b.id)) return;
        impresos.add(b.id);
        out.push({ t: 'lista', etiqueta: b.label, items: partes(valores[b.id]), comillas: !!b.comillas, ref: b.id });
        break;
      case 'vitales':
        out.push({ t: 'pares', filas: VITALES(lector), ref: 'efg.pa_sistolica' });
        break;
      case 'si':
        if (b.cuando(lector)) b.bloques.forEach(bloque);
        else b.bloques.forEach((x) => x.tipo === 'campo' && impresos.add(x.id));
        break;
      case 'resto':
        for (const c of cat.porSeccion.get(b.seccion) ?? []) {
          if (impresos.has(c.campo_id) || CAMPOS_CLAVE.includes(c.campo_id) || !esVisible(c.campo_id, valores)) continue;
          bloque(
            c.tipo === 'narrativa'
              ? { tipo: 'narrativa', id: c.campo_id }
              : c.tipo === 'lista'
                ? { tipo: 'lista', id: c.campo_id, label: c.label }
                : { tipo: 'campo', id: c.campo_id },
          );
        }
        break;
    }
  };
  if (cat.plantilla !== 'fmh') {
    const forma = armarFormulario(cat, lector, valores);
    insertarSeguimiento(forma, valores, op);
    return op.vacios === 'omitir' ? soloRegistrado(forma) : forma;
  }
  const estructura = ESTRUCTURA;
  estructura.forEach(bloque);

  // Secciones que el esquema tenga y la estructura no conozca.
  const conocidas = new Set(
    estructura.flatMap((b) => (b.tipo === 'resto' ? [(b as { seccion: string }).seccion] : b.tipo === 'seccion' ? [] : [])),
  );
  if (cat.plantilla !== 'fmh') for (const s of cat.secciones) conocidas.add(s.id);
  for (const s of cat.secciones) {
    if (conocidas.has(s.id)) continue;
    out.push({ t: 'seccion', texto: s.titulo.toUpperCase() });
    bloque({ tipo: 'resto', seccion: s.id });
  }

  insertarSeguimiento(out, valores, op);
  return op.vacios === 'omitir' ? soloRegistrado(out) : out;
}

const coma = (t: string) => t.replace(/(\d)\.(\d)/g, '$1,$2');

/** Laboratorio después de «Exámenes complementarios» y evoluciones diarias después de «Evolución». */
function insertarSeguimiento(out: Elemento[], valores: Record<string, string>, op: OpcionesDocumento): void {
  const lab = leerLaboratorio(valores[CAMPO_LABORATORIO]);
  if (lab.length) {
    const i = out.findIndex((e) => 'ref' in e && e.ref === 'exc.examenes');
    const tabla: Elemento = {
      t: 'tabla',
      titulo: 'Resultados de laboratorio',
      encabezados: ['Fecha', 'Parámetro', 'Resultado', 'Referencia', 'Interpretación'],
      filas: lab.map((r) => [
        r.fecha ? fechaLegible(r.fecha) : '',
        r.parametro,
        `${coma(r.valor)} ${r.unidad}`.trim(),
        r.referencia,
        op.interpretarLab?.(r) ?? '',
      ]),
      ref: CAMPO_LABORATORIO,
    };
    out.splice(i >= 0 ? i + 1 : out.length, 0, tabla);
  }

  const evoluciones = leerEvoluciones(valores[CAMPO_EVOLUCIONES]);
  if (evoluciones.length) {
    const i = out.findIndex((e) => 'ref' in e && e.ref === 'evo.evolucion');
    const bloque: Elemento[] = [{ t: 'sub', texto: 'Evoluciones diarias', nivel: 2 }];
    for (const e of evoluciones) {
      const dia = diaHospitalizacion(valores['fil.fecha_ingreso'], e.fecha);
      bloque.push({ t: 'sub', texto: `${fechaLegible(e.fecha)}${dia ? ` · día ${dia} de hospitalización` : ''}`, nivel: 3 });
      const vitales = VITALES_DIA.filter((v) => e.vitales[v.clave])
        .map((v) => `${v.etiqueta}: ${coma(String(e.vitales[v.clave]))} ${v.unidad}`.trim())
        .join(' · ');
      if (vitales) bloque.push({ t: 'campo', etiqueta: 'Signos vitales', valor: vitales, ref: CAMPO_EVOLUCIONES });
      const soap: [string, string][] = [
        ['Subjetivo', e.subjetivo],
        ['Objetivo', e.objetivo],
        ['Análisis', e.analisis],
        ['Plan', e.plan],
      ];
      for (const [etiqueta, texto] of soap) {
        if (texto.trim()) bloque.push({ t: 'narrativa', etiqueta, parrafos: texto.split(/\n+/).map((p) => p.trim()).filter(Boolean), ref: CAMPO_EVOLUCIONES });
      }
    }
    out.splice(i >= 0 ? i + 1 : out.length, 0, ...bloque);
  }
}
