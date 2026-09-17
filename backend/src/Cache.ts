// Textos grandes en la caché del script: CacheService admite 100 KB por clave, así que se parten en trozos.
// Si falta un trozo (Google puede descartarlos), se lee como si no hubiera nada.

/** Caracteres por trozo: con tildes, 45 000 caracteres quedan por debajo de 100 KB. */
const TROZO = 45_000;
const MAX_TROZOS = 60;

export function guardarGrande(clave: string, texto: string, segundos: number): void {
  const n = Math.max(1, Math.ceil(texto.length / TROZO));
  if (n > MAX_TROZOS) return;
  const valores: Record<string, string> = {};
  for (let i = 0; i < n; i++) valores[`${clave}:${i}`] = texto.slice(i * TROZO, (i + 1) * TROZO);
  // El número de trozos va al final: mientras no esté, la lectura no ve un texto a medias.
  const cache = CacheService.getScriptCache();
  cache.putAll(valores, segundos);
  cache.put(`${clave}:n`, String(n), segundos);
}

export function leerGrande(clave: string): string | null {
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get(`${clave}:n`) ?? 0);
  if (!n) return null;
  const claves = Array.from({ length: n }, (_, i) => `${clave}:${i}`);
  const partes = cache.getAll(claves);
  if (claves.some((k) => typeof partes[k] !== 'string')) return null;
  return claves.map((k) => partes[k]).join('');
}

export function borrarGrande(clave: string): void {
  CacheService.getScriptCache().remove(`${clave}:n`);
}
