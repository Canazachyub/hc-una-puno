# 03 · Ectoscopía, examen físico general, signos vitales y escalas generales

> Documento de consulta del mapeo de HC App. Fuentes: seed/esquema.csv, seed/opciones.csv, seed/guias.csv y las notas de Semiología. Las definiciones y la guía son para estudiar y llenar la historia; no se imprimen en el Word.

## Resumen

Esta área cubre la primera mirada al paciente y las mediciones generales. La **ectoscopía** se escribe como un párrafo armado con frases prediseñadas (código `n` para el paciente sin alteraciones y códigos `a1` a `a13` para los hallazgos). El **examen físico general** reúne campos estructurados: estado general, nutricional y de hidratación, estado de conciencia, signos vitales, peso, talla, índice de masa corporal, escala de Glasgow, dolor y llenado capilar. Con los números que se ingresan, la app muestra una interpretación automática según los umbrales de la tabla más abajo.

- Secciones: 2 (I. Ectoscopía, 3.A.1 Examen físico general).
- Campos: 21 (14 obligatorios). Por tipo: Párrafo redactado 1, Una opción 4, Escala 5, Número 8, Texto corto 1, Calculado 2.
- Listas: 10 (`estado`, `glasgow_ao`, `glasgow_rv`, `glasgow_rm`, `eva`, `cruces`, `deshidratacion`, `conciencia`, `llenado_capilar`, `f_ectoscopia`). No usa listas de otras áreas.
- Guías: 210 filas (39 de ellas son de tipo «Umbrales» y repiten la tabla de interpretación).
- Umbrales de interpretación: 39 filas.
- Definiciones nuevas en `datos/definiciones-03.csv`: 16 (lista `estado` y significado clínico de los códigos `a1` a `a13` de la ectoscopía).

## Tabla rápida de valores normales (adulto en reposo)

| Parámetro | Valor normal | Cómo se mide / instrumento | Fuente |
|---|---|---|---|
| Presión arterial | Menor de 140/90 mmHg (ideal: menor de 120/80 mmHg) | Tensiómetro y estetoscopio; tras 5 minutos de reposo, brazo apoyado a nivel del corazón, en ambos brazos; método palpatorio y luego auscultatorio | 05h, 05d |
| Presión diferencial | 40 mmHg (rango 30 a 50) | Sistólica menos diastólica | 05d |
| Presión arterial media | 60 a 100 mmHg | (sistólica + 2 × diastólica) / 3 | 05d |
| Frecuencia cardíaca | 60 a 100 latidos por minuto (media 70) | Estetoscopio; contar un minuto completo y comparar con el pulso radial | 05e, 08c |
| Frecuencia respiratoria | 16 a 20 respiraciones por minuto | Observar el ascenso y descenso del tórax descubierto durante un minuto, en reposo | 05e |
| Temperatura | Axilar 36.5 °C (rango general 35 a 37 °C, hasta 37.2 °C por la tarde); oral 37 °C; rectal 37.5 °C | Termómetro clínico de 35 a 42 °C; axilar durante 5 minutos | 05e, 03b |
| Saturación de oxígeno | 95 a 100 % a nivel del mar. **En Puno (3 820 metros sobre el nivel del mar) 88 a 92 % puede ser normal**: interpretar según la altitud de residencia | Oxímetro de pulso en un dedo tibio y sin esmalte; leer con onda estable y anotar si respira aire ambiental u oxígeno | fuera de notas |
| Peso | Peso ideal (regla de Broca: talla en centímetros menos 100; en la mujer, menos 5 % adicional) más o menos 10 % | Balanza; misma hora y misma ropa (hospitalizado: antes del desayuno y en pijama) | 05c |
| Talla | Entre 1.50 y 1.90 metros en el varón y entre 1.50 y 1.80 metros en la mujer (fuera de esos límites: enanismo o gigantismo) | Tallímetro fijo o integrado a la balanza | 05c, 03b |
| Índice de masa corporal | 19 a 23 (clasificación de la nota 05c) | Peso en kilogramos entre la talla en metros al cuadrado; la app lo calcula | 05c |
| Escala de Glasgow | 15 puntos (apertura ocular 4 + respuesta verbal 5 + respuesta motora 6) | Suma de tres respuestas independientes | 05a |
| Dolor | 0 (sin dolor) en la escala visual análoga de 0 a 10 | Escala visual análoga o escala nominal (leve, moderado, severo) | 11g, 03b |
| Llenado capilar | Menor de 2 segundos | Presionar el lecho ungueal unos 5 segundos con la mano a nivel del corazón (el frío lo prolonga) | fuera de notas |
| Estado de conciencia | Lúcido y alerta, orientado en tiempo, espacio y persona | Observar desde que entra: conducta, comunicación y lo que refieren los familiares | 05a, 02c |

## Interpretación automática (umbrales de la app)

Vacío en «Desde» o «Hasta» = sin límite por ese lado. Los límites son inclusivos. La app redondea antes de comparar: temperatura e índice de masa corporal a un decimal, el resto a enteros.

| Dato | Desde | Hasta | La app muestra | Fuente |
|---|---|---|---|---|
| Presión arterial sistólica (mmHg) | 90 | 119 | Presión sistólica ideal | 05h |
| Presión arterial sistólica (mmHg) | 120 | 129 | Presión sistólica normal | 05h |
| Presión arterial sistólica (mmHg) | 130 | 139 | Presión sistólica limítrofe | 05h |
| Presión arterial sistólica (mmHg) | 140 | 159 | Hipertensión arterial grado I | 05h |
| Presión arterial sistólica (mmHg) | 160 | 179 | Hipertensión arterial grado II | 05h |
| Presión arterial sistólica (mmHg) | 180 |  | Hipertensión arterial grado III | 05h |
| Presión arterial sistólica (mmHg) |  | 89 | Hipotensión arterial | 05h |
| Presión arterial diastólica (mmHg) |  | 79 | Presión diastólica ideal | 05h |
| Presión arterial diastólica (mmHg) | 80 | 84 | Presión diastólica normal | 05h |
| Presión arterial diastólica (mmHg) | 85 | 89 | Presión diastólica limítrofe | 05h |
| Presión arterial diastólica (mmHg) | 90 | 99 | Hipertensión arterial grado I | 05h |
| Presión arterial diastólica (mmHg) | 100 | 109 | Hipertensión arterial grado II | 05h |
| Presión arterial diastólica (mmHg) | 110 |  | Hipertensión arterial grado III | 05h |
| Frecuencia cardíaca (latidos por minuto) | 60 | 100 | Normal (adulto en reposo) | 05e |
| Frecuencia cardíaca (latidos por minuto) | 101 |  | Taquicardia | 05e |
| Frecuencia cardíaca (latidos por minuto) |  | 59 | Bradicardia | 05e |
| Frecuencia respiratoria (respiraciones por minuto) | 16 | 20 | Normal (adulto en reposo) | 05e |
| Frecuencia respiratoria (respiraciones por minuto) | 21 |  | Taquipnea | 05e |
| Frecuencia respiratoria (respiraciones por minuto) |  | 15 | Bradipnea | 05e |
| Temperatura axilar (°C) | 35 | 37 | Normal | 05e |
| Temperatura axilar (°C) | 37.1 | 37.2 | Normal si es por la tarde (hasta 37,2 °C) | 05e |
| Temperatura axilar (°C) | 37.3 | 37.4 | Por encima de lo normal, sin llegar a febrícula | 05e |
| Temperatura axilar (°C) | 37.5 | 37.5 | Febrícula (fiebre leve) | 05e |
| Temperatura axilar (°C) | 37.6 | 38.5 | Fiebre moderada | 05e |
| Temperatura axilar (°C) | 38.6 |  | Fiebre elevada | 05e |
| Temperatura axilar (°C) | 28 | 34.9 | Hipotermia ligera | 05e |
| Temperatura axilar (°C) | 17 | 27.9 | Hipotermia profunda | 05e |
| Temperatura axilar (°C) |  | 16.9 | Hipotermia muy profunda | 05e |
| Saturación de oxígeno (%) | 95 | 100 | Normal | fuera de notas |
| Saturación de oxígeno (%) | 91 | 94 | Hipoxemia leve a nivel del mar (en altura puede ser normal) | fuera de notas |
| Saturación de oxígeno (%) | 86 | 90 | Hipoxemia moderada a nivel del mar (en altura, 88 a 92% puede ser normal) | fuera de notas |
| Saturación de oxígeno (%) |  | 85 | Hipoxemia severa | fuera de notas |
| Índice de masa corporal |  | 17.9 | Bajo peso | 05c |
| Índice de masa corporal | 18 | 18.9 | Entre bajo peso y normal (la nota 05c no clasifica de 18 a 18,9) | 05c |
| Índice de masa corporal | 19 | 23.9 | Normal | 05c |
| Índice de masa corporal | 24 | 25.9 | Sobrepeso | 05c |
| Índice de masa corporal | 26 | 39.9 | Obesidad | 05c |
| Índice de masa corporal | 40 |  | Obesidad mórbida | 05c |
| Glasgow total | 15 | 15 | Normal | fuera de notas |
| Glasgow total | 13 | 14 | Compromiso leve | fuera de notas |
| Glasgow total | 9 | 12 | Compromiso moderado | fuera de notas |
| Glasgow total | 3 | 8 | Compromiso grave: proteger la vía aérea | fuera de notas |

