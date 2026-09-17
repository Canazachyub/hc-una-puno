// Operaciones locales sobre una historia. Todo se guarda primero en el dispositivo.

import { recalcular } from '../../../shared/calc';
import { hoyISO } from '../../../shared/fechas';
import { VERSION_MIGRACION, migrarValores } from '../../../shared/migraciones';
import { CAMPOS_CLAVE, esVisible } from '../../../shared/secciones';
import type { Campo, FilaHC, OrganizarRespuesta } from '../../../shared/types';
import { estaLleno } from '../../../shared/valores';
import { leerAjustes } from './ajustes';
import { enLinea, llamar } from './api';
import { db, historiaVacia, claveDe } from './db';
import type { HistoriaLocal } from './db';
import type { CatalogoVista } from './vista';
import { programarSync } from './sync-cola';

export interface Completitud {
  porcentaje: number;
  obligatorios: number;
  obligatoriosLlenos: number;
  faltan: Campo[];
  porSeccion: Map<string, { llenos: number; total: number; faltan: number }>;
}

export function camposVisibles(cat: CatalogoVista, seccion: string, valores: Record<string, string>): Campo[] {
  return (cat.porSeccion.get(seccion) ?? []).filter((c) => esVisible(c.campo_id, valores));
}

export function calcularCompletitud(valores: Record<string, string>, cat: CatalogoVista): Completitud {
  const porSeccion = new Map<string, { llenos: number; total: number; faltan: number }>();
  let obligatorios = 0;
  let obligatoriosLlenos = 0;
  const faltan: Campo[] = [];
  for (const c of cat.esquema) {
    if (!esVisible(c.campo_id, valores) || CAMPOS_CLAVE.includes(c.campo_id) || c.tipo === 'calculado') continue;
    const s = porSeccion.get(c.seccion) ?? { llenos: 0, total: 0, faltan: 0 };
    const lleno = estaLleno(valores[c.campo_id]);
    s.total++;
    if (lleno) s.llenos++;
    if (c.obligatorio) {
      obligatorios++;
      if (lleno) obligatoriosLlenos++;
      else {
        s.faltan++;
        faltan.push(c);
      }
    }
    porSeccion.set(c.seccion, s);
  }
  const porcentaje = obligatorios === 0 ? 100 : Math.round((obligatoriosLlenos / obligatorios) * 100);
  return { porcentaje, obligatorios, obligatoriosLlenos, faltan, porSeccion };
}

function valoresIniciales(): Record<string, string> {
  const v: Record<string, string> = { 'fil.fecha_elaboracion': hoyISO(true) };
  const nombre = leerAjustes().nombre;
  if (nombre) v['fil.elaborado_por'] = nombre;
  return v;
}

export function historiaDesdeFila(fila: FilaHC): HistoriaLocal {
  const h = historiaVacia(fila.dni, fila.episodio);
  return {
    ...h,
    valores: { ...fila.valores, 'fil.dni': fila.dni },
    base: { ...fila.valores },
    version: fila.version,
    estado: fila.estado,
    completitud: fila.completitud,
    creado_en: fila.creado_en || h.creado_en,
    actualizado_en: fila.actualizado_en || h.actualizado_en,
    sincronizado_en: new Date().toISOString(),
  };
}

/** Crea una historia. Con señal, el servidor asigna el episodio; sin señal, se asigna aquí. */
export async function crearHistoria(dni: string, cat: CatalogoVista): Promise<string> {
  const iniciales = valoresIniciales();
  if (enLinea()) {
    try {
      const { fila } = await llamar('hc.crear', { dni, valores: iniciales });
      const h = historiaDesdeFila(fila);
      h.completitud = calcularCompletitud(h.valores, cat).porcentaje;
      await db.historias.put(h);
      return h.clave;
    } catch {
      // sin respuesta: se crea localmente y se sincroniza después
    }
  }
  const locales = await db.historias.where('dni').equals(dni).toArray();
  const remotas = await db.remotas.where('dni').equals(dni).toArray();
  const episodio = Math.max(0, ...locales.map((h) => h.episodio), ...remotas.map((r) => r.episodio)) + 1;
  const h = historiaVacia(dni, episodio);
  h.valores = { ...h.valores, ...iniciales };
  h.sucio = Object.keys(iniciales);
  h.completitud = calcularCompletitud(h.valores, cat).porcentaje;
  await db.historias.put(h);
  programarSync();
  return h.clave;
}

