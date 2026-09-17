// Generador del Word. Corre en el navegador (y en Node para las pruebas). Funciona sin señal.
// Dibuja la representación intermedia de documento.ts, la misma que usa la vista previa.

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  ImageRun,
  LeaderType,
  Paragraph,
  TabStopType,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import type { CatalogoVista } from '../vista';
import { armarDocumento } from './documento';
import type { DatosDocumento, Elemento, OpcionesDocumento } from './documento';

export type DatosWord = DatosDocumento;
export type { OpcionesDocumento };

export interface Membrete {
  encabezado: Uint8Array;
  pie: Uint8Array;
}

const FUENTE = 'Arial';
const TAM = 22; // medios puntos: 11 pt
const SANGRIA = 360;
const LINEA_CORTA = '_'.repeat(34);
const ANCHO_IMAGEN = 660;
const ANCHO_UTIL = 11906 - 2000;

/** Ancho y alto de un PNG, leídos de su cabecera IHDR. */
function tamanoPng(png: Uint8Array): { ancho: number; alto: number } {
  const dv = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { ancho: dv.getUint32(16), alto: dv.getUint32(20) };
}

function imagen(png: Uint8Array): Paragraph {
  const { ancho, alto } = tamanoPng(png);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new ImageRun({
        type: 'png',
        data: png,
        transformation: { width: ANCHO_IMAGEN, height: Math.round((ANCHO_IMAGEN * alto) / ancho) },
      }),
    ],
  });
}

/** Renglón para llenar a mano: una tabulación con relleno de guion bajo hasta el margen. */
function lineaVacia(): Paragraph {
  return new Paragraph({
    indent: { left: SANGRIA },
    spacing: { before: 60, after: 60, line: 360 },
    tabStops: [{ type: TabStopType.RIGHT, position: 9540, leader: LeaderType.UNDERSCORE }],
    children: [new TextRun({ text: '\t' })],
  });
}

function tituloSeccion(texto: string): Paragraph {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 280, after: 120 },
    border: { top: { style: BorderStyle.SINGLE, size: 8, color: '000000', space: 4 } },
    children: [new TextRun({ text: texto, bold: true, size: 24 })],
  });
}

function tituloSub(texto: string, nivel: 1 | 2 | 3): Paragraph {
  return new Paragraph({
    keepNext: true,
    indent: { left: nivel === 1 ? 0 : nivel === 2 ? SANGRIA / 2 : SANGRIA },
    spacing: { before: nivel === 1 ? 200 : 140, after: 80 },
    children: [new TextRun({ text: texto, bold: true, underline: nivel === 1 ? {} : undefined })],
  });
}

function etiquetaValor(etiqueta: string, valor: string): Paragraph {
  return new Paragraph({
    indent: { left: SANGRIA },
    spacing: { after: 60 },
    children: [new TextRun({ text: `${etiqueta}: `, bold: true }), new TextRun({ text: valor || LINEA_CORTA })],
  });
}

function narrativa(etiqueta: string, parrafos: string[]): Paragraph[] {
  const out: Paragraph[] = [];
  if (etiqueta) {
    out.push(
      new Paragraph({
        keepNext: true,
        indent: { left: SANGRIA },
        spacing: { before: 80, after: 40 },
        children: [new TextRun({ text: `${etiqueta}:`, bold: true })],
      }),
    );
  }
  if (parrafos.length === 0) return [...out, lineaVacia(), lineaVacia()];
  for (const p of parrafos) {
    out.push(
      new Paragraph({
        indent: { left: SANGRIA },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 80, line: 300 },
        children: [new TextRun({ text: p })],
      }),
    );
  }
  return out;
}

function lista(etiqueta: string, items: string[], comillas: boolean): Paragraph[] {
  const out = [
    new Paragraph({
      keepNext: true,
      indent: { left: SANGRIA },
      spacing: { before: 80, after: 40 },
      children: [new TextRun({ text: `${etiqueta}:`, bold: true })],
    }),
  ];
  if (items.length === 0) return [...out, lineaVacia(), lineaVacia()];
  items.forEach((item, i) => {
    out.push(
      new Paragraph({
        indent: { left: SANGRIA * 2, hanging: 280 },
        spacing: { after: 40 },
        children: [new TextRun({ text: `${i + 1}. ${comillas ? `“${item}”` : item}` })],
      }),
    );
  });
  return out;
}

/** Pares etiqueta-valor en dos columnas, sin bordes (signos vitales). Una fila de un solo par ocupa todo el ancho. */
function pares(filas: { etiqueta: string; valor: string }[][]): Table {
  const total = ANCHO_UTIL - SANGRIA;
  const mitad = Math.floor(total / 2);
  const celda = (c: { etiqueta: string; valor: string } | undefined, ancho: number, columnSpan?: number) =>
    new TableCell({
      width: { size: ancho, type: WidthType.DXA },
      columnSpan,
      children: [
        new Paragraph({
          spacing: { after: 40 },
          children: c
            ? [new TextRun({ text: `${c.etiqueta}: `, bold: true }), new TextRun({ text: c.valor || '______________' })]
            : [],
        }),
      ],
    });
  return new Table({
    indent: { size: SANGRIA, type: WidthType.DXA },
    width: { size: total, type: WidthType.DXA },
    columnWidths: [mitad, total - mitad],
    borders: TableBorders.NONE,
    rows: filas.map(
      (fila) =>
        new TableRow({
          children: fila.length === 1 ? [celda(fila[0], total, 2)] : [celda(fila[0], mitad), celda(fila[1], total - mitad)],
        }),
    ),
  });
}