> Nota: la clasificación del índice de masa corporal es la de la nota 05c, distinta a la de la Organización Mundial de la Salud (normal 18.5 a 24.9, sobrepeso 25 a 29.9, obesidad 30 o más; fuera de notas). La saturación de oxígeno y la gravedad del Glasgow vienen de fuera de las notas de Semiología (hay respaldo parcial en otros cursos del wiki; ver Discrepancias).

## Ectoscopía

Título en la app: **I. Ectoscopía**.

**Guía general de la sección**

**Qué usar**

- Ninguno: la ectoscopia se hace solo con la vista, sin tocar ni usar instrumentos. — *05a*

**Cómo explorar**

- Primera mirada de pocos segundos: registrar buen, regular o mal estado general, escrito completo y no en siglas. — *05a*
- Nivel de conciencia desde que entra: conducta, comunicación y lo que dicen los familiares. Si hay coma, usar Glasgow. — *05a*
- Hidratación: piel, mucosas, ojos hundidos, peso y fontanelas en el niño. En ancianos, pliegue en región frontal o esternal. — *05b*
- Marcha: hacer caminar al paciente descalzo en un ambiente amplio. Ver velocidad, línea recta o desvío y braceo. — *05b*

**Qué buscar**

- Lenguaje: disfonía (voz ronca, laringe), disartria (voz baja, lenta y monótona) o disfasia (falla cortical) — *05a*
- Decúbito activo o pasivo, preferido (ortopnea, genupectoral, gatillo de fusil) u obligado (dorsal, ventral, lateral) — *05a*
- Biotipo por ángulo de Charpy: longilíneo menor de 90°, normolíneo igual a 90°, brevilíneo mayor de 90°. — *05b*

**Valores normales**

- Hidratación normal: piel rosada, elástica y húmeda, mucosas húmedas, sin hundimiento ocular ni caída brusca de peso. — *05b*
- Biotipo según el ángulo de Charpy: longilíneo menor de 90°, normolíneo igual a 90°, brevilíneo mayor de 90°. — *05b*

**Cómo interpretar**

- Deshidratación: sed, piel seca, pliegue cutáneo positivo, mucosas secas, ojos hundidos, taquicardia e hipotensión postural. — *05b*
- Deshidratación según el peso perdido: leve hasta 5 %, moderada de 5 a 10 %, grave más de 10 %. — *05b*
- Decúbito activo: cambia de posición por voluntad propia. Decúbito pasivo: no puede moverse (adinámicos o comatosos) — *05a*
- Ortopnea (sentado o semisentado para aliviar la disnea): insuficiencia cardiaca, edema agudo de pulmón, asma, ascitis. — *05a*
- Lenguaje: disfonía (laringe, voz ronca), disartria (músculos, voz lenta y monótona), disfasia (lesión cortical) — *05a*
- Asterixis (aleteo de las manos en extensión forzada): encefalopatía hepática o coma urémico. — *05b*

**No olvidar**

- En el anciano tomar el pliegue cutáneo en la región frontal o esternal: en el dorso de la mano da falsos positivos. — *05b*
- Facies hipocrática (ojos hundidos, nariz afilada, sudor, palidez): shock inminente, típica de la peritonitis generalizada. — *05k*

### Ectoscopía

| Dato | Detalle |
|---|---|
| Identificador | `ect.ectoscopia` |
| Tipo · Obligatorio | Párrafo redactado · Sí |
| Lista | Frases · ectoscopía (`f_ectoscopia`) |
| Valor normal | Paciente en aparente buen estado general, buen estado nutricional y buen estado de hidratación, que aparenta la edad que refiere. Despierto, lúcido, orientado en tiempo, espacio y persona, colaborador al interrogatorio. |
| Escalas que admite | Estado de conciencia (`conciencia`), Grado de deshidratación (`deshidratacion`), Palidez, ictericia o cianosis (`cruces`) |
| Reglas de redacción | En tercera persona; Con términos médicos |

*Guía: la misma de la sección Ectoscopía (arriba).*

