// Notas de Semiología (Markdown) → hoja Knowledge.
// Trocea cada clase por encabezado de nivel 2, asigna cada trozo a una sección de la HC
// y lo sube con la acción kb.cargar. Siempre deja una copia en seed/knowledge.csv.
//
// Uso: npm run kb:build            (sube si hay VITE_API_URL, HC_USUARIO y HC_CLAVE en .env.local)
//      npm run kb:build -- --solo-csv

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { serializarCsv } from '../shared/csv';
import { COLUMNAS_KNOWLEDGE } from '../shared/types';
import type { KnowledgeFila, LoginRespuesta } from '../shared/types';
import { RAIZ, leerEnv, post } from './entorno';

const MAX_TROZO = 45_000;
const MAX_LOTE = 400_000;

const ENV = leerEnv();
const CARPETA =
  ENV.HC_NOTAS_DIR ??
  'C:\\Users\\User\\Documents\\CEREBRO DIGITAL\\MEDICINA UNAP\\MEDICINA UNAP\\wiki\\SEMIOLOGIA\\clases';

// ---------- Mapa clase → sección ----------

interface Destino {
  seccion: string;
  tag: string;
}

const d = (seccion: string, tag = `kb.${seccion}`): Destino => ({ seccion, tag });

const EF_TECNICA = d('ef_regiones', 'kb.ef_tecnica');
const ECTO = d('ectoscopia', 'kb.ectoscopia');
const VITALES = d('ef_general', 'kb.ef_vitales');
const CABEZA = d('ef_regiones', 'kb.ef_cabeza');
const CUELLO = d('ef_regiones', 'kb.ef_cuello');
const TORAX = d('ef_regiones', 'kb.ef_torax');
const CARDIO = d('ef_regiones', 'kb.ef_cardio');
const ABDOMEN = d('ef_regiones', 'kb.ef_abdomen');
const GU = d('ef_regiones', 'kb.ef_gu');
const NEURO = d('ef_regiones', 'kb.ef_neuro');
const EDEMA = d('ef_regiones', 'kb.ef_edema');
const RELATO = d('enfermedad_actual', 'kb.relato');
const SINTOMAS = d('enfermedad_actual', 'kb.sintomas');
const DX = d('diagnostico', 'kb.dx');
const RESUMEN = d('diagnostico', 'kb.resumen');
const EXAMENES = d('examenes', 'kb.examenes');
const FILIACION = d('filiacion', 'kb.filiacion');
const PERSONALES = d('ant_personales', 'kb.personales');
const FISIOLOGICOS = d('ant_fisiologicos', 'kb.fisiologicos');
const PATOLOGICOS = d('ant_patologicos', 'kb.patologicos');
const FAMILIARES = d('ant_familiares', 'kb.familiares');
const FUNCIONES = d('funciones_biologicas', 'kb.funciones');
const GENERAL = d('general', 'kb.general');

/** Destino por defecto de cada clase (prefijo del archivo). `mixto` permite reasignar por título. */
const POR_ARCHIVO: Record<string, { destino: Destino; mixto?: boolean } | null> = {
  '01': { destino: GENERAL, mixto: true },
  '02a': { destino: RELATO, mixto: true },
  '02b': { destino: PERSONALES, mixto: true },
  '02c': { destino: FUNCIONES, mixto: true },
  '03': { destino: EF_TECNICA },
  '03b': { destino: EF_TECNICA, mixto: true },
  '05a': { destino: ECTO },
  '05b': { destino: ECTO },
  '05c': { destino: d('ef_general', 'kb.ef_somatometria') },
  '05d': { destino: VITALES },
  '05e': { destino: VITALES },
  '05f': { destino: ECTO },
  '05g': { destino: EDEMA },
  '05h': { destino: VITALES },
  '05i': { destino: ECTO },
  '05j': { destino: CUELLO },
  '05k': { destino: ECTO },
  '06a': { destino: CABEZA },
  '06b': { destino: CABEZA },
  '06c': { destino: CUELLO },
  '07a': { destino: SINTOMAS },
  '07b': { destino: TORAX },
  '07c': { destino: TORAX },
  '07d': { destino: TORAX },
  '07e': { destino: DX },
  '07f': { destino: DX },
  '07g': { destino: EXAMENES },
  '08a': { destino: SINTOMAS, mixto: true },
  '08a2': { destino: SINTOMAS, mixto: true },
  '08b': { destino: CARDIO },
  '08c': { destino: CARDIO },
  '08d': { destino: CARDIO },
  '08e': { destino: CARDIO },
  '08f': { destino: EXAMENES },
  '08g': { destino: DX },
  '08h': { destino: DX },
  '08i': { destino: DX },
  '08j': { destino: EXAMENES },
  '08k': { destino: EXAMENES },
  '08l': { destino: EXAMENES },
  '09a': { destino: SINTOMAS },
  '09b': { destino: ABDOMEN },
  '09c': { destino: EXAMENES, mixto: true },
  '09d': { destino: ABDOMEN, mixto: true },
  '09e': { destino: DX },
  '09f': { destino: DX },
  '09g': { destino: DX },
  '09h': { destino: FILIACION, mixto: true },
  '10a': { destino: SINTOMAS, mixto: true },
  '10b': { destino: GU, mixto: true },
  '10c': { destino: DX },
  '11a': { destino: SINTOMAS, mixto: true },
  '11b': { destino: NEURO },
  '11c': { destino: NEURO },
  '11d': { destino: NEURO },
  '11e': { destino: DX, mixto: true },
  '11f': { destino: NEURO },
  '11g': { destino: SINTOMAS },
  '11h': { destino: NEURO },
  '11i': { destino: NEURO },
  '11j': { destino: NEURO, mixto: true },
  '12a': { destino: SINTOMAS, mixto: true },
  '12b': { destino: SINTOMAS, mixto: true },
  '12c': { destino: SINTOMAS, mixto: true },
  '13a': { destino: CUELLO, mixto: true },
  '13b': { destino: DX },
  // Los repasos repiten las clases: no se cargan.
  R1: null,
  R2: null,
};

