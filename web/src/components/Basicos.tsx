import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useAvisos } from '../lib/avisos';

export function BarraProgreso({ valor, etiqueta }: { valor: number; etiqueta?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(valor)));
  return (
    <div className={`progreso ${v >= 100 ? 'completo' : ''}`} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={etiqueta}>
      <div style={{ width: `${v}%` }} />
    </div>
  );
}

export function Modal({ titulo, cerrar, children }: { titulo: string; cerrar: () => void; children: ReactNode }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && cerrar();
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [cerrar]);
  return (
    <div className="fondo-modal" onClick={cerrar}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="fila entre">
          <h2 style={{ fontSize: '1.1rem' }}>{titulo}</h2>
          <button type="button" className="icono chico" onClick={cerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Girador() {
  return <span className="girador" aria-hidden="true" />;
}

export function Avisos() {
  const avisos = useAvisos();
  return (
    <div className="avisos" aria-live="polite">
      {avisos.map((a) => (
        <div key={a.id} className={`aviso ${a.tipo}`}>
          {a.texto}
        </div>
      ))}
    </div>
  );
}

/** Ajusta la altura del textarea a su contenido. */
export function useAutoAltura(ref: RefObject<HTMLTextAreaElement | null>, valor: string) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight + 2, 640)}px`;
  }, [ref, valor]);
}

/**
 * Texto con estado local y guardado diferido: escribir no dispara una escritura por tecla,
 * y lo que llega de fuera (Gemini, botón Normal) se refleja si no se está escribiendo.
 */
export function useTextoDiferido(valor: string, guardar: (v: string) => void, ms = 600) {
  const [local, setLocal] = useState(valor);
  const pendiente = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const guardarRef = useRef(guardar);
  guardarRef.current = guardar;

  useEffect(() => {
    if (pendiente.current === null) setLocal(valor);
  }, [valor]);

  const confirmar = () => {
    clearTimeout(timer.current);
    if (pendiente.current !== null) {
      const v = pendiente.current;
      pendiente.current = null;
      guardarRef.current(v);
    }
  };

  useEffect(() => () => confirmar(), []);

  const escribir = (v: string) => {
    setLocal(v);
    pendiente.current = v;
    clearTimeout(timer.current);
    timer.current = setTimeout(confirmar, ms);
  };

  const reemplazar = (v: string) => {
    clearTimeout(timer.current);
    pendiente.current = null;
    setLocal(v);
    guardarRef.current(v);
  };

  return { local, escribir, confirmar, reemplazar };
}
