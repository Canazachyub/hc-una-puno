// Semáforo de las escalas: cada nivel con su gravedad para pintarlo en la app (nunca en el Word).
// 0 normal (verde) · 1 leve (amarillo) · 2 moderado (naranja) · 3 grave (rojo).

import { opcionDeTexto } from './formato';
import type { Opcion } from './types';
import { partes } from './valores';

export type Gravedad = 0 | 1 | 2 | 3;

export const NOMBRE_GRAVEDAD: Record<Gravedad, string> = { 0: 'Normal', 1: 'Leve', 2: 'Moderado', 3: 'Grave' };

const niveles = (grupos: [Gravedad, string[]][]): Record<string, Gravedad> =>
  Object.fromEntries(grupos.flatMap(([g, valores]) => valores.map((v) => [v, g])));

/** Gravedad de cada valor de las listas que la tienen. */
export const GRAVEDAD: Record<string, Record<string, Gravedad>> = {
  estado: niveles([[0, ['Bueno']], [1, ['Regular']], [3, ['Malo']]]),
  conciencia: niveles([[0, ['Lúcido']], [1, ['Somnoliento']], [2, ['Obnubilado']], [3, ['Estuporoso', 'Comatoso']]]),
  glasgow_ao: niveles([[0, ['4']], [1, ['3']], [2, ['2']], [3, ['1']]]),
  glasgow_rv: niveles([[0, ['5']], [1, ['4']], [2, ['3']], [3, ['2', '1']]]),
  glasgow_rm: niveles([[0, ['6']], [1, ['5']], [2, ['4']], [3, ['3', '2', '1']]]),
  eva: niveles([[0, ['0']], [1, ['1', '2', '3']], [2, ['4', '5', '6']], [3, ['7', '8', '9', '10']]]),
  llenado_capilar: niveles([[0, ['Menor de 2 segundos']], [1, ['De 2 segundos']], [2, ['Mayor de 2 y hasta 3 segundos']], [3, ['Mayor de 3 segundos']]]),
  deshidratacion: niveles([[1, ['Leve']], [2, ['Moderada']], [3, ['Grave']]]),
  cruces: niveles([[1, ['+/+++']], [2, ['++/+++']], [3, ['+++/+++']]]),
  godet: niveles([[1, ['+/++++']], [2, ['++/++++']], [3, ['+++/++++', '++++/++++']]]),
  fuerza: niveles([[0, ['5/5']], [1, ['4/5']], [2, ['3/5']], [3, ['2/5', '1/5', '0/5']]]),
  rot: niveles([[0, ['2+']], [1, ['1+', '3+']], [2, ['0']], [3, ['4+']]]),
  pulsos: niveles([[0, ['2+']], [1, ['3+']], [2, ['1+', '4+']], [3, ['0']]]),
  mv: niveles([[0, ['Conservado']], [2, ['Disminuido']], [3, ['Abolido']]]),
  agregados: niveles([[0, ['Ninguno']], [2, ['Crepitantes', 'Subcrepitantes', 'Sibilancias', 'Roncantes', 'Frote pleural', 'Soplo tubárico']]]),
  levine: niveles([[1, ['I/VI', 'II/VI']], [2, ['III/VI', 'IV/VI']], [3, ['V/VI', 'VI/VI']]]),
  nyha: niveles([[0, ['I']], [1, ['II']], [2, ['III']], [3, ['IV']]]),
  mmrc: niveles([[0, ['0']], [1, ['1']], [2, ['2']], [3, ['3', '4']]]),
  ecog: niveles([[0, ['0']], [1, ['1']], [2, ['2']], [3, ['3', '4']]]),
  bristol: niveles([[0, ['3', '4']], [1, ['2', '5']], [2, ['1', '6']], [3, ['7']]]),
};

export function gravedadDe(listaId: string | undefined, valor: string): Gravedad | null {
  if (!listaId) return null;
  return GRAVEDAD[listaId]?.[valor] ?? null;
}

export function gravedadDeOpcion(o: Opcion): Gravedad | null {
  return gravedadDe(o.lista_id, o.valor);
}

/** Gravedad de un valor guardado (frase armada o varias separadas por « | »): la mayor. */
export function gravedadDeTexto(lista: Opcion[] | undefined, texto: string): Gravedad | null {
  if (!lista || !texto || !GRAVEDAD[lista[0]?.lista_id]) return null;
  let mayor: Gravedad | null = null;
  for (const parte of partes(texto)) {
    const e = opcionDeTexto(lista, parte);
    const g = e ? gravedadDeOpcion(e.opcion) : null;
    if (g !== null && (mayor === null || g > mayor)) mayor = g;
  }
  return mayor;
}
