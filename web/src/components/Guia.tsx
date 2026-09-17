// Guía de llenado tomada de las notas de Semiología: cómo preguntar, cómo explorar,
// valores normales, exámenes y síndromes. Solo en pantalla.

import { ambitoDeSintoma, ambitosDeCampo, TITULO_AMBITO, TITULO_TIPO } from '../../../shared/guias';
import type { EntradaGuia, TipoGuia } from '../../../shared/guias';
import type { Campo } from '../../../shared/types';
import { partes, unir, unirSinRepetir } from '../../../shared/valores';
import { avisar } from '../lib/avisos';
import type { HistoriaLocal } from '../lib/db';
import { ambitosConPrefijo, guiasDe } from '../lib/guias';
import { editar } from '../lib/historia';
import { rutas } from '../lib/router';
import type { CatalogoVista } from '../lib/vista';

const CURSOS: Record<string, string> = {
  BIOQUIMICA: 'Bioquímica',
  FISIOLOGIA: 'Fisiología',
  FISIOPATOLOGIA: 'Fisiopatología',
  FARMACOLOGIA: 'Farmacología',
  PATOLOGIA: 'Patología',
};

/** "BIOQUIMICA 2026/entities/estructuras/Hemoglobina.md" → "Bioquímica · Hemoglobina"; "08c" queda igual (Semiología). */
export function fuenteCorta(archivo: string): string {
  if (!archivo.includes('/')) return archivo;
  const curso = archivo.split(/[\s/]/)[0];
  const nota = (archivo.split('/').pop() ?? '')
    .replace(/\.md$/, '')
    .replace(/^(Clase|Esquema)_\d+_/, '')
    .replace(/^\d+[a-z]?_/, '')
    .replace(/[-_]+/g, ' ');
  // Solo los nombres en mayúsculas sostenidas se pasan a minúscula ("INSUFICIENCIA RENAL CRONICA").
  const n = nota === nota.toUpperCase() ? nota.charAt(0) + nota.slice(1).toLowerCase() : nota;
  return `${CURSOS[curso] ?? curso} · ${n}`;
}

const ORDEN: TipoGuia[] = [
  'pregunta',
  'consejo',
  'instrumento',
  'posicion',
  'tecnica',
  'buscar',
  'normal',
  'interpretacion',
  'indicacion',
  'lectura',
  'sindrome',
  'alerta',
];

