// Guía de llenado: cómo preguntar, cómo explorar, valores normales, exámenes y síndromes.
// Sale de las notas de Semiología (seed/guias.csv). Se muestra en la app, nunca en el Word.

import { parsearCsv } from './csv';
import { CORTES_EDAD, NOMBRE_GRUPO, PEDIATRICOS, esAltura } from './contexto';
import type { ContextoClinico, CorteEdad, GrupoEdad } from './contexto';
import type { Gravedad } from './gravedad';
import { clave } from './valores';

export const TIPOS_GUIA = [
  'pregunta',
  'consejo',
  'alerta',
  'instrumento',
  'posicion',
  'tecnica',
  'buscar',
  'normal',
  'interpretacion',
  'indicacion',
  'lectura',
  'sindrome',
  'umbral',
] as const;
export type TipoGuia = (typeof TIPOS_GUIA)[number];

export interface EntradaGuia {
  ambito: string;
  tipo: TipoGuia;
  texto: string;
  archivo: string;
}

export const TITULO_TIPO: Record<TipoGuia, string> = {
  pregunta: 'Cómo preguntar',
  consejo: 'Cómo conducirlo',
  alerta: 'No olvidar',
  instrumento: 'Qué usar',
  posicion: 'Posición',
  tecnica: 'Cómo explorar',
  buscar: 'Qué buscar',
  normal: 'Valores normales',
  interpretacion: 'Cómo interpretar',
  indicacion: 'Cuándo pedirlo',
  lectura: 'Cómo leerlo',
  sindrome: 'Síndromes',
  umbral: 'Umbrales',
};

export const TITULO_AMBITO: Record<string, string> = {
  'efg.pa': 'Presión arterial',
  'efg.fc': 'Frecuencia cardíaca',
  'efg.fr': 'Frecuencia respiratoria',
  'efg.temperatura': 'Temperatura',
  'efg.sato2': 'Saturación de oxígeno',
  'efg.peso_talla': 'Peso, talla e índice de masa corporal',
  'efg.glasgow': 'Escala de Glasgow',
  'efg.estado': 'Estado general, nutricional y de hidratación',
  'efr.extremidades': 'Extremidades',
  'efr.edema': 'Edema',
  'efr.abdomen': 'Abdomen',
  'ea.tiempo': 'Tiempo de enfermedad',
  's.dolor': 'Dolor',
  's.dolor_toracico': 'Dolor torácico',
  's.dolor_abdominal': 'Dolor abdominal',
  's.cefalea': 'Cefalea',
  's.disnea': 'Disnea',
  's.tos': 'Tos y expectoración',
  's.edema': 'Edema',
  's.palpitaciones': 'Palpitaciones',
  's.sincope': 'Síncope',
  's.vomitos': 'Náuseas y vómitos',
  's.diarrea': 'Diarrea',
  's.ictericia': 'Ictericia',
  's.urinario': 'Síntomas urinarios',
  's.vertigo': 'Vértigo y mareo',
  's.fiebre': 'Fiebre',
  'ex.general': 'Exámenes en general',
  'ex.hemograma': 'Hemograma',
  'ex.orina': 'Examen de orina',
  'ex.glucosa': 'Glucosa',
  'ex.renal': 'Función renal',
  'ex.hepatico': 'Perfil hepático',
  'ex.electrolitos': 'Electrolitos',
  'ex.gasometria': 'Gasometría arterial',
  'ex.esputo': 'Esputo y baciloscopia',
  'ex.ppd': 'Prueba de tuberculina',
  'ex.espirometria': 'Espirometría',
  'ex.rx_torax': 'Radiografía de tórax',
  'ex.rx_abdomen': 'Radiografía de abdomen',
  'ex.ecografia': 'Ecografía',
  'ex.tomografia': 'Tomografía',
  'ex.ecg': 'Electrocardiograma',
  'ex.holter': 'Holter y prueba de esfuerzo',
  'ex.ecocardiograma': 'Ecocardiograma',
  'ex.enzimas': 'Enzimas cardíacas',
  'ex.endoscopia': 'Endoscopía',
  'ex.parasitologico': 'Parasitológico de heces',
  'ex.paracentesis': 'Paracentesis',
  'ex.toracocentesis': 'Toracocentesis',
  'ex.lcr': 'Líquido cefalorraquídeo',
};