function aplicarCambio(h: HistoriaLocal, id: string, valor: string): boolean {
  const actual = h.valores[id] ?? '';
  if (actual === valor) return false;
  if (valor === '') delete h.valores[id];
  else h.valores[id] = valor;
  const enBase = h.base[id] ?? '';
  if (valor === enBase) h.sucio = h.sucio.filter((s) => s !== id);
  else if (!h.sucio.includes(id)) h.sucio.push(id);
  return true;
}

/** Cambia uno o varios campos. `confianza` marca los que vinieron de Gemini. */
export async function editar(
  clave: string,
  cambios: Record<string, string>,
  cat: CatalogoVista,
  confianza?: Record<string, number>,
): Promise<void> {
  await db.transaction('rw', db.historias, async () => {
    const h = await db.historias.get(clave);
    if (!h) return;
    const tocados: string[] = [];
    for (const [id, valor] of Object.entries(cambios)) {
      if (CAMPOS_CLAVE.includes(id)) continue;
      if (aplicarCambio(h, id, valor)) tocados.push(id);
    }
    for (const [id, v] of Object.entries(recalcular(cat.esquema, h.valores))) aplicarCambio(h, id, v);
    if (tocados.length === 0) return;

    for (const id of tocados) {
      if (confianza && id in confianza) h.confianza[id] = confianza[id];
      else delete h.confianza[id];
    }
    h.sugerencias = h.sugerencias.filter((s) => !tocados.includes(s.campo) || !!confianza);
    h.conflictos = h.conflictos.filter((c) => c.origen !== 'entrada' || !tocados.includes(c.campo));
    for (const d of h.dudas) {
      if (d.estado === 'pendiente' && d.campo_id && tocados.includes(d.campo_id) && estaLleno(h.valores[d.campo_id])) {
        d.estado = 'resuelta';
        h.dudasResueltasPendientes.push(d.id);
      }
    }
    h.completitud = calcularCompletitud(h.valores, cat).porcentaje;
    h.actualizado_en = new Date().toISOString();
    await db.historias.put(h);
  });
  programarSync();
}

export async function aplicarOrganizar(
  clave: string,
  r: OrganizarRespuesta,
  cat: CatalogoVista,
): Promise<{ llenados: number; dudas: number; conflictos: number }> {
  const h = await db.historias.get(clave);
  if (!h) return { llenados: 0, dudas: 0, conflictos: 0 };
  const antes = { ...h.valores };
  const cambios: Record<string, string> = {};
  const confianza: Record<string, number> = {};
  for (const c of r.campos) {
    cambios[c.id] = c.valor;
    confianza[c.id] = c.confianza;
  }
  await editar(clave, cambios, cat, confianza);

  await db.transaction('rw', db.historias, async () => {
    const x = await db.historias.get(clave);
    if (!x) return;
    const idsDudas = new Set(x.dudas.map((d) => d.id));
    for (const d of r.dudas) {
      if (idsDudas.has(d.id)) continue;
      // Si el campo ya se llenó en esta misma entrada, la duda nace resuelta.
      if (d.campo_id && d.campo_id in cambios && estaLleno(x.valores[d.campo_id])) {
        x.dudas.push({ ...d, estado: 'resuelta' });
        x.dudasResueltasPendientes.push(d.id);
      } else {
        x.dudas.push(d);
      }
    }
    for (const s of r.escalas_sugeridas) {
      if (!x.sugerencias.some((e) => e.campo === s.campo && e.lista_id === s.lista_id)) x.sugerencias.push(s);
    }
    for (const c of r.conflictos) {
      x.conflictos = x.conflictos.filter((k) => !(k.campo === c.campo && k.origen === 'entrada'));
      x.conflictos.push({ campo: c.campo, local: c.registrado, otro: c.entrada, origen: 'entrada' });
    }
    if (Object.keys(cambios).length > 0) {
      x.deshacer = {
        valores: antes,
        fecha: new Date().toISOString(),
        resumen: `${Object.keys(cambios).length} campos llenados por Gemini`,
      };
    }
    await db.historias.put(x);
  });
  return { llenados: Object.keys(cambios).length, dudas: r.dudas.length, conflictos: r.conflictos.length };
}

export async function deshacerOrganizar(clave: string, cat: CatalogoVista): Promise<void> {
  const h = await db.historias.get(clave);
  if (!h?.deshacer) return;
  const previo = h.deshacer.valores;
  const cambios: Record<string, string> = {};
  for (const id of new Set([...Object.keys(previo), ...Object.keys(h.valores)])) {
    if ((previo[id] ?? '') !== (h.valores[id] ?? '')) cambios[id] = previo[id] ?? '';
  }
  await editar(clave, cambios, cat);
  await db.historias.update(clave, { deshacer: null });
}

