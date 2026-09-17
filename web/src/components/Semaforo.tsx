// Semáforo de gravedad: verde normal, amarillo leve, naranja moderado, rojo grave.
// Siempre acompañado de texto, para que no dependa solo del color.

import { NOMBRE_GRAVEDAD } from '../../../shared/gravedad';
import type { Gravedad } from '../../../shared/gravedad';

export function claseGravedad(g: Gravedad | null | undefined): string {
  return g === null || g === undefined ? '' : `sem sem-${g}`;
}

export function InsigniaGravedad({ gravedad, texto }: { gravedad: Gravedad; texto?: string }) {
  return (
    <span className={`insignia ${claseGravedad(gravedad)}`}>
      <span className="sem-punto" aria-hidden="true" />
      {texto ?? NOMBRE_GRAVEDAD[gravedad]}
    </span>
  );
}

export function LeyendaSemaforo() {
  return (
    <div className="leyenda-semaforo" aria-label="Colores de gravedad">
      {([0, 1, 2, 3] as Gravedad[]).map((g) => (
        <span key={g} className={claseGravedad(g)}>
          <span className="sem-punto" aria-hidden="true" />
          {NOMBRE_GRAVEDAD[g]}
        </span>
      ))}
    </div>
  );
}
