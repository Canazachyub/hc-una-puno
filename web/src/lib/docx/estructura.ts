// Estructura del Word, calcada de la plantilla PDF, con los nombres completos
// (la historia clínica se escribe sin abreviaturas: 02a · Historia clínica y anamnesis).
// Los campos que no aparezcan aquí se imprimen al final de su sección: agregar un campo no rompe nada.

import { CAMPOS_GINECO } from '../../../../shared/secciones';
import { partes } from '../../../../shared/valores';
import { unirFrases } from '../texto';

export interface Lector {
  /** Valor crudo. */
  v(id: string): string;
  /** Valor legible (fechas, multi, decimales con coma). */
  t(id: string): string;
}

type Etiqueta = string | ((l: Lector) => string);

export type Bloque =
  | { tipo: 'seccion'; titulo: string }
  | { tipo: 'subseccion'; titulo: string }
  | { tipo: 'subtitulo'; titulo: string; nivel?: 3 }
  | { tipo: 'campo'; id: string; label?: string; sufijo?: string }
  | { tipo: 'combinado'; label: Etiqueta; ids: string[]; armar: (l: Lector) => string }
  | { tipo: 'narrativa'; id: string; label?: string }
  | { tipo: 'parrafo'; label?: string; ids: string[]; armar: (l: Lector) => string }
  | { tipo: 'lista'; id: string; label: string; comillas?: boolean }
  | { tipo: 'vitales' }
  | { tipo: 'si'; cuando: (l: Lector) => boolean; bloques: Bloque[] }
  | { tipo: 'resto'; seccion: string };

const campos = (...ids: string[]): Bloque[] => ids.map((id) => ({ tipo: 'campo', id }) as Bloque);

const juntar = (l: Lector, ids: string[], sep = ', '): string =>
  ids
    .map((id) => l.t(id))
    .filter(Boolean)
    .join(sep);

const conUnidad = (valor: string, unidad: string): string => (valor ? `${valor} ${unidad}` : '');

/** "Sí, en tratamiento" + "desde 2019…" → "Sí, en tratamiento. Desde 2019…" */
const conDetalle = (l: Lector, id: string, detalle: string): string => {
  const d = l.t(detalle);
  const dd = d ? d[0].toUpperCase() + d.slice(1) : '';
  return [l.t(id), dd].filter(Boolean).join('. ');
};