export async function resolverConflicto(
  clave: string,
  campo: string,
  eleccion: 'local' | 'otro',
  cat: CatalogoVista,
): Promise<void> {
  const h = await db.historias.get(clave);
  const c = h?.conflictos.find((k) => k.campo === campo);
  if (!h || !c) return;
  if (c.origen === 'sync') {
    if (eleccion === 'otro') {
      if (c.otro === '') delete h.valores[campo];
      else h.valores[campo] = c.otro;
      h.sucio = h.sucio.filter((s) => s !== campo);
    } else if (!h.sucio.includes(campo)) {
      h.sucio.push(campo);
    }
    h.base[campo] = c.otro;
    h.conflictos = h.conflictos.filter((k) => k !== c);
    h.completitud = calcularCompletitud(h.valores, cat).porcentaje;
    await db.historias.put(h);
    programarSync();
    return;
  }
  await db.historias.update(clave, { conflictos: h.conflictos.filter((k) => k !== c) });
  if (eleccion === 'otro') await editar(clave, { [campo]: c.otro }, cat);
}

export async function marcarDuda(clave: string, id: string, resuelta: boolean): Promise<void> {
  await db.transaction('rw', db.historias, async () => {
    const h = await db.historias.get(clave);
    const d = h?.dudas.find((x) => x.id === id);
    if (!h || !d) return;
    d.estado = resuelta ? 'resuelta' : 'pendiente';
    if (resuelta && !h.dudasResueltasPendientes.includes(id)) h.dudasResueltasPendientes.push(id);
    if (!resuelta) h.dudasResueltasPendientes = h.dudasResueltasPendientes.filter((x) => x !== id);
    await db.historias.put(h);
  });
  programarSync();
}

/** El estudiante revisó el valor que propuso Gemini: deja de marcarse en amarillo. */
export async function confirmarCampo(clave: string, campo: string): Promise<void> {
  await db.transaction('rw', db.historias, async () => {
    const h = await db.historias.get(clave);
    if (!h || !(campo in h.confianza)) return;
    delete h.confianza[campo];
    await db.historias.put(h);
  });
}

export async function descartarSugerencia(clave: string, campo: string, listaId: string): Promise<void> {
  const h = await db.historias.get(clave);
  if (!h) return;
  await db.historias.update(clave, {
    sugerencias: h.sugerencias.filter((s) => !(s.campo === campo && s.lista_id === listaId)),
  });
}

export async function marcarEstado(clave: string, estado: HistoriaLocal['estado']): Promise<void> {
  await db.historias.update(clave, { estado, estadoSucio: true, actualizado_en: new Date().toISOString() });
  programarSync();
}

export async function borrarLocal(clave: string): Promise<void> {
  await db.transaction('rw', db.historias, db.ops, db.entradas, async () => {
    await db.historias.delete(clave);
    await db.ops.where('clave').equals(clave).delete();
    await db.entradas.where('clave').equals(clave).delete();
  });
}

/** Una vez por dispositivo: pasa los valores guardados al formato sin abreviaturas (igual que el servidor). */
export async function migrarLocal(): Promise<void> {
  const CLAVE_MIGRACION = 'hc.migracion';
  let hecha = 0;
  try {
    hecha = Number(localStorage.getItem(CLAVE_MIGRACION) ?? 0);
  } catch {
    return;
  }
  if (hecha >= VERSION_MIGRACION) return;
  await db.transaction('rw', db.historias, async () => {
    for (const h of await db.historias.toArray()) {
      const valores = migrarValores(h.valores);
      const base = migrarValores(h.base);
      if (!Object.keys(valores).length && !Object.keys(base).length) continue;
      await db.historias.put({ ...h, valores: { ...h.valores, ...valores }, base: { ...h.base, ...base } });
    }
  });
  try {
    localStorage.setItem(CLAVE_MIGRACION, String(VERSION_MIGRACION));
  } catch {
    // se reintenta al abrir de nuevo
  }
}

export function nombrePaciente(v: Record<string, string>): string {
  const n = [v['fil.apellidos'], v['fil.nombres']].filter(Boolean).join(', ');
  return n || 'Paciente sin nombre';
}

export { claveDe };
