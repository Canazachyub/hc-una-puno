import { COLUMNAS_CONTROL } from '../shared/types';
// Pruebas: capa compartida y backend completo sobre un Apps Script simulado (Gemini simulado).
// Uso: npm test   (compila el backend antes)

import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { evaluar, recalcular } from '../shared/calc';
import { escalasDeCampo, filasAEsquema, filasAOpciones, indexarListas, reglaConValores, valorNormal } from '../shared/catalogo';
import { redactarSintoma } from '../shared/sintoma';
import { comaDecimal, detectarAbreviaturas, detectarDiminutivos, expandirAbreviaturas } from '../shared/abreviaturas';
import { parsearCsv, serializarCsv } from '../shared/csv';
import { edadEnAnios, tiempoEntre } from '../shared/fechas';
import { aplicarFormato, leerFormato, opcionDeTexto, textoOpcion } from '../shared/formato';
import { GRAVEDAD, gravedadDe, gravedadDeTexto } from '../shared/gravedad';
import { TITULO_AMBITO, ambitoDeSintoma, ambitosDeCampo, cortesDeGuia, interpretar, interpretarConNivel, parsearGuias, repartirAmbitos, umbrales } from '../shared/guias';
import { migrarValor, migrarValores } from '../shared/migraciones';
import { contextoDe } from '../shared/contexto';
import { ajusteHemoglobina, buscarParametro, interpretarLab, parsearLaboratorio, rangoDeReferencia } from '../shared/laboratorio';
import { CAMPOS_SISTEMA, CAMPO_EVOLUCIONES, CAMPO_LABORATORIO, diaHospitalizacion, escribirEvoluciones, escribirLaboratorio, validarSistema } from '../shared/seguimiento';
import { PLANTILLA_POR_DEFECTO } from '../shared/plantillas';
import { SECCIONES } from '../shared/secciones';
import { parsearSindromes, sugerirSindromes } from '../shared/sindromes';
import type { Campo, Respuesta } from '../shared/types';
import { validarValor } from '../shared/valores';
import { crearEntorno } from '../local/gas-node';
import type { PeticionHttp } from '../local/gas-node';
import { armarDocumento } from '../web/src/lib/docx/documento';
import { armarVista } from '../web/src/lib/vista';

const RAIZ = join(import.meta.dirname, '..');
let fallos = 0;
let total = 0;

async function prueba(nombre: string, fn: () => void | Promise<void>): Promise<void> {
  total++;
  try {
    await fn();
    console.log(`  ✓ ${nombre}`);
  } catch (e) {
    fallos++;
    console.log(`  ✗ ${nombre}\n    ${e instanceof Error ? e.message : String(e)}`);
  }
}

const filasDeEsquema = (): string[][] => {
  const [cab, ...fmh] = parsearCsv(readFileSync(join(RAIZ, 'seed/esquema.csv'), 'utf8'));
  const ochoa = parsearCsv(readFileSync(join(RAIZ, 'seed/esquema-ochoa.csv'), 'utf8')).slice(1);
  return [cab, ...fmh, ...ochoa].filter((f) => f.some((c) => c !== ''));
};
const esquema = filasAEsquema(filasDeEsquema());
const opciones = filasAOpciones(parsearCsv(readFileSync(join(RAIZ, 'seed/opciones.csv'), 'utf8')));
const listas = indexarListas(opciones);
const campo = (id: string) => {
  const c = esquema.find((x) => x.campo_id === id);
  if (!c) throw new Error(`sin campo ${id}`);
  return c;
};

console.log('Semillas');
await prueba('cada plantilla trae sus campos: 152 la de Clínica Médica, más de 350 la detallada', () => {
  assert.equal(esquema.filter((c) => c.plantilla === 'fmh').length, 152);
  assert.ok(esquema.filter((c) => c.plantilla === 'ochoa').length > 350);
});
await prueba('todo lista_id del esquema existe en Opciones', () => {
  const faltan = esquema.filter((c) => c.lista_id && !listas.has(c.lista_id)).map((c) => c.lista_id);
  assert.deepEqual(faltan, []);
});
await prueba('CSV ida y vuelta con comillas y saltos de línea', () => {
  const filas = [['a', 'b, c'], ['"x"', 'l1\nl2']];
  assert.deepEqual(parsearCsv(serializarCsv(filas)), filas);
});

console.log('Formato de escalas');
await prueba('godet arma la frase y se lee de vuelta', () => {
  const op = listas.get('godet')![1];
  const t = textoOpcion(op, { nivel: 'tobillos', lateralidad: 'bilateral' });
  assert.equal(t, 'Edema ++/++++ hasta tobillos, bilateral, con fóvea');
  assert.deepEqual(opcionDeTexto(listas.get('godet')!, t)?.datos, { nivel: 'tobillos', lateralidad: 'bilateral' });
});
await prueba('valor en mitad de frase va en minúscula; siglas no', () => {
  assert.equal(aplicarFormato('Se auscultan {valor} en {localizacion}', 'Crepitantes', { localizacion: 'base derecha' }), 'Se auscultan crepitantes en base derecha');
  assert.equal(aplicarFormato('Disnea funcional NYHA {valor}', 'II'), 'Disnea funcional NYHA II');
});
await prueba('marcador faltante queda visible', () => {
  assert.equal(aplicarFormato('Edema {valor} hasta {nivel}', '+/++++'), 'Edema +/++++ hasta [nivel]');
  assert.deepEqual(leerFormato('Edema {valor} hasta {nivel}', '+/++++', 'Edema +/++++ hasta [nivel]'), { nivel: '' });
});

console.log('Validación de valores');
await prueba('opción con otra grafía se normaliza', () => {
  assert.deepEqual(validarValor(campo('ea.forma_inicio'), 'insidioso', listas), { ok: true, valor: 'Insidioso' });
});
await prueba('opción fuera de lista se rechaza', () => {
  assert.equal(validarValor(campo('ea.forma_inicio'), 'lento', listas).ok, false);
});
await prueba('opcion_otro acepta texto libre', () => {
  assert.deepEqual(validarValor(campo('fil.ocupacion'), 'Artesano textil', listas), { ok: true, valor: 'Artesano textil' });
  // Gemini a veces copia la opción con su definición, como se la muestra el prompt.
  assert.deepEqual(validarValor(campo('ea.sintoma_guia'), 'Edema (Acumulación de líquido en el intersticio)', listas), { ok: true, valor: 'Edema' });
  assert.deepEqual(validarValor(campo('ea.sintoma_guia'), 'Dolor raro (sin definición)', listas), { ok: true, valor: 'Dolor raro (sin definición)' });
});
await prueba('escala con detalles arma la frase', () => {
  assert.deepEqual(validarValor(campo('efr.edema_godet'), '+++/++++', listas, { nivel: 'rodillas', lateralidad: 'bilateral' }), {
    ok: true,
    valor: 'Edema +++/++++ hasta rodillas, bilateral, con fóvea',
  });
});
await prueba('multi con escala: "Ninguno" se guarda como frase', () => {
  assert.deepEqual(validarValor(campo('efr.torax_agregados'), 'Ninguno', listas), { ok: true, valor: 'Sin ruidos agregados' });
});
await prueba('número con coma decimal', () => {
  assert.deepEqual(validarValor(campo('efg.temperatura'), '37,8', listas), { ok: true, valor: '37.8' });
});
await prueba('fecha dd/mm/aaaa → ISO', () => {
  assert.deepEqual(validarValor(campo('fil.fecha_ingreso'), '5/9/2026', listas), { ok: true, valor: '2026-09-05' });
});

console.log('Calculados');
await prueba('precedencia de operadores', () => {
  assert.equal(evaluar('2+3*4^2', {}), 50);
});
await prueba('IMC y Glasgow', () => {
  const r = recalcular(esquema, { 'efg.peso': '68', 'efg.talla': '1.52', 'efg.glasgow_ao': '4', 'efg.glasgow_rv': '5', 'efg.glasgow_rm': '6' });
  assert.equal(r['efg.imc'], '29.4');
  assert.equal(r['efg.glasgow_total'], '15');
});
await prueba('falta un dato → calculado vacío', () => {
  const r = recalcular(esquema, { 'efg.peso': '68', 'efg.imc': '20' });
  assert.equal(r['efg.imc'], '');
});

console.log('Teoría: escalas por campo, normales y redacción de síntomas');
await prueba('cada campo solo ofrece escalas que le corresponden', () => {
  assert.deepEqual(escalasDeCampo(campo('efr.cabeza'), listas), []);
  assert.ok(!escalasDeCampo(campo('efr.cabeza'), listas).includes('bristol'));
  assert.deepEqual(escalasDeCampo(campo('efr.mii'), listas), ['godet', 'pulsos', 'fuerza', 'rot']);
  assert.ok(escalasDeCampo(campo('ea.relato_cronologico'), listas).includes('eva'));
  assert.deepEqual(escalasDeCampo(campo('fb.heces_bristol'), listas), ['bristol']);
  for (const c of esquema) for (const e of reglaConValores(c, 'escalas') ?? []) assert.ok(listas.has(e), `${c.campo_id}: escala ${e} no existe`);
});
await prueba('todo valor_normal existe en su lista y se arma completo', () => {
  for (const c of esquema.filter((x) => x.valor_normal)) assert.ok(valorNormal(c, listas), `${c.campo_id} sin normal`);
  assert.equal(valorNormal(campo('efr.torax_mv'), listas), 'Murmullo vesicular conservado en ambos campos pulmonares');
  assert.equal(valorNormal(campo('efr.torax_agregados'), listas), 'Sin ruidos agregados');
  assert.equal(valorNormal(campo('efr.pulsos'), listas), 'Pulsos 2+/4+');
  assert.equal(valorNormal(campo('efr.fuerza'), listas), 'Fuerza muscular 5/5');
  assert.equal(valorNormal(campo('efg.glasgow_rm'), listas), '6');
  assert.equal(valorNormal(campo('efg.llenado_capilar'), listas), 'Menor de 2 segundos');
});
await prueba('todo campo con lista de frases o del constructor tiene sus listas', () => {
  for (const id of ['sintoma', 'localizacion', 'dolor_caracter', 'patron_sintoma', 'agravante', 'atenuante', 'respuesta_tto', 'llenado_capilar']) {
    assert.ok(listas.has(id), `falta la lista ${id}`);
  }
  assert.ok((listas.get('sintoma') ?? []).some((o) => o.valor === 'Lumbalgia' && /^dolor/i.test(o.etiqueta)));
});
await prueba('el constructor redacta el dolor con su semiología', () => {
  const f = redactarSintoma({
    sintoma: 'Lumbalgia',
    primero: true,
    tiempoValor: '3',
    tiempoUnidad: 'días',
    inicio: 'Insidioso',
    localizacion: 'la región lumbar',
    caracter: 'opresivo',
    intensidad: '6',
    irradiacion: ['la región dorsal'],
    agravantes: ['la flexión del tronco', 'la bipedestación'],
    atenuantes: ['el reposo'],
    acompanantes: ['Parestesias'],
    tratamiento: 'naproxeno 550 mg vía oral',
    respuesta: 'con mejoría parcial',
  });
  assert.equal(
    f,
    'Paciente refiere que hace 3 días, de inicio insidioso, presenta lumbalgia a nivel de la región lumbar, de carácter opresivo, de intensidad 6/10 en la escala visual análoga, que se irradia a la región dorsal, que se exacerba con la flexión del tronco y la bipedestación y cede con el reposo. Se acompaña de parestesias. Se automedica con naproxeno 550 mg vía oral, con mejoría parcial.',
  );
  assert.equal(
    redactarSintoma({ sintoma: 'Dolor abdominal', primero: false, tiempoValor: '1', tiempoUnidad: 'días', localizacion: 'el epigastrio', irradiacion: ['el hipocondrio derecho'] }),
    'Hace 1 día se agrega dolor abdominal a nivel del epigastrio, que se irradia al hipocondrio derecho.',
  );
});

