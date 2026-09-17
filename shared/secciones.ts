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
];

/** Campos que no se muestran como editables (los fija la clave). */
export const CAMPOS_CLAVE = ['fil.dni'];

export function esVisible(campoId: string, valores: Record<string, string>): boolean {
  if (CAMPOS_GINECO.includes(campoId)) return valores['fil.sexo'] !== 'Masculino';
  return true;
}

export function ordenSeccion(id: string): number {
  const i = SECCIONES.findIndex((s) => s.id === id);
  return i < 0 ? 999 : i;
}

export function infoSeccion(id: string): SeccionInfo {
  return SECCIONES.find((s) => s.id === id) ?? { id, titulo: id, corto: id };
}
