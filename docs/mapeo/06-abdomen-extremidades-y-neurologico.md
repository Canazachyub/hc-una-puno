# 06 · Examen regional: abdomen, genitourinario, columna, extremidades y neurológico

> Documento de consulta del mapeo de HC App. Fuentes: seed/esquema.csv, seed/opciones.csv, seed/guias.csv y las notas de Semiología. Las definiciones y la guía son para estudiar y llenar la historia; no se imprimen en el Word.

## Resumen

Esta área cubre la segunda mitad del **examen físico por regiones** (sección **3.A.2 Examen físico por regiones**): los cuatro tiempos del abdomen, el examen genitourinario, la columna vertebral, los cuatro miembros, y el bloque neurológico con tres escalas propias (edema con fóvea, fuerza muscular y reflejos osteotendinosos). Los campos de texto se arman con frases prediseñadas: código `n` para el examen sin alteraciones y códigos `a1`, `a2`… para los hallazgos. Ningún campo es obligatorio.

- Sección: 1 (3.A.2 Examen físico por regiones). El campo de orden 260 (`efr.pulsos`, amplitud de pulsos) pertenece al área 05 y queda entre el edema y la fuerza.
- Campos: 14 (0 obligatorios). Por tipo: Párrafo redactado 11, Escala 3.
- Listas propias: 11 (`godet`, `fuerza`, `rot` y las frases `f_abd_i`, `f_abd_a`, `f_abd_pe`, `f_abd_p`, `f_gu`, `f_columna`, `f_ext`, `f_neuro`).
- Listas de otras áreas que usa: `eva` (dolor, área 03), `conciencia` (estado de conciencia, área 03) y `pulsos` (amplitud de pulsos, área 05). Se documentan en sus áreas.
- Guías: 123 filas en 12 ámbitos; 2 de ellas marcadas «fuera de notas» (descripción de cada grado de fuerza y escala habitual de reflejos).
- Umbrales de interpretación: ninguno.
- Definiciones nuevas en `datos/definiciones-06.csv`: 83 (significado clínico de todos los códigos alterados de las ocho listas de frases; 2 «fuera de notas» y 1 con respaldo en otro curso del wiki).

## Abdomen: orden del examen (inspección, auscultación, percusión, palpación) y valores normales

En la app los cuatro campos del abdomen aparecen en ese orden (inspección, auscultación, percusión, palpación). **Las notas indican otro orden para explorar**: inspección, auscultación (antes de tocar, para no alterar los ruidos hidroaéreos), palpación superficial y profunda, y por último percusión (09b; 03). La tabla sigue el orden de las notas.

| Tiempo | Normal | Qué buscar | Fuente |
|---|---|---|---|
| 1. Inspección | Abdomen levemente convexo y simétrico (convexo en el niño, plano en el adulto joven, globuloso en el anciano); ombligo centrado; sin circulación colateral ni ondas peristálticas visibles | Forma y volumen, abultamientos, piel (cicatrices, estrías, Cullen, Grey Turner, roséolas tíficas), vello, circulación colateral, contracciones visibles, movimientos respiratorios, pulsaciones y cicatriz umbilical. Examinar también de pie y al toser (hernias) | 09b |
| 2. Auscultación | Ruidos hidroaéreos de intensidad moderada, 4 a 5 por minuto (en 2018: 4 a 6); sin soplos | Ruidos aumentados y metálicos (obstrucción mecánica), silencio abdominal (íleo paralítico, peritonitis), soplo periumbilical (aneurisma aórtico) o en flancos y región lumbar (estenosis de la arteria renal) | 09b |
| 3. Palpación superficial y profunda | Blando, depresible, no doloroso; hígado, vesícula y bazo no palpables en el adulto; solo el polo inferior del riñón derecho puede palparse en personas delgadas | Sensibilidad y puntos dolorosos, defensa o abdomen en tabla, hernias, masas (localización, forma y volumen, sensibilidad, consistencia, movilidad), visceromegalias, Blumberg, Murphy, oleada ascítica | 09b; 10b |
| 4. Percusión | Timpanismo en vísceras huecas (más nítido en el espacio de Traube); matidez hepática desde el quinto espacio intercostal derecho; matidez desplazable negativa | Hipertimpanismo (meteorismo, obstrucción, neumoperitoneo), signo de Jobert, matidez en flancos y matidez desplazable (ascitis), matidez en hipogastrio (globo vesical, útero grávido) | 09b; 10b |

Posición para todo el abdomen: decúbito dorsal sin almohada o con una plana, miembros extendidos, examinador a la derecha, buena luz y manos tibias; para palpar, pedir que respire hondo con la boca abierta y flexione las piernas (09b).

**Guía compartida del abdomen (ámbito `efr.abdomen`, se muestra en los cuatro campos del abdomen)**

*Valores normales*

- Abdomen normal levemente convexo y simétrico: convexo en el niño, plano en el adulto joven, globuloso en el anciano. — *09b*
- Ruidos hidroaéreos normales: intensidad moderada, 4 a 5 por minuto (2018: 4 a 6) — *09b*
- Hígado: el borde inferior no rebasa el reborde costal y no se palpa. Su límite superior se percute en el quinto espacio intercostal. — *09b*
- El bazo y la vesícula biliar no son palpables en el adulto normal. El espacio de Traube es normalmente timpánico. — *09b*

*Cómo interpretar*

- Ruidos aumentados y metálicos con dolor cólico: obstrucción mecánica. Silencio abdominal: íleo paralítico o peritonitis. — *09b*
- Hepatomegalia bajo el reborde costal: pequeña hasta 2 traveses de dedo, mediana hasta 4, grande más de 4 o hasta el ombligo. — *09b*
- Blumberg positivo (dolor al soltar bruscamente): irritación peritoneal. Murphy positivo (corta la inspiración): colecistitis. — *09b*
- Ascitis: oleada positiva en gran volumen (más de 1500 mililitros). En volumen mediano (500 a 1500): matidez desplazable. — *09b*

*No olvidar*

- Auscultar antes de palpar y percutir, porque tocar primero altera los ruidos hidroaéreos. — *09b*
- Defensa sostenida o abdomen en tabla: irritación peritoneal. La contractura por temor cede al tranquilizar al paciente. — *09b*

## Regiones del abdomen

Puntos de referencia (09b): ángulo de Charpy, rebordes costales inferiores, cicatriz umbilical, crestas ilíacas, espinas ilíacas anterosuperiores, sínfisis pubiana y ligamento de Poupart (inguinal).

**Nueve regiones.** Dos líneas verticales (prolongación de la línea medioclavicular de cada lado) y dos horizontales (una une los rebordes costales inferiores y otra une las espinas ilíacas anterosuperiores). La numeración es la de la nota.

| Número | Región | Contenido (proyección visceral) | Un hallazgo aquí orienta a | Fuente |
|---|---|---|---|---|
| 1 | Hipocondrio derecho | Hígado, vesícula biliar, ángulo hepático del colon, riñón y suprarrenal derechos | Patología biliar (punto cístico, Murphy); hepatomegalia | 09b |
| 2 | Hipocondrio izquierdo | Estómago, bazo, ángulo esplénico del colon, cola del páncreas, riñón y suprarrenal izquierdos | Esplenomegalia | 09b |
| 3 | Epigastrio | Lóbulo izquierdo del hígado, cara anterior del estómago, vía biliar, duodeno, aorta y vena cava | Úlcera péptica (punto epigástrico); dolor súbito «en puñalada» de la perforación; dolor «en barra» de la pancreatitis | 09b; 09f; 09g |
| 4 | Flanco derecho | Colon ascendente | Riñón palpable, tumor renal o hidronefrosis; equimosis de Grey Turner | 09b; 10b |
| 5 | Flanco izquierdo | Colon descendente | Igual que el derecho; esplenomegalia que se confunde con riñón | 09b; 10b |
| 6 | Mesogastrio | Epiplón mayor y colon transverso | Dolor cólico periumbilical de origen intestinal; Cullen; soplo de aneurisma aórtico | 09b; 09f |
| 7 | Fosa ilíaca derecha | Ciego y apéndice | Apendicitis (McBurney, Rovsing, psoas) | 09b; 09f |
| 8 | Fosa ilíaca izquierda | Colon sigmoides | Diarrea baja (dolor cólico); presión para el signo de Rovsing | 09b; 09e; 09f |
| 9 | Hipogastrio | Vejiga | Globo vesical; dolor vesical o de anexos; signo del obturador | 09b; 09f; 10b |

**Cuatro cuadrantes.** Una línea vertical xifopubiana y una horizontal que pasa por el ombligo dan los cuadrantes superior derecho, superior izquierdo, inferior derecho e inferior izquierdo; es una división más gruesa que la de nueve regiones (09b). **Las notas no detallan el contenido de cada cuadrante**; la tabla siguiente es orientativa (fuera de notas).

| Cuadrante | Contenido principal | Fuente |
|---|---|---|
| Superior derecho | Hígado, vesícula biliar, duodeno, cabeza del páncreas, riñón derecho, ángulo hepático del colon | fuera de notas |
| Superior izquierdo | Estómago, bazo, cuerpo y cola del páncreas, riñón izquierdo, ángulo esplénico del colon | fuera de notas |
| Inferior derecho | Ciego, apéndice, uréter derecho; ovario y trompa derechos en la mujer | fuera de notas |
| Inferior izquierdo | Colon descendente y sigmoides, uréter izquierdo; ovario y trompa izquierdos en la mujer | fuera de notas |

## Abdomen · inspección

| Dato | Detalle |
|---|---|
| Identificador | `efr.abdomen_inspeccion` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | Frases · abdomen inspección (`f_abd_i`) |
| Valor normal | Abdomen plano, simétrico, sin cicatrices ni circulación colateral. Ombligo centrado. No se observan movimientos peristálticos. |
| Escalas que admite | — |
| Reglas de redacción | Describir sin interpretar |

