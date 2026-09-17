// Consulta: todo lo que la app tomó de las notas, en un solo lugar y con buscador.
// Escalas con semáforo, valores normales, interpretación de signos vitales, definiciones,
// hallazgos por región, síndromes, exámenes, guía, siglas y la revisión con las notas.
// Funciona sin señal: todo va empaquetado.

import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import revisionJson from '../../../docs/mapeo/datos/revision.json?raw';
import { ABREVIATURAS } from '../../../shared/abreviaturas';
import { NOMBRE_GRUPO } from '../../../shared/contexto';
import { valorNormal } from '../../../shared/catalogo';
import { gravedadDeOpcion } from '../../../shared/gravedad';
import type { Gravedad } from '../../../shared/gravedad';
import { TITULO_AMBITO, TITULO_TIPO, VARIABLES_UMBRAL, ambitoDeSintoma } from '../../../shared/guias';
import { textoOpcion } from '../../../shared/formato';
import { clave } from '../../../shared/valores';
import { fuenteCorta } from '../components/Guia';
import { LeyendaSemaforo, claseGravedad } from '../components/Semaforo';
import type { EstadoDecision } from '../../../shared/types';
import { avisar } from '../lib/avisos';
import { mensaje } from '../lib/api';
import { db } from '../lib/db';
import type { DecisionLocal } from '../lib/db';
import { definicionDe } from '../lib/definiciones';
import { entregarWord, puedeCompartirArchivos, wordSimple } from '../lib/docx/descargar';
import { programarSync } from '../lib/sync-cola';
import { GUIAS, UMBRALES } from '../lib/guias';
import { rutas } from '../lib/router';
import { useCatalogo } from '../lib/schema';
import type { CatalogoVista } from '../lib/vista';

type IdGrupo =
  | 'escalas'
  | 'normales'
  | 'umbrales'
  | 'sintomas'
  | 'opciones'
  | 'hallazgos'
  | 'sindromes'
  | 'examenes'
  | 'guia'
  | 'revision'
  | 'siglas';

const GRUPOS: { id: IdGrupo; titulo: string; descripcion: string }[] = [
  { id: 'escalas', titulo: 'Escalas', descripcion: 'Cada nivel con su color y la frase que escribe la app' },
  { id: 'normales', titulo: 'Valores normales', descripcion: 'Signos vitales, regiones, exámenes y lo que escribe el botón Normal' },
  { id: 'umbrales', titulo: 'Interpretación de signos vitales', descripcion: 'Rangos con que la app pinta cada cifra' },
  { id: 'sintomas', titulo: 'Síntomas', descripcion: 'Definición y guía que se abre al elegirlos' },
  { id: 'hallazgos', titulo: 'Hallazgos por región', descripcion: 'Qué significa cada hallazgo del examen físico' },
  { id: 'opciones', titulo: 'Definiciones', descripcion: 'Localizaciones, agravantes, heces, orina, antecedentes…' },
  { id: 'sindromes', titulo: 'Síndromes', descripcion: 'Cuadro clínico de cada síndrome' },
  { id: 'examenes', titulo: 'Exámenes auxiliares', descripcion: 'Cuándo pedirlos, valores normales y cómo leerlos' },
  { id: 'guia', titulo: 'Guía de llenado', descripcion: 'Cómo preguntar, qué usar, técnica y qué buscar' },
  { id: 'revision', titulo: 'Revisión con tus notas', descripcion: 'Diferencias entre la app y las notas, y qué ya se corrigió' },
  { id: 'siglas', titulo: 'Siglas', descripcion: 'Cómo se escribe completa cada sigla' },
];

interface Item {
  grupo: IdGrupo;
  tema: string;
  titulo: string;
  texto: string;
  detalle?: string;
  fuente?: string;
  gravedad?: Gravedad | null;
  estado?: string;
  /** Punto de la revisión («03-7»), para decidir. */
  punto?: string;
}

interface PuntoRevision {
  area: string;
  area_titulo: string;
  n: number;
  tema: string;
  texto: string;
  estado: string;
}

const REVISION: PuntoRevision[] = JSON.parse(revisionJson);

// Palabras que no ayudan a buscar.
const VACIAS = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'en', 'con', 'por', 'a', 'al', 'un', 'una']);

/** Palabras de la búsqueda, sin tildes, signos ni palabras vacías (se conservan + y / de las escalas). */
export function palabrasDeBusqueda(q: string): string[] {
  return clave(q)
    .split(/[^\p{L}\p{N}+\/]+/u)
    .filter((p) => p && !VACIAS.has(p));
}

