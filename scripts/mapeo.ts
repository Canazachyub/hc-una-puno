// Mapeo completo de la historia: campos, listas, valores normales, guía y umbrales en un JSON.
// Lo usa scripts/mapeo_excel.py para armar docs/HC_mapeo_completo.xlsx.
// Uso: npm run mapeo            (JSON + Excel)
//      tsx scripts/mapeo.ts --paquetes <carpeta>   (además, un paquete por área para redactar los .md)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { escalasDeCampo, filasAEsquema, filasAOpciones, indexarListas, valorNormal } from '../shared/catalogo';
import { parsearCsv } from '../shared/csv';
import { TITULO_AMBITO, TITULO_TIPO, VARIABLES_UMBRAL, ambitoDeSintoma, ambitosDeCampo, parsearGuias, umbrales } from '../shared/guias';
import { ABREVIATURAS } from '../shared/abreviaturas';
import { GRAVEDAD, NOMBRE_GRAVEDAD, gravedadDe } from '../shared/gravedad';
import { SECCIONES } from '../shared/secciones';
import type { Campo } from '../shared/types';

const RAIZ = join(import.meta.dirname, '..');
const leer = (f: string) => readFileSync(join(RAIZ, f), 'utf8');

const esquema = filasAEsquema(parsearCsv(leer('seed/esquema.csv')));
const opciones = filasAOpciones(parsearCsv(leer('seed/opciones.csv')));
const listas = indexarListas(opciones);
const guias = parsearGuias(leer('seed/guias.csv'));

/** Áreas del mapeo: cada una tiene su documento .md. Cada lista pertenece a una sola área. */
export const AREAS = [
  {
    id: '01',
    archivo: '01-anamnesis-filiacion-y-antecedentes.md',
    titulo: 'Filiación, funciones biológicas y antecedentes',
    secciones: ['filiacion', 'funciones_biologicas', 'ant_personales', 'ant_fisiologicos', 'ant_patologicos', 'ant_familiares'],
    campos: [] as string[],
    listas: ['bristol', 'f_familiares'],
    ambitos: [] as string[],
  },
  {
    id: '02',
    archivo: '02-enfermedad-actual-y-sintomas.md',
    titulo: 'Enfermedad actual, síntomas y semiología del dolor',
    secciones: ['enfermedad_actual'],
    campos: [],
    listas: ['sintoma', 'localizacion', 'dolor_caracter', 'patron_sintoma', 'agravante', 'atenuante', 'respuesta_tto', 'f_relato'],
    ambitos: ['s.'],
  },
  {
    id: '03',
    archivo: '03-ectoscopia-y-examen-general.md',
    titulo: 'Ectoscopía, examen físico general, signos vitales y escalas generales',
    secciones: ['ectoscopia', 'ef_general'],
    campos: [],
    listas: ['deshidratacion', 'cruces'],
    ambitos: [],
  },
  {
    id: '04',
    archivo: '04-cabeza-y-cuello.md',
    titulo: 'Examen regional: cabeza, ojos, nariz, oídos, boca y cuello',
    secciones: [],
    campos: ['efr.cabeza', 'efr.ojos', 'efr.nariz', 'efr.oidos', 'efr.boca', 'efr.cuello'],
    listas: [],
    ambitos: [],
  },
  {
    id: '05',
    archivo: '05-torax-y-cardiovascular.md',
    titulo: 'Examen regional: tórax, pulmones y aparato cardiovascular',
    secciones: [],
    campos: ['efr.torax_inspeccion', 'efr.torax_palpacion', 'efr.torax_percusion', 'efr.torax_mv', 'efr.torax_agregados', 'efr.torax_auscultacion', 'efr.cardiovascular', 'efr.soplo_levine', 'efr.pulsos'],
    listas: ['levine', 'pulsos'],
    ambitos: [],
  },
  {
    id: '06',
    archivo: '06-abdomen-extremidades-y-neurologico.md',
    titulo: 'Examen regional: abdomen, genitourinario, columna, extremidades y neurológico',
    secciones: [],
    campos: ['efr.abdomen_inspeccion', 'efr.abdomen_auscultacion', 'efr.abdomen_percusion', 'efr.abdomen_palpacion', 'efr.genitourinario', 'efr.columna', 'efr.msd', 'efr.msi', 'efr.mid', 'efr.mii', 'efr.edema_godet', 'efr.fuerza', 'efr.rot', 'efr.neurologico'],
    listas: ['godet', 'fuerza', 'rot'],
    ambitos: [],
  },
  {
    id: '07',
    archivo: '07-diagnostico-tratamiento-y-evolucion.md',
    titulo: 'Diagnóstico, síndromes, tratamiento, plan de trabajo y evolución',
    secciones: ['diagnostico', 'tratamiento', 'plan_trabajo', 'evolucion'],
    campos: [],
    listas: ['nyha', 'mmrc', 'ecog'],
    ambitos: [],
  },
  {
    id: '08',
    archivo: '08-examenes-auxiliares.md',
    titulo: 'Exámenes auxiliares: indicaciones, valores normales e interpretación',
    secciones: ['examenes'],
    campos: [],
    listas: [],
    ambitos: ['ex.'],
  },
];

