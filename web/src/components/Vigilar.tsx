// Hallazgos a vigilar: signos vitales fuera de rango y escalas alteradas, de más grave a menos.
// Un toque lleva al campo. Solo pantalla.

import { NOMBRE_GRAVEDAD, gravedadDeTexto } from '../../../shared/gravedad';
import type { Gravedad } from '../../../shared/gravedad';
import { interpretarConNivel } from '../../../shared/guias';
import type { Campo } from '../../../shared/types';
import type { HistoriaLocal } from '../lib/db';
import { UMBRALES, contextoHistoria } from '../lib/guias';
import { rutas } from '../lib/router';
import { mostrarValor } from '../lib/texto';
import type { CatalogoVista } from '../lib/vista';
import { InsigniaGravedad, LeyendaSemaforo, claseGravedad } from './Semaforo';

// El total de Glasgow ya resume sus tres componentes.
const OMITIR = new Set(['efg.glasgow_ao', 'efg.glasgow_rv', 'efg.glasgow_rm']);

interface Hallazgo {
  campo: Campo;
  gravedad: Gravedad;
  texto: string;
}

export function hallazgosAVigilar(h: HistoriaLocal, cat: CatalogoVista): Hallazgo[] {
  const out: Hallazgo[] = [];
  const clinico = contextoHistoria(h.valores);
  for (const campo of cat.esquema) {
    const valor = h.valores[campo.campo_id];
    if (!valor || OMITIR.has(campo.campo_id)) continue;
    const umbrales = interpretarConNivel(campo.campo_id, valor, UMBRALES, clinico);
    const peor = umbrales.reduce<Gravedad | null>((m, u) => (m === null || u.nivel > m ? u.nivel : m), null);
    if (peor !== null && peor > 0) {
      out.push({
        campo,
        gravedad: peor,
        texto: `${mostrarValor(campo, valor)} · ${umbrales.filter((u) => u.nivel > 0).map((u) => u.etiqueta).join(' · ')}`,
      });
      continue;
    }
    const g = gravedadDeTexto(campo.lista_id ? cat.listas.get(campo.lista_id) : undefined, valor);
    if (g !== null && g > 0) out.push({ campo, gravedad: g, texto: mostrarValor(campo, valor) });
  }
  return out.sort((a, b) => b.gravedad - a.gravedad);
}

export function PanelVigilar({ h, cat }: { h: HistoriaLocal; cat: CatalogoVista }) {
  const hallazgos = hallazgosAVigilar(h, cat);
  if (hallazgos.length === 0) return null;
  const graves = hallazgos.filter((x) => x.gravedad === 3).length;
  return (
    <div className="tarjeta pila" style={{ gap: 8 }}>
      <div className="fila entre">
        <h2 style={{ fontSize: '1rem' }}>🚦 Hallazgos a vigilar</h2>
        {graves > 0 && <InsigniaGravedad gravedad={3} texto={`${graves} ${graves === 1 ? 'grave' : 'graves'}`} />}
      </div>
      <ul className="vigilar">
        {hallazgos.map((x) => (
          <li key={x.campo.campo_id}>
            <a className={claseGravedad(x.gravedad)} href={rutas.campo(h.clave, x.campo.seccion, x.campo.campo_id)}>
              <span className="campo-nombre">{x.campo.label}</span>
              <InsigniaGravedad gravedad={x.gravedad} texto={NOMBRE_GRAVEDAD[x.gravedad]} />
              <span className="campo-valor">{x.texto}</span>
            </a>
          </li>
        ))}
      </ul>
      <LeyendaSemaforo />
    </div>
  );
}
