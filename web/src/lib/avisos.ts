// Avisos breves en pantalla.

import { useSyncExternalStore } from 'react';

export interface Aviso {
  id: number;
  texto: string;
  tipo: 'info' | 'error' | 'exito';
}

let avisos: Aviso[] = [];
let siguiente = 1;
const oyentes = new Set<() => void>();

function emitir(): void {
  oyentes.forEach((o) => o());
}

export function avisar(texto: string, tipo: Aviso['tipo'] = 'info', ms = 3500): void {
  const id = siguiente++;
  avisos = [...avisos, { id, texto, tipo }].slice(-3);
  emitir();
  setTimeout(() => {
    avisos = avisos.filter((a) => a.id !== id);
    emitir();
  }, ms);
}

export function useAvisos(): Aviso[] {
  return useSyncExternalStore(
    (o) => {
      oyentes.add(o);
      return () => oyentes.delete(o);
    },
    () => avisos,
  );
}
