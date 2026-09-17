// Selección de niveles de escala y de los datos de su frase (nivel, lateralidad, localización…).

import { useState } from 'react';
import { ETIQUETA_MARCADOR, SUGERENCIAS_MARCADOR, opcionDeTexto, textoOpcion } from '../../../shared/formato';
import { tipoLista } from '../../../shared/catalogo';
import { gravedadDeOpcion } from '../../../shared/gravedad';
import type { Opcion } from '../../../shared/types';
import { marcadoresDeOpcion } from '../../../shared/valores';
import type { CatalogoVista } from '../lib/vista';
import { Modal } from './Basicos';
import { InsigniaGravedad, LeyendaSemaforo, claseGravedad } from './Semaforo';

export function FormMarcadores({
  claves,
  inicial,
  titulo,
  ayuda,
  confirmar,
  cancelar,
}: {
  claves: string[];
  inicial: Record<string, string>;
  titulo: string;
  /** Qué significa el hallazgo (solo pantalla). */
  ayuda?: string;
  confirmar: (datos: Record<string, string>) => void;
  cancelar: () => void;
}) {
  const [datos, setDatos] = useState<Record<string, string>>(inicial);
  const fijar = (k: string, v: string) => setDatos((d) => ({ ...d, [k]: v }));
  return (
    <form
      className="marcadores"
      onSubmit={(e) => {
        e.preventDefault();
        confirmar(datos);
      }}
    >
      <strong className="pequeno">{titulo}</strong>
      {ayuda && <span className="definicion">{ayuda}</span>}
      {claves.map((k, i) => {
        const sugerencias = k === 'fecha' ? [new Date().toLocaleDateString('es-PE')] : SUGERENCIAS_MARCADOR[k];
        return (
        <div key={k} className="pila" style={{ gap: 6 }}>
          <span className="sub">{ETIQUETA_MARCADOR[k] ?? k.replace(/_/g, ' ')}</span>
          {sugerencias && sugerencias.length > 0 && (
            <div className="chips">
              {sugerencias.map((s) => (
                <button key={s} type="button" className={`chip frase ${datos[k] === s ? 'activo' : ''}`} onClick={() => fijar(k, s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <input
            autoFocus={i === 0 && !sugerencias?.length}
            inputMode={/^(cm|fc|fr|grados|traveses|pulpejos|pupila_[di])$/.test(k) ? 'decimal' : undefined}
            value={datos[k] ?? ''}
            onChange={(e) => fijar(k, e.target.value)}
            placeholder={ETIQUETA_MARCADOR[k] ?? k.replace(/_/g, ' ')}
          />
        </div>
        );
      })}
      <div className="fila">
        <button type="submit" className="boton primario chico">
          Listo
        </button>
        <button type="button" className="boton chico" onClick={cancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/** Lista de niveles con su explicación. Devuelve la frase ya armada. */
export function ElegirNivel({
  lista,
  actual,
  elegir,
}: {
  lista: Opcion[];
  actual: string;
  elegir: (texto: string) => void;
}) {
  const [pendiente, setPendiente] = useState<Opcion | null>(null);
  const encontrado = opcionDeTexto(lista, actual);
  const compacta = lista.length > 7 && lista.every((o) => o.valor.length <= 3);
  const conSemaforo = lista.some((o) => gravedadDeOpcion(o) !== null);

  const tocar = (op: Opcion) => {
    const claves = marcadoresDeOpcion(op);
    if (claves.length > 0) setPendiente(op);
    else elegir(textoOpcion(op));
  };

  if (pendiente) {
    return (
      <FormMarcadores
        claves={marcadoresDeOpcion(pendiente)}
        inicial={encontrado?.opcion === pendiente ? encontrado.datos : {}}
        titulo={`${pendiente.valor} · ${pendiente.etiqueta}`}
        confirmar={(datos) => {
          elegir(textoOpcion(pendiente, datos));
          setPendiente(null);
        }}
        cancelar={() => setPendiente(null)}
      />
    );
  }

  if (compacta) {
    const sel = encontrado?.opcion;
    const gSel = sel ? gravedadDeOpcion(sel) : null;
    return (
      <div className="pila" style={{ gap: 6 }}>
        <div className="rejilla-niveles">
          {lista.map((op) => (
            <button
              key={op.valor}
              type="button"
              className={`chip ${claseGravedad(gravedadDeOpcion(op))} ${sel === op ? 'activo' : ''}`}
              title={op.etiqueta}
              aria-pressed={sel === op}
              onClick={() => tocar(op)}
            >
              {op.valor}
            </button>
          ))}
        </div>
        {sel && (gSel !== null ? <InsigniaGravedad gravedad={gSel} texto={sel.etiqueta} /> : <span className="sub">{sel.etiqueta}</span>)}
        {conSemaforo && <LeyendaSemaforo />}
      </div>
    );
  }

  return (
    <div className="niveles">
      {lista.map((op) => (
        <button
          key={op.valor}
          type="button"
          className={`nivel ${claseGravedad(gravedadDeOpcion(op))} ${encontrado?.opcion === op ? 'activo' : ''}`}
          aria-pressed={encontrado?.opcion === op}
          onClick={() => tocar(op)}
        >
          <span className="valor">{op.valor}</span>
          <span className="desc">{op.etiqueta}</span>
        </button>
      ))}
      {conSemaforo && <LeyendaSemaforo />}
    </div>
  );
}

/** Modal para insertar cualquier escala (NYHA, mMRC, godet…) en un campo. */
export function SelectorEscala({
  cat,
  listaId,
  permitidas,
  cerrar,
  elegir,
}: {
  cat: CatalogoVista;
  listaId: string | null;
  /** Escalas que corresponden al campo. Si hay una sola, se abre directo. */
  permitidas?: string[];
  cerrar: () => void;
  elegir: (texto: string, listaId: string) => void;
}) {
  const unica = !listaId && permitidas?.length === 1 ? permitidas[0] : null;
  const [lista, setLista] = useState<string | null>(listaId ?? unica);
  const escalas = [...cat.listas.entries()].filter(
    ([id, l]) => tipoLista(l) === 'escala' && (!permitidas || permitidas.includes(id)),
  );
  const opciones = lista ? cat.listas.get(lista) : undefined;
  return (
    <Modal titulo={opciones ? opciones[0].nombre : 'Insertar escala'} cerrar={cerrar}>
      {!opciones && (
        <div className="chips">
          {escalas.map(([id, l]) => (
            <button key={id} type="button" className="chip" onClick={() => setLista(id)}>
              {l[0].nombre}
            </button>
          ))}
        </div>
      )}
      {opciones && lista && (
        <>
          <ElegirNivel
            lista={opciones}
            actual=""
            elegir={(texto) => {
              elegir(texto, lista);
              cerrar();
            }}
          />
          {!listaId && !unica && (
            <button type="button" className="boton chico" onClick={() => setLista(null)}>
              ← Otras escalas
            </button>
          )}
        </>
      )}
    </Modal>
  );
}
