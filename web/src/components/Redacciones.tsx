// Presentación de caso (oral, para la visita) y epicrisis (resumen de alta).
// No son el resumen semiológico: la presentación cuenta todo el caso en uno o dos minutos y la epicrisis
// resume la hospitalización al alta. Gemini los redacta con lo registrado; la presentación también sale sin señal.

import { useState } from 'react';
import { edadLegible } from '../../../shared/contexto';
import { hoyISO } from '../../../shared/fechas';
import { interpretarConNivel } from '../../../shared/guias';
import { valoresClinicos } from '../../../shared/seguimiento';
import { enLinea, llamar, mensaje } from '../lib/api';
import { avisar } from '../lib/avisos';
import type { HistoriaLocal } from '../lib/db';
import { entregarWord, puedeCompartirArchivos, wordSimple } from '../lib/docx/descargar';
import { UMBRALES, contextoHistoria } from '../lib/guias';
import { nombrePaciente } from '../lib/historia';
import { mostrarValor } from '../lib/texto';
import type { CatalogoVista } from '../lib/vista';
import { Girador, Modal } from './Basicos';
import { hallazgosAVigilar } from './Vigilar';

const CLAVE_CACHE = 'hc.redacciones';

function leerCache(clave: string): { presentacion?: string; epicrisis?: string } {
  try {
    return (JSON.parse(sessionStorage.getItem(CLAVE_CACHE) ?? '{}') as Record<string, { presentacion?: string; epicrisis?: string }>)[clave] ?? {};
  } catch {
    return {};
  }
}

function guardarCache(clave: string, tipo: 'presentacion' | 'epicrisis', texto: string): void {
  try {
    const todo = JSON.parse(sessionStorage.getItem(CLAVE_CACHE) ?? '{}') as Record<string, Record<string, string>>;
    // Sin datos de pacientes en claro fuera de la base cifrada: solo se recuerda mientras la pestaña está abierta.
    todo[clave] = { ...(todo[clave] ?? {}), [tipo]: texto };
    sessionStorage.setItem(CLAVE_CACHE, JSON.stringify(todo));
  } catch {
    // sin almacenamiento: no se recuerda
  }
}

/** Versión rápida sin señal: arma la presentación con lo registrado. */
export function presentacionRapida(h: HistoriaLocal, cat: CatalogoVista): string {
  const v = h.valores;
  const t = (id: string) => mostrarValor(cat.porId.get(id), v[id]);
  const sexo = /^f/i.test(v['fil.sexo'] ?? '') ? 'mujer' : /^m/i.test(v['fil.sexo'] ?? '') ? 'varón' : '';
  const partes: string[] = [];
  const edad = edadLegible(v);
  const ident = [`Paciente${sexo ? ` ${sexo}` : ''}${edad ? ` de ${edad}` : ''}`, t('fil.ocupacion'), v['fil.lugar_procedencia'] ? `procedente de ${t('fil.lugar_procedencia')}` : '']
    .filter(Boolean)
    .join(', ');
  partes.push(`${ident}.`);
  if (v['ea.tiempo_valor']) {
    partes.push(
      `Tiempo de enfermedad de ${v['ea.tiempo_valor']} ${t('ea.tiempo_unidad')}${v['ea.forma_inicio'] ? `, de inicio ${t('ea.forma_inicio').toLowerCase()}` : ''}${v['ea.curso'] ? ` y curso ${t('ea.curso').toLowerCase()}` : ''}.`,
    );
  }
  if (v['ea.sintoma_guia']) partes.push(`Síntoma principal: ${t('ea.sintoma_guia').toLowerCase()}.`);
  if (v['ea.relato_cronologico']) {
    const oraciones = v['ea.relato_cronologico'].split(/(?<=\.)\s+/).slice(0, 3).join(' ').replace(/^(El |La )?[Pp]aciente refiere/, 'Refiere');
    partes.push(oraciones);
  }
  const antecedentes = ['apa.hta', 'apa.diabetes', 'apa.otras_patologias']
    .map((id) => t(id))
    .filter((x) => x && !/^(niega|no refiere)/i.test(x));
  if (antecedentes.length) partes.push(`Antecedentes: ${antecedentes.join('; ')}.`);
  const clinico = contextoHistoria(v);
  const vitales = ['efg.pa_sistolica', 'efg.fc', 'efg.fr', 'efg.temperatura', 'efg.sato2']
    .flatMap((id) => interpretarConNivel(id, v[id] ?? '', UMBRALES, clinico).filter((x) => x.nivel > 0).map((x) => `${x.etiqueta.toLowerCase()} (${v[id]})`));
  const hallazgos = hallazgosAVigilar(h, cat)
    .filter((x) => !x.campo.campo_id.startsWith('efg.'))
    .map((x) => `${x.campo.label.toLowerCase()}: ${x.texto}`);
  if (vitales.length || hallazgos.length) partes.push(`Al examen: ${[...vitales, ...hallazgos].join('; ')}.`);
  const dx = [
    v['dx.sindromico'] && `Diagnóstico sindrómico: ${t('dx.sindromico')}`,
    v['dx.presuntivo'] && `presuntivo: ${t('dx.presuntivo')}`,
    v['dx.diferencial'] && `diferencial: ${t('dx.diferencial')}`,
  ].filter(Boolean);
  if (dx.length) partes.push(`${dx.join('; ')}.`);
  if (v['plan.plan']) partes.push(`Plan: ${v['plan.plan'].split(/(?<=\.)\s+/).slice(0, 2).join(' ')}`);
  return partes.join(' ').replace(/\s+\|\s+/g, ', ');
}

