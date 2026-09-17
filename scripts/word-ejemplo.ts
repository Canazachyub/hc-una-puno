// Genera salida/HC_ejemplo.docx con la historia ficticia, para revisar el formato sin abrir la app.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Packer } from 'docx';
import { recalcular } from '../shared/calc';
import { filasAEsquema, filasAOpciones } from '../shared/catalogo';
import { parsearCsv } from '../shared/csv';
import { construirDocumento, nombreArchivo } from '../web/src/lib/docx/builder';
import { armarVista } from '../web/src/lib/vista';
import { DNI_EJEMPLO, VALORES_EJEMPLO } from './ejemplo';

const raiz = join(import.meta.dirname, '..');
const cat = armarVista({
  version: 'semilla',
  esquema: filasAEsquema(parsearCsv(readFileSync(join(raiz, 'seed/esquema.csv'), 'utf8'))),
  opciones: filasAOpciones(parsearCsv(readFileSync(join(raiz, 'seed/opciones.csv'), 'utf8'))),
  knowledge: [],
});

const valores = { ...VALORES_EJEMPLO };
Object.assign(valores, recalcular(cat.esquema, valores));
const datos = { dni: DNI_EJEMPLO, episodio: 1, valores };

const doc = construirDocumento(datos, cat, {
  encabezado: new Uint8Array(readFileSync(join(raiz, 'web/public/header.png'))),
  pie: new Uint8Array(readFileSync(join(raiz, 'web/public/footer.png'))),
});
const buffer = await Packer.toBuffer(doc);
mkdirSync(join(raiz, 'salida'), { recursive: true });
const destino = join(raiz, 'salida', nombreArchivo(datos));
writeFileSync(destino, buffer);
console.log(`Word de ejemplo: ${destino} (${Math.round(buffer.length / 1024)} KB)`);
