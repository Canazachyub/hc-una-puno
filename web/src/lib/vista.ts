// Vista indexada del catálogo. Módulo puro: se usa en el navegador y en los scripts de prueba.

import { camposDePlantilla, indexarListas } from '../../../shared/catalogo';
import { PLANTILLA_POR_DEFECTO, plantillaValida } from '../../../shared/plantillas';
import { infoSeccion, ordenSeccion } from '../../../shared/secciones';
import type { SeccionInfo } from '../../../shared/secciones';
import type { Campo, Catalogos, KnowledgeIndice, Opcion } from '../../../shared/types';

export interface CatalogoVista {
  version: string;
  /** Plantilla con la que está armada esta vista. */
  plantilla: string;
  esquema: Campo[];
  opciones: Opcion[];
  listas: Map<string, Opcion[]>;
  porId: Map<string, Campo>;
  porSeccion: Map<string, Campo[]>;
  secciones: SeccionInfo[];
  knowledge: KnowledgeIndice[];
}

export function armarVista(c: Catalogos, plantillaPedida = PLANTILLA_POR_DEFECTO): CatalogoVista {
  const plantilla = plantillaValida(plantillaPedida);
  const propios = camposDePlantilla(c.esquema, plantilla);
  // Mientras la hoja no tenga la plantilla nueva, se usa lo que haya.
  const esquema = [...(propios.length ? propios : c.esquema)].sort(
    (a, b) => ordenSeccion(a.seccion, plantilla) - ordenSeccion(b.seccion, plantilla) || a.orden - b.orden,
  );
  const porSeccion = new Map<string, Campo[]>();
  for (const campo of esquema) {
    const l = porSeccion.get(campo.seccion);
    if (l) l.push(campo);
    else porSeccion.set(campo.seccion, [campo]);
  }
  const secciones = [...porSeccion.keys()]
    .sort((a, b) => ordenSeccion(a, plantilla) - ordenSeccion(b, plantilla))
    .map((id) => infoSeccion(id, plantilla));
  return {
    version: c.version,
    plantilla,
    esquema,
    opciones: c.opciones,
    listas: indexarListas(c.opciones),
    porId: new Map(esquema.map((x) => [x.campo_id, x])),
    porSeccion,
    secciones,
    knowledge: c.knowledge,
  };
}