console.log('Escritura completa (sin abreviaturas ni diminutivos)');
await prueba('las siglas se escriben completas', () => {
  assert.equal(
    expandirAbreviaturas('Edema en MID. HTA en tratamiento, paracetamol 500 mg c/8h. ROT conservados.'),
    'Edema en miembro inferior derecho. Hipertensión arterial en tratamiento, paracetamol 500 mg cada 8 horas. Reflejos osteotendinosos conservados.',
  );
  assert.equal(expandirAbreviaturas('Pte. refiere dolor desde hace aprox. 3 días. Fiebre de 12 hrs. Tos'), 'Paciente refiere dolor desde hace aproximadamente 3 días. Fiebre de 12 horas. Tos');
  assert.deepEqual(detectarAbreviaturas('Dolor en MII con FC alta'), ['MII', 'FC']);
  assert.deepEqual(detectarAbreviaturas('Midriasis, sin edema, pidió ayuda'), []);
});
await prueba('se detectan diminutivos sin marcar palabras normales', () => {
  assert.deepEqual(detectarDiminutivos('Tiene un dolorcito desde hace un ratito'), ['dolorcito', 'ratito']);
  assert.deepEqual(detectarDiminutivos('Refiere hormigueo en el tobillo y la rodilla'), []);
});
await prueba('ningún formato ni frase normal del catálogo trae siglas', () => {
  const conSiglas = opciones
    .flatMap((o) => [o.formato_salida, o.tipo === 'frase' ? o.valor : ''])
    .filter((t) => t && detectarAbreviaturas(t.replace(/\{[^}]+\}/g, '')).length > 0);
  assert.deepEqual(conSiglas, []);
  for (const c of esquema) assert.deepEqual(detectarAbreviaturas(c.label), [], `etiqueta de ${c.campo_id}`);
});
await prueba('los valores con formato antiguo se migran', () => {
  assert.equal(migrarValor('EVA 7/10'), 'Intensidad 7/10 en la escala visual análoga');
  assert.equal(migrarValor('Pulso 2+/4+'), 'Pulsos 2+/4+');
  assert.equal(migrarValor('Fuerza 4/5'), 'Fuerza muscular 4/5');
  assert.equal(migrarValor('Lúcido'), 'Lúcido');
  assert.deepEqual(migrarValores({ a: 'ROT 2+/4+', b: 'texto' }), { a: 'Reflejos osteotendinosos 2+/4+' });
});

console.log('Fechas');
await prueba('tiempo de enfermedad en la unidad que corresponde', () => {
  assert.deepEqual(tiempoEntre('2026-09-15T08:00', '2026-09-15T20:00'), { valor: '12', unidad: 'horas' });
  assert.deepEqual(tiempoEntre('2026-09-12', '2026-09-15T10:00'), { valor: '3', unidad: 'días' });
  assert.deepEqual(tiempoEntre('2026-08-01', '2026-09-05'), { valor: '5', unidad: 'semanas' });
  assert.deepEqual(tiempoEntre('2026-01-10', '2026-09-15'), { valor: '8', unidad: 'meses' });
  assert.deepEqual(tiempoEntre('2021-03-01', '2026-09-15'), { valor: '5', unidad: 'años' });
  assert.equal(tiempoEntre('2026-09-16', '2026-09-15'), null);
  const unidades = (listas.get('unidad_tiempo') ?? []).map((o) => o.valor);
  for (const u of ['horas', 'días', 'semanas', 'meses', 'años']) assert.ok(unidades.includes(u), u);
});
await prueba('edad en años cumplidos a la fecha de ingreso', () => {
  assert.equal(edadEnAnios('1971-09-20', '2026-09-15'), 54);
  assert.equal(edadEnAnios('1971-09-15', '2026-09-15'), 55);
  assert.equal(edadEnAnios('2030-01-01', '2026-09-15'), null);
});
await prueba('fecha con hora se conserva', () => {
  assert.deepEqual(validarValor(campo('fil.fecha_ingreso'), '2026-09-15T08:30', listas), { ok: true, valor: '2026-09-15T08:30' });
});

console.log('Guía de llenado (notas de Semiología)');
const guias = parsearGuias(readFileSync(join(RAIZ, 'seed/guias.csv'), 'utf8'));
await prueba('la guía carga, sin siglas y con ámbitos que existen', () => {
  assert.ok(guias.length > 500, `solo ${guias.length} entradas`);
  const idsYSecciones = new Set([...esquema.map((c) => c.campo_id), ...esquema.map((c) => c.seccion)]);
  const alcanzables = new Set([...idsYSecciones, ...esquema.flatMap((c) => ambitosDeCampo(c.campo_id))]);
  const huerfanos = [...new Set(guias.map((g) => g.ambito))].filter(
    (a) => !alcanzables.has(a) && !a.startsWith('s.') && !a.startsWith('ex.'),
  );
  assert.deepEqual(huerfanos, []);
  for (const a of new Set(guias.map((g) => g.ambito))) {
    if (a.startsWith('s.') || a.startsWith('ex.')) assert.ok(TITULO_AMBITO[a], `sin título: ${a}`);
  }
  const conSiglas = guias.filter((g) => g.tipo !== 'umbral' && /\b(?:MID|MII|MSD|MSI|HTA|EII|EIC|LMC|lpm|rpm|IMC|SatO2|ECG|EKG|TBC)\b/.test(g.texto));
  assert.deepEqual(conSiglas.map((g) => g.texto), []);
});
await prueba('cada síntoma del catálogo con guía propia la encuentra', () => {
  assert.equal(ambitoDeSintoma('Lumbalgia'), 's.dolor');
  assert.equal(ambitoDeSintoma('Cefalea'), 's.cefalea');
  assert.equal(ambitoDeSintoma('Disnea'), 's.disnea');
  assert.equal(ambitoDeSintoma('Hemoptisis'), 's.tos');
  assert.equal(ambitoDeSintoma('Epigastralgia'), 's.dolor_abdominal');
  assert.equal(ambitoDeSintoma('Vómitos'), 's.vomitos');
  assert.equal(ambitoDeSintoma('Tenesmo vesical'), 's.urinario');
  assert.equal(ambitoDeSintoma('Tenesmo'), 's.diarrea');
  assert.equal(ambitoDeSintoma('Orina espumosa'), 's.urinario');
  assert.equal(ambitoDeSintoma('Odinofagia'), 's.dolor');
  assert.equal(ambitoDeSintoma('Distensión abdominal'), null);
  assert.equal(ambitoDeSintoma('Cólico renal'), 's.dolor');
  for (const a of ['s.dolor', 's.cefalea', 's.disnea', 's.tos']) assert.ok(guias.some((g) => g.ambito === a && g.tipo === 'pregunta'), a);
});
await prueba('los signos vitales se interpretan sin solapes', () => {
  const u = umbrales(guias);
  assert.deepEqual(interpretar('efg.fc', '110', u), ['Taquicardia']);
  assert.deepEqual(interpretar('efg.fc', '100', u), ['Normal (adulto en reposo)']);
  assert.deepEqual(interpretar('efg.fc', '55', u), ['Bradicardia']);
  assert.deepEqual(interpretar('efg.fr', '24', u), ['Taquipnea']);
  assert.deepEqual(interpretar('efg.temperatura', '38,2', u), ['Fiebre moderada']);
  assert.deepEqual(interpretar('efg.temperatura', '37.5', u), ['Febrícula (fiebre leve)']);
  assert.deepEqual(interpretar('efg.temperatura', '37,2', u), ['Normal si es por la tarde (hasta 37,2 °C)']);
  assert.deepEqual(interpretar('efg.temperatura', '38.56', u), ['Fiebre elevada']);
  assert.deepEqual(interpretar('efg.temperatura', '37.04', u), ['Normal']);
  assert.deepEqual(interpretar('efg.pa_sistolica', '145', u), ['Hipertensión arterial grado I']);
  assert.deepEqual(interpretar('efg.pa_sistolica', '85', u), ['Hipotensión arterial']);
  assert.deepEqual(interpretar('efg.imc', '18.4', u), ['Entre bajo peso y normal (la nota 05c no clasifica de 18 a 18,9)']);
  assert.deepEqual(interpretar('efg.imc', '29.4', u), ['Obesidad']);
  assert.deepEqual(interpretar('efg.glasgow_total', '15', u), ['Normal']);
  assert.deepEqual(interpretar('efg.sato2', '', u), []);
  assert.deepEqual(interpretar('fil.edad', '40', u), []);
  // Sin huecos: todo entero de 30 a 220 cae en alguna categoría de frecuencia cardíaca y presión sistólica.
  for (let n = 30; n <= 220; n++) {
    assert.ok(interpretar('efg.fc', String(n), u).length === 1, `fc ${n}`);
    assert.ok(interpretar('efg.pa_sistolica', String(n), u).length >= 1, `pas ${n}`);
  }
  for (let t = 300; t <= 420; t++) assert.equal(interpretar('efg.temperatura', String(t / 10), u).length, 1, `temp ${t / 10}`);
});
await prueba('cada escala tiene semáforo en todos sus niveles', () => {
  for (const [id, lista] of listas) {
    if (lista[0].tipo !== 'escala') continue;
    assert.ok(GRAVEDAD[id], `la escala ${id} no tiene semáforo`);
    for (const o of lista) assert.notEqual(gravedadDe(id, o.valor), null, `${id} · ${o.valor} sin gravedad`);
  }
  for (const id of Object.keys(GRAVEDAD)) {
    const valores = (listas.get(id) ?? []).map((o) => o.valor);
    for (const v of Object.keys(GRAVEDAD[id])) assert.ok(valores.includes(v), `${id} · ${v} no existe en la lista`);
  }
  assert.equal(gravedadDeTexto(listas.get('pulsos'), 'Pulsos 1+/4+'), 2);
  assert.equal(gravedadDeTexto(listas.get('fuerza'), 'Fuerza muscular 5/5'), 0);
  assert.equal(gravedadDeTexto(listas.get('agregados'), 'Se auscultan crepitantes en ambas bases | Sin ruidos agregados'), 2);
  assert.equal(gravedadDeTexto(listas.get('eva'), 'Intensidad 8/10 en la escala visual análoga'), 3);
  assert.equal(gravedadDeTexto(listas.get('sexo'), 'Masculino'), null);
});
await prueba('cada umbral trae su nivel del semáforo', () => {
  const u = umbrales(guias);
  for (const g of guias.filter((x) => x.tipo === 'umbral' && !x.texto.startsWith('#'))) {
    const c = g.texto.split('|');
    assert.ok(c.length === 5 || c.length === 7, g.texto);
    assert.match(c[4], /^[0-3]$/, `umbral sin nivel: ${g.texto}`);
    assert.match(c[6] ?? '', /^(alta|baja|)$/, g.texto);
  }
  assert.deepEqual(interpretarConNivel('efg.fc', '110', u), [{ etiqueta: 'Taquicardia', nivel: 2 }]);
  assert.deepEqual(interpretarConNivel('efg.pa_sistolica', '185', u), [{ etiqueta: 'Hipertensión arterial grado III', nivel: 3 }]);
  assert.deepEqual(interpretarConNivel('efg.temperatura', '36.5', u), [{ etiqueta: 'Normal', nivel: 0 }]);
});
await prueba('las definiciones buscadas en las notas corresponden a opciones reales', () => {
  const defs = parsearCsv(readFileSync(join(RAIZ, 'seed/definiciones.csv'), 'utf8')).slice(1);
  assert.ok(defs.length > 400, `solo ${defs.length}`);
  const existe = new Set(opciones.map((o) => `${o.lista_id}|${o.valor}`));
  assert.deepEqual(defs.filter((d) => !existe.has(`${d[0]}|${d[1]}`)).map((d) => `${d[0]}|${d[1]}`), []);
  const conDef = new Set(defs.map((d) => `${d[0]}|${d[1]}`));
  // Las frases de la plantilla de Clínica Médica ya tienen su definición; las de la detallada están en camino.
  const listasFmh = new Set(esquema.filter((c) => c.plantilla === 'fmh' && c.lista_id).map((c) => c.lista_id));
  const frasesSin = opciones.filter(
    (o) => o.tipo === 'frase' && o.valor !== 'n' && listasFmh.has(o.lista_id) && !conDef.has(`${o.lista_id}|${o.valor}`),
  );
  assert.deepEqual(frasesSin.map((o) => `${o.lista_id}|${o.valor}`), [], 'hallazgos sin significado clínico');
  assert.deepEqual(defs.filter((d) => detectarAbreviaturas(d[2]).length).map((d) => d[2]), []);
});
await prueba('la guía de un ámbito compartido sale una sola vez', () => {
  const r = repartirAmbitos(['efg.glasgow_ao', 'efg.glasgow_rv', 'efg.glasgow_rm', 'efr.msd', 'efr.mid', 'efr.torax_mv', 'efr.torax_auscultacion']);
  assert.deepEqual(r.get('efg.glasgow_ao'), ['efg.glasgow']);
  assert.deepEqual(r.get('efg.glasgow_rv'), []);
  assert.deepEqual(r.get('efr.msd'), ['efr.extremidades']);
  assert.deepEqual(r.get('efr.mid'), []);
  assert.deepEqual(r.get('efr.torax_mv'), ['efr.torax_auscultacion']);
  assert.deepEqual(r.get('efr.torax_auscultacion'), []);
});

