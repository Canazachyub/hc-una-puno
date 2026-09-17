# 02 · Enfermedad actual, síntomas y semiología del dolor

> Documento de consulta del mapeo de HC App. Fuentes: seed/esquema.csv, seed/opciones.csv, seed/guias.csv y las notas de Semiología. Las definiciones y la guía son para estudiar y llenar la historia; no se imprimen en el Word.

## Resumen

- **Sección:** 2.2 Enfermedad actual (`enfermedad_actual`), con 7 campos, todos obligatorios.
- **Listas propias del área:** 11. Seis de ellas no están enlazadas a un campo del esquema: las usa el botón **Describir síntoma** del relato cronológico (`web/src/components/ConstructorSintoma.tsx`).
- **Listas de otras áreas:** las escalas que admite el relato: Dolor · escala visual análoga (`eva`, área 03), Disnea de esfuerzo (NYHA) (`nyha`, área 07), Disnea crónica (mMRC) (`mmrc`, área 07), Consistencia de heces (Bristol) (`bristol`, área 01), Capacidad funcional (ECOG) (`ecog`, área 07).
- **Guía:** 157 entradas; 37 para la sección y sus campos, y 120 repartidas en 15 guías por síntoma guía.
- **Umbrales:** ninguno en esta área.
- **Definiciones nuevas:** 128 filas en `datos/definiciones-02.csv` (localizaciones, agravantes, atenuantes, presentación, forma de inicio, curso, respuesta al tratamiento y frases del relato).

| Lista | Nombre | Opciones | Con definición en el paquete | Dónde se usa |
|---|---|---|---|---|
| `unidad_tiempo` | Unidad de tiempo | 5 | 0 | Unidad (`ea.tiempo_unidad`) y botón Describir síntoma |
| `forma_inicio` | Forma de inicio | 3 | 0 | Forma de inicio (`ea.forma_inicio`) y botón Describir síntoma |
| `curso` | Curso | 7 | 0 | Curso (`ea.curso`) |
| `sintoma` | Síntomas (teoría) | 74 | 74 | Síntoma guía (`ea.sintoma_guia`) y botón Describir síntoma |
| `localizacion` | Localización e irradiación | 56 | 2 | Botón Describir síntoma |
| `dolor_caracter` | Carácter del dolor | 18 | 18 | Botón Describir síntoma |
| `patron_sintoma` | Presentación del síntoma | 17 | 8 | Botón Describir síntoma |
| `agravante` | Se exacerba con | 27 | 0 | Botón Describir síntoma |
| `atenuante` | Cede con | 15 | 0 | Botón Describir síntoma |
| `respuesta_tto` | Respuesta al tratamiento | 5 | 0 | Botón Describir síntoma |
| `f_relato` | Frases · relato | 8 | 8 (texto de la frase) | Relato cronológico (`ea.relato_cronologico`) |

## Cómo se redacta la enfermedad actual

La enfermedad actual se escribe con términos médicos (edema y no «hinchazón», disnea y no «falta de aire»), en tercera persona y en orden cronológico, con el síntoma guía como hilo conductor. Responde tres preguntas: cómo inició, cómo ha evolucionado y cómo se encuentra actualmente (02a). El orden del relato es este:

1. **Tiempo de enfermedad.** Desde cuándo tiene la molestia. Se escribe en tiempo relativo («hace 5 días»), no como fecha. Si el paciente no recuerda con precisión, se le ayuda a fijar una fecha aproximada y solo entonces se escribe «hace aproximadamente 5 días» (02a). Corte orientativo: 10 días o menos sugiere cuadro agudo y más de 60 días, crónico (02a, apuntes 2018).
2. **Forma de inicio.** Súbito, brusco o insidioso, y a qué atribuye el paciente el comienzo (02a).
3. **Curso.** Cómo ha evolucionado: si es un episodio único o son ataques recurrentes, y con qué periodicidad (02a).
4. **Síntoma guía.** El síntoma o signo de mayor precisión o duración, o el relato principal del paciente. Se fija cuándo empezó, cómo evolucionó y cómo está hoy, y las demás quejas se relacionan con él en orden cronológico (02a, R1).
5. **Semiología del dolor** (o de cualquier síntoma que lo amerite), en este orden: localización, irradiación, carácter, intensidad (escala nominal leve, moderado, severo o escala visual análoga de 0 a 10), duración, frecuencia o presentación, agravantes, atenuantes y síntomas acompañantes (02a, 03b, 08a).
6. **Tratamiento recibido y respuesta.** Si se automedicó, si acudió a un médico o fue hospitalizado, qué exámenes le hicieron, qué fármaco, a qué dosis, y si mejoró o aparecieron síntomas nuevos. Es la parte más extensa del relato (02a).
7. **Estado actual.** Qué síntomas tiene hoy y cómo están, sin resumir con «está mejor» o «está peor» (02a).
8. **Antecedente remoto de la enfermedad actual.** Si tuvo antes un cuadro similar; si no, se escribe «No refiere cuadro similar previo», nunca en blanco (02a).

### Cómo lo arma la app

El botón **Describir síntoma** (`shared/sintoma.ts`) junta las opciones tocadas en una sola oración, siempre en este orden: frase de apertura y tiempo, forma de inicio, síntoma, localización («a nivel de»), carácter, intensidad, presentación, irradiación, agravantes y atenuantes; luego, en oraciones aparte, los síntomas acompañantes y el tratamiento con su respuesta. Ejemplo:

> Paciente refiere que hace 5 días, de inicio insidioso, presenta lumbalgia a nivel de la región lumbar, de carácter opresivo, de intensidad 6/10 en la escala visual análoga, de curso continuo, que se irradia a la región dorsal, que se exacerba con la flexión del tronco y cede con el reposo. Se acompaña de parestesias. Se automedica con paracetamol 500 mg por vía oral cada 8 horas, con mejoría parcial.

| Trozo de la frase | De dónde sale |
|---|---|
| Paciente refiere que hace 5 días | Frase `a1` + Tiempo de enfermedad + Unidad |
| de inicio insidioso | Lista `forma_inicio` |
| presenta lumbalgia | Lista `sintoma` (síntoma guía) |
| a nivel de la región lumbar | Lista `localizacion` |
| de carácter opresivo | Lista `dolor_caracter` |
| de intensidad 6/10 en la escala visual análoga | Botones 0 a 10 (escala visual análoga) |
| de curso continuo | Lista `patron_sintoma` |
| que se irradia a la región dorsal | Lista `localizacion` (varias) |
| que se exacerba con la flexión del tronco | Lista `agravante` (varias) |
| y cede con el reposo | Lista `atenuante` (varias) |
| Se acompaña de parestesias. | Lista `sintoma` (varias) |
| Se automedica con paracetamol… | Texto libre del tratamiento (frase `a3`) |
| con mejoría parcial | Lista `respuesta_tto` |