const sinMarcadores = (t: string) => t.replace(/\{[a-z_]+\}/g, '…').trim();
const sinUnidad = (t: string) => t.replace(/\s*\(.*\)\s*$/, '');

function rango(min: number | null, max: number | null): string {
  const n = (x: number) => String(x).replace('.', ',');
  if (min !== null && max !== null) return min === max ? n(min) : `${n(min)} a ${n(max)}`;
  if (min !== null) return `${n(min)} o más`;
  return `hasta ${n(max ?? 0)}`;
}

function armarIndice(cat: CatalogoVista): Item[] {
  const items: Item[] = [];
  const etiqueta = (id: string) => cat.porId.get(id)?.label ?? id;
  const tituloAmbito = (a: string) => TITULO_AMBITO[a] ?? (cat.porId.has(a) ? sinUnidad(etiqueta(a)) : cat.secciones.find((s) => s.id === a)?.titulo ?? a);

  for (const [id, lista] of cat.listas) {
    const tipo = lista[0]?.tipo;
    const nombre = lista[0]?.nombre ?? id;
    if (tipo === 'escala') {
      for (const o of lista) {
        const frase = o.formato_salida ? sinMarcadores(textoOpcion(o).replace(/\[[^\]]+\]/g, '…')) : '';
        items.push({ grupo: 'escalas', tema: nombre, titulo: o.valor, texto: o.etiqueta, detalle: frase && frase !== o.valor ? `Se escribe: ${frase}` : '', gravedad: gravedadDeOpcion(o) });
      }
    } else if (tipo === 'frase') {
      const region = nombre.replace(/^Frases · /, '');
      for (const o of lista) {
        if (o.valor === 'n') {
          items.push({ grupo: 'hallazgos', tema: region, titulo: 'Normal', texto: o.etiqueta.trim(), gravedad: 0 });
          continue;
        }
        const d = definicionDe(o);
        items.push({ grupo: 'hallazgos', tema: region, titulo: sinMarcadores(o.etiqueta), texto: d?.texto ?? '', fuente: d?.fuente });
      }
    } else if (id === 'sintoma') {
      for (const o of lista) {
        const ambito = ambitoDeSintoma(o.valor);
        items.push({
          grupo: 'sintomas',
          tema: ambito ? `Guía: ${TITULO_AMBITO[ambito] ?? ambito}` : 'Sin guía propia',
          titulo: o.valor,
          texto: o.etiqueta,
        });
      }
    } else {
      for (const o of lista) {
        const d = definicionDe(o);
        if (!d) continue;
        items.push({ grupo: 'opciones', tema: nombre, titulo: o.valor, texto: d.texto, fuente: d.fuente, gravedad: gravedadDeOpcion(o) });
      }
    }
  }

  // Lo que escribe el botón Normal en cada campo.
  for (const c of cat.esquema) {
    const normal = valorNormal(c, cat.listas);
    if (normal) items.push({ grupo: 'normales', tema: `Botón Normal · ${cat.secciones.find((s) => s.id === c.seccion)?.titulo ?? c.seccion}`, titulo: sinUnidad(c.label), texto: normal, gravedad: 0 });
  }

  for (const g of GUIAS) {
    if (g.tipo === 'umbral') continue;
    if (g.tipo === 'sindrome') {
      const [nombre, ...resto] = g.texto.split(':');
      items.push({ grupo: 'sindromes', tema: 'Síndromes', titulo: nombre.trim(), texto: resto.join(':').trim(), fuente: g.archivo });
      continue;
    }
    const tema = tituloAmbito(g.ambito);
    if (g.tipo === 'normal') items.push({ grupo: 'normales', tema, titulo: '', texto: g.texto, fuente: g.archivo, gravedad: 0 });
    if (g.ambito.startsWith('ex.')) items.push({ grupo: 'examenes', tema, titulo: TITULO_TIPO[g.tipo], texto: g.texto, fuente: g.archivo });
    else if (g.tipo !== 'normal') items.push({ grupo: 'guia', tema, titulo: TITULO_TIPO[g.tipo], texto: g.texto, fuente: g.archivo });
  }

  const campoDe = Object.fromEntries(Object.entries(VARIABLES_UMBRAL).map(([c, v]) => [v, c]));
  for (const u of UMBRALES) {
    items.push({
      grupo: 'umbrales',
      tema: [
        sinUnidad(etiqueta(campoDe[u.variable] ?? u.variable)),
        NOMBRE_GRUPO[u.grupo],
        u.altitud === 'alta' ? 'en altura (2 500 m o más)' : u.altitud === 'baja' ? 'a menos de 2 500 m' : '',
      ]
        .filter(Boolean)
        .join(' · '),
      titulo: rango(u.min, u.max),
      texto: u.etiqueta,
      gravedad: u.nivel,
      fuente: u.fuente,
    });
  }

  for (const r of REVISION) {
    items.push({ grupo: 'revision', tema: r.area_titulo, titulo: `${r.n}.${r.tema ? ` ${r.tema}` : ''}`, texto: r.texto, estado: r.estado, punto: `${r.area}-${r.n}` });
  }

  for (const a of ABREVIATURAS) {
    items.push({ grupo: 'siglas', tema: 'Siglas', titulo: a.sigla, texto: a.completo.replace('$1', 'N') });
  }
  return items;
}