**Lista `f_ectoscopia`** · Frases · ectoscopía · tipo frase · usada en `ect.ectoscopia`

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Paciente en aparente buen estado general, buen estado nutricional y buen estado de hidratación, que aparenta la edad que refiere. Despierto, lúcido, orientado en tiempo, espacio y persona, colaborador al interrogatorio. | Valor normal por defecto del campo (buen estado, según 05a). | 05a; 02c |
| `a1` | Con apoyo oxigenatorio por cánula binasal con una fracción inspirada de oxígeno de {fio2}. | Recibe oxígeno suplementario: sugiere hipoxemia o insuficiencia respiratoria; la saturación se interpreta junto con la fracción inspirada. | fuera de notas |
| `a2` | Porta vía periférica permeable en | Acceso venoso periférico para administrar líquidos o medicamentos; es un dato de la atención, no un hallazgo de enfermedad. | fuera de notas |
| `a3` | Paciente en aparente mal estado general. | Compromiso marcado del organismo por la enfermedad; si hay pocos signos que lo expliquen, obliga a buscar la causa. | 05a |
| `a4` | Somnoliento, despierta y obedece órdenes al estimularlo. | Letargo o somnolencia: despierta y obedece órdenes al estimularlo, pero vuelve a dormirse al cesar el estímulo. | 05a |
| `a5` | En decúbito pasivo, no cambia de posición por sí mismo. | No puede cambiar de posición y permanece como una masa inerte: propio de enfermos adinámicos o comatosos. | 05a |
| `a6` | Adopta posición de ortopnea, sentado o semisentado. | Decúbito preferido para aliviar la disnea: insuficiencia cardíaca congestiva, edema agudo de pulmón, asma bronquial o ascitis. | 05a |
| `a7` | Adopta decúbito forzado {decubito}. | Postura obligada por la enfermedad: dorsal (fractura de columna, irritación peritoneal), ventral (cólicos) o lateral sobre el lado sano (pleuritis). | 05a |
| `a8` | Facies {facies}. | Rasgos del rostro que orientan a una enfermedad: mitral (estenosis mitral), hipocrática (shock inminente), de Cushing, mixedematosa, entre otras. | 05k |
| `a9` | Piel y mucosas pálidas. | Palidez generalizada: vasoconstricción (susto, dolor, shock) o anemia con hemoglobina real menor de 7 g/dl. | 05f |
| `a10` | Ictericia en piel, mucosas y escleróticas. | Hiperbilirrubinemia (bilirrubina mayor de 2.5 mg%): causa prehepática (hemólisis), hepática (hepatitis, cirrosis) o poshepática (obstrucción). | 05f; 05k |
| `a11` | Cianosis en labios, punta de la nariz, lóbulos de la oreja y pulpejos de los dedos. | Hemoglobina reducida mayor de 5 g/dl; con sudoración fría obliga a pensar en bajo gasto cardíaco o hipoxemia. | 05f |
| `a12` | Piel seca con elasticidad y turgor disminuidos, signo del pliegue positivo; mucosas secas. | Deshidratación por pérdidas (diarrea, vómitos, fiebre); se gradúa por el peso perdido en leve, moderada o grave. | 05b |
| `a13` | Adenopatías palpables en región {region_ganglio}, de {cm} cm. | Ganglio aumentado: infección, linfoma, tuberculosis o metástasis según la cadena; el supraclavicular izquierdo (Virchow) sugiere cáncer gástrico. | 05j |

*Escalas que admite: `conciencia` se detalla en Estado de conciencia; `deshidratacion` y `cruces`, en Escalas complementarias.*

## Examen físico general

Título en la app: **3.A.1 Examen físico general**.

**Guía general de la sección**

**Qué usar**

- Lupa para lesiones cutáneas pequeñas (aumenta 4 a 8 veces). Linterna y bajalenguas para cavidades. — *03b*

**Posición**

- Buena luz, de preferencia natural. Descubrir solo la región que se examina y mantener cubierto el resto. — *03*
- Piel: decúbito dorsal, zona descubierta, recorrer toda la superficie corporal solo con inspección y palpación. — *05f*

**Cómo explorar**

- Orden clásico: inspección, palpación, percusión y auscultación. En el abdomen la auscultación va antes de palpar. — *03*
- Antes de palpar, calentar las manos frotándolas entre sí y llevar las uñas cortas. — *03*
- Ganglios: palpar con los pulpejos de índice, medio y anular las cadenas cervicocefálica, axilar e inguinal. — *05j*

**Qué buscar**

- Piel: coloración (palidez, cianosis, ictericia), humedad, espesor, temperatura, elasticidad, sensibilidad y lesiones. — *05f*
- Ganglio palpable: localización, tamaño, consistencia, movilidad, dolor y piel. Supraclavicular izquierdo: Virchow. — *05j*

### Estado general

| Dato | Detalle |
|---|---|
| Identificador | `efg.estado_general` |
| Tipo · Obligatorio | Una opción · Sí |
| Lista | Estado (`estado`) |
| Valor normal | Bueno |
| Escalas que admite | — |
| Reglas de redacción | — |

**Guía · Estado general, nutricional y de hidratación** (ámbito `efg.estado`)

**Valores normales**

- Se registra como buen, regular o mal estado general, según cuánto ha comprometido la enfermedad al paciente. — *05a*
- La apreciación general incluye edad, estado general, lucidez, orientación, nutrición, hidratación, actitud y facies. — *02c*
- Nutrición normal: peso, musculatura, panículo adiposo, desarrollo, piel, pelos y ojos dentro de límites normales. — *05c*

**Cómo interpretar**

- Mal estado general con pérdida de peso extrema: caquexia, propia de enfermedades consuntivas avanzadas. — *05c*

**No olvidar**

- Escribirlo completo, no con iniciales, porque tiene implicancia médico-legal. — *05a*
- Un estado general deteriorado con pocos signos que lo justifiquen es una alerta para buscar la causa. — *05a*

**Lista `estado`** · Estado · tipo opción · usada en `efg.estado_general`, `efg.estado_nutricional`, `efg.estado_hidratacion`

| Opción | Definición | Fuente |
|---|---|---|
| Bueno | La enfermedad apenas compromete al paciente; peso, musculatura, panículo adiposo, piel y mucosas húmedas dentro de límites normales. | 05a; 05b; 05c · nueva en el CSV |
| Regular | Apreciación subjetiva intermedia: la enfermedad compromete al paciente en forma parcial, sin llegar al deterioro marcado. | 05a · nueva en el CSV |
| Malo | Compromiso marcado: deterioro general, peso bajo el mínimo normal o deshidratación con piel seca y pliegue positivo. | 05a; 05b; 05c · nueva en el CSV |

### Estado nutricional

| Dato | Detalle |
|---|---|
| Identificador | `efg.estado_nutricional` |
| Tipo · Obligatorio | Una opción · Sí |
| Lista | Estado (`estado`) |
| Valor normal | Bueno |
| Escalas que admite | — |
| Reglas de redacción | — |

*Guía: la misma de **Estado general** (arriba).*

*Lista `estado`: ver **Estado general**.*

### Estado de hidratación

| Dato | Detalle |
|---|---|
| Identificador | `efg.estado_hidratacion` |
| Tipo · Obligatorio | Una opción · Sí |
| Lista | Estado (`estado`) |
| Valor normal | Bueno |
| Escalas que admite | — |
| Reglas de redacción | — |

*Guía: la misma de **Estado general** (arriba).*

*Lista `estado`: ver **Estado general**.*

### Estado de conciencia

| Dato | Detalle |
|---|---|
| Identificador | `efg.conciencia` |
| Tipo · Obligatorio | Escala · Sí |
| Lista | Estado de conciencia (`conciencia`) |
| Valor normal | Lúcido |
| Escalas que admite | Estado de conciencia (`conciencia`) |
| Reglas de redacción | — |

**Guía · Estado de conciencia** (ámbito `efg.conciencia`)

**Valores normales**

- Lúcido y alerta: estado normal de conciencia. — *05a*
- Registrar la orientación en tiempo, espacio y persona. — *02c*

**Cómo interpretar**

- Estado crepuscular: conciencia levemente disminuida. Confusional: respuestas inadecuadas, con poca atención y memoria. — *05a*
- Letargo o somnolencia: despierta y obedece órdenes al estimularlo, pero vuelve a dormirse si cesa el estímulo. — *05a*
- Delirio: dormido pero inquieto, confuso, con habla incoherente, no despierta con estímulos verbales. — *05a*
- Estupor: despierta solo con estímulos intensos y repetidos, y responde de forma inadecuada al dolor. — *05a*
- Coma grado I: atiende órdenes simples. Grado II: responde apenas al dolor enérgico, con los reflejos conservados. — *05a*
- Coma con miosis y reflejo fotomotor conservado: sugiere coma metabólico o herniación central. — *11e*

**No olvidar**

- Coma grado III: sin respuesta, arreflexia e incontinencia. Grado IV: apnea con respirador y silencio eléctrico cerebral. — *05a*
- Pupilas puntiformes: lesión pontina u opioides. Midriasis sin reflejo fotomotor: disfunción mesencefálica. — *11e*

