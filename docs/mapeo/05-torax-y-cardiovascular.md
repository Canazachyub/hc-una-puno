# 05 · Examen regional: tórax, pulmones y aparato cardiovascular

> Documento de consulta del mapeo de HC App. Fuentes: seed/esquema.csv, seed/opciones.csv, seed/guias.csv y las notas de Semiología. Las definiciones y la guía son para estudiar y llenar la historia; no se imprimen en el Word.

## Resumen

Esta área cubre el tórax, los pulmones y el aparato cardiovascular dentro de la sección «3.A.2 Examen físico por regiones». Tiene **9 campos**, ninguno obligatorio:

- **Cinco párrafos redactados** con frases prearmadas: inspección, palpación, percusión y auscultación del tórax, y cardiovascular.
- **Tres escalas**: murmullo vesicular, intensidad del soplo (Levine) y amplitud de pulsos.
- **Un campo de varias opciones**: ruidos agregados.

Usa cinco listas de frases (**48 frases alteradas** más cinco normales, todas con su significado clínico en `datos/definiciones-05.csv`) y cuatro escalas (`mv`, `agregados`, `levine`, `pulsos`). No usa listas de otras áreas, pero la escala de pulsos también sirve al cuello y a los cuatro miembros, y la de Levine al cuello y al resumen diagnóstico. Hay **85 textos de guía** repartidos así: Tórax · inspección (7), Tórax · palpación (8), Tórax · percusión (16), Tórax · auscultación (18), Cardiovascular (18), Amplitud de pulsos (18).

Datos que el estudiante completa dentro de las frases (van entre llaves): `{lado}` y `{lado_f}` (lado), `{localizacion}`, `{fr}` (frecuencia respiratoria), `{fc}` (frecuencia cardiaca), `{patron_resp}` (patrón respiratorio), `{pulpejos}`, `{tiempo_cardiaco}`, `{foco}`, `{irradiacion_soplo}` y `{tipo_pulso}`. Si un dato queda sin llenar, la app lo escribe entre corchetes para completarlo después (`shared/formato.ts`).

Diccionario de reglas: **Describir sin interpretar** (se anota lo que se ve, palpa, percute o ausculta, no el diagnóstico); **Indicar el lado** (derecho, izquierdo o bilateral). Las escalas que admite cada párrafo aparecen en su fila «Escalas que admite».

## Orden del examen del tórax (inspección, palpación, percusión, auscultación) y valores normales

El tórax se examina siempre en este orden y comparando cada punto con su homólogo del otro lado. Después se examina el precordio y se palpan los pulsos.

| Tiempo | Normal | Qué buscar | Fuente |
|---|---|---|---|
| Inspección | Movimientos torácicos simétricos (el hemitórax enfermo se mueve menos). Frecuencia respiratoria del adulto de 16 a 20 por minuto. Respiración costoabdominal en el varón, costal superior en la mujer y abdominal en el niño. | General: facies héctica o neumónica, decúbito preferido, hipocratismo digital, palidez y cianosis. Forma: en tonel, paralítico, excavado, en quilla, rosario costal; cifosis, lordosis o escoliosis. Asimetría: abombamiento o retracción. Pared: fístulas, cicatrices, circulación colateral, edema en esclavina. Dinámica: tipo, frecuencia, ritmo y amplitud. | 07b |
| Palpación | Vibraciones vocales simétricas, como un cosquilleo, al decir «treinta y tres»; su límite inferior está a unos 8 cm del ángulo inferior del omóplato. Expansibilidad simétrica en vértices, bases y cara anterior. | Dolor, edema de pared, fluctuación (empiema), crepitación bajo los dedos (enfisema subcutáneo). Expansibilidad baja bilateral (enfisema) o unilateral (derrame, neumonía, atelectasia). Vibraciones aumentadas (condensación) o disminuidas (derrame, neumotórax, atelectasia, enfisema, obesidad). | 07c |
| Percusión | Claro pulmonar. Cara posterior: claro en el vértice, submate a nivel de la escápula y el hilio, claro en la base. Hemitórax derecho anterior: claro hasta el quinto espacio intercostal (luego matidez hepática). Hemitórax izquierdo anterior: claro hasta el tercer espacio intercostal, submate cardiaco y timpánico en el espacio de Traube. | Mate o submate: condensación, atelectasia, derrame. Hipersonoridad: enfisema, asma. Timpanismo: neumotórax. Falsa matidez por obesidad, grandes masas musculares, mamas voluminosas o edema de pared. | 03b, 07c |
| Auscultación | Murmullo vesicular suave (como aspirar al decir F) en toda la inspiración y al inicio de la espiración; normalmente disminuido en la región precordial, el área hepática, el espacio de Traube y sobre mamas o músculos. Respiración bronquial solo sobre laringe y tráquea. Espiración más larga que la inspiración (1:2 a 1:1,5). Resonancia vocal confusa y lejana. | Murmullo vesicular disminuido o abolido, espiración prolongada, estertores secos (roncus, sibilancias, estridor) y húmedos (crepitantes, subcrepitantes), soplos (tubárico, pleurítico, cavitario, anfórico), frote pleural, broncofonía, egofonía, pectoriloquia. | 07d |
| Precordio | Ictus en el quinto espacio intercostal izquierdo en normolíneos (cuarto en brevilíneos, sexto en longilíneos), del tamaño de un pulpejo; solo se ve en la mitad de los adultos en decúbito dorsal; se desplaza unos 2 cm con los decúbitos laterales. | Localización, extensión, intensidad (ictus propulsivo) y movilidad del ictus; frémito: sitio, tiempo e intensidad (1 a 4 cruces). | 08b |
| Auscultación cardiaca | Primer ruido (cierre mitral y tricuspídeo) coincide con el pulso carotídeo; segundo ruido (cierre aórtico y pulmonar) mejor en la base. Ritmo regular, con arritmia sinusal respiratoria normal. Frecuencia de 60 a 100 por minuto. Tercer ruido en el 30 por ciento de los sanos; cuarto ruido normal en niños y adultos jóvenes. | Ruidos, ritmo, frecuencia, intensidad (reforzamiento, debilitamiento), desdoblamientos, soplos (tiempo, foco, irradiación, intensidad, timbre), galope y frote pericárdico. | 08c, 08d |
| Pulsos | Radial de elección. Pared lisa, blanda y elástica. Amplitud mediana. Ambas radiales iguales. Frecuencia igual a la auscultada. | Ritmo, amplitud, tensión y forma de la onda; déficit de pulso; asimetría (aneurisma u obstrucción); femorales débiles con radiales normales (coartación de aorta). | 05d, 08e |

