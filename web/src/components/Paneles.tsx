// Panel de dudas (lo que falta preguntar) y de conflictos (dos valores para un campo).

import { infoSeccion } from '../../../shared/secciones';
import type { HistoriaLocal } from '../lib/db';
import { marcarDuda, resolverConflicto } from '../lib/historia';
import { ir, rutas } from '../lib/router';
import { mostrarValor } from '../lib/texto';
import type { CatalogoVista } from '../lib/vista';

function irACampo(clave: string, seccion: string, campo: string, seccionActual?: string) {
  if (seccion !== seccionActual) ir(rutas.historia(clave, seccion));
  setTimeout(() => {
    document.getElementById(`campo-${campo}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 120);
}

export function PanelDudas({ h, cat, seccion }: { h: HistoriaLocal; cat: CatalogoVista; seccion?: string }) {
  const dudas = h.dudas.filter((d) => !seccion || d.seccion === seccion || cat.porId.get(d.campo_id)?.seccion === seccion);
  const pendientes = dudas.filter((d) => d.estado === 'pendiente');
  const resueltas = dudas.filter((d) => d.estado === 'resuelta').slice(-3);
  if (pendientes.length === 0) return null;
  return (
    <section className="tarjeta panel">
      <h3>Dudas ({pendientes.length})</h3>
      <ul>
        {[...pendientes, ...resueltas].map((d) => {
          const campo = cat.porId.get(d.campo_id);
          return (
            <li key={d.id} className={`duda ${d.estado === 'resuelta' ? 'resuelta' : ''}`}>
              <input
                type="checkbox"
                aria-label="Marcar como resuelta"
                checked={d.estado === 'resuelta'}
                onChange={(e) => void marcarDuda(h.clave, d.id, e.target.checked)}
              />
              <div style={{ flex: 1 }}>
                <div>{d.pregunta}</div>
                {campo && (
                  <button
                    type="button"
                    className="boton chico"
                    style={{ marginTop: 4 }}
                    onClick={() => irACampo(h.clave, campo.seccion, campo.campo_id, seccion)}
                  >
                    {seccion ? campo.label : `${infoSeccion(campo.seccion).corto} · ${campo.label}`} →
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function PanelConflictos({ h, cat, seccion }: { h: HistoriaLocal; cat: CatalogoVista; seccion?: string }) {
  const conflictos = h.conflictos.filter((c) => !seccion || cat.porId.get(c.campo)?.seccion === seccion);
  if (conflictos.length === 0) return null;
  return (
    <section className="tarjeta panel">
      <h3>Elige un valor ({conflictos.length})</h3>
      <ul>
        {conflictos.map((c) => {
          const campo = cat.porId.get(c.campo);
          const [a, b] =
            c.origen === 'sync' ? ['En este dispositivo', 'En la nube (otro dispositivo)'] : ['Ya registrado', 'Lo que acabas de contar'];
          return (
            <li key={`${c.origen}-${c.campo}`} className="conflicto">
              <strong>
                {campo ? `${infoSeccion(campo.seccion).corto} · ${campo.label}` : c.campo}
              </strong>
              <div className="opciones">
                <button type="button" className="boton" onClick={() => void resolverConflicto(h.clave, c.campo, 'local', cat)}>
                  <span>
                    <span className="sub">{a}</span>
                    <br />
                    {mostrarValor(campo, c.local) || '(vacío)'}
                  </span>
                </button>
                <button type="button" className="boton" onClick={() => void resolverConflicto(h.clave, c.campo, 'otro', cat)}>
                  <span>
                    <span className="sub">{b}</span>
                    <br />
                    {mostrarValor(campo, c.otro) || '(vacío)'}
                  </span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
