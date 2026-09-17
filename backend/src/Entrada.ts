// Entrada libre: voz → transcripción literal; texto → campos, dudas, escalas y conflictos.

import { expandirAbreviaturas } from '../../shared/abreviaturas';
import { escalasDeCampo } from '../../shared/catalogo';
import { CAMPOS_CLAVE, esVisible } from '../../shared/secciones';
import { valoresClinicos } from '../../shared/seguimiento';
import { GeminiOrganizarSchema, GeminiTranscribirSchema } from '../../shared/schemas';
import type {
  CampoPropuesto,
  ConflictoEntrada,
  Descartado,
  Duda,
  OrganizarPayload,
  OrganizarRespuesta,
  TranscribirPayload,
  TranscribirRespuesta,
} from '../../shared/types';
import { clave, partes, unir, unirSinRepetir, validarValor } from '../../shared/valores';
import { camposDe, catalogos, knowledge } from './Catalogos';
import { plantillaDeHistoria } from './HC';
import { geminiJson, llamarGemini } from './Gemini';
import { PROMPT_TRANSCRIBIR, promptOrganizar } from './Prompts';
import { conLock, registrar } from './Repo';
import { carpetaDatos } from './Drive';
import { ErrorApi, ahora, hoy, requerir, requerirEpisodio } from './Util';

const EXTENSIONES: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/opus': 'opus',
  'audio/mp4': 'm4a',
  'audio/m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/flac': 'flac',
};

function mimeLimpio(mime: string): string {
  const m = mime.split(';')[0].trim().toLowerCase();
  if (m === 'audio/x-m4a') return 'audio/m4a';
  if (m === 'audio/x-wav' || m === 'audio/wave') return 'audio/wav';
  return m;
}

function guardarAudio(p: TranscribirPayload, mime: string): string {
  const carpeta = carpetaDatos();
  const bytes = Utilities.base64Decode(p.audioBase64);
  const sello = Utilities.formatDate(new Date(), 'America/Lima', 'yyyyMMdd-HHmmss');
  const nombre = `${p.dni}-ep${p.episodio}-${p.seccion.replace(/\*/g, 'todo')}-${sello}.${EXTENSIONES[mime] ?? 'audio'}`;
  const archivo = carpeta.createFile(Utilities.newBlob(bytes, mime, nombre));
  return archivo.getId();
}

export function transcribir(p: TranscribirPayload): TranscribirRespuesta {
  const dni = requerir(p.dni, 'dni');
  const episodio = requerirEpisodio(p.episodio);
  requerir(p.audioBase64, 'audio');
  const mime = mimeLimpio(requerir(p.mime, 'mime'));
  if (!mime.startsWith('audio/')) throw new ErrorApi(`Formato no soportado: ${mime}`, 'payload');
  // Límite de 20 MB por petición a Gemini, en base64.
  if (p.audioBase64.length > 19 * 1024 * 1024) throw new ErrorApi('El audio pasa de 14 MB; grábalo en partes', 'payload');

  const driveId = guardarAudio(p, mime);
  const texto = llamarGemini({
    partes: [
      { type: 'text', text: PROMPT_TRANSCRIBIR },
      { type: 'audio', data: p.audioBase64, mime_type: mime },
    ],
    pensamiento: 'low',
    maxTokens: 32000,
  });
  const transcripcion = GeminiTranscribirSchema.parse(texto);

  const [registroId] = conLock(() =>
    registrar([
      {
        tipo: 'audio',
        dni,
        episodio,
        seccion: p.seccion,
        contenido: JSON.stringify({ drive_file_id: driveId, mime, transcripcion }),
      },
    ]),
  );
  return { transcripcion, registro_id: registroId, drive_file_id: driveId };
}

const NARRATIVOS = new Set(['narrativa', 'texto_largo']);
const TEXTO_LIBRE = new Set(['narrativa', 'texto_largo', 'texto', 'lista']);
const ACUMULABLES = new Set(['multi', 'lista']);