## Tórax · inspección

| Dato | Detalle |
|---|---|
| Identificador | `efr.torax_inspeccion` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | `f_torax_i` · Frases · tórax inspección |
| Valor normal | «Tórax simétrico, de configuración normal, con amplexación conservada. Sin tiraje ni retracciones. Sin cicatrices ni circulación colateral.» |
| Escalas que admite | Ninguna |
| Reglas de redacción | Describir sin interpretar; Indicar el lado |

**Guía**

- **Posición**
  - Tórax totalmente descubierto. Examinador frente a la cara anterior, luego la posterior y las laterales, comparando lados. (07b)
- **Cómo explorar**
  - Para las líneas axilares, pedir que levante el brazo. Por detrás, contar desde la apófisis espinosa de la séptima vértebra cervical. (07b)
- **Qué buscar**
  - General: facies héctica o neumónica, decúbito preferido, hipocratismo digital, palidez y cianosis. (07b)
  - Forma: en tonel, paralítico, excavado, en quilla, rosario costal. Cifosis, lordosis o escoliosis. (07b)
  - Asimetría: abombamiento (derrame, neumotórax, tumor) o retracción (secuela de tuberculosis, fibrosis, atelectasia). (07b)
  - Pared: fístulas, cicatrices, circulación colateral y edema en esclavina (obstrucción de vena cava superior). (07b)
  - Dinámica: tipo, frecuencia, ritmo y amplitud respiratoria. El hemitórax enfermo se mueve menos. (07b)

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Tórax simétrico, de configuración normal, con amplexación conservada. Sin tiraje ni retracciones. Sin cicatrices ni circulación colateral. | Hallazgo normal; es el valor normal del campo. | 07b |
| `a1` | Respiración superficial con tiraje intercostal y uso de musculatura accesoria. | Signos de disnea objetiva. El tiraje es la retracción de los espacios intercostales al inspirar; frecuente en el asma bronquial. | 07a |
| `a2` | Tórax en tonel, con diámetro anteroposterior aumentado. | Diámetro anteroposterior aumentado, espacios intercostales borrados y esternón proyectado hacia delante: enfisema pulmonar, edad avanzada. | 07b |
| `a3` | Tórax excavado. | Pectus excavatum o tórax de zapatero: hundimiento del esternón desde el apéndice xifoides; congénito o adquirido, más frecuente en varones. | 07b |
| `a4` | Tórax en quilla. | Pecho de paloma: prominencia esternal media; se asocia a raquitismo y a síndrome de Marfan. | 07b |
| `a5` | Abombamiento del hemitórax {lado}. | Aumento unilateral de los diámetros torácicos por sólido, líquido o gas: derrame pleural voluminoso, neumotórax, tumor o aneurisma de aorta. | 07b |
| `a6` | Retracción del hemitórax {lado}. | Disminución unilateral de los diámetros torácicos: secuela de tuberculosis, fibrosis pulmonar o atelectasia. | 07b |
| `a7` | Hemitórax {lado} con menor movilidad que el contralateral. | El hemitórax enfermo se mueve menos que el sano: atelectasia, derrame pleural, neumonía, fibrosis pulmonar o fractura costal. | 07c |
| `a8` | Taquipnea de {fr} respiraciones por minuto, respiración superficial. | Frecuencia respiratoria mayor de 20 por minuto con respiración superficial: esfuerzo, emoción, fiebre, neumonía, insuficiencia respiratoria, acidosis. | 07b |
| `a9` | Respiración de {patron_resp}. | Ritmo anormal por alteración del centro respiratorio: Cheyne-Stokes (insuficiencia cardiaca), Biot (daño cerebral grave), Kussmaul (acidosis metabólica). | 07b |
| `a10` | Circulación venosa colateral en pared torácica. | Red venosa anormal por obstrucción de la vena cava superior (tumor de mediastino); puede acompañarse de cianosis y edema en esclavina. | 07b |
| `a11` | Cifoescoliosis. | Cifosis más escoliosis: restringe la ventilación y, a la larga, puede terminar en corazón pulmonar crónico. | 07b |
| `a12` | Cicatriz quirúrgica en hemitórax {lado}. | Huella de cirugía torácica previa (pleurotomía, resección o toracoplastia); relacionarla con los antecedentes quirúrgicos. | 07b |

## Tórax · palpación

| Dato | Detalle |
|---|---|
| Identificador | `efr.torax_palpacion` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | `f_torax_p` · Frases · tórax palpación |
| Valor normal | «Vibraciones vocales conservadas y simétricas. Expansibilidad conservada. Sin dolor a la palpación de parrilla costal.» |
| Escalas que admite | Ninguna |
| Reglas de redacción | Describir sin interpretar; Indicar el lado |

**Guía**

- **Posición**
  - Tórax descubierto, paciente sentado para la expansibilidad. Mano del examinador tibia (el frío da crujidos falsos). (07c)
- **Cómo explorar**
  - Comparar la temperatura de ambos hemitórax con el dorso de la mano. Palpar partes blandas y ganglios. (07c)
  - Rouault: paciente con brazos sobre las rodillas, examinador detrás, pulgares a nivel de la séptima vértebra cervical. Ver su separación al inspirar. (07c)
  - Base: manos en los costados, pulgares en la línea media a la altura del ángulo del omóplato. Cara anterior: desde el frente. (07c)
  - Vibraciones vocales: palma de la mano de arriba abajo, comparando lados, mientras dice treinta y tres con igual tono. (07c)