**Guía**

*Además se muestra la guía compartida del abdomen (ver «Abdomen: orden del examen»).*

*Posición*

- Decúbito dorsal sin almohada o con una plana, miembros extendidos. Examinador a la derecha, buena luz, manos tibias. — *09b*

*Cómo explorar*

- Orden en el abdomen: inspección, auscultación, palpación superficial y profunda, y por último percusión. — *09b*
- Ubicar cada hallazgo en las 9 regiones o en los 4 cuadrantes del abdomen. — *09b*
- Examinar también de pie y pedir que tosa: las hernias pequeñas pasan inadvertidas en decúbito. — *09b*

*Qué buscar*

- Forma: plano, globuloso (obesidad, ascitis, embarazo), excavado o asimétrico. Abdomen de batracio en ascitis. — *09b*
- Piel: cicatrices, estrías, manchas de Cullen (periumbilical) y Grey Turner (flancos), roséolas tíficas. — *09b*
- Circulación colateral, ondas peristálticas visibles, pulsaciones, movimientos respiratorios y cicatriz umbilical. — *09b*

**Lista `f_abd_i`** · Frases · abdomen inspección · tipo frase · usada en `efr.abdomen_inspeccion`

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Abdomen plano, simétrico, sin cicatrices ni circulación colateral. Ombligo centrado. No se observan movimientos peristálticos. | Valor normal por defecto del campo. | 09b |
| `a1` | Abdomen globuloso a expensas de panículo adiposo. | Aumento de volumen por grasa de la pared: obesidad. Diferenciar de la ascitis, el embarazo, las neoplasias y la obstrucción, que también lo abultan. | 09b |
| `a2` | Abdomen distendido. | Aumento global de volumen por gas o líquido: obstrucción intestinal, íleo paralítico, peritonitis o ascitis. | 09b; 09e; 09f; 09g |
| `a3` | Abdomen excavado. | Pared retraída o excavada: propia de las enfermedades consuntivas, con pérdida de grasa y de masa muscular. | 09b |
| `a4` | Abdomen asimétrico por abultamiento en {region_abd}. | Abultamiento localizado: visceromegalia (hígado, bazo), quiste, tumor o hernia; la región orienta al órgano comprometido. | 09b |
| `a5` | Abdomen de batracio, con flancos abombados. | Líquido libre que cae a los flancos en decúbito dorsal: ascitis (cirrosis, insuficiencia cardíaca, síndrome nefrótico, neoplasias). | 09b; 09e |
| `a6` | Circulación colateral {circulacion}. | Obstáculo en un tronco venoso: periumbilical (cabeza de medusa) sugiere hipertensión portal; en flancos, vena cava inferior comprimida. | 05i; 10b |
| `a7` | Estrías rojo-violáceas en {region_abd}. | Estrías rojo violáceas y persistentes: síndrome de Cushing. Las rosadas son recientes y las nacaradas, antiguas por distensión. | 09b |
| `a8` | Cicatriz quirúrgica en {region_abd}, de {cm} cm. | Antecedente de cirugía abdominal: las bridas posquirúrgicas son la primera causa de obstrucción intestinal y la cicatriz puede herniarse. | 09g; 09f |
| `a9` | Equimosis periumbilical (signo de Cullen). | Equimosis periumbilical por sangre intraperitoneal o retroperitoneal: pancreatitis aguda hemorrágica (signo tardío) o embarazo ectópico roto. | 09b; 09d |
| `a10` | Equimosis en flancos (signo de Grey Turner). | Equimosis en flancos por sangre en el retroperitoneo: signo tardío de pancreatitis aguda hemorrágica o necrohemorrágica. | 09b; 09d |
| `a11` | Ondas peristálticas visibles en {region_abd}. | Peristaltismo de lucha contra un obstáculo: obstrucción intestinal avanzada; su ubicación y dirección orientan el nivel. | 09b; 09g |
| `a12` | Abultamiento en {region_abd} que aumenta al toser o pujar. | Hernia de la pared abdominal: el contenido sale por una zona débil al subir la presión; las pequeñas se ven mejor de pie. | 09b |
| `a13` | Cicatriz umbilical protruida. | Presión intraabdominal aumentada: ascitis o hernia. Si el ombligo se ve azulado, sugiere hemorragia intraabdominal. | 09b; 09e |

## Abdomen · auscultación

| Dato | Detalle |
|---|---|
| Identificador | `efr.abdomen_auscultacion` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | Frases · abdomen auscultación (`f_abd_a`) |
| Valor normal | Ruidos hidroaéreos presentes, de tono e intensidad normales. No se auscultan soplos abdominales. |
| Escalas que admite | — |
| Reglas de redacción | Describir sin interpretar |

**Guía**

*Además se muestra la guía compartida del abdomen (ver «Abdomen: orden del examen»).*

*Qué usar*

- Estetoscopio con diafragma. — *09b*

*Cómo explorar*

- Auscultar antes de palpar y percutir, para no alterar los ruidos hidroaéreos. Paciente en decúbito dorsal. — *09b*

*Qué buscar*

- Ruidos hidroaéreos normales: intensidad moderada, 4 a 5 por minuto. — *09b*
- Ruidos aumentados y metálicos: obstrucción mecánica. Silencio abdominal: íleo paralítico o peritonitis. — *09b*
- Soplos: periumbilical por aneurisma aórtico, en flancos o región lumbar por estenosis de la arteria renal. — *09b*

**Lista `f_abd_a`** · Frases · abdomen auscultación · tipo frase · usada en `efr.abdomen_auscultacion`

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Ruidos hidroaéreos presentes, de tono e intensidad normales. No se auscultan soplos abdominales. | Valor normal por defecto del campo. | 09b |
| `a1` | Ruidos hidroaéreos aumentados. | Peristaltismo aumentado: síndrome diarreico (con borborigmos) o fase inicial de una obstrucción intestinal. | 09e; 09g |
| `a2` | Ruidos hidroaéreos abolidos. | Silencio abdominal: íleo paralítico o peritonitis generalizada. En el posoperatorio es esperable entre 24 y 72 horas. | 09b; 09g |
| `a3` | Ruidos hidroaéreos aumentados, de tono metálico. | Peristaltismo de lucha: obstrucción intestinal mecánica, sobre todo con dolor cólico (bridas, hernias estranguladas). | 09b; 09g |
| `a4` | Ruidos hidroaéreos disminuidos. | Inhibición del peristaltismo: peritonitis que avanza hacia íleo paralítico, o hemoperitoneo como en el embarazo ectópico roto. | 09f; 09g |
| `a5` | Soplo sistólico periumbilical. | Flujo turbulento en la aorta abdominal: aneurisma aórtico. | 09b |
| `a6` | Soplo sistólico en flanco {lado}. | Estenosis de la arteria renal, a menudo con hipertensión arterial severa; también puede deberse a una fístula arteriovenosa. | 09b; 10b |

## Abdomen · percusión

| Dato | Detalle |
|---|---|
| Identificador | `efr.abdomen_percusion` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | Frases · abdomen percusión (`f_abd_pe`) |
| Valor normal | Timpanismo generalizado. Matidez hepática conservada. Matidez desplazable negativa. |
| Escalas que admite | — |
| Reglas de redacción | Describir sin interpretar |

**Guía**

*Además se muestra la guía compartida del abdomen (ver «Abdomen: orden del examen»). En la app este campo va antes que la palpación; las notas percuten al final.*

*Cómo explorar*

- Paciente en decúbito dorsal. Percusión dígito-digital en líneas próximas o en forma radiada desde el epigastrio. — *09b*
- Hígado: submatidez desde el 5.º espacio intercostal derecho, bajar hasta que reaparezca el timpanismo (borde inferior) — *09b*
- Oleada ascítica: borde cubital de una mano en la línea media, palma en un flanco y golpecitos en el flanco opuesto. — *09b*
- Matidez desplazable: percutir en decúbito dorsal y luego lateral derecho. Positiva si la matidez pasa al lado declive. — *09b*

*Qué buscar*

- Mate en vísceras macizas, timpánico en huecas (más en Traube). Hipertimpanismo: meteorismo, obstrucción, neumoperitoneo. — *09b*
- Signo de Jobert: timpanismo sobre el área hepática, sugiere neumoperitoneo por perforación. — *09b*
- Ascitis grande: oleada positiva y matidez en flancos. Mediana: oleada negativa, usar matidez desplazable. Pequeña: ecografía. — *09b*

**Lista `f_abd_pe`** · Frases · abdomen percusión · tipo frase · usada en `efr.abdomen_percusion`

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Timpanismo generalizado. Matidez hepática conservada. Matidez desplazable negativa. | Valor normal por defecto del campo. | 09b; 09e |
| `a1` | Hipertimpanismo difuso. | Exceso de aire en el abdomen: meteorismo, obstrucción intestinal o neumoperitoneo. | 09b |
| `a2` | Matidez en flancos con concavidad superior. | Líquido libre acumulado en los flancos: ascitis de gran volumen (más de 1500 mililitros). | 09b |
| `a3` | Matidez desplazable positiva. | La matidez cambia de lugar con el decúbito: líquido libre (ascitis de mediano volumen, de 500 a 1500 mililitros, o hemoperitoneo). | 09b; 09e; 09g |
| `a4` | Pérdida de la matidez hepática (signo de Jobert). | Timpanismo sobre el área hepática: neumoperitoneo por perforación de víscera hueca. Falsos positivos: enfisema pulmonar o colon interpuesto. | 09b; 09f |
| `a5` | Matidez en hipogastrio. | Órgano lleno o macizo en la pelvis: globo vesical de gran volumen o útero grávido. | 09b; 10b |

## Abdomen · palpación

