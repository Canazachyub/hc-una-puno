// El formulario se dibuja solo a partir del Esquema.
// Los campos numéricos seguidos (signos vitales, somatometría) van en rejilla, como la línea PA · T · FR · FC de la plantilla.

import { describirContexto } from '../../../shared/contexto';
import { VARIABLES_UMBRAL, ambitosDeCampo, repartirAmbitos } from '../../../shared/guias';
import type { Campo, Duda, EscalaSugerida } from '../../../shared/types';
import { estaLleno } from '../../../shared/valores';
import type { HistoriaLocal } from '../lib/db';
import { contextoHistoria } from '../lib/guias';
import { camposVisibles } from '../lib/historia';
import type { CatalogoVista } from '../lib/vista';
import { CampoVista } from './Campos';
import { GuiaGrupo } from './Guia';

/** Campos vacíos de la sección que tiene sentido llenar (sin calculados ni el DNI). */
export function idsVacios(h: HistoriaLocal, cat: CatalogoVista, seccion: string): Set<string> {
  return new Set(
    camposVisibles(cat, seccion, h.valores)
      .filter((c) => c.tipo !== 'calculado' && c.campo_id !== 'fil.dni' && !estaLleno(h.valores[c.campo_id]))
      .map((c) => c.campo_id),
  );
}

const SIN_SUGERENCIAS: EscalaSugerida[] = [];
const SIN_DUDAS: Duda[] = [];
const SIN_FECHAS: Record<string, string> = {};
const SIN_GUIA: string[] = [];
const CON_CALCULADOR = new Set(['fil.edad', 'ea.tiempo_valor']);

type Grupo = { subtitulo: string | null; compacto: boolean; campos: Campo[] };

function agrupar(campos: Campo[]): Grupo[] {
  const grupos: Grupo[] = [];
  let anterior = '';
  for (const c of campos) {
    const compacto = c.tipo === 'numero' || c.tipo === 'calculado';
    // El título del grupo se escribe una sola vez, cuando cambia.
    const subtitulo = c.subtitulo && c.subtitulo !== anterior ? c.subtitulo : null;
    anterior = c.subtitulo;
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.compacto && compacto && !subtitulo) ultimo.campos.push(c);
    else grupos.push({ subtitulo, compacto, campos: [c] });
  }
  return grupos;
}

export function FormRenderer({
  h,
  cat,
  seccion,
  marcarFaltantes = false,
  soloIds = null,
}: {
  h: HistoriaLocal;
  cat: CatalogoVista;
  seccion: string;
  marcarFaltantes?: boolean;
  /** Si se indica, solo esos campos (los que estaban vacíos al activar el filtro; no desaparecen al llenarlos). */
  soloIds?: Set<string> | null;
}) {
  const fechas = {
    'fil.fecha_nacimiento': h.valores['fil.fecha_nacimiento'] ?? '',
    'fil.fecha_ingreso': h.valores['fil.fecha_ingreso'] ?? '',
    'fil.fecha_elaboracion': h.valores['fil.fecha_elaboracion'] ?? '',
  };

  const clinico = contextoHistoria(h.valores);
  const campos = camposVisibles(cat, seccion, h.valores).filter((c) => !soloIds || soloIds.has(c.campo_id));
  if (soloIds && campos.length === 0) {
    return <div className="resultado">Todo lo de esta sección está lleno.</div>;
  }
  const grupos = agrupar(campos);

  // Cada ámbito de la guía se muestra una sola vez: en la rejilla, debajo de ella; si no, con su primer campo.
  const usados = new Set<string>();
  const guiaDeGrupo = new Map<Grupo, string[]>();
  const guiaDeCampo = new Map<string, string[]>();
  for (const g of grupos) {
    if (g.compacto && g.campos.length > 1) {
      const propios = [...new Set(g.campos.flatMap((c) => ambitosDeCampo(c.campo_id)))].filter((a) => !usados.has(a));
      propios.forEach((a) => usados.add(a));
      guiaDeGrupo.set(g, propios);
    } else {
      for (const [id, a] of repartirAmbitos(g.campos.map((c) => c.campo_id), usados)) guiaDeCampo.set(id, a);
    }
  }

  const vista = (c: Campo) => {
    const sugerencias = h.sugerencias.filter((s) => s.campo === c.campo_id);
    const dudas = h.dudas.filter((d) => d.campo_id === c.campo_id && d.estado === 'pendiente');
    return (
      <CampoVista
        key={c.campo_id}
        campo={c}
        clave={h.clave}
        dni={h.dni}
        valor={h.valores[c.campo_id] ?? ''}
        confianza={h.confianza[c.campo_id]}
        sugerencias={sugerencias.length ? sugerencias : SIN_SUGERENCIAS}
        dudas={dudas.length ? dudas : SIN_DUDAS}
        cat={cat}
        faltante={marcarFaltantes && c.obligatorio && !estaLleno(h.valores[c.campo_id])}
        fechas={CON_CALCULADOR.has(c.campo_id) ? fechas : SIN_FECHAS}
        clinico={clinico}
        guia={guiaDeCampo.get(c.campo_id) ?? SIN_GUIA}
      />
    );
  };

  return (
    <div className="seccion-form">
      {grupos.map((g) => (
        <div key={g.campos[0].campo_id} className="seccion-form">
          {g.subtitulo && <h3 className="subtitulo-form">{g.subtitulo}</h3>}
          {g.campos.some((c) => c.campo_id in VARIABLES_UMBRAL) && (
            <div className="sub pequeno">
              Colores según {describirContexto(clinico)}. La edad sale de la fecha de nacimiento; la altitud se cambia en Ajustes.
            </div>
          )}
          {g.compacto && g.campos.length > 1 ? (
            <>
              <div className="rejilla-campos">{g.campos.map(vista)}</div>
              <GuiaGrupo ambitos={guiaDeGrupo.get(g) ?? SIN_GUIA} />
            </>
          ) : (
            g.campos.map(vista)
          )}
        </div>
      ))}
    </div>
  );
}
