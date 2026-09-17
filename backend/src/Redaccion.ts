// Gemini para tres tareas nuevas: leer la foto de un informe de laboratorio, redactar la presentación
// de caso o la epicrisis, y redactar la evolución del día en formato SOAP. No diagnostica ni inventa.

import laboratorioCsv from '../../seed/laboratorio.csv';
import { comaDecimal, expandirAbreviaturas } from '../../shared/abreviaturas';
import { buscarParametro, parsearLaboratorio } from '../../shared/laboratorio';
import { GeminiLaboratorioSchema, GeminiRedactarSchema } from '../../shared/schemas';
import { SECCIONES } from '../../shared/secciones';
import { CAMPO_EVOLUCIONES, CAMPO_LABORATORIO, VITALES_DIA, diaHospitalizacion, leerEvoluciones, leerLaboratorio, valoresClinicos } from '../../shared/seguimiento';
import type { LaboratorioPayload, LaboratorioRespuesta, RedactarPayload, RedactarRespuesta } from '../../shared/types';
import { catalogos } from './Catalogos';
import { geminiJson } from './Gemini';
import { conLock, registrar } from './Repo';
import { ErrorApi, PROPS, prop, requerir, requerirEpisodio } from './Util';

const CATALOGO_LAB = parsearLaboratorio(laboratorioCsv);
const TIPOS_IMAGEN = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

const REGLAS_REDACCION = `REDACCIÓN
- Español de Perú, prosa clara, en tercera persona.
- Términos semiológicos (lumbalgia, disnea, edema), nunca coloquiales.
- SIN ABREVIATURAS NI SIGLAS: presión arterial, frecuencia cardíaca, frecuencia respiratoria, saturación de oxígeno, miembro inferior derecho, hipertensión arterial, vía oral, cada 8 horas. Solo unidades (mmHg, °C, kg, mg, ml) y nombres propios de escalas (Glasgow, NYHA, Levine).
- SIN DIMINUTIVOS.
- Decimales con coma: 38,6 °C; 1,9 mg/dl.
- NO INVENTES: usa solo los datos que se entregan. Si falta un dato, no lo menciones ni lo supongas. No agregues diagnósticos, tratamientos ni pronósticos que no estén registrados.`;

// ---------- Laboratorio ----------

function guardarImagen(p: LaboratorioPayload, mime: string): string {
  const carpetaId = prop(PROPS.CARPETA_DRIVE_ID);
  if (!carpetaId) throw new ErrorApi('Falta CARPETA_DRIVE_ID: abre la configuración del servidor', 'config');
  const bytes = Utilities.base64Decode(p.imagenBase64);
  const sello = Utilities.formatDate(new Date(), 'America/Lima', 'yyyyMMdd-HHmmss');
  const ext = mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1];
  const nombre = `${p.dni}-ep${p.episodio}-laboratorio-${sello}.${ext}`;
  return DriveApp.getFolderById(carpetaId).createFile(Utilities.newBlob(bytes, mime, nombre)).getId();
}

const ESQUEMA_LAB = {
  type: 'object',
  properties: {
    fecha: { type: 'string', description: 'Fecha de toma o emisión del informe, AAAA-MM-DD, o vacía' },
    resultados: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          examen: { type: 'string' },
          parametro: { type: 'string' },
          valor: { type: 'string' },
          unidad: { type: 'string' },
          referencia: { type: 'string' },
          nota: { type: 'string' },
        },
        required: ['examen', 'parametro', 'valor', 'unidad', 'referencia', 'nota'],
      },
    },
    advertencias: { type: 'array', items: { type: 'string' } },
  },
  required: ['fecha', 'resultados', 'advertencias'],
};

