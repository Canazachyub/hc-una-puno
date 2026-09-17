// Seguimiento diario: una evolución por día (signos vitales y nota SOAP), tendencias con semáforo
// y comparación con el día anterior. Se guarda en la historia y sale en el Word.

import { useLiveQuery } from 'dexie-react-hooks';
import { useRef, useState } from 'react';
import { hoyISO } from '../../../shared/fechas';
import type { Gravedad } from '../../../shared/gravedad';
import { interpretarConNivel } from '../../../shared/guias';
import { CAMPO_EVOLUCIONES, VITALES_DIA, diaHospitalizacion, escribirEvoluciones, leerEvoluciones, valoresClinicos } from '../../../shared/seguimiento';
import type { Evolucion, VitalesDia } from '../../../shared/seguimiento';
import { Girador, useAutoAltura } from '../components/Basicos';
import { Dictado } from '../components/Dictado';
import { InsigniaGravedad, LeyendaSemaforo, claseGravedad } from '../components/Semaforo';
import { enLinea, llamar, mensaje, uuid } from '../lib/api';
import { avisar } from '../lib/avisos';
import { db } from '../lib/db';
import type { HistoriaLocal } from '../lib/db';
import { UMBRALES, contextoHistoria } from '../lib/guias';
import { editar, nombrePaciente } from '../lib/historia';
import { rutas } from '../lib/router';
import { useCatalogo } from '../lib/schema';
import { fechaLegible } from '../lib/texto';
import type { CatalogoVista } from '../lib/vista';

type ClaveVital = keyof VitalesDia;

/** Signos del ingreso (examen físico general) como primer punto de la tendencia. */
function vitalesIngreso(v: Record<string, string>): VitalesDia {
  return {
    pa_sistolica: v['efg.pa_sistolica'],
    pa_diastolica: v['efg.pa_diastolica'],
    fc: v['efg.fc'],
    fr: v['efg.fr'],
    temperatura: v['efg.temperatura'],
    sato2: v['efg.sato2'],
    glasgow: v['efg.glasgow_total'],
    peso: v['efg.peso'],
  };
}

const num = (x: string | undefined) => {
  const n = Number(String(x ?? '').replace(',', '.'));
  return x && Number.isFinite(n) ? n : null;
};

function nivelDe(clave: ClaveVital, valor: string | undefined, h: HistoriaLocal): Gravedad | null {
  const campo = VITALES_DIA.find((x) => x.clave === clave)?.campo;
  if (!campo || !valor) return null;
  const r = interpretarConNivel(campo, valor, UMBRALES, contextoHistoria(h.valores));
  return r.length ? (Math.max(...r.map((x) => x.nivel)) as Gravedad) : null;
}

function etiquetasDe(clave: ClaveVital, valor: string | undefined, h: HistoriaLocal): string {
  const campo = VITALES_DIA.find((x) => x.clave === clave)?.campo;
  if (!campo || !valor) return '';
  return interpretarConNivel(campo, valor, UMBRALES, contextoHistoria(h.valores))
    .filter((x) => x.nivel > 0)
    .map((x) => x.etiqueta)
    .join(' · ');
}

const GRAFICAS: ClaveVital[] = ['pa_sistolica', 'fc', 'fr', 'temperatura', 'sato2', 'glasgow', 'diuresis'];