**Lista `conciencia`** · Estado de conciencia · tipo escala · usada en `ect.ectoscopia`, `efg.conciencia`, `efr.neurologico`, `dx.resumen`, `evo.evolucion`

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| Lúcido | Despierto y orientado | — |
| Somnoliento | Despierta al llamado | — |
| Obnubilado | Respuestas lentas y desorientadas | — |
| Estuporoso | Solo responde al dolor | — |
| Comatoso | No responde | — |

*Sin formato de salida en el paquete: se registra el nivel o puntaje elegido tal cual.*

### Presión arterial sistólica (mmHg)

| Dato | Detalle |
|---|---|
| Identificador | `efg.pa_sistolica` |
| Tipo · Obligatorio | Número · Sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

**Guía · Presión arterial** (ámbito `efg.pa`)

**Qué usar**

- Tensiómetro y estetoscopio con diafragma. Manguito adulto 12 x 23 cm, 18-20 cm de ancho en obesos o muslo. — *05d*

**Posición**

- Decúbito dorsal (o sentado o de pie) en ambiente tranquilo. Si llega de la calle, reposo de 5 minutos antes. — *05d*
- Brazo apoyado en horizontal, con la arteria braquial a nivel del corazón (4.º espacio intercostal) — *05d*

**Cómo explorar**

- Manguito desinflado sobre piel sin ropa, cubre 2/3 del brazo, borde inferior 2 traveses sobre el codo, ni apretado ni flojo. — *05d*
- Palpatorio: insuflar hasta que desaparezca el pulso, desinflar despacio y marcar dónde reaparece (solo sistólica) — *05d*
- Auscultatorio: insuflar 30 mmHg sobre la sistólica palpatoria, diafragma sobre la braquial, desinflar 2-3 mmHg por vez. — *05d*
- Medir en ambos brazos y repetir al final del examen: la 2.ª o 3.ª toma suele ser más baja y fidedigna. — *05d*

**Qué buscar**

- Korotkoff: fase I (primer ruido) es la sistólica y fase V (desaparición) la diastólica. Atención al hueco auscultatorio. — *05d*

**Valores normales**

- Adulto: se aceptan como normales valores menores de 140/90 mmHg. — *05h*
- Presión diferencial normal: 40 mmHg (rango 30 a 50). Mayor de 40: divergente. Menor de 30: convergente. — *05d*
- Presión arterial media normal: 60 a 100 mmHg. Menor de 60: isquemia cerebral. Mayor de 140: riesgo de accidente cerebrovascular. — *05d*

**Cómo interpretar**

- Presión arterial de 140/90 mmHg o más, confirmada en dos o más mediciones: hipertensión arterial. — *05h*
- Hipertensión sistólica aislada: sistólica mayor de 140 mmHg con diastólica menor de 90 mmHg. — *05h*
- Hipotensión postural: caída de 20 mmHg en la sistólica o 10 mmHg en la diastólica al pasar de decúbito a de pie. — *05h*

**No olvidar**

- Tomar tras 5 minutos de reposo, con el brazo apoyado a nivel del corazón, en ambos brazos, y repetir al final del examen. — *05d*
- Un manguito pequeño o flojo, o el manómetro por debajo del corazón, dan cifras falsamente altas. Lo contrario las da falsamente bajas. — *05d*
- No medir sobre la ropa, ni con dolor intenso, ejercicio reciente o café o alcohol en la última hora. Esperar 1 a 3 minutos entre tomas. — *05h*
- Anciano con radial palpable pese a que el manguito ocluye la braquial: sospechar pseudohipertensión (el valor real es menor) — *05h*

*Este ámbito tiene además 13 filas de tipo «Umbrales»; se muestran en la tabla de Interpretación automática.*

### Presión arterial diastólica (mmHg)

| Dato | Detalle |
|---|---|
| Identificador | `efg.pa_diastolica` |
| Tipo · Obligatorio | Número · Sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

*Guía: la misma de **Presión arterial sistólica (mmHg)** (arriba).*

### Frecuencia cardíaca (latidos por minuto)

| Dato | Detalle |
|---|---|
| Identificador | `efg.fc` |
| Tipo · Obligatorio | Número · Sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

**Guía · Frecuencia cardíaca** (ámbito `efg.fc`)

**Qué usar**

- Estetoscopio para auscultar los latidos, contados durante un minuto completo. — *08c*

**Posición**

- Paciente en reposo, tórax descubierto, ambiente silencioso y receptor directo sobre la piel. — *08c*

**Cómo explorar**

- Contar los latidos durante un minuto completo. — *05e*
- Comparar la frecuencia auscultada con el pulso radial. Si el corazón late más que el pulso hay déficit de pulso. — *08c*

**Qué buscar**

- Adulto en reposo 60-100 latidos por minuto. Menos de 60 bradicardia, más de 100 taquicardia, fisiológicas o patológicas. — *05e*
- Arritmia sinusal normal: sube en inspiración y baja en espiración. Otra irregularidad sugiere arritmia, confirmar con electrocardiograma. — *08c*
- Valores por edad: recién nacido 130-160, lactante 110-130, niño 80-120 latidos por minuto. — *08c*

**Valores normales**

- Adulto en reposo: 60 a 100 latidos por minuto, con una media de 70. — *08c*
- Recién nacido: 130 a 160 latidos por minuto. Lactante: 110 a 130. Niño: 80 a 120. — *08c*
- Arritmia sinusal fisiológica: la frecuencia aumenta en la inspiración y disminuye en la espiración, frecuente en niños y jóvenes. — *08c*

**Cómo interpretar**

- Más de 100 latidos por minuto: taquicardia (ejercicio, emociones, fiebre, hipertiroidismo, hipovolemia, shock) — *05d*
- Menos de 60 latidos por minuto: bradicardia (sueño, atletas, hipotiroidismo, betabloqueadores, digitálicos, bloqueo auriculoventricular) — *05d*
- Por cada grado centígrado de fiebre sobre 37 °C la frecuencia aumenta 12 a 15 latidos por minuto (2018: 10 a 15) — *05d*
- Pulso lento de 30 a 40 latidos por minuto: sospechar bloqueo auriculoventricular total. — *05d*

**No olvidar**

- Contar durante un minuto completo y comparar con la frecuencia auscultada: si el corazón late más que el pulso radial hay déficit de pulso. — *08c*
- El déficit de pulso es típico de la fibrilación auricular y las extrasístoles: contar solo el pulso radial subestima la frecuencia real. — *08c*

*Este ámbito tiene además 3 filas de tipo «Umbrales»; se muestran en la tabla de Interpretación automática.*

### Frecuencia respiratoria (respiraciones por minuto)

| Dato | Detalle |
|---|---|
| Identificador | `efg.fr` |
| Tipo · Obligatorio | Número · Sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

**Guía · Frecuencia respiratoria** (ámbito `efg.fr`)

**Posición**

- Paciente en reposo con el tórax descubierto. — *05e*

**Cómo explorar**

- Contar las respiraciones de un minuto observando el ascenso y descenso del tórax. — *05e*

**Qué buscar**