await prueba('la coma decimal no toca fechas ni versiones', () => {
  assert.equal(comaDecimal('Temperatura de 38.6 °C y creatinina 1.9 mg/dl.'), 'Temperatura de 38,6 °C y creatinina 1,9 mg/dl.');
  assert.equal(comaDecimal('El 16.09.2026 a las 10:00, versión 1.2.3; 15 200 por microlitro.'), 'El 16.09.2026 a las 10:00, versión 1.2.3; 15 200 por microlitro.');
  assert.equal(comaDecimal('Frecuencia 104. Luego 37.8.'), 'Frecuencia 104. Luego 37,8.');
});

await prueba('una fórmula con llaves arma texto, no un número', () => {
  const campos = [
    { campo_id: 'afi.gestaciones', seccion: 'ant_fisiologicos', orden: 10, label: 'Gestaciones', tipo: 'numero', obligatorio: false, lista_id: '', valor_normal: '', reglas: [], ayuda_kb: '', plantilla: 'ochoa', subtitulo: '' },
    { campo_id: 'afi.partos_termino', seccion: 'ant_fisiologicos', orden: 20, label: 'A término', tipo: 'numero', obligatorio: false, lista_id: '', valor_normal: '', reglas: [], ayuda_kb: '', plantilla: 'ochoa', subtitulo: '' },
    { campo_id: 'afi.formula_obstetrica', seccion: 'ant_fisiologicos', orden: 30, label: 'Fórmula obstétrica', tipo: 'calculado', obligatorio: false, lista_id: '', valor_normal: '', reglas: ['formula:G{gestaciones} P{partos_termino}'], ayuda_kb: '', plantilla: 'ochoa', subtitulo: '' },
  ] as Campo[];
  assert.deepEqual(recalcular(campos, { 'afi.gestaciones': '4', 'afi.partos_termino': '3' }), { 'afi.formula_obstetrica': 'G4 P3' });
  assert.deepEqual(recalcular(campos, {}), {});
});

console.log('Plantillas de historia clínica');
await prueba('la plantilla detallada está completa y es coherente', () => {
  const ochoa = esquema.filter((c) => c.plantilla === 'ochoa');
  if (ochoa.length === 0) return; // todavía sin armar
  assert.ok(ochoa.length > 250, `solo ${ochoa.length} campos`);
  const ids = new Set<string>();
  for (const c of ochoa) {
    assert.ok(!ids.has(c.campo_id), `campo repetido: ${c.campo_id}`);
    ids.add(c.campo_id);
    assert.ok(SECCIONES.some((s) => s.id === c.seccion), `${c.campo_id}: sección ${c.seccion}`);
    assert.deepEqual(detectarAbreviaturas(c.label), [], `${c.campo_id}: ${c.label}`);
    if (c.lista_id) assert.ok(listas.has(c.lista_id), `${c.campo_id}: falta la lista ${c.lista_id}`);
    if (c.valor_normal && c.lista_id) {
      const valores = (listas.get(c.lista_id) ?? []).map((o) => o.valor);
      assert.ok(valores.includes(c.valor_normal), `${c.campo_id}: «${c.valor_normal}» no está en ${c.lista_id}`);
    }
  }
  // Los datos se comparten: los campos que también existen en la otra plantilla guardan lo mismo.
  const fmh = new Map(esquema.filter((c) => c.plantilla === 'fmh').map((c) => [c.campo_id, c]));
  for (const c of ochoa) {
    const otro = fmh.get(c.campo_id);
    if (otro && otro.tipo !== c.tipo) {
      assert.ok(
        ['opcion_otro', 'texto', 'texto_largo', 'calculado'].includes(c.tipo),
        `${c.campo_id}: ${otro.tipo} en una plantilla y ${c.tipo} en la otra`,
      );
    }
  }
});
await prueba('el Word de la plantilla detallada sigue el documento', () => {
  const vistaOchoa = armarVista({ version: 'x', esquema, opciones, knowledge: [] }, 'ochoa');
  if (vistaOchoa.esquema.every((c) => c.plantilla !== 'ochoa')) return; // todavía sin armar
  const doc = armarDocumento({ dni: '40123456', episodio: 1, valores: { 'fil.apellidos': 'PRUEBA' } }, vistaOchoa, { vacios: 'lineas' });
  const titulos = doc.filter((e) => e.t === 'seccion').map((e) => e.texto);
  assert.ok(titulos.some((t) => t.includes('EXAMEN CLÍNICO')), titulos.join(' | '));
  // Sale como el documento: una rejilla por sección, con títulos de grupo y opciones para marcar.
  const formas = doc.filter((e) => e.t === 'forma');
  assert.ok(formas.length >= 10, `${formas.length} rejillas`);
  const filas = formas.flatMap((e) => e.filas);
  assert.ok(filas.some((f) => f.f === 'titulo' && /pupilas/i.test(f.texto)), 'sin títulos de grupo');
  const sexo = filas.find((f) => f.f === 'campo' && f.ref === 'fil.sexo');
  assert.ok(sexo && sexo.f === 'campo' && sexo.opciones?.map((o) => o.texto).join('/') === 'Masculino/Femenino', JSON.stringify(sexo));
  assert.ok(filas.every((f) => f.f === 'titulo' || vistaOchoa.porId.get(f.ref)?.plantilla !== 'fmh'), 'se coló un campo de la otra plantilla');
});

console.log('Rangos según la edad y la altitud');
await prueba('los cortes de edad salen de la guía y el contexto se calcula de la fecha de nacimiento', () => {
  const cortes = cortesDeGuia(guias);
  const lactante = contextoDe({ 'fil.fecha_nacimiento': '2026-03-01', 'fil.fecha_ingreso': '2026-09-15T08:00', 'fil.sexo': 'Femenino' }, 3827, cortes);
  assert.equal(lactante.grupo, 'lactante');
  assert.equal(lactante.sexo, 'F');
  assert.equal(contextoDe({ 'fil.edad': '4' }, 3827, cortes).grupo, 'preescolar');
  assert.equal(contextoDe({ 'fil.edad': '15' }, 3827, cortes).grupo, '');
  assert.equal(contextoDe({ 'fil.edad': '72', 'fil.sexo': 'Masculino' }, 3827, cortes).grupo, 'mayor');
});
await prueba('la misma cifra se interpreta distinto según la edad', () => {
  const u = umbrales(guias);
  const lactante = { grupo: 'lactante' as const, altitud: 3827 };
  assert.deepEqual(interpretar('efg.fc', '125', u, lactante), ['Normal para un lactante']);
  assert.deepEqual(interpretar('efg.fc', '125', u, { grupo: '', altitud: 3827 }), ['Taquicardia']);
  assert.deepEqual(interpretar('efg.fr', '30', u, lactante), ['Normal para un lactante']);
  // Sin rangos pediátricos de presión arterial: no se pinta con los del adulto.
  assert.deepEqual(interpretar('efg.pa_sistolica', '100', u, { grupo: 'escolar', altitud: 3827 }), []);
  assert.ok(interpretar('efg.temperatura', '37.5', u, { grupo: 'mayor', altitud: 3827 })[0].includes('anciano'));
});
await prueba('la saturación depende de la altitud', () => {
  const u = umbrales(guias);
  assert.deepEqual(interpretarConNivel('efg.sato2', '91', u, { grupo: '', altitud: 3827 }).map((x) => x.nivel), [0]);
  assert.deepEqual(interpretarConNivel('efg.sato2', '91', u, { grupo: '', altitud: 150 }).map((x) => x.nivel), [1]);
  assert.deepEqual(interpretarConNivel('efg.sato2', '78', u, { grupo: '', altitud: 3827 }).map((x) => x.nivel), [3]);
  for (let n = 50; n <= 100; n++) {
    assert.equal(interpretar('efg.sato2', String(n), u, { grupo: '', altitud: 3827 }).length, 1, `saturación ${n} en altura`);
    assert.equal(interpretar('efg.sato2', String(n), u, { grupo: '', altitud: 150 }).length, 1, `saturación ${n} a nivel del mar`);
  }
});

