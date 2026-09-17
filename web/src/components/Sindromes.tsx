// Síndromes compatibles: qué se encontró, qué se negó y qué falta explorar para confirmarlo o descartarlo.

import { useMemo } from 'react';
import { partes, unir, unirSinRepetir } from '../../../shared/valores';
import { avisar } from '../lib/avisos';
import type { HistoriaLocal } from '../lib/db';
import { editar } from '../lib/historia';
import { rutas } from '../lib/router';
import { sindromesCompatibles } from '../lib/sindromes';
import type { CatalogoVista } from '../lib/vista';
import { BarraProgreso } from './Basicos';
import { fuenteCorta } from './Guia';

const SISTEMA: Record<string, string> = {
  respiratorio: 'Respiratorio',
  cardiovascular: 'Cardiovascular',
  digestivo: 'Digestivo',
  renal: 'Renal y urinario',
  neurologico: 'Neurológico',
  endocrino: 'Endocrino',
  general: 'General',
};

export function PanelSindromes({ h, cat, abierto = false }: { h: HistoriaLocal; cat: CatalogoVista; abierto?: boolean }) {
  const lista = useMemo(() => sindromesCompatibles(h, cat), [h, cat]);
  const registrados = partes(h.valores['dx.sindromico']);

  const agregar = (nombre: string) => {
    void editar(h.clave, { 'dx.sindromico': unir(unirSinRepetir(registrados, [nombre])) }, cat).then(() => avisar(`Agregado: ${nombre}`, 'exito'));
  };
  const enlace = (campo: string) =>
    campo.startsWith('seg.') ? rutas.laboratorio(h.clave) : rutas.campo(h.clave, cat.porId.get(campo)?.seccion ?? '', campo);

  return (
    <details className="tarjeta guia-seccion" open={abierto}>
      <summary>
        <strong>🧩 Síndromes compatibles</strong>
        <span className="sub pequeno"> · {lista.length ? `${lista.length} según lo registrado` : 'aún no hay datos suficientes'}</span>
      </summary>
      <p className="sub pequeno" style={{ margin: '8px 0' }}>
        Orientativo: cruza lo que registraste con los criterios de tus notas. No diagnostica; lo que falta te dice qué preguntar o explorar.
      </p>
      <div className="pila" style={{ gap: 8 }}>
        {lista.map((s) => {
          const ya = registrados.some((r) => r.toLowerCase() === s.sindrome.nombre.toLowerCase());
          return (
            <details key={s.sindrome.id} className="guia-grupo">
              <summary>
                {s.sindrome.nombre} <span className="sub">· {s.puntaje} %</span>
              </summary>
              <BarraProgreso valor={s.puntaje} etiqueta={`${s.puntaje} % de los criterios`} />
              <div className="sub pequeno">
                {SISTEMA[s.sindrome.sistema] ?? s.sindrome.sistema} · {fuenteCorta(s.sindrome.fuente)}
              </div>
              <div className="guia">
                <div className="guia-bloque">
                  <strong>Encontrado</strong>
                  <ul>
                    {s.hallados.map((x) => (
                      <li key={x.criterio.texto}>
                        {x.criterio.cardinal && '★ '}
                        <a href={enlace(x.campo)}>{x.criterio.texto}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                {s.negados.length > 0 && (
                  <div className="guia-bloque">
                    <strong>Negado o negativo</strong>
                    <ul>
                      {s.negados.map((x) => (
                        <li key={x.criterio.texto}>
                          {x.criterio.cardinal && '★ '}
                          {x.criterio.texto}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {s.faltan.length > 0 && (
                  <div className="guia-bloque guia-pregunta">
                    <strong>Falta explorar</strong>
                    <ul>
                      {s.faltan.map((c) => (
                        <li key={c.texto}>
                          {c.cardinal && '★ '}
                          <span>{c.texto}</span>
                          {c.explorar && <span className="fuente"> · {c.explorar}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="fila">
                <button type="button" className="boton chico" disabled={ya} onClick={() => agregar(s.sindrome.nombre)}>
                  {ya ? '✓ En el diagnóstico sindrómico' : '+ Agregar al diagnóstico sindrómico'}
                </button>
              </div>
            </details>
          );
        })}
      </div>
      <span className="sub pequeno">★ criterio cardinal.</span>
    </details>
  );
}
