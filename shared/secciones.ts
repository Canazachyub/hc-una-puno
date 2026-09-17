// Orden y títulos de las secciones, tal como aparecen en la plantilla PDF.

export interface SeccionInfo {
  id: string;
  titulo: string;
  corto: string;
}

export const SECCIONES: SeccionInfo[] = [
  { id: 'ectoscopia', titulo: 'I. Ectoscopía', corto: 'Ectoscopía' },
  { id: 'filiacion', titulo: '2.1 Filiación', corto: 'Filiación' },
  { id: 'enfermedad_actual', titulo: '2.2 Enfermedad actual', corto: 'Enfermedad actual' },
  { id: 'funciones_biologicas', titulo: '2.3 Funciones biológicas', corto: 'Funciones biológicas' },
  { id: 'ant_personales', titulo: '2.4.1 Antecedentes personales', corto: 'Ant. personales' },
  { id: 'ant_fisiologicos', titulo: '2.4.2 Antecedentes fisiológicos', corto: 'Ant. fisiológicos' },
  { id: 'ant_patologicos', titulo: '2.4.3 Antecedentes patológicos', corto: 'Ant. patológicos' },
  { id: 'ant_familiares', titulo: '2.4.4 Antecedentes familiares', corto: 'Ant. familiares' },
  { id: 'ef_general', titulo: '3.A.1 Examen físico general', corto: 'Examen general' },
  { id: 'ef_regiones', titulo: '3.A.2 Examen físico por regiones', corto: 'Examen por regiones' },
  { id: 'diagnostico', titulo: 'IV. Diagnóstico', corto: 'Diagnóstico' },
  { id: 'tratamiento', titulo: 'V. Tratamiento', corto: 'Tratamiento' },
  { id: 'plan_trabajo', titulo: 'VI. Plan de trabajo', corto: 'Plan de trabajo' },
  { id: 'examenes', titulo: 'Exámenes complementarios', corto: 'Exámenes' },
  { id: 'evolucion', titulo: 'VII. Evolución', corto: 'Evolución' },
];

/** Subtítulos que se muestran antes de un campo, en el formulario y en el Word. */
export const SUBTITULOS: Record<string, string> = {
  'fb.heces_frec': 'Heces',
  'fb.orina_vol': 'Orina',
  'fb.peso_var': 'Peso',
  'apn.vivienda_material': 'a. Vivienda',
  'apn.residencias_anteriores': 'b. Residencias anteriores',
  'apn.alimentacion_menu': 'c. Alimentación',
  'apn.vestimenta': 'd. Vestimenta, higiene y deporte',
  'apn.tabaco': 'g. Hábitos nocivos',
  'afi.prenatales_patologias': 'Antecedentes prenatales',
  'afi.edad_gestacional': 'Antecedentes posnatales',
  'afi.primeros_pasos': 'Desarrollo psicomotriz',
  'afi.vida_sexual_inicio': 'Vida sexual',
  'afi.menarquia': 'Antecedentes gineco-obstétricos',
  'afi.inmunizaciones': 'Otros',
  'efg.estado_general': 'Impresión general',
  'efg.pa_sistolica': '1. Funciones vitales y somatometría',
  'efg.glasgow_ao': 'Escala de Glasgow',
  'efr.cabeza': 'Cabeza',
  'efr.cuello': 'Cuello',
  'efr.torax_inspeccion': 'Tórax',
  'efr.cardiovascular': 'Cardiovascular',
  'efr.abdomen_inspeccion': 'Abdomen',
  'efr.genitourinario': 'Genitourinario',
  'efr.columna': 'Columna vertebral',
  'efr.msd': 'Extremidades',
  'efr.fuerza': 'Neurológico',
};