const TIPO_CAMPO: Record<string, string> = {
  texto: 'Texto corto',
  texto_largo: 'Texto largo',
  numero: 'Número',
  fecha: 'Fecha',
  opcion: 'Una opción',
  opcion_otro: 'Una opción u otra escrita',
  multi: 'Varias opciones',
  escala: 'Escala',
  lista: 'Lista de puntos',
  narrativa: 'Párrafo redactado',
  calculado: 'Calculado',
};

const tituloSeccion = (id: string) => SECCIONES.find((s) => s.id === id)?.titulo ?? id;
const etiquetaCampo = (id: string) => esquema.find((c) => c.campo_id === id)?.label ?? id;
const tituloAmbito = (a: string) => TITULO_AMBITO[a] ?? (esquema.some((c) => c.campo_id === a) ? etiquetaCampo(a) : SECCIONES.some((s) => s.id === a) ? tituloSeccion(a) : a);

const areaDeCampo = (c: Campo) => AREAS.find((a) => a.campos.includes(c.campo_id)) ?? AREAS.find((a) => a.secciones.includes(c.seccion));

// Lista → campos que la usan (propia o como escala permitida).
const usos = new Map<string, string[]>();
for (const c of esquema) {
  const ids = new Set([...(c.lista_id ? [c.lista_id] : []), ...escalasDeCampo(c, listas)]);
  for (const id of ids) usos.set(id, [...(usos.get(id) ?? []), c.campo_id]);
}

const areaDeLista = (listaId: string) =>
  AREAS.find((a) => a.listas.includes(listaId)) ??
  (() => {
    const primero = esquema.find((c) => c.lista_id === listaId);
    return primero ? areaDeCampo(primero) : undefined;
  })();

const campos = esquema.map((c) => ({
  area: areaDeCampo(c)?.id ?? '',
  seccion: c.seccion,
  seccion_titulo: tituloSeccion(c.seccion),
  orden: c.orden,
  campo_id: c.campo_id,
  etiqueta: c.label,
  tipo: c.tipo,
  tipo_legible: TIPO_CAMPO[c.tipo] ?? c.tipo,
  obligatorio: c.obligatorio,
  lista_id: c.lista_id,
  lista_nombre: c.lista_id ? (listas.get(c.lista_id)?.[0]?.nombre ?? '') : '',
  valor_normal_codigo: c.valor_normal,
  valor_normal: valorNormal(c, listas),
  escalas: escalasDeCampo(c, listas).map((id) => ({ id, nombre: listas.get(id)?.[0]?.nombre ?? id })),
  reglas: c.reglas,
  ambitos_guia: ambitosDeCampo(c.campo_id),
}));

