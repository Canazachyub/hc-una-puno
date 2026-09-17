// Revisor: campos faltantes, incoherencias entre secciones y redacción. No diagnostica.

import { GeminiRevisarSchema } from '../../shared/schemas';
import { CAMPOS_CLAVE, esVisible } from '../../shared/secciones';
import type { RevisarPayload, RevisarRespuesta } from '../../shared/types';
import { camposDe, knowledge } from './Catalogos';
import { plantillaDeHistoria } from './HC';
import { geminiJson } from './Gemini';
import { promptRevisar } from './Prompts';
import { requerir, requerirEpisodio } from './Util';

export function revisar(p: RevisarPayload): RevisarRespuesta {
  requerir(p.dni, 'dni');
  requerirEpisodio(p.episodio);
  const valores: Record<string, string> = {};
  for (const [k, v] of Object.entries(p.valores ?? {})) if (typeof v === 'string') valores[k] = v;

  const esquema = camposDe(plantillaDeHistoria(p.plantilla, p.dni, requerirEpisodio(p.episodio)));
  const visibles = esquema.filter((c) => esVisible(c.campo_id, valores) && !CAMPOS_CLAVE.includes(c.campo_id));
  const prompt = promptRevisar(visibles, valores, knowledge());
  const r = geminiJson(
    { sistema: prompt.sistema, partes: [{ type: 'text', text: prompt.entrada }], esquema: prompt.esquema, pensamiento: 'medium' },
    GeminiRevisarSchema,
  );

  const ids = new Set(visibles.map((c) => c.campo_id));
  const escribibles = new Set(visibles.filter((c) => ['narrativa', 'texto_largo', 'texto'].includes(c.tipo)).map((c) => c.campo_id));
  return {
    faltantes: r.faltantes.filter((f) => ids.has(f.campo)),
    incoherencias: r.incoherencias.map((i) => ({ ...i, campos: i.campos.filter((c) => ids.has(c)) })),
    // Solo se sugiere reescribir campos de texto libre y con contenido.
    redaccion: r.redaccion.filter((x) => escribibles.has(x.campo) && (valores[x.campo] ?? '').trim() !== '' && x.sugerido.trim() !== ''),
  };
}
