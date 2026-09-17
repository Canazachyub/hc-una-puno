// Aplica y lee el `formato_salida` de las escalas y frases.
// "Edema {valor} hasta {nivel}, {lateralidad}, con fóvea" + datos → frase final.

import type { Opcion } from './types';

const RE_MARCADOR = /\{([a-z0-9_]+)\}/gi;

/** Marcadores de un formato, sin `valor`, en orden de aparición. */
export function marcadores(formato: string): string[] {
  const vistos: string[] = [];
  for (const m of formato.matchAll(RE_MARCADOR)) {
    const k = m[1].toLowerCase();
    if (k !== 'valor' && !vistos.includes(k)) vistos.push(k);
  }
  return vistos;
}

/** Sustituye los marcadores. Los que faltan quedan como `[marcador]` para completarlos después. */
export function aplicarFormato(formato: string, valor: string, datos: Record<string, string> = {}): string {
  return formato.replace(RE_MARCADOR, (_, k: string, pos: number) => {
    const clave = k.toLowerCase();
    // En mitad de la frase, "Crepitantes" se escribe "crepitantes". Las siglas quedan igual.
    if (clave === 'valor') return pos > 0 && /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(valor) ? valor[0].toLowerCase() + valor.slice(1) : valor;
    const v = (datos[clave] ?? '').trim();
    return v || `[${clave}]`;
  });
}

function escaparRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Si `texto` fue generado con este formato y valor, devuelve los datos de los marcadores. */
export function leerFormato(formato: string, valor: string, texto: string): Record<string, string> | null {
  const claves: string[] = [];
  let patron = '';
  let ultimo = 0;
  for (const m of formato.matchAll(RE_MARCADOR)) {
    patron += escaparRe(formato.slice(ultimo, m.index));
    const k = m[1].toLowerCase();
    if (k === 'valor') {
      patron += escaparRe(valor);
    } else {
      patron += '(.+?)';
      claves.push(k);
    }
    ultimo = (m.index ?? 0) + m[0].length;
  }
  patron += escaparRe(formato.slice(ultimo));
  const r = new RegExp(`^${patron}$`, 'i').exec(texto.trim());
  if (!r) return null;
  const datos: Record<string, string> = {};
  claves.forEach((k, i) => {
    const v = r[i + 1];
    datos[k] = v === `[${k}]` ? '' : v;
  });
  return datos;
}

/** Texto que se guarda al elegir una opción de escala o lista. */
export function textoOpcion(op: Opcion, datos: Record<string, string> = {}): string {
  if (op.tipo === 'frase') return aplicarFormato(op.etiqueta, op.valor, datos);
  return op.formato_salida ? aplicarFormato(op.formato_salida, op.valor, datos) : op.valor;
}

/** Busca qué opción de la lista produjo `texto`. */
export function opcionDeTexto(
  lista: Opcion[],
  texto: string,
): { opcion: Opcion; datos: Record<string, string> } | null {
  const t = texto.trim();
  if (!t) return null;
  for (const op of lista) {
    if (op.valor === t) return { opcion: op, datos: {} };
  }
  for (const op of lista) {
    if (!op.formato_salida) continue;
    const datos = leerFormato(op.formato_salida, op.valor, t);
    if (datos) return { opcion: op, datos };
  }
  return null;
}

/** Texto con marcadores sin completar, como `[nivel]`. */
export function tieneMarcadorPendiente(texto: string): boolean {
  return /\[[a-z0-9_]+\]/i.test(texto);
}

