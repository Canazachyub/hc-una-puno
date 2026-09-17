// Síndromes compatibles con lo registrado (seed/sindromes.json, empaquetado: funciona sin señal).

import sindromesJson from '../../../seed/sindromes.json?raw';
import { NOMBRE_GRAVEDAD, gravedadDeTexto } from '../../../shared/gravedad';
import { VARIABLES_UMBRAL, interpretarConNivel } from '../../../shared/guias';
import { CAMPO_LABORATORIO, leerLaboratorio } from '../../../shared/seguimiento';
import { parsearSindromes, sugerirSindromes } from '../../../shared/sindromes';
import type { Sindrome, SindromeCompatible, TextoClinico } from '../../../shared/sindromes';
import type { HistoriaLocal } from './db';
import { UMBRALES, contextoHistoria } from './guias';
import { leerResultado } from './laboratorio';
import type { CatalogoVista } from './vista';

export const SINDROMES: Sindrome[] = parsearSindromes(sindromesJson);

/** Secciones que describen el cuadro actual (los antecedentes solo entran con su nombre, para leer «Niega»). */
const SECCIONES = new Set(['ectoscopia', 'enfermedad_actual', 'funciones_biologicas', 'ef_general', 'ef_regiones']);
const ANTECEDENTES = ['apa.hta', 'apa.diabetes', 'apa.asma', 'apa.otras_patologias', 'apa.otras_detalle'];

export function textosClinicos(h: HistoriaLocal, cat: CatalogoVista): TextoClinico[] {
  const out: TextoClinico[] = [];
  const clinico = contextoHistoria(h.valores);
  for (const c of cat.esquema) {
    const v = (h.valores[c.campo_id] ?? '').trim();
    if (!v) continue;
    if (c.campo_id in VARIABLES_UMBRAL) {
      // Las cifras entran como su interpretación: «taquicardia», «fiebre moderada».
      const r = interpretarConNivel(c.campo_id, v, UMBRALES, clinico).filter((x) => x.nivel > 0);
      if (r.length) out.push({ campo: c.campo_id, texto: r.map((x) => x.etiqueta).join('. ') });
      continue;
    }
    if (ANTECEDENTES.includes(c.campo_id)) {
      out.push({ campo: c.campo_id, texto: `${c.label} ${v}` });
      continue;
    }
    if (!SECCIONES.has(c.seccion)) continue;
    out.push({ campo: c.campo_id, texto: v });
    const g = gravedadDeTexto(c.lista_id ? cat.listas.get(c.lista_id) : undefined, v);
    if (g !== null && g > 0) out.push({ campo: c.campo_id, texto: `${c.label} ${NOMBRE_GRAVEDAD[g].toLowerCase()}` });
  }
  for (const r of leerLaboratorio(h.valores[CAMPO_LABORATORIO])) {
    const l = leerResultado(r, h.valores);
    out.push({ campo: CAMPO_LABORATORIO, texto: `${r.parametro} ${r.valor} ${r.unidad}${l && l.nivel > 0 ? `. ${l.etiqueta}` : ''}` });
  }
  return out;
}

export function sindromesCompatibles(h: HistoriaLocal, cat: CatalogoVista): SindromeCompatible[] {
  return sugerirSindromes(SINDROMES, textosClinicos(h, cat));
}