| Dato | Detalle |
|---|---|
| Identificador | `efr.abdomen_palpacion` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | Frases · abdomen palpación (`f_abd_p`) |
| Valor normal | Blando, depresible, no doloroso a la palpación superficial ni profunda. No se palpan visceromegalias ni masas. Blumberg y Murphy negativos. Puño-percusión lumbar negativa bilateral. |
| Escalas que admite | Dolor · escala visual análoga (`eva`) |
| Reglas de redacción | Describir sin interpretar |

**Guía**

*Además se muestra la guía compartida del abdomen (ver «Abdomen: orden del examen»).*

*Posición*

- Decúbito dorsal. Pedir que respire hondo con la boca abierta y flexione las piernas para relajar la pared. — *09b*

*Cómo explorar*

- Superficial con la palma, no la punta de los dedos, suave y en orden desde la fosa ilíaca derecha. La zona dolorosa al final. — *09b*
- Profunda: aumentar la presión de forma gradual. Masa: localización, forma, volumen, sensibilidad, consistencia, movilidad. — *09b*
- Blumberg: comprimir lento, sostener y soltar de golpe. Positivo si duele más al soltar (irritación peritoneal) — *09b*
- Hígado bimanual: mano izquierda en región lumbar, derecha bajo el reborde costal, buscar el borde en inspiración profunda. — *09b*
- Murphy: pulgar en el punto cístico bajo el reborde costal derecho y pedir inspiración. Positivo si la corta por dolor. — *09b*
- Bazo: bimanual bajo el reborde izquierdo o Schuster (decúbito lateral derecho, pierna izquierda flexionada a 90°) — *09b*

*Qué buscar*

- Puntos epigástrico, cístico, McBurney y ureterales. Defensa o abdomen en tabla. Hernias al pujar o toser. — *09b*

**Lista `f_abd_p`** · Frases · abdomen palpación · tipo frase · usada en `efr.abdomen_palpacion`

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Blando, depresible, no doloroso a la palpación superficial ni profunda. No se palpan visceromegalias ni masas. Blumberg y Murphy negativos. Puño-percusión lumbar negativa bilateral. | Valor normal por defecto del campo. | 09b; 10b |
| `a1` | Hepatomegalia de {cm} cm bajo el reborde costal derecho, de borde romo y superficie lisa. | Borde romo y liso: crecimiento rápido (hepatitis, congestión por insuficiencia cardíaca derecha). Duro y cortante: cirrosis; pétreo o nodular: cáncer. | 09b; 09d |
| `a2` | Doloroso a la palpación en | Hipersensibilidad de la pared o de la víscera subyacente; la región dolorosa orienta al órgano (por ejemplo, fosa ilíaca derecha y apéndice). | 09b |
| `a3` | Dolor a la palpación profunda en {region_abd}. | Dolor visceral de un órgano inflamado o distendido bajo esa región; en el síndrome diarreico acompaña a los ruidos hidroaéreos aumentados. | 09b; 09e |
| `a4` | Punto {punto} doloroso. | Epigástrico: úlcera péptica activa. Cístico: colecistitis aguda. McBurney: apendicitis aguda. Ureteral: cólico renal. | 09b; 09f |
| `a5` | Defensa abdominal en {region_abd}. | Contractura refleja sostenida por inflamación visceral que compromete el peritoneo parietal (peritonitis localizada); no cede al tranquilizar. | 09b; 09f |
| `a6` | Abdomen en tabla. | Defensa generalizada de toda la pared: peritonitis difusa, típica de la perforación de víscera hueca (úlcera péptica perforada). | 09b; 09f |
| `a7` | Signo de Blumberg positivo en {region_abd}. | Dolor que aparece o aumenta al descomprimir bruscamente: irritación peritoneal (apendicitis, peritonitis). | 09b; 09f |
| `a8` | Signo de Murphy positivo. | El dolor en el punto cístico interrumpe la inspiración profunda: colecistitis aguda. | 09b; 09d |
| `a9` | Signo {signo_abd} positivo. | Rovsing (dolor en fosa ilíaca derecha al comprimir la izquierda), psoas (apéndice retrocecal) u obturador (apéndice pélvico): apendicitis. | 09f |
| `a10` | Signo de la oleada ascítica positivo. | Transmisión de la onda por líquido libre: ascitis de gran volumen, a tensión (más de 1500 mililitros). | 09b; 09e |
| `a11` | Hígado palpable a {traveses} traveses de dedo bajo el reborde costal derecho en la línea medioclavicular. | Hepatomegalia: pequeña hasta 2 traveses de dedo, mediana hasta 4 y grande más de 4 o hasta el ombligo. En el adulto normal no se palpa. | 09b |
| `a12` | Bazo palpable a {cm} cm del reborde costal izquierdo en la línea medioclavicular. | Esplenomegalia (el bazo palpable ya duplicó su volumen): hipertensión portal, infecciones, leucemias o linfomas. | 09b; 09d |
| `a13` | Vesícula palpable e indolora (signo de Courvoisier-Terrier). | Vesícula distendida e indolora en paciente ictérico: obstrucción biliar por neoplasia de vesícula, vías biliares o cabeza de páncreas. | 09b; 09d; 09e |
| `a14` | Masa palpable en {region_abd}, de {cm} cm. | Tumoración, quiste o víscera aumentada; describir localización, forma, volumen, sensibilidad, consistencia y movilidad para orientar su origen. | 09b |

Marcadores de esta lista: `{region_abd}` (el epigastrio, los hipocondrios, el mesogastrio, los flancos, las fosas ilíacas, el hipogastrio, la región periumbilical), `{punto}` (epigástrico, cístico, de McBurney, ureteral), `{signo_abd}` (de Rovsing, del psoas, del obturador), `{traveses}` (1 a 5) y `{cm}`. La escala de dolor (`eva`) se documenta en el área 03.

## Genitourinario

| Dato | Detalle |
|---|---|
| Identificador | `efr.genitourinario` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | Frases · genitourinario (`f_gu`) |
| Valor normal | Región lumbar sin deformaciones. Puntos renoureterales no dolorosos. No se palpa globo vesical. |
| Escalas que admite | Dolor · escala visual análoga (`eva`) |
| Reglas de redacción | Describir sin interpretar |

**Guía**

*Qué usar*

- Tacto rectal: guantes y vaselina líquida en el índice derecho. Contraindicado en fisura anal y trombosis hemorroidal. — *10b*

*Posición*

- Israel: decúbito lateral sobre el lado opuesto al riñón examinado. Guyon: decúbito dorsal con impulsos costovertebrales. — *10b*
- Tacto rectal: genupectoral o decúbito dorsal con rodillas flexionadas, buena luz y explicar antes el examen. — *10b*

*Cómo explorar*

- Inspección de flancos, abdomen y región lumbar: abombamientos, signos inflamatorios, fístulas. Varicocele derecho: tumor renal. — *10b*
- Riñón bimanual: decúbito dorsal, mano izquierda en región lumbar empuja hacia adelante, derecha palpa el flanco. — *10b*
- Puño-percusión: mano izquierda abierta en región lumbar, golpe con el puño derecho, en ambos lados. Dolor: Giordano positivo. — *10b*

*Qué buscar*

- Riñón: forma, consistencia, tamaño, situación, superficie, dolor, movilidad y peloteo. Normal solo polo inferior derecho. — *10b*
- Vejiga: distensión sobre el ombligo, masa periforme tras el pubis y matidez en hipogastrio (globo vesical) — *10b*

**Lista `f_gu`** · Frases · genitourinario · tipo frase · usada en `efr.genitourinario`

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Región lumbar sin deformaciones. Puntos renoureterales no dolorosos. No se palpa globo vesical. | Valor normal por defecto del campo. | 10b; 09b |
| `a1` | Examen genital diferido por no ser pertinente al cuadro actual. | No es un hallazgo: deja constancia de que el examen genital no se hizo por no corresponder al motivo de consulta. | fuera de notas |
| `a2` | Puño-percusión lumbar {lado_f} dolorosa (signo de Giordano positivo). | Dolor a la puño-percusión lumbar: proceso renal inflamatorio (pielonefritis aguda, absceso perinefrítico). Diferenciar de la lumbalgia muscular. | 10b |
| `a3` | Punto ureteral {lado} doloroso. | Dolor en el trayecto del uréter, en el borde externo de los rectos: cólico renal. | 09b |
| `a4` | Riñón {lado} palpable. | Normal solo el polo inferior del riñón derecho en delgados. Si no: ptosis renal, tumor renal, hidronefrosis o poliquistosis. | 10b |
| `a5` | Globo vesical palpable, doloroso y mate a la percusión. | Retención urinaria (hipertrofia benigna de próstata en mayores de 60 años), tumor o quiste vesical; desaparece al vaciar la vejiga. | 10b |
| `a6` | Abombamiento lumbar {lado}. | Masa renal o perirrenal: tumor renal, hidronefrosis, poliquistosis o absceso perinefrítico (este con signos inflamatorios). | 10b |
| `a7` | Varicocele {lado}. | Dilatación de las venas del escroto; si es derecho y reciente, sugiere compresión de la vena espermática por cáncer de riñón. | 10b |
| `a8` | Edema de genitales. | Compresión de la vena cava inferior y las ilíacas (globo vesical crónico, embarazo avanzado) o anasarca (síndrome nefrótico). | 10b; 05g |

Marcadores: `{lado}` (derecho, izquierdo, bilateral) y `{lado_f}` (derecha, izquierda, bilateral).

**Examen de la vejiga según las notas (10b)**

| Método | Hallazgo | Significado |
|---|---|---|
| Inspección | Distensión visible por encima del ombligo | Globo vesical por retención urinaria (hipertrofia benigna de próstata en mayores de 60 años) |
| Palpación | Masa dolorosa, firme, periforme, que se continúa por detrás del pubis | Retención urinaria, tumor o quiste vesical |
| Percusión | Matidez en el hipogastrio | Globo vesical de gran volumen |
| Auscultación | Soplo sistólico en flancos o región lumbar | Estenosis de la arteria renal (hipertensión arterial severa) |

