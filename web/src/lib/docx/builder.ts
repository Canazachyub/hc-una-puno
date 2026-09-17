// Generador del Word. Corre en el navegador (y en Node para las pruebas). Funciona sin señal.
// Dibuja la representación intermedia de documento.ts, la misma que usa la vista previa.

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  ImageRun,
  TableLayoutType,
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
import type { DatosDocumento, Elemento, FilaForma, OpcionesDocumento } from './documento';

export type DatosWord = DatosDocumento;
export type { OpcionesDocumento };

export interface Membrete {
  encabezado: Uint8Array;
  pie: Uint8Array;
  /** Escudos de la plantilla detallada (su membrete es de texto, como en el documento). */
  escudos?: { una: Uint8Array; fmh: Uint8Array };
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

/** Membrete de la Cátedra de Semiología: tres líneas a la izquierda y los dos escudos a la derecha. */
function membreteSemiologia(escudos: { una: Uint8Array; fmh: Uint8Array }): Table {
  const total = ANCHO_UTIL;
  const linea = (texto: string) =>
    new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: texto, bold: true, size: 16, color: '1F3864' })] });
  const escudo = (datos: Uint8Array, tipo: 'png' | 'jpg', ancho: number, alto: number) =>
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0 },
      children: [new ImageRun({ data: datos, type: tipo, transformation: { width: ancho, height: alto } })],
    });
  const celda = (hijos: Paragraph[], ancho: number) =>
    new TableCell({ width: { size: ancho, type: WidthType.DXA }, margins: { top: 0, bottom: 0, left: 0, right: 0 }, children: hijos });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: [Math.round(total * 0.72), Math.round(total * 0.14), Math.round(total * 0.14)],
    borders: TableBorders.NONE,
    rows: [
      new TableRow({
        children: [
          celda(
            [linea('UNIVERSIDAD NACIONAL DEL ALTIPLANO'), linea('FACULTAD DE MEDICINA HUMANA'), linea('CÁTEDRA DE SEMIOLOGÍA')],
            Math.round(total * 0.72),
          ),
          celda([escudo(escudos.fmh, 'png', 42, 44)], Math.round(total * 0.14)),
          celda([escudo(escudos.una, 'jpg', 40, 40)], Math.round(total * 0.14)),
        ],
      }),
    ],
  });
}

/** Rejilla calcada del documento: etiqueta en gris, casilla al lado y opciones para marcar. */
function formulario(filas: FilaForma[]): Table {
  // Rejilla de doce columnas, como las tablas del documento: cada celda ocupa las que necesita.
  const COLUMNAS = 12;
  const ETIQUETA = 3;
  const total = ANCHO_UTIL;
  const unidad = Math.floor(total / COLUMNAS);
  const anchoEtiqueta = unidad * ETIQUETA;
  const borde = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
  const bordes = { top: borde, bottom: borde, left: borde, right: borde, insideHorizontal: borde, insideVertical: borde };
  const parrafo = (texto: string, negrita = false, centrado = false) =>
    new Paragraph({
      alignment: centrado ? AlignmentType.CENTER : undefined,
      spacing: { before: 20, after: 20 },
      children: [new TextRun({ text: texto, bold: negrita, size: 18 })],
    });
  /** La opción elegida se marca con una equis dentro de su recuadro, como en el papel. */
  const opcionMarcada = (texto: string) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 20, after: 20 },
      children: [new TextRun({ text: 'X ', bold: true, size: 28 }), new TextRun({ text: texto, bold: true, size: 18 })],
    });
  const celda = (hijos: Paragraph[], columnas: number, opciones: { relleno?: string } = {}) =>
    new TableCell({
      width: { size: unidad * columnas, type: WidthType.DXA },
      columnSpan: columnas,
      shading: opciones.relleno ? { fill: opciones.relleno } : undefined,
      margins: { top: 20, bottom: 20, left: 60, right: 60 },
      children: hijos,
    });

  const filasDocx = filas.map((f) => {
    if (f.f === 'titulo') {
      return new TableRow({ children: [celda([parrafo(f.texto.toUpperCase(), true, true)], COLUMNAS, { relleno: 'D9D9D9' })] });
    }
    if (f.f === 'largo') {
      const cuerpo = f.parrafos.length ? f.parrafos.map((t) => parrafo(t)) : [parrafo('')];
      return new TableRow({
        children: [celda([parrafo(`${f.etiqueta}:`, true)], ETIQUETA, { relleno: 'F2F2F2' }), celda(cuerpo, COLUMNAS - ETIQUETA)],
      });
    }
    if (f.opciones?.length) {
      // Las columnas libres se reparten entre las opciones para que la fila llegue al margen.
      const libres = COLUMNAS - ETIQUETA;
      const n = f.opciones.length;
      const base = Math.floor(libres / n);
      const sobran = libres - base * n;
      return new TableRow({
        children: [
          celda([parrafo(`${f.etiqueta}:`, true)], ETIQUETA, { relleno: 'F2F2F2' }),
          ...f.opciones.map((o, i) =>
            celda([o.marcada ? opcionMarcada(o.texto) : parrafo(o.texto, false, true)], base + (i < sobran ? 1 : 0)),
          ),
        ],
      });
    }
    return new TableRow({
      children: [celda([parrafo(`${f.etiqueta}:`, true)], ETIQUETA, { relleno: 'F2F2F2' }), celda([parrafo(f.valor)], COLUMNAS - ETIQUETA)],
    });
  });

  return new Table({
    width: { size: unidad * COLUMNAS, type: WidthType.DXA },
    columnWidths: Array.from({ length: COLUMNAS }, () => unidad),
    layout: TableLayoutType.FIXED,
    borders: bordes,
    rows: filasDocx,
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
    case 'forma':
      return [formulario(e.filas), new Paragraph({ spacing: { after: 80 }, children: [] })];
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
  // La plantilla detallada lleva el membrete de la Cátedra de Semiología, como su documento.
  const propio = cat.plantilla !== 'fmh' && membrete?.escudos;
  const encabezado = propio && membrete?.escudos ? membreteSemiologia(membrete.escudos) : membrete ? imagen(membrete.encabezado) : null;
  const pie = propio ? null : membrete ? imagen(membrete.pie) : null;
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
            margin: { top: propio ? 1300 : 1700, bottom: propio ? 900 : 1800, left: 1000, right: 1000, header: 280, footer: 240 },
          },
        },
        headers: encabezado ? { default: new Header({ children: [encabezado] }) } : undefined,
        footers: pie ? { default: new Footer({ children: [pie] }) } : undefined,
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
