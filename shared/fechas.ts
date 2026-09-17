// Cálculos con fechas de la historia: edad y tiempo de enfermedad.
// El tiempo de enfermedad se cuenta desde el inicio de los síntomas hasta el ingreso (o hasta hoy).

function aFecha(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(iso.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] ?? 0), Number(m[5] ?? 0));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function hoyISO(conHora = false): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  const fecha = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  return conHora ? `${fecha}T${p(d.getHours())}:${p(d.getMinutes())}` : fecha;
}

/** Años cumplidos a la fecha de referencia. */
export function edadEnAnios(nacimiento: string, referencia = hoyISO()): number | null {
  const n = aFecha(nacimiento);
  const r = aFecha(referencia);
  if (!n || !r || n > r) return null;
  let edad = r.getFullYear() - n.getFullYear();
  if (r.getMonth() < n.getMonth() || (r.getMonth() === n.getMonth() && r.getDate() < n.getDate())) edad--;
  return edad;
}

/**
 * Duración entre dos fechas en la unidad que se usa en la historia:
 * horas (menos de 2 días), días (menos de 2 semanas), semanas (menos de 2 meses), meses (menos de 2 años) o años.
 */
export function tiempoEntre(inicio: string, fin: string): { valor: string; unidad: string } | null {
  const a = aFecha(inicio);
  const b = aFecha(fin);
  if (!a || !b || a > b) return null;
  const horas = (b.getTime() - a.getTime()) / 3_600_000;
  if (horas < 48) return { valor: String(Math.max(1, Math.round(horas))), unidad: 'horas' };
  const dias = Math.floor(horas / 24);
  if (dias < 14) return { valor: String(dias), unidad: 'días' };
  if (dias < 60) return { valor: String(Math.round(dias / 7)), unidad: 'semanas' };
  let meses = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) meses--;
  if (meses < 24) return { valor: String(Math.max(1, meses)), unidad: 'meses' };
  return { valor: String(Math.floor(meses / 12)), unidad: 'años' };
}