const listasJson = [...listas.entries()].map(([id, ops]) => ({
  area: areaDeLista(id)?.id ?? '',
  lista_id: id,
  nombre: ops[0]?.nombre ?? id,
  tipo: ops[0]?.tipo ?? '',
  usada_en: usos.get(id) ?? [],
  semaforo: !!GRAVEDAD[id],
  opciones: ops.map((o) => {
    const g = gravedadDe(id, o.valor);
    return { orden: o.orden, valor: o.valor, etiqueta: o.etiqueta, formato_salida: o.formato_salida, gravedad: g, gravedad_nombre: g === null ? '' : NOMBRE_GRAVEDAD[g] };
  }),
}));

// Guía → área: por campo, por sección o por prefijo.
const areaDeAmbito = (a: string) => {
  const porPrefijo = AREAS.find((x) => x.ambitos.some((p) => a.startsWith(p)));
  if (porPrefijo) return porPrefijo.id;
  const seccion = AREAS.find((x) => x.secciones.includes(a));
  if (seccion) return seccion.id;
  const campo = campos.find((c) => c.ambitos_guia.includes(a) || c.campo_id === a);
  return campo?.area ?? '';
};

const guiasJson = guias.map((g) => ({
  area: areaDeAmbito(g.ambito),
  ambito: g.ambito,
  ambito_titulo: tituloAmbito(g.ambito),
  tipo: g.tipo,
  tipo_titulo: TITULO_TIPO[g.tipo],
  texto: g.texto,
  archivo: g.archivo,
}));

const CAMPO_DE_VARIABLE = Object.fromEntries(Object.entries(VARIABLES_UMBRAL).map(([campo, v]) => [v, campo]));
const umbralesJson = umbrales(guias).map((u) => ({
  area: '03',
  variable: u.variable,
  campo_id: CAMPO_DE_VARIABLE[u.variable] ?? '',
  campo: etiquetaCampo(CAMPO_DE_VARIABLE[u.variable] ?? u.variable),
  minimo: u.min,
  maximo: u.max,
  interpretacion: u.etiqueta,
  gravedad: u.nivel,
  gravedad_nombre: NOMBRE_GRAVEDAD[u.nivel],
  archivo:
    guias.find((g) => {
      const p = g.texto.split('|');
      return g.tipo === 'umbral' && p[0] === u.variable && p[3] === u.etiqueta;
    })?.archivo ?? '',
}));

// Definiciones buscadas en las notas (se muestran en la app).
const definiciones = parsearCsv(leer('seed/definiciones.csv'))
  .slice(1)
  .filter((f) => f[0] && f[2])
  .map(([lista_id, valor, definicion, fuente]) => ({ lista_id, valor, definicion, fuente: fuente ?? '' }));

