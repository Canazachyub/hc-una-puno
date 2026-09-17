// Empaqueta src/ en un solo dist/Code.js para Apps Script.
// Apps Script no entiende módulos: el paquete va en un IIFE y se exponen las funciones
// globales que el editor y la Web App necesitan ver.

import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const GLOBALES = [
  'doGet',
  'doPost',
  'setup',
  'restablecerClave',
  'reimportarSemillas',
  'instalarRespaldo',
  'respaldoDiario',
  'probarGemini',
  'guardarClaveGemini',
];

// Si cambian las semillas, el servidor desplegado reimporta Esquema y Opciones en la primera petición.
const semillas = ['../seed/esquema.csv', '../seed/opciones.csv'].map((f) => readFileSync(f, 'utf8')).join('\n');
const SEMILLA_VERSION = createHash('md5').update(semillas).digest('hex').slice(0, 12);

mkdirSync('dist', { recursive: true });

// Hoja y carpeta de Drive del dueño: en .env.local (no se sube). Van a Config.js (clasp) y al inicio de Code.gs (pegar).
const env = {};
if (existsSync('../.env.local')) {
  for (const linea of readFileSync('../.env.local', 'utf8').split(/\r?\n/)) {
    const m = /^\s*(HC_HOJA|HC_CARPETA_DRIVE)\s*=\s*(.*?)\s*$/.exec(linea);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const texto = (v) => JSON.stringify(v ?? '');
const CONFIG = `// ─── Configuración de HC App ───
// hoja: enlace de la hoja de cálculo de los datos (vacío = la hoja donde está este script, o una nueva).
// carpeta: enlace de la carpeta de Drive para audios, fotos y respaldos (vacío = se crea «HC App»).
// Las dos deben quedar en «Restringido»: si están compartidas con cualquiera, el servidor no las usa.
var HC_CONFIG = {
  hoja: ${texto(env.HC_HOJA)},
  carpeta: ${texto(env.HC_CARPETA_DRIVE)},
};
`;
if (env.HC_HOJA || env.HC_CARPETA_DRIVE) writeFileSync('dist/Config.js', CONFIG);
else rmSync('dist/Config.js', { force: true });

const resultado = await build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  format: 'iife',
  globalName: '__hc',
  target: 'es2019',
  platform: 'neutral',
  mainFields: ['module', 'main'],
  loader: { '.csv': 'text' },
  outfile: 'dist/Code.js',
  write: false,
  legalComments: 'none',
  define: { SEMILLA_VERSION: JSON.stringify(SEMILLA_VERSION) },
  logLevel: 'info',
});

const bundle = resultado.outputFiles[0].text;
const stubs = GLOBALES.map(
  (f) => `function ${f}() { return __hc.${f}.apply(null, arguments); }`,
).join('\n');

writeFileSync('dist/Code.js', `${bundle}\n${stubs}\n`);
copyFileSync('appsscript.json', 'dist/appsscript.json');
console.log(`dist/Code.js listo (${Math.round((bundle.length + stubs.length) / 1024)} KB)`);

// Copia para pegar a mano en el editor de Apps Script (sin clasp). Fuera de dist/: clasp subiría las dos.
const PEGAR = '../salida/apps-script';
mkdirSync(PEGAR, { recursive: true });
writeFileSync(
  `${PEGAR}/Code.gs`,
  // «use strict» solo vale como primera instrucción del archivo: va antes de la configuración.
  `"use strict";\n${CONFIG}\n// HC App · servidor (generado por backend/build.mjs, semillas ${SEMILLA_VERSION}). Debajo de aquí no edites: vuelve a compilar.\n${bundle.replace(/^"use strict";\r?\n/, '')}\n${stubs}\n`,
);
copyFileSync('appsscript.json', `${PEGAR}/appsscript.json`);