export function parsearGuias(csv: string): EntradaGuia[] {
  const filas = parsearCsv(csv);
  const [cab, ...resto] = filas;
  if (!cab) return [];
  const i = (n: string) => cab.indexOf(n);
  return resto
    .map((f) => ({
      ambito: (f[i('ambito')] ?? '').trim(),
      tipo: (f[i('tipo')] ?? '').trim() as TipoGuia,
      texto: (f[i('texto')] ?? '').trim(),
      archivo: (f[i('archivo')] ?? '').trim(),
    }))
    .filter((g) => g.ambito && g.texto && (TIPOS_GUIA as readonly string[]).includes(g.tipo));
}

/** Ámbitos de la guía que corresponden a un campo del esquema. */
export function ambitosDeCampo(campoId: string): string[] {
  const directos: Record<string, string[]> = {
    'efg.pa_sistolica': ['efg.pa'],
    'efg.pa_diastolica': ['efg.pa'],
    'efg.fc': ['efg.fc'],
    'efg.fr': ['efg.fr'],
    'efg.temperatura': ['efg.temperatura'],
    'efg.sato2': ['efg.sato2'],
    'efg.fio2': ['efg.sato2'],
    'efg.peso': ['efg.peso_talla'],
    'efg.talla': ['efg.peso_talla'],
    'efg.imc': ['efg.peso_talla'],
    'efg.glasgow_ao': ['efg.glasgow'],
    'efg.glasgow_rv': ['efg.glasgow'],
    'efg.glasgow_rm': ['efg.glasgow'],
    'efg.glasgow_total': ['efg.glasgow'],
    'efg.eva': ['efg.eva'],
    'efg.llenado_capilar': ['efg.llenado_capilar'],
    'efg.conciencia': ['efg.conciencia'],
    'efg.estado_general': ['efg.estado'],
    'efg.estado_nutricional': ['efg.estado'],
    'efg.estado_hidratacion': ['efg.estado'],
    'ect.ectoscopia': ['ectoscopia'],
    'efr.msd': ['efr.extremidades'],
    'efr.msi': ['efr.extremidades'],
    'efr.mid': ['efr.extremidades'],
    'efr.mii': ['efr.extremidades'],
    'efr.edema_godet': ['efr.edema'],
    'efr.torax_mv': ['efr.torax_auscultacion'],
    'efr.torax_agregados': ['efr.torax_auscultacion'],
    'efr.soplo_levine': ['efr.cardiovascular'],
    'efr.abdomen_inspeccion': ['efr.abdomen_inspeccion', 'efr.abdomen'],
    'efr.abdomen_auscultacion': ['efr.abdomen_auscultacion', 'efr.abdomen'],
    'efr.abdomen_palpacion': ['efr.abdomen_palpacion', 'efr.abdomen'],
    'efr.abdomen_percusion': ['efr.abdomen_percusion', 'efr.abdomen'],
    'ea.tiempo_valor': ['ea.tiempo'],
    'ea.tiempo_unidad': ['ea.tiempo'],
    'dx.resumen': ['dx.resumen'],
    'dx.presuntivo': ['dx.presuntivo'],
    'dx.sindromico': ['dx.sindromico'],
    'dx.diferencial': ['dx.diferencial'],
    'tx.tratamiento': ['tx.tratamiento'],
    'plan.plan': ['plan.plan'],
    'evo.evolucion': ['evo.evolucion'],
  };
  return directos[campoId] ?? [campoId];
}

/**
 * Reparte los ámbitos entre los campos que se muestran: cada ámbito va solo con el primero que lo usa
 * (la guía de Glasgow una vez, no en sus cuatro campos).
 */
