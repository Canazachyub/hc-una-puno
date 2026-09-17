// Un control por tipo de campo. Elegir antes que escribir.

import { memo, useRef, useState } from 'react';
import { escalasDeCampo, tieneRegla, valorNormal } from '../../../shared/catalogo';
import { marcadores, opcionDeTexto, textoOpcion } from '../../../shared/formato';
import { CAMPOS_CLAVE } from '../../../shared/secciones';
import type { Campo, Duda, EscalaSugerida, Opcion } from '../../../shared/types';
import { EXCLUYENTES, clave, marcadoresDeOpcion, normalizarNumero, partes, unir } from '../../../shared/valores';
import { avisar } from '../lib/avisos';
import { enLinea, llamar, mensaje, uuid } from '../lib/api';
import { db } from '../lib/db';
import { aplicarOrganizar, confirmarCampo, descartarSugerencia, editar } from '../lib/historia';
import { notasDeCampo } from '../lib/schema';
import { validarOrganizar } from '../lib/sync';
import { edadEnAnios, hoyISO, tiempoEntre } from '../../../shared/fechas';
import type { ContextoClinico } from '../../../shared/contexto';
import { gravedadDeOpcion, gravedadDeTexto } from '../../../shared/gravedad';
import { valoresClinicos } from '../../../shared/seguimiento';
import { interpretarConNivel } from '../../../shared/guias';
import { definicionDe } from '../lib/definiciones';
import { UMBRALES } from '../lib/guias';
import { fechaLegible, mostrarValor } from '../lib/texto';
import { GuiaCampo } from './Guia';
import type { CatalogoVista } from '../lib/vista';
import { Girador, useAutoAltura, useTextoDiferido } from './Basicos';
import { ConstructorSintoma } from './ConstructorSintoma';
import { ElegirNivel, FormMarcadores, SelectorEscala } from './Niveles';
import { InsigniaGravedad, claseGravedad } from './Semaforo';

interface PropsControl {
  campo: Campo;
  valor: string;
  cambiar: (v: string) => void;
  cat: CatalogoVista;
  id: string;
}

const REGLA_AYUDA: Record<string, string> = {
  palabras_paciente: 'Con las palabras del paciente',
  farmaco_dosis_via_intervalo: 'Fármaco, dosis, vía y frecuencia',
  examen_con_pregunta: 'Examen y qué pregunta responde',
  valor_unidad_rango: 'Fecha, valor, unidad y rango',
  soap: 'Fecha y S / O / A / P',
  con_sustento: 'Con su sustento',
  sin_codigos: 'Un diagnóstico por línea',
};

function ayudaDe(campo: Campo): string {
  return campo.reglas
    .map((r) => REGLA_AYUDA[r])
    .filter(Boolean)
    .join(' · ');
}

// ---------- definiciones (solo en pantalla) ----------

function Fuente({ fuente }: { fuente: string }) {
  return fuente ? <span className="fuente"> · {fuente}</span> : null;
}