Maniobras de palpación renal (10b): **bimanual** (decúbito dorsal; la mano izquierda en la región lumbar empuja hacia adelante y la derecha palpa el flanco), **Guyon** (impulsos sobre el ángulo costovertebral para sentir el rechazo del riñón) e **Israel** (decúbito lateral sobre el lado contrario al riñón examinado). En todas se describe forma, consistencia, tamaño, situación, superficie, sensibilidad, movilidad y peloteo.

## Columna vertebral

| Dato | Detalle |
|---|---|
| Identificador | `efr.columna` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | Frases · columna (`f_columna`) |
| Valor normal | Conserva curvaturas fisiológicas. Movilidad conservada en todos los planos, sin dolor a la palpación de apófisis espinosas. Lasègue negativo bilateral. |
| Escalas que admite | Dolor · escala visual análoga (`eva`), Fuerza muscular (MRC) (`fuerza`) |
| Reglas de redacción | Describir sin interpretar |

**Guía**

*Cómo explorar*

- Se inspecciona con la cara posterior del tórax descubierta. Referencia: apófisis espinosa de C7, la más prominente. — *07b*
- Contar las apófisis espinosas hacia abajo desde C7. La de L1 se reconoce por ser redondeada. — *07b*
- Cuello: movilidad activa y pasiva (flexión, extensión, rotación, lateralidad). La rigidez duele en ambas. — *06c*
- Lasègue: decúbito dorsal, elevar la pierna extendida. Dolor antes de 90° en síndrome radicular o meníngeo. — *11e*

*Qué buscar*

- Cifosis (convexidad posterior T8-L3: osteoporosis, mal de Pott), lordosis lumbar y escoliosis (desviación lateral) — *07b*
- Cifoescoliosis avanzada: puede terminar en insuficiencia respiratoria y cor pulmonale crónico. — *05a*
- Decúbito dorsal inmóvil obligado: fractura de columna, espondilitis o hernia de disco. — *05a*
- El dolor lumbar musculoesquelético (contractura, artrosis, hernia discal) es diferencial del Giordano renal. — *10b*

**Lista `f_columna`** · Frases · columna · tipo frase · usada en `efr.columna`

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Conserva curvaturas fisiológicas. Movilidad conservada en todos los planos, sin dolor a la palpación de apófisis espinosas. Lasègue negativo bilateral. | Valor normal por defecto del campo. | 07b; 11e |
| `a1` | Dolor a la palpación de apófisis espinosas en región | Dolor óseo vertebral localizado: orienta a lesión de la vértebra, como fractura, espondilitis (incluido el mal de Pott) o neoplasia. | fuera de notas |
| `a2` | Signo de Lasègue positivo a {grados}° en miembro inferior {lado}. | Dolor antes de los 90° al elevar la pierna extendida: síndrome radicular (hernia discal que comprime la raíz) o irritación meníngea. | 11e |
| `a3` | Contractura paravertebral lumbar {lado_f}. | Espasmo de la musculatura lumbar: lumbalgia musculoesquelética (contractura, artrosis, hernia discal); diferencial del signo de Giordano. | 10a; 10b |
| `a4` | Cifosis dorsal. | Convexidad posterior exagerada, sobre todo de la octava vértebra dorsal a la tercera lumbar: osteoporosis, espondilitis anquilosante o mal de Pott. | 07b; 05a |
| `a5` | Hiperlordosis lumbar. | Convexidad anterior lumbar acentuada: obesidad importante, debilidad de la musculatura posterior o embarazo avanzado. | 07b |
| `a6` | Escoliosis de convexidad {lado_f}. | Desviación lateral de la columna, congénita o secundaria, casi siempre compensadora. | 07b; 05a |
| `a7` | Cifoescoliosis. | Cifosis más escoliosis: restringe la ventilación y, si es avanzada, lleva a insuficiencia respiratoria y corazón pulmonar crónico. | 07b; 05a |
| `a8` | Movilidad limitada por dolor a la {movimiento_col}. | Dolor que limita el movimiento: causa musculoesquelética (contractura, espondiloartrosis, hernia discal); en el cuello, también irritación meníngea. | 10a; 06c |

Marcadores: `{grados}` (30, 45, 60), `{lado}`, `{lado_f}` y `{movimiento_col}` (flexión, extensión, lateralización, rotación). La frase `a1` no tiene marcador (ver Discrepancias). Las escalas `eva` (área 03) y `fuerza` (más abajo) se agregan al texto cuando corresponde.

Nota sobre `a1`: las notas no relacionan en forma directa el dolor a la palpación de las apófisis espinosas con una causa; las enfermedades vertebrales citadas (fractura, espondilitis, mal de Pott, neoplasia vertebral) sí figuran en 05a y 07b.

## Extremidades

Cuatro campos con la misma lista, el mismo valor normal y las mismas escalas.

| Identificador | Campo | Tipo · Obligatorio | Lista |
|---|---|---|---|
| `efr.msd` | Miembro superior derecho | Párrafo redactado · No | Frases · extremidades (`f_ext`) |
| `efr.msi` | Miembro superior izquierdo | Párrafo redactado · No | Frases · extremidades (`f_ext`) |
| `efr.mid` | Miembro inferior derecho | Párrafo redactado · No | Frases · extremidades (`f_ext`) |
| `efr.mii` | Miembro inferior izquierdo | Párrafo redactado · No | Frases · extremidades (`f_ext`) |

| Dato | Detalle |
|---|---|
| Valor normal (los cuatro) | Simétrico, sin edema, con pulsos presentes 2+/4+, fuerza 5/5, movilidad conservada y llenado capilar menor de 2 segundos. |
| Escalas que admite | Edema con fóvea (`godet`), Amplitud de pulsos (`pulsos`), Fuerza muscular (MRC) (`fuerza`), Reflejos osteotendinosos (`rot`) |
| Reglas de redacción | Describir sin interpretar |

**Guía compartida de las extremidades (ámbito `efr.extremidades`)**

*Cómo explorar*

- Temblor: extender ambas manos, palmas abajo y dedos separados. Una hoja de papel sobre el dorso amplifica el temblor fino. — *05b*
- Asterixis: mano en posición de juramento forzada hacia atrás. Aleteo en encefalopatía hepática o coma urémico. — *05b*
- Temperatura con el dorso de la mano comparando regiones simétricas. Frío localizado: obstrucción arterial. — *05f*
- Trousseau: comprimir el brazo con el brazalete del tensiómetro 10 minutos. Espasmo carpopedal en hipocalcemia. — *05b*

*Qué buscar*

- Hipocratismo digital (palillo de tambor, uñas en vidrio de reloj), petequias ungueales y nódulos de Osler. — *08b*
- Trofismo por inspección y palpación: hipotrofia, atrofia o hipertrofia. Fasciculaciones visibles en reposo. — *11b*
- Pierna cruzada que se mueve con cada latido y signo de Quincke en las uñas: insuficiencia aórtica. — *08e*
- Marcha: cojera, cerebelosa (base amplia), parkinsoniana, hemipléjica en guadaña, laberíntica o polineurítica. — *05b*

**Lista `f_ext`** · Frases · extremidades · tipo frase · usada en `efr.msd`, `efr.msi`, `efr.mid`, `efr.mii`

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Simétrico, sin edema, con pulsos presentes 2+/4+, fuerza 5/5, movilidad conservada y llenado capilar menor de 2 segundos. | Valor normal por defecto del campo. | 05g; 08i; 11b |
| `a1` | Edema con fóvea hasta | Líquido intersticial que deja fóvea: bilateral y vespertino sugiere causa cardíaca, renal o hepática; unilateral, trombosis venosa profunda. | 05g |
| `a2` | Edema sin fóvea en dorso de pies y manos, con piel fría y áspera. | Mixedema del hipotiroidismo: depósito de mucopolisacáridos y no de agua libre, por eso no deja fóvea. | 05g |
| `a3` | Pulso {pulso_mi} disminuido en comparación con el contralateral. | Obstrucción arterial parcial por encima del punto explorado (isquemia crónica); en el pulso radial, estenosis de la arteria subclavia. | 08i; 11h |
| `a4` | Pulso {pulso_mi} ausente. | Obstrucción arterial por encima del punto; con dolor súbito, frialdad y palidez sugiere síndrome isquémico agudo (embolia). | 08i |
| `a5` | Frío y pálido, con pérdida de vello. | Isquemia arterial del miembro (aterosclerosis o embolia): la crónica da claudicación intermitente y puede progresar a úlceras y gangrena. | 08i; 05f |
| `a6` | Várices en {region_mi}. | Dilataciones venosas permanentes por insuficiencia valvular; su complicación más grave es la tromboflebitis. | 08i |
| `a7` | Úlcera en {region_mi}, de {cm} cm. | Pérdida de piel: varicosa por insuficiencia venosa, o isquémica (periungueal, con dolor en reposo) por obstrucción arterial avanzada. | 08i |
| `a8` | Signo de Homans positivo. | Dolor en la pantorrilla a la dorsiflexión forzada del pie: tromboflebitis o trombosis venosa profunda. | 08i |
| `a9` | Dedos en palillo de tambor con uñas en vidrio de reloj. | Hipocratismo digital: cardiopatía congénita cianótica, endocarditis subaguda, cáncer de pulmón o broncopatía crónica. | 05i; 08b |
| `a10` | Hipotrofia muscular en {region_mi}. | Disminución del volumen muscular: lesión de motoneurona inferior, desuso o encamamiento prolongado, o isquemia arterial crónica. | 11b; 05i; 08i |
| `a11` | Llenado capilar mayor de 2 segundos. | Hipoperfusión periférica: hipovolemia (deshidratación, hemorragia) o bajo gasto cardíaco; valorar con presión arterial y diuresis. | FISIOLOGIA 2026/concepts/Perfusión-Tisular.md; FISIOPATOLOGIA 2026/entities/enfermedades/Hipovolemia.md |