const CLASE_ESTADO: Record<string, string> = { Corregido: 'sem sem-0', 'Corregido en parte': 'sem sem-1', Pendiente: 'sem sem-2' };

export const DECISIONES: { id: EstadoDecision; texto: string; clase: string }[] = [
  { id: 'seguir_nota', texto: 'Seguir la nota', clase: 'sem sem-2' },
  { id: 'mantener_app', texto: 'Mantener la app', clase: 'sem sem-0' },
  { id: 'consultar_docente', texto: 'Consultar al docente', clase: 'sem sem-1' },
];
const TEXTO_DECISION = Object.fromEntries(DECISIONES.map((d) => [d.id, d.texto])) as Record<EstadoDecision, string>;

async function decidir(punto: string, decision: EstadoDecision | null, comentario: string): Promise<void> {
  if (!decision) {
    await db.decisiones.delete(punto);
  } else {
    await db.decisiones.put({ punto, decision, comentario, fecha: new Date().toISOString(), sucio: true });
    programarSync(500);
  }
}

function Decidir({ punto, actual }: { punto: string; actual: DecisionLocal | undefined }) {
  const [comentario, setComentario] = useState(actual?.comentario ?? '');
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="pila" style={{ gap: 4, marginTop: 4 }}>
      <div className="chips" role="radiogroup" aria-label="Decisión">
        {DECISIONES.map((d) => (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={actual?.decision === d.id}
            className={`chip ${d.clase} ${actual?.decision === d.id ? 'activo' : ''}`}
            onClick={() => void decidir(punto, actual?.decision === d.id ? null : d.id, comentario)}
          >
            {d.texto}
          </button>
        ))}
        <button type="button" className="chip frase" onClick={() => setAbierto(!abierto)}>
          {actual?.comentario ? '✎ Comentario' : '+ Comentario'}
        </button>
      </div>
      {abierto && (
        <textarea
          rows={2}
          placeholder="Qué dijo el docente, qué nota manda, qué cambiar…"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          onBlur={() => actual && void decidir(punto, actual.decision, comentario)}
        />
      )}
      {!abierto && actual?.comentario && <span className="sub pequeno">{actual.comentario}</span>}
    </div>
  );
}

function Fila({ it, decision }: { it: Item; decision?: DecisionLocal }) {
  return (
    <li className={claseGravedad(it.gravedad)}>
      {it.gravedad !== undefined && it.gravedad !== null && (
        <>
          <span className="sem-punto" aria-hidden="true" />{' '}
        </>
      )}
      {it.estado && <span className={`insignia ${CLASE_ESTADO[it.estado] ?? ''}`}>{it.estado}</span>} {it.titulo && <strong>{it.titulo}</strong>}
      {it.titulo && it.texto && ' '}
      <span className="texto">{it.texto}</span>
      {it.fuente && (
        <span className="fuente" title={it.fuente}>
          {' '}
          · {fuenteCorta(it.fuente)}
        </span>
      )}
      {it.detalle && <div className="sub pequeno">{it.detalle}</div>}
      {it.punto && it.estado !== 'Corregido' && <Decidir punto={it.punto} actual={decision} />}
    </li>
  );
}

type FiltroRevision = '' | 'sin_decidir' | EstadoDecision | 'corregidos';

