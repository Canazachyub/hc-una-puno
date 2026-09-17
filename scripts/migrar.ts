// Historias del servidor local (datos/hojas/HC.csv) → servidor en línea (Apps Script).
// Crea las que faltan con su mismo episodio. En las que ya existen solo llena lo vacío y junta las
// evoluciones y los resultados de laboratorio; nunca pisa lo que ya está en el servidor. No borra nada del local.
//
// Uso: npm run migrar -- --simular     (muestra qué haría, sin escribir)
//      npm run migrar
// Variables (.env.local o del sistema): HC_API_URL o VITE_API_URL (la dirección …/exec), HC_USUARIO, HC_CLAVE
// y HC_DATOS_DIR (por defecto datos/). --permitir-http solo para probar contra otro servidor local.

import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parsearCsv } from '../shared/csv';
import { CAMPOS_CLAVE } from '../shared/secciones';
import {
  CAMPO_EVOLUCIONES,
  esCampoSistema,
  escribirEvoluciones,
  escribirLaboratorio,
  leerEvoluciones,
  leerLaboratorio,
} from '../shared/seguimiento';
import { COLUMNAS_CONTROL } from '../shared/types';
import type { CampoGuardar, EstadoHC, ListarRespuesta, ResumenHC } from '../shared/types';
import { RAIZ, leerEnv, sesion } from './entorno';

const simular = process.argv.includes('--simular');
const ENV = leerEnv();
const url = ENV.HC_API_URL ?? ENV.VITE_API_URL ?? '';
const archivo = join(ENV.HC_DATOS_DIR ?? join(RAIZ, 'datos'), 'hojas', 'HC.csv');

interface Local {
  dni: string;
  episodio: number;
  estado: string;
  completitud: string;
  valores: Record<string, string>;
}

function leerLocales(): Local[] {
  if (!existsSync(archivo)) throw new Error(`No existe ${archivo}`);
  const [cabecera, ...filas] = parsearCsv(readFileSync(archivo, 'utf8').replace(/^\uFEFF/, ''));
  const control = new Set<string>(COLUMNAS_CONTROL);
  return filas
    .map((f) => {
      const m = Object.fromEntries(cabecera.map((c, i) => [c, f[i] ?? '']));
      const valores: Record<string, string> = {};
      for (const c of cabecera) if (!control.has(c) && !CAMPOS_CLAVE.includes(c) && m[c] !== '') valores[c] = m[c];
      return { dni: m.dni, episodio: Number(m.episodio), estado: m.estado, completitud: m.completitud, valores };
    })
    .filter((h) => /^\d{8}$/.test(h.dni) && h.episodio >= 1)
    .sort((a, b) => a.dni.localeCompare(b.dni) || a.episodio - b.episodio);
}

/** Une dos listas JSON por id; lo del servidor manda. */
function unirSistema(id: string, servidor: string, local: string): string {
  if (id === CAMPO_EVOLUCIONES) {
    const s = leerEvoluciones(servidor);
    const ids = new Set(s.map((x) => x.id));
    return escribirEvoluciones([...s, ...leerEvoluciones(local).filter((x) => !ids.has(x.id))]);
  }
  const s = leerLaboratorio(servidor);
  const ids = new Set(s.map((x) => x.id));
  return escribirLaboratorio([...s, ...leerLaboratorio(local).filter((x) => !ids.has(x.id))]);
}

async function main(): Promise<void> {
  if (!url || !ENV.HC_USUARIO || !ENV.HC_CLAVE) throw new Error('Faltan HC_API_URL (o VITE_API_URL), HC_USUARIO o HC_CLAVE en .env.local');
  if (!url.startsWith('https://') && !process.argv.includes('--permitir-http')) {
    throw new Error(`El destino debe ser la dirección https del Web App (…/exec), no ${url}`);
  }
  const locales = leerLocales();
  console.log(`${locales.length} historias en ${archivo}`);
  console.log(`Destino: ${url}${simular ? ' (simulación: no se escribe nada)' : ''}\n`);

  const api = await sesion(url, ENV.HC_USUARIO, ENV.HC_CLAVE);
  try {
    const cat = await api.llamar('catalogos.get', { desde: '' });
    if ('sinCambios' in cat) throw new Error('El servidor no devolvió el esquema');
    const conocidos = new Set(cat.esquema.map((c) => c.campo_id));

    const remotas = new Map<string, ResumenHC>();
    let cursor: number | null = 0;
    while (cursor !== null) {
      const r: ListarRespuesta = await api.llamar('hc.list', { limite: 500, cursor });
      for (const f of r.filas) remotas.set(`${f.dni}~${f.episodio}`, f);
      cursor = r.cursor;
    }

    const total = { creadas: 0, completadas: 0, campos: 0, diferencias: 0, sinCambios: 0 };
    const omitidos = new Set<string>();
    for (const h of locales) {
      const clave = `${h.dni} episodio ${h.episodio}`;
      const utiles = Object.entries(h.valores).filter(([id]) => {
        const ok = conocidos.has(id) || esCampoSistema(id);
        if (!ok) omitidos.add(id);
        return ok;
      });
      const remota = remotas.get(`${h.dni}~${h.episodio}`);
      const campos: CampoGuardar[] = [];
      const distintos: string[] = [];
      let version = 0;

      if (!remota) {
        for (const [id, valor] of utiles) campos.push({ id, valor, base: '' });
      } else {
        const { fila } = await api.llamar('hc.get', { dni: h.dni, episodio: h.episodio });
        version = fila.version;
        for (const [id, valor] of utiles) {
          const actual = fila.valores[id] ?? '';
          if (actual === valor) continue;
          if (actual === '') campos.push({ id, valor, base: '' });
          else if (esCampoSistema(id)) {
            const unido = unirSistema(id, actual, valor);
            if (unido !== actual) campos.push({ id, valor: unido, base: actual });
          } else distintos.push(id);
        }
      }

      if (!remota) total.creadas++;
      else if (campos.length) total.completadas++;
      else if (!distintos.length) total.sinCambios++;
      total.campos += campos.length;
      total.diferencias += distintos.length;
      const accion = !remota ? `crear con ${campos.length} campos` : campos.length ? `llenar ${campos.length} campos vacíos` : 'sin cambios';
      console.log(`· ${clave}: ${accion}${distintos.length ? ` · ${distintos.length} distintos en el servidor, no se tocan: ${distintos.join(', ')}` : ''}`);
      if (simular || (!campos.length && remota)) continue;

      const r = await api.llamar(
        'hc.guardar',
        {
          dni: h.dni,
          episodio: h.episodio,
          version,
          campos,
          ...(!remota && h.estado ? { estado: h.estado as EstadoHC } : {}),
          ...(!remota && h.completitud ? { completitud: Number(h.completitud) } : {}),
        },
        randomUUID(),
      );
      if (r.conflictos.length) console.log(`  ${r.conflictos.length} cambiaron en el servidor mientras tanto y no se tocaron: ${r.conflictos.map((c) => c.id).join(', ')}`);
    }

    console.log(
      `\n${simular ? 'Se haría' : 'Listo'}: ${total.creadas} creadas · ${total.completadas} completadas (${total.campos} campos) · ${total.sinCambios} sin cambios · ${total.diferencias} campos distintos sin tocar`,
    );
    if (omitidos.size) console.log(`Columnas que el servidor no conoce (no se subieron): ${[...omitidos].join(', ')}`);
    console.log('Los audios, las fotos y las dudas quedan en el servidor local.');
  } finally {
    await api.cerrar();
  }
}

main().catch((e: unknown) => {
  console.error(`✗ ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
