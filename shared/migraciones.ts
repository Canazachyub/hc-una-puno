// Valores guardados con formatos anteriores → formato vigente (sin abreviaturas).
// Se aplica una vez a la hoja local y a la copia del dispositivo.

export const VERSION_MIGRACION = 2;

const REEMPLAZOS: [RegExp, string][] = [
  [/^EVA (\d+)\/10$/, 'Intensidad $1/10 en la escala visual análoga'],
  [/^ROT ([0-4]\+?)\/4\+ simétricos$/, 'Reflejos osteotendinosos $1/4+ simétricos'],
  [/^ROT ([0-4]\+?)\/4\+$/, 'Reflejos osteotendinosos $1/4+'],
  [/^Pulso ([0-4]\+?)\/4\+$/, 'Pulsos $1/4+'],
  [/^Fuerza ([0-5]\/5)$/, 'Fuerza muscular $1'],
  [/^Soplo ([IV]+\/VI)$/, 'Soplo de intensidad $1 en la escala de Levine'],
  [/^Disnea funcional NYHA ([IV]+)$/, 'Disnea en clase funcional $1 de la NYHA'],
  [/^mMRC (\d)$/, 'Disnea grado $1 en la escala mMRC'],
  [/^Bristol (\d)$/, 'Heces tipo $1 de la escala de Bristol'],
  [/^ECOG (\d)$/, 'Estado funcional grado $1 en la escala ECOG'],
  // Versión 2: llenado capilar sin rangos superpuestos.
  [/^Mayor de 2 segundos$/, 'Mayor de 2 y hasta 3 segundos'],
  // Dentro de textos (frases normales antiguas)
  [/ROT 2\+\/4\+ simétricos/g, 'reflejos osteotendinosos 2+/4+ simétricos'],
  [/cánula binasal a FiO2 /g, 'cánula binasal con una fracción inspirada de oxígeno de '],
  [/tercer ruido \(R3\)/g, 'tercer ruido'],
];

export function migrarValor(valor: string): string {
  let v = valor;
  for (const [re, por] of REEMPLAZOS) v = v.replace(re, por);
  return v;
}

/** Devuelve solo los valores que cambian. */
export function migrarValores(valores: Record<string, string>): Record<string, string> {
  const cambios: Record<string, string> = {};
  for (const [k, v] of Object.entries(valores)) {
    const nuevo = typeof v === 'string' ? v.split(' | ').map(migrarValor).join(' | ') : v;
    if (nuevo !== v) cambios[k] = nuevo;
  }
  return cambios;
}