- **Qué buscar**
  - Dolor, edema de pared, fluctuación (empiema) y crepitación bajo los dedos (enfisema subcutáneo). (07c)
  - Expansibilidad baja bilateral (enfisema) o unilateral (derrame, neumonía, atelectasia). Aumento compensador del lado sano. (07c)
  - Vibraciones aumentadas en condensación (neumonía). Disminuidas en derrame, neumotórax, atelectasia, enfisema, obesidad. (07c)

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Vibraciones vocales conservadas y simétricas. Expansibilidad conservada. Sin dolor a la palpación de parrilla costal. | Hallazgo normal; es el valor normal del campo. | 07c |
| `a1` | Vibraciones vocales disminuidas en *(frase incompleta, ver Discrepancias)* | Menor transmisión de la voz. Localizada: derrame pleural, neumotórax, atelectasia, paquipleuritis. Generalizada: enfisema, obesidad, edema de pared. | 07c |
| `a2` | Expansibilidad disminuida en hemitórax {lado}. | Disminución unilateral de la amplexación; señala el lado enfermo: atelectasia, derrame pleural, neumonía, fibrosis pulmonar o fractura costal. | 07c |
| `a3` | Expansibilidad disminuida bilateralmente. | Disminución bilateral de la amplexación: enfisema pulmonar, dolor pleural, espasmo neuromuscular (tétanos) o debilidad muscular (miastenia gravis). | 07c |
| `a4` | Vibraciones vocales aumentadas en {localizacion}. | Mayor transmisión de la voz por tejido sólido: condensación pulmonar (neumonía); también infarto pulmonar y cavernas tuberculosas. | 07c |
| `a5` | Vibraciones vocales abolidas en {localizacion}. | Ausencia de vibración: neumotórax; también derrame pleural o atelectasia, según su volumen o tamaño. | 07e |
| `a6` | Crepitación subcutánea a la palpación en {localizacion}. | Enfisema subcutáneo: aire en el tejido celular subcutáneo por herida penetrante de tórax, neumotórax, fractura costal o rotura alveolar. | 05i |
| `a7` | Dolor a la palpación en {localizacion}. | Hipersensibilidad de la pared torácica buscada al palpar las partes blandas; las notas de Semiología no detallan sus causas. | 07c |

## Tórax · percusión

| Dato | Detalle |
|---|---|
| Identificador | `efr.torax_percusion` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | `f_torax_pe` · Frases · tórax percusión |
| Valor normal | «Sonoridad pulmonar conservada en ambos campos.» |
| Escalas que admite | Ninguna |
| Reglas de redacción | Describir sin interpretar; Indicar el lado |

**Guía**

- **Posición**
  - Posterior: sentado o en decúbito lateral. Anterior: decúbito dorsal o sentado. Lateral: manos del paciente sobre la cabeza. (07c)
- **Cómo explorar**
  - Percusión dígito-digital de Gerhardt: el pulpejo del medio derecho golpea la segunda falange del medio izquierdo. (03b)
  - De arriba abajo, comparando puntos simétricos: línea medioclavicular por delante y axilar media por el costado. (07c)
- **Qué buscar**
  - Normal: claro pulmonar. Matidez hepática desde el quinto espacio intercostal derecho. Timpanismo en el espacio de Traube a la izquierda. (07c)
  - Mate o submate: condensación, atelectasia, derrame. Hipersonoridad: enfisema, asma. Timpanismo: neumotórax. (07c)
  - Obesidad, grandes masas musculares, mamas voluminosas o edema de pared pueden dar falsa matidez. (07c)
- **Valores normales**
  - Sonido normal del tórax sano: claro pulmonar o resonante, dado por el aire alveolar. (03b)
  - Cara posterior: claro en el vértice, submate a nivel de la escápula y el hilio, y claro de nuevo en la base. (07c)
  - Hemitórax derecho anterior: claro hasta el quinto espacio intercostal, donde empieza la matidez del hígado. (07c)
  - Hemitórax izquierdo anterior: claro hasta el tercer espacio intercostal, luego submate (corazón) y timpánico en el espacio de Traube. (07c)
  - Los movimientos del tórax deben ser simétricos. El hemitórax enfermo se mueve menos que el sano. (07b)
- **Cómo interpretar**
  - Hipersonoridad (más intensa y grave que el claro normal): enfisema pulmonar, asma bronquial. (07c)
  - Timpanismo en el tórax (agudo, como un tambor): neumotórax. (07c)
  - Matidez o submatidez: condensación (neumonía), atelectasia o derrame pleural. (07c)
  - Vibraciones vocales (al decir treinta y tres) aumentadas: condensación. Disminuidas: derrame, neumotórax, atelectasia. (07c)
- **No olvidar**
  - La obesidad, los músculos hipertrofiados, las mamas voluminosas o el edema de la pared dan sonidos falsamente mates o submates. (07c)

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Sonoridad pulmonar conservada en ambos campos. | Hallazgo normal; es el valor normal del campo. | 07c |
| `a1` | Matidez en *(frase incompleta, ver Discrepancias)* | El aire alveolar fue reemplazado por líquido, los alvéolos colapsaron o hay líquido pleural: neumonía, atelectasia o derrame pleural. | 07c |
| `a2` | Hipersonoridad en *(frase incompleta, ver Discrepancias)* | Sonido más intenso y grave que el claro normal por aire alveolar atrapado: enfisema, asma; también alrededor de una condensación o sobre un derrame. | 07c |
| `a3` | Submatidez en {localizacion}. | Matidez de menor grado: condensación, atelectasia o derrame pleural. No confundir con la submatidez normal a nivel de la escápula y el hilio. | 07c |
| `a4` | Hipersonoridad bilateral. | Aire alveolar atrapado en ambos pulmones: enfisema pulmonar o asma bronquial. | 07c |
| `a5` | Timpanismo en hemitórax {lado}. | Sonido agudo, como de tambor, por aire libre en la cavidad pleural: neumotórax. En la base izquierda anterior es normal (espacio de Traube). | 07c |
| `a6` | Matidez en {localizacion} con hipersonoridad por encima de su borde superior. | Patrón del derrame pleural: matidez de límite superior parabólico (curva de Damoiseau) con zona más sonora encima (triángulo de Garland). | 07e |

## Murmullo vesicular

| Dato | Detalle |
|---|---|
| Identificador | `efr.torax_mv` |
| Tipo · Obligatorio | Escala · No |
| Lista | `mv` · Murmullo vesicular · escala |
| Valor normal | Conservado → «Murmullo vesicular conservado en ambos campos pulmonares» |
| Escalas que admite | Murmullo vesicular · `mv` |
| Reglas de redacción | Ninguna |

**Guía**

- **Qué usar**
  - Estetoscopio con diafragma apoyado con presión firme y olivas bien ajustadas. Si hay mucho vello, mojarlo o untar vaselina. (07d)
