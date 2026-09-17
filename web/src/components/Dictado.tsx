// Botón para dictar: graba, transcribe con Gemini y entrega el texto. Necesita señal.

import { useEffect, useRef, useState } from 'react';
import { enLinea, llamar, mensaje, uuid } from '../lib/api';
import { avisar } from '../lib/avisos';
import { Grabadora } from '../lib/recorder';
import { blobABase64 } from '../lib/sync';
import { Girador } from './Basicos';

export function Dictado({ dni, episodio, seccion, alTexto }: { dni: string; episodio: number; seccion: string; alTexto: (t: string) => void }) {
  const grabadora = useRef<Grabadora | null>(null);
  const [estado, setEstado] = useState<'' | 'grabando' | 'transcribiendo'>('');
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    if (estado !== 'grabando') return;
    const t = setInterval(() => setSegundos(grabadora.current?.segundos ?? 0), 500);
    return () => clearInterval(t);
  }, [estado]);

  useEffect(() => () => grabadora.current?.cancelar(), []);

  const detener = async () => {
    const g = grabadora.current;
    if (!g) return;
    try {
      const r = await g.detener();
      if (r.segundos < 1) {
        setEstado('');
        return;
      }
      setEstado('transcribiendo');
      const t = await llamar(
        'entrada.transcribir',
        { audioBase64: await blobABase64(r.blob), mime: r.mime, dni, episodio, seccion },
        { opId: uuid(), timeoutMs: 180_000 },
      );
      alTexto(t.transcripcion);
    } catch (e) {
      avisar(mensaje(e), 'error');
    } finally {
      setEstado('');
    }
  };

  const grabar = async () => {
    if (!enLinea()) {
      avisar('Sin señal: escribe el texto y usa Gemini cuando vuelva la señal', 'error');
      return;
    }
    const g = new Grabadora();
    grabadora.current = g;
    try {
      await g.iniciar(() => void detener());
      setSegundos(0);
      setEstado('grabando');
    } catch (e) {
      avisar(`No se pudo usar el micrófono: ${mensaje(e)}`, 'error');
    }
  };

  if (estado === 'transcribiendo') {
    return (
      <button type="button" className="boton chico" disabled>
        <Girador /> Transcribiendo…
      </button>
    );
  }
  if (estado === 'grabando') {
    return (
      <button type="button" className="boton chico peligro" onClick={() => void detener()}>
        ■ Detener ({segundos} s)
      </button>
    );
  }
  return (
    <button type="button" className="boton chico" onClick={() => void grabar()}>
      🎙 Dictar
    </button>
  );
}