// Revisión con las notas: la sección "Discrepancias y pendientes" de cada documento.
// Lo ya corregido en la app (actualizar al corregir más).
const CORREGIDO: Record<string, string> = {
  '02-4': 'Corregido en parte',
  '02-11': 'Corregido',
  '02-13': 'Corregido',
  '03-1': 'Corregido',
  '03-6': 'Corregido',
  '03-7': 'Corregido',
  '03-8': 'Corregido en parte',
  '03-9': 'Corregido',
  '03-10': 'Corregido',
  '03-13': 'Corregido en parte',
  '06-3': 'Corregido',
};
const CORREGIDO_SI_DICE: [string, string, string][] = [
  ['04', 'deshidratacion', 'Corregido'],
  ['04', 'gasa', 'Corregido en parte'],
  ['08', 'cuadradito', 'Corregido en parte'],
];
const limpiar = (md: string) => md.replace(/\*\*|`/g, '').replace(/\s+/g, ' ').trim();
const revision = AREAS.flatMap((a) => {
  const ruta = join(RAIZ, 'docs', 'mapeo', a.archivo);
  if (!existsSync(ruta)) return [];
  const texto = readFileSync(ruta, 'utf8');
  const inicio = texto.indexOf('## Discrepancias');
  if (inicio < 0) return [];
  let seccion = texto.slice(inicio);
  const corte = seccion.indexOf('\n## ', 5);
  if (corte > 0) seccion = seccion.slice(0, corte);
  let tema = '';
  const items: { tema: string; texto: string }[] = [];
  for (const linea of seccion.split(/\r?\n/).slice(1)) {
    if (linea.startsWith('###')) tema = limpiar(linea.replace(/^#+/, ''));
    else if (/^(\d+\.|-|\*) /.test(linea)) items.push({ tema, texto: linea.replace(/^(\d+\.|-|\*) /, '') });
    else if (items.length && linea.trim() && !linea.startsWith('>')) items[items.length - 1].texto += ` ${linea.trim()}`;
  }
  return items.map((it, k) => {
    const n = k + 1;
    let estado = CORREGIDO[`${a.id}-${n}`] ?? 'Pendiente';
    for (const [area, clave, valor] of CORREGIDO_SI_DICE) if (area === a.id && it.texto.toLowerCase().includes(clave)) estado = valor;
    return { area: a.id, area_titulo: a.titulo, documento: a.archivo, n, tema: it.tema, texto: limpiar(it.texto), estado };
  });
});

const mapeo = {
  generado: new Date().toISOString().slice(0, 10),
  areas: AREAS.map(({ id, archivo, titulo }) => ({ id, archivo, titulo })),
  secciones: SECCIONES.map((s) => ({ id: s.id, titulo: s.titulo })),
  campos,
  listas: listasJson,
  guias: guiasJson,
  umbrales: umbralesJson,
  definiciones,
  revision,
  sintomas: (listas.get('sintoma') ?? []).map((o) => {
    const ambito = ambitoDeSintoma(o.valor);
    return { valor: o.valor, definicion: o.etiqueta, ambito: ambito ?? '', guia: ambito ? tituloAmbito(ambito) : '' };
  }),
  abreviaturas: ABREVIATURAS.map((a) => ({ sigla: a.sigla, completo: a.completo.replace('$1', 'N') })),
};

const destino = join(RAIZ, 'docs', 'mapeo', 'datos');
mkdirSync(destino, { recursive: true });
writeFileSync(join(destino, 'mapeo.json'), JSON.stringify(mapeo, null, 2));
// La app muestra la revisión en Consulta.
writeFileSync(join(destino, 'revision.json'), JSON.stringify(revision, null, 1));
console.log(`mapeo.json: ${campos.length} campos, ${listasJson.length} listas, ${guiasJson.length} entradas de guía, ${umbralesJson.length} umbrales, ${definiciones.length} definiciones, ${revision.length} puntos de revisión`);

const i = process.argv.indexOf('--paquetes');
if (i > 0 && process.argv[i + 1]) {
  const dir = process.argv[i + 1];
  mkdirSync(dir, { recursive: true });
  for (const a of AREAS) {
    const paquete = {
      area: { id: a.id, archivo: a.archivo, titulo: a.titulo },
      secciones: mapeo.secciones.filter((s) => campos.some((c) => c.area === a.id && c.seccion === s.id)),
      campos: campos.filter((c) => c.area === a.id),
      listas: listasJson.filter((l) => l.area === a.id),
      listas_de_otras_areas_que_usa: listasJson
        .filter((l) => l.area !== a.id && l.usada_en.some((id) => campos.find((c) => c.campo_id === id)?.area === a.id))
        .map((l) => ({ lista_id: l.lista_id, nombre: l.nombre, area: l.area })),
      guias: guiasJson.filter((g) => g.area === a.id),
      umbrales: a.id === '03' ? umbralesJson : [],
    };
    writeFileSync(join(dir, `area-${a.id}.json`), JSON.stringify(paquete, null, 2));
    console.log(`area-${a.id}: ${paquete.campos.length} campos, ${paquete.listas.length} listas, ${paquete.guias.length} guías`);
  }
}