- **Posición**
  - Paciente sentado, respiración lenta y de amplitud mediana, boca entreabierta. Si no puede, decúbito dorsal o lateral. (07d)
- **Cómo explorar**
  - Del vértice a las bases, comparando cada punto con su homólogo: cara posterior, anterior y fosas supraclaviculares. (07d)
  - Ruido dudoso: respirar normal, luego profundo, luego toser. Evitarlo si hay dolor torácico intenso, disnea o hemoptisis. (07d)
  - Voz: auscultar mientras dice treinta y tres. Broncofonía en condensación, egofonía en derrame, pectoriloquia en caverna. (07d)
- **Qué buscar**
  - Murmullo vesicular disminuido en derrame, neumonía, atelectasia o neumotórax. Espiración prolongada en asma y enfermedad pulmonar obstructiva crónica. (07d)
  - Estertores secos (roncus, sibilancias, estridor) y húmedos (crepitantes al final de la inspiración, subcrepitantes). (07d)
  - Soplo tubárico (neumonía), pleurítico (borde alto del derrame) y frote pleural, que no cambia con la tos. (07d)
- **Valores normales**
  - Murmullo vesicular: ruido suave (como aspirar al decir F) durante toda la inspiración y el inicio de la espiración. (07d)
  - El murmullo vesicular está normalmente disminuido en la región precordial, el área hepática, el espacio de Traube y sobre mamas o músculos. (07d)
  - Respiración bronquial normal solo sobre laringe y tráquea. Fuera de esa zona es patológica (soplo tubárico). (07d)
  - Relación inspiración a espiración normal de 1:2 a 1:1,5 (la espiración dura más). Se prolonga en el asma y en la enfermedad obstructiva. (07d)
- **Cómo interpretar**
  - Crepitantes finos (final de la inspiración, no cambian con la tos): neumonía, edema agudo de pulmón, fibrosis pulmonar. (07d)
  - Subcrepitantes gruesos (burbujeo, cambian con la tos): bronquitis, bronconeumonía, bronquiectasias. (07d)
  - Sibilancias (agudas, más intensas en espiración, no cambian con la tos): asma. Roncus (graves, cambian con la tos): bronquitis. (07d)
  - Frote pleural (cuero nuevo, en ambos tiempos, no cambia con la tos, aumenta al presionar): pleuritis. (07d)
- **No olvidar**
  - Auscultar sentado, de arriba hacia abajo, comparando cada punto con su homólogo, incluidas las fosas supraclaviculares. (07d)
  - No pedir tos ni inspiración forzada si hay dolor torácico intenso, disnea acentuada o hemoptisis. (07d)

*Esta guía vale también para: Ruidos agregados, Tórax · auscultación.*

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| Conservado | Pasa en ambos campos | Murmullo vesicular conservado en ambos campos pulmonares |
| Disminuido | En una zona o difuso | Murmullo vesicular disminuido en {localizacion} |
| Abolido | Ausente | Murmullo vesicular abolido en {localizacion} |

## Ruidos agregados

| Dato | Detalle |
|---|---|
| Identificador | `efr.torax_agregados` |
| Tipo · Obligatorio | Varias opciones · No |
| Lista | `agregados` · Ruidos agregados · escala |
| Valor normal | Ninguno → «Sin ruidos agregados» |
| Escalas que admite | Ruidos agregados · `agregados` |
| Reglas de redacción | Ninguna |

**Guía**: la misma del campo Murmullo vesicular (comparten ámbito `efr.torax_auscultacion`).

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| Crepitantes | Finos, no se modifican con la tos | Se auscultan crepitantes en {localizacion} |
| Subcrepitantes | Húmedos, cambian con la tos | Se auscultan subcrepitantes en {localizacion} |
| Sibilancias | Espiratorias, tono alto | Se auscultan sibilancias en {localizacion} |
| Roncantes | Tono bajo | Se auscultan roncantes en {localizacion} |
| Frote pleural | Roce con la respiración | Se ausculta frote pleural en {localizacion} |
| Soplo tubárico | Sobre condensación | Se ausculta soplo tubárico en {localizacion} |
| Ninguno | Sin ruidos agregados | Sin ruidos agregados |

## Tórax · auscultación

| Dato | Detalle |
|---|---|
| Identificador | `efr.torax_auscultacion` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | `f_torax_a` · Frases · tórax auscultación |
| Valor normal | «Transmisión de la voz conservada, sin broncofonía, egofonía ni pectoriloquia.» |
| Escalas que admite | Murmullo vesicular · `mv`; Ruidos agregados · `agregados` |
| Reglas de redacción | Describir sin interpretar; Indicar el lado |

**Guía**: la misma del campo Murmullo vesicular (comparten ámbito `efr.torax_auscultacion`).

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Transmisión de la voz conservada, sin broncofonía, egofonía ni pectoriloquia. | Hallazgo normal; es el valor normal del campo. | 07d |
| `a1` | Espiración prolongada. | La espiración dura más de lo normal por obstrucción bronquial: asma bronquial, enfisema, enfermedad pulmonar obstructiva crónica. | 07d |
| `a2` | Crepitantes finos al final de la inspiración en {localizacion}, que no se modifican con la tos. | Estertores húmedos por despegamiento alveolar: neumonía, edema agudo de pulmón, congestión por insuficiencia cardiaca izquierda, fibrosis pulmonar. | 07d |
| `a3` | Subcrepitantes en {localizacion}, que se modifican con la tos. | Estertores húmedos gruesos por secreción en los bronquiolos: bronquitis aguda o crónica, bronconeumonía, bronquiectasias, tuberculosis pulmonar. | 07d |
| `a4` | Roncantes en {localizacion}, que se modifican con la tos. | Roncus: ruido grave de bronquios gruesos estrechados por espasmo, edema o secreción: bronquitis, bronconeumonía, bronquiectasias. | 07d |
| `a5` | Sibilancias espiratorias difusas. | Obstrucción de bronquios finos y bronquiolos; no cambian con la tos. Signo cardinal del asma bronquial; también en el asma cardiaco. | 07d |
| `a6` | Soplo tubárico en {localizacion}. | Ruido glótico transmitido por una condensación extensa y superficial con bronquio permeable: neumonía, siempre con crepitantes. | 07d |
| `a7` | Frote pleural en región axilar inferior {lado_f}, en ambos tiempos respiratorios. | Roce de las dos hojas pleurales inflamadas (pleuritis); no cambia con la tos y aumenta al presionar con el estetoscopio. | 07d |
| `a8` | Broncofonía en {localizacion}. | Resonancia vocal aumentada, el treinta y tres se oye nítido: condensación pulmonar, típicamente neumonía. | 07d |
| `a9` | Egofonía en {localizacion}. | Voz de cabra, temblorosa y entrecortada: compresión del pulmón por un derrame pleural de mediano volumen. | 07d |
| `a10` | Pectoriloquia áfona en {localizacion}. | Voz susurrada que se oye articulada con claridad; las notas la dan como signo de caverna y la mencionan en condensación o derrame. | 07d |