function aDocx(e: Elemento): (Paragraph | Table)[] {
  switch (e.t) {
    case 'titulo':
      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [new TextRun({ text: e.texto, bold: true, size: 30 })],
        }),
      ];
    case 'seccion':
      return [tituloSeccion(e.texto)];
    case 'sub':
      return [tituloSub(e.texto, e.nivel)];
    case 'campo':
      return [etiquetaValor(e.etiqueta, e.valor)];
    case 'narrativa':
      return narrativa(e.etiqueta, e.parrafos);
    case 'lista':
      return lista(e.etiqueta, e.items, e.comillas);
    case 'pares':
      return [pares(e.filas), new Paragraph({ spacing: { after: 40 }, children: [] })];
    case 'tabla':
      return [
        new Paragraph({ keepNext: true, indent: { left: SANGRIA }, spacing: { before: 120, after: 60 }, children: [new TextRun({ text: `${e.titulo}:`, bold: true })] }),
        tabla(e.encabezados, e.filas),
        new Paragraph({ spacing: { after: 60 }, children: [] }),
      ];
  }
}

/** Tabla con bordes finos (laboratorio, revisión con el docente). */
function tabla(encabezados: string[], filas: string[][], anchos?: number[]): Table {
  const total = ANCHO_UTIL - SANGRIA;
  const cols = anchos ?? encabezados.map(() => Math.floor(total / encabezados.length));
  const borde = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
  const celda = (t: string, i: number, negrita = false) =>
    new TableCell({
      width: { size: cols[i], type: WidthType.DXA },
      children: [new Paragraph({ children: [new TextRun({ text: t, bold: negrita, size: 20 })] })],
    });
  return new Table({
    indent: { size: SANGRIA, type: WidthType.DXA },
    width: { size: total, type: WidthType.DXA },
    columnWidths: cols,
    borders: { top: borde, bottom: borde, left: borde, right: borde, insideHorizontal: borde, insideVertical: borde },
    rows: [
      new TableRow({ tableHeader: true, children: encabezados.map((t, i) => celda(t, i, true)) }),
      ...filas.map((f) => new TableRow({ children: f.map((t, i) => celda(t, i)) })),
    ],
  });
}

export interface BloqueTexto {
  titulo?: string;
  parrafos?: string[];
  tabla?: { encabezados: string[]; filas: string[][]; anchos?: number[] };
}

/** Documento libre con el membrete: epicrisis, presentación de caso, revisión para el docente. */
export function documentoSimple(titulo: string, bloques: BloqueTexto[], membrete: Membrete | null, subtitulo = ''): Document {
  const hijos: (Paragraph | Table)[] = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: subtitulo ? 60 : 240 }, children: [new TextRun({ text: titulo, bold: true, size: 30 })] }),
  ];
  if (subtitulo) hijos.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: subtitulo, size: 20 })] }));
  for (const b of bloques) {
    if (b.titulo) hijos.push(tituloSeccion(b.titulo));
    for (const p of b.parrafos ?? []) {
      hijos.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, indent: { left: SANGRIA }, spacing: { after: 80 }, children: [new TextRun({ text: p })] }));
    }
    if (b.tabla) hijos.push(tabla(b.tabla.encabezados, b.tabla.filas, b.tabla.anchos));
  }
  return new Document({
    creator: 'HC App',
    title: titulo,
    styles: { default: { document: { run: { font: FUENTE, size: TAM }, paragraph: { spacing: { line: 276 } } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1700, bottom: 1800, left: 1000, right: 1000, header: 280, footer: 240 },
          },
        },
        headers: membrete ? { default: new Header({ children: [imagen(membrete.encabezado)] }) } : undefined,
        footers: membrete ? { default: new Footer({ children: [imagen(membrete.pie)] }) } : undefined,
        children: hijos,
      },
    ],
  });
}

export function construirDocumento(
  h: DatosWord,
  cat: CatalogoVista,
  membrete: Membrete | null,
  op: OpcionesDocumento = { vacios: 'lineas' },
): Document {
  const elementos = armarDocumento(h, cat, op);
  const nombre = [h.valores['fil.apellidos'], h.valores['fil.nombres']].filter(Boolean).join(', ');
  return new Document({
    creator: h.valores['fil.elaborado_por'] || 'HC App',
    title: `Historia clínica ${nombre || h.dni}`,
    description: `DNI ${h.dni} · episodio ${h.episodio}`,
    styles: {
      default: {
        document: { run: { font: FUENTE, size: TAM }, paragraph: { spacing: { line: 276 } } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1700, bottom: 1800, left: 1000, right: 1000, header: 280, footer: 240 },
          },
        },
        headers: membrete ? { default: new Header({ children: [imagen(membrete.encabezado)] }) } : undefined,
        footers: membrete ? { default: new Footer({ children: [imagen(membrete.pie)] }) } : undefined,
        children: elementos.flatMap(aDocx),
      },
    ],
  });
}

export function nombreArchivo(h: DatosWord): string {
  const ap = (h.valores['fil.apellidos'] ?? '').trim();
  const base = ap
    ? ap
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^A-Za-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
    : 'paciente';
  return `HC_${base}_${h.dni}_ep${h.episodio}.docx`;
}
