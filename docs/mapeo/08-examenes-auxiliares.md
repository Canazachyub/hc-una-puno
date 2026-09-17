# 08 · Exámenes auxiliares: indicaciones, valores normales e interpretación

> Documento de consulta del mapeo de HC App. Fuentes: seed/esquema.csv, seed/opciones.csv, seed/guias.csv y las notas. Las definiciones y la guía son para estudiar y llenar la historia; no se imprimen en el Word.

## Resumen

El área 08 tiene **un solo campo**, `exc.examenes` (párrafo redactado, opcional), que se escribe con la lista de frases `f_examenes` (**9 frases**, una por examen frecuente). Todo lo demás es **guía en pantalla**: **193 entradas** repartidas en **24 exámenes** (ámbitos `ex.*`). Por tipo, 55 son de cuándo pedirlo, 31 de valores normales, 59 de cómo leerlo y 48 de lo que no hay que olvidar.

- **Origen de la guía:** 156 entradas salen de las notas de Semiología (sobre todo `07g`, `09c`, `08f` y `10b`), 34 de notas de otros cursos (Fisiología, Bioquímica, Fisiopatología, Patología y Farmacología 2026) y 3 están marcadas como "fuera de notas" (leucocitos, transaminasas y troponina).
- **Verificación:** se abrió cada nota citada. Todas las rutas existen y respaldan el dato, salvo los matices que se anotan en [Discrepancias y pendientes](#discrepancias-y-pendientes).
- **Tabla maestra:** 53 parámetros con su valor normal y su fuente.
- **Altura:** los rangos de hemoglobina, saturación y presión arterial de oxígeno de las notas son de nivel del mar. Puno está a más de 3 800 m. Ver la nota bajo la tabla maestra.
- **Escritura:** en este documento se escriben completos los nombres que en la guía original venían abreviados (transaminasas, creatina fosfocinasa, vacuna de Calmette-Guérin). En el electrocardiograma se conservan las letras de las ondas y derivaciones (P, QRS, ST, T, QT, RR, DI, DII, DIII, aVR, aVL, aVF, V1 a V8), porque son los nombres propios del trazado.

## Cómo registrar un examen en la historia

| Dato | Detalle |
|---|---|
| Campo | `exc.examenes` · "Exámenes complementarios" |
| Sección | `examenes` (Exámenes complementarios), orden 10 |
| Tipo | `narrativa`: párrafo redactado |
| Obligatorio | No |
| Lista de frases | `f_examenes` · "Frases · exámenes" (9 frases) |
| Valor normal por defecto | Ninguno: no hay "examen normal" que se escriba solo |
| Regla | `valor_unidad_rango`: en pantalla se lee **"Fecha, valor, unidad y rango"**. Para la inteligencia artificial dice: "Cada resultado con fecha, valor, unidad y rango de referencia si se dictó." |
| Guía en pantalla | En las secciones de exámenes y de plan de trabajo aparece un bloque por cada ámbito `ex.*`, con el nombre del examen como título. El campo no tiene entradas propias con el ámbito `exc.examenes`. |

**Regla "Fecha, valor, unidad y rango".** Cada resultado se escribe con cuatro datos: la fecha del examen, el valor obtenido, su unidad y el rango de referencia del laboratorio. Así el resultado se puede comparar después.

- Al tocar una frase, la app pide la `{fecha}` y sugiere la fecha de hoy.
- Después de los dos puntos se escribe el resultado. Formato: `Hemograma (dd/mm/aaaa): hemoglobina [valor] g/dl (referencia [rango]), hematocrito [valor] % (referencia [rango]) …`
- No se escriben siglas. Se escribe "hemoglobina", no la sigla.
- Si el examen no tiene frase, se escribe a mano con el mismo formato.

| Código | Frase que se escribe | Qué registra | Fuente |
|---|---|---|---|
| `a1` | Hemograma ({fecha}): | Resultado del hemograma con su fecha: hemoglobina, hematocrito, leucocitos y plaquetas. Hemoglobina normal 12 a 16 g/dl en mujeres y 13 a 17 g/dl en varones. | `BIOQUIMICA 2026/entities/estructuras/Hemoglobina.md` |
| `a2` | Examen completo de orina ({fecha}): | Resultado del examen de orina con su fecha. Normal: densidad 1 015 a 1 025, pH 4,5 a 7, sin glucosa, hasta 2 hematíes y 3 leucocitos por campo. | `10b` |
| `a3` | Glucosa ({fecha}): | Glucosa en sangre con su fecha, indicando si fue en ayunas. Normal en ayunas 70 a 100 mg/dl; 126 mg/dl o más en dos ocasiones es diabetes. | `BIOQUIMICA 2026/entities/estructuras/Glucosa.md` |
| `a4` | Urea y creatinina ({fecha}): | Función renal con su fecha. Creatinina sérica normal 0,6 a 1,4 mg/dl y urea sanguínea 15 a 45 mg/dl; con ellas se calcula la depuración. | `10b` |
| `a5` | Perfil hepático ({fecha}): | Bilirrubina total y fracciones con su fecha, junto a las demás pruebas hepáticas. Bilirrubina total normal hasta 1,2 mg/dl; ictericia visible sobre 2,5. | `09a` |
| `a6` | Radiografía de tórax ({fecha}): | Informe de la radiografía de tórax con su fecha y proyección. Índice cardiotorácico normal hasta 0,50; por encima hay cardiomegalia. | `08f` |
| `a7` | Electrocardiograma ({fecha}): | Lectura del electrocardiograma con su fecha. Normal: ritmo sinusal, 60 a 100 latidos por minuto, PR 0,12 a 0,20 y QRS menor de 0,12 segundos. | `08j` |
| `a8` | Ecografía abdominal ({fecha}): | Informe de la ecografía abdominal con su fecha: órganos, líquido libre, cálculos o masas. Sin cifra de referencia en las notas; se describe el hallazgo. | `09c` |
| `a9` | Baciloscopia ({fecha}): | Resultado de la baciloscopia de esputo (Ziehl-Neelsen) con su fecha y número de muestra; se piden tres muestras si la tos dura más de 15 días. | `07g` |

**Qué guía corresponde a cada frase:**

| Frase | Guía (ámbito) |
|---|---|
| `a1` | `ex.hemograma` |
| `a2` | `ex.orina` |
| `a3` | `ex.glucosa` |
| `a4` | `ex.renal` |
| `a5` | `ex.hepatico` |
| `a6` | `ex.rx_torax` |
| `a7` | `ex.ecg` |
| `a8` | `ex.ecografia` |
| `a9` | `ex.esputo` |

Los otros 15 ámbitos no tienen frase propia (ver pendientes).

## Tabla maestra de valores normales

Una fila por parámetro. Los valores salen de las entradas "Valores normales" de la guía, más la saturación, que en la guía está en "No olvidar". Se comprobaron en la nota citada.

| Examen | Parámetro | Valor normal | Fuente |
|---|---|---|---|
| Hemograma | Hemoglobina | 12 a 16 g/dl en mujeres; 13 a 17 g/dl en varones (nivel del mar, ver nota de altura) | `BIOQUIMICA 2026/entities/estructuras/Hemoglobina.md` |
| Hemograma | Hematocrito | 40 a 50% | `FISIOPATOLOGIA 2026/clases/Clase_26_INSUFICIENCIA_RENAL_CRONICA.md` |
| Hemograma | Plaquetas | 150 000 a 400 000 por microlitro | `FISIOLOGIA 2026/conceptos/Plaquetas.md` |
| Hemograma | Leucocitos | 4 000 a 10 000 por microlitro (fuera de notas) | fuera de notas |
| Hemograma | Neutrófilos | 55 a 70% del total de leucocitos (fuera de notas) | fuera de notas |
| Examen de orina | Volumen | 800 a 1 800 ml en 24 horas (término medio 1 400 ml) | `10b` |
| Examen de orina | Densidad | 1 015 a 1 025 | `10b` |
| Examen de orina | Color y aspecto | Amarillo pálido a ámbar; límpida | `10b` |
| Examen de orina | pH | 4,5 a 7 (ácido) | `10b` |
| Examen de orina | Proteínas | Hasta 120 a 150 mg en 24 horas | `10b` |
| Examen de orina | Glucosa | Ausente | `10b` |
| Examen de orina | Cetonas | Ausentes | `10b` |
| Examen de orina | Urobilinógeno | Ausente (según la nota) | `10b` |
| Examen de orina | Hematíes en el sedimento | Hasta 2 por campo | `10b` |
| Examen de orina | Leucocitos en el sedimento | Hasta 3 por campo | `10b` |
| Examen de orina | Cilindros en el sedimento | Hialinos aislados, sin significado patológico | `10b` |
| Glucosa | Glucosa en ayunas | 70 a 100 mg/dl | `BIOQUIMICA 2026/entities/estructuras/Glucosa.md` |
| Función renal | Creatinina sérica | 0,6 a 1,4 mg/dl (la nota lo escribe "mg%") | `10b` |
| Función renal | Urea sanguínea | 15 a 45 mg/dl | `10b` |
| Función renal | Depuración de creatinina | 97 a 137 ml/min en varones; 88 a 128 ml/min en mujeres; promedio 120 ml/min | `10b` |
| Perfil hepático | Bilirrubina total | Hasta 1,2 mg/dl (ictericia visible con más de 2,5 mg/dl) | `09a` |
| Perfil hepático | Transaminasas (glutámico oxalacética y glutámico pirúvica) | Hasta unos 40 U/L, según el laboratorio (fuera de notas) | fuera de notas |
| Electrolitos | Sodio sérico | 135 a 145 mEq/L | `05b` |
| Electrolitos | Potasio sérico | 3,5 a 5,0 mEq/L | `FISIOPATOLOGIA 2026/clases/Clase_07_METABOLISMO_DEL_POTASIO.md` |
| Electrolitos | Cloro sérico | 98 a 108 mmol/L | `FISIOLOGIA 2026/clases/03_UNIDAD_III_BASES_CELULARES_MEMBRANA_Y_MUSCULO/01_Capitulo_1.md` |
| Electrolitos | Calcio sérico | 6 a 11 mg/dl (apuntes 2020) o 9 a 11 mg/dl (apuntes 2018): discrepancia | `09d` |
| Gasometría arterial | pH arterial | 7,35 a 7,45 | `FISIOLOGIA 2026/concepts/Gases-Arteriales.md` |
| Gasometría arterial | Presión arterial de dióxido de carbono | 35 a 45 mmHg | `FISIOLOGIA 2026/concepts/Gases-Arteriales.md` |
| Gasometría arterial | Bicarbonato | 22 a 26 mEq/L | `FISIOLOGIA 2026/concepts/Gases-Arteriales.md` |
| Gasometría arterial | Presión arterial de oxígeno | 80 a 100 mmHg (nivel del mar) | `FISIOLOGIA 2026/concepts/Gasometria-Arterial.md` |
| Gasometría arterial | Saturación de oxígeno | Más de 95% a nivel del mar; 88 a 92% en poblaciones adaptadas a la altura | `FISIOPATOLOGIA 2026/Saturacion-Oxigeno.md` |
| Esputo | Moco bronquial | Unos 100 ml en 24 horas, deglutido sin toser | `07a` |
| Prueba de tuberculina | Pápula a las 72 horas | Positiva si mide más de 10 mm; la guía toma como negativa la de 10 mm o menos | `07g` |
| Espirometría | Volumen espiratorio forzado en el primer segundo / capacidad vital forzada | Cerca de 80% | `FISIOLOGIA 2026/clases/07_UNIDAD_VII_RESPIRACION_COMPLEMENTO/01_Capitulo_43.md` |
| Radiografía de tórax | Índice cardiotorácico | Hasta 0,50 (por encima, cardiomegalia) | `08f` |
| Electrocardiograma | Ritmo | Sinusal: onda P positiva en DI, DII y aVF, negativa en aVR, antes de cada QRS | `08j` |
| Electrocardiograma | Frecuencia cardíaca | 60 a 100 latidos por minuto | `08j` |
| Electrocardiograma | Onda P, duración | 0,07 a 0,11 segundos | `08j` |
| Electrocardiograma | Onda P, amplitud | Menor de 2,5 mm en DII | `08j` |
| Electrocardiograma | Intervalo PR | 0,12 a 0,20 segundos | `08j` |
| Electrocardiograma | Complejo QRS | Menor de 0,12 segundos | `08j` |
| Electrocardiograma | Intervalo QT | 0,34 a 0,44 segundos | `08j` |
| Electrocardiograma | Eje eléctrico | 0 a 90 grados (QRS positivo en DI y aVF) | `08j` |
| Ecocardiograma | Fracción de eyección | 50 a 70% (reducida si es menor de 40%) | `FISIOLOGIA 2026/clases/04_UNIDAD_IV_CORAZON_CIRCULACION_Y_FLUJO_CEREBRAL/04_Capitulo_22.md` |
| Enzimas cardíacas | Troponina | Indetectable o bajo el límite superior de referencia del laboratorio (fuera de notas) | fuera de notas |
| Líquido cefalorraquídeo | Presión | Menor de 180 mm de agua | `11j` |
| Líquido cefalorraquídeo | Aspecto | Transparente | `11j` |
| Líquido cefalorraquídeo | Células | Menos de 5 linfocitos (la nota dice "por mililitro", ver discrepancias) | `11j` |
| Líquido cefalorraquídeo | Eritrocitos | Ninguno | `11j` |
| Líquido cefalorraquídeo | Glucosa | 50 a 60% de la glucemia | `11j` |
| Líquido cefalorraquídeo | Proteínas totales | 20 a 40 mg/100 ml | `11j` |
| Líquido cefalorraquídeo | Albúmina y globulina | Predomina la albúmina sobre la globulina | `11j` |
| Líquido cefalorraquídeo | Gammaglobulina | Menos de 10% de las proteínas | `11j` |

> **Nota de altura (Puno, más de 3 800 m).**
> - **Hemoglobina.** Los rangos de la tabla (12 a 16 g/dl en mujeres y 13 a 17 g/dl en varones) no están ajustados a la altura, y en el residente de altura la hemoglobina es mayor. Se habla de eritrocitosis excesiva con 21 g/dl o más en varones y 19 g/dl o más en mujeres (`FISIOPATOLOGIA 2026/entities/enfermedades/Eritrosis-Patologica-de-la-Altura.md`). En clase se dijo que en la costa la hemoglobina normal llega hasta 16 g/dl, y que en Puno (3 820 metros sobre el nivel del mar) es frecuente encontrar 24 a 26 g/dl por poliglobulia de altura (`05k`).
> - **Saturación de oxígeno.** Es mayor de 95% a nivel del mar, pero en poblaciones adaptadas a la altura puede ser de 88 a 92%. No se deben aplicar los valores de la costa (`FISIOPATOLOGIA 2026/Saturacion-Oxigeno.md`).
> - **Lo que falta.** Las notas no traen un rango normal de hemoglobina ni de presión arterial de oxígeno propio de 3 800 m.

## Exámenes en general

Ámbito `ex.general` · sin frase propia.

**Cuándo pedirlo**
- Los exámenes confirman, descartan o modifican la hipótesis diagnóstica hasta llegar al diagnóstico definitivo. — `01`
- También descubren enfermedad sin síntomas, cuantifican la gravedad, detectan complicaciones y evalúan la respuesta al tratamiento. — `01`
- En el cardiópata adulto se piden de rutina hemograma, glucosa, función renal y perfil lipídico. — `08f`

**Valores normales**
- No aplica: este bloque es la lógica general de pedido.

**Cómo leerlo**
- Pedir según la hipótesis y la procedencia. Por ejemplo, ante fiebre con sospecha de fiebre tifoidea: hemograma, reacción de Vidal o hemocultivo. — `01`
- En el hospitalizado se pide siempre hemograma. Se agrega glucosa si se sospecha diabetes, creatinina si hay riesgo renal y gasometría si hay falla respiratoria. — `09c`
- En neurología, el electroencefalograma estudia la actividad cortical y la electromiografía estudia el músculo y el nervio periférico. — `11j`

**No olvidar**
- Tratar la hipótesis como si ya fuera el diagnóstico final es el error de método más común del estudiante. — `01`
- Un examen alterado aislado no hace el diagnóstico: correlacionarlo siempre con la clínica y los antecedentes. — `08i`

## Hemograma

Ámbito `ex.hemograma` · frase `a1`.

**Cuándo pedirlo**
- Siempre en el paciente hospitalizado (regla práctica de clase). — `09c`

**Valores normales**
- Hemoglobina: 12 a 16 g/dl en mujeres y 13 a 17 g/dl en varones. — `BIOQUIMICA 2026/entities/estructuras/Hemoglobina.md`
- Hematocrito: 40 a 50%. — `FISIOPATOLOGIA 2026/clases/Clase_26_INSUFICIENCIA_RENAL_CRONICA.md`
- Plaquetas: 150 000 a 400 000 por microlitro. — `FISIOLOGIA 2026/conceptos/Plaquetas.md`
- Leucocitos: 4 000 a 10 000 por microlitro, con neutrófilos entre 55 y 70% del total. — fuera de notas (ver pendientes: hay una nota con otro rango)

**Cómo leerlo**
- Leucocitosis con desviación a la izquierda orienta a infección bacteriana, por ejemplo neumonía. — `07e`
- Hematocrito elevado por hemoconcentración en la deshidratación, por ejemplo en la obstrucción intestinal. — `09g`

**No olvidar**
- En la apendicitis, más de 15 000 leucocitos con neutrofilia mayor de 80% sugiere perforación. — `09f`
- En altura la hemoglobina es mayor. Hay eritrocitosis excesiva si llega a 21 g/dl o más en varones y a 19 g/dl o más en mujeres. — `FISIOPATOLOGIA 2026/entities/enfermedades/Eritrosis-Patologica-de-la-Altura.md`
- En el edema pulmonar de altura, 40% de los pacientes tiene leucocitosis con neutrofilia por estrés, sin infección. — `FISIOPATOLOGIA 2026/esquemas/Esquema_30_EAP-Altura.md`

## Examen de orina

Ámbito `ex.orina` · frase `a2`.

**Cuándo pedirlo**
- Sospecha renal o urinaria: síndrome nefrítico, síndrome nefrótico, insuficiencia renal e infección urinaria (en esta, con recuento de leucocitos). — `10c`
- Microalbuminuria: detecta la nefropatía diabética antes de que aparezca proteinuria franca. — `10b`

**Valores normales**
- **Características físicas:**
  - volumen de 800 a 1 800 ml en 24 horas;
  - densidad de 1 015 a 1 025;
  - color amarillo pálido a ámbar;
  - aspecto límpido;
  - pH de 4,5 a 7. — `10b`
- Proteinuria hasta 120 a 150 mg en 24 horas. Glucosa, cetonas y urobilinógeno ausentes. — `10b`
- Sedimento: hasta 2 hematíes y hasta 3 leucocitos por campo. Los cilindros hialinos aislados no tienen significado. — `10b`

**Cómo leerlo**
- Muestra: primera orina de la mañana, desechando el primer chorro, en frasco estéril. — `10b`
- Más de 10 leucocitos por campo sugiere infección urinaria. Se confirma con un urocultivo de más de 100 000 colonias por mililitro. — `FISIOPATOLOGIA 2026/esquemas/Esquema_29_ITU.md`
- Los cilindros hemáticos indican lesión glomerular (síndrome nefrítico). Los cilindros leucocitarios indican pielonefritis o nefritis intersticial. — `10b`
- Una proteinuria de 3,5 g o más en 24 horas define el síndrome nefrótico. Hay que cuantificarla en orina de 24 horas y no solo en cruces. — `10c` (la preferencia por la orina de 24 horas está en `10b`)

**No olvidar**
- La fiebre, el esfuerzo físico intenso o los trastornos de la coagulación dan hematuria microscópica sin lesión renal. — `10b`

## Glucosa

Ámbito `ex.glucosa` · frase `a3`.

**Cuándo pedirlo**
- Sospecha de diabetes, paciente hospitalizado o cardiópata, síndrome nefrótico. — `09c` (el cardiópata está en `08f` y el síndrome nefrótico en `10c`)

**Valores normales**
- Glucosa en ayunas: 70 a 100 mg/dl. — `BIOQUIMICA 2026/entities/estructuras/Glucosa.md`

**Cómo leerlo**
- Glucosa en ayunas de 100 a 125 mg/dl: glucosa alterada en ayunas. — `FARMACOLOGIA 2026/clases/41a_Insulina_glucagon_diabetes_mellitus.md`
- **Diabetes, con cualquiera de estos criterios:**
  - glucosa en ayunas de 126 mg/dl o más, en dos ocasiones;
  - 200 mg/dl o más a las 2 horas de la carga oral de glucosa. — `BIOQUIMICA 2026/entities/estructuras/Glucosa.md`
- Una glucosa al azar mayor de 200 mg/dl con síntomas también es diagnóstica de diabetes. — `FARMACOLOGIA 2026/clases/41a_Insulina_glucagon_diabetes_mellitus.md`
- Una hemoglobina glicosilada de 6,5% o más indica diabetes. — `BIOQUIMICA 2026/entities/estructuras/Glucosa.md`
- En la pancreatitis aguda la glucemia se eleva porque sube el glucagón y cae la insulina. — `09d`
- La glucosuria aparece cuando la glucemia supera unos 180 mg/dl (umbral renal). — `FISIOPATOLOGIA 2026/entities/estructuras/Nefrona.md`

**No olvidar**
- Hipoglicemia: glucosa plasmática menor de 70 mg/dl. — `FISIOPATOLOGIA 2026/entities/enfermedades/Hipoglicemia.md`
- Ante convulsiones, descartar hipoglicemia (menos de 50 mg/dl). — `05b`

## Función renal

Ámbito `ex.renal` · frase `a4`.

**Cuándo pedirlo**
- **Riesgo de insuficiencia renal:**
  - oliguria;
  - síndrome hepatorrenal del cirrótico;
  - cardiópata;
  - hipertenso. — `09c` (la oliguria y la hipertensión están en `08g`, el cardiópata en `08f`)
- En la insuficiencia renal, completar con electrolitos, electrocardiograma (por la hiperpotasemia), gasometría y examen de orina. — `10c`

**Valores normales**
- Creatinina sérica: 0,6 a 1,4 mg/dl. Urea sanguínea: 15 a 45 mg/dl. — `10b`
- Depuración de creatinina: 97 a 137 ml/min en varones y 88 a 128 ml/min en mujeres (promedio 120 ml/min). — `10b`

**Cómo leerlo**
- Fórmula de Cockcroft-Gault: [(140 − edad) × peso en kilogramos] / (creatinina sérica × 72). En mujeres se multiplica por 0,85. — `10b`
- Estadios por filtración glomerular: leve de 50 a 80, moderada de 10 a 50 y grave menor de 10 ml/min. — `10c`

**No olvidar**
- Una filtración glomerular menor de 60 ml/min define la insuficiencia renal crónica, que es irreversible. — `10c`
- Oliguria es menos de 400 ml en 24 horas y anuria, menos de 100 ml. Ambas llevan riesgo de hiperpotasemia y acidosis. — `10c`
- En la hemorragia digestiva, la urea elevada con creatinina normal no debe confundirse con insuficiencia renal intrínseca. — `09e`

## Perfil hepático

Ámbito `ex.hepatico` · frase `a5`.

**Cuándo pedirlo**
- **Hígado y vías biliares:**
  - bilirrubinas y sus fracciones;
  - transaminasas;
  - fosfatasa alcalina;
  - tiempo de protrombina.
- **Páncreas:** amilasa y lipasa. — `09c`

**Valores normales**
- Bilirrubina total: hasta 1,2 mg/dl. La ictericia se hace visible con más de 2,5 mg/dl. — `09a`
- Transaminasas (glutámico oxalacética y glutámico pirúvica): hasta unos 40 U/L, según el laboratorio. — fuera de notas

**Cómo leerlo**
- **Ictericia hemolítica:**
  - predomina la bilirrubina indirecta;
  - no hay coluria;
  - la bilirrubina total rara vez supera 5 mg/dl. — `09a`
- **Ictericia hepatocelular:**
  - suben ambas bilirrubinas;
  - las transaminasas están muy elevadas;
  - hay coluria. — `FISIOPATOLOGIA 2026/clases/Clase_36_SINDROME_ICTERICO.md`
- **Ictericia obstructiva:**
  - predomina la bilirrubina directa;
  - la fosfatasa alcalina está muy elevada;
  - hay coluria y acolia;
  - se confirma con ecografía. — `FISIOPATOLOGIA 2026/clases/Clase_36_SINDROME_ICTERICO.md`
- **Insuficiencia hepática:**
  - transaminasas elevadas;
  - albúmina disminuida;
  - globulina aumentada. — `09e`

**No olvidar**
- **Amilasa.** Si triplica su valor sugiere pancreatitis, pero también sube en:
  - úlcera perforada;
  - colecistitis;
  - obstrucción intestinal;
  - embarazo ectópico roto. — `09d`
- En la colestasis grave hay déficit de vitamina K (factores II, VII, IX y X), con riesgo de sangrado. — `09a`
- **Revisar las escleróticas antes de pedir estudios.** Piel amarilla con escleróticas blancas es hipercarotinemia, no ictericia. — `09e`

## Electrolitos

Ámbito `ex.electrolitos` · sin frase propia.

**Cuándo pedirlo**
- **Insuficiencia cardíaca congestiva:**
  - sodio, potasio y cloro;
  - junto con hemograma, función renal y gasometría. — `08g`
- **Obstrucción intestinal con deshidratación:**
  - electrolitos y gases arteriales;
  - además del hemograma. — `09g`

**Valores normales**
- Sodio sérico: 135 a 145 mEq/L. — `05b`
- Potasio sérico: 3,5 a 5,0 mEq/L. — `FISIOPATOLOGIA 2026/clases/Clase_07_METABOLISMO_DEL_POTASIO.md`
- Cloro sérico: 98 a 108 mmol/L. — `FISIOLOGIA 2026/clases/03_UNIDAD_III_BASES_CELULARES_MEMBRANA_Y_MUSCULO/01_Capitulo_1.md`
- Calcio sérico: 6 a 11 mg/dl según los apuntes de 2020 y 9 a 11 mg/dl según los de 2018. Es una discrepancia que hay que contrastar en clase. — `09d`

**Cómo leerlo**
- **Deshidratación según el sodio:**
  - isotónica: sodio normal;
  - hipotónica: sodio bajo (menos de 130 en los apuntes de 2020);
  - hipertónica: sodio alto. — `05b`

**No olvidar**
- **Hiperpotasemia en la insuficiencia renal** (puede llegar a 8 o 9 mEq/L):
  - pedir electrocardiograma;
  - hay riesgo de arritmia y de paro. — `FISIOPATOLOGIA 2026/esquemas/Esquema_25_IRA.md`
- En la pancreatitis aguda, un calcio sérico menor de 7 mg/dl indica mal pronóstico. — `09d`
- Una diuresis excesiva en el paciente ascítico puede producir hipopotasemia y agravar una encefalopatía. — `09e`

## Gasometría arterial

Ámbito `ex.gasometria` · sin frase propia.

**Cuándo pedirlo**
- De rutina en la insuficiencia respiratoria, el enfisema y la enfermedad pulmonar obstructiva crónica. — `07g`
- **Crisis asmática:**
  - gasometría u oximetría para cuantificar el grado de acidosis;
  - junto con espirometría y hemograma. — `07f`

**Valores normales**
- pH de 7,35 a 7,45, presión arterial de dióxido de carbono de 35 a 45 mmHg y bicarbonato de 22 a 26 mEq/L. — `FISIOLOGIA 2026/concepts/Gases-Arteriales.md`
- Presión arterial de oxígeno: 80 a 100 mmHg. — `FISIOLOGIA 2026/concepts/Gasometria-Arterial.md`

**Cómo leerlo**
- **Primero se mira el pH y luego el componente alterado:**
  - si está alterado el dióxido de carbono, el origen es respiratorio;
  - si está alterado el bicarbonato, el origen es metabólico. — `FISIOLOGIA 2026/concepts/Gases-Arteriales.md`
- La compensación del sistema opuesto ayuda a confirmar el trastorno primario. — `FISIOLOGIA 2026/concepts/Gases-Arteriales.md`

**No olvidar**
- **Hipoxemia:** presión arterial de oxígeno menor de 60 mmHg. Da disnea, cianosis, taquicardia y confusión. — `FISIOLOGIA 2026/concepts/Gasometria-Arterial.md`
- **Saturación en altura.** Normal de 88 a 92%, frente a más de 95% a nivel del mar: no aplicar los valores de la costa. — `FISIOPATOLOGIA 2026/Saturacion-Oxigeno.md`

## Esputo y baciloscopia

Ámbito `ex.esputo` · frase `a9`.

**Cuándo pedirlo**
- **Esputo:** de rutina en toda neumopatía.
- **Baciloscopia (Ziehl-Neelsen):** si la tos dura más de 15 días, en tres muestras sucesivas. — `07g`
- El cultivo para bacilo de Koch confirma la tuberculosis (demora de 3 a 45 días). El cultivo en Sabouraud busca hongos. — `07g`
- Células neoplásicas (Papanicolaou) en el primer esputo del día: cerca de 80% de positividad en el carcinoma broncogénico. — `07g`

**Valores normales**
- Un adulto produce unos 100 ml de moco en 24 horas, que deglute sin toser. — `07a`

**Cómo leerlo**
- **Tipo de esputo:**
  - mucoso: asma o bronquitis;
  - purulento: neumonía o absceso;
  - seroso y rosado: edema agudo de pulmón. — `07a`
- **Color y olor:**
  - herrumbroso: neumonía;
  - achocolatado: absceso amebiano;
  - fétido: absceso por anaerobios o cáncer. — `07a`

**No olvidar**
- Su valor se limita por la contaminación con gérmenes de la vía aérea superior. — `07g`
- **Si el paciente no expectora:** lavado gástrico en ayunas para buscar bacilo de Koch. La nota lo indica en niños, mujeres y pacientes inconscientes. — `07g`

## Prueba de tuberculina

Ámbito `ex.ppd` · sin frase propia.

**Cuándo pedirlo**
- Investigar contacto con el bacilo de Koch o tuberculosis activa o latente. — `07g`

**Valores normales**
- **Lectura a las 72 horas:**
  - negativa: pápula de 10 mm o menos;
  - positiva: pápula de más de 10 mm de diámetro. — `07g` (la nota solo define la positiva, ver pendientes)

**Cómo leerlo**
- Se inyectan 0,1 ml de tuberculina por vía intradérmica en el antebrazo y se mide el diámetro de la pápula a las 72 horas. — `07g`

**No olvidar**
- **Una prueba positiva no distingue entre:**
  - vacunación con la vacuna de Calmette-Guérin;
  - contacto con el bacilo;
  - tuberculosis activa o latente. — `07g`

## Espirometría

Ámbito `ex.espirometria` · sin frase propia.

**Cuándo pedirlo**
- Confirmar la obstrucción en el asma bronquial y estudiar la función pulmonar. — `07g`

**Valores normales**
- Relación volumen espiratorio forzado en el primer segundo / capacidad vital forzada: cerca de 80%. — `FISIOLOGIA 2026/clases/07_UNIDAD_VII_RESPIRACION_COMPLEMENTO/01_Capitulo_43.md`

**Cómo leerlo**
- Obstrucción: relación volumen espiratorio forzado en el primer segundo / capacidad vital forzada menor de 0,70 después del broncodilatador. — `FISIOPATOLOGIA 2026/entities/enfermedades/EPOC.md`
- Asma: la obstrucción mejora parcial o totalmente después del broncodilatador (reversibilidad). — `FISIOLOGIA 2026/conceptos/Asma-Bronquial.md`
- Patrón restrictivo: capacidad vital forzada disminuida, por ejemplo en la fibrosis pulmonar. — `PATOLOGIA 2026/entities/enfermedades/Fibrosis-Pulmonar-Idiopatica.md`

**No olvidar**
- Una obstrucción que persiste después del broncodilatador orienta a enfermedad pulmonar obstructiva crónica y no a asma. — `FISIOPATOLOGIA 2026/entities/enfermedades/EPOC.md`

## Radiografía de tórax

Ámbito `ex.rx_torax` · frase `a6`.

**Cuándo pedirlo**
- **Tos prolongada con sospecha de tuberculosis:**
  - primero la radiografía de tórax;
  - luego las baciloscopias de esputo. — `07g`
- **Indispensable en todo cardiópata.**
  - La silueta cardíaca tiene 2 arcos en el borde derecho y 3 en el izquierdo. — `08f`

**Valores normales**
- Índice cardiotorácico = (A + B) / C, normal hasta 0,50. Por encima de 0,50 hay cardiomegalia. — `08f`

**Cómo leerlo**
- **Proyección posteroanterior. Primero se verifica la técnica:**
  - solo se ven 3 a 4 vértebras dorsales;
  - las escápulas quedan fuera de los campos pulmonares. — `07g`
- **Luego se revisan en orden:**
  - partes blandas;
  - diafragma (el derecho está 2 a 3 cm más alto);
  - senos costodiafragmáticos, que deben ser agudos;
  - hilios y trama vascular. — `07g`
- **Derrame y atelectasia:**
  - el derrame borra el seno costodiafragmático y desplaza el mediastino al lado sano;
  - la atelectasia lo atrae al lado enfermo. — `07e`
- **Neumonía y enfisema:**
  - neumonía: opacidad homogénea con broncograma aéreo;
  - enfisema: hiperclaridad, costillas horizontales y diafragma aplanado. — `07e`

**No olvidar**
- Un derrame menor de 300 ml puede no verse con el paciente de pie (usar el decúbito lateral). En decúbito horizontal el pulmón aparenta más congestión. — `07e`
- El pectoral mayor puede simular un neumotórax enquistado, y la sombra de las mamas no debe tomarse por un nódulo. — `07g`
- **Cardiomegalia no equivale a cardiopatía:** el atleta entrenado tiene un corazón grande y sano. — `08f`

## Radiografía de abdomen

Ámbito `ex.rx_abdomen` · sin frase propia.

**Cuándo pedirlo**
- **Radiografía simple:** primer examen ante sospecha de obstrucción intestinal o perforación. Se toma de pie, en decúbito lateral izquierdo o en decúbito dorsal. — `09c`
- **Con bario:** en ayunas, con placas cada 30 minutos. Se indica en cáncer de esófago, estómago o duodeno, y en disfagia u odinofagia. — `09c`
- **Enema baritado:** previa preparación con laxantes. Se indica en pólipos, tumores, cáncer y diverticulitis del colon. — `09c`

**Valores normales**
- Las notas no dan valores numéricos para este examen.

**Cómo leerlo**
- **Obstrucción:**
  - niveles hidroaéreos;
  - imagen en pila de monedas antes del obstáculo;
  - no hay gas distal. — `09g`
- **Perforación:** aire libre bajo las cúpulas diafragmáticas, con imagen en semiluna (neumoperitoneo). — `09c`
- En la pancreatitis puede mostrar cálculos en los conductos pancreáticos. — `09d`

**No olvidar**
- **El bario está contraindicado en:**
  - la obstrucción intestinal;
  - la perforación de esófago o de estómago. — `09c`

## Ecografía

Ámbito `ex.ecografia` · frase `a8` (ecografía abdominal).

**Cuándo pedirlo**
- **Primera línea en el abdomen:**
  - tumores y quistes;
  - ascitis;
  - cálculos vesiculares o renales;
  - abscesos. — `09c`
- **Colecistitis:** confirma los cálculos.
- **Pancreatitis:** muestra cálculos biliares, dilatación del colédoco y edema del páncreas. — `09d`
- **Sospecha de embarazo ectópico roto:**
  - buscar líquido libre;
  - junto con hemograma y grupo sanguíneo. — `09g`
- Infección urinaria recurrente o sospecha de litiasis: ecografía del sistema urinario. — `10c`
- **Ecografía Doppler:** confirma la obstrucción arterial y la trombosis venosa profunda. — `08i`
- **Tórax:** derrames pleurales y alteraciones de la pared, aunque la tomografía la ha superado. — `07g`

**Valores normales**
- Las notas no dan valores numéricos: se describe el hallazgo.

**Cómo leerlo**
- Los quistes y la ascitis se ven anecoicos; los cálculos se ven hiperecoicos. — `09c`

**No olvidar**
- Depende del operador y a veces no define la naturaleza de una lesión. — `09c`
- No palpar un cálculo renal no lo descarta: completar con ecografía o tomografía. — `10b`

## Tomografía

Ámbito `ex.tomografia` · sin frase propia.

**Cuándo pedirlo**
- **Tórax:**
  - tumores mediastínicos;
  - tumores primarios y metástasis;
  - enfermedad pleural y derrames. — `07g`
- **Abdomen:**
  - tumor o quiste hepático;
  - ictericia no aclarada;
  - masa no filiada;
  - dolor inexplicado;
  - hemorragia retroperitoneal. — `09c`
- **Pancreatitis aguda:** es la imagen de mayor utilidad para definir el tipo. — `09d`
- **Corazón:** no es de rutina. Solo se pide cuando la radiografía o la ecografía no aclaran el problema. — `08f`
- **Coma:** neuroimagen (tomografía o resonancia) para descartar masas intracraneales. — `11e`
- **Vértigo intenso con riesgo cerebrovascular o cardiopatía:** tomografía o resonancia; el laboratorio aporta poco. — `11g`
- **La resonancia se prefiere en:**
  - fosa posterior;
  - silla turca;
  - hidrocefalia;
  - enfermedades desmielinizantes;
  - médula;
  - hernias discales. — `11j`

**Valores normales**
- Las notas no dan valores numéricos para este examen.

**Cómo leerlo**
- La guía no tiene entradas de lectura para este examen.

**No olvidar**
- Síndrome de Horner en un fumador: pedir tomografía de tórax para buscar un tumor del vértice pulmonar. — `11j`
- **Cefalea súbita, la peor de su vida:** estudiarla siempre como hemorragia subaracnoidea. — `11g`

## Electrocardiograma

Ámbito `ex.ecg` · frase `a7`.

**Cuándo pedirlo**
- **Dolor torácico:** pedir electrocardiograma. Si el dolor no es anginoso (tumor, quiste o aneurisma), pedir radiografía de tórax. — `08f`
- **Insuficiencia renal aguda o crónica:** electrocardiograma para buscar signos de hiperpotasemia. — `10c`

**Valores normales**
- **Ritmo sinusal:**
  - onda P positiva en DI, DII y aVF, y negativa en aVR;
  - una onda P antes de cada QRS;
  - PR de 0,12 a 0,20 segundos. — `08j`
- **Frecuencia de 60 a 100 latidos por minuto.** Se calcula como 1 500 / número de cuadrados pequeños entre dos ondas R, y solo vale si el ritmo es regular. — `08j`
- **Duraciones y amplitudes:**
  - onda P: 0,07 a 0,11 segundos y menor de 2,5 mm en DII;
  - QRS: menor de 0,12 segundos;
  - QT: 0,34 a 0,44 segundos. — `08j`
- **Eje eléctrico:** entre 0 y 90 grados, con QRS positivo en DI y en aVF. — `08j`

**Cómo leerlo**
- **Papel a 25 mm por segundo:**
  - cada cuadrado pequeño mide 0,04 segundos y 1 mm;
  - cada cuadrado grande mide 0,20 segundos y 5 mm. — `08j`
- **Orden de lectura:**
  1. ritmo;
  2. frecuencia;
  3. onda P;
  4. intervalo PR;
  5. segmento PR;
  6. complejo QRS;
  7. segmento ST;
  8. onda T;
  9. intervalo QT;
  10. además, el eje. — `08j`
- **Hipertrofias:**
  - P picuda en DII: aurícula derecha;
  - P bimodal: aurícula izquierda;
  - S de V1 + R de V5 o V6 de 35 mm o más: ventrículo izquierdo. — `08k`
- **Infarto:**
  - la isquemia se ve en la onda T;
  - la lesión, en el segmento ST;
  - la necrosis, en la onda Q, que persiste de por vida. — `08k`

**No olvidar**
- Un segmento ST desnivelado más de 0,5 mm es patológico y orienta a infarto. — `08j`
- **Dos trazados que hay que reconocer:**
  - más ondas P que QRS, sin relación entre ellas: bloqueo auriculoventricular de tercer grado;
  - sin onda P y con RR irregular: fibrilación auricular. — `08l`

## Holter y prueba de esfuerzo

Ámbito `ex.holter` · sin frase propia.

**Cuándo pedirlo**
- **Holter:**
  - palpitaciones intermitentes con electrocardiograma de reposo normal;
  - síncope;
  - sospecha de arritmia;
  - dolor torácico. — `08f`
- **También sirve para:**
  - evaluar fármacos antiarrítmicos;
  - controlar un marcapaso;
  - monitorizar el segmento ST. — `08f`

**Valores normales**
- Las notas no dan valores numéricos para este examen.

**Cómo leerlo**
- **Registro continuo de 12 a 24 horas.** El paciente anota la hora de cada síntoma para compararla con el trazado. — `08f`
- Se reportan las arritmias encontradas y las alteraciones del segmento ST y de la onda T. — `08f`

**No olvidar**
- **No pedirlo por cualquier molestia.** Su indicación típica es el episodio que el trazado de reposo no alcanzó a captar. — `08f`
- **La prueba de esfuerzo está contraindicada en:**
  - hipertensión grave;
  - angina inestable;
  - infarto de menos de 6 semanas;
  - insuficiencia cardíaca congestiva (la nota la incluye; la guía la omite);
  - flebitis. — `08f`

## Ecocardiograma

Ámbito `ex.ecocardiograma` · sin frase propia.

**Cuándo pedirlo**
- **Indicaciones:**
  - valvulopatías;
  - cardiopatías congénitas;
  - miocardiopatías;
  - aneurisma de aorta;
  - vegetaciones, trombos y neoplasias. — `08f`
- **Insuficiencia cardíaca:** completa a la radiografía de tórax y al electrocardiograma. — `08g`

**Valores normales**
- Fracción de eyección normal de 50 a 70%. Está reducida si es menor de 40%. — `FISIOLOGIA 2026/clases/04_UNIDAD_IV_CORAZON_CIRCULACION_Y_FLUJO_CEREBRAL/04_Capitulo_22.md`

**Cómo leerlo**
- **Puede ser transtorácico o transesofágico.** Mide el área valvular y busca trombos antes de decidir el cateterismo. — `08f`

**No olvidar**
- **Una fracción de eyección normal no descarta falla:** un corazón pequeño y rígido puede tener un gasto insuficiente. — `FISIOLOGIA 2026/clases/04_UNIDAD_IV_CORAZON_CIRCULACION_Y_FLUJO_CEREBRAL/04_Capitulo_22.md`
- Debe interpretarlo un subespecialista para que el diagnóstico sea confiable. — `08f`

## Enzimas cardíacas

Ámbito `ex.enzimas` · sin frase propia.

**Cuándo pedirlo**
- Dolor torácico intenso sugestivo de infarto, o electrocardiograma dudoso (por ejemplo, por un bloqueo de rama). — `08f`
- **Imagen en espejo en V1 a V3 con dolor precordial:**
  - agregar V7 y V8;
  - si persiste la duda, pedir enzimas. — `08k`

**Valores normales**
- Troponina: indetectable o por debajo del límite superior de referencia del laboratorio. — fuera de notas (ver pendientes)

**Cómo leerlo**
- **Tres marcadores con distinta especificidad:**
  - creatina fosfocinasa: poco específica, porque también está en el cerebro y en el músculo;
  - su fracción MB: más específica del corazón;
  - troponina: sube según el daño. — `08f`
- Una fracción MB mayor de 5 a 10% de la creatina fosfocinasa total sugiere daño miocárdico. — `BIOQUIMICA 2026/concepts/Creatina-Quinasa-(CK).md`

**No olvidar**
- **Una troponina elevada aislada no basta** (por ejemplo, en un joven sin factores de riesgo): hay que correlacionarla con la clínica. — `08i`

## Endoscopía

Ámbito `ex.endoscopia` · sin frase propia.

**Cuándo pedirlo**
- **En el esófago:**
  - hemorragia digestiva alta;
  - disfagia;
  - hernia hiatal;
  - cuerpo extraño;
  - várices.
- **En el estómago:** úlcera péptica y tumores. — `09c`
- **Hemorragia digestiva:** pedir endoscopía, si es posible antes que la radiografía. — `09e`
- **Rectosigmoidoscopía:** hemorragias y tumores del intestino grueso, y toma de biopsias. — `09c`
- **Broncoscopía o fibroscopía:**
  - sospecha de carcinoma;
  - cuerpo extraño;
  - hemoptisis de origen incierto;
  - estenosis bronquial. — `07g`

**Valores normales**
- Las notas no dan valores numéricos: se describe el hallazgo.

**Cómo leerlo**
- **Técnica:** previa lidocaína local por la orofaringe.
- **Informe:** se reportan várices, úlcera o tumor, y se toma biopsia si se ve o se palpa una masa. — `09c`

**No olvidar**
- **También es terapéutica:** permite tratar en el mismo acto una hemorragia por rotura de un vaso. — `09c`
- **Dolor epigástrico con sospecha de úlcera:** solo la endoscopía convierte la hipótesis en diagnóstico definitivo. — `01`

## Parasitológico de heces

Ámbito `ex.parasitologico` · sin frase propia.

**Cuándo pedirlo**
- **Sospecha de parasitosis.** Busca huevos de:
  - Áscaris;
  - Ancylostoma;
  - Oxiuros;
  - Strongyloides;
  - Tenia. — `09c`
- **Síndrome de malabsorción:** coproparasitológico seriado junto con grasa fecal de 24 horas. — `09e`

**Valores normales**
- Las notas no dan valores numéricos: se reportan los huevos o parásitos hallados.

**Cómo leerlo**
- **Se pide seriado:** tres muestras tomadas en días sucesivos.
- Se reportan los huevos o parásitos identificados. — `09c`

**No olvidar**
- **Una sola muestra puede dar un falso negativo.** Si persiste la sospecha de oxiuros, se hace el test de Graham (cinta adhesiva). — `09c`

## Paracentesis

Ámbito `ex.paracentesis` · sin frase propia.

**Cuándo pedirlo**
- **Diagnóstica:** para confirmar la causa de la ascitis.
- **Terapéutica:** cuando la ascitis masiva compromete la ventilación. — `09c`

**Valores normales**
- Las notas no dan valores numéricos del líquido ascítico.

**Cómo leerlo**
- **Sitio de punción:** tercio externo de la línea que va del ombligo a la espina ilíaca anterosuperior izquierda, donde se confirmó matidez. — `09c`
- **Se extraen unos 100 ml para cuatro estudios:**
  - físico;
  - fisicoquímico (proteínas, densidad);
  - citológico;
  - bacteriológico con cultivo. — `09c`
- **En el informe se anotan:**
  - el aspecto: cetrino o hemorrágico;
  - las células: hematíes, leucocitos, linfocitos, células mesoteliales o carcinomatosas. — `09c`

**No olvidar**
- **Paciente ascítico con fiebre:** sospechar peritonitis bacteriana espontánea. — `09e`
- **Antes de puncionar:** antisepsia de la pared y confirmar la matidez a la percusión. — `09c`

## Toracocentesis

Ámbito `ex.toracocentesis` · sin frase propia.

**Cuándo pedirlo**
- **Diagnóstica:** para tipificar un derrame pleural.
- **Terapéutica:** para evacuar hasta 1 500 ml en el paciente disneico. — `07g`
- **Duda radiológica entre atelectasia y derrame pleural:** punción pleural exploradora. — `07e`

**Valores normales**
- Las notas no dan valores numéricos del líquido pleural.

**Cómo leerlo**
- **Técnica:**
  - con radiografía reciente;
  - paciente sentado;
  - octavo o noveno espacio intercostal, detrás de la línea axilar posterior;
  - se entra por el borde superior de la costilla. — `07g`
- **Reparto del líquido:**
  - 10 ml para parasitológico;
  - 10 ml para bacteriológico;
  - 10 ml para bioquímico;
  - 20 ml de reserva. — `07g`
- **Trasudado o exudado:**
  - trasudado: claro, amarillo pálido y sin coágulos;
  - exudado: opaco, de color variable y con coágulos. — `07g`
- **Color del líquido:**
  - citrino: insuficiencia cardíaca, cirrosis o síndrome nefrótico;
  - sanguinolento en un mayor de 60 años: neoplasia;
  - purulento: empiema. — `07g`

**No olvidar**
- **Líquido achocolatado:** sugiere un absceso amebiano roto hacia la pleura. — `07g`
- **Contraindicada** si hay infección de piel o partes blandas en el sitio de punción. Se suspende si el paciente no la tolera. — `07g`
- **Error frecuente en la biopsia pleural:** retirar solo músculo. En ese caso el patólogo rechaza la muestra. — `07g`

## Líquido cefalorraquídeo

Ámbito `ex.lcr` · sin frase propia.

**Cuándo pedirlo**
- **Indicaciones:**
  - sospecha de infección o de infiltración meníngea;
  - procesos inflamatorios radiculares, como la polirradiculoneuropatía. — `11j`

**Valores normales**
- **Presión y aspecto:**
  - presión menor de 180 mm de agua;
  - aspecto transparente. — `11j`
- **Células:**
  - menos de 5 células (linfocitos) por mililitro, según la nota;
  - ningún eritrocito. — `11j` (ver discrepancias)
- **Glucosa y proteínas:**
  - glucosa: 50 a 60% de la glucemia;
  - proteínas: 20 a 40 mg/100 ml, con más albúmina que globulina;
  - gammaglobulina: menor de 10%. — `11j`

**Cómo leerlo**
- **Técnica:** por punción lumbar.
- **Orden:** primero se mide la presión con manómetro; luego el aspecto, las células, la glucosa y las proteínas. — `11j`
- **Meningitis bacteriana:**
  - presión aumentada;
  - neutrófilos abundantes;
  - proteínas elevadas;
  - glucosa disminuida. — `PATOLOGIA 2026/clases/22d_Infecciones_del_sistema_nervioso_central.md`
- **Meningitis aséptica y tuberculosa:**
  - aséptica: linfocitos y glucosa normal;
  - tuberculosa: mononucleares, proteínas muy elevadas y glucosa baja o normal. — `PATOLOGIA 2026/clases/22d_Infecciones_del_sistema_nervioso_central.md`

**No olvidar**
- **La glucosa del líquido depende de la glucemia:** hay que interpretarla junto con la glucemia del paciente. — `11j`
- **Papiledema por hipertensión endocraneana:** precaución antes de la punción lumbar, por el riesgo de herniación. — `11e`

## Discrepancias y pendientes

### Discrepancias entre fuentes (verificadas en la nota)

| # | Tema | Qué dicen las fuentes | Dónde | Qué hacer |
|---|---|---|---|---|
| 1 | Calcio sérico | Los apuntes de 2020 dan de 6 a 11 mg/dl; los de 2018, de 9 a 11 mg/dl. Ambos dicen que menos de 7 mg/dl es de mal pronóstico en la pancreatitis. Con el rango de 2020, un valor de 6,2 mg/dl (el del caso de la misma nota) sería "normal" y a la vez "de mal pronóstico". | `09d` | Contrastar en clase. Mientras tanto, no presentar 6 mg/dl como límite normal sin la advertencia. |
| 2 | Células del líquido cefalorraquídeo | La nota dice "menos de 5 células (linfocitos) por mililitro", en el cuerpo y en la tarjeta de repaso. Lo habitual es expresarlo por milímetro cúbico. | `11j` | Confirmar la unidad en el apunte original. Se dejó "por mililitro" marcado. |
| 3 | Presión del líquido cefalorraquídeo | El apunte da menos de 180 mm de agua. La nota agrega que en clase se dijo que equivale a "hasta 20 cm de agua", pero 180 mm son 18 cm. | `11j` | Aclarar cuál es el límite. La tabla usa 180 mm de agua, que es la cifra del apunte. |
| 4 | Perfil hepático remitido a otra nota | `09c` dice que los valores normales, el patrón por síndrome y la prueba de respuesta a la vitamina K "se desarrollan en 09d". `09d` no los trae: solo dice, en la colecistitis, que las transaminasas y la fosfatasa alcalina están "habitualmente normales", sin cifras, y no menciona la vitamina K. La bilirrubina normal está en `09a` (y en `05f`). El déficit de vitamina K está en `09a`. | `09c`, `09d`, `09a` | Corregir la remisión de `09c` o completar `09d`. Las transaminasas, la fosfatasa alcalina y el tiempo de protrombina siguen sin valor normal en las notas. |
| 5 | Leucocitos | La guía da de 4 000 a 10 000 por microlitro y los marca "fuera de notas". Sin embargo, `FISIOPATOLOGIA 2026/concepts/Leucocitos.md` (nota autogenerada) da un recuento normal de 4 500 a 11 000 por milímetro cúbico. | guía `ex.hemograma` | Decidir un solo rango. Si se usa el de la nota, cambiar la fuente. |
| 6 | Neutrófilos | "55 a 70%" no aparece en ninguna nota. `INMUNOLOGIA 2026/clases/04a_Los_fagocitos_monocitos_macrofagos_y_neutrofilos.md` solo dice que el neutrófilo es "70% de leucocitos". | guía `ex.hemograma` | Mantener la marca "fuera de notas". |
| 7 | Transaminasas | No hay rango normal en ninguna nota. Solo aparecen en casos clínicos con valores elevados. | guía `ex.hepatico` | Mantener la marca "fuera de notas". |
| 8 | Troponina | Está marcada "fuera de notas". `FISIOPATOLOGIA 2026/entities/enfermedades/Infarto-Subendocardico.md` habla de una "elevación por encima del percentil 99 del límite de referencia superior", que respalda en parte la entrada. | guía `ex.enzimas` | Valorar citar esa nota en vez de "fuera de notas". |
| 9 | Duraciones del electrocardiograma | Los apuntes de 2020 dan: onda P de 0,07 a 0,11, PR de 0,12 a 0,20 y QT de 0,34 a 0,44 segundos. Los de 2018 dan: P de 0,06 a 0,11, PR con un valor único de 0,11 y QT de 0,25 a 0,40 segundos. Para el eje, otros autores aceptan de −30 a 110 grados. | `08j` | La guía usa 2020. Contrastar el PR y el QT en clase. |
| 10 | Índice de Sokolow-Lyon | La tabla de la nota dice "S en V1 + R en V5 o V6 ≥ 35 mm". El pie de la imagen dice "V1 + V6". | `08k` | Menor: la guía usa la versión de la tabla. |
| 11 | Densidad urinaria | La nota la escribe "1.015 y 1.025 mg/ml". La densidad es relativa y no lleva esa unidad. | `10b` | La tabla la deja sin unidad. Corregir en la nota. |
| 12 | Deshidratación hipotónica | Los apuntes de 2020 ponen el corte en sodio menor de 130 mEq/L; los de 2018, en menor de 135 mEq/L. | `05b` | La guía usa 2020. Contrastar en clase. |
| 13 | Leucocitosis en la úlcera perforada | Los apuntes de 2020 dan más de 12 000; los de 2018, más de 15 000 en la tercera fase. | `09f` | Tenerlo presente al leer el hemograma del abdomen agudo. |
| 14 | Estadios de filtración glomerular | Para la "reserva funcional disminuida", 2020 da menos de 80 a 120 ml/min y 2018 da de 80 a menos de 100 ml/min. `10c` da como normal de 100 a 150, y `10b` da un promedio de 120. | `10c`, `10b` | La guía solo usa los estadios en que ambas fuentes coinciden (leve, moderada y grave). |
| 15 | Eritrocitosis excesiva | La nota da como criterio "≥ 21 g/dl en varones y ≥ 19 g/dl en mujeres", pero en su diagrama y en su lista escribe "> 21". | `FISIOPATOLOGIA 2026/entities/enfermedades/Eritrosis-Patologica-de-la-Altura.md` | Menor: la guía usa "21 o más". |

### Pendientes

**Guía y notas**

1. **Hemoglobina y oxígeno en altura.** Las notas no traen un rango normal de hemoglobina para 3 800 m, ni una presión arterial de oxígeno de referencia en altura. Solo traen el umbral de eritrocitosis excesiva, el comentario de clase de `05k` y la saturación de 88 a 92%. Conviene buscarlos en Fisiología o Fisiopatología de altura.
2. **Tuberculina negativa.** `07g` solo define la prueba positiva (más de 10 mm). La lectura "negativa: 10 mm o menos" de la guía es una inferencia.
3. **Fuentes incompletas en la guía.** Hay entradas que citan una sola nota cuando el dato está repartido en varias:
   - glucosa, "cuándo pedirlo": cita solo `09c`, pero el cardiópata está en `08f` y el síndrome nefrótico en `10c`;
   - función renal, "cuándo pedirlo": cita solo `09c`, pero la oliguria y el hipertenso están en `08g` y el cardiópata en `08f`;
   - orina, "cuantificar en 24 horas": cita solo `10c`, pero la preferencia por la orina de 24 horas está en `10b`.
4. **Creatina fosfocinasa sin valor en la guía.** `BIOQUIMICA 2026/concepts/Creatina-Quinasa-(CK).md` da de 20 a 200 U/L en varones y de 20 a 170 U/L en mujeres ("varían según el laboratorio"). La guía de enzimas no lo incluye.
5. **Prueba de esfuerzo.** `08f` también la contraindica en la insuficiencia cardíaca congestiva, y la entrada de la guía lo omite. En este documento ya se agregó.

**Datos de la app**

6. **Abreviaturas y diminutivos en `seed/guias.csv`.** Hay que corregir el texto de origen:
   - "TGO y TGP" (línea 810);
   - "vacunación con BCG" (línea 847);
   - "cuadradito" y "cuadraditos" (líneas 891 y 894);
   - "CPK" y "CK-MB" (líneas 915 y 916);
   - "PH" con mayúscula inicial (línea 830).

   En este documento ya se escribieron completos.
7. **Exámenes con guía pero sin frase en `f_examenes`.** Se escriben a mano:
   - electrolitos;
   - gasometría arterial;
   - prueba de tuberculina;
   - espirometría;
   - radiografía de abdomen;
   - tomografía;
   - Holter y prueba de esfuerzo;
   - ecocardiograma;
   - enzimas cardíacas;
   - endoscopía;
   - parasitológico de heces;
   - paracentesis;
   - toracocentesis;
   - líquido cefalorraquídeo.

   Se podría valorar agregar frases, sobre todo para electrolitos, gasometría y enzimas cardíacas.
8. **Ámbito del campo.** `exc.examenes` declara el ámbito de guía `exc.examenes`, que no tiene ninguna entrada. La guía llega por el prefijo `ex.`, que la pantalla recorre en las secciones de exámenes y de plan de trabajo.
9. **Ecografía y baciloscopia sin cifra normal.** Las notas no dan un "resultado normal" para ninguna de las dos. Las definiciones de `a8` y `a9` describen qué se anota, sin inventar una referencia.
