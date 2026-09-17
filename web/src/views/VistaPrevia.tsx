// Vista previa del Word: lo mismo que se imprimirá, con cada parte enlazada a su campo.

import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { CAMPO_EVOLUCIONES, CAMPO_LABORATORIO } from '../../../shared/seguimiento';
import { Girador } from '../components/Basicos';
import { avisar } from '../lib/avisos';
import { mensaje } from '../lib/api';
import { db } from '../lib/db';
import { armarDocumento } from '../lib/docx/documento';
import type { Elemento, OpcionesDocumento } from '../lib/docx/documento';
import { compartirWord, descargarWord, guardarOpcionWord, opcionWord, opcionesCompletas, puedeCompartirArchivos } from '../lib/docx/descargar';
import { avisoEscritura, expandirEnHistoria, revisarEscritura } from '../lib/escritura';
import { nombrePaciente } from '../lib/historia';
import { ir, rutas } from '../lib/router';
import { useCatalogo } from '../lib/schema';

const LINEA = '______________________________';

export function VistaPrevia({ clave }: { clave: string }) {
  const cat = useCatalogo();
  const h = useLiveQuery(() => db.historias.get(clave), [clave]);
  const [op, setOp] = useState<OpcionesDocumento>(opcionWord);
  const [generando, setGenerando] = useState(false);
  const elementos = useMemo(() => (h ? armarDocumento(h, cat, opcionesCompletas(h, op)) : []), [h, cat, op]);

  if (!h) return <div className="pagina vacio">Cargando…</div>;
  const escritura = revisarEscritura(h.valores, cat);

  const cambiarOpcion = (vacios: OpcionesDocumento['vacios']) => {
    const nueva = { vacios };
    setOp(nueva);
    guardarOpcionWord(nueva);
  };

  const editarEn = (ref: string) => {
    if (ref === CAMPO_LABORATORIO) return ir(rutas.laboratorio(clave));
    if (ref === CAMPO_EVOLUCIONES) return ir(rutas.seguimiento(clave));
    const c = cat.porId.get(ref);
    if (c) ir(rutas.campo(clave, c.seccion, ref));
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

  const bloque = (e: Elemento, i: number) => {
    const tocable = 'ref' in e ? { role: 'button', tabIndex: 0, onClick: () => editarEn(e.ref), title: 'Tocar para editar' } : {};
    switch (e.t) {
      case 'titulo':
        return (
          <h2 key={i} className="hoja-titulo">
            {e.texto}
          </h2>
        );
      case 'seccion':
        return (
          <h3 key={i} className="hoja-seccion">
            {e.texto}
          </h3>
        );
      case 'sub':
        return (
          <h4 key={i} className={`hoja-sub nivel-${e.nivel}`}>
            {e.texto}
          </h4>
        );
      case 'campo':
        return (
          <p key={i} className="hoja-campo" {...tocable}>
            <strong>{e.etiqueta}:</strong> {e.valor || <span className="hoja-linea">{LINEA}</span>}
          </p>
        );
      case 'narrativa':
        return (
          <div key={i} className="hoja-narrativa" {...tocable}>
            {e.etiqueta && <strong>{e.etiqueta}:</strong>}
            {e.parrafos.length ? (
              e.parrafos.map((p, j) => <p key={j}>{p}</p>)
            ) : (
              <p className="hoja-linea">
                {LINEA}
                {LINEA}
              </p>
            )}
          </div>
        );
      case 'lista':
        return (
          <div key={i} className="hoja-narrativa" {...tocable}>
            <strong>{e.etiqueta}:</strong>
            {e.items.length ? (
              <ol>
                {e.items.map((it, j) => (
                  <li key={j}>{e.comillas ? `“${it}”` : it}</li>
                ))}
              </ol>
            ) : (
              <p className="hoja-linea">{LINEA}</p>
            )}
          </div>
        );
      case 'tabla':
        return (
          <div key={i} className="hoja-narrativa desplazable" {...tocable}>
            <strong>{e.titulo}:</strong>
            <table className="tabla-lab">
              <thead>
                <tr>
                  {e.encabezados.map((t) => (
                    <th key={t}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {e.filas.map((f, j) => (
                  <tr key={j}>
                    {f.map((c, k) => (
                      <td key={k}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'pares':
        return (
          <div key={i} className="hoja-pares" {...tocable}>
            {e.filas.flatMap((fila) =>
              fila.map((c) => (
                <p key={c.etiqueta} className={fila.length === 1 ? 'ancho' : undefined}>
                  <strong>{c.etiqueta}:</strong> {c.valor || <span className="hoja-linea">__________</span>}
                </p>
              )),
            )}
          </div>
        );
    }
  };

  return (
    <div className="pagina pila" style={{ maxWidth: 900 }}>
      <div className="fila entre">
        <div className="fila">
          <a className="icono" href={rutas.historia(clave)} aria-label="Volver">
            ←
          </a>
          <div>
            <h1 className="titulo-pagina">Vista previa</h1>
            <div className="sub">
              {nombrePaciente(h.valores)} · toca cualquier parte para editarla
            </div>
          </div>
        </div>
      </div>

      <div className="tarjeta pila">
        <div className="chips" role="radiogroup" aria-label="Campos vacíos">
          <button type="button" role="radio" aria-checked={op.vacios === 'lineas'} className={`chip ${op.vacios === 'lineas' ? 'activo' : ''}`} onClick={() => cambiarOpcion('lineas')}>
            Con líneas para llenar a mano
          </button>
          <button type="button" role="radio" aria-checked={op.vacios === 'omitir'} className={`chip ${op.vacios === 'omitir' ? 'activo' : ''}`} onClick={() => cambiarOpcion('omitir')}>
            Solo lo registrado
          </button>
        </div>
        {escritura.length > 0 && (
          <div className="aviso-texto pila" style={{ gap: 6 }}>
            <span>
              {escritura.length} {escritura.length === 1 ? 'campo tiene' : 'campos tienen'} abreviaturas o diminutivos:{' '}
              {[...new Set(escritura.flatMap((o) => [...o.siglas, ...o.diminutivos]))].join(', ')}.
            </span>
            <div className="fila">
              {escritura.some((o) => o.siglas.length) && (
                <button
                  type="button"
                  className="boton chico primario"
                  onClick={() => void expandirEnHistoria(clave, escritura, cat).then((n) => avisar(avisoEscritura(n, escritura), 'exito'))}
                >
                  Escribir completo
                </button>
              )}
              <a className="boton chico" href={rutas.revisar(clave)}>
                Ver detalle
              </a>
            </div>
          </div>
        )}
        <div className="fila">
          <button type="button" className="boton primario" disabled={generando} onClick={() => void word(descargarWord)}>
            {generando ? <Girador /> : '⬇'} Generar Word
          </button>
          {puedeCompartirArchivos() && (
            <button type="button" className="boton" disabled={generando} onClick={() => void word(compartirWord)}>
              Compartir
            </button>
          )}
        </div>
      </div>

      <article className="hoja">
        <img className="hoja-membrete" src={`${import.meta.env.BASE_URL}header.png`} alt="" />
        {elementos.map(bloque)}
        <img className="hoja-membrete" src={`${import.meta.env.BASE_URL}footer.png`} alt="" />
      </article>
    </div>
  );
}