async function wordDocente(items: Item[], decisiones: Map<string, DecisionLocal>, compartir: boolean): Promise<void> {
  const filas = items
    .filter((it) => it.estado !== 'Corregido')
    .map((it) => {
      const d = it.punto ? decisiones.get(it.punto) : undefined;
      return [it.tema.split(':')[0].replace(/^Examen regional/, 'Examen'), it.titulo, it.texto, it.estado ?? '', d ? TEXTO_DECISION[d.decision] : 'Sin decidir', d?.comentario ?? ''];
    });
  const fecha = new Date().toLocaleDateString('es-PE');
  const archivo = await wordSimple(
    `Revision_con_el_docente_${new Date().toISOString().slice(0, 10)}.docx`,
    'REVISIÓN DE LA APP CON LAS NOTAS DE SEMIOLOGÍA',
    [
      {
        parrafos: [
          'Diferencias encontradas entre lo que usa la app (opciones, escalas, rangos y frases) y las notas de clase. Para cada punto: seguir la nota, mantener la app o consultar al docente.',
        ],
      },
      { tabla: { encabezados: ['Área', 'Punto', 'Diferencia', 'Estado', 'Decisión', 'Comentario'], filas, anchos: [1300, 1200, 3600, 900, 1100, 1446] } },
    ],
    `${fecha} · ${filas.length} puntos`,
  );
  await entregarWord(archivo, compartir);
}

const MAXIMO = 250;

