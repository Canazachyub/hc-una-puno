// Describir un síntoma tocando opciones de la teoría: síntoma, tiempo, inicio y, si es dolor,
// localización, carácter, intensidad, irradiación, agravantes y atenuantes.

import { useState } from 'react';
import type { ReactNode } from 'react';
import { esDolor, redactarSintoma } from '../../../shared/sintoma';
import type { DescripcionSintoma } from '../../../shared/sintoma';
import type { Opcion } from '../../../shared/types';
import { clave } from '../../../shared/valores';
import type { CatalogoVista } from '../lib/vista';
import { Modal } from './Basicos';

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="pila" style={{ gap: 6 }}>
      <strong className="pequeno">{titulo}</strong>
      {children}
    </div>
  );
}

function Uno({
  lista,
  valor,
  cambiar,
  filtro = '',
  fija = false,
}: {
  lista: Opcion[] | undefined;
  valor: string;
  cambiar: (v: string) => void;
  filtro?: string;
  /** No se puede quedar sin valor (unidad de tiempo). */
  fija?: boolean;
}) {
  if (!lista) return null;
  const q = clave(filtro);
  return (
    <div className="chips">
      {lista
        .filter((o) => !q || clave(`${o.valor} ${o.etiqueta}`).includes(q) || o.valor === valor)
        .map((o) => (
          <button
            key={o.valor}
            type="button"
            className={`chip ${valor === o.valor ? 'activo' : ''}`}
            title={o.etiqueta}
            aria-pressed={valor === o.valor}
            onClick={() => cambiar(valor === o.valor && !fija ? '' : o.valor)}
          >
            {o.valor}
          </button>
        ))}
    </div>
  );
}

function Varios({
  lista,
  valores,
  cambiar,
  excluir = [],
  filtro = '',
}: {
  lista: Opcion[] | undefined;
  valores: string[];
  cambiar: (v: string[]) => void;
  excluir?: string[];
  filtro?: string;
}) {
  if (!lista) return null;
  const q = clave(filtro);
  return (
    <div className="chips">
      {lista
        .filter((o) => !excluir.includes(o.valor))
        .filter((o) => !q || clave(`${o.valor} ${o.etiqueta}`).includes(q) || valores.includes(o.valor))
        .map((o) => {
          const activo = valores.includes(o.valor);
          return (
            <button
              key={o.valor}
              type="button"
              className={`chip ${activo ? 'activo' : ''}`}
              title={o.etiqueta}
              aria-pressed={activo}
              onClick={() => cambiar(activo ? valores.filter((v) => v !== o.valor) : [...valores, o.valor])}
            >
              {o.valor}
            </button>
          );
        })}
    </div>
  );
}

