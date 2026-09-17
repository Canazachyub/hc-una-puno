// Una historia: índice de secciones con su avance, resumen y la sección abierta.

import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { valorNormal } from '../../../shared/catalogo';
import { estaLleno } from '../../../shared/valores';
import { BarraProgreso, Girador } from '../components/Basicos';
import { EntradaLibre } from '../components/EntradaLibre';
import { FormRenderer, idsVacios } from '../components/FormRenderer';
import { GuiaSeccion } from '../components/Guia';
import { PanelRedacciones } from '../components/Redacciones';
import { PanelSindromes } from '../components/Sindromes';
import { PanelVigilar } from '../components/Vigilar';
import { edadLegible } from '../../../shared/contexto';
import { CAMPO_EVOLUCIONES, CAMPO_LABORATORIO, leerEvoluciones, leerLaboratorio } from '../../../shared/seguimiento';
import { revisarEscritura } from '../lib/escritura';
import { PanelConflictos, PanelDudas } from '../components/Paneles';
import { avisar } from '../lib/avisos';
import { enLinea, mensaje } from '../lib/api';
import { db, partirClave } from '../lib/db';
import type { HistoriaLocal } from '../lib/db';
import { compartirWord, descargarWord, puedeCompartirArchivos } from '../lib/docx/descargar';
import { borrarLocal, calcularCompletitud, camposVisibles, editar, nombrePaciente } from '../lib/historia';
import { ir, rutas } from '../lib/router';
import { useCatalogo } from '../lib/schema';
import { descargarHistoria } from '../lib/sync';
import type { CatalogoVista } from '../lib/vista';

