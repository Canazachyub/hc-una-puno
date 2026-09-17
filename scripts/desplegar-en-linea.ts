// Despliegue en línea guiado: backend en Apps Script y app en GitHub Pages.
// Uso: doble clic en «DESPLEGAR EN LINEA.cmd» (o `npm run desplegar`). Se puede repetir: lo ya hecho se salta.
//
// 1. Inicia sesión de clasp con tu cuenta de Google (se abre el navegador).
// 2. Crea el proyecto de Apps Script la primera vez (pide activar la API de Apps Script).
// 3. Compila, sube y publica el Web App (siempre la misma dirección).
// 4. Pone esa dirección en GitHub (variable HC_API_URL) y vuelve a publicar la app.
// 5. Abre la página de configuración del servidor: contraseña temporal y clave de Gemini.
// 6. Opcional: sube tus notas (Knowledge) y pasa las historias del servidor local.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { RAIZ } from './entorno';

const BACKEND = join(RAIZ, 'backend');
const rl = createInterface({ input: process.stdin, output: process.stdout });

function correr(comando: string, cwd = RAIZ, env: Record<string, string> = {}): { ok: boolean; salida: string } {
  const r = spawnSync(comando, { cwd, shell: true, encoding: 'utf8', env: { ...process.env, ...env }, stdio: ['inherit', 'pipe', 'pipe'] });
  const salida = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  return { ok: r.status === 0, salida };
}

function mostrar(comando: string, cwd = RAIZ, env: Record<string, string> = {}): boolean {
  return spawnSync(comando, { cwd, shell: true, stdio: 'inherit', env: { ...process.env, ...env } }).status === 0;
}

function abrir(url: string): void {
  spawnSync(process.platform === 'win32' ? `start "" "${url}"` : `open "${url}"`, { shell: true });
}

const paso = (n: number, t: string) => console.log(`\n━━ ${n}. ${t}`);

async function esperar(texto = 'Cuando termines, presiona Enter para seguir…'): Promise<string> {
  return (await rl.question(`${texto} `)).trim();
}

async function main(): Promise<void> {
  console.log('HC App · despliegue en línea (Apps Script + GitHub Pages)');

  paso(1, 'Cuenta de Google para Apps Script');
  if (/not logged in/i.test(correr('npx clasp show-authorized-user', BACKEND).salida)) {
    console.log('Se abrirá el navegador: elige tu cuenta de Google y permite el acceso a clasp.');
    if (!mostrar('npx clasp login', BACKEND)) throw new Error('No se pudo iniciar sesión en clasp');
  } else {
    console.log('✓ Sesión de clasp activa');
  }

  paso(2, 'Proyecto de Apps Script');
  if (existsSync(join(BACKEND, '.clasp.json'))) {
    console.log('✓ Ya existe (backend/.clasp.json)');
  } else {
    for (;;) {
      const r = correr('npx clasp create-script --type standalone --title "HC App" --rootDir dist', BACKEND);
      if (r.ok && existsSync(join(BACKEND, '.clasp.json'))) {
        console.log('✓ Proyecto «HC App» creado en tu Drive');
        break;
      }
      if (/Apps Script API/i.test(r.salida)) {
        console.log('Falta activar la API de Apps Script. Se abre la página: activa «API de Google Apps Script».');
        abrir('https://script.google.com/home/usersettings');
        await esperar('Cuando la actives, espera un minuto y presiona Enter…');
        continue;
      }
      throw new Error(`No se pudo crear el proyecto:\n${r.salida}`);
    }
  }

  paso(3, 'Subir y publicar el servidor');
  if (!mostrar('npm run deploy', BACKEND)) throw new Error('Falló el despliegue del servidor (revisa el mensaje de arriba)');
  const idDespliegue = readFileSync(join(BACKEND, '.deployment'), 'utf8').trim();
  const urlApi = `https://script.google.com/macros/s/${idDespliegue}/exec`;
  const cabeza = /(AKfy[\w-]+)\s+@HEAD/.exec(correr('npx clasp list-deployments', BACKEND).salida)?.[1];
  const scriptId = (JSON.parse(readFileSync(join(BACKEND, '.clasp.json'), 'utf8')) as { scriptId: string }).scriptId;
  const urlConfig = cabeza ? `https://script.google.com/macros/s/${cabeza}/dev` : '';
  console.log(`✓ Web App: ${urlApi}`);

  paso(4, 'App en GitHub Pages');
  const repo = correr('gh repo view --json nameWithOwner --jq .nameWithOwner');
  let urlApp = '';
  if (!repo.ok) {
    console.log('No encontré el repositorio de GitHub (¿gh auth login?). En GitHub → Settings → Secrets and variables → Actions → Variables,');
    console.log(`crea HC_API_URL = ${urlApi} y vuelve a correr el flujo «Publicar en GitHub Pages».`);
  } else {
    const nombre = repo.salida.trim();
    if (correr(`gh variable set HC_API_URL --body "${urlApi}" --repo ${nombre}`).ok) console.log('✓ Variable HC_API_URL guardada en GitHub');
    if (correr(`gh workflow run pages.yml --repo ${nombre} --ref main`).ok) console.log('✓ Publicación de la app en marcha (tarda unos 2 minutos)');
    urlApp = correr(`gh api repos/${nombre}/pages --jq .html_url`).salida.trim();
    if (urlApp.startsWith('http')) console.log(`  App: ${urlApp}`);
  }

  paso(5, 'Configurar el servidor (contraseña y clave de Gemini)');
  if (urlConfig) {
    console.log(`Se abre ${urlConfig}`);
    abrir(urlConfig);
  } else {
    console.log(`Abre el editor (npx clasp open-script) → Implementar → Probar implementaciones → Aplicación web. Script: ${scriptId}`);
  }
  console.log('- La primera vez Google pide permisos: «Google no verificó esta app» es normal porque es tuya →');
  console.log('  Configuración avanzada → Ir a HC App → Permitir.');
  console.log('- Copia el usuario y la contraseña temporal que muestra la página.');
  console.log('- Pega tu clave de Gemini (https://aistudio.google.com/apikey) y presiona «Guardar y probar».');

  paso(6, 'Tus notas y tus historias locales (opcional)');
  const clave = await esperar('Pega la contraseña temporal para subir tus notas (o Enter para saltar):');
  if (clave) {
    const usuario = (await esperar('Usuario [admin]:')) || 'admin';
    const env = { HC_API_URL: urlApi, HC_USUARIO: usuario, HC_CLAVE: clave };
    mostrar('npm run kb:build', RAIZ, env);
    if (existsSync(join(RAIZ, 'datos', 'hojas', 'HC.csv'))) {
      mostrar('npm run migrar -- --simular', RAIZ, env);
      if (/^s/i.test(await esperar('¿Pasar estas historias al servidor en línea? (s/N):'))) mostrar('npm run migrar', RAIZ, env);
    }
  }

  console.log('\n━━ Listo');
  if (urlApp) console.log(`App:      ${urlApp}`);
  console.log(`Servidor: ${urlApi}`);
  if (urlConfig) console.log(`Configuración (solo tú): ${urlConfig}`);
  console.log('En el celular: abre la app, ingresa, crea tu PIN y cambia la contraseña en Ajustes.');
  console.log('Para actualizar más adelante: vuelve a ejecutar este archivo o `npm run deploy` en backend y `git push`.');
}

main()
  .catch((e: unknown) => {
    console.error(`\n✗ ${e instanceof Error ? e.message : String(e)}`);
    process.exitCode = 1;
  })
  .finally(() => rl.close());