- Adulto 16-20 respiraciones por minuto. Taquipnea más de 20 con respiración superficial, bradipnea menos de 16. — *05e*
- Valores por edad: recién nacido 40-45, lactante 25-35, preescolar 30, escolar 18-22 respiraciones por minuto. — *07b*
- Ritmo: Cheyne-Stokes, Biot, Kussmaul o suspirosa. Apnea: pausa respiratoria de 15 a 20 segundos. — *07b*
- Tipo: costoabdominal en varón, costal superior en mujer, abdominal en niño. Movimientos simétricos. — *07b*
- Polipnea: aumento de frecuencia y profundidad. La fiebre sube la frecuencia respiratoria 4-5 por minuto por cada grado. — *07b*

**Valores normales**

- Adulto en reposo: 16 a 20 respiraciones por minuto. — *05e*
- Recién nacido: 40 a 45. Lactante: 25 a 35. Preescolar: 30. Escolar: 18 a 22 respiraciones por minuto. — *07b*

**Cómo interpretar**

- Más de 20 respiraciones por minuto con respiración superficial: taquipnea (fiebre, neumonía, edema agudo de pulmón, acidosis metabólica) — *07b*
- Menos de 16 respiraciones por minuto: bradipnea (sueño, atletas, barbitúricos u opiáceos, alcalosis metabólica, coma diabético) — *07b*
- Polipnea: aumento de la frecuencia y de la profundidad. Apnea: paro respiratorio momentáneo de 15 a 20 segundos. — *07b*
- La fiebre aumenta la frecuencia respiratoria en 4 a 5 respiraciones por minuto por cada grado. — *07b*

**No olvidar**

- Medir en reposo, observando el ascenso y descenso del tórax descubierto del paciente. — *05e*
- Ritmo de Kussmaul (inspiración amplia y rápida, espiración ruidosa y profunda): acidosis metabólica, cetoacidosis diabética, uremia. — *07b*
- Cheyne-Stokes: amplitud creciente y luego decreciente con apnea de 10 a 60 segundos. Insuficiencia cardiaca, hipertensión endocraneana. — *07b*
- Respiración de Biot: apnea franca alternada con respiración anárquica e irregular, signo de compromiso cerebral grave. — *07b*

*Este ámbito tiene además 3 filas de tipo «Umbrales»; se muestran en la tabla de Interpretación automática.*

### Temperatura axilar (°C)

| Dato | Detalle |
|---|---|
| Identificador | `efg.temperatura` |
| Tipo · Obligatorio | Número · Sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

**Guía · Temperatura** (ámbito `efg.temperatura`)

**Qué usar**

- Termómetro clínico graduado de 35 a 42 °C. — *03b*

**Cómo explorar**

- Sitio habitual axilar (dejar 5 minutos), oral o rectal. La oral se altera si tomó bebidas frías o calientes. — *05e*
- Abdomen agudo: toma axilo-rectal, primero axilar y luego rectal. Diferencia esperada unos 0.8 °C a favor de la rectal. — *05e*
- Estimación rápida con el dorso de la mano, nunca la palma, comparando regiones simétricas. — *05f*

**Qué buscar**

- Normal: axilar 36.5 °C, oral 37 °C, rectal 37.5 °C. — *05e*
- Axilar: fiebre leve 37.5 °C, moderada 37.6-38.5 °C, elevada más de 38.6 °C. Hipotermia menos de 35 °C. — *05e*
- En el anciano 37.5 °C ya puede ser anormal. La fiebre referida siempre se confirma con termómetro. — *05e*

**Valores normales**

- Axilar 36.5 °C, oral 37 °C, rectal 37.5 °C. — *05e*
- Valor normal general de 35 a 37 °C. Más baja en la mañana y hasta 37.2 °C por la tarde. — *05e*
- Alza fisiológica: ovulación (hasta 37.2 a 37.3 °C) y ejercicio muscular intenso o insolación (hasta 39 °C) — *05e*

**Cómo interpretar**

- Abdomen agudo: toma axilo-rectal. Una diferencia rectal mayor de la esperada (0.8 a 1 °C) orienta a inflamación intraabdominal. — *05e*
- Fiebre prolongada (más de una semana): tuberculosis, septicemia, malaria, endocarditis bacteriana, fiebre tifoidea. — *05e*

**No olvidar**

- La toma axilar requiere 5 minutos. La oral se altera si el paciente tomó hace poco bebidas frías o calientes. — *05e*
- En el anciano 37.5 °C ya puede ser anormal y sugerir infección grave, sobre todo con taquipnea, tos o malestar general. — *05e*
- Los pacientes en shock y los ancianos pueden cursar solo con febrícula pese a una infección grave. — *05e*
- La sensación subjetiva de fiebre (por ejemplo, los bochornos de la menopausia) debe confirmarse siempre con termómetro. — *05e*

*Este ámbito tiene además 7 filas de tipo «Umbrales»; se muestran en la tabla de Interpretación automática.*

### Saturación de oxígeno (%)

| Dato | Detalle |
|---|---|
| Identificador | `efg.sato2` |
| Tipo · Obligatorio | Número · Sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

**Guía · Saturación de oxígeno** (ámbito `efg.sato2`)

**Cómo explorar**

- Oxímetro de pulso en un dedo tibio y sin esmalte; leer cuando la onda sea estable y anotar si respira aire ambiental u oxígeno. — *fuera de notas*

**Qué buscar**

- Cianosis (hemoglobina reducida mayor de 5 g/dl) en labios, punta de la nariz, lóbulos de la oreja y pulpejos. — *05f*
- Cianosis en labios y pulpejos con sudoración fría obliga a pensar en bajo gasto o hipoxemia. — *05f*
- Aleteo nasal exagerado: disnea intensa (bronconeumonía, asma infantil) — *06b*
- Hipocratismo digital (dedos en palillo de tambor): enfermedades pulmonares crónicas. — *07b*

**Valores normales**

- La saturación de oxígeno se registra junto con peso, talla y frecuencias respiratoria y cardiaca en toda evaluación clínica. — *05e*
- A nivel del mar, la saturación de oxígeno normal es de 95 a 100 %. — *fuera de notas*

**No olvidar**

- En altura (Puno, 3820 metros sobre el nivel del mar) la saturación basal es menor: interpretar según la altitud de residencia. — *fuera de notas*
- Lectura falsa con manos frías, mala perfusión, movimiento o esmalte de uñas: verificar que la onda de pulso sea adecuada. — *fuera de notas*

*Este ámbito tiene además 4 filas de tipo «Umbrales»; se muestran en la tabla de Interpretación automática.*

### Fracción inspirada de oxígeno o soporte de oxígeno

| Dato | Detalle |
|---|---|
| Identificador | `efg.fio2` |
| Tipo · Obligatorio | Texto corto · No |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

*Guía: la misma de **Saturación de oxígeno (%)** (arriba).*

### Peso (kg)

| Dato | Detalle |
|---|---|
| Identificador | `efg.peso` |
| Tipo · Obligatorio | Número · No |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

**Guía · Peso, talla e índice de masa corporal** (ámbito `efg.peso_talla`)

**Qué usar**

- Balanza: una propia para el recién nacido y cama-balanza para quien no puede levantarse. — *05c*
- Tallímetro fijo o integrado a la balanza. Cinta métrica para perímetros corporales. — *03b*

**Cómo explorar**

- Pesar siempre a la misma hora y con la misma ropa. Hospitalizado: antes del desayuno y en pijama. — *05c*
- Peso ideal (Broca): talla en cm menos 100, en la mujer restar además 5%. Rango normal: peso ideal más o menos 10%. — *05c*
- Índice de masa corporal = peso en kg / talla en metros al cuadrado. — *05c*

**Qué buscar**

