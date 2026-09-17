// Revisar antes de imprimir: faltantes, marcadores sin completar, incoherencias y redacción.

import { valoresClinicos } from '../../../shared/seguimiento';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { tieneMarcadorPendiente } from '../../../shared/formato';
import { infoSeccion } from '../../../shared/secciones';
import type { RevisarRespuesta } from '../../../shared/types';
import { partes } from '../../../shared/valores';
import { Girador } from '../components/Basicos';
import { avisar } from '../lib/avisos';
import { enLinea, llamar, mensaje } from '../lib/api';
import { db } from '../lib/db';
import { compartirWord, descargarWord, puedeCompartirArchivos } from '../lib/docx/descargar';
import { calcularCompletitud, editar, marcarEstado, nombrePaciente } from '../lib/historia';
import { avisoEscritura, expandirEnHistoria, revisarEscritura } from '../lib/escritura';
import { rutas } from '../lib/router';
import { useCatalogo } from '../lib/schema';

export function Revisar({ clave }: { clave: string }) {
  const cat = useCatalogo();
  const h = useLiveQuery(() => db.historias.get(clave), [clave]);
  const [revisando, setRevisando] = useState(false);
  const [revision, setRevision] = useState<RevisarRespuesta | null>(null);
  const [aplicados, setAplicados] = useState<string[]>([]);
  const [generando, setGenerando] = useState(false);

  if (!h) return <div className="pagina vacio">Cargando…</div>;

  const comp = calcularCompletitud(h.valores, cat);
  const conMarcador = cat.esquema.filter((c) => tieneMarcadorPendiente(h.valores[c.campo_id] ?? ''));
  const signos = partes(h.valores['ea.signos_sintomas']);
  const dudas = h.dudas.filter((d) => d.estado === 'pendiente');
  const etiqueta = (id: string) => {
    const c = cat.porId.get(id);
    return c ? `${infoSeccion(c.seccion).corto} · ${c.label}` : id;
  };
  const enlace = (id: string) => rutas.campo(clave, cat.porId.get(id)?.seccion ?? '', id);
  const escritura = revisarEscritura(h.valores, cat);

  const revisarConGemini = async () => {
    setRevisando(true);
    try {
      setRevision(await llamar('hc.revisar', { dni: h.dni, episodio: h.episodio, valores: valoresClinicos(h.valores) }, { timeoutMs: 180_000 }));
      setAplicados([]);
    } catch (e) {
      avisar(mensaje(e), 'error');
    } finally {
      setRevisando(false);
    }
  };

  const word = async (fn: typeof descargarWord) => {
    setGenerando(true);
    try {
      await fn(h, cat);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) avisar(mensaje(e), 'error');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="pagina pila" style={{ maxWidth: 860 }}>
      <div className="fila">
        <a className="icono" href={rutas.historia(clave)} aria-label="Volver">
          ←
        </a>
        <div>
          <h1 className="titulo-pagina">Revisar</h1>
          <div className="sub">
            {nombrePaciente(h.valores)} · DNI {h.dni}
          </div>
        </div>
      </div>

      <section className="tarjeta pila">
        <h2 style={{ fontSize: '1rem' }}>En el dispositivo</h2>
        {comp.faltan.length === 0 && conMarcador.length === 0 && signos.length <= 3 && dudas.length === 0 ? (
          <div className="resultado">Todos los obligatorios están llenos.</div>
        ) : (
          <>
            {comp.faltan.length > 0 && (
              <div className="pila" style={{ gap: 6 }}>
                <strong className="pequeno">Obligatorios vacíos ({comp.faltan.length})</strong>
                <div className="chips">
                  {comp.faltan.map((c) => (
                    <a key={c.campo_id} className="chip" href={rutas.historia(clave, c.seccion)}>
                      {etiqueta(c.campo_id)}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {conMarcador.length > 0 && (
              <div className="pila" style={{ gap: 6 }}>
                <strong className="pequeno">Frases con datos por completar [ ]</strong>
                <div className="chips">
                  {conMarcador.map((c) => (
                    <a key={c.campo_id} className="chip" href={rutas.historia(clave, c.seccion)}>
                      {etiqueta(c.campo_id)}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {signos.length > 3 && <div className="aviso-texto">El motivo de consulta tiene {signos.length} síntomas; se recomiendan tres como máximo.</div>}
            {dudas.length > 0 && (
              <div className="aviso-texto">
                Quedan {dudas.length} dudas sin resolver. <a href={rutas.historia(clave)}>Verlas</a>
              </div>
            )}
          </>
        )}
      </section>

      <section className="tarjeta pila">
        <div className="fila entre">
          <h2 style={{ fontSize: '1rem' }}>Escritura completa</h2>
          {escritura.some((o) => o.siglas.length) && (
            <button
              type="button"
              className="boton chico primario"
              onClick={() => void expandirEnHistoria(clave, escritura, cat).then((n) => avisar(avisoEscritura(n, escritura), 'exito'))}
            >
              Escribir todo completo
            </button>
          )}
        </div>
        <span className="sub pequeno">
          La historia clínica se escribe sin abreviaturas ni diminutivos: puede llegar a otros profesionales o a un juzgado (Historia clínica y anamnesis).
        </span>
        {escritura.length === 0 ? (
          <div className="resultado">Sin abreviaturas ni diminutivos.</div>
        ) : (
          escritura.map((o) => (
            <div key={o.campo.campo_id} className="observacion">
              <a href={enlace(o.campo.campo_id)} style={{ color: 'inherit' }}>
                <strong>{etiqueta(o.campo.campo_id)}</strong>
              </a>
              <span>
                {o.siglas.length > 0 && <>Abreviaturas: {o.siglas.join(', ')}. </>}
                {o.diminutivos.length > 0 && <>Diminutivos para reescribir a mano: {o.diminutivos.join(', ')}.</>}
              </span>
              {o.sugerido !== o.actual && (
                <div className="comparacion">
                  <blockquote>{o.actual}</blockquote>
                  <blockquote className="nuevo">{o.sugerido}</blockquote>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      <section className="tarjeta pila">
        <div className="fila entre">
          <h2 style={{ fontSize: '1rem' }}>Con Gemini</h2>
          <button type="button" className="boton" disabled={revisando || !enLinea()} onClick={() => void revisarConGemini()}>
            {revisando ? <Girador /> : '✨'} {revision ? 'Revisar de nuevo' : 'Revisar la historia'}
          </button>
        </div>
        {!enLinea() && <span className="sub">Necesita señal y el backend configurado.</span>}
        <span className="sub pequeno">Busca datos que faltan según el síntoma guía, contradicciones entre secciones y redacción coloquial. No diagnostica.</span>
        {revision && (
          <div className="pila">
            {revision.faltantes.length + revision.incoherencias.length + revision.redaccion.length === 0 && (
              <div className="resultado">Sin observaciones.</div>
            )}
            {revision.faltantes.length > 0 && (
              <div className="pila" style={{ gap: 6 }}>
                <strong className="pequeno">Falta</strong>
                {revision.faltantes.map((f, i) => (
                  <a key={`${f.campo}-${i}`} className="observacion" href={enlace(f.campo)} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <strong>{etiqueta(f.campo)}</strong>
                    <span>{f.motivo}</span>
                  </a>
                ))}
              </div>
            )}
            {revision.incoherencias.length > 0 && (
              <div className="pila" style={{ gap: 6 }}>
                <strong className="pequeno">No concuerda</strong>
                {revision.incoherencias.map((x, i) => (
                  <div key={i} className="observacion">
                    <span>{x.descripcion}</span>
                    <div className="chips">
                      {x.campos.map((c) => (
                        <a key={c} className="chip frase" href={enlace(c)}>
                          {etiqueta(c)}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {revision.redaccion.length > 0 && (
              <div className="pila" style={{ gap: 6 }}>
                <strong className="pequeno">Redacción</strong>
                {revision.redaccion.map((r, i) => {
                  const hecho = aplicados.includes(`${r.campo}-${i}`);
                  return (
                    <div key={`${r.campo}-${i}`} className="observacion">
                      <strong>{etiqueta(r.campo)}</strong>
                      <span>{r.observacion}</span>
                      <div className="comparacion">
                        <blockquote>{h.valores[r.campo] ?? ''}</blockquote>
                        <blockquote className="nuevo">{r.sugerido}</blockquote>
                      </div>
                      <button
                        type="button"
                        className="boton chico primario"
                        disabled={hecho}
                        style={{ justifySelf: 'start' }}
                        onClick={() => {
                          void editar(clave, { [r.campo]: r.sugerido }, cat, { [r.campo]: 0.9 }).then(() =>
                            setAplicados((a) => [...a, `${r.campo}-${i}`]),
                          );
                        }}
                      >
                        {hecho ? 'Aplicado' : 'Usar la sugerencia'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="tarjeta pila">
        <h2 style={{ fontSize: '1rem' }}>Terminar</h2>
        <div className="fila">
          {h.estado === 'completa' ? (
            <button type="button" className="boton" onClick={() => void marcarEstado(clave, 'borrador')}>
              Volver a borrador
            </button>
          ) : (
            <button type="button" className="boton" onClick={() => void marcarEstado(clave, 'completa')}>
              ✓ Marcar como completa
            </button>
          )}
          <button type="button" className="boton primario" disabled={generando} onClick={() => void word(descargarWord)}>
            {generando ? <Girador /> : '⬇'} Generar Word
          </button>
          {puedeCompartirArchivos() && (
            <button type="button" className="boton" disabled={generando} onClick={() => void word(compartirWord)}>
              Compartir
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
