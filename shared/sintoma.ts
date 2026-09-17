// Redacta un síntoma con su semiología a partir de opciones tocadas.
// "Paciente refiere que hace 3 días, de inicio insidioso, presenta lumbalgia a nivel de la región lumbar,
//  de carácter opresivo, de intensidad 6/10 en la escala visual análoga, que se irradia a la región dorsal,
//  que se exacerba con la flexión del tronco y cede con el reposo. Se acompaña de parestesias."

export interface DescripcionSintoma {
  sintoma: string;
  /** Primer síntoma del relato ("Paciente refiere que…") o uno que se agrega después. */
  primero: boolean;
  tiempoValor?: string;
  tiempoUnidad?: string;
  /** El paciente no recuerda con precisión: "hace aproximadamente 5 días". */
  aproximado?: boolean;
  inicio?: string;
  localizacion?: string;
  caracter?: string;
  intensidad?: string;
  patron?: string;
  irradiacion?: string[];
  agravantes?: string[];
  atenuantes?: string[];
  acompanantes?: string[];
  tratamiento?: string;
  respuesta?: string;
}

const SINGULAR: Record<string, string> = { horas: 'hora', días: 'día', semanas: 'semana', meses: 'mes', años: 'año' };

/** "a, b y c" */
export function enumerar(items: string[] | undefined): string {
  const l = (items ?? []).map((x) => x.trim()).filter(Boolean);
  if (l.length <= 1) return l[0] ?? '';
  return `${l.slice(0, -1).join(', ')} y ${l[l.length - 1]}`;
}

/** Contracciones: "de el" → "del", "a el" → "al". */
function contraer(texto: string): string {
  return texto.replace(/\bde el\b/g, 'del').replace(/\ba el\b/g, 'al');
}

/** Minúscula inicial salvo siglas (NYHA, EVA). */
function enMinuscula(t: string): string {
  const s = t.trim();
  return /^[A-ZÁÉÍÓÚÑ]{2,}\b/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);
}

export function tiempoTexto(valor?: string, unidad?: string): string {
  const v = (valor ?? '').trim();
  const u = (unidad ?? '').trim();
  // "hace 5" sin unidad no dice nada: sin unidad no se escribe el tiempo.
  if (!v || !u) return '';
  return `${v} ${v === '1' ? (SINGULAR[u] ?? u) : u}`;
}

export function redactarSintoma(d: DescripcionSintoma): string {
  const sintoma = enMinuscula(d.sintoma);
  if (!sintoma) return '';
  const base = tiempoTexto(d.tiempoValor, d.tiempoUnidad);
  const tiempo = base && d.aproximado ? `aproximadamente ${base}` : base;
  let frase = d.primero
    ? tiempo
      ? `Paciente refiere que hace ${tiempo}`
      : 'Paciente refiere que'
    : tiempo
      ? `Hace ${tiempo}`
      : 'Posteriormente';
  const partes: string[] = [];
  if (d.inicio) partes.push(`de inicio ${enMinuscula(d.inicio)}`);
  frase += partes.length ? `, ${partes.join(', ')}, ` : ' ';
  frase += `${d.primero ? 'presenta' : 'se agrega'} ${sintoma}`;
  if (d.localizacion) frase += ` a nivel de ${d.localizacion.trim()}`;
  if (d.caracter) frase += `, de carácter ${enMinuscula(d.caracter)}`;
  if (d.intensidad) frase += `, de intensidad ${d.intensidad}/10 en la escala visual análoga`;
  // La presentación viene como frase completa: "de predominio nocturno", "en episodios recurrentes".
  if (d.patron) frase += `, ${enMinuscula(d.patron)}`;
  const irr = enumerar(d.irradiacion);
  if (irr) frase += `, que se irradia a ${irr}`;
  const agr = enumerar(d.agravantes);
  const ate = enumerar(d.atenuantes);
  if (agr && ate) frase += `, que se exacerba con ${agr} y cede con ${ate}`;
  else if (agr) frase += `, que se exacerba con ${agr}`;
  else if (ate) frase += `, que cede con ${ate}`;
  frase += '.';
  const acomp = enumerar(d.acompanantes?.map(enMinuscula));
  if (acomp) frase += ` Se acompaña de ${acomp}.`;
  if (d.tratamiento?.trim()) {
    frase += ` Se automedica con ${d.tratamiento.trim()}${d.respuesta ? `, ${enMinuscula(d.respuesta)}` : ''}.`;
  } else if (d.respuesta) {
    frase += ` ${d.respuesta.trim().charAt(0).toUpperCase()}${d.respuesta.trim().slice(1)}.`;
  }
  return contraer(frase.replace(/\s+/g, ' ').replace(/ ,/g, ','));
}

/** ¿La opción del síntoma es un dolor? En la lista `sintoma`, su etiqueta empieza con "Dolor". */
export function esDolor(etiqueta: string, valor: string): boolean {
  return /^dolor/i.test(etiqueta.trim()) || /algia|dolor|c[oó]lico/i.test(valor);
}