/** Reasignación por título en clases mixtas. El primer patrón que coincide gana. */
const POR_TITULO: [RegExp, Destino][] = [
  [/errores frecuentes/i, { seccion: '', tag: '' }], // se queda en el destino de la clase
  [/identificaci[oó]n|filiaci[oó]n|sexo, raza|motivo de consulta/i, FILIACION],
  [/h[aá]bitos|socioecon[oó]mic|profesi[oó]n/i, PERSONALES],
  [/fisiol[oó]gic/i, FISIOLOGICOS],
  [/antecedentes familiares/i, FAMILIARES],
  [/antecedentes (personales|patol[oó]gic)|cardi[oó]pata$/i, PATOLOGICOS],
  [/revisi[oó]n de sistemas/i, FUNCIONES],
  [/cierre de la historia|resumen/i, RESUMEN],
  [/enfermedad actual|s[ií]ntoma gu[ií]a|tipos de anamnesis|sem[ií]olog[ií]a del dolor/i, RELATO],
  [/^dolor|s[ií]ntomas|anamnesis|cefalea|v[eé]rtigo|trastornos de la audici[oó]n|historia cl[ií]nica neurol/i, SINTOMAS],
  [/signos mening/i, NEURO],
  [/marcha|facies y actitud|nivel de conciencia/i, ECTO],
  [/ex[aá]menes|examen de orina|pruebas|radiograf|ecograf|tomograf|endoscop|lcr|eeg|neuroim|paracentesis|t[eé]cnicas complementarias/i, EXAMENES],
  [/evaluaci[oó]n|exploraci[oó]n|examen f[ií]sico|palpaci[oó]n|inspecci[oó]n|puño-percusi[oó]n|tacto/i, { seccion: 'ef_regiones', tag: '' }],
  [/s[ií]ndrome|hepatitis|cirrosis|colecistitis|pancreatitis|hiperfunci[oó]n|hipofunci[oó]n|hipotiroid|hipertiroid|coma|convulsivo|hipertensi[oó]n endocraneana|tallo cerebral|diagn[oó]stico/i, DX],
];

/** Región del examen físico que corresponde a cada aparato. */
function exploracionDe(prefijo: string): Destino {
  if (/^1[12]/.test(prefijo)) return NEURO;
  if (prefijo.startsWith('13')) return CUELLO;
  if (prefijo.startsWith('10')) return GU;
  if (prefijo.startsWith('09')) return ABDOMEN;
  if (prefijo.startsWith('08')) return CARDIO;
  if (prefijo.startsWith('07')) return TORAX;
  return EF_TECNICA;
}

function destinoDe(prefijo: string, titulo: string): Destino | null {
  const base = POR_ARCHIVO[prefijo];
  if (base === null) return null;
  const def = base?.destino ?? GENERAL;
  if (!base?.mixto) return def;
  for (const [re, dest] of POR_TITULO) {
    if (!re.test(titulo)) continue;
    if (!dest.seccion) return def;
    // "exploración" dentro de una clase de exploración: conserva la etiqueta de la clase.
    if (!dest.tag) return def.seccion === dest.seccion ? def : exploracionDe(prefijo);
    return dest;
  }
  return def;
}

// ---------- Limpieza del Markdown de Obsidian ----------

const OMITIR = /^(flashcards|fuente|fuentes)$/i;

