// La historia clínica se escribe sin abreviaturas: "si se usan, que sean de comprensión general;
// lo más seguro es evitarlas por completo" (02a · Historia clínica y anamnesis).
// Se conservan las unidades de medida (mmHg, °C, kg, cm, mg, ml) y los nombres de escalas (Glasgow, NYHA, Levine).

export interface Abreviatura {
  sigla: string;
  re: RegExp;
  completo: string;
}

// \b no reconoce tildes; se usan límites explícitos.
const L = '(?<![\\p{L}\\p{N}])';
const R = '(?![\\p{L}\\p{N}])';
const sigla = (s: string, flags = 'gu') => new RegExp(`${L}(?:${s})${R}`, flags);
// El punto de la abreviatura se quita solo si la oración sigue ("aprox. 3 días"); si cierra la oración, se queda.
// Estas reglas no llevan la bandera i: con ella \p{Ll} también aceptaría mayúsculas.
const PUNTO = '(?:\\.(?=\\s*[\\p{Ll}\\p{N}]))?';

export const ABREVIATURAS: Abreviatura[] = [
  { sigla: 'c/ h', re: new RegExp(`${L}[cC]\\/\\s?(\\d+)\\s?(?:[hH](?:[sS]|[rR][sS])?|horas)${R}${PUNTO}`, 'gu'), completo: 'cada $1 horas' },
  { sigla: 'MMII', re: sigla('MMII'), completo: 'miembros inferiores' },
  { sigla: 'MMSS', re: sigla('MMSS'), completo: 'miembros superiores' },
  { sigla: 'MSD', re: sigla('MSD'), completo: 'miembro superior derecho' },
  { sigla: 'MSI', re: sigla('MSI'), completo: 'miembro superior izquierdo' },
  { sigla: 'MID', re: sigla('MID'), completo: 'miembro inferior derecho' },
  { sigla: 'MII', re: sigla('MII'), completo: 'miembro inferior izquierdo' },
  { sigla: 'HTA', re: sigla('HTA'), completo: 'hipertensión arterial' },
  { sigla: 'DM2', re: sigla('DM ?2'), completo: 'diabetes mellitus tipo 2' },
  { sigla: 'DM', re: sigla('DM'), completo: 'diabetes mellitus' },
  { sigla: 'PA', re: sigla('PA'), completo: 'presión arterial' },
  { sigla: 'FC', re: sigla('FC'), completo: 'frecuencia cardíaca' },
  { sigla: 'FR', re: sigla('FR'), completo: 'frecuencia respiratoria' },
  { sigla: 'T°', re: /(?<![\p{L}\p{N}])T°(?![\p{L}\p{N}])/gu, completo: 'temperatura' },
  { sigla: 'SatO2', re: sigla('Sat ?O2|SO2', 'giu'), completo: 'saturación de oxígeno' },
  { sigla: 'FiO2', re: sigla('FiO2', 'giu'), completo: 'fracción inspirada de oxígeno' },
  { sigla: 'IMC', re: sigla('IMC'), completo: 'índice de masa corporal' },
  { sigla: 'EVA', re: sigla('EVA'), completo: 'escala visual análoga' },
  { sigla: 'ROT', re: sigla('ROT'), completo: 'reflejos osteotendinosos' },
  { sigla: 'MV', re: sigla('MV'), completo: 'murmullo vesicular' },
  { sigla: 'RHA', re: sigla('RHA'), completo: 'ruidos hidroaéreos' },
  { sigla: 'RCR', re: sigla('RCRR?'), completo: 'ruidos cardíacos rítmicos' },
  { sigla: 'LOTEP', re: sigla('LOTEP'), completo: 'lúcido, orientado en tiempo, espacio y persona' },
  { sigla: 'AREG', re: sigla('AREG'), completo: 'aparente regular estado general' },
  { sigla: 'AREN', re: sigla('AREN'), completo: 'aparente regular estado nutricional' },
  { sigla: 'AREH', re: sigla('AREH'), completo: 'aparente regular estado de hidratación' },
  { sigla: 'ABEG', re: sigla('ABEG'), completo: 'aparente buen estado general' },
  { sigla: 'AMEG', re: sigla('AMEG'), completo: 'aparente mal estado general' },
  { sigla: 'VO', re: sigla('VO'), completo: 'vía oral' },
  { sigla: 'EV', re: sigla('EV'), completo: 'vía endovenosa' },
  { sigla: 'TBC', re: sigla('TBC'), completo: 'tuberculosis' },
  { sigla: 'ITU', re: sigla('ITU'), completo: 'infección del tracto urinario' },
  { sigla: 'FUR', re: sigla('FUR'), completo: 'fecha de última regla' },
  { sigla: 'FUP', re: sigla('FUP'), completo: 'fecha de último parto' },
  { sigla: 'PAP', re: sigla('PAP'), completo: 'Papanicolaou' },
  { sigla: 'Hb', re: sigla('Hb'), completo: 'hemoglobina' },
  { sigla: 'Hto', re: sigla('Hto'), completo: 'hematocrito' },
  { sigla: 'ECG', re: sigla('ECG|EKG'), completo: 'electrocardiograma' },
  { sigla: 'Rx', re: sigla('Rx', 'giu'), completo: 'radiografía' },
  { sigla: 'TAC', re: sigla('TAC|TEM'), completo: 'tomografía' },
  { sigla: 'Pte', re: new RegExp(`${L}(?:[pP]c?te|PC?TE)${R}${PUNTO}|${L}[pP]ac\\.(?=\\s*[\\p{Ll}\\p{N}])`, 'gu'), completo: 'paciente' },
  { sigla: 'hrs', re: new RegExp(`${L}(?:hrs?|HRS?)${R}${PUNTO}`, 'gu'), completo: 'horas' },
  { sigla: 'aprox.', re: new RegExp(`${L}(?:[aA]prox|APROX)${R}${PUNTO}`, 'gu'), completo: 'aproximadamente' },
];