console.log('Laboratorio');
const lab = parsearLaboratorio(readFileSync(join(RAIZ, 'seed/laboratorio.csv'), 'utf8'));
await prueba('el catálogo reconoce abreviaturas y resuelve las ambiguas con el examen', () => {
  assert.ok(lab.length > 60);
  assert.equal(buscarParametro(lab, 'HGB')?.parametro, 'Hemoglobina');
  assert.equal(buscarParametro(lab, 'TGO')?.parametro, 'Transaminasa glutámico oxalacética');
  assert.equal(buscarParametro(lab, 'pH', 'orina')?.parametro, 'pH urinario');
  assert.equal(buscarParametro(lab, 'pH', 'gasometria')?.parametro, 'pH arterial');
  assert.equal(buscarParametro(lab, 'Leucocitos', 'orina')?.parametro, 'Leucocitos en orina');
  for (const x of lab) assert.deepEqual(detectarAbreviaturas(`${x.parametro} ${x.bajo} ${x.alto} ${x.alto2} ${x.bajo2}`), [], x.parametro);
});
await prueba('la hemoglobina se ajusta por altura y el sexo cambia el rango', () => {
  assert.equal(ajusteHemoglobina(3827), 2.7);
  assert.equal(ajusteHemoglobina(200), 0);
  const varonPuno = interpretarLab(lab, { parametro: 'Hemoglobina', valor: '14,5', unidad: 'g/dl' }, { sexo: 'M', grupo: '', altitud: 3827 });
  assert.equal(varonPuno?.etiqueta, 'Anemia', 'en Puno 14,5 ajustada es 11,8: anemia');
  assert.equal(interpretarLab(lab, { parametro: 'Hemoglobina', valor: '9', unidad: 'g/dl' }, { sexo: 'F', grupo: '', altitud: 3827 })?.nivel, 3);
  assert.equal(interpretarLab(lab, { parametro: 'Hemoglobina', valor: '15,5', unidad: 'g/dl' }, { sexo: 'F', grupo: '', altitud: 3827 })?.nivel, 0);
  const varonLima = interpretarLab(lab, { parametro: 'Hemoglobina', valor: '14,5', unidad: 'g/dl' }, { sexo: 'M', grupo: '', altitud: 150 });
  assert.equal(varonLima?.nivel, 0);
  assert.ok(varonPuno?.detalle.includes('ajustada por altura'));
});
await prueba('las unidades del informe se convierten y el rango del informe sirve de respaldo', () => {
  const leucos = interpretarLab(lab, { parametro: 'WBC', valor: '15,2', unidad: 'x10³/µL' }, { sexo: '', grupo: '', altitud: 3827 });
  assert.ok(leucos && leucos.nivel > 0 && /multiplic/.test(leucos.detalle));
  const glucosa = interpretarLab(lab, { parametro: 'Glucosa', valor: '132', unidad: 'mg/dl' });
  assert.ok(glucosa && glucosa.nivel >= 2, glucosa?.etiqueta);
  assert.deepEqual(rangoDeReferencia('< 0,04 ng/ml'), { min: null, max: 0.04 });
  assert.deepEqual(rangoDeReferencia('12 - 16'), { min: 12, max: 16 });
  const tropo = interpretarLab(lab, { parametro: 'Troponina I', valor: '0,3', unidad: 'ng/ml', referencia: '< 0,04' });
  assert.equal(tropo?.etiqueta, 'Por encima del rango del informe');
  const pao2 = interpretarLab(lab, { parametro: 'PaO2', valor: '62', unidad: 'mmHg' }, { sexo: '', grupo: '', altitud: 3827 });
  assert.equal(pao2?.nivel, 1, 'en altura una presión de oxígeno de 62 no es grave');
});

console.log('Síndromes compatibles');
const sindromes = parsearSindromes(readFileSync(join(RAIZ, 'seed/sindromes.json'), 'utf8'));
await prueba('los 87 síndromes cargan con criterios válidos y sin siglas', () => {
  assert.equal(sindromes.length, guias.filter((g) => g.tipo === 'sindrome').length);
  for (const s of sindromes) {
    assert.ok(s.criterios.length >= 4 && s.criterios.some((c) => c.cardinal), s.id);
    for (const c of s.criterios) {
      assert.deepEqual(detectarAbreviaturas(`${c.texto} ${c.explorar}`), [], `${s.id}: ${c.texto}`);
      for (const k of c.claves) assert.equal(k, k.toLowerCase(), `${s.id}: ${k}`);
    }
  }
});
await prueba('sugiere la condensación con sus hallazgos y dice qué falta', () => {
  const r = sugerirSindromes(sindromes, [
    { campo: 'ea.relato_cronologico', texto: 'Paciente refiere que hace 4 días presenta fiebre, tos con expectoración herrumbrosa y dolor pleurítico en hemitórax derecho.' },
    { campo: 'efr.torax_palpacion', texto: 'Vibraciones vocales aumentadas en base derecha.' },
    { campo: 'efr.torax_percusion', texto: 'Matidez en base derecha.' },
    { campo: 'efr.torax_auscultacion', texto: 'Se ausculta soplo tubárico en base derecha.' },
    { campo: 'efg.fc', texto: 'Taquicardia' },
  ]);
  const cond = r.find((x) => x.sindrome.id.includes('condensacion'));
  assert.ok(cond, `no apareció: ${r.map((x) => x.sindrome.id).join(', ')}`);
  assert.ok(r.indexOf(cond) <= 1, `quedó en el puesto ${r.indexOf(cond) + 1}`);
  assert.ok(cond.faltan.every((c) => c.explorar));
});
await prueba('lo negado no cuenta y «tos» no se confunde dentro de otra palabra', () => {
  const normal = sugerirSindromes(sindromes, [
    { campo: 'efr.ojos', texto: 'Movimientos oculares conservados.' },
    { campo: 'ea.relato_cronologico', texto: 'Niega fiebre. No presenta disnea ni tos.' },
  ]);
  assert.ok(!normal.some((x) => x.hallados.some((h) => /tos|fiebre|disnea/i.test(h.criterio.texto))), JSON.stringify(normal.map((x) => x.hallados.map((h) => h.criterio.texto))));
});

console.log('Seguimiento diario y resultados en la historia');
await prueba('las columnas de sistema validan su JSON', () => {
  const evo = escribirEvoluciones([{ id: 'e1', fecha: '2026-09-16T08:00', vitales: { fc: '110' }, subjetivo: 'Refiere menos disnea.', objetivo: '', analisis: '', plan: '', creado: '', actualizado: '' }]);
  assert.equal(validarSistema(CAMPO_EVOLUCIONES, evo), evo);
  assert.throws(() => validarSistema(CAMPO_EVOLUCIONES, '{no es json'));
  assert.throws(() => validarSistema(CAMPO_LABORATORIO, JSON.stringify([{ sin: 'datos' }])));
  assert.throws(() => validarSistema(CAMPO_EVOLUCIONES, JSON.stringify([{ id: 'x', fecha: 'x', vitales: {}, subjetivo: 'a'.repeat(50000) }])));
  assert.equal(diaHospitalizacion('2026-09-14T22:00', '2026-09-16T08:00'), 3);
});

console.log('Documento (Word y vista previa)');
const vista = armarVista({ version: 'semilla', esquema, opciones, knowledge: [] }, 'fmh');
await prueba('con líneas: sale toda la plantilla con etiquetas completas', () => {
  const doc = armarDocumento({ dni: '40123456', episodio: 1, valores: {} }, vista, { vacios: 'lineas' });
  const etiquetas = doc.flatMap((e) => (e.t === 'campo' || e.t === 'narrativa' || e.t === 'lista' ? [e.etiqueta] : []));
  for (const t of ['Escala de coma de Glasgow', 'Dolor (escala visual análoga)', 'Llenado capilar', 'Miembro inferior derecho']) {
    assert.ok(etiquetas.some((x) => x.startsWith(t)), `falta ${t}`);
  }
  const textos = doc.flatMap((e) => (e.t === 'pares' ? e.filas.flat().map((c) => c.etiqueta) : 'texto' in e ? [e.texto] : 'etiqueta' in e ? [e.etiqueta] : []));
  assert.deepEqual(textos.filter((t) => detectarAbreviaturas(t).length), []);
});
await prueba('solo lo registrado: sin vacíos ni títulos huérfanos', () => {
  const valores = { 'fil.apellidos': 'Quispe Mamani', 'fil.nombres': 'Rosa', 'efg.fc': '82', 'efr.mid': 'Sin edema' };
  const doc = armarDocumento({ dni: '40123456', episodio: 1, valores }, vista, { vacios: 'omitir' });
  assert.ok(doc.every((e) => e.t !== 'campo' || e.valor !== ''));
  const secciones = doc.filter((e) => e.t === 'seccion').map((e) => (e as { texto: string }).texto);
  assert.ok(secciones.length >= 2 && secciones.length <= 3, secciones.join(' / '));
  const pares = doc.find((e) => e.t === 'pares');
  assert.ok(pares && pares.t === 'pares' && pares.filas.flat().length === 1);
  assert.ok(doc.some((e) => e.t !== 'pares' && 'etiqueta' in e && e.etiqueta === 'Miembro inferior derecho'));
});
await prueba('el Word incluye el laboratorio y las evoluciones diarias en su lugar', () => {
  const valores = {
    'fil.fecha_ingreso': '2026-09-15T10:00',
    'exc.examenes': 'Hemograma solicitado.',
    'evo.evolucion': 'Evolución estacionaria.',
    [CAMPO_LABORATORIO]: escribirLaboratorio([
      { id: 'l1', fecha: '2026-09-15', examen: 'hemograma', parametro: 'Hemoglobina', valor: '10.2', unidad: 'g/dl', referencia: '12 - 16', nota: '', origen: 'foto' },
    ]),
    [CAMPO_EVOLUCIONES]: escribirEvoluciones([
      { id: 'e1', fecha: '2026-09-16T08:00', vitales: { fc: '104', temperatura: '38.1' }, subjetivo: 'Refiere menos tos.', objetivo: 'Crepitantes en base derecha.', analisis: 'Evolución favorable.', plan: 'Continuar antibiótico.', creado: '', actualizado: '' },
    ]),
  };
  const doc = armarDocumento({ dni: '40123456', episodio: 1, valores }, vista, { vacios: 'omitir', interpretarLab: () => 'Anemia' });
  const iExc = doc.findIndex((e) => 'ref' in e && e.ref === 'exc.examenes');
  const tabla = doc[iExc + 1];
  assert.ok(tabla.t === 'tabla' && tabla.filas[0].includes('10,2 g/dl') && tabla.filas[0].includes('Anemia'), JSON.stringify(tabla));
  const iEvo = doc.findIndex((e) => 'ref' in e && e.ref === 'evo.evolucion');
  assert.ok(doc[iEvo + 1].t === 'sub');
  assert.ok(doc.some((e) => e.t === 'sub' && e.texto.includes('día 2 de hospitalización')));
  assert.ok(doc.some((e) => e.t === 'campo' && e.etiqueta === 'Signos vitales' && e.valor.includes('Temperatura: 38,1 °C')));
});

