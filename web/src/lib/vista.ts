// Vista indexada del catálogo. Módulo puro: se usa en el navegador y en los scripts de prueba.

import { indexarListas } from '../../../shared/catalogo';
import { SECCIONES, infoSeccion, ordenSeccion } from '../../../shared/secciones';
import type { SeccionInfo } from '../../../shared/secciones';
import type { Campo, Catalogos, KnowledgeIndice, Opcion } from '../../../shared/types';

export interface CatalogoVista {
  version: string;
  esquema: Campo[];
  opciones: Opcion[];
  listas: Map<string, Opcion[]>;
  porId: Map<string, Campo>;
  porSeccion: Map<string, Campo[]>;
  secciones: SeccionInfo[];
  knowledge: KnowledgeIndice[];
}

export function armarVista(c: Catalogos): CatalogoVista {
  const esquema = [...c.esquema].sort(
    (a, b) => ordenSeccion(a.seccion) - ordenSeccion(b.seccion) || a.orden - b.orden,
  );
  const porSeccion = new Map<string, Campo[]>();
  for (const campo of esquema) {
    const l = porSeccion.get(campo.seccion);
    if (l) l.push(campo);
    else porSeccion.set(campo.seccion, [campo]);
  }
  const secciones = [...porSeccion.keys()]
    .sort((a, b) => ordenSeccion(a) - ordenSeccion(b))
    .map((id) => SECCIONES.find((s) => s.id === id) ?? infoSeccion(id));
  return {
    version: c.version,
    esquema,
    opciones: c.opciones,
    listas: indexarListas(c.opciones),
    porId: new Map(esquema.map((x) => [x.campo_id, x])),
    porSeccion,
    secciones,
    knowledge: c.knowledge,
  };
}