/** Campos que solo aplican a pacientes de sexo femenino. */
export const CAMPOS_GINECO = [
  'afi.menarquia',
  'afi.regimen_catamenial',
  'afi.caracteristicas_catamenial',
  'afi.fur',
  'afi.fup',
  'afi.formula_obstetrica',
  'afi.anticonceptivos',
  'afi.menopausia',
  'afi.papanicolau',
  // Plantilla detallada
  'afi.dismenorrea',
  'afi.dispareunia',
  'afi.leucorrea',
  'afi.gestaciones',
  'afi.partos_termino',
  'afi.partos_prematuros',
  'afi.abortos',
  'afi.hijos_vivos',
  'afi.preeclampsia_eclampsia',
  'afi.lactancia_hijos',
  'afi.examen_ginecologico',
];

/** Campos que no se muestran como editables (los fija la clave). */
export const CAMPOS_CLAVE = ['fil.dni'];

export function esVisible(campoId: string, valores: Record<string, string>): boolean {
  if (CAMPOS_GINECO.includes(campoId)) return valores['fil.sexo'] !== 'Masculino';
  return true;
}

/** Orden propio de cada plantilla (en el documento de la doctora, los exámenes van antes del diagnóstico). */
export const ORDEN_PLANTILLA: Record<string, string[]> = {
  ochoa: [
    'ectoscopia', 'filiacion', 'enfermedad_actual', 'funciones_biologicas', 'ant_personales', 'ant_fisiologicos',
    'ant_patologicos', 'ant_familiares', 'ef_general', 'ef_regiones', 'examenes', 'diagnostico', 'tratamiento',
    'evolucion', 'plan_trabajo',
  ],
};

export function ordenSeccion(id: string, plantilla = ''): number {
  const propio = ORDEN_PLANTILLA[plantilla];
  if (propio) {
    const j = propio.indexOf(id);
    if (j >= 0) return j;
  }
  const i = SECCIONES.findIndex((s) => s.id === id);
  return i < 0 ? 999 : i;
}

/** Títulos propios de cada plantilla; lo que no esté aquí usa el de SECCIONES. */
export const TITULOS_PLANTILLA: Record<string, Record<string, SeccionInfo>> = {
  ochoa: {
    filiacion: { id: 'filiacion', titulo: 'II. Anamnesis · 2.1 Filiación', corto: 'Filiación' },
    enfermedad_actual: { id: 'enfermedad_actual', titulo: '2.2 Enfermedad actual', corto: 'Enfermedad actual' },
    funciones_biologicas: { id: 'funciones_biologicas', titulo: '2.3 Funciones biológicas', corto: 'Funciones biológicas' },
    ant_personales: { id: 'ant_personales', titulo: '2.4 Antecedentes personales', corto: 'Ant. personales' },
    ant_fisiologicos: { id: 'ant_fisiologicos', titulo: 'Antecedentes fisiológicos', corto: 'Ant. fisiológicos' },
    ant_patologicos: { id: 'ant_patologicos', titulo: 'Antecedentes patológicos', corto: 'Ant. patológicos' },
    ant_familiares: { id: 'ant_familiares', titulo: 'Antecedentes familiares', corto: 'Ant. familiares' },
    ef_general: { id: 'ef_general', titulo: 'III. Examen clínico · 3.1 Examen general', corto: 'Examen general' },
    ef_regiones: { id: 'ef_regiones', titulo: '3.2 Examen regional', corto: 'Examen regional' },
    examenes: { id: 'examenes', titulo: 'IV. Exámenes complementarios', corto: 'Exámenes' },
    diagnostico: { id: 'diagnostico', titulo: 'Impresión diagnóstica', corto: 'Diagnóstico' },
    tratamiento: { id: 'tratamiento', titulo: 'Tratamiento', corto: 'Tratamiento' },
    plan_trabajo: { id: 'plan_trabajo', titulo: 'Plan de trabajo', corto: 'Plan de trabajo' },
    evolucion: { id: 'evolucion', titulo: 'Epicrisis y evolución', corto: 'Evolución' },
  },
};

export function infoSeccion(id: string, plantilla = ''): SeccionInfo {
  return TITULOS_PLANTILLA[plantilla]?.[id] ?? SECCIONES.find((s) => s.id === id) ?? { id, titulo: id, corto: id };
}