Las escalas que admite se detallan en los campos Murmullo vesicular y Ruidos agregados de este documento.

## Cardiovascular

| Dato | Detalle |
|---|---|
| Identificador | `efr.cardiovascular` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | `f_cv` · Frases · cardiovascular |
| Valor normal | «Choque de punta palpable en quinto espacio intercostal izquierdo, línea medioclavicular. Ruidos cardíacos rítmicos, normofonéticos, sin soplos audibles. Llenado capilar menor de 2 segundos. Pulsos periféricos presentes y simétricos.» |
| Escalas que admite | Intensidad de soplos (Levine) · `levine`; Amplitud de pulsos · `pulsos` |
| Reglas de redacción | Describir sin interpretar |

**Guía**

- **Qué usar**
  - Estetoscopio: diafragma para primer y segundo ruido, campana apoyada suave para tercer y cuarto ruido y galope. (08c)
- **Posición**
  - Tórax descubierto, ambiente silencioso, decúbito dorsal o sentado. Receptor directo sobre la piel, nunca sobre ropa. (08c)
  - Decúbito lateral izquierdo refuerza los focos de la punta. Sentado inclinado hacia adelante resalta los de la base. (08c)
- **Cómo explorar**
  - Precordio: primero mirar, luego palma abierta sobre los espacios y localizar el ictus con el pulpejo del índice. (08b)
  - Auscultar en orden: mitral (quinto espacio intercostal izquierdo, línea medioclavicular), tricuspídeo (base del xifoides), pulmonar (segundo espacio intercostal izquierdo) y aórtico (segundo espacio intercostal derecho). (08c)
  - Palpar el pulso carotídeo mientras se ausculta: lo que coincide con el pulso es sistólico (primer ruido). (08c)
- **Qué buscar**
  - Ictus en quinto espacio intercostal izquierdo en normolíneos, del tamaño de un pulpejo. Abajo y afuera: hipertrofia del ventrículo izquierdo. Frémito: sitio, tiempo e intensidad. (08b)
  - Primer y segundo ruido, ritmo, frecuencia, intensidad, desdoblamientos, soplos y galope (tercer o cuarto ruido patológico). (08c)
- **Valores normales**
  - Foco mitral: quinto espacio intercostal izquierdo, línea medioclavicular. Foco tricuspídeo: base del apéndice xifoides. (08c)
  - Foco pulmonar: segundo espacio intercostal izquierdo, paraesternal. Foco aórtico: segundo espacio intercostal derecho, paraesternal. (08c)
  - Primer ruido (cierre mitral y tricúspide): coincide con el pulso carotídeo. Segundo ruido: cierre aórtico y pulmonar. (08c)
  - El tercer ruido se ausculta en el 30 por ciento de los sanos. El cuarto ruido puede ser normal en niños y adultos jóvenes. (08c)
- **Cómo interpretar**
  - Tercer o cuarto ruido patológico (ritmo de galope, en tres tiempos): sospechar insuficiencia cardiaca. (08c)
  - Escala de Freeman-Levine: I muy débil, II débil, III moderado, IV fuerte, V fuertísimo, VI se oye sin apoyar el estetoscopio. (08d)
  - Los soplos de grado IV a VI casi siempre se acompañan de frémito palpable. (08d)
  - Soplo anémico: siempre sistólico y sin frémito. Holosistólico en foco mitral irradiado a la axila: insuficiencia mitral. (08d)
- **No olvidar**
  - Ingurgitación yugular visible con el paciente a 30 a 45 grados: presión elevada en la aurícula derecha (insuficiencia cardiaca derecha). (08e)
  - Un frote pericárdico (roce de cuero nuevo) que desaparece no indica mejoría: puede haberse instalado un derrame. (08d)