export const ESTRUCTURA: Bloque[] = [
  { tipo: 'seccion', titulo: 'I. ECTOSCOPÍA' },
  { tipo: 'narrativa', id: 'ect.ectoscopia', label: '' },
  { tipo: 'resto', seccion: 'ectoscopia' },

  { tipo: 'seccion', titulo: 'II. ANAMNESIS' },
  { tipo: 'subseccion', titulo: '2.1. FILIACIÓN' },
  ...campos(
    'fil.apellidos',
    'fil.nombres',
    'fil.dni',
    'fil.edad',
    'fil.sexo',
    'fil.raza',
    'fil.lugar_nacimiento',
    'fil.fecha_nacimiento',
    'fil.lugar_procedencia',
    'fil.direccion',
    'fil.nacionalidad',
    'fil.estado_civil',
    'fil.grado_instruccion',
    'fil.ocupacion',
    'fil.idioma',
    'fil.religion',
    'fil.informante',
    'fil.persona_responsable',
    'fil.celular_responsable',
    'fil.fecha_ingreso',
    'fil.fecha_elaboracion',
    'fil.elaborado_por',
  ),
  { tipo: 'resto', seccion: 'filiacion' },

  { tipo: 'subseccion', titulo: '2.2. ENFERMEDAD ACTUAL' },
  {
    tipo: 'combinado',
    label: '1. Tiempo de enfermedad',
    ids: ['ea.tiempo_valor', 'ea.tiempo_unidad'],
    armar: (l) => {
      const v = l.t('ea.tiempo_valor');
      const u = l.v('ea.tiempo_unidad');
      if (!v) return '';
      const singular: Record<string, string> = { horas: 'hora', días: 'día', semanas: 'semana', meses: 'mes', años: 'año' };
      return `${v} ${v === '1' ? (singular[u] ?? u) : u}`.trim();
    },
  },
  { tipo: 'campo', id: 'ea.forma_inicio', label: '2. Forma de inicio' },
  { tipo: 'campo', id: 'ea.curso', label: '3. Curso' },
  { tipo: 'lista', id: 'ea.signos_sintomas', label: '4. Signos y síntomas principales', comillas: true },
  { tipo: 'campo', id: 'ea.sintoma_guia' },
  { tipo: 'narrativa', id: 'ea.relato_cronologico', label: '5. Relato cronológico' },
  { tipo: 'resto', seccion: 'enfermedad_actual' },

  { tipo: 'subseccion', titulo: '2.3. FUNCIONES BIOLÓGICAS' },
  ...campos('fb.apetito', 'fb.sed', 'fb.sueno'),
  {
    tipo: 'combinado',
    label: 'Heces',
    ids: ['fb.heces_frec', 'fb.heces_bristol', 'fb.heces_car'],
    armar: (l) =>
      [
        l.v('fb.heces_frec') ? `${l.t('fb.heces_frec')} ${l.v('fb.heces_frec') === '1' ? 'deposición' : 'deposiciones'} al día` : '',
        l.t('fb.heces_bristol').replace(/^Heces tipo/, 'tipo'),
        l.t('fb.heces_car').toLowerCase(),
      ]
        .filter(Boolean)
        .join(', '),
  },
  {
    tipo: 'combinado',
    label: 'Orina',
    ids: ['fb.orina_vol', 'fb.orina_car'],
    armar: (l) =>
      [l.v('fb.orina_vol') ? `volumen aproximado de ${l.t('fb.orina_vol')} en 24 horas` : '', l.t('fb.orina_car').toLowerCase()]
        .filter(Boolean)
        .join(', '),
  },
  {
    tipo: 'combinado',
    label: 'Variación de peso',
    ids: ['fb.peso_var', 'fb.peso_kg'],
    armar: (l) => conDetalle(l, 'fb.peso_var', 'fb.peso_kg'),
  },
  { tipo: 'resto', seccion: 'funciones_biologicas' },

  { tipo: 'subseccion', titulo: '2.4. ANTECEDENTES' },
  { tipo: 'subtitulo', titulo: '1. ANTECEDENTES PERSONALES' },
  { tipo: 'subtitulo', titulo: 'a. Vivienda', nivel: 3 },
  ...campos('apn.vivienda_material', 'apn.vivienda_servicios', 'apn.habitaciones_habitantes', 'apn.crianza_animales'),
  { tipo: 'campo', id: 'apn.residencias_anteriores', label: 'b. Residencias anteriores' },
  { tipo: 'subtitulo', titulo: 'c. Alimentación', nivel: 3 },
  ...campos('apn.alimentacion_menu', 'apn.nutriente_predominante', 'apn.intolerancia'),
  { tipo: 'campo', id: 'apn.vestimenta', label: 'd. Vestimenta' },
  { tipo: 'campo', id: 'apn.higiene', label: 'e. Higiene' },
  { tipo: 'campo', id: 'apn.deporte', label: 'f. Deporte y ejercicio' },
  { tipo: 'subtitulo', titulo: 'g. Hábitos nocivos', nivel: 3 },
  {
    tipo: 'combinado',
    label: 'Tabaquismo',
    ids: ['apn.tabaco', 'apn.tabaco_detalle'],
    armar: (l) => conDetalle(l, 'apn.tabaco', 'apn.tabaco_detalle'),
  },
  {
    tipo: 'combinado',
    label: 'Alcohol',
    ids: ['apn.alcohol', 'apn.alcohol_detalle'],
    armar: (l) => conDetalle(l, 'apn.alcohol', 'apn.alcohol_detalle'),
  },
  ...campos('apn.cafe_mate_te', 'apn.toxicos'),
  { tipo: 'resto', seccion: 'ant_personales' },

  { tipo: 'subtitulo', titulo: '2. FISIOLÓGICOS' },
  { tipo: 'subtitulo', titulo: 'Antecedentes prenatales', nivel: 3 },
  ...campos('afi.prenatales_patologias', 'afi.prenatales_control'),
  { tipo: 'subtitulo', titulo: 'Antecedentes posnatales', nivel: 3 },
  ...campos('afi.edad_gestacional'),
  {
    tipo: 'combinado',
    label: 'Parto',
    ids: ['afi.parto', 'afi.parto_lugar'],
    armar: (l) => juntar(l, ['afi.parto', 'afi.parto_lugar']),
  },
  ...campos('afi.lactancia_ablactancia'),
  { tipo: 'subtitulo', titulo: 'Desarrollo psicomotriz', nivel: 3 },
  ...campos('afi.primeros_pasos', 'afi.denticion', 'afi.primeras_palabras', 'afi.control_esfinteres'),
  { tipo: 'subtitulo', titulo: 'Vida sexual', nivel: 3 },
  { tipo: 'campo', id: 'afi.vida_sexual_inicio', label: 'Inicio', sufijo: 'años' },
  ...campos('afi.vida_sexual_riesgo'),
  {
    tipo: 'si',
    cuando: (l) => l.v('fil.sexo') !== 'Masculino',
    bloques: [
      { tipo: 'subtitulo', titulo: 'Antecedentes gineco-obstétricos', nivel: 3 },
      { tipo: 'campo', id: 'afi.menarquia', sufijo: 'años' },
      ...campos(...CAMPOS_GINECO.filter((id) => id !== 'afi.menarquia')),
    ],
  },
  ...campos('afi.inmunizaciones', 'afi.alergias', 'afi.transfusiones'),
  { tipo: 'resto', seccion: 'ant_fisiologicos' },

  { tipo: 'subtitulo', titulo: '3. PATOLÓGICOS' },
  {
    tipo: 'combinado',
    label: 'Hipertensión arterial',
    ids: ['apa.hta', 'apa.hta_detalle'],
    armar: (l) => conDetalle(l, 'apa.hta', 'apa.hta_detalle'),
  },
  {
    tipo: 'combinado',
    label: 'Diabetes mellitus',
    ids: ['apa.diabetes', 'apa.diabetes_detalle'],
    armar: (l) => conDetalle(l, 'apa.diabetes', 'apa.diabetes_detalle'),
  },
  { tipo: 'campo', id: 'apa.asma', label: 'Asma bronquial' },
  {
    tipo: 'combinado',
    label: 'Otras patologías',
    ids: ['apa.otras_patologias', 'apa.otras_detalle'],
    armar: (l) => conDetalle(l, 'apa.otras_patologias', 'apa.otras_detalle'),
  },
  ...campos('apa.medicamentos', 'apa.adherencia', 'apa.cirugias', 'apa.traumatismos', 'apa.duracion_enfermedad'),
  { tipo: 'resto', seccion: 'ant_patologicos' },

  { tipo: 'subtitulo', titulo: '4. FAMILIARES' },
  { tipo: 'narrativa', id: 'afa.familiares', label: '' },
  ...campos('afa.parentescos'),
  { tipo: 'resto', seccion: 'ant_familiares' },

  { tipo: 'seccion', titulo: 'III. EXAMEN FÍSICO' },
  { tipo: 'subseccion', titulo: 'A. EXAMEN FÍSICO GENERAL' },
  ...campos('efg.estado_general', 'efg.estado_nutricional', 'efg.estado_hidratacion', 'efg.conciencia'),
  { tipo: 'subtitulo', titulo: '1. FUNCIONES VITALES Y SOMATOMETRÍA' },
  { tipo: 'vitales' },
  { tipo: 'campo', id: 'efg.peso', label: 'Peso', sufijo: 'kg' },
  { tipo: 'campo', id: 'efg.talla', label: 'Talla', sufijo: 'm' },
  { tipo: 'campo', id: 'efg.imc', label: 'Índice de masa corporal', sufijo: 'kg/m²' },
  {
    tipo: 'combinado',
    label: 'Escala de coma de Glasgow',
    ids: ['efg.glasgow_ao', 'efg.glasgow_rv', 'efg.glasgow_rm', 'efg.glasgow_total'],
    armar: (l) => {
      const [ao, rv, rm] = ['efg.glasgow_ao', 'efg.glasgow_rv', 'efg.glasgow_rm'].map((id) => l.v(id));
      if (!ao && !rv && !rm) return '';
      const total = l.v('efg.glasgow_total');
      return `${total ? `${total}/15 ` : ''}(apertura ocular ${ao || '_'}, respuesta verbal ${rv || '_'}, respuesta motora ${rm || '_'})`;
    },
  },
  // Lleno: "Dolor: Intensidad 7/10 en la escala visual análoga". Vacío: la línea dice qué escala usar.
  {
    tipo: 'combinado',
    label: (l) => (l.v('efg.eva') ? 'Dolor' : 'Dolor (escala visual análoga)'),
    ids: ['efg.eva'],
    armar: (l) => l.t('efg.eva'),
  },
  ...campos('efg.llenado_capilar'),
  { tipo: 'resto', seccion: 'ef_general' },

  { tipo: 'subseccion', titulo: '2. EXAMEN FÍSICO POR REGIONES' },
  { tipo: 'narrativa', id: 'efr.cabeza', label: 'CABEZA' },
  { tipo: 'narrativa', id: 'efr.ojos', label: 'Ojos' },
  { tipo: 'narrativa', id: 'efr.nariz', label: 'Nariz' },
  { tipo: 'narrativa', id: 'efr.oidos', label: 'Oídos' },
  { tipo: 'narrativa', id: 'efr.boca', label: 'Boca' },
  { tipo: 'narrativa', id: 'efr.cuello', label: 'CUELLO' },
  { tipo: 'subtitulo', titulo: 'TÓRAX' },
  { tipo: 'narrativa', id: 'efr.torax_inspeccion', label: 'Inspección' },
  { tipo: 'narrativa', id: 'efr.torax_palpacion', label: 'Palpación' },
  { tipo: 'narrativa', id: 'efr.torax_percusion', label: 'Percusión' },
  {
    tipo: 'parrafo',
    label: 'Auscultación',
    ids: ['efr.torax_mv', 'efr.torax_agregados', 'efr.torax_auscultacion'],
    armar: (l) => {
      const texto = l.v('efr.torax_auscultacion');
      const mv = l.v('efr.torax_mv');
      const mvFrase = mv && !/murmullo/i.test(mv) ? `Murmullo vesicular ${mv.toLowerCase()}` : mv;
      // Si el texto libre ya describe el murmullo o los ruidos agregados, no se repiten.
      return unirFrases([
        /murmullo/i.test(texto) ? '' : mvFrase,
        ...(/agregad|crepitant|sibilanc|roncant|roncus|subcrepit|frote/i.test(texto) ? [] : partes(l.v('efr.torax_agregados'))),
        texto,
      ]);
    },
  },
  {
    tipo: 'parrafo',
    label: 'CARDIOVASCULAR',
    ids: ['efr.cardiovascular', 'efr.soplo_levine'],
    armar: (l) => unirFrases([l.v('efr.cardiovascular'), l.v('efr.soplo_levine')]),
  },
  { tipo: 'subtitulo', titulo: 'ABDOMEN' },
  { tipo: 'narrativa', id: 'efr.abdomen_inspeccion', label: 'Inspección' },
  { tipo: 'narrativa', id: 'efr.abdomen_auscultacion', label: 'Auscultación' },
  { tipo: 'narrativa', id: 'efr.abdomen_palpacion', label: 'Palpación' },
  { tipo: 'narrativa', id: 'efr.abdomen_percusion', label: 'Percusión' },
  { tipo: 'narrativa', id: 'efr.genitourinario', label: 'GENITOURINARIO' },
  { tipo: 'narrativa', id: 'efr.columna', label: 'COLUMNA VERTEBRAL' },
  { tipo: 'subtitulo', titulo: 'EXTREMIDADES' },
  { tipo: 'narrativa', id: 'efr.msd' },
  { tipo: 'narrativa', id: 'efr.msi' },
  { tipo: 'narrativa', id: 'efr.mid' },
  { tipo: 'narrativa', id: 'efr.mii' },
  {
    tipo: 'combinado',
    label: (l) => (l.v('efr.edema_godet') && l.v('efr.pulsos') ? 'Edema y pulsos' : l.v('efr.pulsos') ? 'Pulsos' : 'Edema'),
    ids: ['efr.edema_godet', 'efr.pulsos'],
    armar: (l) => juntar(l, ['efr.edema_godet', 'efr.pulsos'], '. '),
  },
  {
    tipo: 'parrafo',
    label: 'NEUROLÓGICO',
    ids: ['efr.neurologico', 'efr.fuerza', 'efr.rot'],
    armar: (l) => {
      const texto = l.v('efr.neurologico');
      return unirFrases([
        texto,
        /fuerza/i.test(texto) ? '' : l.v('efr.fuerza'),
        /reflejos osteotendinosos|\bROT\b/i.test(texto) ? '' : l.v('efr.rot'),
      ]);
    },
  },
  { tipo: 'resto', seccion: 'ef_regiones' },

  { tipo: 'seccion', titulo: 'IV. DIAGNÓSTICO' },
  { tipo: 'narrativa', id: 'dx.resumen', label: 'Resumen semiológico' },
  { tipo: 'lista', id: 'dx.presuntivo', label: 'PRESUNTIVO' },
  { tipo: 'lista', id: 'dx.sindromico', label: 'SINDRÓMICO' },
  { tipo: 'lista', id: 'dx.diferencial', label: 'DIFERENCIAL' },
  { tipo: 'resto', seccion: 'diagnostico' },

  { tipo: 'seccion', titulo: 'V. TRATAMIENTO' },
  { tipo: 'narrativa', id: 'tx.tratamiento', label: '' },
  { tipo: 'resto', seccion: 'tratamiento' },

  { tipo: 'seccion', titulo: 'VI. PLAN DE TRABAJO' },
  { tipo: 'narrativa', id: 'plan.plan', label: '' },
  { tipo: 'resto', seccion: 'plan_trabajo' },
  { tipo: 'subseccion', titulo: 'EXÁMENES COMPLEMENTARIOS' },
  { tipo: 'narrativa', id: 'exc.examenes', label: '' },
  { tipo: 'resto', seccion: 'examenes' },

  { tipo: 'seccion', titulo: 'VII. EVOLUCIÓN' },
  { tipo: 'narrativa', id: 'evo.evolucion', label: '' },
  { tipo: 'resto', seccion: 'evolucion' },
];

