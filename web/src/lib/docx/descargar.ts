// Word en el navegador: descargar o compartir. Sin ida y vuelta al servidor.
// La librería docx se carga al primer uso; el service worker la guarda para usarla sin señal.

import type { CatalogoVista } from '../vista';
import type { BloqueTexto, DatosWord, Membrete, OpcionesDocumento } from './builder';
import { leerResultado } from '../laboratorio';

const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const CLAVE_OPCION = 'hc.word.vacios';

let membrete: Promise<Membrete | null> | null = null;

function cargarMembrete(): Promise<Membrete | null> {
  if (!membrete) {
    const leer = async (archivo: string) => {
      const r = await fetch(`${import.meta.env.BASE_URL}${archivo}`);
      if (!r.ok) throw new Error(archivo);
      return new Uint8Array(await r.arrayBuffer());
    };
    membrete = Promise.all([leer('header.png'), leer('footer.png'), leer('escudo-una.jpg'), leer('escudo-fmh.png')])
      .then(([encabezado, pie, una, fmh]) => ({ encabezado, pie, escudos: { una, fmh } }))
      .catch(() => {
        membrete = null;
        return null;
      });
  }
  return membrete;
}

/** Preferencia del dispositivo: con líneas para llenar a mano (como la plantilla) o solo lo registrado. */
export function opcionWord(): OpcionesDocumento {
  try {
    return { vacios: localStorage.getItem(CLAVE_OPCION) === 'omitir' ? 'omitir' : 'lineas' };
  } catch {
    return { vacios: 'lineas' };
  }
}

export function guardarOpcionWord(op: OpcionesDocumento): void {
  try {
    localStorage.setItem(CLAVE_OPCION, op.vacios);
  } catch {
    // sin almacenamiento: se usa la opción por defecto
  }
}

let modulos: Promise<[typeof import('docx'), typeof import('./builder')]> | null = null;

/**
 * Carga el generador en memoria. Se llama al abrir la app con señal: si luego se pierde,
 * el Word sigue saliendo aunque la caché del navegador falle.
 */
export function precargarWord(): Promise<[typeof import('docx'), typeof import('./builder')]> {
  void cargarMembrete();
  if (!modulos) {
    modulos = Promise.all([import('docx'), import('./builder')]).catch((e: unknown) => {
      modulos = null;
      throw new Error(
        `No se pudo cargar el generador de Word. Abre la app una vez con señal y vuelve a intentar. (${e instanceof Error ? e.message : String(e)})`,
      );
    });
  }
  return modulos;
}

/** Opciones del Word con la interpretación del laboratorio (sexo, edad y altitud del paciente). */
export function opcionesCompletas(h: DatosWord, op: OpcionesDocumento = opcionWord()): OpcionesDocumento {
  return {
    ...op,
    interpretarLab: (r) => {
      const l = leerResultado(r, h.valores);
      return l ? l.etiqueta : '';
    },
  };
}

export async function generarWord(h: DatosWord, cat: CatalogoVista, op: OpcionesDocumento = opcionWord()): Promise<File> {
  const [{ Packer }, { construirDocumento, nombreArchivo }] = await precargarWord();
  const doc = construirDocumento(h, cat, await cargarMembrete(), opcionesCompletas(h, op));
  const blob = await Packer.toBlob(doc);
  return new File([blob], nombreArchivo(h), { type: MIME_DOCX });
}

export async function descargarWord(h: DatosWord, cat: CatalogoVista): Promise<void> {
  const archivo = await generarWord(h, cat);
  const url = URL.createObjectURL(archivo);
  const a = document.createElement('a');
  a.href = url;
  a.download = archivo.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function puedeCompartirArchivos(): boolean {
  try {
    const prueba = new File([''], 'x.docx', { type: MIME_DOCX });
    return typeof navigator.canShare === 'function' && navigator.canShare({ files: [prueba] });
  } catch {
    return false;
  }
}

function bajar(archivo: File): void {
  const url = URL.createObjectURL(archivo);
  const a = document.createElement('a');
  a.href = url;
  a.download = archivo.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Word libre con el membrete (epicrisis, presentación de caso, revisión para el docente). */
export async function wordSimple(nombre: string, titulo: string, bloques: BloqueTexto[], subtitulo = ''): Promise<File> {
  const [{ Packer }, { documentoSimple }] = await precargarWord();
  const blob = await Packer.toBlob(documentoSimple(titulo, bloques, await cargarMembrete(), subtitulo));
  return new File([blob], nombre, { type: MIME_DOCX });
}

/** Descarga o comparte (en el teléfono, si se puede) un Word ya armado. */
export async function entregarWord(archivo: File, compartir: boolean): Promise<void> {
  if (compartir && puedeCompartirArchivos()) await navigator.share({ files: [archivo], title: archivo.name });
  else bajar(archivo);
}

/** Comparte el Word (WhatsApp, Drive, correo) con la hoja de compartir del sistema. */
export async function compartirWord(h: DatosWord, cat: CatalogoVista): Promise<void> {
  const archivo = await generarWord(h, cat);
  await navigator.share({ files: [archivo], title: archivo.name });
}