export function organizar(p: OrganizarPayload): OrganizarRespuesta {
  const dni = requerir(p.dni, 'dni');
  const episodio = requerirEpisodio(p.episodio);
  const seccion = requerir(p.seccion, 'seccion');
  const texto = typeof p.texto === 'string' ? p.texto : '';
  if (!texto.trim() && p.campo_objetivo !== 'dx.resumen') throw new ErrorApi('La entrada está vacía', 'payload');
  const origen = p.origen === 'voz' ? 'voz' : 'texto';
  const contexto: Record<string, string> = {};
  for (const [k, v] of Object.entries(valoresClinicos(p.contexto ?? {}))) if (typeof v === 'string' && v.trim()) contexto[k] = v;

  const { opciones, listas } = catalogos();
  const esquema = camposDe(plantillaDeHistoria(p.plantilla, dni, episodio));
  let campos = esquema.filter(
    (c) =>
      (seccion === '*' || c.seccion === seccion) &&
      c.tipo !== 'calculado' &&
      !CAMPOS_CLAVE.includes(c.campo_id) &&
      esVisible(c.campo_id, contexto),
  );
  if (p.campo_objetivo) campos = campos.filter((c) => c.campo_id === p.campo_objetivo);
  if (campos.length === 0) throw new ErrorApi('No hay campos para esa sección', 'payload');

  // El texto crudo se guarda siempre como evidencia.
  const [registroId] = texto.trim()
    ? conLock(() =>
        registrar([
          {
            tipo: 'entrada',
            dni,
            episodio,
            seccion,
            campo_id: p.campo_objetivo ?? '',
            contenido: texto,
            estado: origen,
          },
        ]),
      )
    : [''];

  const prompt = promptOrganizar({
    seccion,
    campos,
    todoElEsquema: esquema,
    opciones,
    kb: knowledge(),
    contexto,
    texto,
    origen,
    campoObjetivo: p.campo_objetivo,
    hoy: hoy(),
  });
  const r = geminiJson(
    { sistema: prompt.sistema, partes: [{ type: 'text', text: prompt.entrada }], esquema: prompt.esquema, pensamiento: 'medium' },
    GeminiOrganizarSchema,
  );

  const porId = new Map(campos.map((c) => [c.campo_id, c]));
  const aceptados: CampoPropuesto[] = [];
  const descartados: Descartado[] = [];
  const conflictos: ConflictoEntrada[] = r.conflictos.filter((c) => porId.has(c.campo));
  const preguntas = [...r.dudas];

  for (const cp of r.campos) {
    const campo = porId.get(cp.id);
    if (!campo) {
      descartados.push({ campo: cp.id, valor: cp.valor, motivo: 'campo fuera de la sección' });
      continue;
    }
    if (conflictos.some((c) => c.campo === cp.id)) continue;
    const detalles = Object.fromEntries(cp.detalles.map((d) => [d.clave.toLowerCase(), d.valor]));
    const v = validarValor(campo, cp.valor, listas, detalles);
    if (!v.ok) {
      descartados.push({ campo: cp.id, valor: cp.valor, motivo: v.motivo });
      preguntas.push({ pregunta: `Precisar ${campo.label.toLowerCase()} (lo dictado no coincide con la lista)`, campo: cp.id });
      continue;
    }
    if (!v.valor) continue;
    // Red de seguridad: aunque el prompt lo prohíbe, ninguna abreviatura llega a la historia.
    let valor = TEXTO_LIBRE.has(campo.tipo) ? expandirAbreviaturas(v.valor) : v.valor;
    const registrado = contexto[cp.id] ?? '';

    if (registrado && ACUMULABLES.has(campo.tipo)) {
      // Se suma, no se pisa.
      valor = unir(unirSinRepetir(partes(registrado), partes(valor)));
    } else if (registrado && !NARRATIVOS.has(campo.tipo) && clave(registrado) !== clave(valor)) {
      conflictos.push({ campo: cp.id, registrado, entrada: valor });
      continue;
    }
    if (valor === registrado) continue;
    aceptados.push({ id: cp.id, valor, confianza: cp.confianza });
  }

  const idsCampos = new Set(esquema.map((c) => c.campo_id));
  const dudasNuevas = preguntas
    .slice(0, 10)
    .map((d) => ({ pregunta: d.pregunta.trim(), campo: idsCampos.has(d.campo) ? d.campo : '' }))
    .filter((d) => d.pregunta);
  const fecha = ahora();
  const idsDudas = dudasNuevas.length
    ? conLock(() =>
        registrar(
          dudasNuevas.map((d) => ({
            tipo: 'duda' as const,
            dni,
            episodio,
            seccion: esquema.find((c) => c.campo_id === d.campo)?.seccion ?? seccion,
            campo_id: d.campo,
            contenido: d.pregunta,
            estado: 'pendiente',
          })),
        ),
      )
    : [];
  const dudas: Duda[] = dudasNuevas.map((d, i) => ({
    id: idsDudas[i],
    seccion: esquema.find((c) => c.campo_id === d.campo)?.seccion ?? seccion,
    campo_id: d.campo,
    pregunta: d.pregunta,
    estado: 'pendiente',
    fecha,
  }));

  return {
    campos: aceptados,
    dudas,
    // Solo escalas que corresponden a ese campo según la teoría (nada de Bristol en la cabeza).
    escalas_sugeridas: r.escalas_sugeridas.filter((e) => {
      const campo = porId.get(e.campo);
      return !!campo && escalasDeCampo(campo, listas).includes(e.lista_id);
    }),
    conflictos,
    descartados,
    registro_id: registroId,
  };
}