export function ConstructorSintoma({
  cat,
  primeroPorDefecto,
  tiempoInicial,
  cerrar,
  agregar,
}: {
  cat: CatalogoVista;
  primeroPorDefecto: boolean;
  tiempoInicial: { valor: string; unidad: string };
  cerrar: () => void;
  agregar: (frase: string) => void;
}) {
  const l = (id: string) => cat.listas.get(id);
  const [d, setD] = useState<DescripcionSintoma>({
    sintoma: '',
    primero: primeroPorDefecto,
    tiempoValor: primeroPorDefecto ? tiempoInicial.valor : '',
    tiempoUnidad: (primeroPorDefecto && tiempoInicial.unidad) || 'días',
    irradiacion: [],
    agravantes: [],
    atenuantes: [],
    acompanantes: [],
  });
  const [buscarSintoma, setBuscarSintoma] = useState('');
  const [buscarLugar, setBuscarLugar] = useState('');
  const [otro, setOtro] = useState('');
  const fijar = (p: Partial<DescripcionSintoma>) => setD((x) => ({ ...x, ...p }));

  const sintomas = l('sintoma');
  const elegido = sintomas?.find((o) => o.valor === d.sintoma);
  const dolor = elegido ? esDolor(elegido.etiqueta, elegido.valor) : !!otro && esDolor('', otro);
  const final: DescripcionSintoma = { ...d, sintoma: d.sintoma || otro };
  const frase = redactarSintoma(
    dolor ? final : { ...final, localizacion: '', caracter: '', intensidad: '', irradiacion: [], agravantes: [], atenuantes: [] },
  );

  return (
    <Modal titulo="Describir un síntoma" cerrar={cerrar}>
      <Bloque titulo="Síntoma">
        <input type="search" placeholder="Buscar (dolor, tos, orina…)" value={buscarSintoma} onChange={(e) => setBuscarSintoma(e.target.value)} />
        <Uno
          lista={sintomas}
          valor={d.sintoma}
          filtro={buscarSintoma}
          cambiar={(v) => {
            fijar({ sintoma: v });
            if (v) setOtro('');
          }}
        />
        <input placeholder="Otro síntoma (término médico)" value={otro} onChange={(e) => {
          setOtro(e.target.value);
          if (e.target.value) fijar({ sintoma: '' });
        }} />
        {elegido?.etiqueta && <span className="sub">{elegido.etiqueta}</span>}
      </Bloque>

      <Bloque titulo="En el relato">
        <div className="chips">
          <button type="button" className={`chip ${d.primero ? 'activo' : ''}`} onClick={() => fijar({ primero: true })}>
            Es el inicio del cuadro
          </button>
          <button type="button" className={`chip ${!d.primero ? 'activo' : ''}`} onClick={() => fijar({ primero: false })}>
            Se agrega después
          </button>
        </div>
      </Bloque>

      <Bloque titulo="Hace cuánto">
        <div className="fila" style={{ flexWrap: 'nowrap' }}>
          <input
            inputMode="numeric"
            style={{ width: 90, flex: 'none' }}
            placeholder="N.º"
            value={d.tiempoValor ?? ''}
            onChange={(e) => fijar({ tiempoValor: e.target.value.replace(/[^\d.,]/g, '') })}
          />
          <Uno lista={l('unidad_tiempo')} valor={d.tiempoUnidad || 'días'} fija cambiar={(v) => fijar({ tiempoUnidad: v })} />
        </div>
        <div className="chips">
          <button
            type="button"
            className={`chip ${d.aproximado ? 'activo' : ''}`}
            aria-pressed={!!d.aproximado}
            onClick={() => fijar({ aproximado: !d.aproximado })}
          >
            Aproximadamente
          </button>
        </div>
        <span className="sub pequeno">Márcalo si el paciente no recuerda con precisión. Se escribe como tiempo relativo: «hace 5 días».</span>
      </Bloque>

      <Bloque titulo="Forma de inicio">
        <Uno lista={l('forma_inicio')} valor={d.inicio ?? ''} cambiar={(v) => fijar({ inicio: v })} />
      </Bloque>

      {dolor && (
        <>
          <Bloque titulo="Localización">
            <input type="search" placeholder="Buscar región" value={buscarLugar} onChange={(e) => setBuscarLugar(e.target.value)} />
            <Uno lista={l('localizacion')} valor={d.localizacion ?? ''} filtro={buscarLugar} cambiar={(v) => fijar({ localizacion: v })} />
          </Bloque>
          <Bloque titulo="Carácter">
            <Uno lista={l('dolor_caracter')} valor={d.caracter ?? ''} cambiar={(v) => fijar({ caracter: v })} />
          </Bloque>
          <Bloque titulo="Intensidad (EVA)">
            <div className="rejilla-niveles">
              {Array.from({ length: 11 }, (_, i) => String(i)).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`chip ${d.intensidad === n ? 'activo' : ''}`}
                  onClick={() => fijar({ intensidad: d.intensidad === n ? '' : n })}
                >
                  {n}
                </button>
              ))}
            </div>
          </Bloque>
          <Bloque titulo="Se irradia a">
            <Varios
              lista={l('localizacion')}
              valores={d.irradiacion ?? []}
              filtro={buscarLugar}
              excluir={d.localizacion ? [d.localizacion] : []}
              cambiar={(v) => fijar({ irradiacion: v })}
            />
          </Bloque>
          <Bloque titulo="Se exacerba con">
            <Varios lista={l('agravante')} valores={d.agravantes ?? []} cambiar={(v) => fijar({ agravantes: v })} />
          </Bloque>
          <Bloque titulo="Cede con">
            <Varios lista={l('atenuante')} valores={d.atenuantes ?? []} cambiar={(v) => fijar({ atenuantes: v })} />
          </Bloque>
        </>
      )}

      <Bloque titulo="Presentación">
        <Uno lista={l('patron_sintoma')} valor={d.patron ?? ''} cambiar={(v) => fijar({ patron: v })} />
      </Bloque>

      <Bloque titulo="Se acompaña de">
        <Varios
          lista={sintomas}
          valores={d.acompanantes ?? []}
          filtro={buscarSintoma}
          excluir={d.sintoma ? [d.sintoma] : []}
          cambiar={(v) => fijar({ acompanantes: v })}
        />
      </Bloque>

      <Bloque titulo="Tratamiento recibido">
        <input placeholder="Fármaco, dosis y vía (si se automedicó)" value={d.tratamiento ?? ''} onChange={(e) => fijar({ tratamiento: e.target.value })} />
        <Uno lista={l('respuesta_tto')} valor={d.respuesta ?? ''} cambiar={(v) => fijar({ respuesta: v })} />
      </Bloque>

      <div className="observacion">
        <span className="sub pequeno">Así queda:</span>
        <span>{frase || 'Elige un síntoma.'}</span>
      </div>
      <button
        type="button"
        className="boton primario bloque"
        disabled={!frase}
        onClick={() => {
          agregar(frase);
          cerrar();
        }}
      >
        Agregar al relato
      </button>
    </Modal>
  );
}
