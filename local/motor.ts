// Hilo que ejecuta el backend de Apps Script. Atiende las peticiones de una en una, como Apps Script,
// sin bloquear al servidor que entrega la app.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { parentPort, workerData } from 'node:worker_threads';
import { parsearCsv } from '../shared/csv';
import { VERSION_MIGRACION, migrarValor } from '../shared/migraciones';
import { crearEntorno } from './gas-node';

export interface DatosMotor {
  codigo: string;
  carpeta: string;
  entorno: Record<string, string>;
  knowledgeCsv: string;
  /** seed/esquema.csv y seed/opciones.csv */
  semillas: string[];
  respaldosExtra?: string;
}

export type MensajeMotor =
  | { tipo: 'api'; id: number; contenido: string }
  | { tipo: 'log'; texto: string }
  | { tipo: 'listo'; primerAcceso: { usuario: string; clave: string } | null; fragmentos: number };

const datos = workerData as DatosMotor;
const enviar = (m: MensajeMotor) => parentPort?.postMessage(m);

const env = crearEntorno({
  carpeta: datos.carpeta,
  entorno: datos.entorno,
  respaldosExtra: datos.respaldosExtra,
  log: (texto) => enviar({ tipo: 'log', texto }),
});
const ctx = vm.createContext({ ...env.globales });
vm.runInContext(datos.codigo, ctx, { filename: 'Code.js' });
const gas = ctx as unknown as Record<string, (...a: unknown[]) => unknown>;

// Primera vez: crea las hojas, el usuario y la contraseña temporal.
let primerAcceso: { usuario: string; clave: string } | null = null;
const recienCreado = !env.props.get('SPREADSHEET_ID');
if (recienCreado) {
  gas.setup();
  const linea = env.logs.find((l) => l.startsWith('ACCESO')) ?? '';
  const m = /Usuario: (\S+) · Contraseña temporal: (\S+)/.exec(linea);
  if (m) primerAcceso = { usuario: m[1], clave: m[2] };
}

// Esquema y Opciones: si cambian los CSV semilla, se reimportan (las columnas nuevas de HC se agregan al final).
const hashSemillas = createHash('md5')
  .update(datos.semillas.map((f) => readFileSync(f, 'utf8')).join('\n'))
  .digest('hex');
if (env.props.get('SEMILLA_HASH') !== hashSemillas) {
  if (!recienCreado) {
    gas.reimportarSemillas();
    enviar({ tipo: 'log', texto: 'Esquema y opciones actualizados desde seed/' });
  }
  env.props.set('SEMILLA_HASH', hashSemillas);
  env.guardarProps();
  env.guardar();
}

// Valores guardados con formatos anteriores (EVA 6/10, ROT 2+/4+…) → formato sin abreviaturas.
if (Number(env.props.get('MIGRACION') ?? 0) < VERSION_MIGRACION) {
  const hoja = [...env.libros.values()][0]?.getSheetByName('HC');
  let cambios = 0;
  if (hoja) {
    hoja.datos.forEach((fila, r) => {
      if (r === 0) return;
      fila.forEach((celda, c) => {
        const nuevo = celda.includes('|') ? celda.split(' | ').map(migrarValor).join(' | ') : migrarValor(celda);
        if (nuevo !== celda) {
          fila[c] = nuevo;
          cambios++;
        }
      });
    });
    if (cambios) hoja.sucia = true;
  }
  env.props.set('MIGRACION', String(VERSION_MIGRACION));
  env.guardarProps();
  env.guardar();
  if (cambios) enviar({ tipo: 'log', texto: `${cambios} valores actualizados al formato sin abreviaturas` });
}

// Notas de Semiología: se cargan cuando cambian.
function importarKnowledge(): number {
  const hoja = [...env.libros.values()][0]?.getSheetByName('Knowledge');
  if (!hoja) return 0;
  if (!existsSync(datos.knowledgeCsv)) return Math.max(0, hoja.getLastRow() - 1);
  const texto = readFileSync(datos.knowledgeCsv, 'utf8');
  const hash = createHash('md5').update(texto).digest('hex');
  if (env.props.get('KB_HASH') !== hash) {
    hoja.cargarCsv(texto);
    hoja.sucia = true;
    env.props.set('KB_HASH', hash);
    env.props.set('KB_VERSION', hash.slice(0, 12));
    env.guardarProps();
    env.guardar();
  }
  return Math.max(0, parsearCsv(texto).length - 1);
}
const fragmentos = importarKnowledge();

// Respaldo diario con 30 días de retención.
function respaldar(): void {
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
  const hecho = existsSync(env.dirRespaldos) && readdirSync(env.dirRespaldos).some((d) => d.endsWith(hoy));
  if (hecho) return;
  try {
    env.guardar();
    gas.respaldoDiario();
    enviar({ tipo: 'log', texto: `Respaldo del ${hoy} guardado en ${join(env.dirRespaldos, `HC respaldo ${hoy}`)}` });
  } catch (e) {
    enviar({ tipo: 'log', texto: `No se pudo respaldar: ${e instanceof Error ? e.message : String(e)}` });
  }
}
respaldar();
setInterval(respaldar, 3 * 3600 * 1000);

parentPort?.on('message', (m: { tipo: 'api'; id: number; cuerpo: string }) => {
  if (m.tipo !== 'api') return;
  let contenido: string;
  try {
    contenido = (gas.doPost({ postData: { contents: m.cuerpo } }) as { getContent(): string }).getContent();
  } catch (e) {
    contenido = JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e), codigo: 'interno' });
  }
  try {
    env.guardar();
  } catch (e) {
    contenido = JSON.stringify({ ok: false, error: `No se pudo guardar en disco: ${e instanceof Error ? e.message : String(e)}`, codigo: 'interno' });
  }
  enviar({ tipo: 'api', id: m.id, contenido });
});

enviar({ tipo: 'listo', primerAcceso, fragmentos });