function palabras(t: string): number {
  return t.trim().split(/\s+/).filter(Boolean).length;
}

function Presentacion({ h, cat, cerrar }: { h: HistoriaLocal; cat: CatalogoVista; cerrar: () => void }) {
  const [texto, setTexto] = useState(() => leerCache(h.clave).presentacion ?? presentacionRapida(h, cat));
  const [ocupado, setOcupado] = useState(false);
  const [leyendo, setLeyendo] = useState(false);

  const conGemini = async () => {
    setOcupado(true);
    try {
      const r = await llamar('entrada.redactar', { dni: h.dni, episodio: h.episodio, tipo: 'presentacion', valores: { ...valoresClinicos(h.valores), 'seg.evoluciones': h.valores['seg.evoluciones'] ?? '', 'seg.laboratorio': h.valores['seg.laboratorio'] ?? '' }, extra: {} }, { timeoutMs: 180_000 });
      setTexto(r.texto);
      guardarCache(h.clave, 'presentacion', r.texto);
    } catch (e) {
      avisar(mensaje(e), 'error');
    } finally {
      setOcupado(false);
    }
  };

  const leer = () => {
    if (!('speechSynthesis' in window)) return avisar('Este navegador no lee en voz alta', 'error');
    if (leyendo) {
      speechSynthesis.cancel();
      setLeyendo(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-PE';
    u.rate = 1;
    u.onend = () => setLeyendo(false);
    speechSynthesis.speak(u);
    setLeyendo(true);
  };

  const minutos = Math.max(1, Math.round((palabras(texto) / 150) * 10) / 10);
  return (
    <Modal titulo="🎤 Presentación de caso" cerrar={() => { speechSynthesis?.cancel?.(); cerrar(); }}>
      <p className="sub" style={{ margin: 0 }}>
        Para contarlo en la visita: identificación, motivo, enfermedad actual, antecedentes relevantes, examen positivo, diagnósticos y plan. Sin nombre ni DNI.
      </p>
      <textarea rows={12} value={texto} onChange={(e) => setTexto(e.target.value)} className="presentacion" />
      <span className="sub pequeno">
        {palabras(texto)} palabras · unos {String(minutos).replace('.', ',')} {minutos === 1 ? 'minuto' : 'minutos'} leída en voz alta
      </span>
      <div className="fila">
        <button type="button" className="boton primario" disabled={ocupado || !enLinea()} onClick={() => void conGemini()}>
          {ocupado ? <Girador /> : '✨'} Redactar con Gemini
        </button>
        <button type="button" className="boton" onClick={() => setTexto(presentacionRapida(h, cat))}>
          Versión rápida (sin señal)
        </button>
        <button type="button" className="boton" onClick={leer}>
          {leyendo ? '■ Detener' : '🔊 Escuchar'}
        </button>
        <button
          type="button"
          className="boton"
          onClick={() => void navigator.clipboard?.writeText(texto).then(() => avisar('Copiada', 'exito'))}
        >
          Copiar
        </button>
      </div>
    </Modal>
  );
}

const SECCIONES_EPICRISIS = [
  'DATOS DEL PACIENTE',
  'FECHA DE INGRESO',
  'FECHA DE ALTA',
  'DÍAS DE HOSPITALIZACIÓN',
  'MOTIVO DE INGRESO',
  'RESUMEN DE LA ENFERMEDAD ACTUAL',
  'HALLAZGOS PRINCIPALES DEL EXAMEN FÍSICO',
  'EXÁMENES AUXILIARES',
  'DIAGNÓSTICOS DE INGRESO',
  'EVOLUCIÓN',
  'TRATAMIENTO RECIBIDO',
  'DIAGNÓSTICOS DE ALTA',
  'CONDICIÓN AL ALTA',
  'INDICACIONES AL ALTA',
];

/** Parte el texto de la epicrisis en secciones por sus títulos «TÍTULO:». */
export function seccionesEpicrisis(texto: string): { titulo: string; parrafos: string[] }[] {
  const out: { titulo: string; parrafos: string[] }[] = [];
  for (const linea of texto.split(/\n/)) {
    const l = linea.trim();
    if (!l) continue;
    const m = /^([A-ZÁÉÍÓÚÑ ]{4,}):\s*(.*)$/.exec(l);
    if (m && SECCIONES_EPICRISIS.includes(m[1].trim())) {
      out.push({ titulo: m[1].trim(), parrafos: m[2] ? [m[2]] : [] });
    } else if (out.length) {
      out[out.length - 1].parrafos.push(l);
    } else {
      out.push({ titulo: '', parrafos: [l] });
    }
  }
  return out;
}

function Epicrisis({ h, cerrar }: { h: HistoriaLocal; cerrar: () => void }) {
  const [alta, setAlta] = useState({ fecha_alta: hoyISO(), diagnosticos_alta: '', condicion_alta: '', indicaciones_alta: '' });
  const [texto, setTexto] = useState(() => leerCache(h.clave).epicrisis ?? '');
  const [ocupado, setOcupado] = useState(false);

  const redactar = async () => {
    setOcupado(true);
    try {
      const r = await llamar('entrada.redactar', { dni: h.dni, episodio: h.episodio, tipo: 'epicrisis', valores: h.valores, extra: alta }, { timeoutMs: 180_000 });
      setTexto(r.texto);
      guardarCache(h.clave, 'epicrisis', r.texto);
    } catch (e) {
      avisar(mensaje(e), 'error');
    } finally {
      setOcupado(false);
    }
  };

  const word = async (compartir: boolean) => {
    try {
      const ap = (h.valores['fil.apellidos'] ?? 'paciente').normalize('NFD').replace(/[^A-Za-z0-9]+/g, '_');
      const archivo = await wordSimple(`Epicrisis_${ap}_${h.dni}.docx`, 'EPICRISIS', seccionesEpicrisis(texto).map((s) => ({ titulo: s.titulo, parrafos: s.parrafos })), nombrePaciente(h.valores));
      await entregarWord(archivo, compartir);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) avisar(mensaje(e), 'error');
    }
  };

  const campo = (k: keyof typeof alta, etiqueta: string, largo = false) => (
    <label className="pila" style={{ gap: 4 }}>
      <span className="sub">{etiqueta}</span>
      {largo ? (
        <textarea rows={2} value={alta[k]} onChange={(e) => setAlta({ ...alta, [k]: e.target.value })} />
      ) : (
        <input type={k === 'fecha_alta' ? 'date' : 'text'} value={alta[k]} onChange={(e) => setAlta({ ...alta, [k]: e.target.value })} />
      )}
    </label>
  );

  return (
    <Modal titulo="📄 Epicrisis" cerrar={cerrar}>
      <p className="sub" style={{ margin: 0 }}>
        Resumen de la hospitalización al alta. Completa los datos del alta; lo demás sale de la historia, las evoluciones y el laboratorio.
      </p>
      {campo('fecha_alta', 'Fecha de alta')}
      {campo('diagnosticos_alta', 'Diagnósticos de alta', true)}
      {campo('condicion_alta', 'Condición al alta (por ejemplo: estable, afebril, tolera vía oral)', true)}
      {campo('indicaciones_alta', 'Indicaciones al alta (fármaco, dosis, vía y frecuencia; controles)', true)}
      <button type="button" className="boton primario" disabled={ocupado || !enLinea()} onClick={() => void redactar()}>
        {ocupado ? <Girador /> : '✨'} Redactar la epicrisis
      </button>
      {!enLinea() && <span className="sub">Necesita señal.</span>}
      {texto && (
        <>
          <textarea rows={14} value={texto} onChange={(e) => setTexto(e.target.value)} className="presentacion" />
          <div className="fila">
            <button type="button" className="boton" onClick={() => void word(false)}>
              ⬇ Word
            </button>
            {puedeCompartirArchivos() && (
              <button type="button" className="boton" onClick={() => void word(true)}>
                Compartir
              </button>
            )}
            <button type="button" className="boton" onClick={() => void navigator.clipboard?.writeText(texto).then(() => avisar('Copiada', 'exito'))}>
              Copiar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export function PanelRedacciones({ h, cat }: { h: HistoriaLocal; cat: CatalogoVista }) {
  const [abierto, setAbierto] = useState<'' | 'presentacion' | 'epicrisis'>('');
  return (
    <div className="tarjeta pila" style={{ gap: 8 }}>
      <h2 style={{ fontSize: '1rem' }}>Para la visita y el alta</h2>
      <span className="sub pequeno">
        La presentación de caso resume todo el caso para contarlo en uno o dos minutos; el resumen semiológico (en Diagnóstico) solo junta los datos positivos para
        llegar a los síndromes. La epicrisis resume la hospitalización al alta.
      </span>
      <div className="fila">
        <button type="button" className="boton" onClick={() => setAbierto('presentacion')}>
          🎤 Presentación de caso
        </button>
        <button type="button" className="boton" onClick={() => setAbierto('epicrisis')}>
          📄 Epicrisis
        </button>
      </div>
      {abierto === 'presentacion' && <Presentacion h={h} cat={cat} cerrar={() => setAbierto('')} />}
      {abierto === 'epicrisis' && <Epicrisis h={h} cerrar={() => setAbierto('')} />}
    </div>
  );
}