Marcadores: `{pulso_mi}` (femoral, poplíteo, tibial posterior, pedio, radial), `{region_mi}` (la pierna, el tercio inferior de la pierna, el muslo, el pie, el antebrazo) y `{cm}`. La frase `a1` no tiene marcador y se completa con la escala `godet`. La escala `pulsos` se documenta en el área 05.

**Maniobras vasculares de las notas que no tienen guía propia**

| Maniobra | Cómo se busca | Qué indica | Fuente |
|---|---|---|---|
| Palpación comparativa de pulsos | Femoral, poplíteo, tibiales y pedio frente al miembro sano; en los brazos, pulso radial y presión arterial en ambos lados | La asimetría localiza la obstrucción arterial; un pulso radial más débil y retardado sugiere estenosis de la subclavia | 08i; 11h |
| Signo de Homans | Dorsiflexión forzada del pie | Dolor en la pantorrilla: tromboflebitis | 08i |
| Signo de Olow | Presión directa sobre la pantorrilla | Dolor en la pantorrilla: tromboflebitis | 08i |
| Prueba de Trendelenburg | Vaciar la pierna elevada, comprimir la safena interna, poner de pie y soltar | Llenado rápido de arriba hacia abajo: válvulas de la safena interna insuficientes | 08i |
| Temperatura comparativa | Dorso de la mano sobre regiones simétricas | Frío localizado: obstrucción arterial; caliente: inflamación | 05f |

## Edema con fóvea

| Dato | Detalle |
|---|---|
| Identificador | `efr.edema_godet` |
| Tipo · Obligatorio | Escala · No |
| Lista | Edema con fóvea (`godet`) |
| Valor normal | — (no tiene valor normal: la escala se usa solo si hay edema) |
| Escalas que admite | Edema con fóvea (`godet`) |
| Reglas de redacción | — |

**Guía**

*Qué usar*

- Balanza para el peso diario y cinta métrica para el perímetro del área edematizada. — *05g*

*Cómo explorar*

- Inspección y digitopresión con índice o pulgar sobre plano óseo: cara anterior de la tibia, maléolo o sacro si está encamado. — *05g*
- Comprimir firme y sostenido, nunca en la pantorrilla. Al retirar el dedo, la profundidad de la fóvea (Godet) marca intensidad. — *05g*
- Temperatura con el dorso de los dedos (caliente si es inflamatorio). Dolor a la digitopresión en procesos inflamatorios. — *05g*

*Qué buscar*

- Intensidad en cruces: de 1 cruz (leve) a 4 cruces (anasarca) — *05g*
- Localización y simetría (unilateral: pensar en trombosis venosa profunda). Consistencia: blando si reciente, duro como cáscara de naranja si crónico. — *05g*
- Color: cianótico (cardiaco o venoso), pálido (renal o linfático), rojizo (celulitis). El mixedema no deja fóvea. — *05g*
- Acompañantes: disnea u ortopnea (cardiaco), ascitis con estigmas hepáticos, orina espumosa (nefrótico) — *05g*

*Valores normales*

- Signo de Godet o de la fóvea: presionar con el índice sobre un plano óseo (tibia, maléolo o sacro) y ver si queda depresión. — *05g*
- Intensidad en cruces: de 1 cruz (leve) a 4 cruces (anasarca), según la profundidad de la fóvea. — *05g*

*Cómo interpretar*

- El edema se detecta clínicamente desde unos 5 litros. Por debajo (pre-edema) solo se detecta por el peso. — *05g*
- Cardiaco: vespertino, bilateral, ascendente, en zonas declives. Nefrótico: facial y palpebral matutino, luego generalizado. — *05g*
- Caliente, rojo y doloroso: inflamatorio (celulitis). Cianótico: cardiaco u obstrucción venosa. Pálido: renal o linfático. — *05g*
- Mixedema: edema no depresible (sin fóvea) en el dorso de pies, manos y párpados, con piel fría y áspera. — *05g*
- Consistencia blanda: edema reciente. Dura, en cáscara de naranja: edema crónico. — *05g*

*No olvidar*

- Comprimir en forma firme y sostenida sobre la tibia o el sacro, nunca sobre la pantorrilla. — *05g*
- Edema unilateral de miembro inferior: en 80 a 90 % se debe a trombosis venosa profunda, con riesgo de embolia pulmonar. — *05g*
- El edema de glotis, el edema cerebral y el edema agudo de pulmón son edemas localizados que pueden causar la muerte. — *05g*

**Lista `godet`** · Edema con fóvea · tipo escala · usada en `efr.msd`, `efr.msi`, `efr.mid`, `efr.mii`, `efr.edema_godet`, `dx.resumen`, `evo.evolucion`

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| +/++++ | ≈2 mm, recupera inmediato | `Edema +/++++ hasta {nivel}, {lateralidad}, con fóvea` |
| ++/++++ | ≈4 mm, recupera en ~15 s | `Edema ++/++++ hasta {nivel}, {lateralidad}, con fóvea` |
| +++/++++ | ≈6 mm, recupera en ~30 s | `Edema +++/++++ hasta {nivel}, {lateralidad}, con fóvea` |
| ++++/++++ | ≈8 mm, recupera en más de 1 min | `Edema ++++/++++ hasta {nivel}, {lateralidad}, con fóvea` |

Marcadores del formato: `{nivel}` (tobillos, tercio inferior de piernas, tercio medio de piernas, rodillas, raíz de muslos) y `{lateralidad}` (bilateral, derecho, izquierdo, a predominio derecho, a predominio izquierdo). Ejemplo: «Edema ++/++++ hasta tercio inferior de piernas, bilateral, con fóvea».

Las notas solo gradúan el edema en cruces, de 1 cruz (leve) a 4 cruces (anasarca), según la profundidad de la fóvea (05g). **Los milímetros y los segundos de recuperación de la columna «Descripción» están fuera de notas.**

**Tipos de edema más útiles al pie de la cama (05g)**

| Tipo | Patrón | Rasgo distintivo |
|---|---|---|
| Cardiaco | Miembros inferiores, vespertino, bilateral, ascendente | Zonas declives; puede llegar a anasarca |
| Hepático | Ascitis con edema de miembros inferiores | Telangiectasias, eritema palmar |
| Nefrótico | Facial y palpebral matutino, luego generalizado | Orina espumosa; puede comprometer cavidades |
| Nefrítico | Periorbitario, discreto a moderado | Hematuria e hipertensión arterial |
| Mixedema | Dorso de pies, manos y párpados | Sin fóvea; piel fría y áspera |
| Postural | Maleolar | Hasta 2 cruces; desaparece en decúbito |
| Trombosis venosa profunda | Unilateral, en la pantorrilla | Riesgo de embolia pulmonar |
| Celulitis | Placa localizada | Rojo, caliente y doloroso |
| Linfedema | Unilateral, duro | Sin fóvea, «pata de elefante» (08i) |

## Fuerza muscular

| Dato | Detalle |
|---|---|
| Identificador | `efr.fuerza` |
| Tipo · Obligatorio | Escala · No |
| Lista | Fuerza muscular (MRC) (`fuerza`) |
| Valor normal | Fuerza muscular 5/5 (código `5/5`) |
| Escalas que admite | Fuerza muscular (MRC) (`fuerza`) |
| Reglas de redacción | — |

**Guía**

*Cómo explorar*

- Explorar por grupos musculares contra resistencia y gravedad, comparando lados y grupos proximales con distales. — *11b*
- Tono: resistencia a la movilización pasiva, explorada por palpación y balanceo pasivo del segmento. — *11b*
- Tono de Babinski: sentado, miembros inferiores extendidos y palmas arriba. Si no sostiene la postura: hipotonía. — *11b*
- XI par: girar la cabeza contra resistencia (esternocleidomastoideo) y elevar los hombros contra resistencia (trapecio) — *11d*

*Qué buscar*

- Graduar de 0 a 5. Pérdida completa: plejía. Incompleta: paresia (mono, hemi, para o cuadri según extensión) — *11b*
- Espasticidad con signo de la navaja (piramidal), rueda dentada (extrapiramidal), hipotonía o flacidez. — *11b*
- Patrón distal (no abrocha botones) o proximal (no se levanta de la silla ni sube escaleras) — *11b*
- Motoneurona superior: hiperreflexia y Babinski, sin atrofia. Inferior: flacidez, atrofia e hiporreflexia. — *11b*

*Valores normales*

- Explorar por grupos musculares, contra resistencia y gravedad, comparando ambos lados y los grupos proximales y distales. — *11b*
- La fuerza se gradúa en una escala de 0 a 5. — *11b*

*Cómo interpretar*

- 0 sin contracción, 1 contracción sin movimiento, 2 movimiento sin gravedad, 3 vence la gravedad, 4 vence resistencia parcial, 5 normal. — *fuera de notas*
- Paresia: disminución de la fuerza. Plejía: pérdida completa. Mono, hemi, para o cuadri solo indican la extensión. — *11b*
- Motoneurona superior: hiperreflexia, Babinski, espasticidad (signo de la navaja), sin atrofia. — *11b*
- Motoneurona inferior: flacidez, hipotonía, atrofia (evidente tras la tercera semana), hiporreflexia y fasciculaciones. — *11b*
- Debilidad fatigable con compromiso de pares craneales: unión neuromuscular (miastenia gravis) — *11b*
- Debilidad proximal con reflejos y sensibilidad conservados, sin atrofia: enfermedad muscular. — *11b*
- Rigidez en rueda dentada con la fuerza conservada: síndrome extrapiramidal (Parkinson) — *11e*

*No olvidar*

- Dificultad para levantarse de una silla o subir escaleras: debilidad proximal. Dificultad para abotonarse: debilidad distal. — *11b*

