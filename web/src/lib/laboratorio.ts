// Catálogo de laboratorio empaquetado (funciona sin señal) y preparación de fotos para enviarlas.

import labCsv from '../../../seed/laboratorio.csv?raw';
import { buscarParametro, interpretarLab, parsearLaboratorio } from '../../../shared/laboratorio';
import type { Lectura, ParametroLab, ResultadoAInterpretar } from '../../../shared/laboratorio';
import { contextoHistoria } from './guias';

export const CATALOGO_LAB: ParametroLab[] = parsearLaboratorio(labCsv);

export function leerResultado(r: ResultadoAInterpretar, valores: Record<string, string>): Lectura | null {
  return interpretarLab(CATALOGO_LAB, r, contextoHistoria(valores));
}

/** Nombre completo y examen del catálogo para lo escrito a mano («Hb» → Hemoglobina); si no se reconoce, queda como se escribió. */
export function nombreCanonico(parametro: string, examen = ''): { parametro: string; examen: string } {
  const p = buscarParametro(CATALOGO_LAB, parametro.trim(), examen);
  return p ? { parametro: p.parametro, examen: examen || p.examen } : { parametro: parametro.trim(), examen };
}

/** Nombres completos para autocompletar al escribir un resultado a mano. */
export const NOMBRES_LAB = [...new Set(CATALOGO_LAB.map((p) => p.parametro))].sort((a, b) => a.localeCompare(b, 'es'));

/** Reduce la foto a 1 800 px en su lado mayor y la pasa a JPEG: sube rápido y se lee bien. */
export async function prepararFoto(archivo: Blob): Promise<{ base64: string; mime: string }> {
  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, 1800 / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  const ctx = lienzo.getContext('2d');
  if (!ctx) throw new Error('No se pudo preparar la foto');
  ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();
  const blob = await new Promise<Blob>((ok, mal) => lienzo.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo comprimir la foto'))), 'image/jpeg', 0.85));
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { base64: btoa(bin), mime: 'image/jpeg' };
}
