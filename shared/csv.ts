// CSV mínimo (RFC 4180): comillas dobles, comas y saltos de línea dentro de comillas.

export function parsearCsv(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let celda = '';
  let enComillas = false;
  const t = texto.charCodeAt(0) === 0xfeff ? texto.slice(1) : texto;

  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (enComillas) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          celda += '"';
          i++;
        } else {
          enComillas = false;
        }
      } else {
        celda += c;
      }
    } else if (c === '"') {
      enComillas = true;
    } else if (c === ',') {
      fila.push(celda);
      celda = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      fila.push(celda);
      filas.push(fila);
      fila = [];
      celda = '';
    } else {
      celda += c;
    }
  }
  if (celda !== '' || fila.length > 0) {
    fila.push(celda);
    filas.push(fila);
  }
  return filas.filter((f) => f.some((v) => v !== ''));
}

function celdaCsv(v: string): string {
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function serializarCsv(filas: string[][]): string {
  return filas.map((f) => f.map(celdaCsv).join(',')).join('\n') + '\n';
}

/** Convierte filas con cabecera en objetos, mapeando por nombre de columna. */
export function filasAObjetos(filas: string[][]): Record<string, string>[] {
  const [cabecera, ...resto] = filas;
  if (!cabecera) return [];
  const nombres = cabecera.map((c) => c.trim());
  return resto.map((f) => {
    const o: Record<string, string> = {};
    nombres.forEach((n, i) => {
      o[n] = (f[i] ?? '').trim();
    });
    return o;
  });
}