function Tendencia({ h, puntos, clave }: { h: HistoriaLocal; puntos: { etiqueta: string; v: VitalesDia }[]; clave: ClaveVital }) {
  const info = VITALES_DIA.find((x) => x.clave === clave)!;
  const datos = puntos.map((p) => ({ etiqueta: p.etiqueta, valor: p.v[clave], n: num(p.v[clave]) })).filter((p) => p.n !== null);
  if (datos.length < 2) return null;
  const ancho = 300;
  const alto = 90;
  const valores = datos.map((d) => d.n as number);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  const x = (i: number) => 16 + (i * (ancho - 32)) / (datos.length - 1);
  const ancla = (i: number) => (i === 0 ? 'start' : i === datos.length - 1 ? 'end' : 'middle');
  const xTexto = (i: number) => (i === 0 ? 2 : i === datos.length - 1 ? ancho - 2 : x(i));
  const y = (n: number) => alto - 14 - ((n - min) * (alto - 30)) / rango;
  const ultimo = datos[datos.length - 1];
  const anterior = datos[datos.length - 2];
  const delta = (ultimo.n as number) - (anterior.n as number);
  return (
    <figure className="tendencia">
      <figcaption>
        <strong>{info.etiqueta}</strong>{' '}
        <span className="sub">
          {String(ultimo.valor).replace('.', ',')} {info.unidad}
          {delta !== 0 && ` · ${delta > 0 ? '↑' : '↓'} ${String(Math.abs(Math.round(delta * 10) / 10)).replace('.', ',')} desde el ${anterior.etiqueta.toLowerCase()}`}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label={`Tendencia de ${info.etiqueta}`}>
        <polyline fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" points={datos.map((d, i) => `${x(i)},${y(d.n as number)}`).join(' ')} />
        {datos.map((d, i) => (
          <g key={i} className={claseGravedad(nivelDe(clave, d.valor, h))}>
            <circle cx={x(i)} cy={y(d.n as number)} r="5" className="punto-tendencia">
              <title>
                {d.etiqueta}: {d.valor} {info.unidad}
              </title>
            </circle>
            <text x={xTexto(i)} y={alto - 2} textAnchor={ancla(i)} fontSize="9" fill="currentColor" opacity="0.7">
              {d.etiqueta}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

function AreaTexto({ etiqueta, valor, cambiar }: { etiqueta: string; valor: string; cambiar: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutoAltura(ref, valor);
  return (
    <label className="pila" style={{ gap: 4 }}>
      <span className="sub">{etiqueta}</span>
      <textarea ref={ref} rows={2} value={valor} onChange={(e) => cambiar(e.target.value)} />
    </label>
  );
}

function vacia(): Evolucion {
  const t = new Date().toISOString();
  return { id: uuid(), fecha: hoyISO(true), vitales: {}, subjetivo: '', objetivo: '', analisis: '', plan: '', creado: t, actualizado: t };
}

function Formulario({ h, cat, inicial, anterior, cerrar }: { h: HistoriaLocal; cat: CatalogoVista; inicial: Evolucion; anterior: Evolucion | null; cerrar: () => void }) {
  const [e, setE] = useState<Evolucion>(inicial);
  const [notas, setNotas] = useState('');
  const [redactando, setRedactando] = useState(false);
  const fijar = (cambios: Partial<Evolucion>) => setE((x) => ({ ...x, ...cambios }));
  const fijarVital = (k: ClaveVital, v: string) => setE((x) => ({ ...x, vitales: { ...x.vitales, [k]: v.replace(',', '.') } }));

  const guardar = async () => {
    const lista = leerEvoluciones(h.valores[CAMPO_EVOLUCIONES]).filter((x) => x.id !== e.id);
    const limpio: VitalesDia = {};
    for (const [k, v] of Object.entries(e.vitales)) if (v && String(v).trim()) limpio[k as ClaveVital] = String(v).trim();
    lista.push({ ...e, vitales: limpio, actualizado: new Date().toISOString() });
    try {
      await editar(h.clave, { [CAMPO_EVOLUCIONES]: escribirEvoluciones(lista) }, cat);
      avisar('Evolución guardada', 'exito');
      cerrar();
    } catch (err) {
      avisar(mensaje(err), 'error');
    }
  };

  const redactar = async () => {
    if (!enLinea()) return avisar('Sin señal: escribe la nota a mano', 'error');
    setRedactando(true);
    try {
      const vitales = VITALES_DIA.filter((v) => e.vitales[v.clave])
        .map((v) => `${v.etiqueta} ${e.vitales[v.clave]} ${v.unidad}`.trim())
        .join(', ');
      const r = await llamar(
        'entrada.redactar',
        {
          dni: h.dni,
          episodio: h.episodio,
          tipo: 'evolucion',
          valores: { ...valoresClinicos(h.valores), [CAMPO_EVOLUCIONES]: h.valores[CAMPO_EVOLUCIONES] ?? '' },
          extra: { fecha: e.fecha, vitales, notas: [notas, e.subjetivo, e.objetivo].filter(Boolean).join('\n') },
        },
        { timeoutMs: 180_000 },
      );
      if (r.soap) fijar({ subjetivo: r.soap.subjetivo, objetivo: r.soap.objetivo, analisis: r.soap.analisis, plan: r.soap.plan || e.plan });
      avisar('Nota redactada: revísala antes de guardar', 'exito');
    } catch (err) {
      avisar(mensaje(err), 'error');
    } finally {
      setRedactando(false);
    }
  };

  const dia = diaHospitalizacion(h.valores['fil.fecha_ingreso'], e.fecha);
  return (
    <section className="tarjeta pila">
      <div className="fila entre">
        <h2 style={{ fontSize: '1rem' }}>{inicial.subjetivo || inicial.objetivo ? 'Editar evolución' : 'Evolución de hoy'}</h2>
        {dia && <span className="insignia azul">Día {dia} de hospitalización</span>}
      </div>
      <label className="pila" style={{ gap: 4 }}>
        <span className="sub">Fecha y hora</span>
        <input type="datetime-local" value={e.fecha} onChange={(x) => fijar({ fecha: x.target.value })} />
      </label>
      <div className="rejilla-campos">
        {VITALES_DIA.map((v) => {
          const valor = e.vitales[v.clave] ?? '';
          const nivel = nivelDe(v.clave, valor, h);
          const previo = anterior?.vitales[v.clave];
          return (
            <label key={v.clave} className={`campo ${claseGravedad(nivel)}`}>
              <span className="pequeno">
                {v.etiqueta}
                {v.unidad && <span className="sub"> ({v.unidad})</span>}
              </span>
              <input
                inputMode={v.clave === 'fio2' ? 'text' : 'decimal'}
                value={valor.replace('.', ',')}
                placeholder={previo ? `antes ${previo.replace('.', ',')}` : ''}
                onChange={(x) => fijarVital(v.clave, x.target.value)}
              />
              {nivel !== null && nivel > 0 && <InsigniaGravedad gravedad={nivel} texto={etiquetasDe(v.clave, valor, h)} />}
            </label>
          );
        })}
      </div>
      <div className="pila" style={{ gap: 6 }}>
        <div className="fila entre">
          <span className="sub">Lo que viste y te contó hoy (dicta o escribe; Gemini lo ordena en SOAP)</span>
          <Dictado dni={h.dni} episodio={h.episodio} seccion="evolucion" alTexto={(t) => setNotas((n) => (n ? `${n}\n${t}` : t))} />
        </div>
        <textarea rows={3} value={notas} onChange={(x) => setNotas(x.target.value)} placeholder="Refiere que durmió mejor, menos disnea. Crepitantes en base derecha…" />
        <button type="button" className="boton" disabled={redactando} onClick={() => void redactar()}>
          {redactando ? <Girador /> : '✨'} Redactar la nota SOAP
        </button>
      </div>
      <AreaTexto etiqueta="Subjetivo" valor={e.subjetivo} cambiar={(v) => fijar({ subjetivo: v })} />
      <AreaTexto etiqueta="Objetivo" valor={e.objetivo} cambiar={(v) => fijar({ objetivo: v })} />
      <AreaTexto etiqueta="Análisis" valor={e.analisis} cambiar={(v) => fijar({ analisis: v })} />
      <AreaTexto etiqueta="Plan" valor={e.plan} cambiar={(v) => fijar({ plan: v })} />
      {anterior?.plan && !e.plan && (
        <button type="button" className="enlace" onClick={() => fijar({ plan: anterior.plan })}>
          Copiar el plan de la evolución anterior
        </button>
      )}
      <div className="fila">
        <button type="button" className="boton primario" onClick={() => void guardar()}>
          Guardar evolución
        </button>
        <button type="button" className="boton" onClick={cerrar}>
          Cancelar
        </button>
      </div>
    </section>
  );
}

export function Seguimiento({ clave }: { clave: string }) {
  const cat = useCatalogo();
  const h = useLiveQuery(() => db.historias.get(clave), [clave]);
  const [editando, setEditando] = useState<Evolucion | null>(null);
  if (!h) return <div className="pagina vacio">Cargando…</div>;

  const evoluciones = leerEvoluciones(h.valores[CAMPO_EVOLUCIONES]);
  const ingreso = h.valores['fil.fecha_ingreso'];
  const puntos = [
    { etiqueta: 'Ingreso', v: vitalesIngreso(h.valores) },
    ...evoluciones.map((e) => {
      const d = diaHospitalizacion(ingreso, e.fecha);
      return { etiqueta: d ? `Día ${d}` : e.fecha.slice(5, 10), v: e.vitales };
    }),
  ];
  const ultima = evoluciones[evoluciones.length - 1] ?? null;
  const borrar = async (id: string) => {
    if (!confirm('¿Borrar esta evolución?')) return;
    await editar(h.clave, { [CAMPO_EVOLUCIONES]: escribirEvoluciones(evoluciones.filter((e) => e.id !== id)) }, cat);
  };

  return (
    <div className="pagina pila" style={{ maxWidth: 900 }}>
      <div className="fila">
        <a className="icono" href={rutas.historia(clave)} aria-label="Volver">
          ←
        </a>
        <div>
          <h1 className="titulo-pagina">📈 Seguimiento diario</h1>
          <div className="sub">
            {nombrePaciente(h.valores)} · {evoluciones.length} {evoluciones.length === 1 ? 'evolución' : 'evoluciones'}
            {ingreso ? ` · ingreso ${fechaLegible(ingreso)}` : ' · sin fecha de ingreso'}
          </div>
        </div>
      </div>

      {editando ? (
        <Formulario
          h={h}
          cat={cat}
          inicial={editando}
          anterior={[...evoluciones].reverse().find((e) => e.id !== editando.id && e.fecha <= editando.fecha) ?? null}
          cerrar={() => setEditando(null)}
        />
      ) : (
        <button type="button" className="boton primario" style={{ justifySelf: 'start' }} onClick={() => setEditando(vacia())}>
          + Evolución de hoy
        </button>
      )}

      {puntos.length > 1 && (
        <section className="tarjeta pila">
          <h2 style={{ fontSize: '1rem' }}>Tendencias</h2>
          <div className="tendencias">
            {GRAFICAS.map((k) => (
              <Tendencia key={k} h={h} puntos={puntos} clave={k} />
            ))}
          </div>
          <LeyendaSemaforo />
        </section>
      )}

      {evoluciones.length === 0 && !editando && (
        <div className="vacio">
          Aún no hay evoluciones. Cada día registra los signos vitales y la nota; la app compara con el día anterior y lo agrega al Word.
        </div>
      )}

      {[...evoluciones].reverse().map((e) => {
        const d = diaHospitalizacion(ingreso, e.fecha);
        return (
          <article key={e.id} className="tarjeta pila" style={{ gap: 6 }}>
            <div className="fila entre">
              <strong>
                {fechaLegible(e.fecha)}
                {d ? ` · día ${d}` : ''}
              </strong>
              <div className="fila">
                <button type="button" className="boton chico" onClick={() => setEditando(e)}>
                  Editar
                </button>
                <button type="button" className="icono chico" aria-label="Borrar evolución" onClick={() => void borrar(e.id)}>
                  ✕
                </button>
              </div>
            </div>
            <div className="chips">
              {VITALES_DIA.filter((v) => e.vitales[v.clave]).map((v) => {
                const nivel = nivelDe(v.clave, e.vitales[v.clave], h);
                return (
                  <span key={v.clave} className={`insignia ${claseGravedad(nivel)}`}>
                    {nivel !== null && <span className="sem-punto" aria-hidden="true" />}
                    {v.etiqueta}: {String(e.vitales[v.clave]).replace('.', ',')} {v.unidad}
                  </span>
                );
              })}
            </div>
            {(['subjetivo', 'objetivo', 'analisis', 'plan'] as const).map((k) =>
              e[k] ? (
                <p key={k} style={{ margin: 0 }}>
                  <strong>{{ subjetivo: 'Subjetivo', objetivo: 'Objetivo', analisis: 'Análisis', plan: 'Plan' }[k]}:</strong> {e[k]}
                </p>
              ) : null,
            )}
          </article>
        );
      })}
      {ultima && !editando && <span className="sub pequeno">Las evoluciones salen en la sección VII del Word.</span>}
    </div>
  );
}
