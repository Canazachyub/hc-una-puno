// Cliente de Gemini (Interactions API). La API key vive en Script Properties.
// `store: false`: Google no conserva la conversación con datos del paciente.

import type { ZodType } from 'zod';
import { extraerJson } from '../../shared/schemas';
import { ErrorApi, MODELO_POR_DEFECTO, PROPS, mensajeError, prop } from './Util';

const URL_INTERACTIONS = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const API_REVISION = '2026-05-20';

export type Parte =
  | { type: 'text'; text: string }
  | { type: 'audio'; data: string; mime_type: string }
  | { type: 'image'; data: string; mime_type: string };

export interface OpcionesGemini {
  sistema?: string;
  partes: Parte[];
  /** JSON Schema de la salida. Si se indica, la respuesta es JSON. */
  esquema?: object;
  pensamiento?: 'low' | 'medium' | 'high';
  maxTokens?: number;
}

interface PasoInteraccion {
  type?: string;
  content?: { type?: string; text?: string }[];
}

export function modelo(): string {
  return prop(PROPS.MODELO) || MODELO_POR_DEFECTO;
}

export function geminiConfigurado(): boolean {
  return prop(PROPS.API_KEY_GEMINI) !== '';
}

function cuerpo(o: OpcionesGemini): Record<string, unknown> {
  const m = modelo();
  const generation_config: Record<string, unknown> = { max_output_tokens: o.maxTokens ?? 16000 };
  // thinking_level solo existe en la familia 3 en adelante.
  if (/^gemini-[3-9]/.test(m)) generation_config.thinking_level = o.pensamiento ?? 'low';
  const body: Record<string, unknown> = {
    model: m,
    input: o.partes,
    store: false,
    generation_config,
  };
  if (o.sistema) body.system_instruction = o.sistema;
  if (o.esquema) body.response_format = { type: 'text', mime_type: 'application/json', schema: o.esquema };
  return body;
}

function textoDeRespuesta(r: { status?: string; steps?: PasoInteraccion[]; error?: { message?: string } }): string {
  if (r.error?.message) throw new ErrorApi(`Gemini: ${r.error.message}`, 'gemini');
  const texto = (r.steps ?? [])
    .filter((s) => s.type === 'model_output')
    .flatMap((s) => s.content ?? [])
    .filter((c) => c.type === 'text' && typeof c.text === 'string')
    .map((c) => c.text)
    .join('');
  if (!texto) throw new ErrorApi(`Gemini no devolvió texto (estado: ${r.status ?? 'desconocido'})`, 'gemini');
  return texto;
}

/** Llama a Gemini y devuelve el texto. Reintenta una vez ante 429 o 5xx. */
export function llamarGemini(o: OpcionesGemini): string {
  const key = prop(PROPS.API_KEY_GEMINI);
  if (!key) throw new ErrorApi('Falta API_KEY_GEMINI en Script Properties', 'config');
  const peticion: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': key, 'Api-Revision': API_REVISION },
    payload: JSON.stringify(cuerpo(o)),
    muteHttpExceptions: true,
  };

  for (let intento = 0; intento < 2; intento++) {
    const res = UrlFetchApp.fetch(URL_INTERACTIONS, peticion);
    const code = res.getResponseCode();
    const texto = res.getContentText();
    if (code === 200) return textoDeRespuesta(JSON.parse(texto));
    if ((code === 429 || code >= 500) && intento === 0) {
      Utilities.sleep(2000);
      continue;
    }
    let detalle = texto.slice(0, 300);
    try {
      detalle = (JSON.parse(texto) as { error?: { message?: string } }).error?.message ?? detalle;
    } catch {
      // se queda el texto crudo
    }
    throw new ErrorApi(`Gemini respondió ${code}: ${detalle}`, code === 429 ? 'cuota' : 'gemini');
  }
  throw new ErrorApi('Gemini no respondió', 'gemini');
}

/** Llama, parsea y valida con Zod. Si no valida, se descarta y se reintenta una vez. */
export function geminiJson<T>(o: OpcionesGemini, schema: ZodType<T>): T {
  let ultimo = '';
  for (let intento = 0; intento < 2; intento++) {
    const texto = llamarGemini(o);
    try {
      const r = schema.safeParse(extraerJson(texto));
      if (r.success) return r.data;
      ultimo = r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    } catch (e) {
      ultimo = mensajeError(e);
    }
  }
  throw new ErrorApi(`La respuesta de Gemini no tiene el formato esperado (${ultimo})`, 'gemini_formato');
}