Un síntoma que no es el primero se abre con «Posteriormente se agrega…» (frase `a2`) o «Hace 2 días se agrega…». El relato se cierra con las frases `a6` (estado actual) y `a7` u `a8` (cuadro similar previo). Los bloques de localización, carácter, intensidad, irradiación, agravantes y atenuantes solo aparecen cuando el síntoma elegido es un dolor (ver [Semiología del dolor](#semiología-del-dolor)).

## Campos de la sección

### Guía general de la sección (`enfermedad_actual`)

**Cómo preguntar**

- ¿Qué le trae a la consulta? ¿Qué molestias tiene? (02a)
- ¿Alguna vez le había pasado algo parecido? (02a)

**Cómo conducirlo**

- Deje que el paciente cuente su enfermedad sin interrumpirlo. Cuando se detenga, anímelo con: ¿y qué más? (02a)
- Anote el motivo de consulta con las palabras del paciente (me falta el aire), máximo tres síntomas y en orden. (02a)
- Después haga preguntas dirigidas, concretas y simples, adaptadas al nivel cultural del paciente. (02a)
- Si el paciente no puede relatar (coma, niño, enfermo mental), obtenga la historia de un familiar o acompañante. (02a)
- Al terminar, léale la historia al paciente para que la confirme, la corrija o agregue alguna queja. (02a)

**No olvidar**

- Si no hubo un cuadro similar, anote: el paciente no refiere cuadro similar. Nunca deje el dato en blanco. (02a)

### Tiempo de enfermedad

| Dato | Detalle |
|---|---|
| Identificador | `ea.tiempo_valor` |
| Tipo · Obligatorio | Número · Sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

**Cómo preguntar**

- ¿Desde cuándo tiene esta molestia? (02a)
- ¿Antes de esa fecha estaba completamente sano o ya tenía alguna molestia? (02b)

**Cómo conducirlo**

- Si no recuerda la fecha exacta, ayúdele a fijar una fecha aproximada del inicio. (02a)
- Si el síntoma va y viene, pídale anotar cada episodio en un calendario: rara vez recuerda cuántos tuvo en el mes. (11g)

**No olvidar**

- Regla rápida (apuntes 2018): 10 días o menos sugiere cuadro agudo, más de 60 días cuadro crónico. (02a)
- Clasificación formal: agudo hasta 3 meses, subagudo de 3 meses a 1 año, subcrónico de 1 a 5 años, crónico más de 5 años. (02b)
- Cada síntoma tiene su corte: disnea aguda menos de 30 días, tos aguda menos de 3 semanas y crónica más de 8 semanas. (07a)

### Unidad

| Dato | Detalle |
|---|---|
| Identificador | `ea.tiempo_unidad` |
| Tipo · Obligatorio | Una opción · Sí |
| Lista | Unidad de tiempo (`unidad_tiempo`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

Comparte la guía de **Tiempo de enfermedad** (ámbito `ea.tiempo`). En la historia se escribe «hace 1 día» en singular y «hace 5 días» en plural; la app hace el cambio sola.

| Orden | Opción |
|---|---|
| 10 | horas |
| 20 | días |
| 30 | semanas |
| 40 | meses |
| 50 | años |

### Forma de inicio

| Dato | Detalle |
|---|---|
| Identificador | `ea.forma_inicio` |
| Tipo · Obligatorio | Una opción · Sí |
| Lista | Forma de inicio (`forma_inicio`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

El paquete no trae guía propia para este campo (ámbito `ea.forma_inicio`). Sirven las preguntas del relato: «¿Cómo empezó? ¿De golpe o poco a poco?» y «¿Desde entonces ha mejorado, empeorado o le aparecieron molestias nuevas?» (02a).

Las notas nombran las tres formas (02a: «súbito, brusco o insidioso y progresivo») pero no definen la diferencia entre súbito y brusco; las definiciones de abajo salen de los ejemplos de 08i y 11g (ver Discrepancias).

| Opción | Definición | Fuente |
|---|---|---|
| Brusco | Instalación rápida, en minutos u horas, sin ser instantánea; así se instala, por ejemplo, el síndrome isquémico agudo por embolia. | 08i |
| Súbito | Instantáneo: el paciente precisa el momento exacto en que empezó; por ejemplo, la cefalea en trueno, máxima en el primer minuto. | 11g |
| Insidioso | Gradual y poco perceptible, sin momento preciso de inicio y de intensidad leve al principio; los apuntes también lo llaman larvado. | 11g; 07a |

### Curso

| Dato | Detalle |
|---|---|
| Identificador | `ea.curso` |
| Tipo · Obligatorio | Una opción · Sí |
| Lista | Curso (`curso`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

El paquete no trae guía propia para este campo (ámbito `ea.curso`). Sirven las preguntas del relato: «¿Cómo empezó? ¿De golpe o poco a poco?» y «¿Desde entonces ha mejorado, empeorado o le aparecieron molestias nuevas?» (02a).

| Opción | Definición | Fuente |
|---|---|---|
| Progresivo | Los síntomas aumentan en intensidad o extensión con el tiempo; por ejemplo, la disnea que pasa de grandes a medianos esfuerzos. | 07a |
| Estacionario | Los síntomas se mantienen sin cambios, sin mejorar ni empeorar, desde que se instalaron. | fuera de notas |
| Intermitente | Los síntomas aparecen y desaparecen, con intervalos libres entre ellos; por ejemplo, la claudicación intermitente. | 08a |
| Recurrente | Ataques que se repiten tras periodos sin síntomas; precisar cada cuánto se repiten (periodicidad). | 02a |
| En brotes | Periodos de actividad o empeoramiento que alternan con periodos de calma o remisión. | fuera de notas |
| Progresivo con agudización | Empeoramiento gradual con episodios de empeoramiento brusco sobreañadidos; por ejemplo, las reagudizaciones de la pancreatitis crónica. | 09d |
| Regresivo | Los síntomas disminuyen poco a poco hasta ceder, con o sin tratamiento. | fuera de notas |

### Signos y síntomas principales

| Dato | Detalle |
|---|---|
| Identificador | `ea.signos_sintomas` |
| Tipo · Obligatorio | Lista de puntos · Sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | Con las palabras del paciente; Máximo tres |

**Cómo preguntar**

- ¿Qué otras molestias ha notado desde que empezó? (02a)
- ¿Ha tenido fiebre, cansancio, pérdida de peso o sudor por las noches? (02c)

**Cómo conducirlo**

- Registre todos los datos positivos y solo los negativos que tengan importancia. (02a)
- Al redactar, traduzca a términos médicos: edema y no hinchazón, disnea y no falta de aire. (02a)
- Haga la revisión por sistemas, de la cabeza a los pies, para captar síntomas que el paciente no mencionó. (02c)

**No olvidar**

- Un dato aislado de la revisión por sistemas (por ejemplo, edema de piernas) puede cambiar el diagnóstico. (02c)
- En el anciano suelen coexistir varias enfermedades: no detenga la búsqueda en la primera explicación. (02c)
- El daño renal puede dar solo cansancio, náuseas, vómitos o falta de apetito, sin molestias urinarias. (10a)

### Síntoma guía

| Dato | Detalle |
|---|---|
| Identificador | `ea.sintoma_guia` |
| Tipo · Obligatorio | Una opción u otra escrita · Sí |
| Lista | Síntomas (teoría) (`sintoma`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

**Cómo conducirlo**

- Identifique el síntoma guía: la queja de mayor duración o precisión, o el relato principal del paciente. (02a)
- Fije cuándo empezó, cómo evolucionó y cómo está hoy. Úselo como hilo conductor de toda la historia. (02a)
- Analícelo en 10 puntos: época, modo, desencadenantes, carácter, localización, irradiación, intensidad, tipo, curso, tratamiento. (02a)
- Relacione las demás quejas con el síntoma guía en orden cronológico. (02a)

**No olvidar**

- La anamnesis aporta hasta el 50% del diagnóstico cardiovascular (100% en la angina de pecho): no la acorte. (08a)
- En neurología la queja no señala el sitio de la lesión: complete el interrogatorio antes de pedir imágenes. (11a)

Las 74 opciones, con su definición y la guía que abren, están en [Síntomas](#síntomas-lista-sintoma). Si el síntoma no está en la lista, se escribe con su término médico.

### Relato cronológico

| Dato | Detalle |
|---|---|
| Identificador | `ea.relato_cronologico` |
| Tipo · Obligatorio | Párrafo redactado · Sí |
| Lista | Frases · relato (`f_relato`) |
| Valor normal | — |
| Escalas que admite | Dolor · escala visual análoga, Disnea de esfuerzo (NYHA), Disnea crónica (mMRC), Consistencia de heces (Bristol), Capacidad funcional (ECOG) |
| Reglas de redacción | En tercera persona; Con términos médicos; En orden cronológico; Hilado desde el síntoma guía; Tiene el botón Describir síntoma |

**Cómo preguntar**

- ¿Cómo empezó? ¿De golpe o poco a poco? (02a)
- ¿A qué atribuye usted que haya empezado? (02a)
- ¿Tomó algo por su cuenta? ¿Qué, en qué dosis y le sirvió? (02a)
- ¿Fue a algún médico, estuvo hospitalizado o le hicieron exámenes? ¿Qué tratamiento le dieron? (02a)
- ¿Desde entonces ha mejorado, empeorado o le aparecieron molestias nuevas? (02a)
- ¿Cómo se siente hoy? ¿Qué molestias tiene en este momento? (02a)

**Cómo conducirlo**

- La evolución es la parte más extensa: ordénela junto con los exámenes y tratamientos que ya recibió. (02a)

**No olvidar**

- No resuma el estado actual con está mejor o está peor sin explicar en qué. (02a)

| Código | Frase | Uso | Fuente |
|---|---|---|---|
| `a1` | Paciente refiere que hace | Abre el relato con el síntoma guía y el tiempo de enfermedad en tiempo relativo («hace 5 días»), en tercera persona. | 02a |
| `a2` | Posteriormente se agrega | Introduce, en orden cronológico, un síntoma que aparece después del síntoma guía. | 02a |
| `a3` | Se automedica con | Registra lo que el paciente tomó por su cuenta: fármaco, dosis, vía y si le sirvió. | 02a |
| `a4` | Acude a | Registra la consulta a un médico, centro de salud u hospital, la hospitalización y los exámenes que le hicieron. | 02a |
| `a5` | Recibe tratamiento con | Registra el tratamiento indicado por un profesional, con dosis y respuesta. | 02a |
| `a6` | Actualmente persiste | Cierra con el estado actual: qué síntomas siguen hoy y cómo están, sin resumir con «está mejor» o «está peor». | 02a |
| `a7` | No refiere cuadro similar previo. | Antecedente remoto de la enfermedad actual negativo: se escribe siempre, nunca se deja en blanco. | 02a |
| `a8` | Refiere cuadro similar hace | Antecedente remoto positivo: fechar el episodio previo e indagar su relación con el cuadro actual. | 02a |

## Síntomas (lista `sintoma`)

La definición es la etiqueta del paquete (se ve al tocar la opción). La guía que aplica es la que abre la app según `ambitoDeSintoma` en `shared/guias.ts`; «—» significa que ese síntoma no tiene guía propia.

| Síntoma | Definición | Guía que aplica |
|---|---|---|
| Dolor torácico | Dolor en el tórax; origen cardíaco, pleural o parietal | Dolor torácico |
| Dolor precordial | Dolor precordial o retroesternal; típico de isquemia | Dolor torácico |
| Dolor pleurítico | Dolor punzante «en puntada de costado»; aumenta al respirar | Dolor torácico |
| Dolor abdominal | Dolor en el abdomen; visceral, parietal o referido | Dolor abdominal |
| Epigastralgia | Dolor en el epigastrio | Dolor abdominal |
| Dolor hepático | Dolor continuo en hipocondrio derecho (cápsula de Glisson) | Dolor abdominal |
| Cólico biliar | Dolor espasmódico súbito en hipocondrio derecho | Dolor abdominal |
| Dolor pancreático | Dolor lancinante epigástrico en barra, irradiado al dorso | Dolor abdominal |
| Cólico renal | Dolor lancinante lumbar súbito irradiado a ingle o genitales | Dolor |
| Lumbalgia | Dolor en la región lumbar, a menudo muscular | Dolor |
| Dolor lumbar | Dolor profundo lumbar; empeora de pie y al final del día | Dolor |
| Dolor vesical | Dolor suprapúbico; con deseo de orinar | Dolor |
| Cefalea | Dolor en la bóveda craneal y la región cervical | Cefalea |
| Otalgia | Dolor de oído | Dolor |
| Odinofagia | Dolor al deglutir | Dolor |
| Claudicación intermitente | Dolor tipo calambre en la pantorrilla al caminar | Dolor |
| Disnea | Sensación subjetiva de dificultad para respirar | Disnea |
| Disnea de esfuerzo | Disnea a grandes, medianos o pequeños esfuerzos | Disnea |
| Ortopnea | Disnea en decúbito que obliga a sentarse | Disnea |
| Disnea paroxística nocturna | Disnea que aparece de noche tras horas de sueño | Disnea |
| Trepopnea | Disnea en un decúbito lateral que mejora en el otro | Disnea |
| Tos | Espiración forzada refleja; seca o productiva | Tos y expectoración |
| Expectoración | Eliminación por la tos de material de la vía aérea | Tos y expectoración |
| Hemoptisis | Sangre roja rutilante expulsada con la tos | Tos y expectoración |
| Sibilancias | Ruido espiratorio musical | Tos y expectoración |
| Disfonía | Voz ronca o delgada | — |
| Palpitaciones | Percepción consciente y desagradable de los propios latidos | Palpitaciones |
| Síncope | Pérdida súbita y transitoria de conciencia | Síncope |
| Lipotimia | Sensación de desmayo sin pérdida de conciencia | Síncope |
| Edema | Acumulación de líquido en el intersticio | Edema |
| Anasarca | Edema generalizado | Edema |
| Astenia | Cansancio o fatiga | — |
| Fiebre | Alza térmica | Fiebre |
| Pérdida de peso | Enflaquecimiento | — |
| Anorexia | Pérdida del apetito | — |
| Pirosis | Ardor retroesternal ascendente hasta la faringe | — |
| Acidez | Ardor epigástrico que mejora con antiácidos | — |
| Dispepsia | Síntomas que el paciente atribuye a mala digestión | — |
| Saciedad precoz | Se llena rápidamente | — |
| Náuseas | Sensación de deseo inminente de vomitar | Náuseas y vómitos |
| Vómitos | Expulsión forzada del contenido gástrico por la boca | Náuseas y vómitos |
| Regurgitación | Retorno gástrico a la boca sin náuseas ni arcadas | Náuseas y vómitos |
| Meteorismo | Distensión del abdomen por gas | — |
| Eructación | Expulsión ruidosa por la boca del aire gástrico | — |
| Distensión abdominal | Abdomen distendido | — |
| Diarrea | Deposiciones de menor consistencia y mayor frecuencia | Diarrea |
| Estreñimiento | Evacuación difícil con heces duras | Diarrea |
| Tenesmo | Contracción espasmódica del recto sin eliminar heces | Diarrea |
| Hematemesis | Sangre con el vómito | Náuseas y vómitos |
| Melena | Heces negras como brea | Diarrea |
| Enterorragia | Sangre roja por el ano | Diarrea |
| Ictericia | Coloración amarilla de piel, escleróticas y mucosas | Ictericia |
| Coluria | Orina oscura, «como coca-cola» | Ictericia |
| Acolia | Heces blanquecinas, «como masilla» | Ictericia |
| Disfagia | Dificultad para tragar | — |
| Disuria | Micción con dolor, ardor o tenesmo | Síntomas urinarios |
| Polaquiuria | Micciones repetidas sin aumento del volumen total | Síntomas urinarios |
| Urgencia miccional | Necesidad imperiosa de orinar | Síntomas urinarios |
| Nicturia | Aumento de las micciones nocturnas | Síntomas urinarios |
| Oliguria | Diuresis menor de 400 ml en 24 horas | Síntomas urinarios |
| Anuria | Diuresis menor de 100 ml en 24 horas | Síntomas urinarios |
| Poliuria | Diuresis mayor de 2000 ml en 24 horas | Síntomas urinarios |
| Tenesmo vesical | Sensación de vaciamiento vesical insuficiente | Síntomas urinarios |
| Incontinencia urinaria | Eliminación involuntaria de orina | Síntomas urinarios |
| Retención urinaria | Falta de eliminación de la orina | Síntomas urinarios |
| Hematuria | Sangre en la orina | Síntomas urinarios |
| Orina espumosa | Orina con aumento de espuma | Síntomas urinarios |
| Vértigo | Sensación ilusoria de movimiento rotatorio | Vértigo y mareo |
| Mareo | Alteración de la orientación sin ilusión de movimiento | Vértigo y mareo |
| Acúfenos | Zumbidos sin estímulo externo | — |
| Hipoacusia | Pérdida acentuada de la audición | — |
| Epistaxis | Sangrado nasal | — |
| Parestesias | Hormigueo o adormecimiento | — |
| Intolerancia al frío | Hipersensibilidad al frío | — |

## Semiología del dolor

El dolor es una sensación molesta y aflictiva de una parte del cuerpo, por causa interior o exterior (03b). Según su origen es **somático** (piel, partes blandas, huesos, articulaciones, músculo; bien localizado), **visceral** (vísceras huecas; difuso, se agrava con la distensión, la isquemia y la inflamación, base del dolor cólico), **neuropático** (lesión de la vía nerviosa; con alodinia, hiperalgesia o hiperpatía) o **funcional** (sin lesión orgánica demostrable) (03b). El **dolor referido** se siente en una zona somática alejada del órgano enfermo, como la apendicitis que empieza en el epigastrio o el cólico renal que llega a la ingle (03b, 09a). En el adulto mayor el dolor es el quinto signo vital: se pregunta siempre (03b).

- **Antigüedad:** agudo (minutos a una semana, con fenómenos autonómicos) o crónico (meses, con alteraciones psíquicas; frecuente en la cefalea y la lumbalgia) (03b).
- **Intensidad:** escala nominal (leve, moderado, severo) o escala visual análoga de 0 a 10; quien consulta por cefalea suele marcar más de 4 (03b, 11g).
- **Duración:** ejemplo del dolor torácico: 2 a 10 minutos en la angina estable, hasta 20 minutos en la inestable y más de 20 minutos, horas o días en el infarto (08a).
- **Cuándo se abre el bloque del dolor en la app:** cuando la etiqueta del síntoma empieza con «Dolor» o su nombre lleva «algia», «dolor» o «cólico» (`esDolor`). Hoy son 16: Dolor torácico, Dolor precordial, Dolor pleurítico, Dolor abdominal, Epigastralgia, Dolor hepático, Cólico biliar, Dolor pancreático, Cólico renal, Lumbalgia, Dolor lumbar, Dolor vesical, Cefalea, Otalgia, Odinofagia, Claudicación intermitente.

### Localización e irradiación

La misma lista sirve para la localización (una) y para la irradiación (varias). Las regiones del abdomen siguen la división en nueve regiones: dos líneas verticales que prolongan las medioclaviculares y dos horizontales, por los rebordes costales y por las espinas ilíacas anterosuperiores (09b).

| Región | Definición | Fuente |
|---|---|---|
| la región frontal | La frente; allí tienden a doler las lesiones supratentoriales. | 11g |
| la región temporal | La sien, a cada lado de la cabeza por encima de la oreja; junto con la frente, sitio típico de la migraña. | 11g |
| la región frontotemporal | Frente y sien a la vez; localización más típica de la migraña, aunque hasta el 40% de los migrañosos tiene dolor bilateral. | 11g |
| la región occipital | La nuca y la parte posterior del cráneo; allí tienden a doler las lesiones de la fosa posterior. | 11g |
| la región ocular | Alrededor o detrás del ojo; con lagrimeo y ojo rojo en crisis breves repetidas orienta a cefalea en racimos. | 11g |
| el hemicráneo derecho | Mitad derecha de la cabeza; define una cefalea unilateral, como la migraña o la hemicránea continua. | 11g |
| el hemicráneo izquierdo | Mitad izquierda de la cabeza; define una cefalea unilateral, como la migraña o la hemicránea continua. | 11g |
| toda la cabeza | Holocraneana: toda la cabeza, sin lateralidad fija (11g la llama holocraneal). | paquete; 11g |
| el trayecto del nervio trigémino | La cara, en el territorio de sus ramas oftálmica, maxilar y mandibular; el dolor en descarga eléctrica orienta a neuralgia. | 11d; 11g |
| la mandíbula | Maxilar inferior; irradiación del dolor isquémico miocárdico y una de sus localizaciones atípicas. | 08a |
| el pabellón auricular izquierdo | Oreja izquierda; una de las irradiaciones del dolor isquémico miocárdico. | 08a |
| la faringe | La garganta, detrás de la boca; hasta allí asciende el ardor retroesternal de la pirosis por reflujo. | 09a |
| el cuello | Irradiación del dolor anginoso, del dolor pericárdico y del dolor aórtico por disección. | 08a |
| la línea media del cuello | Parte anterior y central del cuello, sobre la tiroides; el dolor tiroideo es medial y empeora al deglutir. | 13a |
| la región precordial | Área del tórax anterior donde se proyecta el corazón, del segundo al quinto espacio intercostal; sitio del dolor isquémico. | 08b; 08a |
| la región retroesternal | Detrás del esternón; sitio del dolor isquémico, pericárdico y aórtico, y del ardor ascendente de la pirosis. | 08a; 09a |
| la región mamilar | Zona del pezón, sobre la línea medioclavicular; allí se localiza el dolor torácico psicógeno (punta del corazón). | 08a; 07b |
| las articulaciones condrocostales | Uniones de las costillas con sus cartílagos en la cara anterior del tórax; dolor punzante a la palpación (osteocondritis). | 08a |
| el costado derecho | Pared lateral derecha del tórax; sitio del dolor pleurítico «en puntada de costado». | 07a |
| el costado izquierdo | Pared lateral izquierda del tórax; sitio del dolor pleurítico «en puntada de costado». | 07a |
| la región supraclavicular | Por encima de la clavícula; proyección de los vértices pulmonares. | 07b |
| la región infraclavicular | Por debajo de la clavícula; proyección de los lóbulos pulmonares superiores. | 07b |
| la región interescapular | Espalda, entre ambas escápulas; irradiación del dolor aórtico por disección. | 07b; 08a |
| la región dorsal | La espalda, cara posterior del tórax; hacia el dorso se irradian el dolor pancreático «en barra» y el de la colecistitis. | 09d |
| el ángulo de la escápula derecha | Punta inferior del omóplato derecho; irradiación del dolor de la colecistitis aguda por el nervio frénico. | 09d |
| la región lumbar | Parte baja de la espalda, a cada lado de la columna, entre la última costilla y la cresta ilíaca; sitio de la lumbalgia y del dolor renal. | Anatomía, paredes del abdomen; 10a |
| el ángulo costovertebral | Ángulo entre la última costilla y la columna, en la espalda; allí empieza el cólico renal y duele el quiste renal complicado. | 10a |
| la columna | Eje vertebral en la línea media de la espalda; el cólico ureteral se irradia hacia ella y la espondiloartrosis duele aquí. | 09a; 10a |
| la región sacra | Zona media posterior sobre el sacro, entre ambas nalgas; allí se refiere el dolor de la prostatitis y se busca el edema del encamado. | 10a; 08a |
| la región glútea | La nalga, por debajo de la cresta ilíaca; se continúa hacia arriba con la región lumbar y hacia dentro con la sacrococcígea. | Anatomía, región glútea |
| el epigastrio | Región superior y central del abdomen, bajo el apéndice xifoides; estómago, duodeno, vía biliar y lóbulo izquierdo del hígado. | 09b |
| el hipocondrio derecho | Región superior derecha del abdomen, bajo el reborde costal; hígado, vesícula, ángulo hepático del colon y riñón derecho. | 09b |
| el hipocondrio izquierdo | Región superior izquierda del abdomen, bajo el reborde costal; estómago, bazo, cola del páncreas y riñón izquierdo. | 09b |
| el mesogastrio | Región central del abdomen, entre ambos flancos y alrededor del ombligo; epiplón mayor y colon transverso. | 09b |
| la región periumbilical | Alrededor del ombligo; el dolor cólico periumbilical orienta al intestino delgado. | 09a; 09f |
| el flanco derecho | Región lateral media derecha del abdomen, entre el hipocondrio y la fosa ilíaca; colon ascendente. | 09b |
| el flanco izquierdo | Región lateral media izquierda del abdomen, entre el hipocondrio y la fosa ilíaca; colon descendente. | 09b |
| la fosa ilíaca derecha | Región inferior derecha del abdomen, bajo la línea de las espinas ilíacas; ciego y apéndice, por eso orienta a apendicitis. | 09b |
| la fosa ilíaca izquierda | Región inferior izquierda del abdomen, bajo la línea de las espinas ilíacas; colon sigmoides. | 09b |
| el hipogastrio | Región inferior y central del abdomen, sobre el pubis; vejiga y, en la mujer, los anexos. | 09b; 09f |
| la región suprapúbica | Justo por encima del pubis; sitio del dolor vesical, que el paciente describe como deseo de orinar. | 10a |
| la región infraumbilical | Abdomen por debajo del ombligo; el dolor cólico infraumbilical acompaña a la diarrea de origen colónico. | 09a |
| todo el abdomen | Difuso: dolor en todo el abdomen, sin región precisa; si se difunde tras un dolor localizado, sugiere peritonitis generalizada (09d). | paquete; 09d |
| la región inguinal | La ingle, pliegue entre el abdomen y el muslo; hasta allí se irradia el cólico renal. | 10a |
| el testículo | Irradiación final del cólico renal en el varón, cuando el cálculo desciende por el uréter. | 10a; 09a |
| los labios mayores | Irradiación final del cólico renal en la mujer, cuando el cálculo desciende por el uréter. | 10a; 09a |
| la uretra y el meato | Conducto urinario y su orificio externo; hacia allí se irradia el dolor vesical cuando se irrita el trígono. | 10a |
| el recto | Porción final del intestino; allí se refiere el dolor perineal de la prostatitis aguda. | 10a |
| el periné | Partes blandas que cierran la pelvis por abajo, entre pubis, isquiones y cóccix; sitio del dolor de la prostatitis aguda. | Anatomía, periné; 10a |
| el hombro derecho | Irradiación del dolor de la colecistitis aguda por el nervio frénico. | 09d |
| el hombro izquierdo | Irradiación del dolor isquémico miocárdico. | 08a |
| el brazo y antebrazo izquierdos | Irradiación típica del dolor isquémico miocárdico; su extensión es proporcional a la intensidad del dolor. | 08a |
| el miembro inferior derecho | Desde la cadera hasta el pie; el edema de un solo miembro sugiere enfermedad venosa, en 80 a 90% trombosis venosa profunda. | 08a; 05g |
| el miembro inferior izquierdo | Desde la cadera hasta el pie; el edema de un solo miembro sugiere enfermedad venosa, en 80 a 90% trombosis venosa profunda. | 08a; 05g |
| ambos miembros inferiores | Compromiso bilateral; el edema simétrico que asciende desde los maléolos es propio del edema cardiogénico. | 08a |
| la pantorrilla | Cara posterior de la pierna; sitio del dolor tipo calambre de la claudicación intermitente y de la trombosis venosa profunda. | 08a; 05g |

Fuentes fuera de Semiología (rutas relativas a `wiki\`): Anatomía, paredes del abdomen = `ANATOMIA 2026/clases/ABDOMEN/01_PAREDES_DEL_ABDOMEN.md`; Anatomía, región glútea = `ANATOMIA 2026/clases/MIEMBRO INFERIOR/06_TOPOGRAFIA/01_REGION_GLUTEA_PLANOS_VASOS_Y_NERVIOS_reescrito.md`; Anatomía, periné = `ANATOMIA 2026/clases/PELVIS/02_GENITALES_MASCULINOS/03_Perineo_en_el_Hombre_Musculos_aponeurosis_y_topografia.md`.

### Carácter del dolor

Las notas lo definen como el conjunto de rasgos con que un dolor se reconoce y se distingue de otro (03b); las comparaciones y su orientación vienen de 03b, 08a, 09a, 09d y 11g.

| Carácter | Qué evoca |
|---|---|
| opresivo | «Como si algo apretara»; isquemia miocárdica |
| constrictivo | Sinónimo de opresivo; angina de pecho |
| urente | Ardor o quemazón; gastritis y úlcera péptica |
| quemante | Sinónimo de urente |
| punzante | Bien localizado; pleurítico, condrocostal |
| lancinante | «Como si atravesara una lanza»; pancreatitis, cólico renal |
| terebrante | «Como un taladro»; úlcera péptica |
| cólico | Contracción de músculo liso; intestino, vía biliar, uréter |
| espasmódico | Cólico biliar: súbito, intenso, dura horas |
| pulsátil | Típico de la cefalea |
| fulgurante | «Corriente eléctrica» |
| en descarga eléctrica | Sigue el trigémino; neuralgia |
| sordo | Vago, profundo, sin localización precisa |
| gravativo | «Peso que jala hacia abajo»; visceromegalia |
| tipo calambre | Claudicación intermitente |
| explosivo | Cefalea «la peor de su vida» |
| transfixiante | Que atraviesa |
| desgarrante | Como un desgarro |

### Presentación del síntoma

En la frase entra tal cual, después de la intensidad («…, de predominio nocturno, …»).

| Presentación | Significado | Fuente |
|---|---|---|
| de curso continuo | Persistente | paquete |
| de curso intermitente | Alterna con pausas | paquete |
| de presentación paroxística | En crisis | paquete |
| en episodios recurrentes | Ataques repetidos; precisar periodicidad | paquete |
| en episodio único | Un solo episodio, sin ataques repetidos; es lo opuesto a los ataques recurrentes. | 02a |
| en accesos | Tos quintosa | paquete |
| de predominio nocturno | Predomina de noche; por ejemplo, la tos del asma, de la tuberculosis o de la insuficiencia cardíaca izquierda, y la diarrea orgánica. | 07a; 08a2; 09a |
| de predominio matutino | Predomina en la mañana; por ejemplo, la tos de la bronquitis crónica o la diarrea funcional matinal. | 07a; 09a |
| de predominio vespertino | Predomina en la tarde; por ejemplo, el edema cardiogénico, que empeora por las tardes y mejora con el reposo nocturno. | 08a |
| de aparición posprandial | Tras comer | paquete |
| que aparece con el esfuerzo | Se desencadena con la actividad física; propio de la angina de pecho, la disnea de esfuerzo y las palpitaciones por esfuerzo. | 08a |
| que aparece en reposo | Aparece sin esfuerzo previo; propio del infarto de miocardio (reposo nocturno) y de la disnea de reposo. | 08a; 07a |
| con horario fijo | Aparece siempre a la misma hora; un patrón horario muy marcado orienta a la cefalea en racimos (de Horton). | 11g |
| en racimos | Varias crisis breves al día | paquete |
| en relación con la menstruación | Aparece solo con la menstruación; en la cefalea orienta a causa hormonal. | 11g |
| de carácter transitorio | Dura poco y cede por sí solo; por ejemplo, las palpitaciones pasajeras por alcohol, café, cocaína o broncodilatadores. | 08a |
| diario | Cefalea crónica diaria | paquete |

### Agravantes («Se exacerba con»)

| Agravante | Qué orienta | Fuente |
|---|---|---|
| la tos | Orienta a dolor pleurítico, que se exacerba con la respiración, la tos y los cambios de postura. | 07a |
| la respiración | Orienta a dolor pleurítico o a dolor pericárdico. | 07a; 08a |
| la inspiración profunda | Orienta a irritación pleural; en la colecistitis aguda el dolor interrumpe la inspiración profunda (signo de Murphy). | 07a; 09b |
| los cambios de postura | Orienta a dolor pleurítico; en el vértigo, su aparición con los cambios de posición orienta a causa periférica. | 07a; 11g |
| la flexión del tronco | Suele aumentar el dolor lumbar de origen mecánico o muscular. | fuera de notas |
| la bipedestación | El dolor lumbar de origen renal empeora de pie y al final del día; el síncope al ponerse de pie orienta a causa ortostática. | 10a; 08a |
| la posición erecta | Sinónimo de bipedestación; el dolor lumbar de origen renal empeora con la posición erecta. | 10a |
| la deglución | Orienta a dolor pericárdico, a dolor tiroideo (medial en el cuello) o a odinofagia. | 08a; 13a; 09a |
| el decúbito dorsal | Orienta a dolor pericárdico; en la disnea, el decúbito dorsal aumenta la congestión pulmonar y precede a la ortopnea. | 08a |
| el decúbito | Agrava la ortopnea, la pirosis nocturna por reflujo y la tos de la insuficiencia cardíaca izquierda. | 07a; 09a; 08a2 |
| el decúbito lateral | La disnea que aparece en un decúbito lateral y mejora en el otro es trepopnea, típica del derrame pleural. | 07a |
| el esfuerzo físico | Orienta a angina de pecho, disnea de esfuerzo y palpitaciones por esfuerzo; también exacerba el dolor hepático. | 08a; 09d |
| la marcha | El dolor en la pantorrilla que aparece al caminar y obliga a detenerse es la claudicación intermitente. | 08a |
| el movimiento | El dolor que aumenta con el movimiento y obliga a quedarse inmóvil orienta a inflamación perirrenal o peritoneal. | 10a; 09f |
| la palpación | Orienta a dolor de la pared torácica (condrocostal) o a dolor por distensión de la cápsula hepática. | 08a; 09d |
| el estrés | Desencadenante de la angina de pecho. | 08a |
| las emociones | Desencadenan angina, palpitaciones y dolor torácico psicógeno; también son desencadenante de cefalea. | 08a; 11g |
| el frío | Desencadenante de la angina de pecho y del fenómeno de Raynaud. | 08a |
| las comidas copiosas | Desencadenante de la angina de pecho. | 08a |
| la ingesta de alimentos grasos | Orienta a vía biliar: la grasa contrae la vesícula y, si hay cálculos, provoca dolor, náuseas y vómitos. | 09d |
| la ingesta de alimentos | Molestia que aparece al comer; orienta a dispepsia o, si se acompaña de saciedad precoz, a obstrucción pilórica. | 09a |
| las transgresiones alimentarias | Excesos o desarreglos en la comida; desencadenan la acidez epigástrica. | 09a |
| el alcohol | Desencadena acidez epigástrica y es causa frecuente de pancreatitis aguda en el varón. | 09a; 09d |
| los antiinflamatorios no esteroideos | Desencadenan acidez epigástrica y lesionan la mucosa gástrica, con riesgo de hemorragia digestiva alta. | 09a; 09e |
| el ayuno | Desencadenante de cefalea. | 11g |
| la exposición al sol | Desencadenante de cefalea. | 11g |
| los olores | Desencadenante de cefalea; la molestia ante los olores (osmofobia) es un síntoma acompañante de la cefalea. | 11g |

### Atenuantes («Cede con»)

| Atenuante | Qué orienta | Fuente |
|---|---|---|
| el reposo | Alivia la angina de pecho, la claudicación intermitente y el dolor lumbar simple; el dolor del infarto no cede con el reposo. | 08a; 10a |
| el decúbito | El síncope vasovagal se recupera rápido al acostar al paciente. | 08a |
| la inmovilidad | El paciente se mantiene inmóvil en la inflamación perirrenal y en la peritonitis, porque el movimiento aumenta el dolor. | 10a; 09f |
| los analgésicos | Pueden enmascarar un infarto: no calmar un dolor torácico dudoso sin electrocardiograma y enzimas cardíacas. | 08a |
| los antiácidos | Su alivio orienta a acidez de origen gástrico. | 09a |
| los nitratos sublinguales | Alivian la angina de pecho; el dolor que no cede con nitratos ni con reposo orienta a infarto. | 08a |
| la posición genupectoral | De rodillas, apoyando el pecho y los codos; alivia el dolor pericárdico y es característica de la pericarditis con derrame. | 08a; 05a |
| la inclinación del tórax hacia adelante | Alivia el dolor pericárdico. | 08a |
| la cabecera elevada | Alivia la pirosis por reflujo, que empeora en decúbito nocturno. | 09a |
| sentarse o ponerse de pie | Alivia la ortopnea y el asma cardíaca; el asma bronquial no mejora con el cambio de posición. | 07a; 08a |
| el decúbito sobre el lado afectado | En la pleuritis el paciente se echa sobre el lado afectado; en el derrame pleural lo hace para que ventile mejor el pulmón sano. | 07a |
| el eructo | Alivia la distensión posprandial de la aerofagia. | 09a |
| el vómito | En la enfermedad hepatobiliar el paciente a veces se provoca el vómito para aliviar el dolor. | 09d |
| el sueño | Las cefaleas primarias suelen mejorar con el sueño. | 11g |
| la elevación de las piernas | El síncope vasovagal se recupera rápido al acostar al paciente y elevarle las piernas. | 08a |

### Respuesta al tratamiento

Se escribe después del fármaco: «Se automedica con …, con mejoría parcial.» Anotar siempre fármaco, dosis y si hubo síntomas nuevos (02a).

| Respuesta | Significado | Fuente |
|---|---|---|
| con mejoría parcial | Los síntomas disminuyen con el tratamiento, pero persisten; precisar cuáles siguen y en qué grado. | 02a |
| con mejoría total | Los síntomas desaparecen con el tratamiento recibido. | 02a |
| sin mejoría | Los síntomas siguen igual pese al tratamiento; anotar fármaco, dosis y tiempo de uso. | 02a |
| con empeoramiento | Los síntomas aumentan o aparecen síntomas nuevos pese al tratamiento; describir en qué empeoró. | 02a |
| no recibió tratamiento | No tomó medicamentos por su cuenta ni recibió tratamiento indicado por un profesional para este cuadro. | 02a |

## Guía por síntoma guía

Se muestra en la app al elegir el síntoma guía. Cada síntoma abre una sola guía: el dolor torácico, el abdominal y la cefalea tienen la suya propia en lugar de la de **Dolor** (ver la columna «Guía que aplica» en [Síntomas](#síntomas-lista-sintoma)).

### Dolor

**Cómo preguntar**

- ¿Desde cuándo tiene el dolor? ¿Empezó de golpe o poco a poco? (02a)
- ¿Dónde le duele exactamente? ¿El dolor se corre hacia otra parte? (03b)
- ¿Cómo es el dolor: punzante, quemante, opresivo, pulsátil, tipo cólico o como un peso? (03b)
- ¿Qué tan fuerte es: leve, moderado o insoportable? ¿Del 0 al 10, cuánto le pondría? (03b)
- ¿Qué lo provoca, qué lo empeora y qué lo calma? (03b)
- ¿Es un solo episodio o le viene por ataques? ¿Cada cuánto se repite? (02a)
- ¿Qué ha tomado para el dolor? ¿Le hizo efecto? (02a)

**No olvidar**

- En el adulto mayor el dolor es el quinto signo vital: pregúntelo siempre, aunque no lo mencione. (03b)

### Dolor torácico

**Cómo preguntar**

- ¿Dónde le duele: detrás del esternón, en la zona del corazón o en un costado? ¿Se va al cuello, mandíbula o brazo izquierdo? (08a)
- ¿Cómo es el dolor: como si algo le apretara, como quemazón, punzante o como una puñalada? (08a)
- ¿Cuánto le dura: unos minutos, más de 20 minutos, horas o días? (08a)
- ¿Aparece con esfuerzo, frío, emociones o comidas abundantes, o en reposo? ¿Se calma al descansar o con pastillas bajo la lengua? (08a)
- ¿Aumenta al respirar, al tragar o al echarse boca arriba? ¿Mejora inclinándose hacia adelante? (08a)
- ¿Se acompaña de sudor frío, náuseas, vómitos o falta de aire? (08a)
- ¿Tiene presión alta, diabetes, colesterol alto o sobrepeso? ¿Fuma? ¿Hace poco ejercicio? (08a)

**No olvidar**

- No calme con analgésicos un dolor torácico dudoso sin electrocardiograma y enzimas. Ancianos y diabéticos pueden infartar sin dolor. (08a)

### Dolor abdominal

**Cómo preguntar**

- ¿En qué parte de la barriga le duele? ¿Empezó en otro sitio y luego se movió? (09a)
- ¿Cómo es el dolor: tipo cólico, ardor, como taladro, como lanza que atraviesa o como un peso? (09a)
- ¿El dolor se corre hacia la espalda, el costado, la ingle o los genitales? (09a)
- ¿Se relaciona con las comidas, el alcohol o los antiinflamatorios? ¿Mejora con antiácidos? (09a)
- ¿Se acompaña de náuseas, vómitos, diarrea o estreñimiento? (09a)
- ¿Ha notado la piel u ojos amarillos, orina oscura o heces blanquecinas? (09a)
- ¿Hay alguna posición que lo alivie, o no encuentra cómo ponerse? (10a)

**No olvidar**

- Dolor bajo las costillas derechas en un cardiópata puede ser congestión del hígado, no una enfermedad digestiva. (08a2)

### Cefalea

**Cómo preguntar**

- ¿A qué edad empezaron sus dolores de cabeza? ¿Alguien en su familia los sufre? (11g)
- ¿En qué parte le duele: un lado, ambos lados, la frente, la nuca, el ojo o toda la cabeza? (11g)
- ¿Cómo es: pulsátil, opresivo, punzante, ardoroso o como descarga eléctrica? ¿Del 0 al 10, cuánto? (11g)
- ¿Cuántos días al mes le duele y cuánto dura cada vez? ¿A qué hora aparece? ¿Lo despierta? (11g)
- ¿Le molestan la luz, los ruidos o los olores? ¿Tiene náuseas, vómitos, lagrimeo o ve destellos antes? (11g)
- ¿Algo se lo provoca: comidas, sol, ayuno, olores, emociones o la regla? (11g)
- ¿Qué pastillas toma para el dolor y con qué frecuencia? (11g)

**No olvidar**

- Alarma: inicio después de los 50 años, o la peor cefalea de su vida, máxima en el primer minuto (descartar hemorragia subaracnoidea). (11g)

### Disnea

**Cómo preguntar**

- ¿Desde cuándo le falta el aire? ¿Empezó de repente o poco a poco? (07a)
- ¿Con qué esfuerzo le falta el aire: subir pisos o cargar peso, sus tareas diarias, levantarse o bañarse, o incluso en reposo? (07a)
- ¿Se ahoga al echarse? ¿Con cuántas almohadas duerme? ¿Se despierta de noche sofocado? (08a)
- ¿Respira mejor echado sobre un lado que sobre el otro? (07a)
- ¿Se acompaña de silbido en el pecho, tos, flema, sangre al toser o dolor de pecho? (07a)
- ¿Qué medicamentos ha usado para esto y mejoró con ellos? (02a)

**Cómo conducirlo**

- Distinga falta de aire de cansancio o fatiga: pregunte si le cuesta respirar o si solo se cansa. (07a)

**No olvidar**

- Disnea súbita con sobrepeso o viaje reciente sugiere tromboembolia pulmonar. En un joven deportista, neumotórax. (07a)

### Tos y expectoración

**Cómo preguntar**

- ¿Desde cuándo tiene tos? (07a)
- ¿La tos es seca o con flema? (07a)
- ¿Cómo es la flema: cuánta bota, de qué color (blanca, amarilla-verdosa, rosada, color óxido) y tiene mal olor? (07a)
- ¿Ha botado sangre al toser? ¿Cuánta? ¿Antes tuvo náuseas o vómito? (07a)
- ¿Tose más en la mañana o en la noche? ¿Tiene accesos de tos que terminan en vómito? (07a)
- ¿Se acompaña de falta de aire, silbido en el pecho, ronquera o dolor al respirar? (07a)
- ¿Fuma? ¿Qué medicamentos toma, por ejemplo para la presión (los inhibidores de la enzima convertidora de angiotensina pueden dar tos seca)? (07a)

**No olvidar**

- En nuestro medio, tos crónica con flema o sangre obliga a pensar primero en tuberculosis. (07a)

### Edema

**Cómo preguntar**

- ¿Desde cuándo nota la hinchazón y dónde empezó? (08a)
- ¿Se hinchan las dos piernas por igual o solo una? (08a)
- ¿La hinchazón empeora por la tarde y mejora después de dormir? ¿Ha ido subiendo? (08a)
- ¿Se le hinchan la cara o los párpados? ¿Su orina hace mucha espuma? (10a)
- ¿Ha subido de peso? ¿Orina menos o se levanta de noche a orinar? (08a2)
- ¿Le falta el aire o necesita varias almohadas para dormir? (08a)
- ¿Toma antiinflamatorios como ibuprofeno o diclofenaco? (08a2)

**No olvidar**

- Edema asimétrico sugiere enfermedad venosa. En pacientes encamados búsquelo en la región sacra. (08a)

### Palpitaciones

**Cómo preguntar**

- ¿Cómo siente los latidos: rápidos, lentos, irregulares o como saltos? (08a)
- ¿Aparecen con el esfuerzo y se calman en reposo? (08a)
- ¿Aparecen con nervios, ansiedad o miedo intenso? (08a)
- ¿Antes de sentirlas tomó café, alcohol, cocaína o inhaladores para el asma? (08a)
- ¿Le han dicho que tiene arritmia, presión alta, problemas de tiroides o anemia? (08a)
- ¿Ha bajado de peso aunque come más, suda mucho o le tiemblan las manos? (13a)
- ¿Toma digitálicos u otro medicamento para el corazón? (08a)

**No olvidar**

- Los digitálicos, aun a dosis usuales, pueden dar arritmias, sobre todo con potasio bajo o insuficiencia renal. (08a)

### Síncope

**Cómo preguntar**

- ¿Perdió el conocimiento por completo o solo sintió que se iba a desmayar? (08a)
- ¿Qué hacía en ese momento: estaba de pie, con dolor o calor, tosiendo, orinando o defecando? (08a)
- ¿Le pasó al ponerse de pie, al girar la cabeza o con el cuello apretado? (08a)
- ¿Antes sintió náuseas o sudoración? ¿Se recuperó rápido al echarse? (08a)
- ¿Tuvo convulsiones o se orinó durante el desmayo? (08a)
- ¿Toma medicamentos para la presión? ¿Es diabético o estaba en ayunas? (08a)

**Cómo conducirlo**

- Si el paciente no recuerda el episodio, pida el relato a un familiar o acompañante que lo haya visto. (02a)

**No olvidar**

- En ancianos predomina el síncope cardiogénico (arritmias graves, estenosis aórtica, infarto): no lo tome como simple desmayo. (08a)

### Náuseas y vómitos

**Cómo preguntar**

- ¿Antes de vomitar tuvo náuseas o arcadas, o el vómito salió de golpe, sin aviso? (09a)
- ¿Qué vomitó: comida recién ingerida, comida de horas antes, líquido amarillo-verdoso o algo oscuro y fétido? (09a)
- ¿Cuánto tiempo después de comer vomita? (09a)
- ¿Ha vomitado sangre o algo parecido a borra de café? (07a)
- ¿Se acompaña de dolor o hinchazón de la barriga? (09a)
- ¿Podría estar embarazada? ¿Toma antiinflamatorios o digitálicos? (09a)
- ¿Toma alcohol? ¿Los vómitos son por las mañanas? (09h)

**No olvidar**

- Vómito en proyectil, sin náuseas previas, sugiere hipertensión endocraneana (vómito cerebral). (09a)

### Diarrea

**Cómo preguntar**

- ¿Desde cuándo tiene diarrea? ¿Ha durado más de un mes? (09a)
- ¿Cuántas veces al día va al baño y cuánta cantidad elimina cada vez? (09a)
- ¿Las heces tienen moco, pus, sangre o restos de comida sin digerir? (09a)
- ¿Siente ganas de evacuar sin poder hacerlo? ¿Le duele alrededor del ombligo o más abajo? (09a)
- ¿Tiene fiebre, náuseas o vómitos? (09a)
- ¿La diarrea lo despierta de noche o solo le ocurre de día? (09a)
- ¿Ha tomado laxantes, antibióticos, colchicina o alcohol? (09a)

**No olvidar**

- Vigile la deshidratación: mucosas secas, taquicardia e hipotensión al ponerse de pie. (09a)

### Ictericia

**Cómo preguntar**

- ¿Desde cuándo nota el color amarillo? ¿Apareció de golpe o poco a poco? (09a)
- ¿El color amarillo ha ido aumentando, se mantiene o está bajando? (09a)
- ¿Su orina está oscura, como coca-cola? (09a)
- ¿Sus heces están blanquecinas, como masilla? (09a)
- ¿Tiene picazón en la piel? (09a)
- ¿Antes tuvo náuseas, vómitos, asco a la carne o al cigarro, o cólicos en el lado derecho de la barriga? (09a)
- ¿Toma alcohol o algún medicamento? ¿Come mucha zanahoria, papaya o naranja? (09a)

**No olvidar**

- Examine con luz natural (con luz artificial pasa inadvertida). Piel amarilla con escleras normales sugiere hipercarotinemia. (09a)

### Síntomas urinarios

**Cómo preguntar**

- ¿Siente dolor, ardor o molestia al orinar? (10a)
- ¿Orina muchas veces pero poca cantidad? ¿Siente ganas urgentes de orinar? (10a)
- ¿Orina más o menos que antes? ¿Se levanta de noche, se le escapa la orina o le cuesta orinar? (10a)
- ¿De qué color es su orina? ¿Es turbia, con mucha espuma o con mal olor? (10a)
- ¿Ha visto sangre en la orina? ¿Al inicio, al final o durante toda la micción? (10a)
- ¿Tiene fiebre, escalofríos o dolor en la espalda baja que se corre a la ingle? (10a)
- ¿Ha tenido cálculos, infecciones urinarias repetidas, sondas o cirugías urológicas? ¿Es diabético o hipertenso? (10a)

**No olvidar**

- Descarte falsa hematuria (regla, betarraga, rifampicina, fenazopiridina) y pregunte si toma anticoagulantes. (10a)

### Vértigo y mareo

**Cómo preguntar**

- ¿Siente que usted o las cosas dan vueltas, o es más bien aturdimiento, sensación de flotar o inestabilidad al estar de pie? (11g)
- ¿Empezó de golpe o poco a poco? ¿Viene por episodios o es continuo? (11g)
- ¿Cuánto dura cada episodio: segundos, horas, días o más? (11g)
- ¿Aparece o empeora con los cambios de posición? (11g)
- ¿Oye zumbidos o escucha menos? ¿Tiene náuseas o vómitos? (11g)
- ¿Ha perdido el conocimiento o notado debilidad u otro síntoma neurológico? (11g)
- ¿Toma aspirina, anticonvulsivantes, diuréticos o alcohol? ¿Se ha golpeado la cabeza? (11g)

**No olvidar**

- Inicio insidioso y progresivo, edad mayor de 50 años o riesgo cerebrovascular: sospeche causa central y pida neuroimagen. (11g)

### Fiebre

**Cómo preguntar**

- ¿Desde cuándo tiene fiebre? ¿Ya lleva más de una semana? (05e)
- ¿Empezó de golpe con escalofríos o poco a poco? (05e)
- ¿Se tomó la temperatura con termómetro? ¿Cuánto marcó? (05e)
- ¿A qué hora le sube más: en la mañana, en la tarde o en la noche? (05e)
- ¿Cómo se le pasa: de golpe con mucho sudor o bajando poco a poco? (05e)
- ¿Se acompaña de dolor de cabeza, dolor de huesos, tos, ardor al orinar o diarrea? (05e)

**Cómo conducirlo**

- Si refiere fiebre que el termómetro no confirma (por ejemplo, bochornos), pídale anotar fecha, hora y temperatura de cada episodio. (05e)

**No olvidar**

- Ancianos y pacientes en shock pueden tener solo febrícula pese a una infección grave. (05e)

## Discrepancias y pendientes

> **Corregido en la app el 16/09/2026** tras esta revisión: punto 11 (Vómitos abre Náuseas y vómitos; Distensión abdominal ya no abre Dolor abdominal; Odinofagia abre Dolor; Orina espumosa abre Síntomas urinarios), el título «Tiempo de enfermedad» del punto 4 y «por ejemplo» escrito completo en la guía. Los demás siguen pendientes.

1. **Súbito y brusco no están definidos en las notas.** 02a los nombra juntos («súbito, brusco o insidioso y progresivo») y 02a también dice «modo de aparición (súbito o gradual)». La diferencia usada en `definiciones-02.csv` (súbito: instantáneo, máximo en el primer minuto, 11g; brusco: se instala en minutos u horas, 08i) es una deducción de ejemplos: confirmar en clase.
2. **Curso sin sustento en notas:** «Estacionario», «En brotes» y «Regresivo» se definieron fuera de notas. Además, `curso` y `patron_sintoma` se pisan: «Intermitente» frente a «de curso intermitente» y «Recurrente» frente a «en episodios recurrentes»; si se eligen ambos, el relato repite la idea. Conviene decidir cuál de las dos listas lleva el curso.
3. **Signos y síntomas principales (`ea.signos_sintomas`)** tiene las reglas del motivo de consulta (con las palabras del paciente, máximo tres; 02a), pero su guía pide traducir a términos médicos («edema y no hinchazón»). Definir si el campo es el motivo de consulta o la lista de síntomas de la enfermedad actual.
4. **Guía de los campos:** `ea.forma_inicio` y `ea.curso` no tienen entradas en `seed/guias.csv`. El ámbito `ea.tiempo` llega con título crudo («ea.tiempo») en lugar de «Tiempo de enfermedad». El umbral agudo o crónico tiene dos versiones en las notas (10 días o menos frente a más de 60 días en 2018; agudo hasta 3 meses, subagudo, subcrónico y crónico en 2020) y el área no tiene umbrales cargados.
5. **«Dolor lumbar» y «Lumbalgia».** 10a separa el dolor lumbar de origen renal (distensión de la cápsula, profundo, empeora de pie) de la lumbalgia muscular. La etiqueta de «Dolor lumbar» ya lo describe, pero el nombre es genérico y choca con la preferencia de redactar «lumbalgia»; propuesta: renombrar a «Dolor lumbar de origen renal». En el ejemplo de la app, «lumbalgia a nivel de la región lumbar» es redundante: cuando el síntoma ya nombra la región, la localización podría omitirse.
6. **Nicturia:** 10a la define como aumento del número de micciones nocturnas (igual que la etiqueta); 08a2, como aumento del volumen urinario nocturno.
7. **Decúbito en el dolor torácico:** 07a dice que en la pleuritis el paciente se echa sobre el lado afectado; 07b dice que en los dolores torácicos se busca el decúbito sobre el lado sano para evitar el roce. La opción «el decúbito sobre el lado afectado» sigue a 07a.
8. **Carácter del dolor:** 03b escribe «gravitativo» y 09a «gravativo» (la lista usa gravativo); 03b incluye «esquisito», que no está en la lista; 03b agrupa «lancinante o en punzada», mientras la lista separa lancinante (lanza) de punzante; «transfixiante» y «desgarrante» solo aparecen nombrados en 03b, sin orientación clínica (08a describe la disección aórtica como lancinante, no desgarrante). La etiqueta «Holocraneana» usa otra forma que 11g («holocraneal»).
9. **Agravantes y atenuantes:** «la bipedestación» y «la posición erecta» son sinónimos (sobra una). «la flexión del tronco» no tiene sustento en las notas. La relación clásica de «la ingesta de alimentos» y «el ayuno» con la úlcera péptica no está en las notas; solo se documentan la dispepsia (09a) y el ayuno como desencadenante de cefalea (11g).
10. **Etiquetas mejorables:** «en accesos» tiene como etiqueta un ejemplo («Tos quintosa») y no una definición; «Distensión abdominal» se define a sí misma («Abdomen distendido»); «Fiebre» («Alza térmica») es más vaga que 05e (aumento de la temperatura corporal por acción del centro termorregulador); «Parestesias», «Anorexia» e «Intolerancia al frío» no tienen definición en las notas (fuera de notas).
11. **Guía por síntoma en la app (`ambitoDeSintoma`), error a corregir:** «Vómitos» abre la guía de Tos y expectoración, porque «vomitos» contiene «tos» y esa regla se revisa antes que la de vómitos; hay que mover la regla de vómitos antes o buscar la palabra completa. Además, «Distensión abdominal» abre la guía de Dolor abdominal (la regla busca «abdominal»), aunque no es un dolor; «Odinofagia» sí abre el bloque del dolor (su etiqueta empieza con «Dolor») pero no recibe ninguna guía; «Orina espumosa» no abre la guía de Síntomas urinarios, que sí pregunta por la espuma.
12. **Frase del tratamiento en la app:** el botón siempre escribe «Se automedica con…», aunque el tratamiento lo haya indicado un médico (para eso existe la frase `a5`). Si se elige «no recibió tratamiento» y además se escribe un fármaco, sale una oración contradictoria; si se elige una respuesta sin fármaco, queda suelta («Con mejoría parcial.»).
13. **Texto de la guía con abreviatura:** dos entradas de `seed/guias.csv` abrevian «por ejemplo» (`ea.signos_sintomas`, fuente 02c, y `s.fiebre`, fuente 05e). Aquí se escribió completo; conviene corregirlo en el seed.
14. **Localizaciones sin definición en Semiología:** las regiones de la cabeza, la región dorsal, la sacra, la glútea, la lumbar y el periné no tienen límites en las notas de Semiología; se usaron el wiki de Anatomía y la orientación clínica de cada nota. La lista `f_relato` no tiene código `n`: todas sus frases (`a1` a `a8`) quedaron definidas.
15. **Posibles faltantes en `sintoma`:** las notas describen síntomas que no están en la lista, como vómica, cornaje o estridor (07a), hipo, halitosis y prurito anal (09a), estranguria (10a), fotofobia y sonofobia (11g).