// ---------- Backend ----------

console.log('Backend (Apps Script simulado)');
execSync('node build.mjs', { cwd: join(RAIZ, 'backend'), stdio: 'ignore' });
const codigo = readFileSync(join(RAIZ, 'backend/dist/Code.js'), 'utf8');

let respuestaOrganizar: unknown = {};
const gemini = (p: PeticionHttp) => {
  const entrada = p.cuerpo.input as { type: string; text?: string }[];
  const esquemaSalida = (p.cuerpo.response_format as { schema?: { properties?: Record<string, unknown> } } | undefined)?.schema;
  let texto: string;
  if (entrada.some((x) => x.type === 'audio')) texto = 'señora de 55 años, hinchazón de piernas hace seis meses';
  else if (entrada.some((x) => x.type === 'image'))
    texto = JSON.stringify({
      fecha: '2026-09-15',
      resultados: [
        { examen: 'hemograma', parametro: 'HGB', valor: '10,5', unidad: 'g/dl', referencia: '12 - 16', nota: 'L' },
        { examen: 'renal', parametro: 'Crea', valor: '1,8', unidad: 'mg/dl', referencia: '0,6 - 1,4', nota: 'H' },
      ],
      advertencias: [],
    });
  else if (esquemaSalida?.properties?.soap)
    texto = JSON.stringify({ texto: 'Evolución favorable', soap: { subjetivo: 'Refiere menos disnea.', objetivo: 'FC 96 latidos por minuto, temperatura 37.8 °C.', analisis: 'Evolución favorable.', plan: '' } });
  else if (esquemaSalida?.properties?.texto) texto = JSON.stringify({ texto: 'Paciente mujer de 55 años, con tiempo de enfermedad de seis meses…' });
  else if (esquemaSalida?.properties?.faltantes)
    texto = JSON.stringify({
      faltantes: [{ campo: 'ea.relato_cronologico', motivo: 'Falta la irradiación' }],
      incoherencias: [],
      redaccion: [{ campo: 'efr.columna', observacion: 'Coloquial', sugerido: 'Dolor a la palpación de apófisis espinosas lumbares.' }],
    });
  else if (esquemaSalida) texto = JSON.stringify(respuestaOrganizar);
  else texto = 'listo';
  return {
    codigo: 200,
    cuerpo: { status: 'completed', steps: [{ type: 'thought' }, { type: 'model_output', content: [{ type: 'text', text: texto }] }] },
  };
};

const env = crearEntorno({ estricto: true, gemini });
const ctx = vm.createContext({ ...env.globales });
vm.runInContext(codigo, ctx);
const gas = ctx as unknown as Record<string, (...a: unknown[]) => unknown>;

gas.setup();
const lineaAcceso = env.logs.find((l) => l.startsWith('ACCESO')) ?? '';
const claveTemporal = /Contraseña temporal: (\S+)/.exec(lineaAcceso)?.[1] ?? '';
env.props.set('API_KEY_GEMINI', 'clave-de-prueba');
let token = '';

function post<T>(action: string, payload: unknown, opId?: string, tk = token): Respuesta<T> {
  const salida = gas.doPost({ postData: { contents: JSON.stringify({ action, token: tk, opId, payload }) } }) as { getContent(): string };
  return JSON.parse(salida.getContent()) as Respuesta<T>;
}
function ok<T>(r: Respuesta<T>): T {
  if (!r.ok) throw new Error(`${r.codigo}: ${r.error}`);
  return r.data;
}

const libro = [...env.libros.values()][0];
const hoja = (n: string) => libro.getSheetByName(n)!;

await prueba('setup crea las 5 hojas e importa semillas', () => {
  assert.deepEqual(libro.hojas.map((h) => h.nombre).sort(), ['Esquema', 'HC', 'Knowledge', 'Opciones', 'Registro']);
  assert.equal(hoja('Esquema').getLastRow(), 1 + esquema.length);
  assert.equal(hoja('Opciones').getLastRow(), parsearCsv(readFileSync(join(RAIZ, 'seed/opciones.csv'), 'utf8')).length);
  assert.equal(hoja('HC').getLastColumn(), COLUMNAS_CONTROL.length + new Set(esquema.map((c) => c.campo_id)).size + CAMPOS_SISTEMA.length);
});

console.log('Acceso con usuario y contraseña');
await prueba('setup crea usuario admin y contraseña temporal', () => {
  assert.equal(env.props.get('USUARIO'), 'admin');
  assert.ok(claveTemporal.length >= 8);
  assert.equal(env.props.get('CLAVE_INICIAL'), claveTemporal);
});
await prueba('sin sesión → auth', () => {
  const r = post('ping', {}, undefined, '');
  assert.equal(!r.ok && r.codigo, 'auth');
});
await prueba('contraseña incorrecta → credenciales', () => {
  const r = post('auth.login', { usuario: 'admin', clave: 'mala' }, undefined, '');
  assert.equal(!r.ok && r.codigo, 'credenciales');
});
await prueba('ingreso con la temporal: la guarda con hash y da sesión', () => {
  const r = ok(post<{ token: string; usuario: string }>('auth.login', { usuario: ' ADMIN ', clave: claveTemporal }, undefined, ''));
  token = r.token;
  assert.equal(r.usuario, 'admin');
  assert.ok(token.length >= 32);
  assert.equal(env.props.get('CLAVE_INICIAL'), undefined);
  assert.ok(env.props.get('CLAVE_HASH')?.includes(':'));
  assert.ok(!env.props.get('CLAVE_HASH')?.includes(claveTemporal));
  assert.ok(!(env.props.get('SESIONES') ?? '').includes(token), 'la sesión se guarda con hash');
});
await prueba('la misma contraseña sigue sirviendo (ya con hash)', () => {
  assert.equal(post('auth.login', { usuario: 'admin', clave: claveTemporal }, undefined, '').ok, true);
});
await prueba('cambiar usuario y contraseña cierra las otras sesiones', () => {
  const otra = ok(post<{ token: string }>('auth.login', { usuario: 'admin', clave: claveTemporal }, undefined, '')).token;
  const malo = post('auth.cambiar', { clave_actual: 'x', clave_nueva: 'nueva123' });
  assert.equal(!malo.ok && malo.codigo, 'credenciales');
  const corta = post('auth.cambiar', { clave_actual: claveTemporal, clave_nueva: '123' });
  assert.equal(corta.ok, false);
  const r = ok(post<{ usuario: string }>('auth.cambiar', { clave_actual: claveTemporal, clave_nueva: 'rosa.2026', usuario_nuevo: 'canaza' }));
  assert.equal(r.usuario, 'canaza');
  assert.equal(post('ping', {}).ok, true, 'la sesión actual sigue');
  assert.equal(post('ping', {}, undefined, otra).ok, false, 'la otra se cerró');
  assert.equal(post('auth.login', { usuario: 'admin', clave: 'rosa.2026' }, undefined, '').ok, false);
  env.cache.clear();
  assert.equal(post('auth.login', { usuario: 'canaza', clave: 'rosa.2026' }, undefined, '').ok, true);
});
await prueba('cerrar sesión invalida el token', () => {
  const t = ok(post<{ token: string }>('auth.login', { usuario: 'canaza', clave: 'rosa.2026' }, undefined, '')).token;
  assert.equal(ok(post<{ ok: boolean }>('auth.salir', {}, undefined, t)).ok, true);
  assert.equal(post('ping', {}, undefined, t).ok, false);
});
await prueba('cinco intentos fallidos bloquean el ingreso', () => {
  env.cache.clear();
  for (let i = 0; i < 5; i++) post('auth.login', { usuario: 'canaza', clave: `mal${i}` }, undefined, '');
  const r = post('auth.login', { usuario: 'canaza', clave: 'rosa.2026' }, undefined, '');
  assert.equal(!r.ok && r.codigo, 'bloqueado');
  env.cache.clear();
});
await prueba('restablecerClave da una temporal y cierra todas las sesiones', () => {
  const t = ok(post<{ token: string }>('auth.login', { usuario: 'canaza', clave: 'rosa.2026' }, undefined, '')).token;
  gas.restablecerClave();
  const temporal = /Contraseña temporal: (\S+)/.exec(env.logs.at(-2) ?? '')?.[1] ?? '';
  assert.equal(post('ping', {}, undefined, t).ok, false);
  token = ok(post<{ token: string }>('auth.login', { usuario: 'canaza', clave: temporal }, undefined, '')).token;
  assert.equal(post('ping', {}).ok, true);
});
await prueba('una sesión vencida no sirve', () => {
  const sesiones = JSON.parse(env.props.get('SESIONES') ?? '[]') as { h: string; exp: number }[];
  env.props.set('SESIONES', JSON.stringify(sesiones.map((s) => ({ ...s, exp: Date.now() - 1 }))));
  assert.equal(post('ping', {}).ok, false);
  token = ok(post<{ token: string }>('auth.login', { usuario: 'canaza', clave: /Contraseña temporal: (\S+)/.exec(env.logs.at(-2) ?? '')?.[1] ?? '' }, undefined, '')).token;
  assert.equal(post('ping', {}).ok, true);
});

