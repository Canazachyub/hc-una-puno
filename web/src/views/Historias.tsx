// Lista de historias: las del dispositivo y las que solo están en la nube.

import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { clave as normal } from '../../../shared/valores';
import { BarraProgreso, Girador, Modal } from '../components/Basicos';
import { avisar } from '../lib/avisos';
import { enLinea, mensaje } from '../lib/api';
import { db } from '../lib/db';
import type { HistoriaLocal, ResumenRemoto } from '../lib/db';
import { crearHistoria, nombrePaciente } from '../lib/historia';
import { ir, rutas } from '../lib/router';
import { useCatalogo } from '../lib/schema';
import { descargarHistoria, refrescarRemotas } from '../lib/sync';
import { fechaLegible } from '../lib/texto';

interface Item {
  clave: string;
  dni: string;
  episodio: number;
  nombre: string;
  sintoma: string;
  completitud: number;
  estado: string;
  actualizado: string;
  local: HistoriaLocal | null;
  remota: ResumenRemoto | null;
}

function fechaCorta(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${fechaLegible(iso.slice(0, 10))} ${d.toTimeString().slice(0, 5)}`;
}

export function Historias() {
  const cat = useCatalogo();
  const locales = useLiveQuery(() => db.historias.toArray(), []);
  const remotas = useLiveQuery(() => db.remotas.toArray(), []);
  const [busqueda, setBusqueda] = useState('');
  const [nueva, setNueva] = useState(false);
  const [abriendo, setAbriendo] = useState('');
  const [refrescando, setRefrescando] = useState(false);

  const items = useMemo<Item[]>(() => {
    const mapa = new Map<string, Item>();
    for (const r of remotas ?? []) {
      mapa.set(r.clave, {
        clave: r.clave,
        dni: r.dni,
        episodio: r.episodio,
        nombre: [r.apellidos, r.nombres].filter(Boolean).join(', ') || 'Paciente sin nombre',
        sintoma: r.sintoma_guia,
        completitud: r.completitud,
        estado: r.estado,
        actualizado: r.actualizado_en,
        local: null,
        remota: r,
      });
    }
    for (const h of locales ?? []) {
      mapa.set(h.clave, {
        clave: h.clave,
        dni: h.dni,
        episodio: h.episodio,
        nombre: nombrePaciente(h.valores),
        sintoma: h.valores['ea.sintoma_guia'] ?? '',
        completitud: h.completitud,
        estado: h.estado,
        actualizado: h.actualizado_en,
        local: h,
        remota: mapa.get(h.clave)?.remota ?? null,
      });
    }
    const q = normal(busqueda);
    return [...mapa.values()]
      .filter((i) => !q || normal(`${i.nombre} ${i.dni} ${i.sintoma}`).includes(q))
      .sort((a, b) => b.actualizado.localeCompare(a.actualizado));
  }, [locales, remotas, busqueda]);

  const abrir = async (i: Item) => {
    if (i.local) {
      ir(rutas.historia(i.clave));
      return;
    }
    if (!enLinea()) {
      avisar('Esta historia está en la nube y no hay señal para traerla', 'error');
      return;
    }
    setAbriendo(i.clave);
    try {
      await descargarHistoria(i.dni, i.episodio);
      ir(rutas.historia(i.clave));
    } catch (e) {
      avisar(mensaje(e), 'error');
    } finally {
      setAbriendo('');
    }
  };

  const refrescar = async () => {
    setRefrescando(true);
    try {
      await refrescarRemotas();
    } catch (e) {
      avisar(mensaje(e), 'error');
    } finally {
      setRefrescando(false);
    }
  };

  return (
    <div className="pagina pila">
      <div className="fila entre">
        <h1 className="titulo-pagina">Historias clínicas</h1>
        <div className="fila">
          {enLinea() && (
            <button type="button" className="icono" aria-label="Traer lista de la nube" disabled={refrescando} onClick={() => void refrescar()}>
              {refrescando ? <Girador /> : '⟳'}
            </button>
          )}
          <button type="button" className="boton primario" onClick={() => setNueva(true)}>
            + Nueva
          </button>
        </div>
      </div>
      <input
        type="search"
        placeholder="Buscar por apellido, DNI o síntoma"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {locales && items.length === 0 && (
        <div className="vacio tarjeta plana">
          {busqueda ? 'Sin resultados.' : 'Aún no hay historias. Toca «Nueva» y escribe el DNI del paciente.'}
        </div>
      )}

      <div className="historias">
        {items.map((i) => (
          <button key={i.clave} type="button" className="tarjeta historia-item" onClick={() => void abrir(i)}>
            <div className="fila entre">
              <h3>{i.nombre}</h3>
              {abriendo === i.clave && <Girador />}
            </div>
            <div className="sub">
              DNI {i.dni} · Episodio {i.episodio}
              {i.sintoma ? ` · ${i.sintoma}` : ''}
            </div>
            <BarraProgreso valor={i.completitud} etiqueta="Completitud" />
            <div className="fila">
              <span className="insignia">{i.completitud}% obligatorios</span>
              {i.estado === 'completa' && <span className="insignia verde">Completa</span>}
              {!i.local && <span className="insignia azul">En la nube</span>}
              {i.local && (i.local.sucio.length > 0 || i.local.estadoSucio) && <span className="insignia ambar">Sin sincronizar</span>}
              {i.local && i.local.conflictos.length > 0 && <span className="insignia rojo">Conflictos</span>}
              <span className="sub pequeno">{fechaCorta(i.actualizado)}</span>
            </div>
          </button>
        ))}
      </div>

      {nueva && (
        <NuevaHistoria
          cerrar={() => setNueva(false)}
          existentes={items}
          crear={async (dni) => {
            const clave = await crearHistoria(dni, cat);
            setNueva(false);
            ir(rutas.historia(clave, 'filiacion'));
          }}
          abrir={(i) => {
            setNueva(false);
            void abrir(i);
          }}
        />
      )}
    </div>
  );
}

function NuevaHistoria({
  cerrar,
  existentes,
  crear,
  abrir,
}: {
  cerrar: () => void;
  existentes: Item[];
  crear: (dni: string) => Promise<void>;
  abrir: (i: Item) => void;
}) {
  const [dni, setDni] = useState('');
  const [creando, setCreando] = useState(false);
  const limpio = dni.trim().toUpperCase();
  const valido = /^[A-Z0-9-]{6,15}$/.test(limpio);
  const delPaciente = existentes.filter((i) => i.dni === limpio).sort((a, b) => a.episodio - b.episodio);

  return (
    <Modal titulo="Nueva historia" cerrar={cerrar}>
      <form
        className="pila"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valido || creando) return;
          setCreando(true);
          void crear(limpio).finally(() => setCreando(false));
        }}
      >
        <label className="campo-ajuste">
          DNI del paciente
          <input
            autoFocus
            inputMode="numeric"
            autoComplete="off"
            maxLength={15}
            placeholder="8 dígitos (o carné de extranjería)"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
        </label>
        {limpio && !/^\d{8}$/.test(limpio) && valido && <span className="aviso-texto pequeno">No tiene 8 dígitos. Verifica si es un DNI.</span>}
        {delPaciente.length > 0 && (
          <div className="pila" style={{ gap: 6 }}>
            <span className="sub">Este paciente ya tiene historias:</span>
            {delPaciente.map((i) => (
              <button key={i.clave} type="button" className="boton" onClick={() => abrir(i)}>
                Abrir episodio {i.episodio} · {i.nombre}
              </button>
            ))}
          </div>
        )}
        <button type="submit" className="boton primario bloque" disabled={!valido || creando}>
          {creando ? <Girador /> : null}
          {delPaciente.length > 0 ? 'Crear un episodio nuevo' : 'Crear historia'}
        </button>
      </form>
    </Modal>
  );
}