**Lista `fuerza`** · Fuerza muscular (MRC) · tipo escala · usada en `efr.columna`, `efr.msd`, `efr.msi`, `efr.mid`, `efr.mii`, `efr.fuerza`, `efr.neurologico`

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| 0/5 | Sin contracción | Fuerza muscular 0/5 |
| 1/5 | Contracción visible sin movimiento | Fuerza muscular 1/5 |
| 2/5 | Movimiento sin vencer gravedad | Fuerza muscular 2/5 |
| 3/5 | Vence la gravedad | Fuerza muscular 3/5 |
| 4/5 | Vence resistencia parcial | Fuerza muscular 4/5 |
| 5/5 | Fuerza normal | Fuerza muscular 5/5 |

Las notas dicen que la fuerza se gradúa de 0 a 5 (11b), pero no describen cada grado: las descripciones de la columna «Descripción» están fuera de notas (la guía lo reconoce). La tabla completa de interpretación está en «Reflejos y fuerza».

## Reflejos osteotendinosos

| Dato | Detalle |
|---|---|
| Identificador | `efr.rot` |
| Tipo · Obligatorio | Escala · No |
| Lista | Reflejos osteotendinosos (`rot`) |
| Valor normal | Reflejos osteotendinosos 2+/4+ simétricos (código `2+`) |
| Escalas que admite | Reflejos osteotendinosos (`rot`) |
| Reglas de redacción | — |

**Guía**

*Qué usar*

- Martillo de reflejos. — *03b*

*Posición*

- Paciente cómodo, sentado y relajado. Extremidad en posición intermedia entre flexión y extensión. — *11b*

*Cómo explorar*

- Golpe suave y rápido directo sobre el tendón, comparando siempre con el lado homólogo. — *11b*
- Bicipital: antebrazo semiflexionado, presionar el tendón en la fosa antecubital y percutir. Respuesta: flexión del antebrazo. — *11b*
- Rotuliano (L2-L4): pierna flexionada y relajada, percutir el tendón rotuliano. Respuesta: extensión de la pierna. — *11b*
- Aquiliano (L5-S1-S2): sentado, de rodillas o acostado, percutir el tendón de Aquiles. Respuesta: extensión del pie. — *11b*
- Si no aparece: maniobra de Jendrassik (enganchar los dedos de ambas manos y tirar) mientras se percute. — *11b*

*Qué buscar*

- Escala de 0 a 4 cruces. Clonus, Babinski (dorsiflexión del dedo gordo) y Hoffman indican lesión piramidal. — *11b*

*Valores normales*

- Paciente relajado, extremidad en posición intermedia, golpe suave y rápido sobre el tendón, comparando con el lado homólogo. — *11b*
- Escala de 2020: de 0 a 4 cruces. Entre el 3 y el 10 % de las personas sanas carece de uno o más reflejos sin ser patológico. — *11b*
- Escala de 2018: 0 ausente, 1 muy débil, 2 ligeramente débil, 3 normal, 4 exaltado, 5 exaltado con posible clonus. — *11b*
- Bicipital: flexión del antebrazo. Rotuliano (L2 a L4): extensión de la pierna. Aquiliano (L5, S1 y S2): extensión del pie. — *11b*

*Cómo interpretar*

- Escala habitual: 0 ausente, 1 cruz disminuido, 2 cruces normal, 3 cruces aumentado, 4 cruces con clonus. — *fuera de notas*
- Hiperreflexia, clonus, Babinski y Hoffman: lesión de la vía piramidal (motoneurona superior) — *11b*
- Hiporreflexia o arreflexia con flacidez: motoneurona inferior (por ejemplo, Guillain-Barré) — *11b*
- Reflejo aumentado: menor umbral, mayor velocidad o rango, propagación a zonas vecinas o contracciones repetidas. — *11b*

*No olvidar*

- Si el reflejo no aparece, usar la maniobra de Jendrassik (enganchar los dedos y tirar) antes de declararlo ausente. — *11b*
- Babinski (dorsiflexión del dedo gordo al estimular la planta del pie): hallazgo patológico, indica lesión de la vía piramidal. — *11b*

**Lista `rot`** · Reflejos osteotendinosos · tipo escala · usada en `efr.msd`, `efr.msi`, `efr.mid`, `efr.mii`, `efr.rot`, `efr.neurologico`

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| 0 | Abolido | Reflejos osteotendinosos 0/4+ |
| 1+ | Hipoactivo | Reflejos osteotendinosos 1+/4+ |
| 2+ | Normal | Reflejos osteotendinosos 2+/4+ simétricos |
| 3+ | Vivo, sin clonus | Reflejos osteotendinosos 3+/4+ |
| 4+ | Exaltado con clonus | Reflejos osteotendinosos 4+/4+ |

Solo el nivel 2+ agrega «simétricos» al texto. Las notas de 2020 gradúan de 0 a 4 cruces sin describir cada nivel; las etiquetas de la app (abolido, hipoactivo, normal, vivo sin clonus, exaltado con clonus) corresponden a la escala habitual, fuera de notas. Ver la comparación en «Reflejos y fuerza».

## Neurológico

| Dato | Detalle |
|---|---|
| Identificador | `efr.neurologico` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | Frases · neurológico (`f_neuro`) |
| Valor normal | Despierto, lúcido, orientado en tiempo, espacio y persona. Lenguaje conservado. Pares craneales del I al XII sin alteraciones. Fuerza 5/5 en las cuatro extremidades, tono y trofismo conservados. Sensibilidad conservada y simétrica. reflejos osteotendinosos 2+/4+ simétricos. Babinski ausente bilateral. Signos meníngeos negativos. |
| Escalas que admite | Estado de conciencia (`conciencia`), Fuerza muscular (MRC) (`fuerza`), Reflejos osteotendinosos (`rot`) |
| Reglas de redacción | Describir sin interpretar |

**Guía**

*Qué usar*

- Algodón, objeto puntiforme romo, tubos con agua fría y caliente, y diapasón de 128 Hz para la vibración. — *11c*

*Cómo explorar*

- Pares craneales siempre del I al XII, en forma bilateral y comparativa. — *11d*
- Sensibilidad con ojos cerrados, simétrica y comparativa: dolor, temperatura y tacto. Posición: mover el 1.er dedo del pie. — *11c*
- Romberg: de pie, pies juntos, sin apoyo, y cerrar los ojos. Positivo si pierde el equilibrio. — *11c*
- Cerebelo: índice-nariz (dismetría), alternar palma y dorso, talón-rodilla, marcha en tándem y rebote de Holmes. — *11c*
- Brudzinski: decúbito dorsal a 0°, mano bajo el occipital y flexionar la cabeza. Positivo si flexiona rodillas y caderas. — *11e*
- Kernig: decúbito dorsal, cadera y rodilla flexionadas, extender la rodilla. Positivo si hay dolor, resistencia y flexión cefálica. — *11e*

*Qué buscar*

- Rigidez de nuca: resistencia dolorosa al flexionar la cabeza sobre el tronco (meningitis). No confundir con tortícolis. — *06c*

**Lista `f_neuro`** · Frases · neurológico · tipo frase · usada en `efr.neurologico`

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `n` | Despierto, lúcido, orientado en tiempo, espacio y persona. Lenguaje conservado. Pares craneales del I al XII sin alteraciones. Fuerza 5/5 en las cuatro extremidades, tono y trofismo conservados. Sensibilidad conservada y simétrica. reflejos osteotendinosos 2+/4+ simétricos. Babinski ausente bilateral. Signos meníngeos negativos. | Valor normal por defecto del campo. | 05a; 11b; 11c; 11d; 11e |
| `a1` | Somnoliento, responde al estímulo verbal. | Letargo o somnolencia: se duerme con facilidad, despierta y obedece al estimularlo y vuelve a dormirse si el estímulo cesa. | 05a |
| `a2` | Estuporoso, responde solo al estímulo doloroso. | Estupor: actividad mínima; despierta solo con estímulos intensos y repetidos y responde en forma inadecuada al dolor. Paso previo al coma. | 05a; 11a |
| `a3` | Desorientado en {orientacion}. | Pérdida de la orientación: estado confusional agudo (delirio), que fluctúa en el día, o encefalopatía como la hepática; revisar atención. | 11a; 09e |
| `a4` | Disartria. | Trastorno de la articulación del habla: lesión piramidal (parálisis pseudobulbar), cerebelosa, de nervios craneales o de los músculos. | 05a; 12a; 11c |
| `a5` | Hemiparesia {lado_f} a predominio {predominio}. | Debilidad de medio cuerpo por lesión de la vía piramidal del lado opuesto (motoneurona superior), como en el accidente cerebrovascular. | 11b; 11e |
| `a6` | Hipotonía en {region_neuro}. | Tono disminuido: lesión de motoneurona inferior (con atrofia e hiporreflexia), síndrome cerebeloso o fase aguda de una lesión piramidal. | 11b; 11e |
| `a7` | Espasticidad en {region_neuro} (signo de la navaja). | Hipertonía piramidal: la resistencia cede de golpe al extender el miembro. Indica lesión de motoneurona superior. | 11b; 11e |
| `a8` | Rigidez en rueda dentada. | Hipertonía extrapiramidal a saltos, igual en todas las direcciones y con fuerza conservada: síndrome parkinsoniano. | 11b; 11e |
| `a9` | Reflejos osteotendinosos exaltados, con clonus {lado}. | Hiperreflexia con contracciones rítmicas repetidas al estirar el tendón: lesión de la vía piramidal (motoneurona superior). | 11b |
| `a10` | Reflejos osteotendinosos abolidos en {region_neuro}. | Arreflexia: lesión de motoneurona inferior o del arco reflejo (por ejemplo, Guillain-Barré). Confirmar antes con la maniobra de Jendrassik. | 11b |
| `a11` | Signo de Babinski positivo en el lado {lado}. | Dorsiflexión del dedo gordo al estimular la planta del pie: lesión de la vía piramidal (motoneurona superior). | 11b; 11e |
| `a12` | Rigidez de nuca con signos de Kernig y Brudzinski positivos. | Síndrome meníngeo por inflamación o irritación de las meninges: meningitis o sangre en el espacio subaracnoideo. | 11e; 06c |
| `a13` | Parálisis facial {lado_f} que {frente} la frente. | Si respeta la frente es central (lesión supranuclear del lado opuesto); si la compromete es periférica, como la parálisis de Bell. | 11d |
| `a14` | Signo de Romberg positivo. | Pérdida del equilibrio al cerrar los ojos: falla propioceptiva por lesión de cordones posteriores (tabes); también en lesiones vestibulares. | 11c; 11d; 11e |
| `a15` | Dismetría en la prueba índice-nariz. | El movimiento se detiene antes de la meta o la sobrepasa: síndrome cerebeloso (neocerebelo). | 11c |
| `a16` | Marcha {marcha}. | Atáxica: cerebelo o cordones posteriores. Parkinsoniana: extrapiramidal. En guadaña: hemiplejía. En tijera: lesión piramidal. | 05b; 11a |
| `a17` | Temblor {temblor}. | De reposo: parkinsonismo. De actitud: metabólico (precoma hepático). De acción: cerebeloso, hipertiroidismo o alcoholismo. | 05b; 11e |
| `a18` | Asterixis. | Aleteo de las manos en extensión forzada: encefalopatía metabólica (encefalopatía hepática, coma urémico). | 05b; 09e |

