// Decisiones sobre las diferencias entre la app y las notas (Consulta → Revisión con tus notas).
// Cada punto tiene una sola decisión vigente: se guarda en Registro con id fijo.

import type { Decision, EstadoDecision } from '../../shared/types';
import { conLock, guardarRegistro, registrosDeTipo } from './Repo';
import { ErrorApi } from './Util';

const ESTADOS: EstadoDecision[] = ['seguir_nota', 'mantener_app', 'consultar_docente'];
const RE_PUNTO = /^\d{2}-\d{1,3}$/;

export function decidir(p: { decisiones: Decision[] }): { total: number } {
  if (!Array.isArray(p.decisiones)) throw new ErrorApi('Faltan decisiones', 'payload');
  const validas = p.decisiones.filter((d) => RE_PUNTO.test(String(d.punto)) && ESTADOS.includes(d.decision));
  if (validas.length !== p.decisiones.length) throw new ErrorApi('Hay decisiones con datos no válidos', 'payload');
  conLock(() => {
    for (const d of validas) {
      guardarRegistro({
        id: `decision-${d.punto}`,
        tipo: 'decision',
        campo_id: d.punto,
        estado: d.decision,
        contenido: JSON.stringify({ comentario: String(d.comentario ?? '').slice(0, 2000), fecha: d.fecha }),
      });
    }
  });
  return { total: validas.length };
}

export function listarDecisiones(): { decisiones: Decision[] } {
  const decisiones = registrosDeTipo('decision')
    .map((r): Decision | null => {
      let extra: { comentario?: string; fecha?: string } = {};
      try {
        extra = JSON.parse(r.contenido || '{}') as typeof extra;
      } catch {
        // contenido dañado: se conserva la decisión
      }
      if (!RE_PUNTO.test(r.campo_id) || !ESTADOS.includes(r.estado as EstadoDecision)) return null;
      return { punto: r.campo_id, decision: r.estado as EstadoDecision, comentario: extra.comentario ?? '', fecha: extra.fecha || r.fecha };
    })
    .filter((d): d is Decision => d !== null);
  return { decisiones };
}
