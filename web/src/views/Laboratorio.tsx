// Resultados de laboratorio: foto del informe → valores revisables → tabla con semáforo y tendencia.
// El valor queda con su unidad y su rango; la interpretación usa sexo, edad y altitud (la hemoglobina se ajusta por altura).

import { useLiveQuery } from 'dexie-react-hooks';
import { useRef, useState } from 'react';
import { hoyISO } from '../../../shared/fechas';
import { leerNumero } from '../../../shared/laboratorio';
import { CAMPO_LABORATORIO, escribirLaboratorio, leerLaboratorio } from '../../../shared/seguimiento';
import type { ResultadoLab } from '../../../shared/seguimiento';
import type { ResultadoLeido } from '../../../shared/types';
import { Girador } from '../components/Basicos';
import { InsigniaGravedad, LeyendaSemaforo, claseGravedad } from '../components/Semaforo';
import { enLinea, llamar, mensaje, uuid } from '../lib/api';
import { avisar } from '../lib/avisos';
import { db } from '../lib/db';
import type { HistoriaLocal } from '../lib/db';
import { NOMBRES_LAB, leerResultado, nombreCanonico, prepararFoto } from '../lib/laboratorio';
import { editar, nombrePaciente } from '../lib/historia';
import { rutas } from '../lib/router';
import { useCatalogo } from '../lib/schema';
import { fechaLegible } from '../lib/texto';

interface Fila extends ResultadoLeido {
  incluir: boolean;
}

const coma = (t: string) => t.replace(/(\d)\.(\d)/g, '$1,$2');

