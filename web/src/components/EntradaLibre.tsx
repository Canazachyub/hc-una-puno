// Cuadro CONTAR: hablar, subir un audio o escribir, y que Gemini reparta entre los campos.

import { valoresClinicos } from '../../../shared/seguimiento';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import type { OrigenEntrada } from '../../../shared/types';
import { avisar } from '../lib/avisos';
import { ErrorApi, enLinea, llamar, mensaje, uuid } from '../lib/api';
import { db } from '../lib/db';
import type { HistoriaLocal } from '../lib/db';
import { aplicarOrganizar, deshacerOrganizar } from '../lib/historia';
import { Grabadora, MAX_SEGUNDOS, mimeDeArchivo, puedeGrabar } from '../lib/recorder';
import { blobABase64, programarSync, validarOrganizar } from '../lib/sync';
import type { CatalogoVista } from '../lib/vista';
import { Girador, useAutoAltura } from './Basicos';

const MAX_BYTES = 14 * 1024 * 1024;

function claveBorrador(clave: string, seccion: string): string {
  return `hc.contar.${clave}.${seccion}`;
}

function leerBorrador(k: string): string {
  try {
    return localStorage.getItem(k) ?? '';
  } catch {
    return '';
  }
}

function guardarBorrador(k: string, v: string): void {
  try {
    if (v) localStorage.setItem(k, v);
    else localStorage.removeItem(k);
  } catch {
    // sin almacenamiento: el borrador vive solo en pantalla
  }
}

