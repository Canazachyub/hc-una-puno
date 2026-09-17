// Construye los prompts leyendo Esquema, Opciones y Knowledge.

import { escalasDeCampo, indexarListas, tipoLista } from '../../shared/catalogo';
import { marcadores } from '../../shared/formato';
import { SECCIONES, infoSeccion } from '../../shared/secciones';
import type { Campo, KnowledgeFila, Opcion, OrigenEntrada } from '../../shared/types';
import { clave } from '../../shared/valores';

/**
 * Dónde va cada dato. Sin esto, al dictar toda la historia, un mismo síntoma termina repetido
 * en síntomas principales, en el relato y en funciones biológicas.
 */
export const REPARTO_SECCIONES = `DÓNDE VA CADA DATO (cada dato va en UNA sola sección)
- Filiación: quién es el paciente (nombre, edad, procedencia, ocupación, con quién vive). Nada clínico.
- Enfermedad actual: el cuadro que lo trae ahora. Tiempo de enfermedad, forma de inicio, curso, síntomas principales caracterizados, síntomas accesorios, relato cronológico con el síntoma guía como hilo, lo que tomó por su cuenta y la atención que ya recibió por ESTE cuadro.
- Síntomas principales y accesorios: los tres que motivan la consulta van en los principales; los demás síntomas del mismo cuadro van en los accesorios, con la misma caracterización. Un síntoma está en uno o en el otro, nunca en los dos.
- Funciones biológicas: cómo están apetito, sed, sueño, deposiciones, orina, peso, sudoración y ánimo. Si una de ellas está alterada por el cuadro actual (diarrea, disuria, insomnio por el dolor), el detalle va en el relato y aquí solo se anota el cambio respecto a lo habitual, en una línea.
- Antecedentes personales: cómo vive y sus hábitos, antes de este cuadro.
- Antecedentes fisiológicos: nacimiento, desarrollo, vida sexual y antecedentes gineco-obstétricos.
- Antecedentes patológicos: enfermedades ya diagnosticadas antes de este cuadro, con su año y su tratamiento. Nunca los síntomas de ahora.
- Antecedentes familiares: enfermedades de los familiares, con el parentesco. Nada del paciente.
- Examen físico: solo lo que el estudiante observa, palpa, percute o ausculta hoy. Nunca lo que el paciente refiere.
- Exámenes complementarios: resultados, con su fecha.
- Diagnóstico: interpretación de lo anterior. No aparecen datos nuevos.
Si un dato ya está en el CONTEXTO YA REGISTRADO de otra sección, no lo repitas: déjalo fuera y explícalo en "descartados".`;

// ---------- Reglas y glosario ----------

export const REGLAS_TEXTO: Record<string, string> = {
  tercera_persona: 'En tercera persona ("Paciente refiere…", "Se evidencia…").',
  terminos_medicos: 'Con terminología semiológica, nunca con palabras coloquiales.',
  orden_cronologico: 'En orden cronológico: cómo inició, cómo evolucionó y cómo se encuentra actualmente.',
  hilo_sintoma_guia:
    'El síntoma guía es el hilo conductor; los demás síntomas se relatan en el momento en que aparecieron.',
  palabras_paciente: 'Con las propias palabras del paciente, sin tecnicismos y sin comillas.',
  termino_caracterizacion:
    'Cada síntoma con su término semiológico y su caracterización principal (tipo, valor, patrón o grado) y, entre paréntesis, el tiempo: «Fiebre intermitente de hasta 39 °C, de predominio vespertino (4 días)». Sin repetir aquí todo el relato.',
  describir_no_interpretar:
    'Describe el hallazgo, no lo interpretes: "matidez en base derecha" sí, "derrame pleural" no.',
  con_lateralidad: 'Cada hallazgo con lateralidad y localización (hemitórax, campo, tercio, región).',
  solo_datos_positivos:
    'Solo los datos positivos y los negativos relevantes ya registrados, agrupados por aparatos, sin diagnósticos.',
  sin_codigos: 'Un diagnóstico por elemento, sin códigos CIE-10. Solo los que el estudiante dictó.',
  con_sustento: 'Cada diagnóstico con su sustento breve, solo si el estudiante lo dictó.',
  farmaco_dosis_via_intervalo:
    'Cada indicación con fármaco, dosis, vía y frecuencia ("Paracetamol 500 mg vía oral cada 8 horas").',
  examen_con_pregunta: 'Cada examen solicitado con la pregunta clínica que responde, tal como la dictó el estudiante.',
  valor_unidad_rango: 'Cada resultado con fecha, valor, unidad y rango de referencia si se dictó.',
  soap: 'En formato SOAP (S, O, A, P), precedido de la fecha.',
};