function Revision({ h, filas, setFilas, fecha, setFecha, advertencias, guardar, cancelar }: {
  h: HistoriaLocal;
  filas: Fila[];
  setFilas: (f: Fila[]) => void;
  fecha: string;
  setFecha: (f: string) => void;
  advertencias: string[];
  guardar: () => void;
  cancelar: () => void;
}) {
  const cambiar = (i: number, c: Partial<Fila>) => setFilas(filas.map((f, j) => (j === i ? { ...f, ...c } : f)));
  return (
    <section className="tarjeta pila">
      <h2 style={{ fontSize: '1rem' }}>Revisa lo leído antes de guardar</h2>
      <p className="sub" style={{ margin: 0 }}>
        Compara con la foto: corrige lo que esté mal y desmarca lo que no quieras guardar. Los nombres ya van completos.
      </p>
      {advertencias.map((a, i) => (
        <div key={i} className="aviso-texto">
          {a}
        </div>
      ))}
      <label className="pila" style={{ gap: 4, maxWidth: 240 }}>
        <span className="sub">Fecha del informe</span>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </label>
      <div className="desplazable">
        <table className="tabla-lab editable">
          <thead>
            <tr>
              <th />
              <th>Parámetro</th>
              <th>Valor</th>
              <th>Unidad</th>
              <th>Referencia</th>
              <th>Interpretación</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => {
              const l = leerResultado(f, h.valores);
              return (
                <tr key={i} className={claseGravedad(l?.nivel)}>
                  <td>
                    <input type="checkbox" aria-label="Guardar este resultado" checked={f.incluir} onChange={(e) => cambiar(i, { incluir: e.target.checked })} />
                  </td>
                  <td>
                    <input list="parametros-lab" aria-label="Parámetro" placeholder="Parámetro" value={f.parametro} onChange={(e) => cambiar(i, { parametro: e.target.value })} />
                  </td>
                  <td>
                    <input aria-label="Valor" placeholder="Valor" value={f.valor} inputMode="decimal" onChange={(e) => cambiar(i, { valor: e.target.value })} />
                  </td>
                  <td>
                    <input aria-label="Unidad" placeholder="Unidad" value={f.unidad} onChange={(e) => cambiar(i, { unidad: e.target.value })} />
                  </td>
                  <td>
                    <input aria-label="Valores de referencia" placeholder="Referencia del informe" value={f.referencia} onChange={(e) => cambiar(i, { referencia: e.target.value })} />
                  </td>
                  <td>{l ? <InsigniaGravedad gravedad={l.nivel} texto={l.etiqueta} /> : <span className="sub">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <datalist id="parametros-lab">
        {NOMBRES_LAB.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <div className="fila">
        <button type="button" className="boton" onClick={() => setFilas([...filas, { examen: '', parametro: '', valor: '', unidad: '', referencia: '', nota: '', incluir: true }])}>
          + Agregar fila
        </button>
        <button type="button" className="boton primario" disabled={!filas.some((f) => f.incluir && f.parametro && f.valor)} onClick={guardar}>
          Guardar {filas.filter((f) => f.incluir && f.parametro && f.valor).length} resultados
        </button>
        <button type="button" className="boton" onClick={cancelar}>
          Cancelar
        </button>
      </div>
    </section>
  );
}

export function Laboratorio({ clave }: { clave: string }) {
  const h = useLiveQuery(() => db.historias.get(clave), [clave]);
  const cat = useCatalogo(h?.plantilla);
  const archivo = useRef<HTMLInputElement>(null);
  const [leyendo, setLeyendo] = useState(false);
  const [filas, setFilas] = useState<Fila[] | null>(null);
  const [fecha, setFecha] = useState(hoyISO());
  const [advertencias, setAdvertencias] = useState<string[]>([]);
  const [origen, setOrigen] = useState<'foto' | 'manual'>('manual');
  if (!h) return <div className="pagina vacio">Cargando…</div>;

  const resultados = leerLaboratorio(h.valores[CAMPO_LABORATORIO]);

  const leerFoto = async (f: File | undefined) => {
    if (!f) return;
    if (!enLinea()) return avisar('Leer la foto necesita señal. Puedes escribir los resultados a mano.', 'error');
    setLeyendo(true);
    try {
      const foto = await prepararFoto(f);
      const r = await llamar(
        'entrada.laboratorio',
        { dni: h.dni, episodio: h.episodio, imagenBase64: foto.base64, mime: foto.mime },
        { opId: uuid(), timeoutMs: 180_000 },
      );
      setFilas(r.resultados.map((x) => ({ ...x, incluir: true })));
      setFecha(r.fecha || hoyISO());
      setAdvertencias(r.advertencias);
      setOrigen('foto');
      if (r.resultados.length === 0) avisar('No se leyó ningún resultado. Prueba con otra foto, con buena luz y sin sombras.', 'error');
    } catch (e) {
      avisar(mensaje(e), 'error');
    } finally {
      setLeyendo(false);
      if (archivo.current) archivo.current.value = '';
    }
  };

  const guardar = async () => {
    if (!filas) return;
    const nuevos: ResultadoLab[] = filas
      .filter((f) => f.incluir && f.parametro.trim() && f.valor.trim())
      .map((f) => ({
        id: uuid(),
        fecha,
        ...nombreCanonico(f.parametro, f.examen),
        valor: f.valor.trim(),
        unidad: f.unidad.trim(),
        referencia: f.referencia.trim(),
        nota: f.nota.trim(),
        origen,
      }));
    await editar(h.clave, { [CAMPO_LABORATORIO]: escribirLaboratorio([...resultados, ...nuevos]) }, cat);
    avisar(`${nuevos.length} resultados guardados`, 'exito');
    setFilas(null);
    setAdvertencias([]);
  };

  const borrar = async (id: string) => {
    await editar(h.clave, { [CAMPO_LABORATORIO]: escribirLaboratorio(resultados.filter((r) => r.id !== id)) }, cat);
  };

  // Agrupado por fecha, más reciente arriba; la tendencia compara con el mismo parámetro de la fecha anterior.
  const fechas = [...new Set(resultados.map((r) => r.fecha))].sort().reverse();
  const nombre = (x: ResultadoLab) => nombreCanonico(x.parametro, x.examen).parametro;
  const anterior = (r: ResultadoLab) =>
    [...resultados].reverse().find((x) => x.fecha < r.fecha && nombre(x) === nombre(r) && leerNumero(x.valor) !== null);

  return (
    <div className="pagina pila" style={{ maxWidth: 960 }}>
      <div className="fila">
        <a className="icono" href={rutas.historia(clave, 'examenes')} aria-label="Volver">
          ←
        </a>
        <div>
          <h1 className="titulo-pagina">🧪 Laboratorio</h1>
          <div className="sub">
            {nombrePaciente(h.valores)} · {resultados.length} resultados
          </div>
        </div>
      </div>

      {!filas && (
        <section className="tarjeta pila">
          <div className="fila">
            <button type="button" className="boton primario" disabled={leyendo} onClick={() => archivo.current?.click()}>
              {leyendo ? <Girador /> : '📷'} {leyendo ? 'Leyendo el informe…' : 'Foto del informe'}
            </button>
            <button
              type="button"
              className="boton"
              onClick={() => {
                setOrigen('manual');
                setFecha(hoyISO());
                setFilas([{ examen: '', parametro: '', valor: '', unidad: '', referencia: '', nota: '', incluir: true }]);
              }}
            >
              ✍ Escribir a mano
            </button>
          </div>
          <input ref={archivo} type="file" accept="image/*" capture="environment" hidden onChange={(e) => void leerFoto(e.target.files?.[0])} />
          <span className="sub pequeno">
            La foto se lee con Gemini y se guarda en tu carpeta de Drive. No se copian nombre ni DNI del informe. Toma la hoja completa, con buena luz.
          </span>
        </section>
      )}

      {filas && (
        <Revision
          h={h}
          filas={filas}
          setFilas={setFilas}
          fecha={fecha}
          setFecha={setFecha}
          advertencias={advertencias}
          guardar={() => void guardar()}
          cancelar={() => setFilas(null)}
        />
      )}

      {resultados.length > 0 && <LeyendaSemaforo />}

      {fechas.map((f) => (
        <section key={f} className="tarjeta pila">
          <h2 style={{ fontSize: '1rem' }}>{f ? fechaLegible(f) : 'Sin fecha'}</h2>
          <div className="desplazable">
            <table className="tabla-lab">
              <tbody>
                {resultados
                  .filter((r) => r.fecha === f)
                  .map((r) => {
                    const l = leerResultado(r, h.valores);
                    const antes = anterior(r);
                    const delta = antes ? (leerNumero(r.valor) ?? 0) - (leerNumero(antes.valor) ?? 0) : 0;
                    return (
                      <tr key={r.id} className={claseGravedad(l?.nivel)}>
                        <td>
                          <strong>{r.parametro}</strong>
                        </td>
                        <td>
                          {coma(r.valor)} {r.unidad}
                          {antes && delta !== 0 && (
                            <div className="sub pequeno">
                              {delta > 0 ? '↑' : '↓'} desde {coma(antes.valor)} ({fechaLegible(antes.fecha)})
                            </div>
                          )}
                        </td>
                        <td>
                          {l ? <InsigniaGravedad gravedad={l.nivel} texto={l.etiqueta} /> : <span className="sub">sin rango</span>}
                          {l?.detalle && <div className="sub pequeno">{l.detalle}</div>}
                          {r.referencia && <div className="sub pequeno">Informe: {r.referencia}</div>}
                        </td>
                        <td>
                          <button type="button" className="icono chico" aria-label={`Borrar ${r.parametro}`} onClick={() => void borrar(r.id)}>
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      {resultados.length > 0 && <span className="sub pequeno">Los resultados salen en «Exámenes complementarios» del Word, con su fecha, unidad y rango.</span>}
    </div>
  );
}