function Definiciones({ lista, seleccion, elegir }: { lista: Opcion[]; seleccion: string[]; elegir: (o: Opcion) => void }) {
  const [todas, setTodas] = useState(false);
  const conDefinicion = lista
    .filter((o) => o.tipo !== 'frase')
    .map((o) => ({ o, d: definicionDe(o) }))
    .filter((x): x is { o: Opcion; d: { texto: string; fuente: string } } => x.d !== null);
  if (conDefinicion.length === 0) return null;
  const elegidas = conDefinicion.filter(({ o }) => seleccion.includes(o.valor));
  return (
    <>
      {elegidas.map(({ o, d }) => (
        <div key={o.valor} className={`definicion ${claseGravedad(gravedadDeOpcion(o))}`}>
          <strong>{o.valor}:</strong> {d.texto}
          <Fuente fuente={d.fuente} />
        </div>
      ))}
      <button type="button" className="enlace" onClick={() => setTodas(!todas)}>
        {todas ? 'Ocultar definiciones' : 'ⓘ Qué significa cada opción'}
      </button>
      {todas && (
        <ul className="definiciones">
          {conDefinicion.map(({ o, d }) => (
            <li key={o.valor}>
              <button
                type="button"
                className={`${claseGravedad(gravedadDeOpcion(o))} ${seleccion.includes(o.valor) ? 'activo' : ''}`}
                onClick={() => elegir(o)}
              >
                <strong>{o.valor}</strong> <span>{d.texto}</span>
                <Fuente fuente={d.fuente} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// ---------- opcion / opcion_otro ----------

function CampoOpcion({ campo, valor, cambiar, cat, id }: PropsControl) {
  const lista = campo.lista_id ? cat.listas.get(campo.lista_id) : undefined;
  const texto = useTextoDiferido(valor, cambiar);
  const esOtra = (o: Opcion) => /^otr[ao]$/i.test(o.valor);
  const enLista = !!lista?.some((o) => o.valor === valor);
  const [otraAbierta, setOtraAbierta] = useState(!!valor && !enLista && campo.tipo === 'opcion_otro');
  const [buscar, setBuscar] = useState('');

  if (!lista) {
    const normal = valorNormal(campo, cat.listas);
    return (
      <>
        <input id={id} value={texto.local} onChange={(e) => texto.escribir(e.target.value)} onBlur={texto.confirmar} />
        {normal && (
          <div className="chips">
            <button type="button" className={`chip ${valor === normal ? 'activo' : ''}`} onClick={() => texto.reemplazar(normal)}>
              {normal}
            </button>
          </div>
        )}
      </>
    );
  }

  const permiteOtra = campo.tipo === 'opcion_otro';
  const todas = permiteOtra ? lista.filter((o) => !esOtra(o)) : lista;
  const q = clave(buscar);
  const opciones = q ? todas.filter((o) => o.valor === valor || clave(`${o.valor} ${definicionDe(o)?.texto ?? ''}`).includes(q)) : todas;
  return (
    <>
      {todas.length > 20 && (
        <input type="search" placeholder="Buscar" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      )}
      <div className="chips" role="radiogroup">
        {opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={valor === o.valor}
            className={`chip ${claseGravedad(gravedadDeOpcion(o))} ${valor === o.valor ? 'activo' : ''}`}
            title={definicionDe(o)?.texto}
            onClick={() => {
              setOtraAbierta(false);
              texto.reemplazar(valor === o.valor ? '' : o.valor);
            }}
          >
            {o.valor}
          </button>
        ))}
        {permiteOtra && (
          <button
            type="button"
            className={`chip ${otraAbierta || (!!valor && !enLista) ? 'activo' : ''}`}
            onClick={() => {
              if (enLista) texto.reemplazar('');
              setOtraAbierta(true);
            }}
          >
            Otra…
          </button>
        )}
      </div>
      {permiteOtra && (otraAbierta || (!!valor && !enLista)) && (
        <input
          id={id}
          autoFocus={otraAbierta && !valor}
          placeholder="Especificar"
          value={enLista ? '' : texto.local}
          onChange={(e) => texto.escribir(e.target.value)}
          onBlur={texto.confirmar}
        />
      )}
      <Definiciones
        lista={todas}
        seleccion={[valor]}
        elegir={(o) => {
          setOtraAbierta(false);
          texto.reemplazar(o.valor);
        }}
      />
    </>
  );
}

// ---------- multi ----------

function CampoMulti({ campo, valor, cambiar, cat }: PropsControl) {
  const lista = campo.lista_id ? cat.listas.get(campo.lista_id) : undefined;
  const [pendiente, setPendiente] = useState<Opcion | null>(null);
  if (!lista) return <CampoLista campo={campo} valor={valor} cambiar={cambiar} cat={cat} id="" />;
  const seleccion = partes(valor);
  const deOpcion = (op: Opcion) => seleccion.filter((s) => opcionDeTexto([op], s));
  const esExcluyente = (op: Opcion) => EXCLUYENTES.includes(clave(op.valor));

  const agregar = (op: Opcion, texto: string) => {
    const excluyentes = lista.filter(esExcluyente);
    let nueva = seleccion.filter((s) => !opcionDeTexto([op], s));
    if (esExcluyente(op)) nueva = [];
    else nueva = nueva.filter((s) => !excluyentes.some((e) => opcionDeTexto([e], s)));
    cambiar(unir([...nueva, texto]));
  };

  const tocar = (op: Opcion) => {
    if (deOpcion(op).length > 0) {
      cambiar(unir(seleccion.filter((s) => !opcionDeTexto([op], s))));
      return;
    }
    if (marcadoresDeOpcion(op).length > 0) setPendiente(op);
    else agregar(op, textoOpcion(op));
  };

  const conFrase = seleccion.filter((s) => {
    const e = opcionDeTexto(lista, s);
    return e && e.opcion.formato_salida && s !== e.opcion.valor;
  });

  return (
    <>
      <div className="chips">
        {lista.map((op) => {
          const activo = deOpcion(op).length > 0;
          return (
            <button
              key={op.valor}
              type="button"
              aria-pressed={activo}
              className={`chip ${claseGravedad(gravedadDeOpcion(op))} ${activo ? 'activo' : ''}`}
              title={definicionDe(op)?.texto}
              onClick={() => tocar(op)}
            >
              {op.valor}
            </button>
          );
        })}
      </div>
      {pendiente && (
        <FormMarcadores
          claves={marcadoresDeOpcion(pendiente)}
          inicial={{}}
          titulo={`${pendiente.valor}${pendiente.etiqueta ? ` · ${pendiente.etiqueta}` : ''}`}
          confirmar={(datos) => {
            agregar(pendiente, textoOpcion(pendiente, datos));
            setPendiente(null);
          }}
          cancelar={() => setPendiente(null)}
        />
      )}
      {conFrase.length > 0 && (
        <ul className="lista-items">
          {conFrase.map((s) => (
            <li key={s}>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
      <Definiciones
        lista={lista}
        seleccion={lista.filter((op) => deOpcion(op).length > 0).map((op) => op.valor)}
        elegir={tocar}
      />
    </>
  );
}

// ---------- escala ----------

function CampoEscala({ campo, valor, cambiar, cat }: PropsControl) {
  const lista = campo.lista_id ? cat.listas.get(campo.lista_id) : undefined;
  // null: sigue al valor (vacío → lista abierta). Así, si Normal o Gemini lo llenan, se muestra el resumen.
  const [elegido, setAbierto] = useState<boolean | null>(null);
  const abierto = elegido ?? !valor;
  if (!lista) return <div className="error-texto">Lista {campo.lista_id} no encontrada</div>;
  const encontrado = opcionDeTexto(lista, valor);
  const normal = valorNormal(campo, cat.listas);
  const gravedad = gravedadDeTexto(lista, valor);
  if (valor && !abierto) {
    return (
      <div className="fila entre">
        <span className={`solo-lectura ${claseGravedad(gravedad)}`} style={{ flex: 1 }}>
          {valor}
          {encontrado && encontrado.opcion.etiqueta && valor === encontrado.opcion.valor && (
            <span className="sub"> · {encontrado.opcion.etiqueta}</span>
          )}
          {gravedad !== null && (
            <>
              {' '}
              <InsigniaGravedad gravedad={gravedad} />
            </>
          )}
        </span>
        <button type="button" className="boton chico" onClick={() => setAbierto(true)}>
          Cambiar
        </button>
      </div>
    );
  }
  return (
    <>
      {normal && !valor && (
        <div className="chips">
          <button
            type="button"
            className="chip"
            onClick={() => {
              cambiar(normal);
              setAbierto(null);
            }}
          >
            Normal · {normal}
          </button>
        </div>
      )}
      <ElegirNivel
        lista={lista}
        actual={valor}
        elegir={(t) => {
          cambiar(t);
          setAbierto(null);
        }}
      />
      {valor && (
        <button type="button" className="boton chico" onClick={() => setAbierto(null)}>
          Cerrar
        </button>
      )}
    </>
  );
}

// ---------- texto, número, fecha, texto largo ----------

/** Abre el calendario del sistema al tocar el campo (donde el navegador lo permite). */
function abrirCalendario(e: { currentTarget: HTMLInputElement }): void {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // algunos navegadores solo lo permiten con un toque directo
  }
}

function CampoFecha({ campo, valor, cambiar, id }: PropsControl) {
  const conHora = tieneRegla(campo, 'con_hora');
  const soloFecha = valor.slice(0, 10);
  return (
    <div className="fila">
      <input
        id={id}
        type={conHora ? 'datetime-local' : 'date'}
        style={{ flex: 1, minWidth: 180 }}
        value={conHora ? (valor.length > 10 ? valor.slice(0, 16) : valor ? `${valor}T00:00` : '') : soloFecha}
        max={campo.campo_id === 'fil.fecha_nacimiento' ? hoyISO() : undefined}
        onClick={abrirCalendario}
        onChange={(e) => cambiar(e.target.value)}
      />
      <button type="button" className="boton chico" onClick={() => cambiar(hoyISO(conHora))}>
        {conHora ? 'Ahora' : 'Hoy'}
      </button>
      {valor && <span className="sub pequeno">{fechaLegible(valor)}</span>}
    </div>
  );
}

function CampoTexto({ campo, valor, cambiar, id }: PropsControl) {
  const [error, setError] = useState('');
  const guardar = (v: string) => {
    if (campo.tipo === 'numero') {
      const n = normalizarNumero(v);
      if (n === null) {
        setError('Escribe solo el número');
        return;
      }
      setError('');
      cambiar(n);
      return;
    }
    cambiar(v);
  };
  const texto = useTextoDiferido(valor, guardar, campo.tipo === 'numero' ? 900 : 600);
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutoAltura(ref, texto.local);

  if (campo.tipo === 'texto_largo') {
    return (
      <textarea
        id={id}
        ref={ref}
        rows={3}
        value={texto.local}
        placeholder={ayudaDe(campo)}
        onChange={(e) => texto.escribir(e.target.value)}
        onBlur={texto.confirmar}
      />
    );
  }
  return (
    <>
      <input
        id={id}
        inputMode={campo.tipo === 'numero' ? 'decimal' : undefined}
        enterKeyHint="next"
        value={texto.local}
        onChange={(e) => texto.escribir(e.target.value)}
        onBlur={texto.confirmar}
      />
      {error && <span className="error-texto pequeno">{error}</span>}
    </>
  );
}

// ---------- lista ----------

function CampoLista({ campo, valor, cambiar, id }: PropsControl) {
  const items = partes(valor);
  const [nuevo, setNuevo] = useState('');
  const max = campo.reglas.includes('max_3') ? 3 : Infinity;
  const agregar = () => {
    const t = nuevo.trim().replace(/\|/g, '/');
    if (!t || items.length >= max) return;
    cambiar(unir([...items, t]));
    setNuevo('');
  };
  const mover = (i: number) => {
    const copia = [...items];
    [copia[i - 1], copia[i]] = [copia[i], copia[i - 1]];
    cambiar(unir(copia));
  };
  return (
    <>
      {items.length > 0 && (
        <ol className="lista-items">
          {items.map((it, i) => (
            <li key={`${i}-${it}`}>
              <span>
                {i + 1}. {it}
              </span>
              {i > 0 && (
                <button type="button" className="icono chico" aria-label="Subir" onClick={() => mover(i)}>
                  ↑
                </button>
              )}
              <button
                type="button"
                className="icono chico"
                aria-label="Quitar"
                onClick={() => cambiar(unir(items.filter((_, j) => j !== i)))}
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      )}
      {items.length < max ? (
        <form
          className="fila"
          onSubmit={(e) => {
            e.preventDefault();
            agregar();
          }}
        >
          <input
            id={id}
            style={{ flex: 1, minWidth: 180 }}
            value={nuevo}
            enterKeyHint="done"
            placeholder={ayudaDe(campo) || 'Agregar'}
            onChange={(e) => setNuevo(e.target.value)}
          />
          <button type="submit" className="boton chico" disabled={!nuevo.trim()}>
            Agregar
          </button>
        </form>
      ) : (
        <span className="sub">Máximo {max}.</span>
      )}
    </>
  );
}

// ---------- narrativa ----------

/** Qué significa cada hallazgo de la región (solo pantalla). */
function SignificadosFrases({ frases }: { frases: Opcion[] }) {
  const [abierto, setAbierto] = useState(false);
  const con = frases.map((f) => ({ f, d: definicionDe(f) })).filter((x) => x.d !== null);
  if (con.length === 0) return null;
  return (
    <>
      <button type="button" className="enlace" onClick={() => setAbierto(!abierto)}>
        {abierto ? 'Ocultar significados' : 'ⓘ Qué significa cada hallazgo'}
      </button>
      {abierto && (
        <ul className="definiciones">
          {con.map(({ f, d }) => (
            <li key={f.valor}>
              <div className="significado">
                <strong>{f.etiqueta.replace(/\{[a-z_]+\}/g, '…').trim()}</strong> <span>{d?.texto}</span>
                <Fuente fuente={d?.fuente ?? ''} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function CampoNarrativa({ campo, valor, cambiar, cat, id, clave: claveHc }: PropsControl & { clave: string }) {
  const texto = useTextoDiferido(valor, cambiar);
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutoAltura(ref, texto.local);
  const [frase, setFrase] = useState<Opcion | null>(null);
  const [escala, setEscala] = useState(false);
  const [puliendo, setPuliendo] = useState(false);
  const [constructor, setConstructor] = useState<{ primero: boolean; tiempo: { valor: string; unidad: string } } | null>(null);
  const lista = campo.lista_id ? cat.listas.get(campo.lista_id) : undefined;
  const normal = valorNormal(campo, cat.listas);
  const frases = (lista ?? []).filter((o) => o.tipo === 'frase' && o.valor !== campo.valor_normal);
  const escalas = escalasDeCampo(campo, cat.listas);
  const conConstructor = tieneRegla(campo, 'constructor_sintoma') && cat.listas.has('sintoma');
  const esResumen = campo.campo_id === 'dx.resumen';

  const abrirConstructor = async () => {
    texto.confirmar();
    const h = await db.historias.get(claveHc);
    setConstructor({
      primero: !texto.local.trim(),
      tiempo: { valor: h?.valores['ea.tiempo_valor'] ?? '', unidad: h?.valores['ea.tiempo_unidad'] ?? 'días' },
    });
  };

  const agregarTexto = (t: string) => {
    const actual = texto.local.trimEnd();
    const sep = actual === '' ? '' : /[.:;]$/.test(actual) ? ' ' : '. ';
    texto.reemplazar(`${actual}${sep}${t}`);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });
  };

  const usarNormal = () => {
    if (texto.local.trim() && texto.local.trim() !== normal && !confirm('¿Reemplazar lo escrito por el hallazgo normal?')) return;
    texto.reemplazar(normal);
  };

  const pulir = async () => {
    texto.confirmar();
    if (!enLinea()) {
      avisar('Sin señal: la redacción con Gemini necesita conexión', 'error');
      return;
    }
    const h = await db.historias.get(claveHc);
    if (!h) return;
    setPuliendo(true);
    try {
      const r = validarOrganizar(
        await llamar(
          'entrada.organizar',
          {
            texto: esResumen ? '' : texto.local,
            origen: 'texto',
            dni: h.dni,
            episodio: h.episodio,
            seccion: campo.seccion,
            campo_objetivo: campo.campo_id,
            contexto: valoresClinicos(h.valores),
          },
          { opId: uuid(), timeoutMs: 180_000 },
        ),
      );
      const n = await aplicarOrganizar(claveHc, r, cat);
      avisar(n.llenados ? 'Redacción actualizada. Puedes deshacer desde el panel de Contar.' : 'Gemini no propuso cambios', n.llenados ? 'exito' : 'info');
    } catch (e) {
      avisar(mensaje(e), 'error');
    } finally {
      setPuliendo(false);
    }
  };

  return (
    <>
      <textarea
        id={id}
        ref={ref}
        rows={2}
        value={texto.local}
        placeholder={normal ? 'Toca «Normal» o escribe el hallazgo' : ayudaDe(campo)}
        onChange={(e) => texto.escribir(e.target.value)}
        onBlur={texto.confirmar}
      />
      {frase && (
        <FormMarcadores
          claves={marcadores(frase.etiqueta)}
          inicial={{}}
          titulo={frase.etiqueta}
          ayuda={definicionDe(frase)?.texto}
          confirmar={(datos) => {
            agregarTexto(textoOpcion(frase, datos));
            setFrase(null);
          }}
          cancelar={() => setFrase(null)}
        />
      )}
      <div className="chips">
        {conConstructor && (
          <button type="button" className="chip activo" onClick={() => void abrirConstructor()}>
            🩺 Describir síntoma
          </button>
        )}
        {normal && (
          <button type="button" className={`chip ${texto.local.trim() === normal ? 'activo' : ''}`} onClick={usarNormal}>
            Normal
          </button>
        )}
        {frases.map((f) => (
          <button
            key={f.valor}
            type="button"
            className="chip frase"
            title={definicionDe(f)?.texto ?? f.etiqueta}
            onClick={() => (marcadores(f.etiqueta).length ? setFrase(f) : agregarTexto(f.etiqueta.trim()))}
          >
            {f.etiqueta.length > 34 ? `${f.etiqueta.slice(0, 32).trim()}…` : f.etiqueta.trim()}
          </button>
        ))}
        {escalas.length > 0 && (
          <button type="button" className="chip frase" onClick={() => setEscala(true)}>
            + {escalas.length === 1 ? (cat.listas.get(escalas[0])?.[0].nombre ?? 'Escala') : 'Escala'}
          </button>
        )}
        <button
          type="button"
          className="chip frase"
          disabled={puliendo || (!texto.local.trim() && !esResumen)}
          onClick={() => void pulir()}
        >
          {puliendo ? <Girador /> : '✨'} {esResumen && !texto.local.trim() ? 'Redactar desde la historia' : 'Pulir redacción'}
        </button>
      </div>
      <SignificadosFrases frases={frases} />
      {escala && (
        <SelectorEscala cat={cat} listaId={null} permitidas={escalas} cerrar={() => setEscala(false)} elegir={(t) => agregarTexto(t)} />
      )}
      {constructor && (
        <ConstructorSintoma
          cat={cat}
          primeroPorDefecto={constructor.primero}
          tiempoInicial={constructor.tiempo}
          cerrar={() => setConstructor(null)}
          agregar={(f) => {
            const actual = texto.local.trim();
            texto.reemplazar(actual ? `${actual}${/[.:;]$/.test(actual) ? ' ' : '. '}${f}` : f);
          }}
        />
      )}
    </>
  );
}

// ---------- Envoltorio ----------

export interface PropsCampoVista {
  campo: Campo;
  clave: string;
  dni: string;
  valor: string;
  confianza: number | undefined;
  sugerencias: EscalaSugerida[];
  dudas: Duda[];
  cat: CatalogoVista;
  faltante: boolean;
  /** Fechas de la historia que usan los calculadores (nacimiento, ingreso, elaboración). */
  fechas: Record<string, string>;
  /** Ámbitos de la guía que se muestran con este campo (vacío si ya se mostraron en otro). */
  guia: string[];
  /** Grupo de edad, sexo y altitud para interpretar cifras. */
  clinico: ContextoClinico;
}

/** Tiempo de enfermedad desde la fecha de inicio de los síntomas hasta el ingreso (o hasta hoy). */
function CalculadorTiempo({ clave: claveHc, cat, fechas }: { clave: string; cat: CatalogoVista; fechas: Record<string, string> }) {
  const [abierto, setAbierto] = useState(false);
  const [inicio, setInicio] = useState('');
  const referencia = fechas['fil.fecha_ingreso'] || fechas['fil.fecha_elaboracion'] || hoyISO(true);
  const resultado = inicio ? tiempoEntre(inicio, referencia) : null;
  if (!abierto) {
    return (
      <button type="button" className="enlace" onClick={() => setAbierto(true)}>
        📅 Calcular desde la fecha de inicio de los síntomas
      </button>
    );
  }
  return (
    <div className="marcadores">
      <span className="sub">
        ¿Desde cuándo? Se cuenta hasta {fechas['fil.fecha_ingreso'] ? `el ingreso (${fechaLegible(referencia)})` : 'hoy'}. Si el paciente no recuerda el día exacto, elige una fecha aproximada.
      </span>
      <input type="datetime-local" value={inicio} max={referencia.length > 10 ? referencia : `${referencia}T23:59`} onClick={abrirCalendario} onChange={(e) => setInicio(e.target.value)} />
      {inicio && !resultado && <span className="error-texto pequeno">La fecha de inicio es posterior al ingreso.</span>}
      <div className="fila">
        <button
          type="button"
          className="boton primario chico"
          disabled={!resultado}
          onClick={() => {
            if (!resultado) return;
            void editar(claveHc, { 'ea.tiempo_valor': resultado.valor, 'ea.tiempo_unidad': resultado.unidad }, cat).then(() => {
              avisar(`Tiempo de enfermedad: ${resultado.valor} ${resultado.unidad}`, 'exito');
              setAbierto(false);
            });
          }}
        >
          {resultado ? `Usar ${resultado.valor} ${resultado.unidad}` : 'Usar'}
        </button>
        <button type="button" className="boton chico" onClick={() => setAbierto(false)}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function CampoVistaBase({ campo, clave: claveHc, dni, valor, confianza, sugerencias, dudas, cat, faltante, fechas, guia, clinico }: PropsCampoVista) {
  const [selector, setSelector] = useState<string | null>(null);
  const idHtml = `c-${campo.campo_id.replace(/\./g, '-')}`;
  const cambiar = (v: string) => void editar(claveHc, { [campo.campo_id]: v }, cat);
  const notas = notasDeCampo(cat, campo);
  const dudoso = confianza !== undefined && confianza < 0.7;
  const permitidas = escalasDeCampo(campo, cat.listas);
  const sugeridas = sugerencias.filter((s) => permitidas.includes(s.lista_id));

  const aplicarEscala = (texto: string, listaId: string) => {
    if (campo.lista_id === listaId && campo.tipo === 'escala') cambiar(texto);
    else if (campo.lista_id === listaId && campo.tipo === 'multi') cambiar(unir([...partes(valor), texto]));
    else {
      const actual = valor.trim();
      cambiar(actual ? `${actual}${/[.:;]$/.test(actual) ? ' ' : '. '}${texto}` : texto);
    }
    void descartarSugerencia(claveHc, campo.campo_id, listaId);
  };

  let control;
  const props: PropsControl = { campo, valor, cambiar, cat, id: idHtml };
  if (CAMPOS_CLAVE.includes(campo.campo_id)) {
    control = <div className="solo-lectura">{dni}</div>;
  } else {
    switch (campo.tipo) {
      case 'opcion':
      case 'opcion_otro':
        control = <CampoOpcion {...props} />;
        break;
      case 'multi':
        control = <CampoMulti {...props} />;
        break;
      case 'escala':
        control = <CampoEscala {...props} />;
        break;
      case 'lista':
        control = <CampoLista {...props} />;
        break;
      case 'narrativa':
        control = <CampoNarrativa {...props} clave={claveHc} />;
        break;
      case 'calculado':
        control = <div className="solo-lectura">{mostrarValor(campo, valor) || '—'}</div>;
        break;
      case 'fecha':
        control = <CampoFecha {...props} />;
        break;
      default:
        control = <CampoTexto {...props} />;
    }
  }

  // Ayudas que no se imprimen: interpretación de signos vitales y cálculos con fechas.
  const interpretacion = interpretarConNivel(campo.campo_id, valor, UMBRALES, clinico);
  const edad = campo.campo_id === 'fil.edad' && fechas['fil.fecha_nacimiento']
    ? edadEnAnios(fechas['fil.fecha_nacimiento'], (fechas['fil.fecha_ingreso'] || hoyISO()).slice(0, 10))
    : null;

  return (
    <div className={`campo ${dudoso ? 'dudoso' : ''} ${faltante ? 'faltante' : ''}`} id={`campo-${campo.campo_id}`}>
      <div className="campo-cabeza">
        <label htmlFor={idHtml}>
          {campo.label}
          {campo.obligatorio && <span className="obligatorio">*</span>}
        </label>
        {confianza !== undefined && (
          <button
            type="button"
            className={`boton chico ${dudoso ? '' : 'suave'}`}
            title="Lo llenó Gemini. Tócalo cuando lo hayas revisado."
            onClick={() => void confirmarCampo(claveHc, campo.campo_id)}
          >
            {dudoso ? '⚠ Revisar' : '✓ Gemini'}
          </button>
        )}
        {valor && campo.tipo !== 'calculado' && !CAMPOS_CLAVE.includes(campo.campo_id) && (
          <button type="button" className="icono chico" aria-label={`Borrar ${campo.label}`} onClick={() => cambiar('')}>
            ✕
          </button>
        )}
      </div>
      {control}
      {interpretacion.length > 0 && (
        <div className="chips" aria-label="Interpretación">
          {interpretacion.map((t) => (
            <InsigniaGravedad key={t.etiqueta} gravedad={t.nivel} texto={t.etiqueta} />
          ))}
        </div>
      )}
      {edad !== null && String(edad) !== valor && (
        <button type="button" className="enlace" onClick={() => cambiar(String(edad))}>
          Usar {edad} años (según la fecha de nacimiento)
        </button>
      )}
      {campo.campo_id === 'ea.tiempo_valor' && <CalculadorTiempo clave={claveHc} cat={cat} fechas={fechas} />}
      {sugeridas.map((s) => (
        <div key={s.lista_id} className="fila" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          <button type="button" className="chip sugerido" style={{ flex: 1 }} onClick={() => setSelector(s.lista_id)}>
            ⟨{cat.listas.get(s.lista_id)?.[0].nombre ?? s.lista_id}⟩ {s.razon}
          </button>
          <button
            type="button"
            className="icono chico"
            aria-label="Descartar sugerencia"
            onClick={() => void descartarSugerencia(claveHc, campo.campo_id, s.lista_id)}
          >
            ✕
          </button>
        </div>
      ))}
      {dudas.length > 0 && (
        <ul className="dudas-campo">
          {dudas.map((d) => (
            <li key={d.id}>{d.pregunta}</li>
          ))}
        </ul>
      )}
      {notas.length > 0 && (
        <details className="notas">
          <summary>Tus notas de Semiología ({notas.length})</summary>
          <ul>
            {notas.map((n) => (
              <li key={n.id}>
                {n.titulo} <span className="sub">· {n.origen_archivo}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      <GuiaCampo campo={campo} ambitos={guia} clave={claveHc} valor={valor} cat={cat} />
      {selector && (
        <SelectorEscala cat={cat} listaId={selector} cerrar={() => setSelector(null)} elegir={aplicarEscala} />
      )}
    </div>
  );
}

export const CampoVista = memo(
  CampoVistaBase,
  (a, b) =>
    a.campo === b.campo &&
    a.valor === b.valor &&
    a.confianza === b.confianza &&
    a.cat === b.cat &&
    a.faltante === b.faltante &&
    a.clave === b.clave &&
    JSON.stringify(a.sugerencias) === JSON.stringify(b.sugerencias) &&
    JSON.stringify(a.dudas) === JSON.stringify(b.dudas) &&
    JSON.stringify(a.fechas) === JSON.stringify(b.fechas) &&
    a.guia.join('|') === b.guia.join('|') &&
    a.clinico.grupo === b.clinico.grupo &&
    a.clinico.altitud === b.clinico.altitud &&
    a.clinico.sexo === b.clinico.sexo,
);