/**
 * Texto de una regla. Además de las de la tabla, dos llevan parámetro:
 * `max_3` (cuántos elementos acepta la lista) y `sigue_en:campo` (dónde van los que no entran).
 */
export function textoRegla(regla: string): string {
  if (REGLAS_TEXTO[regla]) return REGLAS_TEXTO[regla];
  if (/^max_\d+$/.test(regla)) return `Máximo ${regla.slice(4)} elementos, en el orden en que aparecieron.`;
  if (regla.startsWith('sigue_en:')) return `Los que no entren en ese máximo van en ${regla.slice(9)}, no se descartan.`;
  return '';
}

/** Palabra del paciente → término semiológico (los primeros vienen tal cual de las notas de Semiología). */
export const GLOSARIO: [string, string][] = [
  ['me falta el aire', 'disnea'],
  ['hinchazón de pies', 'edema de miembros inferiores'],
  ['hinchazón generalizada', 'anasarca'],
  ['me duele el riñón', 'dolor lumbar (a menudo extrarrenal: lumbalgia)'],
  ['como si algo apretara', 'dolor de carácter opresivo'],
  ['como una puñalada, en puntada de costado', 'dolor pleurítico punzante'],
  ['como si atravesara una lanza', 'dolor de carácter lancinante'],
  ['como un taladro, como dolor de muelas', 'dolor de carácter terebrante'],
  ['como corriente eléctrica', 'dolor fulgurante o en descarga eléctrica'],
  ['ardor, quemazón', 'dolor de carácter urente'],
  ['un peso que jala hacia abajo', 'dolor de carácter gravativo'],
  ['la peor cefalea de su vida', 'cefalea de inicio súbito'],
  ['se cansa, suspira mucho', 'astenia (no es disnea)'],
  ['aturdimiento, sensación de flotar', 'mareo (no es vértigo)'],
  ['siente que gira él o que giran los objetos', 'vértigo'],
  ['se llena rápido', 'saciedad precoz'],
  ['mala digestión', 'dispepsia'],
  ['ardor que sube por detrás del esternón', 'pirosis'],
  ['orina muchas veces pero poca cantidad', 'polaquiuria'],
  ['necesidad imperiosa de orinar', 'urgencia miccional'],
  ['dejó de orinar', 'retención urinaria o anuria (precisar)'],
  ['orina con espuma', 'orina espumosa'],
  ['duerme semisentado o con varias almohadas', 'ortopnea'],
  ['le sangra la nariz', 'epistaxis'],
  ['dolor de pantorrilla que le obliga a detenerse al caminar', 'claudicación intermitente'],
  ['sangre roja por el ano', 'enterorragia'],
  ['dolor de cabeza', 'cefalea'],
  ['dolor de cintura, dolor lumbar, dolor de espalda baja', 'lumbalgia'],
  ['dolor de espalda alta', 'dorsalgia'],
  ['dolor de cuello', 'cervicalgia'],
  ['dolor de pecho', 'dolor torácico (precordalgia si es precordial)'],
  ['dolor en la boca del estómago', 'epigastralgia'],
  ['dolor de barriga, de estómago', 'dolor abdominal en [región o cuadrante]'],
  ['dolor de muela', 'odontalgia'],
  ['dolor de oído', 'otalgia'],
  ['dolor al tragar', 'odinofagia'],
  ['dificultad para tragar', 'disfagia'],
  ['dolor de músculos, de cuerpo', 'mialgias'],
  ['dolor de articulaciones, de huesos', 'artralgias'],
  ['ardor o dolor al orinar', 'disuria'],
  ['orina a cada rato', 'polaquiuria'],
  ['se levanta a orinar de noche', 'nicturia'],
  ['orina poco', 'oliguria'],
  ['orina mucho', 'poliuria'],
  ['orina con sangre', 'hematuria'],
  ['orina oscura, como té o gaseosa', 'coluria'],
  ['heces blancas', 'acolia'],
  ['heces negras, como alquitrán', 'melena'],
  ['vómito con sangre', 'hematemesis'],
  ['tos con sangre', 'hemoptisis'],
  ['sangrado de nariz', 'epistaxis'],
  ['sangrado de encías', 'gingivorragia'],
  ['falta de aire, ahogo, se agita', 'disnea (de esfuerzo o de reposo; ortopnea si es al acostarse)'],
  ['hinchazón', 'edema (con localización y godet)'],
  ['color amarillo de piel u ojos', 'ictericia'],
  ['labios o dedos morados', 'cianosis'],
  ['fiebre, calentura', 'alza térmica (cuantificada si se midió)'],
  ['sudoración', 'diaforesis'],
  ['cansancio', 'astenia'],
  ['debilidad general', 'adinamia'],
  ['poco apetito', 'hiporexia'],
  ['nada de apetito', 'anorexia'],
  ['mucha sed', 'polidipsia'],
  ['come mucho', 'polifagia'],
  ['acidez, ardor en el estómago', 'pirosis'],
  ['llenura después de comer', 'plenitud posprandial'],
  ['gases, barriga hinchada', 'meteorismo o distensión abdominal'],
  ['ganas de vomitar', 'náuseas'],
  ['mareo con sensación de que todo gira', 'vértigo'],
  ['desmayo', 'síncope'],
  ['sensación de desmayo sin perder el conocimiento', 'lipotimia'],
  ['el corazón le late fuerte o rápido', 'palpitaciones'],
  ['zumbido de oídos', 'acúfenos'],
  ['ronquera', 'disfonía'],
  ['ve doble', 'diplopía'],
  ['le molesta la luz', 'fotofobia'],
  ['hormigueo, adormecimiento', 'parestesias'],
  ['debilidad de medio cuerpo', 'hemiparesia (hemiplejía si es total)'],
  ['picazón', 'prurito'],
  ['silbido en el pecho', 'sibilancias'],
  ['tos con flema', 'tos productiva con expectoración (color, cantidad, olor)'],
  ['tos seca', 'tos no productiva'],
  ['dolor de pierna al caminar que cede al parar', 'claudicación intermitente'],
  ['dolor con la regla', 'dismenorrea'],
  ['no le baja la regla', 'amenorrea'],
  ['dolor en las relaciones', 'dispareunia'],
];