function mmss(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function EntradaLibre({
  h,
  cat,
  seccion,
  titulo = 'Contar',
  abiertoInicial = true,
}: {
  h: HistoriaLocal;
  cat: CatalogoVista;
  seccion: string;
  titulo?: string;
  abiertoInicial?: boolean;
}) {
  const kBorrador = claveBorrador(h.clave, seccion);
  const [abierto, setAbierto] = useState(abiertoInicial);
  const [texto, setTexto] = useState(() => leerBorrador(kBorrador));
  const [origen, setOrigen] = useState<OrigenEntrada>('texto');
  const [ocupado, setOcupado] = useState<'' | 'transcribiendo' | 'organizando'>('');
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState('');
  const [grabando, setGrabando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [nivel, setNivel] = useState(0);
  const grabadora = useRef<Grabadora | null>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  useAutoAltura(area, texto);

  const enCola = useLiveQuery(
    () => db.entradas.where('clave').equals(h.clave).filter((e) => e.seccion === seccion).toArray(),
    [h.clave, seccion],
  );

  useEffect(() => {
    setTexto(leerBorrador(kBorrador));
  }, [kBorrador]);

  useEffect(() => {
    guardarBorrador(kBorrador, texto);
  }, [kBorrador, texto]);

  useEffect(() => {
    if (!grabando) return;
    const t = setInterval(() => {
      setSegundos(grabadora.current?.segundos ?? 0);
      setNivel(grabadora.current?.nivel() ?? 0);
    }, 150);
    return () => clearInterval(t);
  }, [grabando]);

  useEffect(() => () => grabadora.current?.cancelar(), []);

  const sumarTexto = (nuevo: string) => {
    setTexto((t) => (t.trim() ? `${t.trim()}\n${nuevo.trim()}` : nuevo.trim()));
    setOrigen('voz');
  };

  const encolarAudio = async (blob: Blob, mime: string, duracion: number) => {
    await db.entradas.put({
      id: uuid(),
      clave: h.clave,
      seccion,
      campoObjetivo: '',
      origen: 'voz',
      texto: '',
      audio: blob,
      audioBytes: new Uint8Array(await blob.arrayBuffer()),
      mime,
      duracion,
      estado: 'pendiente',
      error: '',
      creado: new Date().toISOString(),
    });
    avisar('Audio guardado. Se transcribirá cuando haya señal.');
    programarSync(500);
  };

  const procesarAudio = async (blob: Blob, mime: string, duracion: number) => {
    setError('');
    if (blob.size > MAX_BYTES) {
      setError('El audio pasa de 14 MB. Grábalo en partes más cortas.');
      return;
    }
    if (!enLinea()) {
      await encolarAudio(blob, mime, duracion);
      return;
    }
    setOcupado('transcribiendo');
    try {
      const r = await llamar(
        'entrada.transcribir',
        { audioBase64: await blobABase64(blob), mime, dni: h.dni, episodio: h.episodio, seccion },
        { opId: uuid(), timeoutMs: 180_000 },
      );
      sumarTexto(r.transcripcion);
      avisar('Transcrito. Corrige lo que haga falta y toca Organizar.', 'exito');
    } catch (e) {
      if (e instanceof ErrorApi && e.codigo === 'red') await encolarAudio(blob, mime, duracion);
      else setError(mensaje(e));
    } finally {
      setOcupado('');
    }
  };

  const detener = async () => {
    const g = grabadora.current;
    if (!g) return;
    try {
      const r = await g.detener();
      setGrabando(false);
      if (r.segundos < 1 || r.blob.size === 0) return;
      await procesarAudio(r.blob, r.mime, r.segundos);
    } catch (e) {
      setGrabando(false);
      setError(mensaje(e));
    }
  };

  const grabar = async () => {
    setError('');
    const g = new Grabadora();
    grabadora.current = g;
    try {
      await g.iniciar(() => void detener());
      setSegundos(0);
      setGrabando(true);
    } catch (e) {
      setError(`No se pudo usar el micrófono: ${mensaje(e)}`);
    }
  };

  const cancelar = () => {
    grabadora.current?.cancelar();
    setGrabando(false);
  };

  const subir = async (f: File | undefined) => {
    if (!f) return;
    const mime = mimeDeArchivo(f);
    if (!mime) {
      setError('Formato de audio no reconocido. Usa mp3, m4a, ogg, opus, wav o webm.');
      return;
    }
    await procesarAudio(f, mime, 0);
  };

  const organizar = async () => {
    const t = texto.trim();
    if (!t) return;
    setError('');
    setResultado('');
    if (!enLinea()) {
      await db.entradas.put({
        id: uuid(),
        clave: h.clave,
        seccion,
        campoObjetivo: '',
        origen,
        texto: t,
        audio: null,
        mime: '',
        duracion: 0,
        estado: 'pendiente',
        error: '',
        creado: new Date().toISOString(),
      });
      setTexto('');
      setOrigen('texto');
      avisar('Sin señal: quedó en cola. Se organizará al volver la conexión.');
      return;
    }
    setOcupado('organizando');
    try {
      const actual = await db.historias.get(h.clave);
      const r = validarOrganizar(
        await llamar(
          'entrada.organizar',
          {
            texto: t,
            origen,
            dni: h.dni,
            episodio: h.episodio,
            plantilla: h.plantilla,
            seccion,
            contexto: valoresClinicos(actual?.valores ?? h.valores),
          },
          { opId: uuid(), timeoutMs: 180_000 },
        ),
      );
      const n = await aplicarOrganizar(h.clave, r, cat);
      setTexto('');
      setOrigen('texto');
      const partes = [
        `${n.llenados} ${n.llenados === 1 ? 'campo llenado' : 'campos llenados'}`,
        n.dudas ? `${n.dudas} ${n.dudas === 1 ? 'duda' : 'dudas'}` : '',
        n.conflictos ? `${n.conflictos} ${n.conflictos === 1 ? 'conflicto' : 'conflictos'} por resolver` : '',
        r.descartados.length ? `${r.descartados.length} descartados por no coincidir con la lista` : '',
      ].filter(Boolean);
      setResultado(partes.join(' · '));
    } catch (e) {
      setError(mensaje(e));
    } finally {
      setOcupado('');
    }
  };

  const usarTranscrita = async (id: string, t: string) => {
    sumarTexto(t);
    await db.entradas.delete(id);
  };

  if (!abierto) {
    return (
      <button type="button" className="boton bloque suave" onClick={() => setAbierto(true)}>
        🎙 {titulo}
      </button>
    );
  }

  const pendientes = (enCola ?? []).filter((e) => e.estado === 'pendiente');
  const transcritas = (enCola ?? []).filter((e) => e.estado === 'transcrita');
  const fallidas = (enCola ?? []).filter((e) => e.estado === 'error');

  return (
    <section className="tarjeta contar pila">
      <div className="contar-cabeza">
        <h2>{titulo}</h2>
        {puedeGrabar() && !grabando && (
          <button type="button" className="boton chico primario" disabled={!!ocupado} onClick={() => void grabar()}>
            🎙 Grabar
          </button>
        )}
        <button type="button" className="boton chico" disabled={!!ocupado || grabando} onClick={() => archivo.current?.click()}>
          ⬆ Audio
        </button>
        {!abiertoInicial && (
          <button type="button" className="icono chico" aria-label="Cerrar" onClick={() => setAbierto(false)}>
            ✕
          </button>
        )}
        <input
          ref={archivo}
          type="file"
          accept="audio/*,.opus,.ogg,.m4a,.mp3,.wav,.webm"
          hidden
          onChange={(e) => {
            void subir(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      {grabando && (
        <div className="grabando">
          <span className="rec" />
          <strong>{mmss(segundos)}</strong>
          <div className="vumetro">
            <div style={{ width: `${Math.round(nivel * 100)}%` }} />
          </div>
          <button type="button" className="boton chico primario" onClick={() => void detener()}>
            Detener
          </button>
          <button type="button" className="icono chico" aria-label="Cancelar" onClick={cancelar}>
            ✕
          </button>
        </div>
      )}
      {grabando && segundos > MAX_SEGUNDOS - 60 && <div className="aviso-texto">Queda menos de un minuto de grabación.</div>}
      {!puedeGrabar() && !window.isSecureContext && (
        <div className="sub pequeno">
          Para grabar aquí abre la app con la dirección <strong>https</strong>. Mientras tanto, graba con la grabadora del teléfono y súbela con «Audio».
        </div>
      )}

      <textarea
        ref={area}
        rows={3}
        value={texto}
        disabled={ocupado === 'organizando'}
        placeholder="Habla o escribe lo que contó el paciente o lo que encontraste. Da igual el orden."
        onChange={(e) => setTexto(e.target.value)}
      />

      {ocupado && (
        <div className="fila sub">
          <Girador /> {ocupado === 'transcribiendo' ? 'Transcribiendo el audio…' : 'Organizando con Gemini…'}
        </div>
      )}

      {transcritas.map((e) => (
        <div key={e.id} className="aviso-texto pila" style={{ gap: 6 }}>
          <strong className="pequeno">Transcripción lista</strong>
          <span style={{ whiteSpace: 'pre-wrap' }}>{e.texto}</span>
          <div className="fila">
            <button type="button" className="boton chico primario" onClick={() => void usarTranscrita(e.id, e.texto)}>
              Usar
            </button>
            <button type="button" className="boton chico" onClick={() => void db.entradas.delete(e.id)}>
              Descartar
            </button>
          </div>
        </div>
      ))}
      {pendientes.length > 0 && (
        <div className="sub">
          En cola sin señal: {pendientes.filter((e) => e.audio).length} audio(s), {pendientes.filter((e) => !e.audio).length} texto(s).
        </div>
      )}
      {fallidas.map((e) => (
        <div key={e.id} className="error-texto fila entre">
          <span>
            {e.audio ? 'Audio' : 'Texto'} no procesado: {e.error}
          </span>
          <span className="fila">
            <button
              type="button"
              className="boton chico"
              onClick={() => void db.entradas.update(e.id, { estado: 'pendiente', error: '' }).then(() => programarSync(100))}
            >
              Reintentar
            </button>
            <button type="button" className="boton chico" onClick={() => void db.entradas.delete(e.id)}>
              Quitar
            </button>
          </span>
        </div>
      ))}

      {error && <div className="error-texto">{error}</div>}
      {resultado && (
        <div className="resultado fila entre">
          <span>{resultado}</span>
        </div>
      )}
      {h.deshacer && (
        <div className="fila entre sub">
          <span>Último cambio de Gemini: {h.deshacer.resumen}</span>
          <button
            type="button"
            className="boton chico"
            onClick={() => {
              void deshacerOrganizar(h.clave, cat).then(() => {
                setResultado('');
                avisar('Cambios de Gemini deshechos');
              });
            }}
          >
            Deshacer
          </button>
        </div>
      )}

      <button
        type="button"
        className="boton primario bloque"
        disabled={!texto.trim() || !!ocupado || grabando}
        onClick={() => void organizar()}
      >
        {enLinea() ? 'Organizar' : 'Guardar en cola (sin señal)'}
      </button>
    </section>
  );
}