console.log('Historias');
await prueba('valores que empiezan con + no se vuelven fórmula', () => {
  const godet = hoja('Opciones').datos.find((f) => f[0] === 'godet');
  assert.equal(godet?.[4], '+/++++');
});
await prueba('token inventado → auth', () => {
  const r = post('ping', {}, undefined, 'otro-token-que-no-existe-en-sesiones');
  assert.equal(!r.ok && r.codigo, 'auth');
});
await prueba('ping', () => {
  const r = ok(post<{ gemini: boolean; modelo: string }>('ping', {}));
  assert.equal(r.gemini, true);
  assert.equal(r.modelo, 'gemini-3.8-flash');
});

let version = '';
await prueba('catalogos.get completo y luego sin cambios', () => {
  const c = ok(post<{ version: string; esquema: unknown[] }>('catalogos.get', {}));
  assert.equal(c.esquema.length, esquema.length);
  version = c.version;
  const s = ok(post<{ sinCambios?: boolean }>('catalogos.get', { desde: version }));
  assert.equal(s.sinCambios, true);
});

await prueba('hc.crear asigna episodios 1 y 2', () => {
  const a = ok(post<{ fila: { episodio: number; version: number; valores: Record<string, string> } }>('hc.crear', { dni: '40123456', valores: { 'fil.nombres': 'Rosa', 'fil.sexo': 'femenino' } }, 'op-crear-1'));
  assert.equal(a.fila.episodio, 1);
  assert.equal(a.fila.valores['fil.sexo'], 'Femenino');
  assert.equal(a.fila.valores['fil.dni'], '40123456');
  const b = ok(post<{ fila: { episodio: number } }>('hc.crear', { dni: '40123456' }, 'op-crear-2'));
  assert.equal(b.fila.episodio, 2);
});
await prueba('opId repetido no duplica', () => {
  const b = ok(post<{ fila: { episodio: number } }>('hc.crear', { dni: '40123456' }, 'op-crear-2'));
  assert.equal(b.fila.episodio, 2);
  assert.equal(hoja('HC').getLastRow(), 3);
});

await prueba('hc.guardar escribe y sube la versión', () => {
  const r = ok(
    post<{ fila: { version: number; valores: Record<string, string> }; conflictos: unknown[] }>(
      'hc.guardar',
      {
        dni: '40123456',
        episodio: 1,
        version: 1,
        campos: [
          { id: 'efr.edema_godet', valor: '++/++++ hasta rodillas', base: '' },
          { id: 'fil.apellidos', valor: 'Quispe Mamani', base: '' },
          { id: 'ea.relato_cronologico', valor: '=Paciente refiere', base: '' },
        ],
        completitud: 40,
      },
      'op-g1',
    ),
  );
  assert.equal(r.fila.version, 2);
  assert.equal(r.conflictos.length, 0);
  assert.equal(r.fila.valores['efr.edema_godet'], '++/++++ hasta rodillas');
  assert.equal(r.fila.valores['ea.relato_cronologico'], '=Paciente refiere');
});
await prueba('mismo opId devuelve lo guardado sin reescribir', () => {
  const r = ok(post<{ fila: { version: number } }>('hc.guardar', { dni: '40123456', episodio: 1, version: 1, campos: [] }, 'op-g1'));
  assert.equal(r.fila.version, 2);
});
await prueba('base desactualizada → conflicto, el resto se guarda', () => {
  const r = ok(
    post<{ fila: { valores: Record<string, string> }; conflictos: { id: string; servidor: string }[] }>(
      'hc.guardar',
      {
        dni: '40123456',
        episodio: 1,
        version: 1,
        campos: [
          { id: 'fil.apellidos', valor: 'Quispe', base: '' },
          { id: 'fil.edad', valor: '55', base: '' },
        ],
      },
      'op-g2',
    ),
  );
  assert.deepEqual(r.conflictos, [{ id: 'fil.apellidos', servidor: 'Quispe Mamani', enviado: 'Quispe' }]);
  assert.equal(r.fila.valores['fil.apellidos'], 'Quispe Mamani');
  assert.equal(r.fila.valores['fil.edad'], '55');
});
await prueba('campo desconocido se rechaza', () => {
  const r = post('hc.guardar', { dni: '40123456', episodio: 1, version: 1, campos: [{ id: 'fil.inventado', valor: 'x', base: '' }] });
  assert.equal(r.ok, false);
});
await prueba('historia creada sin señal se crea al guardar (lote)', () => {
  const r = ok(
    post<{ resultados: { ok: boolean; data?: { fila: { episodio: number; version: number } } }[] }>('sync.lote', {
      ops: [{ action: 'hc.guardar', opId: 'op-l1', payload: { dni: '70000001', episodio: 1, version: 0, campos: [{ id: 'fil.nombres', valor: 'Juan', base: '' }] } }],
    }),
  );
  assert.equal(r.resultados[0].ok, true);
  assert.equal(r.resultados[0].data?.fila.version, 1);
});
await prueba('hc.get y hc.list', () => {
  const g = ok(post<{ fila: { valores: Record<string, string> } }>('hc.get', { dni: '70000001', episodio: 1 }));
  assert.equal(g.fila.valores['fil.nombres'], 'Juan');
  const l = ok(post<{ filas: { dni: string }[] }>('hc.list', {}));
  assert.equal(l.filas.length, 3);
});