const SISTEMA_BASE = `ROL
Conviertes lo que un estudiante de medicina dicta o escribe al pie de la cama en los campos de una historia clínica de la Facultad de Medicina Humana de la UNA Puno (Cátedra de Clínica Médica). No diagnosticas, no sugieres tratamientos, no completas lo que no se dijo.

REGLA PRIMERA
No inventes. Si la entrada no contiene un dato, el campo va vacío y el dato se reporta en "dudas". Una historia incompleta es preferible a una historia con un dato que el paciente nunca dijo. Nunca escribas "no refiere" ni "niega" si el estudiante no lo dictó.

REDACCIÓN, SIEMPRE
- Tercera persona. Pasado para el relato, presente para el examen físico.
- Términos médicos desde la primera línea, también en los signos y síntomas principales: edema y no hinchazón, disnea y no falta de aire, ictericia y no color amarillo, lumbalgia y no dolor lumbar.
- No basta con traducir: el síntoma se describe con su semiología completa, en prosa continua. Ejemplo: no "dolor lumbar", sino "lumbalgia de tres días de evolución, de inicio insidioso, de tipo opresivo, de intensidad 6/10 en la escala visual análoga, que se irradia a la región dorsal, se exacerba con la bipedestación y cede parcialmente con el reposo".
- Para un dolor, los diez puntos: época de aparición y duración, modo de inicio, factores desencadenantes, agravantes y atenuantes, carácter, localización, irradiación, intensidad, curso, síntomas acompañantes y respuesta al tratamiento. Los que no se dictaron no se escriben: van a "dudas".
- El relato va en orden cronológico (cómo inició, cómo evolucionó, cómo está actualmente), con el síntoma guía como hilo conductor y las demás molestias colgando del momento en que aparecieron. Incluye automedicación, tratamientos, dosis y respuesta si se dictaron. Nunca "está mejor" o "está peor" sin decir en qué.
- Estructura del relato: "Paciente refiere que hace [tiempo], de inicio [forma de inicio], presenta [síntoma guía] a nivel de [localización], de carácter [carácter], de intensidad [n]/10 en la escala visual análoga, que se irradia a [región], que se exacerba con [factor] y cede con [factor]. Hace [tiempo] se agrega [síntoma]… Se automedica con [fármaco, dosis y vía], con [respuesta]. Actualmente [cómo está el síntoma guía]." Omite las partes que no se dictaron.
- Síntoma es lo que el paciente refiere; signo es lo que se objetiva al examinar. En el relato todo va como referido ("refiere coloración amarilla de piel" → "refiere ictericia"). Los hallazgos del examen van en los campos del examen físico, no en el relato.
- No confundas: disnea con astenia, síncope con lipotimia, vértigo con mareo, hemoptisis con hematemesis, regurgitación con vómito. Si el dato no permite distinguirlos, usa el término más prudente y pregunta en "dudas".
- Si se dictó que no hubo un cuadro similar antes, escribe "No refiere cuadro similar previo".
- Registra todos los datos positivos y solo los negativos importantes que se dictaron. Estado actual concreto, nunca "está mejor" o "está peor" sin decir en qué.
- Signos y síntomas principales: los tres que motivan la consulta, en el orden en que aparecieron, cada uno con su término semiológico, su caracterización principal y el tiempo entre paréntesis («Fiebre intermitente de hasta 39 °C, de predominio vespertino (4 días)»). Los demás síntomas del cuadro van en los signos y síntomas accesorios, escritos igual; ninguno se descarta por falta de sitio. Síntoma guía: el término semiológico del síntoma principal (Lumbalgia, Cefalea, Disnea…). Tiempo de enfermedad: desde el primer síntoma del cuadro.
- Los tiempos se expresan como los dijo el paciente ("hace tres días"); no conviertas a fechas que nadie dio.
- El examen físico describe, no interpreta. "Matidez en base derecha" es un hallazgo; "derrame pleural" es un diagnóstico y no va ahí.
- Todo hallazgo lleva lateralidad, localización e intensidad si corresponde.
- Si existe escala, se usa la escala: nunca "edema moderado" cuando hay godet, nunca "dolor fuerte" cuando hay EVA.
- Unidades: PA en mmHg, FC en latidos por minuto, FR en respiraciones por minuto, temperatura en °C, saturación en %.
- SIN ABREVIATURAS NI SIGLAS: la historia puede llegar a otros profesionales o a un juzgado. Escribe completo: presión arterial, frecuencia cardíaca, frecuencia respiratoria, saturación de oxígeno, miembro inferior derecho, hipertensión arterial, diabetes mellitus, vía oral, cada 8 horas, reflejos osteotendinosos, escala visual análoga, paciente. Solo se permiten unidades de medida (mmHg, °C, kg, cm, mg, ml) y nombres propios de escalas (Glasgow, NYHA, Levine, Bristol).
- SIN DIMINUTIVOS NI COLOQUIALISMOS: nada de "dolorcito", "de a poquitos", "ahorita", "hinchadito"; di "de inicio insidioso", "leve", etc.
- Solo se traducen los términos clínicos. Las palabras comunes se conservan: si cargó sacos de papa, cargó sacos de papa.
- Tiempos: fechas administrativas exactas; en el relato, tiempo relativo al ingreso ("hace tres días"). Si el paciente no recuerda con precisión, "hace aproximadamente…".
- Verbos pronominales completos: "se automedica", "se agrega", "se exacerba".
- Prosa clara, sin viñetas, sin abreviaturas ambiguas. Español de Perú.
- Si viene de voz, trae muletillas y repeticiones: límpialas. Si viene escrito, viene telegráfico y con abreviaturas: expándelas.

GLOSARIO (palabra del paciente → término semiológico)
${GLOSARIO.map(([a, b]) => `- ${a} → ${b}`).join('\n')}`;