- Índice de masa corporal: bajo peso menos de 18, normal 19-23, sobrepeso 24-25, obesidad más de 26, obesidad mórbida más de 40. — *05c*
- Enanismo: talla menor de 1.50 m. Gigantismo: más de 1.90 m en varón o 1.80 m en mujer. — *05c*
- Grasa central o androide (tórax y abdomen) frente a periférica o ginecoide (caderas y nalgas) — *05c*

**Valores normales**

- Peso ideal (regla de Broca): talla en centímetros menos 100, expresado en kilogramos. En la mujer se resta además un 5 %. — *05c*
- Rango normal de peso: peso ideal más o menos 10 % (peso mínimo normal y peso máximo normal) — *05c*
- Índice de masa corporal: peso en kilogramos dividido entre la talla en metros al cuadrado. — *05c*
- Recién nacido: 3200 gramos y 50 centímetros. Duplica su peso al quinto mes y lo triplica al año. — *05c*

**Cómo interpretar**

- Talla menor de 1.50 metros: enanismo. Mayor de 1.90 metros en varones o de 1.80 metros en mujeres: gigantismo. — *05c*
- Desnutrición (criterios de Gómez) según déficit de peso: primer grado más de 10 %, segundo más de 25 %, tercero más de 40 %. — *05c*
- Caquexia: pérdida de peso extrema con compromiso del estado general (neoplasia maligna, tuberculosis avanzada, cirrosis hepática) — *05c*
- Obesidad central (tórax y abdomen): se asocia a diabetes, hipertensión arterial e infarto. Periférica (caderas y nalgas): menor riesgo. — *05c*

**No olvidar**

- Pesar siempre a la misma hora y con la misma ropa. En hospitalizados, antes del desayuno y en pijama. — *05c*
- Las notas usan otra escala. Organización Mundial de la Salud: normal 18.5 a 24.9, sobrepeso 25 a 29.9, obesidad 30 o más. — *fuera de notas*

*Este ámbito tiene además 5 filas de tipo «Umbrales»; se muestran en la tabla de Interpretación automática.*

### Talla (m)

| Dato | Detalle |
|---|---|
| Identificador | `efg.talla` |
| Tipo · Obligatorio | Número · No |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

*Guía: la misma de **Peso (kg)** (arriba).*

### Índice de masa corporal

| Dato | Detalle |
|---|---|
| Identificador | `efg.imc` |
| Tipo · Obligatorio | Calculado · No |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | Se calcula (`peso/talla^2`: peso en kilogramos entre la talla en metros al cuadrado) |

*Guía: la misma de **Peso (kg)** (arriba).*

### Glasgow · apertura ocular

| Dato | Detalle |
|---|---|
| Identificador | `efg.glasgow_ao` |
| Tipo · Obligatorio | Escala · Sí |
| Lista | Glasgow · apertura ocular (`glasgow_ao`) |
| Valor normal | 4 |
| Escalas que admite | Glasgow · apertura ocular (`glasgow_ao`) |
| Reglas de redacción | — |

**Guía · Escala de Glasgow** (ámbito `efg.glasgow`)

**Cómo explorar**

- Valorar 3 respuestas independientes y sumarlas: ocular (1-4), motora (1-6) y verbal (1-5). Total de 3 a 15. — *05a*
- Ocular: espontánea 4, al sonido 3, al dolor 2, ninguna 1. — *05a*
- Motora: obedece órdenes 6, localiza el dolor 5, flexión y retiro 4, flexión anormal 3, extensión 2, ninguna 1. — *05a*
- Verbal: orientado 5, conversación confusa 4, palabras inapropiadas 3, sonidos incomprensibles 2, ninguna 1. — *05a*
- Evaluar la conciencia desde que entra, observando conducta, comunicación y lo que refieren los familiares. — *05a*

**Qué buscar**

- Continuo: lúcido, crepuscular, confusional, somnolencia, delirio, estupor y coma grados I a IV. — *05a*
- Coma II: responde apenas al dolor enérgico con reflejos conservados. Coma III: sin respuesta, arreflexia, incontinencia. — *05a*

**Valores normales**

- Puntaje de 3 (sin ninguna respuesta) a 15 (paciente lúcido: ocular 4 + motora 6 + verbal 5) — *05a*
- Apertura ocular: espontánea 4, al sonido 3, al dolor 2, ninguna 1. — *05a*
- Respuesta motora: obedece órdenes 6, localiza el dolor 5, flexión y retiro 4, flexión anormal 3, extensión 2, ninguna 1. — *05a*
- Respuesta verbal: orientado 5, conversación confusa 4, palabras inapropiadas 3, sonidos incomprensibles 2, ninguna 1. — *05a*

**Cómo interpretar**

- Flexión anormal (3 puntos motores) es decorticación. Extensión anormal (2 puntos) es decerebración, de peor pronóstico. — *11e*
- Clasificación del traumatismo craneoencefálico: 13 a 15 leve, 9 a 12 moderado, 8 o menos grave. — *fuera de notas*

**No olvidar**

- Glasgow de 8 o menos: proteger la vía aérea y considerar la intubación. — *fuera de notas*
- En coma: asegurar la vía aérea e inmovilizar la columna cervical antes de cualquier movilización. — *11e*

*Este ámbito tiene además 4 filas de tipo «Umbrales»; se muestran en la tabla de Interpretación automática.*

**Lista `glasgow_ao`** · Glasgow · apertura ocular · tipo escala · usada en `efg.glasgow_ao`

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| 4 | Espontánea | — |
| 3 | A la orden verbal | — |
| 2 | Al dolor | — |
| 1 | Ninguna | — |

*Sin formato de salida en el paquete: se registra el nivel o puntaje elegido tal cual.*

### Glasgow · respuesta verbal

| Dato | Detalle |
|---|---|
| Identificador | `efg.glasgow_rv` |
| Tipo · Obligatorio | Escala · Sí |
| Lista | Glasgow · respuesta verbal (`glasgow_rv`) |
| Valor normal | 5 |
| Escalas que admite | Glasgow · respuesta verbal (`glasgow_rv`) |
| Reglas de redacción | — |

*Guía: la misma de **Glasgow · apertura ocular** (arriba).*

**Lista `glasgow_rv`** · Glasgow · respuesta verbal · tipo escala · usada en `efg.glasgow_rv`

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| 5 | Orientada | — |
| 4 | Confusa | — |
| 3 | Palabras inapropiadas | — |
| 2 | Sonidos incomprensibles | — |
| 1 | Ninguna | — |

*Sin formato de salida en el paquete: se registra el nivel o puntaje elegido tal cual.*

### Glasgow · respuesta motora

| Dato | Detalle |
|---|---|
| Identificador | `efg.glasgow_rm` |
| Tipo · Obligatorio | Escala · Sí |
| Lista | Glasgow · respuesta motora (`glasgow_rm`) |
| Valor normal | 6 |
| Escalas que admite | Glasgow · respuesta motora (`glasgow_rm`) |
| Reglas de redacción | — |

*Guía: la misma de **Glasgow · apertura ocular** (arriba).*

**Lista `glasgow_rm`** · Glasgow · respuesta motora · tipo escala · usada en `efg.glasgow_rm`

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| 6 | Obedece órdenes | — |
| 5 | Localiza el dolor | — |
| 4 | Retira al dolor | — |
| 3 | Flexión anormal (decorticación) | — |
| 2 | Extensión anormal (descerebración) | — |
| 1 | Ninguna | — |

*Sin formato de salida en el paquete: se registra el nivel o puntaje elegido tal cual.*