function Entradas({
  entradas,
  agregar,
}: {
  entradas: EntradaGuia[];
  agregar?: (texto: string) => void;
}) {
  return (
    <div className="guia">
      {ORDEN.map((tipo) => {
        const de = entradas.filter((e) => e.tipo === tipo);
        if (de.length === 0) return null;
        return (
          <div key={tipo} className={`guia-bloque guia-${tipo}`}>
            <strong>{TITULO_TIPO[tipo]}</strong>
            <ul>
              {de.map((e, i) => (
                <li key={`${e.ambito}-${i}`}>
                  <span>{e.texto}</span>
                  {e.archivo && (
                    <span className="fuente" title={e.archivo}>
                      {' '}
                      · {fuenteCorta(e.archivo)}
                    </span>
                  )}
                  {agregar && tipo === 'sindrome' && (
                    <button type="button" className="boton chico" onClick={() => agregar(e.texto.split(':')[0].trim())}>
                      + Agregar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** Término corto para buscar el tema del campo en Consulta: «Glasgow», «Frecuencia cardíaca», «Extremidades». */
function terminoConsulta(campo: Campo, ambitos: string[]): string {
  const titulo = ambitos.map((a) => TITULO_AMBITO[a]).find(Boolean) ?? campo.label;
  return titulo
    .replace(/\s*\(.*\)\s*$/, '')
    .split(' · ')[0]
    .replace(/^Escala de /i, '')
    .trim();
}

/** Guía de un campo, plegada. `ambitos` viene repartido por el formulario para no repetirla. */
export function GuiaCampo({
  campo,
  ambitos,
  clave,
  valor,
  cat,
}: {
  campo: Campo;
  ambitos: string[];
  clave: string;
  valor: string;
  cat: CatalogoVista;
}) {
  const entradas = guiasDe(ambitos);
  if (entradas.length === 0) return null;
  const agregar =
    campo.tipo === 'lista'
      ? (texto: string) => {
          void editar(clave, { [campo.campo_id]: unir(unirSinRepetir(partes(valor), [texto])) }, cat).then(() =>
            avisar(`Agregado: ${texto}`, 'exito'),
          );
        }
      : undefined;
  return (
    <details className="notas guia-plegable">
      <summary>📖 Guía ({entradas.length})</summary>
      <Entradas entradas={entradas} agregar={agregar} />
      <a className="enlace pequeno" href={rutas.consulta(terminoConsulta(campo, ambitos))}>
        📚 Buscar «{terminoConsulta(campo, ambitos)}» en Consulta
      </a>
    </details>
  );
}

/** Guía de un grupo en rejilla (signos vitales): un bloque plegado por dato. */
export function GuiaGrupo({ ambitos }: { ambitos: string[] }) {
  const grupos = ambitos.map((a) => ({ a, entradas: guiasDe([a]) })).filter((g) => g.entradas.length > 0);
  if (grupos.length === 0) return null;
  const total = grupos.reduce((n, g) => n + g.entradas.length, 0);
  return (
    <details className="notas guia-plegable">
      <summary>📖 Guía de estos datos ({total})</summary>
      <div className="pila" style={{ gap: 6, marginTop: 6 }}>
        {grupos.map((g) => (
          <Grupo key={g.a} titulo={TITULO_AMBITO[g.a] ?? g.a} entradas={g.entradas} />
        ))}
      </div>
    </details>
  );
}

function Grupo({ titulo, entradas, abierto = false }: { titulo: string; entradas: EntradaGuia[]; abierto?: boolean }) {
  if (entradas.length === 0) return null;
  return (
    <details className="guia-grupo" open={abierto}>
      <summary>{titulo}</summary>
      <Entradas entradas={entradas} />
    </details>
  );
}

/** Guía de la sección: lo general de la sección, la del síntoma guía y, en plan y exámenes, cada examen. */
export function GuiaSeccion({ seccion, h, cat }: { seccion: string; h: HistoriaLocal; cat: CatalogoVista }) {
  const deCampos = new Set((cat.porSeccion.get(seccion) ?? []).flatMap((c) => ambitosDeCampo(c.campo_id)));
  const generales = [seccion].filter((a) => !deCampos.has(a));
  const bloques: { titulo: string; entradas: EntradaGuia[]; abierto?: boolean }[] = [];

  const general = guiasDe(generales);
  if (general.length) bloques.push({ titulo: 'Para esta sección', entradas: general, abierto: true });

  if (seccion === 'enfermedad_actual') {
    const sintoma = h.valores['ea.sintoma_guia'] ?? '';
    const ambito = ambitoDeSintoma(sintoma);
    if (ambito) bloques.push({ titulo: `Síntoma guía: ${sintoma}`, entradas: guiasDe([ambito]), abierto: true });
    for (const a of ambitosConPrefijo('s.')) {
      if (a !== ambito) bloques.push({ titulo: `Si el síntoma es: ${TITULO_AMBITO[a] ?? a}`, entradas: guiasDe([a]) });
    }
  }
  if (seccion === 'plan_trabajo' || seccion === 'examenes') {
    for (const a of ambitosConPrefijo('ex.')) bloques.push({ titulo: TITULO_AMBITO[a] ?? a, entradas: guiasDe([a]) });
  }

  if (bloques.length === 0) return null;
  return (
    <details className="tarjeta guia-seccion">
      <summary>
        <strong>📖 Guía de la sección</strong>
        <span className="sub pequeno"> · de tus notas de Semiología</span>
      </summary>
      <div className="pila" style={{ gap: 8, marginTop: 8 }}>
        {bloques.map((b) => (
          <Grupo key={b.titulo} titulo={b.titulo} entradas={b.entradas} abierto={b.abierto} />
        ))}
        <a className="enlace pequeno" href={rutas.consulta()}>
          📚 Ver todo en Consulta: escalas, valores normales, definiciones, síndromes y exámenes
        </a>
      </div>
    </details>
  );
}