await prueba('organizar: valida contra listas, arma escalas, suma multi y detecta conflictos', () => {
  respuestaOrganizar = {
    campos: [
      { id: 'ea.forma_inicio', valor: 'insidioso', confianza: 0.95 },
      { id: 'ea.curso', valor: 'lentito', confianza: 0.4 },
      { id: 'ea.tiempo_valor', valor: '6', confianza: 1 },
      { id: 'ea.tiempo_unidad', valor: 'meses', confianza: 1 },
      { id: 'ea.sintoma_guia', valor: 'Edema', confianza: 0.9 },
      { id: 'ea.signos_sintomas', valor: 'hinchazón de piernas', confianza: 1 },
      { id: 'ea.relato_cronologico', valor: 'Paciente refiere que hace seis meses presenta edema en miembros inferiores.', confianza: 0.9 },
      { id: 'fil.edad', valor: '55', confianza: 1 },
    ],
    dudas: [{ pregunta: '¿Tiene ortopnea?', campo: 'ea.relato_cronologico' }],
    escalas_sugeridas: [
      { campo: 'ea.relato_cronologico', lista_id: 'eva', razon: 'Cuantificar el dolor' },
      { campo: 'ea.relato_cronologico', lista_id: 'godet', razon: 'No corresponde al relato' },
    ],
    conflictos: [],
  };
  const r = ok(
    post<{
      campos: { id: string; valor: string }[];
      dudas: { id: string; pregunta: string }[];
      descartados: { campo: string }[];
      conflictos: { campo: string }[];
      escalas_sugeridas: unknown[];
    }>(
      'entrada.organizar',
      {
        texto: 'señora de 55, hinchazón de piernas hace 6 meses, empezó de a poquitos',
        origen: 'voz',
        dni: '40123456',
        episodio: 1,
        seccion: 'enfermedad_actual',
        contexto: { 'ea.sintoma_guia': 'Disnea', 'ea.signos_sintomas': 'me falta el aire', 'fil.sexo': 'Femenino' },
      },
      'op-org-1',
    ),
  );
  const ids = r.campos.map((c) => c.id);
  assert.ok(ids.includes('ea.forma_inicio'));
  assert.equal(r.campos.find((c) => c.id === 'ea.forma_inicio')?.valor, 'Insidioso');
  assert.ok(!ids.includes('ea.curso'), 'valor fuera de lista descartado');
  assert.ok(!ids.includes('fil.edad'), 'campo de otra sección descartado');
  assert.deepEqual(r.conflictos.map((c) => c.campo), ['ea.sintoma_guia']);
  assert.equal(r.campos.find((c) => c.id === 'ea.signos_sintomas')?.valor, 'me falta el aire | hinchazón de piernas');
  assert.ok(r.dudas.length >= 2, 'duda de Gemini + duda por valor descartado');
  assert.ok(r.dudas.every((d) => d.id));
  assert.deepEqual(
    r.escalas_sugeridas.map((e) => (e as { lista_id: string }).lista_id),
    ['eva'],
    'godet no corresponde al relato y se descarta',
  );
  const registro = hoja('Registro').datos.map((f) => f[1]);
  assert.ok(registro.includes('entrada'));
  assert.ok(registro.includes('duda'));
});
await prueba('el prompt lleva reglas, glosario, listas y contexto, y pide store=false', () => {
  const p = env.llamadasGemini.at(-1)!;
  const texto = (p.cuerpo.input as { text: string }[])[0].text;
  const sistema = String(p.cuerpo.system_instruction);
  assert.equal(p.cuerpo.store, false);
  assert.equal(p.cuerpo.model, 'gemini-3.8-flash');
  assert.ok(sistema.includes('lumbalgia'));
  assert.ok(sistema.includes('NO INVENTES') || sistema.includes('No inventes'));
  assert.ok(texto.includes('forma_inicio (opcion): Brusco | Súbito | Insidioso'));
  assert.ok(texto.includes('ea.sintoma_guia (Síntoma guía): Disnea'));
  assert.ok(!('temperature' in (p.cuerpo.generation_config as object)));
});
await prueba('el prompt dice dónde va cada dato y cómo se escriben los síntomas principales', () => {
  ok(post('entrada.organizar', { texto: 'fiebre hace 4 días', origen: 'texto', dni: '40123456', episodio: 1, seccion: '*', contexto: {} }, randomUUID()));
  const p = env.llamadasGemini.at(-1)!;
  const sistema = JSON.stringify(p.cuerpo.instructions ?? p.cuerpo.system ?? '') + JSON.stringify(p.cuerpo.input);
  assert.match(sistema, /DÓNDE VA CADA DATO/);
  assert.match(sistema, /cada dato va en UNA sola sección/i);
  assert.match(sistema, /Fiebre intermitente de hasta 39/);
  assert.ok(!/palabras del paciente, sin tecnicismos/.test(sistema.split('ea.signos_sintomas')[1] ?? ''), 'el campo ya no pide las palabras del paciente');
});
await prueba('organizar escala con detalles en examen físico', () => {
  // Con la plantilla de Clínica Médica, que tiene el campo de edema con la escala de godet.
  respuestaOrganizar = {
    campos: [
      { id: 'efr.edema_godet', valor: '++/++++', confianza: 0.8, detalles: [{ clave: 'nivel', valor: 'tercio medio de piernas' }, { clave: 'lateralidad', valor: 'bilateral' }] },
      { id: 'efr.torax_agregados', valor: 'Crepitantes', confianza: 0.8, detalles: [{ clave: 'localizacion', valor: 'ambas bases' }] },
      { id: 'efr.pulsos', valor: '2+', confianza: 0.9 },
    ],
    dudas: [],
    escalas_sugeridas: [],
    conflictos: [],
  };
  const r = ok(
    post<{ campos: { id: string; valor: string }[] }>('entrada.organizar', {
      texto: 'edema dos cruces hasta media pierna ambos lados, crepitantes en ambas bases',
      origen: 'texto',
      dni: '40123456',
      episodio: 1,
      plantilla: 'fmh',
      seccion: 'ef_regiones',
      contexto: {},
    }),
  );
  const v = Object.fromEntries(r.campos.map((c) => [c.id, c.valor]));
  assert.equal(v['efr.edema_godet'], 'Edema ++/++++ hasta tercio medio de piernas, bilateral, con fóvea');
  assert.equal(v['efr.torax_agregados'], 'Se auscultan crepitantes en ambas bases');
  assert.equal(v['efr.pulsos'], 'Pulsos 2+/4+');
});
await prueba('cada historia guarda su plantilla y por defecto usa la detallada', () => {
  const a = ok(post<{ fila: { plantilla: string; episodio: number } }>('hc.crear', { dni: '40123456' }, 'op-crear-plantilla-1'));
  assert.equal(a.fila.plantilla, PLANTILLA_POR_DEFECTO);
  const b = ok(post<{ fila: { plantilla: string; episodio: number } }>('hc.crear', { dni: '40123456', plantilla: 'fmh' }, 'op-crear-plantilla-2'));
  assert.equal(b.fila.plantilla, 'fmh');
  const c = ok(post<{ fila: { plantilla: string } }>('hc.get', { dni: '40123456', episodio: b.fila.episodio }));
  assert.equal(c.fila.plantilla, 'fmh');
  const lista = ok(post<{ filas: { episodio: number; plantilla: string }[] }>('hc.list', {}));
  assert.equal(lista.filas.find((f) => f.episodio === b.fila.episodio)?.plantilla, 'fmh');
  const inventada = ok(post<{ fila: { plantilla: string } }>('hc.crear', { dni: '40123456', plantilla: 'inventada' }, 'op-crear-plantilla-3'));
  assert.equal(inventada.fila.plantilla, PLANTILLA_POR_DEFECTO, 'una plantilla desconocida cae en la de siempre');
  // Historias de antes de que hubiera dos plantillas: la columna está vacía y son de Clínica Médica.
  const hc = hoja('HC');
  const col = hc.getRange(1, 1, 1, hc.getLastColumn()).getDisplayValues()[0].indexOf('plantilla') + 1;
  const antes = hc.getRange(2, col, 1, 1).getDisplayValues()[0][0];
  hc.getRange(2, col, 1, 1).setValues([['']]);
  const cab = hc.getRange(1, 1, 1, hc.getLastColumn()).getDisplayValues()[0];
  const fila2 = hc.getRange(2, 1, 1, hc.getLastColumn()).getDisplayValues()[0];
  const dni2 = fila2[cab.indexOf('dni')];
  const ep2 = Number(fila2[cab.indexOf('episodio')]);
  const vieja = ok(post<{ filas: { dni: string; episodio: number; plantilla: string }[] }>('hc.list', {}));
  assert.equal(vieja.filas.find((f) => f.dni === dni2 && f.episodio === ep2)?.plantilla, 'fmh');
  hc.getRange(2, col, 1, 1).setValues([[antes]]);
});
await prueba('el formulario solo muestra los campos de su plantilla', () => {
  const soloFmh = armarVista({ version: 'x', esquema, opciones, knowledge: [] }, 'fmh');
  assert.equal(soloFmh.plantilla, 'fmh');
  assert.ok(soloFmh.esquema.every((c) => c.plantilla === 'fmh'));
  assert.equal(soloFmh.esquema.length, esquema.filter((c) => c.plantilla === 'fmh').length);
  assert.ok(soloFmh.porId.has('ea.relato_cronologico'));
});
await prueba('guarda evoluciones y laboratorio como columnas de sistema y rechaza JSON dañado', () => {
  const evo = escribirEvoluciones([{ id: 'e1', fecha: '2026-09-16T08:00', vitales: { fc: '110' }, subjetivo: '', objetivo: '', analisis: '', plan: '', creado: '', actualizado: '' }]);
  const r = ok(
    post<{ fila: { valores: Record<string, string> } }>('hc.guardar', {
      dni: '40123456',
      episodio: 1,
      version: 0,
      campos: [{ id: CAMPO_EVOLUCIONES, valor: evo, base: '' }],
    }),
  );
  assert.equal(r.fila.valores[CAMPO_EVOLUCIONES], evo);
  const mal = post('hc.guardar', { dni: '40123456', episodio: 1, version: 0, campos: [{ id: CAMPO_LABORATORIO, valor: '[{"x":1}]', base: '' }] });
  assert.ok(!mal.ok && mal.codigo === 'payload');
});
await prueba('lee la foto del informe, guarda la imagen y usa los nombres completos', () => {
  const antes = env.archivosDrive.length;
  const r = ok(
    post<{ fecha: string; resultados: { parametro: string; examen: string }[] }>('entrada.laboratorio', {
      dni: '40123456',
      episodio: 1,
      imagenBase64: Buffer.from('foto falsa').toString('base64'),
      mime: 'image/jpeg',
    }),
  );
  assert.equal(r.fecha, '2026-09-15');
  assert.deepEqual(r.resultados.map((x) => x.parametro), ['Hemoglobina', 'Creatinina']);
  assert.equal(env.archivosDrive.length, antes + 1);
  assert.ok(env.archivosDrive[env.archivosDrive.length - 1].nombre.includes('laboratorio'));
  const malo = post('entrada.laboratorio', { dni: '40123456', episodio: 1, imagenBase64: 'eA==', mime: 'application/pdf' });
  assert.ok(!malo.ok);
});
await prueba('redacta la presentación y la evolución del día en SOAP', () => {
  const p = ok(post<{ texto: string; soap: unknown }>('entrada.redactar', { dni: '40123456', episodio: 1, tipo: 'presentacion', valores: { 'fil.edad': '55' }, extra: {} }));
  assert.ok(p.texto.startsWith('Paciente mujer') && p.soap === null);
  const e = ok(post<{ soap: { subjetivo: string; objetivo: string } }>('entrada.redactar', { dni: '40123456', episodio: 1, tipo: 'evolucion', valores: {}, extra: { notas: 'menos disnea' } }));
  assert.equal(e.soap.subjetivo, 'Refiere menos disnea.');
  assert.equal(e.soap.objetivo, 'Frecuencia cardíaca 96 latidos por minuto, temperatura 37,8 °C.');
  assert.ok(!post('entrada.redactar', { dni: '40123456', episodio: 1, tipo: 'otro', valores: {}, extra: {} }).ok);
});
await prueba('las decisiones de la revisión se guardan una por punto', () => {
  ok(post('revision.decidir', { decisiones: [{ punto: '03-4', decision: 'consultar_docente', comentario: 'Preguntar niveles de conciencia', fecha: '2026-09-16T10:00:00Z' }] }));
  ok(post('revision.decidir', { decisiones: [{ punto: '03-4', decision: 'seguir_nota', comentario: 'El docente dijo que se siga 05a', fecha: '2026-09-16T11:00:00Z' }] }));
  const r = ok(post<{ decisiones: { punto: string; decision: string; comentario: string }[] }>('revision.listar', {}));
  const d = r.decisiones.filter((x) => x.punto === '03-4');
  assert.equal(d.length, 1);
  assert.equal(d[0].decision, 'seguir_nota');
  assert.ok(!post('revision.decidir', { decisiones: [{ punto: 'x', decision: 'otra', comentario: '', fecha: '' }] }).ok);
});
await prueba('transcribir guarda el audio y registra la transcripción', () => {
  const r = ok(
    post<{ transcripcion: string; drive_file_id: string }>('entrada.transcribir', {
      audioBase64: Buffer.from('audio falso').toString('base64'),
      mime: 'audio/webm;codecs=opus',
      dni: '40123456',
      episodio: 1,
      seccion: 'enfermedad_actual',
    }),
  );
  assert.ok(r.transcripcion.includes('hinchazón'));
  const audios = env.archivosDrive.filter((a) => a.nombre.includes('enfermedad_actual'));
  assert.equal(audios.length, 1);
  assert.ok(audios[0].nombre.endsWith('.webm'));
  const p = env.llamadasGemini.at(-1)!;
  const audio = (p.cuerpo.input as { type: string; mime_type?: string }[]).find((x) => x.type === 'audio');
  assert.equal(audio?.mime_type, 'audio/webm');
});
await prueba('hc.revisar filtra sugerencias a campos con texto', () => {
  const r = ok(
    post<{ faltantes: unknown[]; redaccion: unknown[] }>('hc.revisar', {
      dni: '40123456',
      episodio: 1,
      valores: { 'efr.columna': 'le duele la espalda al tocarle', 'fil.sexo': 'Femenino' },
    }),
  );
  assert.equal(r.faltantes.length, 1);
  assert.equal(r.redaccion.length, 1);
});
await prueba('Gemini con formato inválido se reintenta y luego falla limpio', () => {
  respuestaOrganizar = { campos: 'no es lista' };
  const antes = env.llamadasGemini.length;
  const r = post('entrada.organizar', { texto: 'x', origen: 'texto', dni: '40123456', episodio: 1, seccion: 'enfermedad_actual', contexto: {} });
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.codigo, 'gemini_formato');
  assert.equal(env.llamadasGemini.length - antes, 2);
});
await prueba('dudas resueltas se marcan en Registro y hc.get las devuelve', () => {
  const g = ok(post<{ dudas: { id: string; estado: string }[] }>('hc.get', { dni: '40123456', episodio: 1 }));
  assert.ok(g.dudas.length >= 2);
  const id = g.dudas[0].id;
  ok(post('hc.guardar', { dni: '40123456', episodio: 1, version: 3, campos: [], dudas_resueltas: [id] }, 'op-dudas'));
  const g2 = ok(post<{ dudas: { id: string; estado: string }[] }>('hc.get', { dni: '40123456', episodio: 1 }));
  assert.equal(g2.dudas.find((d) => d.id === id)?.estado, 'resuelta');
});
await prueba('kb.cargar llena Knowledge y cambia la versión del catálogo', () => {
  const objetos = Array.from({ length: 40 }, (_, i) => ({
    id: `kb.relato.02a.${i + 1}`,
    seccion: 'enfermedad_actual',
    titulo: `Historia clínica y anamnesis · fragmento ${i + 1}`,
    contenido: `+ Contenido de prueba ${i + 1}: toda la información se transcribe con términos médicos.`,
    origen_archivo: '02a_Historia_clinica_y_anamnesis.md',
  }));
  const r = ok(post<{ total: number }>('kb.cargar', { filas: objetos, reemplazar: true }));
  assert.equal(r.total, 40);
  const c = ok(post<{ version: string; knowledge: unknown[] }>('catalogos.get', { desde: version }));
  assert.notEqual(c.version, version);
  assert.equal(c.knowledge.length, 40);
});

