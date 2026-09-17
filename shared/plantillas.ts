// Plantillas de historia clínica. Los datos se guardan por campo, así que una misma historia
// puede verse y exportarse con cualquiera: la plantilla solo decide qué campos se muestran,
// con qué nombre y en qué orden salen en el Word.

export interface Plantilla {
  id: string;
  /** Nombre corto para elegirla. */
  nombre: string;
  /** De dónde sale el formato. */
  fuente: string;
  descripcion: string;
}

export const PLANTILLAS: Plantilla[] = [
  {
    id: 'ochoa',
    nombre: 'Historia clínica detallada',
    fuente: 'HISTORIA CLINICA Dra Ochoa.docx',
    descripcion: 'La de la doctora Ochoa: examen físico desglosado dato por dato, exámenes auxiliares y los seis diagnósticos.',
  },
  {
    id: 'fmh',
    nombre: 'Historia clínica de Clínica Médica',
    fuente: 'plantilla-historia-clinica.pdf',
    descripcion: 'La de Clínica Médica I e Infectología: examen físico por regiones, más corta.',
  },
];

export const PLANTILLA_POR_DEFECTO = 'ochoa';

export function plantillaValida(id: string): string {
  return PLANTILLAS.some((p) => p.id === id) ? id : PLANTILLA_POR_DEFECTO;
}

/**
 * La plantilla de una historia ya guardada. Las de antes de que existieran dos plantillas
 * no tienen el dato: son de la de Clínica Médica, que era la única.
 */
export function plantillaGuardada(valor: string | undefined): string {
  return valor ? plantillaValida(valor) : 'fmh';
}

export function infoPlantilla(id: string): Plantilla {
  return PLANTILLAS.find((p) => p.id === id) ?? PLANTILLAS[0];
}