/** Signos vitales en pares, como la línea de la plantilla pero con nombres completos. */
export const VITALES = (l: Lector): { etiqueta: string; valor: string; id: string }[][] => {
  const pas = l.t('efg.pa_sistolica');
  const pad = l.t('efg.pa_diastolica');
  // Las frecuencias escritas completas no caben lado a lado: la respiratoria va en su propia fila.
  const filas = [
    [
      { id: 'efg.pa_sistolica', etiqueta: 'Presión arterial', valor: pas || pad ? `${pas || '__'}/${pad || '__'} mmHg` : '' },
      { id: 'efg.temperatura', etiqueta: 'Temperatura', valor: conUnidad(l.t('efg.temperatura'), '°C') },
    ],
    [
      { id: 'efg.fc', etiqueta: 'Frecuencia cardíaca', valor: conUnidad(l.t('efg.fc'), 'latidos por minuto') },
      { id: 'efg.sato2', etiqueta: 'Saturación de oxígeno', valor: conUnidad(l.t('efg.sato2'), '%') },
    ],
    [{ id: 'efg.fr', etiqueta: 'Frecuencia respiratoria', valor: conUnidad(l.t('efg.fr'), 'respiraciones por minuto') }],
  ];
  // La fracción inspirada solo se imprime si se registró.
  const fio2 = l.t('efg.fio2');
  if (fio2) filas.push([{ id: 'efg.fio2', etiqueta: 'Fracción inspirada de oxígeno', valor: fio2 }]);
  return filas;
};

export const IDS_VITALES = [
  'efg.pa_sistolica',
  'efg.pa_diastolica',
  'efg.temperatura',
  'efg.fr',
  'efg.fc',
  'efg.sato2',
  'efg.fio2',
];