### Glasgow total

| Dato | Detalle |
|---|---|
| Identificador | `efg.glasgow_total` |
| Tipo · Obligatorio | Calculado · No |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | Se calcula (`ao+rv+rm`: apertura ocular + respuesta verbal + respuesta motora) |

*Guía: la misma de **Glasgow · apertura ocular** (arriba).*

### Dolor (escala visual análoga)

| Dato | Detalle |
|---|---|
| Identificador | `efg.eva` |
| Tipo · Obligatorio | Escala · No |
| Lista | Dolor · escala visual análoga (`eva`) |
| Valor normal | — |
| Escalas que admite | Dolor · escala visual análoga (`eva`) |
| Reglas de redacción | — |

**Guía · Dolor (escala visual análoga)** (ámbito `efg.eva`)

**Cómo explorar**

- Medir la intensidad con escala nominal (leve, moderado, severo) o con escala visual analógica. — *03b*
- Caracterizar en orden: antigüedad, localización e irradiación, carácter, intensidad y factores agravantes o atenuantes. — *03b*
- En el adulto mayor preguntar siempre por dolor aunque no lo refiera (quinto signo vital), suele ser atípico. — *03b*

**Qué buscar**

- Agudo: minutos a una semana, con fenómenos autonómicos. Crónico: meses, con alteraciones psíquicas. — *03b*
- Carácter: punzante, urente, opresivo, transfixiante, sordo, fulgurante, terebrante, pulsátil, cólico, gravitativo. — *03b*
- Somático bien localizado, visceral difuso, neuropático con alodinia, hiperalgesia o hiperpatía. — *03b*

**Valores normales**

- La intensidad del dolor se mide con la escala visual análoga de 0 a 10. — *11g*
- La intensidad también puede registrarse en escala nominal: leve, moderado o severo. — *03b*

**Cómo interpretar**

- Quien consulta suele tener una intensidad mayor de 4. Con intensidad de 1 a 3, en general no acude al médico. — *11g*
- 0 sin dolor, 1 a 3 dolor leve, 4 a 6 dolor moderado, 7 a 10 dolor severo. — *fuera de notas*
- Un dolor visceral puede sentirse en una zona somática alejada del órgano enfermo (dolor referido) — *03b*

**No olvidar**

- En el adulto mayor el dolor es el quinto signo vital: indagarlo aunque no lo refiera, porque su presentación suele ser atípica. — *03b*

**Lista `eva`** · Dolor · escala visual análoga · tipo escala · usada en `ea.relato_cronologico`, `efg.eva`, `efr.abdomen_palpacion`, `efr.genitourinario`, `efr.columna`, `dx.resumen`, `evo.evolucion`

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| 0 | Sin dolor | Intensidad 0/10 en la escala visual análoga |
| 1 | Leve | Intensidad 1/10 en la escala visual análoga |
| 2 | Leve | Intensidad 2/10 en la escala visual análoga |
| 3 | Leve | Intensidad 3/10 en la escala visual análoga |
| 4 | Moderado | Intensidad 4/10 en la escala visual análoga |
| 5 | Moderado | Intensidad 5/10 en la escala visual análoga |
| 6 | Moderado | Intensidad 6/10 en la escala visual análoga |
| 7 | Severo | Intensidad 7/10 en la escala visual análoga |
| 8 | Severo | Intensidad 8/10 en la escala visual análoga |
| 9 | Severo | Intensidad 9/10 en la escala visual análoga |
| 10 | Máximo | Intensidad 10/10 en la escala visual análoga |

### Llenado capilar

| Dato | Detalle |
|---|---|
| Identificador | `efg.llenado_capilar` |
| Tipo · Obligatorio | Una opción · No |
| Lista | Llenado capilar (`llenado_capilar`) |
| Valor normal | Menor de 2 segundos |
| Escalas que admite | — |
| Reglas de redacción | — |

**Guía · Llenado capilar** (ámbito `efg.llenado_capilar`)

**Cómo explorar**

- Las notas no describen la prueba de llenado capilar. La digitopresión con el pulpejo sirve para valorar circulación cutánea. — *03*

**Qué buscar**

- Signo de Quincke: rubor y palidez alternos del lecho ungueal, más visible con el miembro elevado (insuficiencia aórtica) — *08e*
- Palidez localizada en un solo miembro: isquemia por obstrucción arterial (ateroesclerosis o embolia femoral o poplítea) — *05f*
- Piel fría y sudorosa en el shock. Zona distal fría como hielo si se obstruye un tronco arterial. — *05e*

**Valores normales**

- Llenado capilar normal: menos de 2 segundos. — *fuera de notas*

**Cómo interpretar**

- Llenado capilar de más de 2 segundos: sugiere hipoperfusión periférica (deshidratación, shock) — *fuera de notas*
- Hipotensión con pulso filiforme, taquicardia y signos de mala perfusión tisular orienta a shock. — *05h*

**No olvidar**

- Presionar el lecho ungueal unos 5 segundos con la mano a nivel del corazón. El ambiente frío lo prolonga falsamente. — *fuera de notas*

**Lista `llenado_capilar`** · Llenado capilar · tipo opción · usada en `efg.llenado_capilar`

| Opción | Definición | Fuente |
|---|---|---|
| Menor de 2 segundos | Normal | fuera de notas |
| De 2 segundos | Límite | fuera de notas |
| Mayor de 2 y hasta 3 segundos | Prolongado, signo de hipoperfusión: deshidratación, shock, enfermedad vascular, hipotermia | FISIOLOGIA 2026/concepts/Perfusión-Tisular.md |
| Mayor de 3 segundos | Muy prolongado: sepsis y shock séptico | FISIOPATOLOGIA 2026/entities/enfermedades/Sepsis.md |

## Escalas complementarias

Escalas que se aplican dentro de textos (ectoscopía y campos de otras áreas) y no tienen un campo propio en esta área.

**Lista `cruces`** · Palidez, ictericia o cianosis · tipo escala · usada en `ect.ectoscopia`, `efr.ojos`, `efr.boca`

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| +/+++ | Leve | `{hallazgo} +/+++` |
| ++/+++ | Moderada | `{hallazgo} ++/+++` |
| +++/+++ | Intensa | `{hallazgo} +++/+++` |

**Lista `deshidratacion`** · Grado de deshidratación · tipo escala · usada en `ect.ectoscopia`, `efr.boca`, `evo.evolucion`

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| Leve | Pérdida de hasta 5 % del peso corporal | Deshidratación leve |
| Moderada | Pérdida de 5 a 10 %: oliguria, ojos hundidos, hipotensión postural | Deshidratación moderada |
| Grave | Pérdida de más de 10 %: hipotensión en decúbito, compromiso neurológico | Deshidratación grave |

Para `cruces`, el marcador `{hallazgo}` se reemplaza por palidez, ictericia o cianosis (por ejemplo: «Palidez ++/+++»).

Otras listas de esta área que también se usan fuera de ella: `conciencia` (`ect.ectoscopia`, `efg.conciencia`, `efr.neurologico`, `dx.resumen`, `evo.evolucion`) y `eva` (`ea.relato_cronologico`, `efg.eva`, `efr.abdomen_palpacion`, `efr.genitourinario`, `efr.columna`, `dx.resumen`, `evo.evolucion`).

## Discrepancias y pendientes