// ---------- Utilidades de armado ----------

const STOP = new Set(['desde', 'hasta', 'sobre', 'entre', 'tiene', 'tenia', 'paciente', 'refiere', 'porque', 'cuando', 'tambien', 'mucho', 'donde', 'estaba', 'dolor']);

function palabras(s: string): Set<string> {
  return new Set(
    clave(s)
      .split(/[^a-z0-9ñ]+/)
      .filter((w) => w.length >= 5 && !STOP.has(w)),
  );
}

/** Elige los fragmentos de las notas más útiles para esta entrada, hasta `max` caracteres. */
export function seleccionarKnowledge(
  kb: KnowledgeFila[],
  secciones: string[] | null,
  tags: string[],
  texto: string,
  max: number,
): KnowledgeFila[] {
  const candidatos = kb.filter(
    (k) => secciones === null || secciones.includes(k.seccion) || tags.some((t) => k.id.startsWith(`${t}.`)),
  );
  const pal = [...palabras(texto)].sort((a, b) => b.length - a.length).slice(0, 30);
  const conContenido = candidatos.length <= 80;
  const puntaje = (k: KnowledgeFila): number => {
    const tit = palabras(k.titulo);
    let s = 0;
    for (const w of pal) if (tit.has(w)) s += 4;
    if (conContenido) {
      const c = clave(k.contenido);
      for (const w of pal) if (c.includes(w)) s += 1;
    }
    if (/errores frecuentes/i.test(k.titulo)) s += 1;
    // Las notas enlazadas al campo (ayuda_kb) son las reglas de redacción de ese campo: van primero.
    if (tags.some((t) => k.id.startsWith(`${t}.`))) s += 6;
    return s;
  };
  const ordenados = candidatos.map((k) => ({ k, s: puntaje(k) })).sort((a, b) => b.s - a.s);
  const elegidos: KnowledgeFila[] = [];
  let total = 0;
  for (const { k } of ordenados) {
    if (total + k.contenido.length > max) continue;
    elegidos.push(k);
    total += k.contenido.length;
  }
  return elegidos;
}