export function repartirAmbitos(campoIds: string[], yaUsados: Set<string> = new Set()): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const id of campoIds) {
    const propios = ambitosDeCampo(id).filter((a) => !yaUsados.has(a));
    propios.forEach((a) => yaUsados.add(a));
    out.set(id, propios);
  }
  return out;
}

/** Guía del síntoma guía: Lumbalgia → dolor, Disnea → disnea… */
export function ambitoDeSintoma(sintoma: string): string | null {
  const s = clave(sintoma);
  if (!s) return null;
  // El orden importa: "vómitos" contiene "tos", por eso la tos se busca como palabra inicial y después.
  const reglas: [RegExp, string][] = [
    [/cefalea/, 's.cefalea'],
    [/toracic|precord|pleurit/, 's.dolor_toracico'],
    [/dolor abdominal|epigastralgia|dolor hepatic|colico biliar|dolor pancreatic/, 's.dolor_abdominal'],
    [/algia|dolor|colico|claudicacion|odinofagia/, 's.dolor'],
    [/disnea|ortopnea|trepopnea/, 's.disnea'],
    [/vomito|nausea|hematemesis|regurgitacion/, 's.vomitos'],
    [/^tos\b|expectoracion|hemoptisis|sibilancia/, 's.tos'],
    [/edema|anasarca/, 's.edema'],
    [/palpitacion/, 's.palpitaciones'],
    [/sincope|lipotimia/, 's.sincope'],
    [/diarrea|estrenimiento|melena|enterorragia|^tenesmo$/, 's.diarrea'],
    [/ictericia|coluria|acolia/, 's.ictericia'],
    [/disuria|polaquiuria|hematuria|oliguria|anuria|poliuria|nicturia|urinari|miccional|vesical|orina/, 's.urinario'],
    [/vertigo|mareo/, 's.vertigo'],
    [/fiebre/, 's.fiebre'],
  ];
  return reglas.find(([re]) => re.test(s))?.[1] ?? null;
}

// ---------- Interpretación de signos vitales ----------

export const VARIABLES_UMBRAL: Record<string, string> = {
  'efg.pa_sistolica': 'pas',
  'efg.pa_diastolica': 'pad',
  'efg.fc': 'fc',
  'efg.fr': 'fr',
  'efg.temperatura': 'temp',
  'efg.sato2': 'sato2',
  'efg.imc': 'imc',
  'efg.glasgow_total': 'glasgow',
};

export interface Umbral {
  variable: string;
  min: number | null;
  max: number | null;
  etiqueta: string;
  /** Semáforo: 0 normal, 1 leve, 2 moderado, 3 grave. */
  nivel: Gravedad;
  /** Grupo de edad al que se aplica ('' = adulto). */
  grupo: GrupoEdad;
  /** '' = cualquier altitud; alta = 2 500 m o más; baja = menos de 2 500 m. */
  altitud: '' | 'alta' | 'baja';
  fuente: string;
}

const GRUPOS_VALIDOS: GrupoEdad[] = ['rn', 'lactante', 'transicional', 'preescolar', 'escolar', 'adolescente', '', 'mayor'];

/**
 * Texto de un umbral: `variable|mínimo|máximo|etiqueta|nivel|grupo|altitud` (vacío = sin límite, adulto o cualquier altitud).
 * Las líneas que empiezan con `#grupo|` definen cortes de edad y no son umbrales.
 */
export function umbrales(guias: EntradaGuia[]): Umbral[] {
  return guias
    .filter((g) => g.tipo === 'umbral' && !g.texto.startsWith('#'))
    .map((g) => {
      const [variable, min, max, etiqueta, nivel, grupo, altitud] = g.texto.split('|').map((x) => x.trim());
      const n = (x: string | undefined) => (x === undefined || x === '' || !Number.isFinite(Number(x)) ? null : Number(x));
      const g0 = Number(nivel);
      return {
        variable,
        min: n(min),
        max: n(max),
        etiqueta: etiqueta ?? '',
        nivel: ([0, 1, 2, 3].includes(g0) ? g0 : 1) as Gravedad,
        grupo: (GRUPOS_VALIDOS.includes((grupo ?? '') as GrupoEdad) ? (grupo ?? '') : '') as GrupoEdad,
        altitud: (altitud === 'alta' || altitud === 'baja' ? altitud : '') as Umbral['altitud'],
        fuente: g.archivo,
      };
    })
    .filter((u) => u.variable && u.etiqueta && (u.min !== null || u.max !== null));
}

