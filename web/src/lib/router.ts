// Enrutador por hash: funciona en GitHub Pages sin configuración y sin señal.

import { useSyncExternalStore } from 'react';

export type Ruta =
  | { vista: 'historias' }
  | { vista: 'historia'; clave: string; seccion: string | null; campo: string | null }
  | { vista: 'revisar'; clave: string }
  | { vista: 'previa'; clave: string }
  | { vista: 'seguimiento'; clave: string }
  | { vista: 'laboratorio'; clave: string }
  | { vista: 'consulta'; q: string; grupo: string }
  | { vista: 'ajustes' };

export function leerRuta(hash: string): Ruta {
  const [camino, consulta = ''] = hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(consulta);
  const campo = params.get('c');
  const partes = camino.split('/').map(decodeURIComponent);
  if (partes[0] === 'ajustes') return { vista: 'ajustes' };
  if (partes[0] === 'consulta') return { vista: 'consulta', q: params.get('q') ?? '', grupo: params.get('g') ?? '' };
  if (partes[0] === 'h' && partes[1]) {
    if (partes[2] === 'revisar') return { vista: 'revisar', clave: partes[1] };
    if (partes[2] === 'previa') return { vista: 'previa', clave: partes[1] };
    if (partes[2] === 'seguimiento') return { vista: 'seguimiento', clave: partes[1] };
    if (partes[2] === 'laboratorio') return { vista: 'laboratorio', clave: partes[1] };
    return { vista: 'historia', clave: partes[1], seccion: partes[2] || null, campo };
  }
  return { vista: 'historias' };
}

export const rutas = {
  historias: () => '#/',
  historia: (clave: string, seccion?: string | null) =>
    `#/h/${encodeURIComponent(clave)}${seccion ? `/${encodeURIComponent(seccion)}` : ''}`,
  revisar: (clave: string) => `#/h/${encodeURIComponent(clave)}/revisar`,
  previa: (clave: string) => `#/h/${encodeURIComponent(clave)}/previa`,
  seguimiento: (clave: string) => `#/h/${encodeURIComponent(clave)}/seguimiento`,
  laboratorio: (clave: string) => `#/h/${encodeURIComponent(clave)}/laboratorio`,
  /** Abre la sección del campo y lo lleva a la vista. */
  campo: (clave: string, seccion: string, campoId: string) =>
    `#/h/${encodeURIComponent(clave)}/${encodeURIComponent(seccion)}?c=${encodeURIComponent(campoId)}`,
  ajustes: () => '#/ajustes',
  /** Consulta: escalas, valores normales, definiciones, síndromes, exámenes y revisión. */
  consulta: (q = '', grupo = '') => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (grupo) p.set('g', grupo);
    const t = p.toString();
    return `#/consulta${t ? `?${t}` : ''}`;
  },
};

export function ir(hash: string): void {
  if (location.hash !== hash) location.hash = hash;
}

let actual = leerRuta(location.hash);
const oyentes = new Set<() => void>();
window.addEventListener('hashchange', () => {
  actual = leerRuta(location.hash);
  oyentes.forEach((o) => o());
  window.scrollTo({ top: 0 });
});

export function useRuta(): Ruta {
  return useSyncExternalStore(
    (o) => {
      oyentes.add(o);
      return () => oyentes.delete(o);
    },
    () => actual,
  );
}