function lineaCampo(c: Campo, listas: Map<string, Opcion[]>): string {
  const partes = [`${c.campo_id} · ${c.label} · tipo ${c.tipo}`];
  if (c.lista_id) partes.push(`lista ${c.lista_id}`);
  if (c.obligatorio) partes.push('obligatorio');
  const escalas = escalasDeCampo(c, listas);
  partes.push(escalas.length ? `escalas que corresponden: ${escalas.join(', ')}` : 'sin escalas');
  const reglas = c.reglas.map(textoRegla).filter(Boolean);
  if (reglas.length) partes.push(`reglas: ${reglas.join(' ')}`);
  return `- ${partes.join(' · ')}`;
}

/** Términos de la teoría del estudiante (listas del constructor de síntomas) para que Gemini los use tal cual. */
const LEXICO: [string, string][] = [
  ['sintoma', 'Síntomas (término a usar)'],
  ['localizacion', 'Localizaciones e irradiaciones'],
  ['dolor_caracter', 'Carácter del dolor'],
  ['patron_sintoma', 'Presentación en el tiempo'],
  ['agravante', 'Se exacerba con'],
  ['atenuante', 'Cede con'],
];

function lexico(listas: Map<string, Opcion[]>): string {
  return LEXICO.map(([id, titulo]) => {
    const l = listas.get(id);
    if (!l) return '';
    return `${titulo}: ${l.map((o) => (o.etiqueta && id !== 'localizacion' ? `${o.valor} (${o.etiqueta})` : o.valor)).join('; ')}`;
  })
    .filter(Boolean)
    .join('\n');
}

const SECCIONES_CON_LEXICO = new Set(['*', 'enfermedad_actual', 'diagnostico', 'evolucion', 'ant_patologicos']);

