// Esquemas Zod. Toda respuesta de Gemini pasa por aquí antes de tocar el estado.

import * as z from 'zod';

const texto = z.string().default('');

export const GeminiOrganizarSchema = z.object({
  campos: z
    .array(
      z.object({
        id: z.string(),
        valor: z.string(),
        confianza: z.number().min(0).max(1).catch(0.5),
        detalles: z.array(z.object({ clave: z.string(), valor: z.string() })).optional().default([]),
      }),
    )
    .default([]),
  dudas: z.array(z.object({ pregunta: z.string().min(1), campo: texto })).default([]),
  escalas_sugeridas: z.array(z.object({ campo: z.string(), lista_id: z.string(), razon: texto })).default([]),
  conflictos: z.array(z.object({ campo: z.string(), registrado: texto, entrada: texto })).default([]),
});
export type GeminiOrganizar = z.infer<typeof GeminiOrganizarSchema>;

export const GeminiRevisarSchema = z.object({
  faltantes: z.array(z.object({ campo: z.string(), motivo: texto })).default([]),
  incoherencias: z.array(z.object({ campos: z.array(z.string()).default([]), descripcion: z.string() })).default([]),
  redaccion: z.array(z.object({ campo: z.string(), observacion: texto, sugerido: z.string() })).default([]),
});
export type GeminiRevisar = z.infer<typeof GeminiRevisarSchema>;

export const GeminiTranscribirSchema = z.string().trim().min(1, 'Transcripción vacía');

export const GeminiLaboratorioSchema = z.object({
  fecha: texto,
  resultados: z
    .array(
      z.object({
        examen: texto,
        parametro: z.string().min(1),
        valor: z.string().min(1),
        unidad: texto,
        referencia: texto,
        nota: texto,
      }),
    )
    .default([]),
  advertencias: z.array(z.string()).default([]),
});

export const GeminiRedactarSchema = z.object({
  texto: texto,
  soap: z
    .object({ subjetivo: texto, objetivo: texto, analisis: texto, plan: texto })
    .nullable()
    .optional()
    .transform((s) => s ?? null),
});

// Lo que el navegador acepta del backend para `entrada.organizar`.
export const OrganizarRespuestaSchema = z.object({
  campos: z.array(z.object({ id: z.string(), valor: z.string(), confianza: z.number() })),
  dudas: z.array(
    z.object({
      id: z.string(),
      seccion: z.string(),
      campo_id: z.string(),
      pregunta: z.string(),
      estado: z.enum(['pendiente', 'resuelta']),
      fecha: z.string(),
    }),
  ),
  escalas_sugeridas: z.array(z.object({ campo: z.string(), lista_id: z.string(), razon: z.string() })),
  conflictos: z.array(z.object({ campo: z.string(), registrado: z.string(), entrada: z.string() })),
  descartados: z.array(z.object({ campo: z.string(), valor: z.string(), motivo: z.string() })),
  registro_id: z.string(),
});

/** Quita cercas de código o texto alrededor del JSON. */
export function extraerJson(texto: string): unknown {
  const t = texto.trim();
  try {
    return JSON.parse(t);
  } catch {
    const ini = t.indexOf('{');
    const fin = t.lastIndexOf('}');
    if (ini >= 0 && fin > ini) return JSON.parse(t.slice(ini, fin + 1));
    throw new Error('La respuesta no es JSON');
  }
}