export function Historia({ clave, seccion, campo = null }: { clave: string; seccion: string | null; campo?: string | null }) {
  const cat = useCatalogo();
  const h = useLiveQuery(() => db.historias.get(clave), [clave]);
  const [trayendo, setTrayendo] = useState(false);

  // Al abrir, trae lo último de la nube sin pisar lo local.
  useEffect(() => {
    if (!enLinea()) return;
    const { dni, episodio } = partirClave(clave);
    void db.historias.get(clave).then((local) => {
      if (local && local.version === 0) return;
      setTrayendo(true);
      descargarHistoria(dni, episodio)
        .catch((e) => {
          if (local) return;
          avisar(mensaje(e), 'error');
        })
        .finally(() => setTrayendo(false));
    });
  }, [clave]);

  if (h === undefined) {
    return (
      <div className="pagina vacio">
        {trayendo ? (
          <span className="fila" style={{ justifyContent: 'center' }}>
            <Girador /> Trayendo la historia…
          </span>
        ) : (
          <>
            <p>No se encontró esta historia en el dispositivo.</p>
            <a className="boton" href={rutas.historias()}>
              Volver
            </a>
          </>
        )}
      </div>
    );
  }

  const comp = calcularCompletitud(h.valores, cat);
  const secciones = cat.secciones;
  const i = seccion ? secciones.findIndex((s) => s.id === seccion) : -1;

  return (
    <div className="pagina">
      <div className="columnas">
        <aside className={`lateral pila ${seccion ? 'solo-escritorio' : ''}`}>
          <div className="solo-escritorio">
            <Cabecera h={h} porcentaje={comp.porcentaje} />
          </div>
          <h2 className="subtitulo-form solo-movil">Secciones</h2>
          <nav className="indice" aria-label="Secciones">
            {secciones.map((s) => {
              const p = comp.porSeccion.get(s.id) ?? { llenos: 0, total: 0, faltan: 0 };
              const dudas = h.dudas.filter((d) => d.estado === 'pendiente' && cat.porId.get(d.campo_id)?.seccion === s.id).length;
              return (
                <a key={s.id} href={rutas.historia(clave, s.id)} className={s.id === seccion ? 'actual' : ''}>
                  <span className="nombre-sec">
                    <span>{s.titulo}</span>
                    <span className="fila" style={{ gap: 4 }}>
                      {dudas > 0 && <span className="insignia ambar">{dudas}?</span>}
                      {p.faltan > 0 && <span className="insignia rojo">{p.faltan}</span>}
                      <span className="insignia">
                        {p.llenos}/{p.total}
                      </span>
                    </span>
                  </span>
                  <BarraProgreso valor={p.total ? (p.llenos / p.total) * 100 : 0} />
                </a>
              );
            })}
          </nav>
        </aside>

        <main className="pila">
          {seccion && i >= 0 ? (
            <Seccion
              h={h}
              cat={cat}
              seccion={seccion}
              campoInicial={campo}
              anterior={secciones[i - 1]?.id}
              siguiente={secciones[i + 1]?.id}
            />
          ) : (
            <>
              <div className="solo-movil">
                <Cabecera h={h} porcentaje={comp.porcentaje} />
              </div>
              <Resumen h={h} cat={cat} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Cabecera({ h, porcentaje }: { h: HistoriaLocal; porcentaje: number }) {
  const v = h.valores;
  const datos = [edadLegible(v), v['fil.sexo'] ?? ''].filter(Boolean).join(' · ');
  return (
    <div className="tarjeta pila" style={{ gap: 8 }}>
      <div>
        <h2 style={{ fontSize: '1.1rem' }}>{nombrePaciente(v)}</h2>
        <div className="sub">
          DNI {h.dni} · Episodio {h.episodio}
          {datos ? ` · ${datos}` : ''}
        </div>
        {v['ea.sintoma_guia'] && <div className="sub">Síntoma guía: {v['ea.sintoma_guia']}</div>}
      </div>
      <BarraProgreso valor={porcentaje} etiqueta="Obligatorios" />
      <div className="fila">
        <span className="insignia">{porcentaje}% obligatorios</span>
        {h.estado === 'completa' && <span className="insignia verde">Completa</span>}
        {(h.sucio.length > 0 || h.estadoSucio) && <span className="insignia ambar">Sin sincronizar</span>}
        {h.version === 0 && <span className="insignia">Solo en este dispositivo</span>}
      </div>
      <a className="boton chico solo-escritorio" href={rutas.historia(h.clave)}>
        Resumen y acciones
      </a>
    </div>
  );
}

function BotonesWord({ h, cat }: { h: HistoriaLocal; cat: CatalogoVista }) {
  const [generando, setGenerando] = useState(false);
  const accion = async (fn: typeof descargarWord) => {
    setGenerando(true);
    try {
      await fn(h, cat);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) avisar(`No se pudo generar el Word: ${mensaje(e)}`, 'error');
    } finally {
      setGenerando(false);
    }
  };
  return (
    <div className="fila">
      <button type="button" className="boton primario" disabled={generando} onClick={() => void accion(descargarWord)}>
        {generando ? <Girador /> : '⬇'} Generar Word
      </button>
      {puedeCompartirArchivos() && (
        <button type="button" className="boton" disabled={generando} onClick={() => void accion(compartirWord)}>
          Compartir
        </button>
      )}
    </div>
  );
}

function Resumen({ h, cat }: { h: HistoriaLocal; cat: CatalogoVista }) {
  const escritura = revisarEscritura(h.valores, cat);
  const eliminar = async () => {
    const aviso =
      h.sucio.length > 0 || h.version === 0
        ? 'Esta historia tiene cambios que no llegaron a la nube y se perderán. ¿Quitarla de este dispositivo?'
        : 'Se quitará solo de este dispositivo; la copia en la nube se conserva. ¿Continuar?';
    if (!confirm(aviso)) return;
    await borrarLocal(h.clave);
    ir(rutas.historias());
  };

  return (
    <>
      <div className="tarjeta pila">
        <div className="fila entre">
          <h1 className="titulo-pagina">Historia clínica</h1>
          <div className="fila">
            <a className="boton" href={rutas.previa(h.clave)}>
              👁 Vista previa
            </a>
            <a className="boton" href={rutas.revisar(h.clave)}>
              Revisar
            </a>
          </div>
        </div>
        <BotonesWord h={h} cat={cat} />
        {escritura.length > 0 && (
          <a className="aviso-texto" href={rutas.revisar(h.clave)} style={{ textDecoration: 'none', color: 'inherit' }}>
            Hay {escritura.length} {escritura.length === 1 ? 'campo' : 'campos'} con abreviaturas o diminutivos. La historia se escribe completa: tócalo para
            corregirlos.
          </a>
        )}
        <p className="sub pequeno" style={{ margin: 0 }}>
          El Word se arma en el teléfono y funciona sin señal. En la vista previa eliges si los campos vacíos salen con línea para llenar a mano o se omiten.
        </p>
      </div>
      <div className="tarjeta pila" style={{ gap: 8 }}>
        <h2 style={{ fontSize: '1rem' }}>Seguimiento</h2>
        <div className="fila">
          <a className="boton" href={rutas.seguimiento(h.clave)}>
            📈 Seguimiento diario ({leerEvoluciones(h.valores[CAMPO_EVOLUCIONES]).length})
          </a>
          <a className="boton" href={rutas.laboratorio(h.clave)}>
            🧪 Laboratorio ({leerLaboratorio(h.valores[CAMPO_LABORATORIO]).length})
          </a>
        </div>
      </div>
      <PanelVigilar h={h} cat={cat} />
      <PanelSindromes h={h} cat={cat} />
      <PanelRedacciones h={h} cat={cat} />
      <EntradaLibre h={h} cat={cat} seccion="*" titulo="Contar toda la historia" />
      <PanelConflictos h={h} cat={cat} />
      <PanelDudas h={h} cat={cat} />
      <button type="button" className="boton peligro chico" style={{ justifySelf: 'start' }} onClick={() => void eliminar()}>
        Quitar de este dispositivo
      </button>
    </>
  );
}

/** Lleva la pantalla a un campo y lo resalta un momento. */
export function irAlCampo(campoId: string): void {
  setTimeout(() => {
    const el = document.getElementById(`campo-${campoId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('resaltado');
    setTimeout(() => el.classList.remove('resaltado'), 1800);
  }, 150);
}

function Seccion({
  h,
  cat,
  seccion,
  campoInicial,
  anterior,
  siguiente,
}: {
  h: HistoriaLocal;
  cat: CatalogoVista;
  seccion: string;
  campoInicial: string | null;
  anterior?: string;
  siguiente?: string;
}) {
  const info = cat.secciones.find((s) => s.id === seccion);
  const campos = camposVisibles(cat, seccion, h.valores);
  const normalizables = campos.filter(
    (c) => c.tipo !== 'calculado' && valorNormal(c, cat.listas) && !estaLleno(h.valores[c.campo_id]),
  );
  const [soloIds, setSoloIds] = useState<Set<string> | null>(null);
  const vacios = idsVacios(h, cat, seccion);

  useEffect(() => {
    setSoloIds(null);
  }, [seccion]);

  useEffect(() => {
    if (campoInicial) irAlCampo(campoInicial);
  }, [seccion, campoInicial]);

  /** El siguiente campo vacío por debajo de lo que se ve; si no hay, el primero. */
  const siguienteVacio = () => {
    const orden = campos.filter((c) => vacios.has(c.campo_id)).map((c) => c.campo_id);
    const limite = window.scrollY + 140;
    const proximo =
      orden.find((id) => {
        const el = document.getElementById(`campo-${id}`);
        return el && el.getBoundingClientRect().top + window.scrollY > limite;
      }) ?? orden[0];
    if (proximo) irAlCampo(proximo);
  };

  const todoNormal = () => {
    const cambios: Record<string, string> = {};
    for (const c of normalizables) cambios[c.campo_id] = valorNormal(c, cat.listas);
    void editar(h.clave, cambios, cat).then(() =>
      avisar(`${normalizables.length} campos con valor normal. Corrige solo lo alterado.`, 'exito'),
    );
  };

  const infoAnterior = cat.secciones.find((s) => s.id === anterior);
  const infoSiguiente = cat.secciones.find((s) => s.id === siguiente);

  return (
    <>
      <div className="fila entre">
        <div className="fila">
          <a className="icono solo-movil" href={rutas.historia(h.clave)} aria-label="Volver al índice">
            ←
          </a>
          <div>
            <h1 className="titulo-pagina">{info?.titulo ?? seccion}</h1>
            <div className="sub solo-movil">{nombrePaciente(h.valores)}</div>
          </div>
        </div>
      </div>

      <GuiaSeccion seccion={seccion} h={h} cat={cat} />
      {seccion === 'diagnostico' && <PanelSindromes h={h} cat={cat} abierto />}
      {(seccion === 'examenes' || seccion === 'plan_trabajo') && (
        <a className="boton" href={rutas.laboratorio(h.clave)} style={{ justifySelf: 'start' }}>
          🧪 Resultados de laboratorio ({leerLaboratorio(h.valores[CAMPO_LABORATORIO]).length}) · foto del informe
        </a>
      )}
      {seccion === 'evolucion' && (
        <a className="boton" href={rutas.seguimiento(h.clave)} style={{ justifySelf: 'start' }}>
          📈 Seguimiento diario ({leerEvoluciones(h.valores[CAMPO_EVOLUCIONES]).length}) · signos y nota de cada día
        </a>
      )}
      <EntradaLibre key={seccion} h={h} cat={cat} seccion={seccion} />
      <PanelConflictos h={h} cat={cat} seccion={seccion} />
      <PanelDudas h={h} cat={cat} seccion={seccion} />

      <div className="fila barra-seccion">
        {normalizables.length > 1 && (
          <button type="button" className="boton suave chico" onClick={todoNormal}>
            Normal en los {normalizables.length} campos vacíos
          </button>
        )}
        <button
          type="button"
          className={`boton chico ${soloIds ? 'primario' : ''}`}
          aria-pressed={!!soloIds}
          onClick={() => setSoloIds(soloIds ? null : idsVacios(h, cat, seccion))}
        >
          {soloIds ? 'Ver todos' : `Solo vacíos (${vacios.size})`}
        </button>
        {vacios.size > 0 && (
          <button type="button" className="boton chico" onClick={siguienteVacio}>
            Siguiente vacío ↓
          </button>
        )}
      </div>

      <FormRenderer h={h} cat={cat} seccion={seccion} soloIds={soloIds} />

      <nav className="nav-inferior">
        {infoAnterior ? (
          <a className="boton" href={rutas.historia(h.clave, infoAnterior.id)}>
            ← {infoAnterior.corto}
          </a>
        ) : (
          <a className="boton" href={rutas.historia(h.clave)}>
            ← Índice
          </a>
        )}
        {infoSiguiente ? (
          <a className="boton primario" href={rutas.historia(h.clave, infoSiguiente.id)}>
            {infoSiguiente.corto} →
          </a>
        ) : (
          <a className="boton primario" href={rutas.revisar(h.clave)}>
            Revisar →
          </a>
        )}
      </nav>
    </>
  );
}