*Esta guía vale también para: Intensidad del soplo.*

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Choque de punta palpable en quinto espacio intercostal izquierdo, línea medioclavicular. Ruidos cardíacos rítmicos, normofonéticos, sin soplos audibles. Llenado capilar menor de 2 segundos. Pulsos periféricos presentes y simétricos. | Hallazgo normal; es el valor normal del campo. | 08b, 08c (llenado capilar: fuera de Semiología) |
| `a1` | Choque de punta desplazado hacia abajo y afuera, en *(frase incompleta, ver Discrepancias)* | Ictus desplazado al sexto o séptimo espacio intercostal izquierdo, hacia la línea axilar: hipertrofia del ventrículo izquierdo. | 08b |
| `a2` | Se ausculta tercer ruido en foco mitral. | Ruido de llenado ventricular; normal en el 30 por ciento de los sanos. En contexto patológico es galope ventricular: insuficiencia cardiaca. | 08c |
| `a3` | Ictus cordis propulsivo, que ocupa {pulpejos} pulpejos. | Choque de la punta que levanta el pulpejo y ocupa dos o más pulpejos: grandes hipertrofias o dilataciones, sobre todo del ventrículo izquierdo. | 08b |
| `a4` | Frémito {tiempo_cardiaco} en foco {foco}. | Expresión palpatoria de un soplo, como el ronroneo de un gato; su sitio orienta a la válvula y su tiempo al tipo de lesión. | 08b |
| `a5` | Ruidos cardíacos arrítmicos. | Irregularidad que no sigue la respiración: extrasístoles o fibrilación auricular. Comparar con el pulso (déficit) y confirmar con electrocardiograma. | 08c |
| `a6` | Taquicardia de {fc} latidos por minuto. | Frecuencia cardiaca mayor de 100 por minuto: emoción, esfuerzo, hipertiroidismo, estados hiperactivos o taquicardia supraventricular o ventricular. | 08c |
| `a7` | Bradicardia de {fc} latidos por minuto. | Frecuencia cardiaca menor de 60 por minuto: atletas, bloqueo auriculoventricular, intoxicación digitálica, mixedema, hipertensión endocraneana. | 08c |
| `a8` | Primer ruido reforzado en foco {foco}. | Aumento de intensidad del primer ruido: pared delgada, hipertiroidismo, extrasístoles, esclerosis valvular; brillante en la estenosis mitral. | 08c |
| `a9` | Segundo ruido desdoblado en foco {foco}. | Separación audible del cierre aórtico y pulmonar; las notas lo asocian a respiración forzada y a bloqueo auriculoventricular. | 08c |
| `a10` | Ritmo de galope por cuarto ruido. | Galope auricular: cuarto ruido patológico con ritmo en tres tiempos; sospechar insuficiencia cardiaca. Aislado, el cuarto ruido puede ser normal en jóvenes. | 08c |
| `a11` | Soplo {tiempo_cardiaco} en foco {foco}, irradiado a {irradiacion_soplo}. | Turbulencia del flujo por lesión valvular o causa funcional (anemia, fiebre). Holosistólico mitral irradiado a la axila: insuficiencia mitral. | 08d |
| `a12` | Frote pericárdico. | Roce del pericardio inflamado (fiebre reumática, neumonía, tuberculosis, uremia); si desaparece puede indicar derrame, no mejoría. | 08d |
| `a13` | Pulso {tipo_pulso}. | Onda con nombre propio: céler (insuficiencia aórtica), parvus (estenosis aórtica), alternante (insuficiencia cardiaca izquierda), paradójico (taponamiento). | 08e |

Las escalas que admite se detallan en los campos Intensidad del soplo y Amplitud de pulsos de este documento.

## Intensidad del soplo

| Dato | Detalle |
|---|---|
| Identificador | `efr.soplo_levine` |
| Tipo · Obligatorio | Escala · No |
| Lista | `levine` · Intensidad de soplos (Levine) · escala |
| Valor normal | Sin valor normal: la escala solo se llena cuando hay un soplo. |
| Escalas que admite | Intensidad de soplos (Levine) · `levine` |
| Reglas de redacción | Ninguna |

**Guía**: la misma del campo Cardiovascular (comparten ámbito `efr.cardiovascular`).

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| I/VI | Apenas audible | Soplo de intensidad I/VI en la escala de Levine |
| II/VI | Leve pero clara | Soplo de intensidad II/VI en la escala de Levine |
| III/VI | Moderada, sin frémito | Soplo de intensidad III/VI en la escala de Levine |
| IV/VI | Con frémito | Soplo de intensidad IV/VI en la escala de Levine |
| V/VI | Audible con el borde del estetoscopio | Soplo de intensidad V/VI en la escala de Levine |
| VI/VI | Audible sin contacto | Soplo de intensidad VI/VI en la escala de Levine |

## Amplitud de pulsos

| Dato | Detalle |
|---|---|
| Identificador | `efr.pulsos` |
| Tipo · Obligatorio | Escala · No |
| Lista | `pulsos` · Amplitud de pulsos · escala |
| Valor normal | 2+ → «Pulsos 2+/4+» |
| Escalas que admite | Amplitud de pulsos · `pulsos` |
| Reglas de redacción | Ninguna |

**Guía**

- **Cómo explorar**
  - Radial: pulpejos de índice, medio y anular entre la estiloides del radio y los flexores, mano del paciente en supinación. (05d)
  - Contar un minuto completo y compararlo con la frecuencia auscultada (déficit de pulso). (05d)
  - Palpar ambas radiales a la vez: deben tener igual amplitud. Si difieren, pensar en aneurisma u obstrucción. (05d)
  - Otros sitios: carótida (con cuidado en ancianos), braquial, femoral, poplítea con rodilla flexionada, tibial posterior, pedia. (05d)
- **Qué buscar**
  - Pared lisa y elástica en el joven, rígida y tortuosa en la arteriosclerosis. Valorar ritmo, amplitud, tensión y onda. (05d)
  - En paro cardiorrespiratorio o agonía, palpar carótida o femoral, no la radial. (05d)
  - Femorales débiles o ausentes con radiales normales: coartación de aorta. (08e)
  - Onda: céler (insuficiencia aórtica), parvus (estenosis aórtica), filiforme (shock), alternante o paradójico. (08e)
- **Valores normales**
  - Arteria radial de elección: palpar con los pulpejos del índice, medio y anular, con la mano en supinación. (05d)
  - Pared arterial normal: lisa, blanda y elástica. En la arteriosclerosis es rígida y tortuosa (como tráquea de pollo). (05d)
  - Amplitud normal mediana. Amplio en la insuficiencia aórtica, pequeño en la estenosis aórtica. (05d)
  - Palpar ambas radiales a la vez: deben ser iguales. La desigualdad orienta a aneurisma u obstrucción arterial. (05d)
  - Sitios: carotídeo, braquial, radial, femoral, poplíteo, tibial posterior (detrás del maléolo medial) y pedio. (05d)
- **Cómo interpretar**
  - Pulso filiforme (apenas palpable): shock o paciente moribundo. Pulso celer o en martillo de agua: insuficiencia aórtica. (05d)
  - Pulso paradójico (caída sistólica de más de 10 mmHg en inspiración): derrame pericárdico, pericarditis constrictiva, asma. (05d)
  - Pulso duro: hipertensión arterial. Blando (se colapsa fácil): sistólica menor de 90 mmHg. Alternante: insuficiencia cardiaca izquierda. (05d)
- **No olvidar**
  - En el paro cardiorrespiratorio palpar la carótida o la femoral: si no se palpan, iniciar reanimación cardiopulmonar. (05d)
  - Palpar la carótida con cuidado en ancianos: puede fragmentar ateromas o causar bradicardia y síncope. (05d)

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| 0 | Ausente | Pulsos 0/4+ |
| 1+ | Disminuido | Pulsos 1+/4+ |
| 2+ | Normal | Pulsos 2+/4+ |
| 3+ | Aumentado | Pulsos 3+/4+ |
| 4+ | Saltón | Pulsos 4+/4+ |

