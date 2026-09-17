// Seguimiento diario (evoluciones) y resultados de laboratorio.
// No son campos de la plantilla: viajan como dos columnas de sistema de la misma fila de la historia,
// con el mismo control de cambios que cualquier campo (el valor es un JSON).

export const CAMPO_EVOLUCIONES = 'seg.evoluciones';
export const CAMPO_LABORATORIO = 'seg.laboratorio';
export const CAMPOS_SISTEMA = [CAMPO_EVOLUCIONES, CAMPO_LABORATORIO] as const;

/** Una celda de Sheets admite 50 000 caracteres; se deja margen. */
export const MAXIMO_SISTEMA = 48000;

export function esCampoSistema(id: string): boolean {
  return (CAMPOS_SISTEMA as readonly string[]).includes(id);
}

/** Valores clínicos sin las columnas de sistema (lo que se manda a Gemini o se revisa). */
export function valoresClinicos(valores: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(valores)) if (!esCampoSistema(k)) out[k] = v;
  return out;
}

// ---------- Evoluciones ----------

/** Signos del día. Mismas unidades que el examen físico general. */
export interface VitalesDia {
  pa_sistolica?: string;
  pa_diastolica?: string;
  fc?: string;
  fr?: string;
  temperatura?: string;
  sato2?: string;
  fio2?: string;
  glasgow?: string;
  eva?: string;
  /** Diuresis en mililitros en 24 horas. */
  diuresis?: string;
  peso?: string;
}

export const VITALES_DIA: { clave: keyof VitalesDia; etiqueta: string; unidad: string; campo: string }[] = [
  { clave: 'pa_sistolica', etiqueta: 'Presión sistólica', unidad: 'mmHg', campo: 'efg.pa_sistolica' },
  { clave: 'pa_diastolica', etiqueta: 'Presión diastólica', unidad: 'mmHg', campo: 'efg.pa_diastolica' },
  { clave: 'fc', etiqueta: 'Frecuencia cardíaca', unidad: 'latidos por minuto', campo: 'efg.fc' },
  { clave: 'fr', etiqueta: 'Frecuencia respiratoria', unidad: 'respiraciones por minuto', campo: 'efg.fr' },
  { clave: 'temperatura', etiqueta: 'Temperatura', unidad: '°C', campo: 'efg.temperatura' },
  { clave: 'sato2', etiqueta: 'Saturación de oxígeno', unidad: '%', campo: 'efg.sato2' },
  { clave: 'fio2', etiqueta: 'Fracción inspirada de oxígeno', unidad: '', campo: 'efg.fio2' },
  { clave: 'glasgow', etiqueta: 'Glasgow', unidad: 'sobre 15', campo: 'efg.glasgow_total' },
  { clave: 'eva', etiqueta: 'Dolor', unidad: 'sobre 10', campo: '' },
  { clave: 'diuresis', etiqueta: 'Diuresis', unidad: 'ml en 24 horas', campo: '' },
  { clave: 'peso', etiqueta: 'Peso', unidad: 'kg', campo: 'efg.peso' },
];

export interface Evolucion {
  id: string;
  /** Fecha y hora local: AAAA-MM-DDTHH:MM. */
  fecha: string;
  vitales: VitalesDia;
  subjetivo: string;
  objetivo: string;
  analisis: string;
  plan: string;
  creado: string;
  actualizado: string;
}

function leerJson<T>(v: string | undefined, validar: (x: unknown) => x is T): T[] {
  if (!v) return [];
  try {
    const x: unknown = JSON.parse(v);
    return Array.isArray(x) ? x.filter(validar) : [];
  } catch {
    return [];
  }
}

const esTexto = (x: unknown): x is string => typeof x === 'string';

function esEvolucion(x: unknown): x is Evolucion {
  const e = x as Evolucion;
  return !!e && esTexto(e.id) && esTexto(e.fecha) && typeof e.vitales === 'object' && e.vitales !== null;
}

export function leerEvoluciones(v: string | undefined): Evolucion[] {
  return leerJson(v, esEvolucion)
    .map((e) => ({
      ...e,
      subjetivo: e.subjetivo ?? '',
      objetivo: e.objetivo ?? '',
      analisis: e.analisis ?? '',
      plan: e.plan ?? '',
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function escribirEvoluciones(lista: Evolucion[]): string {
  if (lista.length === 0) return '';
  return JSON.stringify([...lista].sort((a, b) => a.fecha.localeCompare(b.fecha)));
}

/** Día de hospitalización (el día del ingreso es el día 1). */
export function diaHospitalizacion(ingreso: string | undefined, fecha: string): number | null {
  const d = (s: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : NaN;
  };
  if (!ingreso) return null;
  const a = d(ingreso);
  const b = d(fecha);
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null;
  return Math.round((b - a) / 86400000) + 1;
}

// ---------- Laboratorio ----------

export interface ResultadoLab {
  id: string;
  /** Fecha del informe: AAAA-MM-DD. */
  fecha: string;
  /** Examen al que pertenece (hemograma, glucosa, renal…). */
  examen: string;
  /** Nombre completo del parámetro. */
  parametro: string;
  valor: string;
  unidad: string;
  /** Rango de referencia tal como lo trae el informe. */
  referencia: string;
  nota: string;
  origen: 'foto' | 'manual';
}

function esResultado(x: unknown): x is ResultadoLab {
  const r = x as ResultadoLab;
  return !!r && esTexto(r.id) && esTexto(r.parametro) && esTexto(r.valor);
}

export function leerLaboratorio(v: string | undefined): ResultadoLab[] {
  return leerJson(v, esResultado)
    .map((r) => ({ ...r, fecha: r.fecha ?? '', examen: r.examen ?? '', unidad: r.unidad ?? '', referencia: r.referencia ?? '', nota: r.nota ?? '', origen: r.origen === 'foto' ? ('foto' as const) : ('manual' as const) }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.examen.localeCompare(b.examen));
}

export function escribirLaboratorio(lista: ResultadoLab[]): string {
  if (lista.length === 0) return '';
  return JSON.stringify([...lista].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.examen.localeCompare(b.examen)));
}

/** Valida el valor de una columna de sistema antes de guardarlo. Se guarda tal cual llega. */
export function validarSistema(id: string, valor: string): string {
  if (!valor) return '';
  if (valor.length > MAXIMO_SISTEMA) {
    throw new Error(`${id === CAMPO_EVOLUCIONES ? 'Las evoluciones' : 'Los resultados'} pasan el límite de una celda; archiva las más antiguas en otro episodio`);
  }
  let x: unknown;
  try {
    x = JSON.parse(valor);
  } catch {
    throw new Error(`${id}: no es JSON`);
  }
  if (!Array.isArray(x)) throw new Error(`${id}: se esperaba una lista`);
  const validos = id === CAMPO_EVOLUCIONES ? leerEvoluciones(valor).length : leerLaboratorio(valor).length;
  if (validos !== x.length) throw new Error(`${id}: hay elementos sin los datos mínimos`);
  return valor;
}