> **Corregido en la app el 16/09/2026** tras esta revisión: puntos 1 (la frase normal dice «buen estado» y los tres campos de estado tienen «Bueno» como normal), 6 (porcentajes de deshidratación de 05b; la app ya escribía el grado en minúscula), 7 (llenado capilar sin superposición: «Mayor de 2 y hasta 3 segundos»), 8 (la sistólica ideal empieza en 90: una sistólica de 85 solo marca hipotensión), 9 (febrícula en 37,5 °C, hasta 37,2 °C normal por la tarde, y redondeo a un decimal), 10 (18 a 18,9 queda como «entre bajo peso y normal») y 13 («hemoglobina» escrita completa y título legible del ámbito de estado). Los demás siguen pendientes.

1. **Frase normal de la ectoscopía (`n`).** Dice «aparente regular estado general, regular estado nutricional y regular estado de hidratación». La nota 05a define el estado general del paciente sano como bueno y la 05b describe la hidratación normal; además, los tres campos de la lista `estado` no tienen valor normal. Decidir si la frase por defecto debe decir «buen estado» o si se mantiene «regular» por costumbre hospitalaria, y alinear ambos.
2. **Frase `a2` incompleta.** «Porta vía periférica permeable en» termina en «en» sin marcador; falta algo como `{sitio}` (miembro y lado).
3. **Marcadores sin lista en el paquete.** `{decubito}` (`a7`), `{facies}` (`a8`), `{region_ganglio}` y `{cm}` (`a13`) no tienen lista de opciones en esta área y `listas_de_otras_areas_que_usa` está vacío. Pendiente: listas de decúbitos (05a: dorsal, ventral, lateral, genupectoral, gatillo de fusil), facies (05k: 25 patrones) y cadenas ganglionares (05j). `{fio2}` (`a1`) parece venir del campo `efg.fio2`, que es texto libre; la frase fija además «cánula binasal», que no cubre otros dispositivos.
4. **Lista `conciencia`.** «Obnubilado» no aparece en 05a (sí en 11a: despierta con irritabilidad y vuelve a dormirse), y su etiqueta «Respuestas lentas y desorientadas» se parece más al estado confusional de 05a. «Comatoso: No responde» contradice 05a: el coma grado I atiende órdenes simples y el grado II responde al dolor enérgico. «Estuporoso: Solo responde al dolor» mezcla 05a (despierta con estímulos intensos y responde de forma inadecuada al dolor) y 11a (no capta ni estímulos dolorosos). Faltan los niveles crepuscular, confusional y delirio de 05a, y los grados de coma.
5. **Glasgow.** Apertura ocular 3 = «A la orden verbal» (11e dice «A la orden»; 05a dice «Al sonido») y respuesta motora 4 = «Retira al dolor» (05a: «Flexión y retiro»). No cambia el puntaje, solo el nombre.
6. **Lista `deshidratacion`.** Las etiquetas «Menos del 5 %», «5 a 9 %» y «10 % o más» no coinciden con 05b: leve hasta 5 %, moderada de 5 a 10 %, grave más de 10 %. Los signos asignados por grado (mucosas secas y pliegue en moderada; hipotensión y oliguria en grave) no están separados por grado en 05b; `FISIOPATOLOGIA 2026/esquemas/Esquema_05_Deshidratacion.md` pone oliguria, ojos hundidos e hipotensión postural en la moderada, e hipotensión en decúbito y compromiso neurológico en la grave. Además, el formato `Deshidratación {valor}` escribe el grado con mayúscula en medio de la frase («Deshidratación Leve»).
7. **Lista `llenado_capilar`.** Las opciones se superponen («Mayor de 2 segundos» incluye a «Mayor de 3 segundos»), «De 2 segundos: Límite» no tiene respaldo y las causas «enfermedad vascular, hipotermia» no están en notas. Ninguna nota de Semiología describe la prueba (la propia guía lo reconoce); `FISIOLOGIA 2026/concepts/Perfusión-Tisular.md` respalda «más de 2 segundos = hipoperfusión».
8. **Umbrales de presión arterial.** «Presión sistólica ideal» (hasta 119) se superpone con «Hipotensión arterial» (hasta 89): una sistólica de 85 cumple ambas. 05h define normal como «menor de 130/85» (incluye la ideal) y grado III como «mayor de 180/110», mientras la app incluye 180 y 110. La hipertensión sistólica aislada de 05h (sistólica mayor de 140 con diastólica menor de 90) no tiene umbral porque combina dos campos.
9. **Umbrales de temperatura.** La app pone «Febrícula» de 37.1 a 37.5 °C, pero 05e fija la febrícula o fiebre leve en 37.5 °C y acepta hasta 37.2 °C por la tarde como normal. Quedan huecos decimales sin categoría (37.01 a 37.09 y 38.51 a 38.59). La guía dice «fiebre elevada más de 38.6 °C» y el umbral incluye 38.6. 05e da la hipotermia ligera como 28 a 34 °C y la profunda como 17 a 28 °C (el 28 se repite); la app lo resuelve con 34.9 y 27.9. El campo es de temperatura axilar: si se toma oral o rectal (normales 37 y 37.5 °C), estos umbrales no aplican.
10. **Umbrales del índice de masa corporal.** 05c da «bajo peso menor de 18» y «normal 19 a 23»: la franja de 18 a 18.9 no tiene categoría en la nota y la app la pone en bajo peso (la guía, en cambio, dice «menos de 18»). «Obesidad mayor de 26» se aplica desde 26 incluido. Es la clasificación de 2020 (05c); la de la Organización Mundial de la Salud es distinta.
11. **Dolor (`eva`).** Las etiquetas leve (1 a 3), moderado (4 a 6) y severo (7 a 9) están fuera de notas (11g solo da la escala de 0 a 10 y que quien consulta suele tener más de 4). El 10 figura como «Máximo», mientras la guía (fuera de notas) lo incluye en «7 a 10 dolor severo».
12. **«Fuera de notas» con respaldo en otros cursos.** Saturación: `FISIOPATOLOGIA 2026/Saturacion-Oxigeno.md` (más de 95 % a nivel del mar, 88 a 92 % en poblaciones de altura, menos de 90 % define hipoxemia; la app llama «hipoxemia leve» a 91 a 94 %). Glasgow de 8 o menos, proteger la vía aérea: `FISIOLOGIA 2026/conceptos/Coma.md` y `FISIOPATOLOGIA 2026/entities/signos/Confusion.md`. La franja de altura (88 a 92 %) cae entre dos umbrales, así que en Puno la app puede mostrar «hipoxemia moderada» a un paciente normal: el texto lo advierte, pero conviene revisarlo.
13. **Textos de guía con abreviaturas o datos incompletos.** «Hb reducida» (guía de saturación) debería decir «hemoglobina reducida»; «4.º espacio intercostal» y «la 2.ª o 3.ª toma» (presión arterial) usan ordinales abreviados. El ámbito `efg.estado` no tiene título legible (`ambito_titulo` = «efg.estado»). Las guías escriben «ectoscopia» y la sección «Ectoscopía».
14. **Hallazgos guiados sin frase.** La guía de ectoscopía pide biotipo (ángulo de Charpy), lenguaje (disfonía, disartria, disfasia), marcha y movimientos involuntarios (asterixis), pero `f_ectoscopia` no tiene frases para ellos. Tampoco hay campo para los ganglios, aunque la guía del examen general los pide (solo existe la frase `a13`).
15. **Clasificación de Glasgow.** La gravedad leve, moderada y grave viene de la clasificación del traumatismo craneoencefálico (fuera de notas); la app la aplica a cualquier paciente con la etiqueta «Compromiso».