/** Sugerencias para completar marcadores rápido, sin escribir. */
export const SUGERENCIAS_MARCADOR: Record<string, string[]> = {
  lateralidad: ['bilateral', 'derecho', 'izquierdo', 'a predominio derecho', 'a predominio izquierdo'],
  nivel: ['tobillos', 'tercio inferior de piernas', 'tercio medio de piernas', 'rodillas', 'raíz de muslos'],
  localizacion: [
    'ambos campos pulmonares',
    'base derecha',
    'base izquierda',
    'ambas bases',
    'tercio inferior de hemitórax derecho',
    'tercio inferior de hemitórax izquierdo',
    'vértice derecho',
    'vértice izquierdo',
    'región infraescapular derecha',
    'región infraescapular izquierda',
  ],
  hallazgo: ['Palidez', 'Ictericia', 'Cianosis'],
  fio2: ['28 %', '32 %', '36 %', '40 %'],
  cm: ['1', '2', '3', '4', '5', '6'],
  lado: ['derecho', 'izquierdo', 'bilateral'],
  lado_f: ['derecha', 'izquierda', 'bilateral'],
  decubito: ['dorsal con flexión de muslos', 'lateral derecho', 'lateral izquierdo', 'en posición genupectoral', 'en gatillo de fusil'],
  facies: ['mitral', 'hipocrática', 'febril', 'de Cushing', 'mixedematosa', 'caquéctica', 'parkinsoniana', 'acromegálica'],
  region_ganglio: ['cervical', 'supraclavicular', 'axilar', 'inguinal'],
  cuero: ['seborrea', 'caspa', 'pediculosis', 'alopecia areata'],
  pupila_d: ['2', '3', '4', '5', '6'],
  pupila_i: ['2', '3', '4', '5', '6'],
  rinorrea: ['serosa', 'purulenta', 'sanguinolenta'],
  timpano: ['abombada', 'retraída', 'perforada'],
  otorrea: ['serosa', 'mucosa', 'purulenta'],
  aliento: ['alcohólico', 'urémico', 'hepático', 'cetónico'],
  region_cuello: ['anterior', 'lateral derecha', 'lateral izquierda'],
  tiroides: ['difuso', 'nodular'],
  cadena: ['submandibular', 'cervical anterior', 'cervical posterior', 'supraclavicular', 'preauricular', 'occipital'],
  fr: ['22', '24', '28', '32'],
  patron_resp: ['Cheyne-Stokes', 'Kussmaul', 'Biot'],
  pulpejos: ['2', '3'],
  tiempo_cardiaco: ['sistólico', 'diastólico', 'continuo'],
  foco: ['mitral', 'tricuspídeo', 'aórtico', 'pulmonar', 'aórtico accesorio'],
  fc: ['50', '110', '120', '130'],
  irradiacion_soplo: ['la axila', 'el cuello', 'el ápex', 'el borde esternal izquierdo'],
  tipo_pulso: ['céler', 'parvus', 'alternante', 'paradójico'],
  region_abd: [
    'el epigastrio',
    'el hipocondrio derecho',
    'el hipocondrio izquierdo',
    'el mesogastrio',
    'el flanco derecho',
    'el flanco izquierdo',
    'la fosa ilíaca derecha',
    'la fosa ilíaca izquierda',
    'el hipogastrio',
    'la región periumbilical',
  ],
  circulacion: ['periumbilical', 'en flancos'],
  punto: ['epigástrico', 'cístico', 'de McBurney', 'ureteral'],
  signo_abd: ['de Rovsing', 'del psoas', 'del obturador'],
  traveses: ['1', '2', '3', '4', '5'],
  grados: ['30', '45', '60'],
  movimiento_col: ['flexión', 'extensión', 'lateralización', 'rotación'],
  pulso_mi: ['femoral', 'poplíteo', 'tibial posterior', 'pedio', 'radial'],
  region_mi: ['la pierna', 'el tercio inferior de la pierna', 'el muslo', 'el pie', 'el antebrazo'],
  orientacion: ['tiempo', 'espacio', 'persona', 'tiempo y espacio'],
  predominio: ['braquial', 'crural'],
  region_neuro: ['miembro superior derecho', 'miembro superior izquierdo', 'miembro inferior derecho', 'miembro inferior izquierdo', 'las cuatro extremidades'],
  frente: ['respeta', 'compromete'],
  marcha: ['atáxica con base amplia', 'parkinsoniana a pasos cortos', 'hemipléjica en guadaña', 'espástica en tijera'],
  temblor: ['de reposo', 'de actitud', 'de acción'],
  via: ['oral', 'endovenosa', 'intramuscular', 'subcutánea', 'sublingual', 'inhalatoria'],
  intervalo: ['4 horas', '6 horas', '8 horas', '12 horas', '24 horas'],
  dieta: ['blanda', 'completa', 'hiposódica', 'para diabético', 'absoluta'],
  solucion: ['cloruro de sodio al 0,9 %', 'dextrosa al 5 %', 'lactato de Ringer'],
  volumen: ['1000 ml cada 8 horas', '1000 ml cada 12 horas', '500 ml cada 8 horas'],
  examen: ['hemograma completo', 'examen completo de orina', 'radiografía de tórax', 'ecografía abdominal', 'electrocardiograma'],
  fecha: [],
};

export const ETIQUETA_MARCADOR: Record<string, string> = {
  lateralidad: 'Lateralidad',
  nivel: 'Hasta dónde',
  localizacion: 'Localización',
  hallazgo: 'Hallazgo',
  fio2: 'FiO2',
  cm: 'Centímetros',
  lado: 'Lado',
  lado_f: 'Lado',
  decubito: 'Decúbito',
  facies: 'Facies',
  region_ganglio: 'Región',
  cuero: 'Hallazgo',
  pupila_d: 'Pupila derecha (mm)',
  pupila_i: 'Pupila izquierda (mm)',
  rinorrea: 'Tipo de rinorrea',
  timpano: 'Membrana timpánica',
  otorrea: 'Tipo de otorrea',
  aliento: 'Aliento',
  region_cuello: 'Región',
  tiroides: 'Aumento',
  cadena: 'Cadena ganglionar',
  fr: 'Respiraciones por minuto',
  patron_resp: 'Patrón',
  pulpejos: 'Pulpejos',
  tiempo_cardiaco: 'Tiempo',
  foco: 'Foco',
  fc: 'Latidos por minuto',
  irradiacion_soplo: 'Irradiado hacia',
  tipo_pulso: 'Tipo de pulso',
  region_abd: 'Región',
  circulacion: 'Ubicación',
  punto: 'Punto',
  signo_abd: 'Signo',
  traveses: 'Traveses de dedo',
  grados: 'Grados',
  movimiento_col: 'Movimiento',
  pulso_mi: 'Pulso',
  region_mi: 'Región',
  orientacion: 'Desorientado en',
  predominio: 'Predominio',
  region_neuro: 'Región',
  frente: 'La frente',
  marcha: 'Marcha',
  temblor: 'Temblor',
  farmaco: 'Fármaco',
  dosis: 'Dosis',
  via: 'Vía',
  intervalo: 'Cada',
  dieta: 'Dieta',
  solucion: 'Solución',
  volumen: 'Volumen y goteo',
  examen: 'Examen',
  objetivo: 'Para qué (pregunta clínica)',
  fecha: 'Fecha',
};