export function leerLaboratorioFoto(p: LaboratorioPayload): LaboratorioRespuesta {
  const dni = requerir(p.dni, 'dni');
  const episodio = requerirEpisodio(p.episodio);
  requerir(p.imagenBase64, 'imagen');
  const mime = String(p.mime ?? '').toLowerCase();
  if (!TIPOS_IMAGEN.has(mime)) throw new ErrorApi(`Formato de imagen no soportado: ${mime}`, 'payload');
  if (p.imagenBase64.length > 14 * 1024 * 1024) throw new ErrorApi('La foto es muy grande; tómala de nuevo', 'payload');

  const nombres = [...new Set(CATALOGO_LAB.map((x) => `${x.parametro} (${x.examen})`))].join('; ');
  const instruccion = `Lee la imagen de un informe de laboratorio clínico y devuelve cada resultado.
REGLAS
- No inventes: si un valor no se lee con seguridad, no lo pongas y explica en "advertencias".
- "parametro": usa el nombre completo de esta lista cuando corresponda: ${nombres}. Si no está, escribe el nombre completo en español, sin abreviaturas.
- "examen": el examen de la lista (hemograma, glucosa, renal, hepatico, electrolitos, gasometria, orina, lcr, enzimas) o "otros".
- "valor": el resultado tal cual, sin unidad (usa coma decimal si el informe la usa). Si es cualitativo (negativo, positivo, trazas), escríbelo en palabras.
- "unidad": como aparece. "referencia": el rango de referencia impreso, tal cual. "nota": marcas del informe (alto, bajo, H, L, *) o comentarios.
- "fecha": fecha de toma o emisión en formato AAAA-MM-DD si aparece; si no, vacía.
- NO copies nombre, DNI, historia clínica, médico ni datos del laboratorio.
- Si la imagen no es un informe de laboratorio o no se lee, devuelve "resultados" vacío y explica en "advertencias".`;

  const driveId = guardarImagen(p, mime);
  const r = geminiJson(
    {
      partes: [
        { type: 'text', text: instruccion },
        { type: 'image', data: p.imagenBase64, mime_type: mime },
      ],
      esquema: ESQUEMA_LAB,
      pensamiento: 'medium',
      maxTokens: 12000,
    },
    GeminiLaboratorioSchema,
  );
  conLock(() => registrar([{ tipo: 'imagen', dni, episodio, seccion: 'examenes', contenido: JSON.stringify({ drive_file_id: driveId, mime, resultados: r.resultados.length }) }]));

  // Nombre completo del catálogo aunque el informe lo abrevie.
  const resultados = r.resultados.map((x) => {
    const c = buscarParametro(CATALOGO_LAB, x.parametro, x.examen);
    return { ...x, parametro: c?.parametro ?? x.parametro, examen: c?.examen ?? (x.examen || 'otros') };
  });
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(r.fecha) ? r.fecha : '';
  return { fecha, resultados, advertencias: r.advertencias, drive_file_id: driveId };
}

// ---------- Datos de la historia en texto ----------

function datosHistoria(valores: Record<string, string>): string {
  const { esquema } = catalogos();
  const clinicos = valoresClinicos(valores);
  const lineas: string[] = [];
  for (const s of SECCIONES) {
    const campos = esquema.filter((c) => c.seccion === s.id && (clinicos[c.campo_id] ?? '').trim() !== '');
    if (campos.length === 0) continue;
    lineas.push(`## ${s.titulo}`);
    for (const c of campos) {
      if (c.campo_id === 'fil.dni' || c.campo_id === 'fil.direccion' || c.campo_id === 'fil.celular_responsable') continue;
      lineas.push(`- ${c.label}: ${clinicos[c.campo_id].replace(/\s*\|\s*/g, '; ')}`);
    }
  }
  const evoluciones = leerEvoluciones(valores[CAMPO_EVOLUCIONES]);
  if (evoluciones.length) {
    lineas.push('## Evoluciones diarias');
    for (const e of evoluciones) {
      const dia = diaHospitalizacion(valores['fil.fecha_ingreso'], e.fecha);
      const vit = VITALES_DIA.filter((v) => e.vitales[v.clave]).map((v) => `${v.etiqueta} ${e.vitales[v.clave]} ${v.unidad}`.trim());
      lineas.push(`- ${e.fecha}${dia ? ` (día ${dia} de hospitalización)` : ''}: ${vit.join(', ')}. Subjetivo: ${e.subjetivo} Objetivo: ${e.objetivo} Análisis: ${e.analisis} Plan: ${e.plan}`);
    }
  }
  const lab = leerLaboratorio(valores[CAMPO_LABORATORIO]);
  if (lab.length) {
    lineas.push('## Resultados de laboratorio');
    for (const r of lab) lineas.push(`- ${r.fecha} · ${r.parametro}: ${r.valor} ${r.unidad}${r.referencia ? ` (referencia ${r.referencia})` : ''}`);
  }
  return lineas.join('\n');
}

const ESQUEMA_TEXTO = { type: 'object', properties: { texto: { type: 'string' } }, required: ['texto'] };
const ESQUEMA_SOAP = {
  type: 'object',
  properties: {
    texto: { type: 'string' },
    soap: {
      type: 'object',
      properties: {
        subjetivo: { type: 'string' },
        objetivo: { type: 'string' },
        analisis: { type: 'string' },
        plan: { type: 'string' },
      },
      required: ['subjetivo', 'objetivo', 'analisis', 'plan'],
    },
  },
  required: ['texto', 'soap'],
};

function instruccionPresentacion(): string {
  return `TAREA
Redacta la PRESENTACIÓN ORAL DEL CASO para la visita médica con el docente: de 1 a 2 minutos leída en voz alta (entre 180 y 300 palabras), en prosa continua, sin títulos ni viñetas.
ORDEN
1. Identificación sin nombre ni DNI: «Paciente varón de 45 años, agricultor, procedente de…».
2. Motivo de consulta y tiempo de enfermedad.
3. Enfermedad actual en síntesis: síntoma guía con su semiología esencial y lo que se agregó después.
4. Antecedentes relevantes para el cuadro (solo si están registrados).
5. Examen físico: primero los signos vitales alterados, luego los hallazgos positivos por regiones.
6. Exámenes auxiliares relevantes con su valor.
7. Diagnósticos registrados: sindrómico, presuntivo y diferencial.
8. Plan de trabajo y, si hay evoluciones, cómo evoluciona.
Devuelve {"texto": "..."}.`;
}

