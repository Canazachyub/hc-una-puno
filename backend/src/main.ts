// Punto de entrada del paquete. build.mjs expone estas funciones como globales de Apps Script.

export { doPost } from './Router';
export { doGet, guardarClaveGemini } from './Configuracion';
export { restablecerClave } from './Auth';
export { instalarRespaldo, probarGemini, reimportarSemillas, respaldoDiario, setup } from './Setup';
export { calentar } from './Catalogos';