Marcadores: `{orientacion}` (tiempo, espacio, persona, tiempo y espacio), `{lado}`, `{lado_f}`, `{predominio}` (braquial, crural), `{region_neuro}` (cada miembro o las cuatro extremidades), `{frente}` (respeta, compromete), `{marcha}` (atáxica con base amplia, parkinsoniana a pasos cortos, hemipléjica en guadaña, espástica en tijera) y `{temblor}` (de reposo, de actitud, de acción). La escala `conciencia` se documenta en el área 03.

**Maniobras neurológicas de las notas**

| Maniobra | Cómo se busca | Positivo / qué indica | Fuente |
|---|---|---|---|
| Rigidez de nuca | Flexionar la cabeza sobre el tronco | Resistencia dolorosa: meningitis (no confundir con tortícolis) | 06c; 11e |
| Brudzinski | Decúbito dorsal a 0°, mano bajo el occipital, flexionar la cabeza | Flexión refleja de rodillas y caderas: irritación meníngea | 11e |
| Kernig | Cadera flexionada en ángulo recto y rodilla flexionada; extender la rodilla | Dolor y resistencia, flexión de la cabeza: irritación meníngea | 11e |
| Lasègue | Elevar la pierna extendida | Dolor antes de 90°: síndrome radicular o meníngeo | 11e |
| Flatau | Durante el Brudzinski | Midriasis: signo meníngeo accesorio | 11e |
| Romberg | De pie, pies juntos, sin apoyo, cerrar los ojos | Pierde el equilibrio: cordones posteriores; también vestibular | 11c; 11d |
| Índice-nariz | Tocar alternadamente la nariz y el dedo del examinador | Se detiene antes o se pasa (dismetría): cerebelo | 11c |
| Tono de Babinski | Sentado, miembros inferiores extendidos, palmas arriba | No sostiene la postura: hipotonía | 11b |
| Signo de Babinski | Estimular la planta del pie | Dorsiflexión del dedo gordo: vía piramidal | 11b |
| Hoffman | Liberar de golpe la falange distal flexionada del dedo medio | Flexión del pulgar y del índice: vía piramidal | 11b |
| Asterixis | Manos en extensión forzada (posición de juramento) | Aleteo: encefalopatía hepática o urémica | 05b |
| Parálisis facial | Arrugar la frente, cerrar los ojos, inflar las mejillas | Respeta la frente: central; la compromete: periférica | 11d |

## Signos semiológicos del abdomen

| Signo | Cómo se busca | Qué indica | Fuente |
|---|---|---|---|
| Murphy | Pulgar en el punto cístico bajo el reborde costal derecho; pedir inspiración profunda | El dolor corta la inspiración: colecistitis aguda | 09b; 09d |
| Blumberg (rebote) | Comprimir lento y sostenido; soltar de golpe | Dolor que aparece o aumenta al soltar: irritación peritoneal | 09b; 09f |
| Punto de McBurney | Unión del tercio externo con los dos tercios internos de la línea espina ilíaca anterosuperior-ombligo | Dolor: apendicitis aguda | 09b; 09f |
| Puntos epigástrico, cístico y ureterales | Compresión suave en la línea xifoumbilical, en el ángulo del reborde costal con el recto derecho y en el borde externo de los rectos | Úlcera péptica activa; colecistitis aguda; cólico renal | 09b |
| Rovsing | Comprimir la fosa ilíaca izquierda | Dolor en la fosa ilíaca derecha: apendicitis (si falta, no la descarta) | 09f |
| Psoas | Decúbito lateral izquierdo; extensión pasiva del muslo derecho | Dolor en la fosa ilíaca derecha: apendicitis retrocecal | 09f |
| Obturador | Decúbito dorsal; flexionar pierna y muslo y rotar el muslo hacia adentro | Dolor en el hipogastrio: apéndice pélvico o retrocecal | 09f |
| Chutro | Inspección del ombligo | Ombligo desviado a la derecha: apendicitis aguda | 09f |
| Defensa y abdomen en tabla | Palpación superficial | Localizada: peritonitis localizada. Generalizada: perforación de víscera hueca. La contractura por temor cede al tranquilizar | 09b; 09f |
| Cullen | Inspección periumbilical | Equimosis: pancreatitis aguda hemorrágica (tardío) o embarazo ectópico roto | 09b; 09d |
| Grey Turner | Inspección de los flancos | Equimosis por sangre retroperitoneal: pancreatitis aguda hemorrágica | 09b; 09d |
| Courvoisier-Terrier | Palpación bajo el reborde costal derecho en inspiración | Vesícula distendida, indolora, en pera, en paciente ictérico: obstrucción biliar neoplásica | 09b; 09d |
| Oleada ascítica | Borde cubital de una mano en la línea media, palma en un flanco y golpes suaves en el flanco opuesto | Se percibe la onda: ascitis de gran volumen (más de 1500 mililitros) | 09b; 09e |
| Matidez desplazable | Percutir en decúbito dorsal y luego en decúbito lateral | La matidez pasa al lado declive: ascitis de mediano volumen (500 a 1500 mililitros) o hemoperitoneo | 09b; 09e; 09g |
| Jobert | Percusión del área hepática | Timpanismo donde debería haber matidez: neumoperitoneo por perforación (falsos positivos: enfisema, colon interpuesto) | 09b; 09f |
| Tablero de ajedrez | Percusión suave del abdomen | Matidez alternada con timpanismo: tuberculosis peritoneal crónica | 09b; 09e |
| Giordano | Mano izquierda abierta en la región lumbar y golpe con el puño derecho, en ambos lados | Dolor: pielonefritis aguda o absceso perinefrítico | 10b |
| Lafont | Se recoge al interrogar: dolor referido al hombro o a la región interescapular | Irritación del nervio frénico por sangre libre: embarazo ectópico roto | 09g |
| Lienzo húmedo | Tomar un pliegue de la pared entre pulgar e índice | El pliegue queda arrugado: deshidratación en el niño | 09b |
| Maniobra de Schuster | Decúbito lateral derecho, pierna izquierda flexionada a 90°, palpación bimanual bajo el reborde izquierdo | Permite palpar el polo inferior del bazo cuando la técnica en decúbito dorsal no es concluyente | 09b |

## Reflejos y fuerza

**Reflejos osteotendinosos**

Técnica común (11b): paciente cómodo, sentado y relajado; extremidad en posición intermedia entre flexión y extensión; golpe suave y rápido directo sobre el tendón con el martillo de reflejos; comparar siempre con el lado homólogo. Si no aparece, maniobra de Jendrassik (enganchar los dedos de ambas manos y tirar) antes de declararlo ausente. Entre el 3 y el 10 % de las personas sanas carece de uno o más reflejos sin que sea patológico.

| Reflejo | Raíz | Cómo se busca | Respuesta normal | Fuente |
|---|---|---|---|---|
| Bicipital | No especificada en las notas (habitualmente C5 y C6, fuera de notas) | Antebrazo semiflexionado y en semisupinación; presionar el tendón del bíceps en la fosa antecubital y percutir | Flexión del antebrazo sobre el brazo | 11b |
| Tricipital | C7, con aporte de C6 y C8 (fuera de notas) | Brazo sostenido con el codo en flexión; percutir el tendón del tríceps sobre el olécranon | Extensión del antebrazo | fuera de notas |
| Estilorradial | C5 y C6 (fuera de notas) | Antebrazo semiflexionado; percutir la apófisis estiloides del radio | Flexión del antebrazo | fuera de notas |
| Rotuliano | L2 a L4 (nervio femoral) | Pierna flexionada y relajada; percutir el tendón rotuliano | Extensión de la pierna por el cuádriceps | 11b |
| Aquiliano | L5, S1 y S2 | Sentado con el pie colgando, de rodillas sobre la camilla o acostado; percutir el tendón de Aquiles | Extensión del pie | 11b |

Reflejos patológicos y superficiales (11b): **Babinski** (dorsiflexión del dedo gordo al estimular la planta) y **Hoffman** (flexión del pulgar y del índice al liberar la falange distal del dedo medio) indican lesión de la vía piramidal; el **clonus** (contracción y relajación alternadas y rápidas al estirar bruscamente el tendón, típico aquiliano y rotuliano) también. La ausencia del reflejo **cutáneo abdominal** orienta a motoneurona superior; el **cremasteriano** normal eleva el testículo del mismo lado.

**Escalas de reflejos: app y notas**