## Síndromes pleuropulmonares: hallazgos por tiempo del examen

Ningún hallazgo aislado define un síndrome: es la combinación de los cuatro tiempos la que los separa (07e). Las cinco últimas filas son los síndromes bronquiales de la nota 07f, donde inspección, palpación y percusión suelen ser normales y el dato decisivo está en la auscultación.

| Síndrome | Inspección | Palpación (vibraciones vocales) | Percusión | Auscultación | Fuente |
|---|---|---|---|---|---|
| Condensación neumónica | Expansibilidad disminuida, sobre todo en la zona afectada | Aumentadas | Submatidez o matidez, según el segmento o lóbulo | Murmullo vesicular abolido; crepitantes, soplo tubárico, broncofonía, pectoriloquia | 07e |
| Atelectasia | Expansibilidad disminuida, retracción de los espacios intercostales, asimetría | Disminuidas o abolidas, según el tamaño | Submatidez o matidez | Murmullo vesicular disminuido o abolido, silencio respiratorio | 07e |
| Enfisema pulmonar | Tórax en tonel en fases avanzadas, expansibilidad disminuida | Disminuidas | Normal o hipersonoridad | Murmullo vesicular disminuido, espiración prolongada, roncus y sibilancias diseminados | 07e |
| Congestión pulmonar | Expansibilidad normal | Normales | Normal o submatidez en las bases | Crepitantes en las bases, sibilancias (asma cardiaco) | 07e |
| Derrame pleural | Abombamiento del hemitórax, expansibilidad disminuida | Disminuidas o abolidas, según el volumen | Matidez intensa con límite parabólico (curva de Damoiseau) | Murmullo vesicular abolido; soplo pleurítico o tubárico en el borde superior; mediastino desviado al lado sano si es voluminoso | 07e |
| Neumotórax | Abombamiento del hemitórax, expansibilidad disminuida | Abolidas | Hipersonoridad o timpanismo | Silencio respiratorio, murmullo vesicular abolido; soplo anfórico si hay fístula broncopleural | 07e |
| Absceso pulmonar (síndrome de caverna) | Expansibilidad disminuida en la región afectada | Aumentadas (no confundir con neumonía) | Timpanismo o hipersonoridad | Murmullo vesicular disminuido, soplo cavitario | 07e |
| Pleuritis aguda | Expansibilidad disminuida | Disminuidas | Normal o submatidez discreta | Frote pleural | 07e |
| Pleuritis crónica (paquipleuritis) | Retracción del hemitórax, expansibilidad disminuida | Disminuidas | Submatidez o matidez | Murmullo vesicular disminuido | 07e |
| Bronquitis aguda | Normal o levemente disminuida | Normales o disminuidas | Normal, rara vez disminuida | Subcrepitantes en ambos campos; roncus y sibilancias en fases avanzadas | 07f |
| Bronquitis crónica | Normal o levemente disminuida | Normales o disminuidas | Normal o disminuida en casos avanzados | Subcrepitantes bilaterales; roncus y sibilancias frecuentes | 07f |
| Síndrome bronquiectásico | Expansibilidad disminuida | Normales o disminuidas | Normal o submatidez localizada | Subcrepitantes localizados | 07f |
| Obstrucción bronquial (asma) | Expansibilidad disminuida; tórax en tonel en formas avanzadas | Normales o disminuidas | Normal o hipersonoridad | Murmullo vesicular disminuido, espiración prolongada, roncus y sibilancias diseminados | 07f |
| Bronconeumonía | Normal | Normales | Normal | Subcrepitantes y crepitantes | 07f |

Dos diferencias que conviene fijar: la atelectasia **atrae** el mediastino hacia el lado enfermo y el derrame voluminoso lo **desplaza** al lado sano; la caverna comparte con la neumonía las vibraciones aumentadas, pero suena timpánica o hipersonora en lugar de mate (07e).

## Focos de auscultación cardíaca

| Foco | Ubicación | Qué se ausculta | Fuente |
|---|---|---|---|
| Mitral | Quinto espacio intercostal izquierdo, línea medioclavicular (sede del choque de la punta) | Primer ruido, mejor audible aquí; tercer ruido en el ápex; soplo holosistólico de insuficiencia mitral (irradiado a axila y dorso) y soplo diastólico en ruflar de estenosis mitral. Se refuerza en decúbito lateral izquierdo | 08c, 08d |
| Tricuspídeo | Base del apéndice xifoides | Soplos tricuspídeos, que aumentan con la inspiración (en la estenosis tricuspídea: signo de Rivero-Carvallo); soplo holosistólico de la comunicación interventricular. Se refuerza en decúbito lateral izquierdo | 08c, 08h |
| Pulmonar | Segundo espacio intercostal izquierdo, línea paraesternal | Segundo ruido (foco de la base): reforzado en la hipertensión pulmonar y desdoblado en la comunicación interauricular; soplo de estenosis pulmonar. Se resalta sentado e inclinado hacia adelante | 08c, 08d, 08h |
| Aórtico | Segundo espacio intercostal derecho, línea paraesternal | Segundo ruido, reforzado en la hipertensión arterial sistémica; soplo mesosistólico rudo de estenosis aórtica irradiado al cuello; soplo diastólico aspirativo de insuficiencia aórtica. Se resalta sentado e inclinado hacia adelante | 08c, 08d, 08g |
| Accesorio aórtico | Tercer espacio intercostal izquierdo, línea paraesternal | Las notas lo nombran como foco accesorio; el soplo de insuficiencia aórtica se asigna al foco aórtico o al accesorio sin precisar cuál | 08c, 08d |

Orden: mitral, tricuspídeo, pulmonar y aórtico, sin saltar rápido de un foco a otro y recorriendo también los puntos intermedios, la región subclavicular, la axila izquierda, el epigastrio, el cuello y la región interescapulovertebral, porque los soplos se irradian. Para no confundir sístole con diástole, palpar el pulso carotídeo mientras se ausculta: lo que coincide con el pulso es sistólico (08c).

## Discrepancias y pendientes

### Frases