/**
 * Diminutivos coloquiales que no van en la historia clínica. Lista explícita: una regla general
 * confundiría palabras como "vómito", "apetito" o "linfocito".
 */
const DIMINUTIVOS = new RegExp(
  `${L}(${[
    'poquit[oa]s?',
    'dolorcit[oa]s?',
    'hinchadit[oa]s?',
    'ratit[oa]s?',
    'ahorit[ao]',
    'rapidit[oa]',
    'despacit[oa]',
    'calientit[oa]s?',
    'mareadit[oa]s?',
    'cansadit[oa]s?',
    'bajit[oa]s?',
    'chiquit[oa]s?',
    'pastillit[ao]s?',
    'tosecit[ao]s?',
    'fiebrecit[ao]s?',
    'granit[oa]s?',
    'heridit[ao]s?',
    'barriguit[ao]',
    'pancit[ao]',
    'cabecit[ao]',
    'piecit[oa]s?',
    'manit[oa]s?',
    'nomasit[oa]',
    'poquitit[oa]s?',
    'toditit[oa]s?',
  ].join('|')})${R}`,
  'giu',
);

/** Siglas presentes en el texto (sin repetir). */
export function detectarAbreviaturas(texto: string): string[] {
  if (!texto) return [];
  const encontradas: string[] = [];
  for (const a of ABREVIATURAS) {
    a.re.lastIndex = 0;
    if (a.re.test(texto)) encontradas.push(a.sigla);
    a.re.lastIndex = 0;
  }
  return encontradas;
}

/** Escribe completo lo abreviado; lleva mayúscula solo si la sigla abría la oración. El resto no se toca. */
export function expandirAbreviaturas(texto: string): string {
  if (!texto) return texto;
  let t = texto;
  for (const a of ABREVIATURAS) {
    a.re.lastIndex = 0;
    // Argumentos: coincidencia, grupos…, posición, texto (ninguna regla usa grupos con nombre).
    t = t.replace(a.re, (...args: unknown[]) => {
      const cadena = args[args.length - 1] as string;
      const offset = args[args.length - 2] as number;
      const grupo = args.length > 3 && typeof args[1] === 'string' ? args[1] : '';
      const completo = a.completo.replace('$1', grupo);
      const inicio = offset === 0 || /[.!?]\s+$/.test(cadena.slice(0, offset));
      return inicio ? completo[0].toUpperCase() + completo.slice(1) : completo;
    });
  }
  return t;
}

/** Diminutivos coloquiales ("dolorcito", "hinchadita") presentes en el texto. */
/** En español el decimal va con coma: «38.6 °C» → «38,6 °C». No toca fechas (16.09.2026) ni versiones. */
export function comaDecimal(texto: string): string {
  return texto.replace(/(?<![\d.,])(\d{1,4})\.(\d{1,3})(?!\d|\.\d)/g, '$1,$2');
}

export function detectarDiminutivos(texto: string): string[] {
  if (!texto) return [];
  return [...new Set([...texto.matchAll(DIMINUTIVOS)].map((m) => m[1].toLowerCase()))];
}