export default function Consulta({ q: qInicial, grupo: grupoInicial }: { q: string; grupo: string }) {
  const cat = useCatalogo();
  // Texto de búsqueda de cada entrada, sin tildes ni mayúsculas, calculado una vez.
  const indice = useMemo(() => armarIndice(cat).map((it) => ({ it, t: clave(`${it.tema} ${it.titulo} ${it.texto} ${it.detalle ?? ''}`) })), [cat]);
  const [q, setQ] = useState(qInicial);
  const [grupo, setGrupo] = useState<IdGrupo | ''>((GRUPOS.find((g) => g.id === grupoInicial)?.id ?? '') as IdGrupo | '');

  const palabras = palabrasDeBusqueda(q);
  const claveQ = palabras.join(' ');
  const aciertos = useMemo(() => {
    const ps = claveQ.split(' ').filter(Boolean);
    return ps.length === 0 ? indice : indice.filter((x) => ps.every((p) => x.t.includes(p)));
  }, [indice, claveQ]);
  const coinciden = grupo ? aciertos.filter((x) => x.it.grupo === grupo).map((x) => x.it) : aciertos.map((x) => x.it);
  const porGrupo = new Map<IdGrupo, number>();
  for (const x of aciertos) porGrupo.set(x.it.grupo, (porGrupo.get(x.it.grupo) ?? 0) + 1);
  const cuenta = (id: IdGrupo) => porGrupo.get(id) ?? 0;

  const buscando = palabras.length > 0;
  const mostrados = coinciden.slice(0, MAXIMO);
  const decisionesLista = useLiveQuery(() => db.decisiones.toArray(), []);
  const decisiones = new Map((decisionesLista ?? []).map((d) => [d.punto, d]));
  const [filtroRev, setFiltroRev] = useState<FiltroRevision>('');
  const revision = indice.filter((x) => x.it.grupo === 'revision').map((x) => x.it);
  const pasaFiltro = (it: Item) => {
    if (it.grupo !== 'revision' || !filtroRev) return true;
    const d = it.punto ? decisiones.get(it.punto) : undefined;
    if (filtroRev === 'corregidos') return it.estado === 'Corregido';
    if (filtroRev === 'sin_decidir') return it.estado !== 'Corregido' && !d;
    return d?.decision === filtroRev;
  };
  const contarRev = (f: FiltroRevision) => revision.filter((it) => {
    const d = it.punto ? decisiones.get(it.punto) : undefined;
    if (f === 'corregidos') return it.estado === 'Corregido';
    if (f === 'sin_decidir') return it.estado !== 'Corregido' && !d;
    return d?.decision === f;
  }).length;
  // grupo → tema → filas, en el orden del índice
  const arbol = new Map<IdGrupo, Map<string, Item[]>>();
  for (const it of mostrados) {
    if (!pasaFiltro(it)) continue;
    const temas = arbol.get(it.grupo) ?? new Map<string, Item[]>();
    temas.set(it.tema, [...(temas.get(it.tema) ?? []), it]);
    arbol.set(it.grupo, temas);
  }
  const conColores = mostrados.some((it) => it.gravedad !== undefined && it.gravedad !== null);

  return (
    <div className="pagina pila" style={{ maxWidth: 900 }}>
      <div className="fila">
        <a className="icono" href={rutas.historias()} aria-label="Volver">
          ←
        </a>
        <div>
          <h1 className="titulo-pagina">📚 Consulta</h1>
          <div className="sub">Todo lo que la app tomó de tus notas. Funciona sin señal y no se imprime.</div>
        </div>
      </div>

      <div className="consulta-buscar">
        <input
          type="search"
          autoFocus={!qInicial}
          placeholder="Buscar: hemoptisis, taquicardia, Glasgow, Murphy, hemograma…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Buscar en la consulta"
        />
        <div className="chips" role="tablist">
          <button type="button" role="tab" aria-selected={!grupo} className={`chip ${!grupo ? 'activo' : ''}`} onClick={() => setGrupo('')}>
            Todo
          </button>
          {GRUPOS.map((g) => {
            const n = cuenta(g.id);
            if (buscando && n === 0) return null;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={grupo === g.id}
                className={`chip ${grupo === g.id ? 'activo' : ''}`}
                onClick={() => setGrupo(grupo === g.id ? '' : g.id)}
              >
                {g.titulo} <span className="sub">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {conColores && <LeyendaSemaforo />}

      {grupo === 'revision' && (
        <section className="tarjeta pila" style={{ gap: 8 }}>
          <span className="sub">
            Decide cada diferencia: <strong>seguir la nota</strong> (se cambia la app), <strong>mantener la app</strong> o <strong>consultar al docente</strong>. Las decisiones se guardan en el servidor y me sirven para aplicar los cambios.
          </span>
          <div className="chips">
            {(
              [
                ['', 'Todas', revision.length],
                ['sin_decidir', 'Sin decidir', contarRev('sin_decidir')],
                ['seguir_nota', 'Seguir la nota', contarRev('seguir_nota')],
                ['mantener_app', 'Mantener la app', contarRev('mantener_app')],
                ['consultar_docente', 'Para el docente', contarRev('consultar_docente')],
                ['corregidos', 'Ya corregidas', contarRev('corregidos')],
              ] as [FiltroRevision, string, number][]
            ).map(([id, texto, n]) => (
              <button key={id || 'todas'} type="button" className={`chip ${filtroRev === id ? 'activo' : ''}`} onClick={() => setFiltroRev(id)}>
                {texto} <span className="sub">{n}</span>
              </button>
            ))}
          </div>
          <div className="fila">
            <button
              type="button"
              className="boton"
              onClick={() => void wordDocente(revision.filter(pasaFiltro), decisiones, false).catch((e) => avisar(mensaje(e), 'error'))}
            >
              📄 Word para el docente
            </button>
            {puedeCompartirArchivos() && (
              <button
                type="button"
                className="boton"
                onClick={() => void wordDocente(revision.filter(pasaFiltro), decisiones, true).catch((e) => avisar(mensaje(e), 'error'))}
              >
                Compartir
              </button>
            )}
          </div>
        </section>
      )}

      {!buscando && !grupo && (
        <div className="pila" style={{ gap: 8 }}>
          {GRUPOS.map((g) => (
            <button key={g.id} type="button" className="tarjeta" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setGrupo(g.id)}>
              <strong>{g.titulo}</strong> <span className="sub">· {cuenta(g.id)}</span>
              <div className="sub">{g.descripcion}</div>
            </button>
          ))}
        </div>
      )}

      {(buscando || grupo) && coinciden.length === 0 && <div className="vacio">Nada coincide con «{q}».</div>}

      {(buscando || grupo) &&
        [...arbol.entries()].map(([idGrupo, temas]) => (
          <section key={idGrupo} className="pila" style={{ gap: 6 }}>
            {!grupo && <h2 style={{ fontSize: '1rem' }}>{GRUPOS.find((g) => g.id === idGrupo)?.titulo}</h2>}
            {[...temas.entries()].map(([tema, filas]) => (
              <details key={tema} className="tarjeta consulta-grupo" open={buscando || temas.size === 1}>
                <summary>
                  {tema} <span className="sub">· {filas.length}</span>
                </summary>
                <ul className="consulta-filas">
                  {filas.map((it, i) => (
                    <Fila key={it.punto ?? i} it={it} decision={it.punto ? decisiones.get(it.punto) : undefined} />
                  ))}
                </ul>
              </details>
            ))}
          </section>
        ))}

      {coinciden.length > MAXIMO && (
        <div className="sub">
          Se muestran {MAXIMO} de {coinciden.length}. Escribe algo más para acotar.
        </div>
      )}
    </div>
  );
}
