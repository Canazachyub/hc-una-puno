// Disparador diferido de la sincronización. Separado de sync.ts para evitar importaciones circulares.

let sincronizador: (() => Promise<void>) | null = null;
let temporizador: ReturnType<typeof setTimeout> | undefined;

export function registrarSincronizador(fn: () => Promise<void>): void {
  sincronizador = fn;
}

/** Agrupa las ediciones seguidas en una sola sincronización. */
export function programarSync(ms = 2500): void {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    void sincronizador?.();
  }, ms);
}