function limpiar(md: string): string {
  return md
    .replace(/```mermaid[\s\S]*?```/g, '')
    .replace(/!\[\[[^\]]*\]\]/g, '')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, (_, x: string) => x.split('/').pop() ?? x)
    .replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/^>\s*\[!(\w+)\][-+]?\s*(.*)$/gm, (_, tipo: string, t: string) => (t ? `${t}:` : `${tipo}:`))
    .replace(/^>\s?/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function partir(texto: string): string[] {
  if (texto.length <= MAX_TROZO) return [texto];
  const trozos: string[] = [];
  let actual = '';
  for (const p of texto.split(/\n\n/)) {
    if (actual && actual.length + p.length + 2 > MAX_TROZO) {
      trozos.push(actual);
      actual = '';
    }
    actual = actual ? `${actual}\n\n${p}` : p.slice(0, MAX_TROZO);
  }
  if (actual) trozos.push(actual);
  return trozos;
}

function procesar(archivo: string): KnowledgeFila[] {
  const nombre = basename(archivo);
  const prefijo = nombre.split('_')[0];
  const crudo = readFileSync(archivo, 'utf8').replace(/^---[\s\S]*?\n---\n/, '');
  const h1 = /^#\s+(.+)$/m.exec(crudo)?.[1].trim() ?? nombre;
  const filas: KnowledgeFila[] = [];
  const bloques = crudo.split(/^##\s+/m).slice(1);
  let n = 0;
  for (const bloque of bloques) {
    const [primera, ...resto] = bloque.split('\n');
    const titulo = primera.replace(/^\d+\s*·\s*/, '').replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, '$1').trim();
    if (OMITIR.test(titulo)) continue;
    const destino = destinoDe(prefijo, titulo);
    if (!destino) continue;
    const contenido = limpiar(resto.join('\n').replace(/^---\s*$/gm, ''));
    if (contenido.length < 80) continue;
    const partes = partir(contenido);
    partes.forEach((parte, i) => {
      n++;
      filas.push({
        id: `${destino.tag}.${prefijo}.${n}`,
        seccion: destino.seccion,
        titulo: `${h1} · ${titulo}${partes.length > 1 ? ` (parte ${i + 1})` : ''}`,
        contenido: parte,
        origen_archivo: nombre,
      });
    });
  }
  return filas;
}

// ---------- Subida ----------

async function subir(filas: KnowledgeFila[]): Promise<void> {
  const url = ENV.HC_API_URL ?? ENV.VITE_API_URL;
  if (!url || !ENV.HC_USUARIO || !ENV.HC_CLAVE) {
    console.log('Sin VITE_API_URL, HC_USUARIO o HC_CLAVE en .env.local: solo se generó el CSV.');
    return;
  }
  const { token } = await post<LoginRespuesta>(url, {
    action: 'auth.login',
    token: '',
    payload: { usuario: ENV.HC_USUARIO, clave: ENV.HC_CLAVE },
  });
  const lotes: KnowledgeFila[][] = [];
  let lote: KnowledgeFila[] = [];
  let tam = 0;
  for (const f of filas) {
    if (lote.length && tam + f.contenido.length > MAX_LOTE) {
      lotes.push(lote);
      lote = [];
      tam = 0;
    }
    lote.push(f);
    tam += f.contenido.length;
  }
  if (lote.length) lotes.push(lote);

  try {
    for (const [i, l] of lotes.entries()) {
      const r = await post<{ total: number }>(url, {
        action: 'kb.cargar',
        token,
        payload: { filas: l, reemplazar: i === 0 },
      }).catch((e: unknown) => {
        throw new Error(`Lote ${i + 1}: ${e instanceof Error ? e.message : String(e)}`);
      });
      console.log(`Lote ${i + 1}/${lotes.length} cargado · ${r.total} filas en Knowledge`);
    }
  } finally {
    await post(url, { action: 'auth.salir', token, payload: {} }).catch(() => undefined);
  }
}

async function main(): Promise<void> {
  if (!existsSync(CARPETA)) throw new Error(`No existe la carpeta de notas: ${CARPETA}`);
  const archivos = readdirSync(CARPETA)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => join(CARPETA, f));
  const filas = archivos.flatMap(procesar);

  const csv = serializarCsv([[...COLUMNAS_KNOWLEDGE], ...filas.map((f) => COLUMNAS_KNOWLEDGE.map((c) => f[c]))]);
  writeFileSync(join(RAIZ, 'seed', 'knowledge.csv'), csv);

  const porSeccion = new Map<string, number>();
  for (const f of filas) porSeccion.set(f.seccion, (porSeccion.get(f.seccion) ?? 0) + 1);
  console.log(`${archivos.length} clases → ${filas.length} fragmentos (${Math.round(csv.length / 1024)} KB)`);
  for (const [s, n] of [...porSeccion.entries()].sort()) console.log(`  ${s.padEnd(22)} ${n}`);

  if (!process.argv.includes('--solo-csv')) await subir(filas);
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