- **Cuatro frases incompletas.** `f_torax_p` `a1` «Vibraciones vocales disminuidas en», `f_torax_pe` `a1` «Matidez en», `f_torax_pe` `a2` «Hipersonoridad en» y `f_cv` `a1` «Choque de punta desplazado hacia abajo y afuera, en» terminan en «en » sin dato entre llaves ni punto final (así están en seed/opciones.csv). Las frases hermanas usan `{localizacion}`. Propuesta: «… en {localizacion}.»; para el choque de punta, un dato del espacio intercostal y la línea.
- **«Roncantes»** (escala `agregados` y `f_torax_a` `a4`) no aparece en las notas: 07d y la guía dicen **roncus**. Conviene un solo término en el campo.
- **«Choque de punta»** (valor normal y `a1` de `f_cv`) e **«ictus cordis»** (`a3`) son sinónimos en 08b; conviene usar uno solo en el campo.
- **Valor normal cardiovascular**: «normofonéticos» no figura en las notas (fuera de notas) y el **llenado capilar** no está en Semiología; solo aparece en `FISIOLOGIA 2026/concepts/Perfusión-Tisular.md` (mayor de 2 segundos como signo de hipoperfusión).
- **Redundancia**: `f_torax_i` `a8` repite «respiración superficial», que ya forma parte de la definición de taquipnea (07b), y `a1` usa la misma expresión.
- **`f_torax_a` `a7`** fija la «región axilar inferior»: las notas dicen que el frote se ausculta *con más frecuencia* allí, no siempre. Valorar `{localizacion}`.
- **`f_cv` `a11`** obliga a escribir la irradiación; los soplos funcionales suelen quedar localizados (08d). Falta una variante sin irradiación.
- **`f_torax_p` `a7`** (dolor a la palpación): las notas no dan sus causas; el significado se dejó solo descriptivo.
- **`f_torax_a` `a10`** (pectoriloquia áfona): 07d es ambigua (la da como signo de caverna y la menciona en condensación o derrame); conviene contrastarla con el libro.
- **Opciones que las notas describen y las listas no tienen**: resonancia vocal disminuida (atelectasia, paquipleuritis, derrame), estridor, soplos pleurítico, cavitario y anfórico, murmullo vesicular aumentado (07d); ictus inmóvil (pericarditis constrictiva) y latido de hipertrofia del ventrículo derecho (08b); segundo ruido reforzado y primer ruido debilitado (08c); soplo continuo (08d); patrones respiratorios suspiroso y bradipnea (07b).
- **Datos entre llaves sin lista en el paquete**: no vienen las opciones de `{patron_resp}`, `{tipo_pulso}`, `{tiempo_cardiaco}`, `{foco}` ni `{irradiacion_soplo}`, así que no se pudo comprobar que salgan de las notas. Si `{tipo_pulso}` ofrece «bisferiens», 08e advierte que ese pulso no está en Sotomayor (fuera de notas).

### Escalas

- **Levine** (comparada con la escala de Freeman-Levine de 08d): I «Apenas audible» coincide; II «Leve pero clara» (notas: débil); III «Moderada, sin frémito» (notas: moderado; no dicen que no tenga frémito); IV «Con frémito» (notas: fuerte; el frémito acompaña *casi siempre* a los grados IV, V y VI); V «Audible con el borde del estetoscopio» no está en las notas (notas: fuertísimo); VI «Audible sin contacto» coincide. La lista dice «Levine» y la guía «Freeman-Levine». 08d recuerda además que algunos autores usan cuatro grados, y 08b gradúa el frémito de 1 a 4 cruces.
- **Amplitud de pulsos**: la escala de 0 a 4+ **no está en las notas** (fuera de notas). 05d describe la amplitud como amplia, mediana o pequeña (parvus), y el pulso filiforme. «Saltón» no es un término de las notas; su equivalente es pulso amplio o céler (insuficiencia aórtica).
- **Ruidos agregados**: «Subcrepitantes: Húmedos» no los distingue de los crepitantes, que también son húmedos (07d los describe como **gruesos**, con burbujeo). «Sibilancias: Espiratorias» simplifica: se oyen en ambas fases, más en la espiración, y no cambian con la tos. Faltan estridor y los soplos pleurítico, cavitario y anfórico.
- **Murmullo vesicular**: «Pasa en ambos campos» es coloquial (07d: ruido suave en toda la inspiración y al inicio de la espiración). Falta el nivel «Aumentado» (compensador o por hiperventilación).
- Los formatos de salida con `{valor}` en mitad de la frase se escriben bien: la app pasa el valor a minúscula (`shared/formato.ts`), como se muestra en las tablas.

### Guías

- **Abreviaturas en seed/guias.csv**: `C7`, `5.º`, `2.º`, `2.ª`, `1.º`, `1.er`, `3.º`, `4.º`. En este documento se escribieron completas; conviene corregirlas en la fuente. Varios textos no terminan en punto, y 05d escribe «celer» sin tilde donde 08e dice «céler».
- **Guías en ámbito equivocado**: en `efr.torax_percusion` están «Los movimientos del tórax deben ser simétricos» (07b, es de inspección) y «Vibraciones vocales… aumentadas: condensación» (es de palpación). La inspección no tiene ninguna guía de «Valores normales».
- **Guías de pulsos**: «Arteria radial de elección…» y «Sitios…» están como «Valores normales» pero son técnica. Hay duplicados: palpar ambas radiales (Cómo explorar y Valores normales), paro cardiorrespiratorio (Qué buscar y No olvidar) y pared arterial (Qué buscar y Valores normales).
- **Fuente cruzada**: la guía «Onda: céler…, parvus…, filiforme (shock)…» cita 08e, pero el pulso filiforme solo está en 05d.

### Notas por contrastar

- **Relación inspiración a espiración** (guía y 07d): 2020 da 1:2 a 1:1,5 con espiración prolongada en la obstrucción; 2018 da 1:3 y dice que se invierte a 3:1. El profesor lo dejó como tarea y avisó que lo preguntaría.
- **08b, ictus del normolíneo**: dice «6-10 cm de la línea medioclavicular», lo que no cuadra con el foco mitral «en la línea medioclavicular» (08c); probablemente se refiere a la línea medioesternal.
- **08c, desdoblamiento del segundo ruido**: la nota lo atribuye a «bloqueo auriculoventricular» y respiración forzada; 08h lo añade en la comunicación interauricular. Conviene contrastar con el libro (en la misma tabla, el bloqueo de rama figura en el desdoblamiento del primer ruido).