/** Cortes de edad definidos en la guía con líneas `#grupo|clave|días desde|días hasta` (hasta vacío = sin límite). */
export function cortesDeGuia(guias: EntradaGuia[]): CorteEdad[] {
  const cortes = guias
    .filter((g) => g.tipo === 'umbral' && g.texto.startsWith('#grupo|'))
    .map((g) => {
      const [, grupo, desde, hasta] = g.texto.split('|').map((x) => x.trim());
      const clave = (grupo ?? '') as GrupoEdad;
      return { grupo: clave, nombre: NOMBRE_GRUPO[clave] ?? clave, desde: Number(desde || 0), hasta: hasta ? Number(hasta) : 200 * 366 };
    })
    .filter((c) => GRUPOS_VALIDOS.includes(c.grupo) && Number.isFinite(c.desde) && Number.isFinite(c.hasta));
  // Si la guía define cortes, mandan los de la guía (sin mezclar con los de respaldo).
  return cortes.length ? cortes : CORTES_EDAD;
}

// Sin rangos propios para su edad, a un niño solo se le aplican los del adulto que no dependen de la edad.
const APLICAN_A_NINOS = new Set(['temp', 'sato2', 'glasgow']);

/** Umbrales que valen para el contexto (edad y altitud). Sin contexto: adulto en altura. */
export function umbralesPara(variable: string, lista: Umbral[], ctx?: Pick<ContextoClinico, 'grupo' | 'altitud'>): Umbral[] {
  const grupo = ctx?.grupo ?? '';
  const altura = esAltura(ctx);
  const deVariable = lista.filter((u) => u.variable === variable);
  const porAltitud = (l: Umbral[]) => {
    const conAltitud = l.filter((u) => u.altitud === (altura ? 'alta' : 'baja'));
    return conAltitud.length ? conAltitud.concat(l.filter((u) => u.altitud === '')) : l.filter((u) => u.altitud === '');
  };
  const propios = deVariable.filter((u) => u.grupo === grupo);
  if (grupo !== '' && propios.length > 0) return porAltitud(propios);
  if (PEDIATRICOS.includes(grupo) && !APLICAN_A_NINOS.has(variable)) return [];
  return porAltitud(deVariable.filter((u) => u.grupo === ''));
}

/** Umbrales que corresponden a un valor (p. ej. fc 110 → Taquicardia, moderado). */
export function interpretarConNivel(
  campoId: string,
  valor: string,
  lista: Umbral[],
  ctx?: Pick<ContextoClinico, 'grupo' | 'altitud'>,
): { etiqueta: string; nivel: Gravedad }[] {
  const variable = VARIABLES_UMBRAL[campoId];
  const leido = Number(String(valor).replace(',', '.'));
  if (!variable || !valor || !Number.isFinite(leido)) return [];
  // Los umbrales usan la precisión clínica: temperatura e índice de masa corporal con un decimal, el resto enteros.
  const decimales = variable === 'temp' || variable === 'imc' ? 10 : 1;
  const n = Math.round(leido * decimales) / decimales;
  const vistos = new Set<string>();
  return umbralesPara(variable, lista, ctx)
    .filter((u) => (u.min === null || n >= u.min) && (u.max === null || n <= u.max))
    .filter((u) => !vistos.has(u.etiqueta) && !!vistos.add(u.etiqueta))
    .map((u) => ({ etiqueta: u.etiqueta, nivel: u.nivel }));
}

/** Etiquetas que corresponden a un valor (p. ej. fc 110 → "Taquicardia"). */
export function interpretar(campoId: string, valor: string, lista: Umbral[], ctx?: Pick<ContextoClinico, 'grupo' | 'altitud'>): string[] {
  return interpretarConNivel(campoId, valor, lista, ctx).map((u) => u.etiqueta);
}
