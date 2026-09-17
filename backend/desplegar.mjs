// Despliega siempre sobre el mismo deployment para que la URL del Web App no cambie nunca.
// El primer despliegue crea el deployment y guarda su id en .deployment.

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const ARCHIVO = '.deployment';
const descripcion = `HC App ${new Date().toISOString().slice(0, 16)}`;
const clasp = (args) => execSync(`npx clasp ${args}`, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] });

let id = existsSync(ARCHIVO) ? readFileSync(ARCHIVO, 'utf8').trim() : '';
if (id) {
  console.log(clasp(`update-deployment ${id} -d "${descripcion}"`));
} else {
  const salida = clasp(`create-deployment -d "${descripcion}"`);
  console.log(salida);
  id = /AKfy[\w-]+/.exec(salida)?.[0] ?? '';
  if (!id) throw new Error('No se encontró el id del deployment en la salida de clasp');
  writeFileSync(ARCHIVO, `${id}\n`);
}
console.log(`\nURL del Web App (pégala en Ajustes de la app):\nhttps://script.google.com/macros/s/${id}/exec`);