await prueba('creado desde una hoja de cálculo, usa esa hoja y respeta lo que ya tenía', () => {
  const e = crearEntorno({ estricto: true, gemini, contenedor: [['Mis apuntes'], ['no borrar']] });
  const c = vm.createContext({ ...e.globales });
  vm.runInContext(codigo, c);
  const info = (c as unknown as Record<string, () => { hoja: string }>).setup();
  assert.equal(e.props.get('SPREADSHEET_ID'), 'contenedor');
  assert.equal(e.libros.size, 1, 'no crea otro libro');
  assert.ok(info.hoja);
  const l = e.libros.get('contenedor')!;
  assert.deepEqual(l.getSheets().map((h) => h.nombre), ['Hoja 1', 'HC', 'Esquema', 'Opciones', 'Knowledge', 'Registro']);
  assert.equal(l.getSheetByName('Hoja 1')!.getLastRow(), 2);
  assert.equal(e.archivosDrive.length, 0);
});

await prueba('usa la hoja y la carpeta de los enlaces de HC_CONFIG', () => {
  const e = crearEntorno({ estricto: true, gemini, contenedor: [] });
  const c = vm.createContext({
    ...e.globales,
    HC_CONFIG: {
      hoja: 'https://docs.google.com/spreadsheets/d/contenedor/edit?gid=0#gid=0',
      carpeta: 'https://drive.google.com/drive/folders/audios?usp=sharing',
    },
  });
  vm.runInContext(codigo, c);
  (c as unknown as Record<string, () => unknown>).setup();
  assert.equal(e.props.get('SPREADSHEET_ID'), 'contenedor');
  assert.equal(e.props.get('CARPETA_DRIVE_ID'), 'audios');
  assert.equal(e.libros.size, 1);
});
await prueba('no usa una carpeta compartida con cualquiera: ni al instalar ni al guardar audios', () => {
  const opciones: Parameters<typeof crearEntorno>[0] = { estricto: true, gemini, carpetaPublica: true };
  const e = crearEntorno(opciones);
  const c = vm.createContext({ ...e.globales });
  vm.runInContext(codigo, c);
  const g = c as unknown as Record<string, (...a: unknown[]) => unknown>;
  assert.throws(() => g.setup(), /Restringido/);
  assert.equal(e.libros.size, 0, 'no creó la hoja');
  opciones.carpetaPublica = false;
  g.setup();
  const clave = /Contraseña temporal: (\S+)/.exec(e.logs.find((l) => l.startsWith('ACCESO')) ?? '')?.[1] ?? '';
  const llamar = (action: string, payload: unknown, tk = '') =>
    JSON.parse((g.doPost({ postData: { contents: JSON.stringify({ action, token: tk, opId: randomUUID(), payload }) } }) as { getContent(): string }).getContent()) as Respuesta<{ token: string }>;
  const tk = ok(llamar('auth.login', { usuario: 'admin', clave })).token;
  opciones.carpetaPublica = true;
  const r = llamar('entrada.transcribir', { audioBase64: 'eA==', mime: 'audio/webm', dni: '40123456', episodio: 1, seccion: 'enfermedad_actual' }, tk);
  assert.ok(!r.ok && /Restringido/.test(r.error), JSON.stringify(r));
  assert.equal(e.archivosDrive.length, 0);
});

console.log('Respuestas que Google pierde (más de 30 segundos)');
await prueba('un reintento con el mismo opId espera a la primera ejecución en vez de repetirla', () => {
  const opId = randomUUID();
  const antes = env.llamadasGemini.length;
  let esperas = 0;
  env.cache.set(`op:${opId}:en_curso`, '1');
  const original = env.globales.Utilities.sleep;
  // Mientras «duerme», la primera ejecución termina y deja su resultado.
  (env.globales.Utilities as { sleep: (ms: number) => void }).sleep = () => {
    esperas++;
    if (esperas === 3) {
      env.cache.set(`op:${opId}`, JSON.stringify({ ok: true, data: { campos: [], dudas: [], escalas_sugeridas: [], conflictos: [], descartados: [], registro_id: 'primera' } }));
      env.cache.delete(`op:${opId}:en_curso`);
    }
  };
  try {
    const r = ok(post<{ registro_id: string }>('entrada.organizar', { texto: 'tos hace 3 días', origen: 'texto', dni: '40123456', episodio: 1, seccion: 'enfermedad_actual', contexto: {} }, opId));
    assert.equal(r.registro_id, 'primera');
    assert.equal(env.llamadasGemini.length, antes, 'no volvió a llamar a Gemini');
  } finally {
    (env.globales.Utilities as { sleep: unknown }).sleep = original;
  }
});
await prueba('si la primera sigue corriendo, responde «pendiente» antes de los 30 segundos', () => {
  const opId = randomUUID();
  env.cache.set(`op:${opId}:en_curso`, '1');
  const original = env.globales.Utilities.sleep;
  let esperado = 0;
  (env.globales.Utilities as { sleep: (ms: number) => void }).sleep = (ms: number) => {
    esperado += ms;
  };
  try {
    const r = post('entrada.transcribir', { audioBase64: 'eA==', mime: 'audio/webm', dni: '40123456', episodio: 1, seccion: 'enfermedad_actual' }, opId);
    assert.ok(!r.ok && r.codigo === 'pendiente', JSON.stringify(r));
    assert.ok(esperado <= 20_000, `esperó ${esperado} ms`);
  } finally {
    (env.globales.Utilities as { sleep: unknown }).sleep = original;
    env.cache.delete(`op:${opId}:en_curso`);
  }
});
await prueba('la revisión con Gemini se recupera por opId sin repetirse y sin llenar Registro', () => {
  const opId = randomUUID();
  const filasAntes = hoja('Registro').getLastRow();
  const antes = env.llamadasGemini.length;
  const payload = { dni: '40123456', episodio: 1, valores: { 'efr.columna': 'le duele la espalda', 'fil.sexo': 'Femenino' } };
  const a = ok(post<{ redaccion: unknown[] }>('hc.revisar', payload, opId));
  const b = ok(post<{ redaccion: unknown[] }>('hc.revisar', payload, opId));
  assert.deepEqual(a, b);
  assert.equal(env.llamadasGemini.length, antes + 1);
  assert.equal(hoja('Registro').getLastRow(), filasAntes);
});
await prueba('el catálogo se lee de la caché en cada ejecución y «calentar» nota los cambios hechos a mano', () => {
  const ejecucion = () => {
    const c = vm.createContext({ ...env.globales });
    vm.runInContext(codigo, c);
    return c as unknown as Record<string, (...a: unknown[]) => unknown>;
  };
  const pedir = (g: Record<string, (...a: unknown[]) => unknown>) =>
    (JSON.parse((g.doPost({ postData: { contents: JSON.stringify({ action: 'catalogos.get', token, payload: {} }) } }) as { getContent(): string }).getContent()) as Respuesta<{ version: string; opciones: unknown[] }>);
  const v1 = ok(pedir(ejecucion()));
  assert.ok([...env.cache.keys()].some((k) => k.startsWith('catalogo:1')), 'el catálogo ocupa varios trozos');
  const opciones = hoja('Opciones');
  const antes = opciones.getRange(2, 6, 1, 1).getDisplayValues()[0][0];
  opciones.getRange(2, 6, 1, 1).setValues([['definición cambiada a mano']]);
  const v2 = ok(pedir(ejecucion()));
  assert.equal(v2.version, v1.version, 'sin calentar, sigue la caché');
  ejecucion().calentar();
  const v3 = ok(pedir(ejecucion()));
  assert.notEqual(v3.version, v1.version);
  assert.equal(v3.opciones.length, v1.opciones.length);
  opciones.getRange(2, 6, 1, 1).setValues([[antes]]);
  ejecucion().calentar();
  assert.equal(ok(pedir(ejecucion())).version, v1.version);
});
await prueba('las tareas (respaldo y calentar) se instalan solas una vez', () => {
  assert.equal(env.props.get('TAREAS'), '2');
});

console.log('Servidor local (datos en disco)');
await prueba('los datos sobreviven a un reinicio y se respaldan', () => {
  const carpeta = mkdtempSync(join(tmpdir(), 'hc-local-'));
  try {
    const arrancar = () => {
      const e = crearEntorno({ carpeta, gemini, entorno: { GEMINI_API_KEY: 'k' } });
      const c = vm.createContext({ ...e.globales });
      vm.runInContext(codigo, c);
      return { e, g: c as unknown as Record<string, (...a: unknown[]) => unknown> };
    };
    const llamar = (g: Record<string, (...a: unknown[]) => unknown>, action: string, payload: unknown, tk = '') =>
      JSON.parse((g.doPost({ postData: { contents: JSON.stringify({ action, token: tk, payload }) } }) as { getContent(): string }).getContent()) as Respuesta<{ token: string }>;

    const a = arrancar();
    a.g.setup();
    const clave = /Contraseña temporal: (\S+)/.exec(a.e.logs.find((l) => l.startsWith('ACCESO')) ?? '')?.[1] ?? '';
    const tk = ok(llamar(a.g, 'auth.login', { usuario: 'admin', clave })).token;
    ok(llamar(a.g, 'hc.guardar', { dni: '40123456', episodio: 1, version: 0, campos: [{ id: 'efr.edema_godet', valor: '+/++++ hasta tobillos', base: '' }] }, tk));
    a.e.guardar();
    a.g.respaldoDiario();
    assert.ok(readFileSync(join(carpeta, 'hojas', 'HC.csv'), 'utf8').includes('+/++++ hasta tobillos'));
    assert.ok(!('API_KEY_GEMINI' in JSON.parse(readFileSync(join(carpeta, 'propiedades.json'), 'utf8'))), 'la API key no se guarda en disco');
    assert.equal(readdirSync(join(carpeta, 'respaldos')).length, 1);

    const b = arrancar();
    const r = llamar(b.g, 'hc.get', { dni: '40123456', episodio: 1 }, tk) as Respuesta<unknown> as Respuesta<{ fila: { valores: Record<string, string> } }>;
    assert.equal(ok(r).fila.valores['efr.edema_godet'], '+/++++ hasta tobillos');
    assert.equal(ok(llamar(b.g, 'ping', {}, tk) as Respuesta<unknown> as Respuesta<{ gemini: boolean }>).gemini, true);
  } finally {
    rmSync(carpeta, { recursive: true, force: true });
  }
});

console.log(`\n${total - fallos}/${total} pruebas correctas`);
if (fallos) process.exit(1);