function describirLista(id: string, lista: Opcion[]): string {
  const tipo = tipoLista(lista);
  if (tipo === 'frase') {
    const normal = lista.find((o) => o.valor === 'n');
    const otras = lista.filter((o) => o.valor !== 'n').map((o) => `"${o.etiqueta.trim()}…"`);
    return [
      `${id} (modelo de redacción)`,
      normal ? `  Hallazgo normal completo: "${normal.etiqueta}"` : '',
      otras.length ? `  Inicios de frase para lo alterado: ${otras.join(' · ')}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }
  const formato = lista.find((o) => o.formato_salida)?.formato_salida ?? '';
  const valores = lista.map((o) => (o.etiqueta ? `${o.valor} (${o.etiqueta})` : o.valor)).join(' | ');
  const marcas = formato ? marcadores(formato) : [];
  return [
    `${id} (${tipo}): ${valores}`,
    formato ? `  La app arma la frase "${formato}". Datos a extraer en "detalles": ${marcas.join(', ') || 'ninguno'}.` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

const INSTRUCCION_TIPOS = `CÓMO DEVOLVER CADA TIPO DE CAMPO
- opcion: exactamente uno de los valores de su lista, escrito igual.
- opcion_otro: uno de los valores de su lista; si ninguno encaja, el texto dictado.
- multi: valores de su lista separados por " | ". Para listas con formato, cada elemento es el valor y sus datos van en "detalles".
- escala: el valor exacto del nivel (por ejemplo "++/++++" o "4"). Los datos de la frase (nivel, lateralidad, localización…) van en "detalles" con su clave. No inventes el nivel: si no se dijo, el campo va vacío y va una duda.
- lista: elementos separados por " | ".
- numero: solo el número, con punto decimal y sin unidades.
- fecha: AAAA-MM-DD (o AAAA-MM-DDTHH:MM si se dictó la hora), solo si se dictó una fecha concreta.
- texto: una línea.
- texto_largo y narrativa: prosa redactada según las reglas. Si el campo ya tiene texto registrado, devuelve el texto completo integrado: conserva todo lo registrado y agrega lo nuevo en su lugar cronológico o anatómico. No borres información registrada.
- calculado: nunca lo devuelvas.
- "confianza": 1 si el dato se dijo textualmente; menos de 0.7 si tuviste que inferir el término o el nivel.
- Devuelve solo los campos para los que la entrada trae información.
- "dudas": preguntas concretas y breves que el estudiante debe hacerle al paciente o completar en el examen, con el id del campo al que pertenecen. Prioriza lo que falta del síntoma guía. Máximo 8.
- "escalas_sugeridas": cuando un hallazgo dictado debería medirse con una escala de las listas (godet, EVA, Glasgow, NYHA, mMRC, Levine, Bristol, fuerza, ROT, pulsos, deshidratación, ECOG…) y todavía no está cuantificado con ella.
- "conflictos": cuando la entrada contradice un valor ya registrado. En ese caso no devuelvas el campo en "campos".`;

// ---------- Organizar ----------

export interface ArmarOrganizar {
  seccion: string;
  campos: Campo[];
  todoElEsquema: Campo[];
  opciones: Opcion[];
  kb: KnowledgeFila[];
  contexto: Record<string, string>;
  texto: string;
  origen: OrigenEntrada;
  campoObjetivo?: string;
  hoy: string;
}

export function promptOrganizar(a: ArmarOrganizar): { sistema: string; entrada: string; esquema: object } {
  const listas = indexarListas(a.opciones);
  const idsEscala = [...new Set(a.campos.flatMap((c) => escalasDeCampo(c, listas)))];
  const idsListas = [...new Set(a.campos.map((c) => c.lista_id).filter(Boolean))];
  const todas = a.seccion === '*' || a.campoObjetivo === 'dx.resumen';
  const secciones = a.seccion === '*' ? null : [a.seccion];
  const tags = [...new Set(a.campos.map((c) => c.ayuda_kb).filter(Boolean))];
  const kb = seleccionarKnowledge(a.kb, secciones, tags, `${a.texto} ${a.contexto['ea.sintoma_guia'] ?? ''}`, 30000);

  const etiqueta = (id: string) => a.todoElEsquema.find((c) => c.campo_id === id)?.label ?? id;
  const idsContexto = todas
    ? Object.keys(a.contexto)
    : [
        ...new Set([
          'ea.sintoma_guia',
          'ea.tiempo_valor',
          'ea.tiempo_unidad',
          'fil.edad',
          'fil.sexo',
          'fil.ocupacion',
          ...a.campos.map((c) => c.campo_id),
        ]),
      ];
  const contexto = idsContexto
    .filter((id) => (a.contexto[id] ?? '').trim() !== '')
    .map((id) => `- ${id} (${etiqueta(id)}): ${a.contexto[id]}`)
    .join('\n');

  const seccionTxt = a.seccion === '*' ? 'TODA LA HISTORIA (reparte entre las secciones que correspondan)' : infoSeccion(a.seccion).titulo;
  const objetivo = a.campoObjetivo
    ? a.campoObjetivo === 'dx.resumen' && !a.texto.trim()
      ? `\nTAREA ESPECÍFICA: redacta solo el campo dx.resumen (resumen semiológico) a partir del CONTEXTO YA REGISTRADO, agrupando por aparatos los datos positivos y los negativos relevantes. Sin diagnósticos.`
      : `\nTAREA ESPECÍFICA: devuelve solo el campo ${a.campoObjetivo}, redactando la entrada según las reglas. Conserva todos los datos; mejora la terminología y el orden. No agregues datos.`
    : '';

  const entrada = `FECHA DE HOY: ${a.hoy}
ORIGEN DE LA ENTRADA: ${a.origen}
SECCIÓN ACTIVA: ${seccionTxt}${objetivo}

CAMPOS
${a.campos.map((c) => lineaCampo(c, listas)).join('\n')}
${
  SECCIONES_CON_LEXICO.has(a.seccion) && lexico(listas)
    ? `
LÉXICO DE LA TEORÍA DEL ESTUDIANTE
Usa estos términos, escritos igual, cuando lo dictado corresponda. Si nada encaja, usa el término semiológico correcto.
${lexico(listas)}
`
    : ''
}

LISTAS VÁLIDAS
Para los campos de tipo opcion, multi o escala, el valor que devuelvas TIENE que ser uno de los valores válidos de su lista. Si ninguno encaja, deja el campo vacío y repórtalo en "dudas".
${idsListas
  .map((id) => {
    const l = listas.get(id);
    return l ? describirLista(id, l) : '';
  })
  .filter(Boolean)
  .join('\n')}

ESCALAS (solo se sugieren en los campos donde corresponden, según la lista de CAMPOS)
${idsEscala.map((id) => `${id}: ${listas.get(id)?.[0].nombre ?? id}`).join(' · ') || '(ninguna en esta sección)'}

${INSTRUCCION_TIPOS}

${REPARTO_SECCIONES}

REGLAS DE REDACCIÓN DE LAS NOTAS DE SEMIOLOGÍA DEL ESTUDIANTE
${kb.length ? kb.map((k) => `### ${k.titulo}\n${k.contenido}`).join('\n\n') : '(sin notas cargadas)'}

CONTEXTO YA REGISTRADO
${contexto || '(nada registrado todavía)'}
Si la entrada contradice lo registrado, no lo sobrescribas: repórtalo en "conflictos".

ENTRADA
"""
${a.texto.trim() || '(sin texto nuevo)'}
"""`;

  const ids = a.campos.map((c) => c.campo_id);
  const conEscalas = a.campos.filter((c) => escalasDeCampo(c, listas).length > 0).map((c) => c.campo_id);
  const claves = [
    ...new Set(
      a.opciones.flatMap((o) => [...marcadores(o.formato_salida), ...(o.tipo === 'frase' ? marcadores(o.etiqueta) : [])]),
    ),
  ];

  const esquema = {
    type: 'object',
    properties: {
      campos: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', enum: ids },
            valor: { type: 'string' },
            confianza: { type: 'number', minimum: 0, maximum: 1 },
            detalles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  clave: claves.length ? { type: 'string', enum: claves } : { type: 'string' },
                  valor: { type: 'string' },
                },
                required: ['clave', 'valor'],
              },
            },
          },
          required: ['id', 'valor', 'confianza'],
        },
      },
      dudas: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            pregunta: { type: 'string' },
            campo: { type: 'string', description: 'id del campo al que pertenece, o vacío' },
          },
          required: ['pregunta', 'campo'],
        },
      },
      escalas_sugeridas: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            campo: { type: 'string', enum: conEscalas.length ? conEscalas : ids },
            lista_id: idsEscala.length ? { type: 'string', enum: idsEscala } : { type: 'string' },
            razon: { type: 'string' },
          },
          required: ['campo', 'lista_id', 'razon'],
        },
      },
      conflictos: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            campo: { type: 'string', enum: ids },
            registrado: { type: 'string' },
            entrada: { type: 'string' },
          },
          required: ['campo', 'registrado', 'entrada'],
        },
      },
    },
    required: ['campos', 'dudas', 'escalas_sugeridas', 'conflictos'],
  };

  return { sistema: SISTEMA_BASE, entrada, esquema };
}

// ---------- Transcribir ----------

export const PROMPT_TRANSCRIBIR = `Transcribe literalmente, en español, este audio grabado por un estudiante de medicina al pie de la cama. Puede incluir la voz del paciente o de un familiar.
- Respeta los términos médicos y las palabras en quechua o aymara tal como se dicen.
- No interpretes, no resumas, no corrijas, no agregues nada.
- Cuando cambie quien habla, empieza una línea nueva.
- Si una parte es inaudible, escribe [inaudible].
Devuelve solo la transcripción, sin comentarios.`;

// ---------- Revisar ----------

export function promptRevisar(
  esquema: Campo[],
  valores: Record<string, string>,
  kb: KnowledgeFila[],
): { sistema: string; entrada: string; esquema: object } {
  const ids = esquema.map((c) => c.campo_id);
  const porSeccion = SECCIONES.map((s) => {
    const campos = esquema.filter((c) => c.seccion === s.id);
    const lineas = campos.map((c) => {
      const v = (valores[c.campo_id] ?? '').trim();
      return `- ${c.campo_id} · ${c.label}${c.obligatorio ? ' · obligatorio' : ''}: ${v || '(vacío)'}`;
    });
    return `## ${s.titulo}\n${lineas.join('\n')}`;
  }).join('\n\n');

  const notas = seleccionarKnowledge(kb, null, ['kb.relato', 'kb.resumen'], `${valores['ea.sintoma_guia'] ?? ''} errores frecuentes`, 15000);

  const sistema = `${SISTEMA_BASE}

TU TAREA AHORA
Revisas una historia clínica completa antes de imprimirla. No diagnosticas y no agregas datos.`;

  const entrada = `HISTORIA CLÍNICA
${porSeccion}

NOTAS DE SEMIOLOGÍA (referencia)
${notas.map((k) => `### ${k.titulo}\n${k.contenido}`).join('\n\n') || '(sin notas)'}

DEVUELVE
- "faltantes": campos obligatorios vacíos y datos que se esperan según el síntoma guía y no están (por ejemplo, la irradiación de un dolor). Cada uno con el id del campo y el motivo en una frase.
- "incoherencias": contradicciones entre secciones (tiempo de enfermedad distinto en el relato, edema en el relato con extremidades normales, sexo masculino con datos gineco-obstétricos, signos vitales que no concuerdan con la ectoscopía). Con los ids involucrados.
- "redaccion": campos con abreviaturas o siglas, diminutivos, palabras coloquiales, primera persona, interpretaciones o diagnósticos dentro del examen físico, o hallazgos sin la escala que corresponde. "sugerido" es el texto COMPLETO del campo corregido: cambia solo la redacción, conserva todos los datos y no agregues ninguno.
Si no hay nada que observar en un apartado, devuélvelo vacío.`;

  const esquemaJson = {
    type: 'object',
    properties: {
      faltantes: {
        type: 'array',
        items: {
          type: 'object',
          properties: { campo: { type: 'string', enum: ids }, motivo: { type: 'string' } },
          required: ['campo', 'motivo'],
        },
      },
      incoherencias: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            campos: { type: 'array', items: { type: 'string', enum: ids } },
            descripcion: { type: 'string' },
          },
          required: ['campos', 'descripcion'],
        },
      },
      redaccion: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            campo: { type: 'string', enum: ids },
            observacion: { type: 'string' },
            sugerido: { type: 'string' },
          },
          required: ['campo', 'observacion', 'sugerido'],
        },
      },
    },
    required: ['faltantes', 'incoherencias', 'redaccion'],
  };

  return { sistema, entrada, esquema: esquemaJson };
}