function instruccionEpicrisis(extra: Record<string, string>): string {
  return `TAREA
Redacta la EPICRISIS (resumen de alta) con estos títulos, cada uno en su propia línea terminada en dos puntos y seguido de su contenido en prosa:
DATOS DEL PACIENTE: / FECHA DE INGRESO: / FECHA DE ALTA: / DÍAS DE HOSPITALIZACIÓN: / MOTIVO DE INGRESO: / RESUMEN DE LA ENFERMEDAD ACTUAL: / HALLAZGOS PRINCIPALES DEL EXAMEN FÍSICO: / EXÁMENES AUXILIARES: / DIAGNÓSTICOS DE INGRESO: / EVOLUCIÓN: / TRATAMIENTO RECIBIDO: / DIAGNÓSTICOS DE ALTA: / CONDICIÓN AL ALTA: / INDICACIONES AL ALTA:
- En DATOS DEL PACIENTE van apellidos, nombres, edad y sexo registrados.
- Si una sección no tiene datos, escribe «No registrado».
- La EVOLUCIÓN resume las evoluciones diarias en orden, con la tendencia de los signos vitales.
DATOS DEL ALTA ENTREGADOS
- Fecha de alta: ${extra.fecha_alta || 'No registrado'}
- Diagnósticos de alta: ${extra.diagnosticos_alta || 'No registrado'}
- Condición al alta: ${extra.condicion_alta || 'No registrado'}
- Indicaciones al alta: ${extra.indicaciones_alta || 'No registrado'}
Devuelve {"texto": "..."} con saltos de línea entre secciones.`;
}

function instruccionEvolucion(extra: Record<string, string>): string {
  return `TAREA
Redacta la EVOLUCIÓN DEL DÍA en formato SOAP a partir de lo dictado hoy y de las evoluciones anteriores.
- Subjetivo: lo que el paciente refiere hoy (del dictado).
- Objetivo: signos vitales de hoy con su comparación con la evolución anterior (sube, baja, se mantiene) y los hallazgos del examen dictados.
- Análisis: cómo evoluciona según los datos (favorable, estacionaria o desfavorable) y los diagnósticos ya registrados. No agregues diagnósticos nuevos.
- Plan: solo lo dictado; si no se dictó, vacío.
FECHA: ${extra.fecha || ''}
SIGNOS VITALES DE HOY: ${extra.vitales || 'no registrados'}
DICTADO DE HOY: ${extra.notas || 'sin dictado'}
Devuelve {"texto": "resumen de una línea", "soap": {"subjetivo": "...", "objetivo": "...", "analisis": "...", "plan": "..."}}.`;
}

export function redactar(p: RedactarPayload): RedactarRespuesta {
  requerir(p.dni, 'dni');
  requerirEpisodio(p.episodio);
  const valores: Record<string, string> = {};
  for (const [k, v] of Object.entries(p.valores ?? {})) if (typeof v === 'string') valores[k] = v;
  const extra: Record<string, string> = {};
  for (const [k, v] of Object.entries(p.extra ?? {})) if (typeof v === 'string') extra[k] = v.slice(0, 4000);

  let instruccion: string;
  if (p.tipo === 'presentacion') instruccion = instruccionPresentacion();
  else if (p.tipo === 'epicrisis') instruccion = instruccionEpicrisis(extra);
  else if (p.tipo === 'evolucion') instruccion = instruccionEvolucion(extra);
  else throw new ErrorApi('Tipo de redacción desconocido', 'payload');

  const r = geminiJson(
    {
      sistema: `Eres el asistente de redacción de un estudiante de medicina de la UNA Puno.\n\n${REGLAS_REDACCION}\n\n${instruccion}`,
      partes: [{ type: 'text', text: `DATOS REGISTRADOS DE LA HISTORIA CLÍNICA\n${datosHistoria(valores) || '(sin datos)'}` }],
      esquema: p.tipo === 'evolucion' ? ESQUEMA_SOAP : ESQUEMA_TEXTO,
      pensamiento: 'medium',
      maxTokens: 12000,
    },
    GeminiRedactarSchema,
  );
  // Por si se le escapa a Gemini: siglas desarrolladas y coma decimal.
  const limpiar = (t: string) => comaDecimal(expandirAbreviaturas(t.trim()));
  const soap = p.tipo === 'evolucion' && r.soap
    ? { subjetivo: limpiar(r.soap.subjetivo), objetivo: limpiar(r.soap.objetivo), analisis: limpiar(r.soap.analisis), plan: limpiar(r.soap.plan) }
    : null;
  return { texto: limpiar(r.texto), soap };
}