| Nivel en la app | Etiqueta de la app | Notas 2020 (11b) | Notas 2018 (11b) |
|---|---|---|---|
| 0 | Abolido | 0 cruces | 0 ausente |
| 1+ | Hipoactivo | 1 cruz (sin descripción) | 1 muy débil |
| 2+ | Normal | 2 cruces (sin descripción) | 2 ligeramente débil |
| 3+ | Vivo, sin clonus | 3 cruces (sin descripción) | 3 normal |
| 4+ | Exaltado con clonus | 4 cruces (sin descripción) | 4 exaltado; 5 exaltado con posible clonus |

La app usa la escala habitual (fuera de notas), que coincide con el número de cruces de 2020. La escala de 2018 tiene otro punto de referencia (3 es normal) y no debe mezclarse con la de la app.

**Fuerza muscular**

Técnica (11b): explorar por grupos musculares, contra resistencia y contra la gravedad, comparando ambos lados y los grupos proximales con los distales. Patrón distal: no puede abotonarse; proximal: no se levanta de la silla ni sube escaleras.

| Grado | Descripción en la app | Fuente de la descripción |
|---|---|---|
| 0/5 | Sin contracción | fuera de notas |
| 1/5 | Contracción visible sin movimiento | fuera de notas |
| 2/5 | Movimiento sin vencer gravedad | fuera de notas |
| 3/5 | Vence la gravedad | fuera de notas |
| 4/5 | Vence resistencia parcial | fuera de notas |
| 5/5 | Fuerza normal | 11b (escala de 0 a 5) |

Nomenclatura (11b): **paresia** es la disminución de la fuerza y **plejía** su pérdida completa; mono (una extremidad), hemi (medio cuerpo; braquiocrural si toma la hemicara), para (ambos miembros inferiores) y cuadri (las cuatro extremidades) solo indican la extensión.

| Nivel lesionado | Tono y trofismo | Reflejos | Otros datos | Fuente |
|---|---|---|---|---|
| Motoneurona superior | Espasticidad (signo de la navaja), sin atrofia; flacidez inicial en lesiones agudas | Hiperreflexia, clonus, Babinski y Hoffman; abdominales ausentes | Falla del movimiento fino | 11b; 11e |
| Motoneurona inferior | Flacidez, hipotonía, atrofia evidente tras la tercera semana, fasciculaciones | Hiporreflexia o arreflexia | Ejemplo: Guillain-Barré | 11b |
| Unión neuromuscular | No especificado en las notas | No especificados en las notas | Predominio proximal, pares craneales, fatigabilidad (miastenia) | 11b |
| Músculo | Sin atrofia | Conservados | Predominio proximal, sensibilidad normal | 11b |
| Extrapiramidal | Rigidez en rueda dentada | Pérdida de reflejos posturales | Fuerza conservada, temblor de reposo | 11e |
| Cerebeloso | Hipotonía | No especificados | Fuerza conservada, dismetría, marcha atáxica | 11e |

## Discrepancias y pendientes

> **Corregido en la app el 16/09/2026** tras esta revisión: la frase `a9` ahora es «Signo {signo_abd} positivo.» con las opciones «de Rovsing», «del psoas» y «del obturador» (ya no sale «Signo de del psoas positivo»). Los demás puntos siguen pendientes.

1. **Orden del abdomen.** Los campos de la app van inspección, auscultación, percusión y palpación (orden 150 a 180). Las notas 09b y 03, y la propia guía de inspección, ponen la palpación antes de la percusión. Decidir si se reordenan los campos o si se agrega un aviso.
2. **Frases abiertas sin marcador.** `f_abd_p` `a2` («Doloroso a la palpación en»), `f_columna` `a1` («… en región») y `f_ext` `a1` («Edema con fóvea hasta») terminan sin marcador (en la semilla terminan en un espacio). Faltan `{region_abd}` y una lista de regiones de la columna (cervical, dorsal, lumbar, sacra). Además `f_ext` `a1` se superpone con el formato de `godet` («Edema … hasta {nivel}, {lateralidad}, con fóvea»): si se usan juntos, el texto repite «edema» y «con fóvea».
3. **Marcador `{signo_abd}`.** Con las opciones «del psoas» y «del obturador», la frase `a9` produce «Signo de del psoas positivo». Propuesta: opciones «de Rovsing», «del psoas», «del obturador» y frase «Signo {signo_abd} positivo».
4. **«Bilateral» en `{lado}` y `{lado_f}`.** Genera frases incoherentes: «Hemiparesia bilateral», «Escoliosis de convexidad bilateral», «Signo de Babinski positivo en el lado bilateral», «Riñón bilateral palpable», «Punto ureteral bilateral doloroso», «Soplo sistólico en flanco bilateral», «… en miembro inferior bilateral» (Lasègue), «Parálisis facial bilateral que …». Conviene una lista sin «bilateral» para esas frases.
5. **Lista `f_ext` compartida por los cuatro miembros.** Varias frases solo sirven para miembros inferiores (Homans, pérdida de vello, «pulso femoral, poplíteo, tibial posterior, pedio») o para ambos a la vez («dorso de pies y manos»), y `{region_mi}` ofrece «el antebrazo» (que permite «Várices en el antebrazo»). Los marcadores se llaman `pulso_mi` y `region_mi` aunque incluyen el miembro superior; faltan los pulsos braquial y cubital. El valor normal dice «Simétrico» para un solo miembro.
6. **Hepatomegalia en dos frases y dos unidades.** `a1` mide en centímetros y fija «borde romo y superficie lisa»; `a11` mide en traveses de dedo, que es la clasificación de 09b. No hay opción para borde duro, cortante o nodular (cirrosis, cáncer; 09b, 09d).
7. **Frase normal de palpación.** Incluye «Puño-percusión lumbar negativa bilateral», que es maniobra del campo genitourinario (Giordano, 10b); el valor normal del campo genitourinario no la menciona. La frase normal genitourinaria dice «puntos renoureterales», término que no está en las notas (09b habla de puntos ureterales).
8. **Escala `godet`.** Los milímetros (2, 4, 6 y 8) y los tiempos de recuperación (inmediato, 15 y 30 segundos, más de 1 minuto) están fuera de notas; 05g solo gradúa de 1 cruz (leve) a 4 cruces (anasarca) por la profundidad de la fóvea. Las etiquetas usan símbolos («≈», «~») y «recupera inmediato» (falta «de»).
9. **Escalas `fuerza` y `rot`.** Las descripciones de cada grado están fuera de notas. El nombre «Fuerza muscular (MRC)» lleva una sigla. La guía de reflejos (tipo «Valores normales») muestra la escala de 2018, donde 3 es normal, junto a la de la app, donde 2+ es normal; además «Escala de 2020» y «Escala de 2018» se leen como nombres de escalas y no como versiones de los apuntes. La nota no da la raíz del bicipital, y el tricipital y el estilorradial no figuran en notas ni en guías.
10. **Porcentaje de trombosis venosa profunda.** La guía dice «Edema unilateral de miembro inferior: en 80 a 90 % se debe a trombosis venosa profunda» (tomado de una tarjeta de 05g), pero 08i usa esas cifras para otra cosa: el edema aparece en el 90 % (2020) u 80 % (2018) de las trombosis venosas profundas. Revisar el enunciado.
11. **Guías con tipo o ámbito dudoso.** La técnica de la oleada ascítica está en el ámbito de percusión, pero 09b la ubica en la palpación superficial (y la frase `a10` está en palpación). Varias filas de tipo «Valores normales» son técnica repetida (edema, fuerza y reflejos), y hay textos casi duplicados en edema, fuerza y reflejos. Los ámbitos `efr.abdomen`, `efr.extremidades` y `efr.edema` no tienen título legible (`ambito_titulo` repite el identificador).
12. **Guías que faltan.** Genitourinario, columna, extremidades y neurológico no tienen «Valores normales» ni «Cómo interpretar». Extremidades no guía la palpación de pulsos, Homans, várices ni llenado capilar, aunque tienen frase. Neurológico no guía parálisis facial, temblor, disartria ni orientación. La guía de genitourinario describe el tacto rectal, pero no hay frases para sus hallazgos.
13. **Redacción de las guías.** La guía de columna dice «dolor lumbar» (preferencia del usuario: «lumbalgia»). Usan ordinales abreviados («5.º espacio», «1.er dedo») y nomenclatura vertebral abreviada («C7», «L1», «T8-L3»). La guía de la oleada ascítica usa el diminutivo «golpecitos».
14. **Frase normal neurológica.** «reflejos osteotendinosos 2+/4+» empieza con minúscula tras un punto. Además repite fuerza y reflejos, que tienen campos y escalas propios (`efr.fuerza`, `efr.rot`): riesgo de informar lo mismo dos veces.
15. **Contradicciones entre notas.** 05i atribuye la espasticidad de la hemiplejía a la vía extrapiramidal; 11b y 11e la atribuyen a la piramidal. El estupor: 05a (despierta con estímulos intensos y responde mal al dolor) frente a 11a (no capta ni estímulos dolorosos); la frase `f_neuro` `a2` («responde solo al estímulo doloroso») mezcla ambas. La lordosis: 05a dice «convexidad hacia atrás» y 07b «convexidad anterior».
16. **Contenido fuera de notas.** Contenido de los cuatro cuadrantes, raíces del bicipital, tricipital y estilorradial, significado de `f_columna` `a1`, llenado capilar (`f_ext` `a11`, con respaldo en `FISIOLOGIA 2026/concepts/Perfusión-Tisular.md` y `FISIOPATOLOGIA 2026/entities/enfermedades/Hipovolemia.md`) y `f_gu` `a1`, que no es un hallazgo. El predominio braquial o crural de la hemiparesia (`{predominio}`) no se explica en las notas (11b solo define «braquiocrural»).
17. **Opciones que las notas sugieren y faltan.** Dirección del flujo de la circulación colateral (05i); marchas tabética, del pato y polineurítica (05b, 11a); signos de Olow y Trendelenburg (08i); roséolas tíficas (09b).
