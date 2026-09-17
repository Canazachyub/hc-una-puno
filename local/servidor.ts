// Servidor local: la app y el backend en tu PC, sin cuenta de Google.
// Uso: npm run local            (abre http://localhost:8787)
//      npm run local -- --sin-abrir

import { execFileSync, execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createServer as crearHttps } from 'node:https';
import { networkInterfaces } from 'node:os';
import { extname, join, normalize, sep } from 'node:path';
import { Worker } from 'node:worker_threads';
import type { DatosMotor, MensajeMotor } from './motor';

const RAIZ = join(import.meta.dirname, '..');
const WEB = join(RAIZ, 'web', 'dist-local');
const MAX_CUERPO = 30 * 1024 * 1024;
const argumentos = new Set(process.argv.slice(2));

function leerEnv(): Record<string, string> {
  const archivo = join(RAIZ, '.env.local');
  const env: Record<string, string> = {};
  if (existsSync(archivo)) {
    for (const linea of readFileSync(archivo, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/.exec(linea);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

// Las variables del sistema tienen prioridad sobre .env.local (útil para una instancia de prueba).
const ENV = { ...leerEnv(), ...Object.fromEntries(Object.entries(process.env).filter(([k]) => /^(PUERTO|PUERTO_HTTPS|HC_DATOS_DIR)$/.test(k))) } as Record<string, string>;
const DATOS = ENV.HC_DATOS_DIR || join(RAIZ, 'datos');
const PUERTO = Number(ENV.PUERTO) || 8787;
const PUERTO_HTTPS = Number(ENV.PUERTO_HTTPS) || 8443;

function paso(texto: string): void {
  console.log(`· ${texto}`);
}

function ipsLocales(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((i): i is NonNullable<typeof i> => !!i && i.family === 'IPv4' && !i.internal && !i.address.startsWith('169.254'))
    .map((i) => i.address);
}

// ---------- Preparación ----------

mkdirSync(DATOS, { recursive: true });
if (!ENV.GEMINI_API_KEY) console.warn('! Falta GEMINI_API_KEY en .env.local: la app funciona, pero sin Gemini.');

paso('Compilando el backend');
execSync('node build.mjs', { cwd: join(RAIZ, 'backend'), stdio: 'ignore' });

const knowledgeCsv = join(RAIZ, 'seed', 'knowledge.csv');
if (ENV.HC_NOTAS_DIR && existsSync(ENV.HC_NOTAS_DIR)) {
  paso('Leyendo tus notas de Semiología');
  execSync(`"${process.execPath}" --import tsx "${join(RAIZ, 'scripts', 'kb-build.ts')}" --solo-csv`, { cwd: RAIZ, stdio: 'ignore' });
}

if (!argumentos.has('--sin-compilar') || !existsSync(join(WEB, 'index.html'))) {
  paso('Compilando la app');
  execSync('npx vite build --mode servidor --outDir dist-local --emptyOutDir --logLevel error', {
    cwd: join(RAIZ, 'web'),
    stdio: 'inherit',
    env: { ...process.env, VITE_API_URL: './api' },
  });
}

// ---------- Certificado para HTTPS (micrófono y modo sin señal en el celular) ----------

const OPENSSL = ['C:\\Program Files\\Git\\usr\\bin\\openssl.exe', 'openssl'].find((o) => {
  try {
    execFileSync(o, ['version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
});

function certificado(ips: string[]): { key: Buffer; cert: Buffer } | null {
  if (!OPENSSL) return null;
  const dir = join(DATOS, 'certificado');
  mkdirSync(dir, { recursive: true });
  const f = (n: string) => join(dir, n);
  const ssl = (args: string[]) => execFileSync(OPENSSL, args, { stdio: 'ignore', cwd: dir });
  try {
    if (!existsSync(f('ca.crt'))) {
      ssl(['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'ca.key', '-out', 'ca.crt', '-days', '3650',
        '-subj', '/CN=HC App - autoridad local', '-addext', 'basicConstraints=critical,CA:TRUE', '-addext', 'keyUsage=critical,keyCertSign,cRLSign']);
    }
    const san = ['DNS:localhost', 'IP:127.0.0.1', ...ips.map((ip) => `IP:${ip}`)].join(',');
    const previo = existsSync(f('san.txt')) ? readFileSync(f('san.txt'), 'utf8') : '';
    if (previo !== san || !existsSync(f('servidor.crt'))) {
      writeFileSync(f('ext.cnf'), `subjectAltName=${san}\nbasicConstraints=CA:FALSE\nkeyUsage=digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\n`);
      ssl(['req', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'servidor.key', '-out', 'servidor.csr', '-subj', '/CN=HC App local']);
      ssl(['x509', '-req', '-in', 'servidor.csr', '-CA', 'ca.crt', '-CAkey', 'ca.key', '-CAcreateserial', '-out', 'servidor.crt', '-days', '825', '-extfile', 'ext.cnf']);
      writeFileSync(f('san.txt'), san);
    }
    return { key: readFileSync(f('servidor.key')), cert: readFileSync(f('servidor.crt')) };
  } catch (e) {
    console.warn(`! No se pudo crear el certificado HTTPS: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}

// ---------- Motor ----------

const datosMotor: DatosMotor = {
  codigo: readFileSync(join(RAIZ, 'backend', 'dist', 'Code.js'), 'utf8'),
  carpeta: DATOS,
  entorno: { GEMINI_API_KEY: ENV.GEMINI_API_KEY ?? '', GEMINI_MODELO: ENV.GEMINI_MODELO ?? '' },
  knowledgeCsv,
  semillas: [join(RAIZ, 'seed', 'esquema.csv'), join(RAIZ, 'seed', 'opciones.csv')],
  respaldosExtra: ENV.RESPALDOS_DIR || undefined,
};
const motor = new Worker(new URL('./motor.ts', import.meta.url), { workerData: datosMotor });
const pendientes = new Map<number, (contenido: string) => void>();
let siguiente = 1;

const listo = new Promise<Extract<MensajeMotor, { tipo: 'listo' }>>((resolve) => {
  motor.on('message', (m: MensajeMotor) => {
    if (m.tipo === 'api') {
      pendientes.get(m.id)?.(m.contenido);
      pendientes.delete(m.id);
    } else if (m.tipo === 'log') {
      if (!/ACCESO|Entra con esos datos|Hoja de datos|Carpeta de audios|Modelo:|No compartas|Usuario de la app/.test(m.texto)) paso(m.texto);
    } else {
      resolve(m);
    }
  });
});
motor.on('error', (e) => {
  console.error('El motor se detuvo:', e);
  process.exit(1);
});

function aMotor(cuerpo: string): Promise<string> {
  return new Promise((resolve) => {
    const id = siguiente++;
    pendientes.set(id, resolve);
    motor.postMessage({ tipo: 'api', id, cuerpo });
  });
}

// ---------- HTTP ----------

const TIPOS: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.crt': 'application/x-x509-ca-cert',
};

function cabecerasSeguras(res: ServerResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'microphone=(self), camera=()');
}

function leerCuerpo(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const trozos: Buffer[] = [];
    let total = 0;
    req.on('data', (t: Buffer) => {
      total += t.length;
      if (total > MAX_CUERPO) {
        reject(new Error('Petición demasiado grande'));
        req.destroy();
      } else trozos.push(t);
    });
    req.on('end', () => resolve(Buffer.concat(trozos).toString('utf8')));
    req.on('error', reject);
  });
}

async function atender(req: IncomingMessage, res: ServerResponse): Promise<void> {
  cabecerasSeguras(res);
  const url = new URL(req.url ?? '/', 'http://local');

  if (url.pathname === '/api') {
    if (req.method !== 'POST') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }).end('HC App: backend local activo. Usa POST.');
      return;
    }
    let cuerpo: string;
    try {
      cuerpo = await leerCuerpo(req);
    } catch (e) {
      res.writeHead(413, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ok: false, error: String(e), codigo: 'payload' }));
      return;
    }
    const contenido = await aMotor(cuerpo);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }).end(contenido);
    return;
  }

  if (url.pathname === '/certificado.crt') {
    const ca = join(DATOS, 'certificado', 'ca.crt');
    if (existsSync(ca)) {
      res.writeHead(200, { 'Content-Type': TIPOS['.crt'], 'Content-Disposition': 'attachment; filename="HC-App-local.crt"' }).end(readFileSync(ca));
      return;
    }
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end();
    return;
  }
  let ruta = normalize(join(WEB, decodeURIComponent(url.pathname)));
  if (!ruta.startsWith(WEB + sep) && ruta !== WEB) {
    res.writeHead(403).end();
    return;
  }
  if (!existsSync(ruta) || statSync(ruta).isDirectory()) {
    if (extname(url.pathname)) {
      res.writeHead(404).end();
      return;
    }
    ruta = join(WEB, 'index.html');
  }
  const ext = extname(ruta);
  const inmutable = ruta.includes(`${sep}assets${sep}`);
  res.writeHead(200, {
    'Content-Type': TIPOS[ext] ?? 'application/octet-stream',
    'Cache-Control': inmutable ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  res.end(req.method === 'HEAD' ? undefined : readFileSync(ruta));
}

const manejador = (req: IncomingMessage, res: ServerResponse) => {
  atender(req, res).catch((e: unknown) => {
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(String(e));
  });
};

const inicio = await listo;
const ips = ipsLocales();

createServer(manejador).listen(PUERTO, '0.0.0.0');
const tls = certificado(ips);
if (tls) crearHttps({ ...tls }, manejador).listen(PUERTO_HTTPS, '0.0.0.0');

console.log('\n══════════════════════════════════════════════════════════');
console.log(' HC App funcionando en esta PC');
console.log('══════════════════════════════════════════════════════════');
console.log(` En esta PC:          http://localhost:${PUERTO}`);
for (const ip of ips) {
  console.log(` Celular (misma red): http://${ip}:${PUERTO}`);
  if (tls) console.log(`   con micrófono:     https://${ip}:${PUERTO_HTTPS}`);
}
console.log(` Notas de Semiología: ${inicio.fragmentos} fragmentos`);
console.log(` Gemini:              ${ENV.GEMINI_API_KEY ? `listo (${ENV.GEMINI_MODELO || 'gemini-3.8-flash'})` : 'SIN API KEY'}`);
console.log(` Datos y respaldos:   ${DATOS}`);
if (inicio.primerAcceso) {
  const aviso = `Usuario: ${inicio.primerAcceso.usuario}\nContraseña temporal: ${inicio.primerAcceso.clave}\n\nIngresa con estos datos y cámbialos en Ajustes.\nCuando la cambies, borra este archivo.\n`;
  writeFileSync(join(DATOS, 'PRIMER-ACCESO.txt'), aviso);
  console.log('──────────────────────────────────────────────────────────');
  console.log(` PRIMER INGRESO → usuario: ${inicio.primerAcceso.usuario}   contraseña: ${inicio.primerAcceso.clave}`);
  console.log(` (también quedó en datos\\PRIMER-ACCESO.txt; cámbiala en Ajustes)`);
}
console.log('══════════════════════════════════════════════════════════');
console.log(' Deja esta ventana abierta. Ctrl+C para detener.\n');

if (!argumentos.has('--sin-abrir') && process.platform === 'win32') {
  spawn('cmd', ['/c', 'start', '', `http://localhost:${PUERTO}`], { detached: true, stdio: 'ignore' }).unref();
}
