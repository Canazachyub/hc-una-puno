# 01 · Filiación, funciones biológicas y antecedentes

> Documento de consulta del mapeo de HC App. Fuentes: seed/esquema.csv, seed/opciones.csv, seed/guias.csv y las notas de Semiología. Las definiciones y la guía son para estudiar y llenar la historia; no se imprimen en el Word.

## Resumen

- Secciones: 6 (2.1 Filiación: 22 campos; 2.3 Funciones biológicas: 10 campos; 2.4.1 Antecedentes personales: 17 campos; 2.4.2 Antecedentes fisiológicos: 24 campos; 2.4.3 Antecedentes patológicos: 12 campos; 2.4.4 Antecedentes familiares: 2 campos).
- Campos: 87 (10 obligatorios). Por tipo: Texto corto 22, Número 4, Una opción 33, Fecha 5, Una opción u otra escrita 3, Varias opciones 12, Escala 1, Texto largo 6, Párrafo redactado 1.
- Listas propias del área: 45 (43 de opciones, 1 escala y 1 de frases). No usa listas de otras áreas. Ningún campo trae valor normal en el mapeo.
- Entradas de guía: 58, todas de ámbito sección (ningún campo tiene guía propia). Por tipo: Cómo preguntar 39, Cómo conducirlo 3, Cómo interpretar 5, Valores normales 3, No olvidar 8.
- Umbrales de interpretación: 0.
- Definiciones nuevas en `datos/definiciones-01.csv`: 120 filas (76 con fuente en las notas, 44 marcadas «fuera de notas»).

Cómo usarlo: lea la guía de cada sección antes de entrevistar y siga el orden de los campos; en las tablas de opciones, la definición aclara qué significa cada término para elegir la opción correcta. Lo marcado «fuera de notas» es conocimiento estándar que no está en los apuntes y conviene confirmarlo en clase.

## 2.1 Filiación

Guía general de la sección:

**Cómo preguntar**

- ¿Cuál es su nombre completo? ¿Qué edad tiene? (02a)
- ¿A qué se dedica? ¿En su trabajo tiene contacto con polvo, insecticidas, radiación u otras sustancias? (02a)
- ¿Dónde nació y dónde vive ahora? ¿Antes vivió en otro lugar? (02a)
- ¿Cuál es su dirección y un teléfono para ubicarlo si sale algún resultado urgente? (02a)
- ¿Es soltero, casado o conviviente? ¿Qué religión tiene? ¿Hasta qué grado estudió? (02a)

**Cómo conducirlo**

- Preséntese, trate al paciente por su nombre (nunca por el número de cama) y hable con respeto, en lenguaje sencillo. (02a)
- Anote quién da la información (paciente o familiar) y si tuvo ingresos previos al hospital, por la misma u otra enfermedad. (02a)

**No olvidar**

- Edad, sexo, raza, procedencia y profesión ya orientan: zona tropical sugiere amebiasis o Chagas, pastor de ganado quiste hidatídico. (09h)

### Apellidos

| Dato | Detalle |
|---|---|
| Identificador | `fil.apellidos` |
| Tipo | Texto corto · Obligatorio: sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Nombres

| Dato | Detalle |
|---|---|
| Identificador | `fil.nombres` |
| Tipo | Texto corto · Obligatorio: sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### DNI

| Dato | Detalle |
|---|---|
| Identificador | `fil.dni` |
| Tipo | Texto corto · Obligatorio: sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Edad

| Dato | Detalle |
|---|---|
| Identificador | `fil.edad` |
| Tipo | Número · Obligatorio: sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Sexo

| Dato | Detalle |
|---|---|
| Identificador | `fil.sexo` |
| Tipo | Una opción · Obligatorio: sí |
| Lista | Sexo (`sexo`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Masculino |  |  |
| Femenino |  |  |

### Raza

| Dato | Detalle |
|---|---|
| Identificador | `fil.raza` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Raza (`raza`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Mestiza | Población de ascendencia mezclada; en la región concentra más casos de tuberculosis. | 02a |
| Quechua | Población nativa andina: la úlcera péptica es rara y la litiasis es más frecuente, sobre todo si procede del área rural. | 09h |
| Aymara | Población nativa andina: la úlcera péptica es rara y la litiasis es más frecuente, sobre todo si procede del área rural. | 09h |
| Blanca |  |  |
| Negra | Mayor frecuencia de anemia falciforme y de hipertensión arterial. | 02a; 08a |
| Asiática |  |  |
| Otra |  |  |

### Lugar de nacimiento

| Dato | Detalle |
|---|---|
| Identificador | `fil.lugar_nacimiento` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Fecha de nacimiento

| Dato | Detalle |
|---|---|
| Identificador | `fil.fecha_nacimiento` |
| Tipo | Fecha · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Lugar de procedencia

| Dato | Detalle |
|---|---|
| Identificador | `fil.lugar_procedencia` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Dirección

| Dato | Detalle |
|---|---|
| Identificador | `fil.direccion` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Nacionalidad

| Dato | Detalle |
|---|---|
| Identificador | `fil.nacionalidad` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Nacionalidad (`nacionalidad`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Peruana |  |  |
| Boliviana |  |  |
| Otra |  |  |

### Estado civil

| Dato | Detalle |
|---|---|
| Identificador | `fil.estado_civil` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Estado civil (`estado_civil`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Soltero |  |  |
| Casado |  |  |
| Conviviente | Vive en pareja sin matrimonio civil (unión de hecho). | fuera de notas |
| Viudo |  |  |
| Divorciado |  |  |
| Separado | Casado que ya no vive con su cónyuge, sin divorcio legal. | fuera de notas |

### Grado de instrucción

| Dato | Detalle |
|---|---|
| Identificador | `fil.grado_instruccion` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Grado de instrucción (`grado_instruccion`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Sin estudios |  |  |
| Primaria incompleta |  |  |
| Primaria completa |  |  |
| Secundaria incompleta |  |  |
| Secundaria completa |  |  |
| Superior técnica incompleta |  |  |
| Superior técnica completa |  |  |
| Superior universitaria incompleta |  |  |
| Superior universitaria completa |  |  |
| Posgrado |  |  |

### Ocupación

| Dato | Detalle |
|---|---|
| Identificador | `fil.ocupacion` |
| Tipo | Una opción u otra escrita · Obligatorio: no |
| Lista | Ocupación (`ocupacion`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Agricultor | Expuesto a insecticidas, que se asocian a anemia aplásica en el campesino y agravan el asma bronquial. | 02a; 02b |
| Ganadero | El pastoreo de ganado expone al quiste hidatídico. | 09h |
| Ama de casa |  |  |
| Comerciante |  |  |
| Estudiante |  |  |
| Obrero |  |  |
| Minero | Exposición a polvo mineral: neumoconiosis, que a la larga puede complicarse con corazón pulmonar crónico. | 02a; 08a |
| Construcción civil | Trabajo manual pesado, asociado a enfermedad degenerativa de la columna. | 02b |
| Chofer |  |  |
| Docente | Trabajo intelectual: se asocia a mayor secreción de ácido clorhídrico y a úlcera péptica. | 09h |
| Profesional independiente | Ejerce su profesión por cuenta propia; el trabajo intelectual se asocia a úlcera péptica. | 09h |
| Jubilado o pensionista |  |  |
| Desempleado |  |  |
| Otra |  |  |

### Idioma

| Dato | Detalle |
|---|---|
| Identificador | `fil.idioma` |
| Tipo | Varias opciones · Obligatorio: no |
| Lista | Idioma (`idioma`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Castellano |  |  |
| Quechua |  |  |
| Aymara |  |  |
| Otro |  |  |

### Religión

| Dato | Detalle |
|---|---|
| Identificador | `fil.religion` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Religión (`religion`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Católica |  |  |
| Evangélica |  |  |
| Adventista |  |  |
| Testigo de Jehová | Suele rechazar las transfusiones sanguíneas; condiciona decisiones médicas. | 02a |
| Ninguna |  |  |
| Otra |  |  |

### Informante

| Dato | Detalle |
|---|---|
| Identificador | `fil.informante` |
| Tipo | Una opción · Obligatorio: sí |
| Lista | Informante (`informante`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Directo, el propio paciente | Anamnesis directa: la información la da el propio paciente. | 02a |
| Indirecto, familiar o acompañante | Anamnesis indirecta: la da un informante cuando el paciente no puede relatar (coma, niño, enfermo mental o imposibilitado de hablar). | 02a |
| Mixto | Parte de la información la da el paciente y parte un familiar o acompañante. | fuera de notas |

### Persona responsable

| Dato | Detalle |
|---|---|
| Identificador | `fil.persona_responsable` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Celular del responsable

| Dato | Detalle |
|---|---|
| Identificador | `fil.celular_responsable` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Fecha de ingreso

| Dato | Detalle |
|---|---|
| Identificador | `fil.fecha_ingreso` |
| Tipo | Fecha · Obligatorio: sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | Fecha con hora |

### Fecha de elaboración

| Dato | Detalle |
|---|---|
| Identificador | `fil.fecha_elaboracion` |
| Tipo | Fecha · Obligatorio: sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | Fecha con hora |

### Elaborado por

| Dato | Detalle |
|---|---|
| Identificador | `fil.elaborado_por` |
| Tipo | Texto corto · Obligatorio: sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

## 2.3 Funciones biológicas

Guía general de la sección:

**Cómo preguntar**

- ¿Cómo está su apetito? ¿Come más o menos que antes? (13a)
- ¿Ha subido o bajado de peso últimamente? (02c)
- ¿Tiene más sed o más hambre de lo normal? ¿Orina más cantidad? (02c)
- ¿Cuántas veces orina al día? ¿Se levanta de noche a orinar? (10a)
- ¿Cada cuánto hace deposición? ¿Con esfuerzo o con heces duras? (09a)
- ¿Cómo duerme? ¿Necesita varias almohadas para dormir? (08a)
- ¿Siente más frío o más calor que las demás personas? ¿Suda mucho? (13a)

**Cómo interpretar**

- Oliguria: menos de 400 mililitros de orina en 24 horas. Anuria: menos de 100 mililitros en 24 horas. (10a)
- Poliuria: más de 2000 mililitros de orina en 24 horas (diabetes descompensada, diabetes insípida, diuréticos) (10a)
- Polaquiuria: micciones repetidas sin aumento del volumen total. Nicturia: aumento de las micciones nocturnas. (10a)
- Diarrea: deposiciones de menor consistencia, generalmente más frecuentes. Aguda si dura menos de un mes, crónica si dura más. (09a)
- Polifagia, polidipsia y poliuria, o intolerancia al frío, orientan a una causa endocrina en la revisión de sistemas. (02c)

**Valores normales**

- Balance hídrico normal: ingresos y pérdidas de unos 2500 mililitros al día (orina 1400, heces 100, pérdidas insensibles 1000) (05b)
- Deposiciones normales: de 3 por día a 3 por semana, formadas y sin sangre ni moco. (fuera de notas)
- Sueño del adulto: unas 7 a 8 horas. Apetito y sed conservados, sin cambios recientes. (fuera de notas)

**No olvidar**

- El edema puede ocultar el adelgazamiento: el paciente pierde masa aunque su peso se mantenga estable. (08a2)
- Una diarrea que también aparece de noche orienta a causa orgánica. La funcional respeta el sueño nocturno. (09a)
- Pérdida de peso, fiebre, fatiga o sudoración nocturna en la revisión de sistemas obligan a buscar la causa. (02c)

### Apetito

| Dato | Detalle |
|---|---|
| Identificador | `fb.apetito` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Apetito (`apetito`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Conservado |  |  |
| Disminuido (hiporexia) | Apetito disminuido sin llegar a perderse del todo. | fuera de notas |
| Ausente (anorexia) | Falta total de apetito; acompaña al síndrome febril, a la insuficiencia renal y a la congestión visceral del cardiópata. | 01; 10a; 08a2 |
| Aumentado (hiperorexia) | Apetito aumentado; si se pierde peso pese a comer más, orienta a hipertiroidismo. | 13a |

### Sed

| Dato | Detalle |
|---|---|
| Identificador | `fb.sed` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Sed (`sed`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Conservada |  |  |
| Disminuida |  |  |
| Aumentada (polidipsia) | Sed excesiva; junto con polifagia y poliuria orienta a una causa endocrina. | 02c |

### Sueño

| Dato | Detalle |
|---|---|
| Identificador | `fb.sueno` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Sueño (`sueno`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Conservado |  |  |
| No reparador | Duerme pero despierta cansado, sin sensación de descanso. | fuera de notas |
| Insomnio de conciliación | Dificultad para quedarse dormido al acostarse. | fuera de notas |
| Insomnio de mantenimiento | Despierta durante la noche y le cuesta volver a dormir; la nicturia del cardiópata interrumpe así el sueño. | 08a2 |
| Hipersomnia | Sueño excesivo o somnolencia durante el día. | fuera de notas |

### Deposiciones por día

| Dato | Detalle |
|---|---|
| Identificador | `fb.heces_frec` |
| Tipo | Número · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Consistencia (Bristol)

| Dato | Detalle |
|---|---|
| Identificador | `fb.heces_bristol` |
| Tipo | Escala · Obligatorio: no |
| Lista | Consistencia de heces (Bristol) (`bristol`) |
| Valor normal | — |
| Escalas que admite | Consistencia de heces (Bristol) |
| Reglas de redacción | — |

| Nivel | Descripción | Frase que se escribe en la historia |
|---|---|---|
| 1 | Trozos duros separados | Heces tipo 1 de la escala de Bristol |
| 2 | Forma de salchicha grumosa | Heces tipo 2 de la escala de Bristol |
| 3 | Salchicha con grietas | Heces tipo 3 de la escala de Bristol |
| 4 | Lisa y blanda | Heces tipo 4 de la escala de Bristol |
| 5 | Trozos blandos de bordes definidos | Heces tipo 5 de la escala de Bristol |
| 6 | Trozos blandos de bordes irregulares | Heces tipo 6 de la escala de Bristol |
| 7 | Líquida | Heces tipo 7 de la escala de Bristol |

### Características de las heces

| Dato | Detalle |
|---|---|
| Identificador | `fb.heces_car` |
| Tipo | Varias opciones · Obligatorio: no |
| Lista | Características de las heces (`heces_car`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Normales |  |  |
| Diarrea | Deposiciones de menor consistencia o más líquidas, generalmente más frecuentes; aguda si dura menos de un mes. | 09a |
| Estreñimiento | Evacuación difícil con heces duras, o espontánea cada 3 días o más, o que requiere laxantes. | 09a |
| Melena | Heces negras como brea por sangre alterada; indica hemorragia digestiva alta, por encima del ángulo de Treitz. | 09a |
| Hematoquecia | Sangre roja viva y escasa por el ano, de origen proctológico; casi siempre hemorragia digestiva baja. | 09e |
| Con moco | Moco en las heces; con pus o sangre es propio de la diarrea baja o colónica. | 09a |
| Con restos alimentarios | Alimentos sin digerir visibles (diarrea lientérica); traduce tránsito intestinal acelerado. | 09a |
| Acolia | Heces blanquecinas como masilla de vidriero; indica obstrucción completa de la vía biliar. | 09a |
| Tenesmo rectal | Contracción espasmódica del recto sin lograr eliminar heces; propio de la diarrea baja o colónica. | 09a |

### Volumen urinario aproximado en 24 h

| Dato | Detalle |
|---|---|
| Identificador | `fb.orina_vol` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Características de la orina

| Dato | Detalle |
|---|---|
| Identificador | `fb.orina_car` |
| Tipo | Varias opciones · Obligatorio: no |
| Lista | Características de la orina (`orina_car`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Normal |  |  |
| Disuria | Micción con dolor, ardor o tenesmo; en cistitis, uretritis, prostatitis o pielonefritis. | 10a |
| Polaquiuria | Micciones repetidas sin aumento del volumen total; en infección urinaria baja o hipertrofia benigna de próstata. | 10a |
| Nicturia | Aumento de las micciones nocturnas; por poliuria de cualquier causa, insuficiencia renal avanzada o insuficiencia cardíaca incipiente. | 10a; 08a2 |
| Hematuria | Sangre en la orina, visible o microscópica; nunca debe ignorarse y obliga a estudio urológico. | 10a |
| Coluria | Orina oscura, color caoba, por bilirrubina conjugada; acompaña a la ictericia hepatocelular u obstructiva. | 09a; 10a |
| Oliguria | Menos de 400 mililitros de orina en 24 horas; por hipovolemia o por lesión renal. | 10a |
| Poliuria | Más de 2000 mililitros de orina en 24 horas; por diabetes descompensada, diabetes insípida o diuréticos. | 10a |
| Anuria | Menos de 100 mililitros de orina en 24 horas; sugiere obstrucción bilateral de uréteres o de arterias renales. | 10a |
| Tenesmo vesical | Sensación de vaciamiento insuficiente de la vejiga, con micción lenta y dolorosa por inflamación vesical intensa. | 10a |
| Incontinencia | Eliminación involuntaria de orina; vejiga neurogénica, cistitis o prostatismo; más frecuente en multíparas. | 10a |

### Variación de peso

| Dato | Detalle |
|---|---|
| Identificador | `fb.peso_var` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Variación de peso (`peso_var`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Sin variación |  |  |
| Pérdida |  |  |
| Ganancia |  |  |

### Kilos y tiempo

| Dato | Detalle |
|---|---|
| Identificador | `fb.peso_kg` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

## 2.4.1 Antecedentes personales

Guía general de la sección:

**Cómo preguntar**

- ¿Qué come habitualmente? ¿Qué tipo de alimentos y en qué cantidad? (02b)
- ¿Fuma? ¿Cuántos cigarrillos y desde hace cuántos años? Si lo dejó, ¿hace cuánto? (02b)
- ¿Toma bebidas alcohólicas? ¿Cuáles, con qué frecuencia y desde cuándo? (02b)
- ¿Consume alguna droga, o productos del gimnasio como anabólicos o anfetaminas? (02b)
- ¿Hace ejercicio o pasa la mayor parte del día sentado? (02b)
- ¿Cómo es su vivienda? ¿De qué material es, cuántos duermen ahí y tiene agua y luz? (02b)
- ¿Cuántas personas dependen económicamente de usted? (02b)

**No olvidar**

- Alcohol, drogas y enfermedades venéreas suelen ocultarse: un no puede ser falso. Pregunte con tacto y discreción. (02b)

### Material de la vivienda

| Dato | Detalle |
|---|---|
| Identificador | `apn.vivienda_material` |
| Tipo | Varias opciones · Obligatorio: no |
| Lista | Material de la vivienda (`viv_material`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Adobe |  |  |
| Ladrillo |  |  |
| Carrizo | Caña con que se levantan paredes y techos; en zona rural estas casas son reservorio de la enfermedad de Chagas. | 02b |
| Madera |  |  |
| Techo de calamina |  |  |
| Techo de paja |  |  |
| Piso de tierra |  |  |
| Piso de cemento |  |  |

### Servicios básicos

| Dato | Detalle |
|---|---|
| Identificador | `apn.vivienda_servicios` |
| Tipo | Varias opciones · Obligatorio: no |
| Lista | Servicios básicos (`viv_servicios`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Agua de red pública |  |  |
| Agua entubada no clorada | Agua que llega por tubería sin tratamiento con cloro; no es segura para beber sin hervir. | fuera de notas |
| Agua de pozo |  |  |
| Desagüe |  |  |
| Letrina | Pozo para excretas sin conexión a la red de desagüe. | fuera de notas |
| Luz eléctrica |  |  |
| Cocina a leña o bosta | Cocina con leña o estiércol seco (bosta); expone al humo de biomasa dentro de la vivienda. | fuera de notas |
| Cocina a gas |  |  |
| Recojo de basura |  |  |

### Habitaciones y habitantes

| Dato | Detalle |
|---|---|
| Identificador | `apn.habitaciones_habitantes` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Crianza de animales

| Dato | Detalle |
|---|---|
| Identificador | `apn.crianza_animales` |
| Tipo | Varias opciones · Obligatorio: no |
| Lista | Crianza de animales (`animales`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Ninguno |  |  |
| Perros | Sus heces con huevos de Echinococcus transmiten el quiste hidatídico; sin vacuna son el principal reservorio de la rabia. | MICROBIOLOGIA 2026/clases/76b_Echinococcus_granulosus_y_multilocularis.md; MICROBIOLOGIA 2026/clases/50a_Rabdovirus_y_rabia.md |
| Gatos | Huésped definitivo de Toxoplasma gondii: los ooquistes de sus heces transmiten la toxoplasmosis. | MICROBIOLOGIA 2026/clases/73b_Babesia_y_Toxoplasma.md |
| Vacunos | Reservorio de brucelosis (leche cruda o contacto) y de Fasciola hepatica; su carne mal cocida transmite Taenia saginata. | MICROBIOLOGIA 2026/clases/29b_Brucella_y_Francisella.md; MICROBIOLOGIA 2026/clases/75a_Trematodos_intestinales_hepaticos_y_pulmonares.md; MICROBIOLOGIA 2026/clases/76a_Taenia_solium_Taenia_saginata_y_cisticercosis.md |
| Ovinos | Reservorio de Fasciola hepatica (berros contaminados) y de brucelosis; huésped intermediario del quiste hidatídico. | MICROBIOLOGIA 2026/clases/75a_Trematodos_intestinales_hepaticos_y_pulmonares.md; MICROBIOLOGIA 2026/clases/29b_Brucella_y_Francisella.md; MICROBIOLOGIA 2026/clases/76b_Echinococcus_granulosus_y_multilocularis.md |
| Camélidos | Alpacas y llamas; su pastoreo, como el de otro ganado, expone al quiste hidatídico. | 09h |
| Cuyes | Cobayos criados en casa, a veces en la cocina; su crianza dentro de la vivienda favorece las zoonosis. | fuera de notas |
| Aves de corral | Reservorio de Salmonella zoonótica: se adquiere por huevos o carne contaminados y causa gastroenteritis. | MICROBIOLOGIA 2026/clases/25c_Salmonella.md |
| Cerdos | Su carne mal cocida transmite Taenia solium y los huevos de esta tenia causan cisticercosis; también reservorio de brucelosis. | MICROBIOLOGIA 2026/clases/76a_Taenia_solium_Taenia_saginata_y_cisticercosis.md; MICROBIOLOGIA 2026/clases/29b_Brucella_y_Francisella.md |

### Residencias anteriores y viajes

| Dato | Detalle |
|---|---|
| Identificador | `apn.residencias_anteriores` |
| Tipo | Texto largo · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Menú habitual

| Dato | Detalle |
|---|---|
| Identificador | `apn.alimentacion_menu` |
| Tipo | Texto largo · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Nutriente predominante

| Dato | Detalle |
|---|---|
| Identificador | `apn.nutriente_predominante` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Nutriente predominante (`nutriente`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Carbohidratos |  |  |
| Proteínas |  |  |
| Grasas |  |  |
| Mixta |  |  |

### Intolerancia alimentaria

| Dato | Detalle |
|---|---|
| Identificador | `apn.intolerancia` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Vestimenta

| Dato | Detalle |
|---|---|
| Identificador | `apn.vestimenta` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Vestimenta (`vestimenta`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Adecuada al clima |  |  |
| Inadecuada al clima |  |  |

### Higiene

| Dato | Detalle |
|---|---|
| Identificador | `apn.higiene` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Higiene (`higiene`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Buena |  |  |
| Regular |  |  |
| Deficiente |  |  |

### Deporte y actividad física

| Dato | Detalle |
|---|---|
| Identificador | `apn.deporte` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Deporte y actividad física (`actividad`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Sedentario | Pasa la mayor parte del día sentado; se asocia a mayor incidencia de infarto de miocardio. | 02b |
| Actividad física ligera | Esfuerzo leve, como caminar despacio o tareas domésticas; casi no acelera la respiración. | fuera de notas |
| Actividad física moderada | Esfuerzo que acelera la respiración pero permite conversar, como caminar rápido. | fuera de notas |
| Actividad física intensa | Esfuerzo que impide conversar con fluidez, como correr o jugar fútbol. | fuera de notas |
| Trabajo físico pesado | Trabajo manual con carga o esfuerzo sostenido; se asocia a enfermedad degenerativa de la columna. | 02b |

### Tabaco

| Dato | Detalle |
|---|---|
| Identificador | `apn.tabaco` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Tabaco (`tabaco`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| No fuma |  |  |
| Exfumador | Fumó y dejó de hacerlo; anotar años de consumo y tiempo de abstinencia. | 02b |
| Fumador activo |  |  |

### Cigarrillos por día y años

| Dato | Detalle |
|---|---|
| Identificador | `apn.tabaco_detalle` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Alcohol

| Dato | Detalle |
|---|---|
| Identificador | `apn.alcohol` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Alcohol (`alcohol`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| No consume |  |  |
| Consumo ocasional o social | Bebe de forma esporádica, en reuniones o fiestas. | fuera de notas |
| Consumo frecuente | Bebe varias veces por semana sin llegar a hacerlo a diario. | fuera de notas |
| Consumo diario |  |  |
| Exbebedor | Bebía y dejó de hacerlo; anotar tipo de bebida, tiempo de consumo y tiempo de abstinencia. | 02b |

### Tipo, cantidad y tiempo

| Dato | Detalle |
|---|---|
| Identificador | `apn.alcohol_detalle` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Café, mate y té

| Dato | Detalle |
|---|---|
| Identificador | `apn.cafe_mate_te` |
| Tipo | Varias opciones · Obligatorio: no |
| Lista | Café, mate y té (`bebidas`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Ninguno |  |  |
| Café |  |  |
| Mate de coca |  |  |
| Té |  |  |
| Otras infusiones |  |  |

### Tóxicos y exposiciones

| Dato | Detalle |
|---|---|
| Identificador | `apn.toxicos` |
| Tipo | Varias opciones · Obligatorio: no |
| Lista | Tóxicos y exposiciones (`toxicos`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Ninguno |  |  |
| Plaguicidas | Insecticidas y otros agroquímicos; se asocian a anemia aplásica y agravan el asma bronquial. | 02a; 02b |
| Humo de biomasa | Humo de leña o bosta al cocinar dentro de la vivienda; daña las vías respiratorias. | fuera de notas |
| Polvo mineral o sílice | Polvo inhalado en la minería; produce neumoconiosis y, a la larga, corazón pulmonar crónico. | 02a; 08a |
| Solventes | Thinner, pinturas o pegamentos, por exposición laboral o inhalados como droga. | fuera de notas |
| Radiación | Exposición laboral o médica a radiación; se asocia a leucemia. | 02a |
| Drogas ilícitas | Opiáceos, cocaína o terokal (cola de zapatero); consumo creciente en adolescentes. Suele ocultarse. | 02b |
| Anabolizantes | Hormonas usadas en gimnasios; causan dependencia y daño hepático, renal, cardíaco y endocrino. | 02b |

## 2.4.2 Antecedentes fisiológicos

Guía general de la sección:

**Cómo preguntar**

- ¿Sabe si su mamá tuvo alguna infección (como rubéola) o tomó medicamentos durante el embarazo? (02b)
- ¿Nació por parto normal o por cesárea? ¿Qué número de hijo es? (02b)
- ¿A qué edad le salieron los dientes, gateó, caminó y dijo sus primeras palabras? (02b)
- ¿Cómo le fue en el colegio? ¿A qué edad empezó su pubertad? (02b)
- ¿A qué edad tuvo su primera regla? ¿Cada cuánto le viene, cuántos días dura y le duele? (02b)
- ¿Cuándo fue su última regla? ¿Cuántos embarazos, partos y abortos ha tenido? (02b)
- ¿Usa algún método anticonceptivo? ¿Cuándo se hizo su último Papanicolaou? (02a)

**No olvidar**

- Si está embarazada, evite rayos X e isótopos: muchos fármacos son teratógenos, sobre todo en el primer trimestre. (08a2)

### Patologías en la gestación

| Dato | Detalle |
|---|---|
| Identificador | `afi.prenatales_patologias` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Control prenatal

| Dato | Detalle |
|---|---|
| Identificador | `afi.prenatales_control` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Control prenatal (`control_prenatal`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Sin control |  |  |
| Menos de 6 controles | Control prenatal insuficiente: la norma peruana considera controlada a la gestante con al menos 6 atenciones. | fuera de notas |
| 6 o más controles | Gestante controlada según la norma peruana. | fuera de notas |
| No recuerda |  |  |

### Edad gestacional

| Dato | Detalle |
|---|---|
| Identificador | `afi.edad_gestacional` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Edad gestacional (`edad_gest`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| A término | Nacido entre las 37 y las 41 semanas completas de gestación. | fuera de notas |
| Pretérmino | Nacido antes de las 37 semanas de gestación (prematuro). | fuera de notas |
| Postérmino | Nacido a las 42 semanas de gestación o después. | fuera de notas |
| No recuerda |  |  |

### Tipo de parto

| Dato | Detalle |
|---|---|
| Identificador | `afi.parto` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Tipo de parto (`parto`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Eutócico | Parto vaginal espontáneo, sin complicaciones ni instrumentos. | fuera de notas |
| Distócico | Parto vaginal con dificultad o complicación durante su evolución. | fuera de notas |
| Cesárea |  |  |
| Fórceps | Parto vaginal asistido con fórceps, instrumento que ayuda a extraer la cabeza fetal. | fuera de notas |
| No recuerda |  |  |

### Lugar del parto

| Dato | Detalle |
|---|---|
| Identificador | `afi.parto_lugar` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Lugar del parto (`parto_lugar`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Domiciliario | Parto atendido en casa, por lo general sin personal de salud. | fuera de notas |
| Institucional | Parto atendido en un establecimiento de salud. | fuera de notas |
| No recuerda |  |  |

### Lactancia y ablactancia

| Dato | Detalle |
|---|---|
| Identificador | `afi.lactancia_ablactancia` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Primeros pasos

| Dato | Detalle |
|---|---|
| Identificador | `afi.primeros_pasos` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Hito del desarrollo (`hito`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Normal para la edad |  |  |
| Retrasado | El hito se logró después de la edad esperada; es un dato del desarrollo psicomotor y neurológico. | 02b |
| No recuerda |  |  |

### Dentición

| Dato | Detalle |
|---|---|
| Identificador | `afi.denticion` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Hito del desarrollo (`hito`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

Opciones: ver Primeros pasos.

### Primeras palabras

| Dato | Detalle |
|---|---|
| Identificador | `afi.primeras_palabras` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Hito del desarrollo (`hito`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

Opciones: ver Primeros pasos.

### Control de esfínteres

| Dato | Detalle |
|---|---|
| Identificador | `afi.control_esfinteres` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Hito del desarrollo (`hito`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

Opciones: ver Primeros pasos.

### Inicio de vida sexual

| Dato | Detalle |
|---|---|
| Identificador | `afi.vida_sexual_inicio` |
| Tipo | Número · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Hábitos de riesgo y número de parejas

| Dato | Detalle |
|---|---|
| Identificador | `afi.vida_sexual_riesgo` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Menarquia

| Dato | Detalle |
|---|---|
| Identificador | `afi.menarquia` |
| Tipo | Número · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Régimen catamenial (días/ciclo)

| Dato | Detalle |
|---|---|
| Identificador | `afi.regimen_catamenial` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Características del catamenial

| Dato | Detalle |
|---|---|
| Identificador | `afi.caracteristicas_catamenial` |
| Tipo | Varias opciones · Obligatorio: no |
| Lista | Características del catamenial (`catamenial`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Regular |  |  |
| Irregular | La duración del ciclo menstrual cambia de un mes a otro. | fuera de notas |
| Dismenorrea | Menstruación dolorosa. | fuera de notas |
| Con coágulos | Expulsión de coágulos con el sangrado menstrual; suele acompañar a la hipermenorrea. | fuera de notas |
| Hipermenorrea | Sangrado menstrual excesivo en cantidad, con ciclos de duración normal. | fuera de notas |
| Hipomenorrea | Sangrado menstrual escaso en cantidad. | fuera de notas |

### Fecha de última regla

| Dato | Detalle |
|---|---|
| Identificador | `afi.fur` |
| Tipo | Fecha · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Fecha de último parto

| Dato | Detalle |
|---|---|
| Identificador | `afi.fup` |
| Tipo | Fecha · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Fórmula obstétrica (gestaciones y partos)

| Dato | Detalle |
|---|---|
| Identificador | `afi.formula_obstetrica` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Anticonceptivos

| Dato | Detalle |
|---|---|
| Identificador | `afi.anticonceptivos` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Anticonceptivo (`anticonceptivo`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Ninguno |  |  |
| Ampolla mensual | Inyectable combinado de estrógeno y progestágeno, aplicado cada mes. | fuera de notas |
| Ampolla trimestral | Inyectable solo de progestágeno (medroxiprogesterona de depósito), aplicado cada tres meses. | fuera de notas |
| Píldora | Anticonceptivo oral; junto con el tabaco predispone a hipertensión arterial y a enfermedad tromboembólica. | 08a2 |
| DIU | Dispositivo intrauterino, por ejemplo de cobre, colocado dentro del útero. | fuera de notas |
| Implante | Barra flexible con progestágeno colocada bajo la piel del brazo; dura varios años. | fuera de notas |
| Ligadura de trompas |  |  |
| Preservativo |  |  |
| Otro |  |  |

### Menopausia

| Dato | Detalle |
|---|---|
| Identificador | `afi.menopausia` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Sí o no (`si_no_nr`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| No refiere |  |  |
| Sí |  |  |
| No recuerda |  |  |

### Último Papanicolau

| Dato | Detalle |
|---|---|
| Identificador | `afi.papanicolau` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Último Papanicolau (`papanicolau`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Nunca se realizó |  |  |
| Hace menos de 1 año |  |  |
| De 1 a 3 años |  |  |
| Hace más de 3 años |  |  |
| No recuerda |  |  |

### Inmunizaciones

| Dato | Detalle |
|---|---|
| Identificador | `afi.inmunizaciones` |
| Tipo | Varias opciones · Obligatorio: no |
| Lista | Inmunizaciones (`inmunizaciones`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Esquema completo | Todas las vacunas del calendario nacional para su edad, verificadas en el carné. | fuera de notas |
| BCG | Vacuna del bacilo de Calmette-Guérin contra la tuberculosis; puede volver positiva la prueba de tuberculina. | 07g |
| Antitetánica | Toxoide tetánico; se aplica en gestantes y después de heridas con riesgo de tétanos. | fuera de notas |
| Influenza |  |  |
| Neumococo | Vacuna antineumocócica, indicada en niños, adultos mayores y enfermos crónicos. | fuera de notas |
| COVID-19 | Vacuna contra la enfermedad por coronavirus 2019. | fuera de notas |
| Hepatitis B |  |  |
| No recuerda |  |  |
| No porta carné |  |  |

### Alergias

| Dato | Detalle |
|---|---|
| Identificador | `afi.alergias` |
| Tipo | Una opción u otra escrita · Obligatorio: sí |
| Lista | Sí o no (`si_no_nr`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

Opciones: ver Menopausia.

### Transfusiones

| Dato | Detalle |
|---|---|
| Identificador | `afi.transfusiones` |
| Tipo | Una opción u otra escrita · Obligatorio: no |
| Lista | Sí o no (`si_no_nr`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

Opciones: ver Menopausia.

## 2.4.3 Antecedentes patológicos

Guía general de la sección:

**Cómo preguntar**

- ¿Qué enfermedades tuvo de niño: sarampión, varicela, rubéola, tos convulsiva, paperas, amigdalitis, fiebre reumática? (02b)
- ¿Le han dicho que tiene presión alta, diabetes, tuberculosis, hepatitis, cálculos en el riñón u otra enfermedad? (02b)
- ¿Es alérgico a algún alimento, medicamento u otra sustancia? (02b)
- ¿Lo han operado? ¿Cuándo, de qué y en qué hospital? ¿Ha tenido accidentes o fracturas? (02b)
- ¿Le han puesto sangre alguna vez? ¿Cuándo, dónde y por qué? (02b)
- ¿Qué vacunas ha recibido y cuándo? (02b)
- ¿Qué medicamentos toma? ¿En qué dosis, para qué y se los recetó un médico o los tomó por su cuenta? (02b)

**No olvidar**

- Amigdalitis a repetición y dolores articulares que cambian de lugar en la infancia orientan a fiebre reumática. (08a2)

### Hipertensión arterial

| Dato | Detalle |
|---|---|
| Identificador | `apa.hta` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Hipertensión arterial (`hta_dx`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Niega |  |  |
| Sí, en tratamiento |  |  |
| Sí, sin tratamiento |  |  |
| Sí, abandonó tratamiento |  |  |

### Año, cifras y tratamiento

| Dato | Detalle |
|---|---|
| Identificador | `apa.hta_detalle` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Diabetes mellitus

| Dato | Detalle |
|---|---|
| Identificador | `apa.diabetes` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Diabetes mellitus (`dm_dx`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Niega |  |  |
| Tipo 1 | Destrucción de las células beta con déficit grave o absoluto de insulina; mayor riesgo de cetoacidosis. | FARMACOLOGIA 2026/clases/41a_Insulina_glucagon_diabetes_mellitus.md |
| Tipo 2 | Resistencia a la insulina con déficit relativo de su secreción, sin perder toda la reserva de células beta. | FARMACOLOGIA 2026/clases/41a_Insulina_glucagon_diabetes_mellitus.md |
| Gestacional previa | Alteración de la glucosa detectada por primera vez durante un embarazo anterior. | FARMACOLOGIA 2026/clases/41a_Insulina_glucagon_diabetes_mellitus.md |
| Sí, sin precisar tipo |  |  |

### Año, tratamiento y último control

| Dato | Detalle |
|---|---|
| Identificador | `apa.diabetes_detalle` |
| Tipo | Texto corto · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Asma bronquial

| Dato | Detalle |
|---|---|
| Identificador | `apa.asma` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Asma bronquial (`asma_dx`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Niega |  |  |
| Sí, en tratamiento |  |  |
| Sí, sin tratamiento |  |  |

### Otras patologías

| Dato | Detalle |
|---|---|
| Identificador | `apa.otras_patologias` |
| Tipo | Varias opciones · Obligatorio: no |
| Lista | Otras patologías (`patologias`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Tuberculosis |  |  |
| Hepatitis |  |  |
| Neumonía |  |  |
| Gastritis |  |  |
| Úlcera péptica | Más frecuente en varones y en trabajadores intelectuales, por mayor secreción de ácido clorhídrico; puede sangrar y dar melena. | 09h |
| Litiasis renal | Cálculos en las vías urinarias; se manifiesta con cólico renal y hematuria. | 10a |
| Litiasis biliar | Cálculos en la vesícula (colelitiasis); predomina en la mujer y puede complicarse hacia el páncreas. | 09h |
| Artrosis | Enfermedad degenerativa de las articulaciones, propia del anciano (osteoartrosis). | 02a |
| Gota | Artritis por depósito de cristales de ácido úrico. | fuera de notas |
| Osteoporosis | Pérdida de masa ósea con fragilidad y riesgo de fracturas. | fuera de notas |
| Hipotiroidismo | Déficit de hormona tiroidea con metabolismo enlentecido: cansancio, intolerancia al frío, aumento de peso, piel seca y bradicardia. | 13a |
| Hipertiroidismo | Exceso de hormona tiroidea con metabolismo acelerado: intolerancia al calor, sudoración, pérdida de peso y taquicardia. | 13a |
| Accidente cerebrovascular | Daño cerebral isquémico o hemorrágico; es una de las complicaciones de la hipertensión arterial. | 08g |
| Infarto de miocardio |  |  |
| Insuficiencia cardíaca | Incapacidad del corazón para mantener un gasto adecuado a las necesidades de los tejidos. | 08g |
| EPOC | Enfermedad pulmonar obstructiva crónica; la desencadena el tabaquismo y a la larga produce hipertensión pulmonar. | 08a2 |
| Cáncer |  |  |
| VIH | Infección por el virus de la inmunodeficiencia humana; puede adquirirse también por transfusiones. | 02b |
| Enfermedad renal crónica | Pérdida progresiva e irreversible de la función renal; sus primeras causas son la diabetes y la hipertensión arterial. | 10c; 10a |
| Ninguna |  |  |

### Detalle en orden cronológico

| Dato | Detalle |
|---|---|
| Identificador | `apa.otras_detalle` |
| Tipo | Texto largo · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Uso de medicamentos

| Dato | Detalle |
|---|---|
| Identificador | `apa.medicamentos` |
| Tipo | Texto largo · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Adherencia al tratamiento

| Dato | Detalle |
|---|---|
| Identificador | `apa.adherencia` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Adherencia al tratamiento (`adherencia`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Buena |  |  |
| Irregular | Toma el tratamiento con olvidos, pausas o fuera de horario. | fuera de notas |
| Abandonó el tratamiento | Dejó el tratamiento; indagar el costo, porque los fármacos caros en enfermedades crónicas llevan al abandono. | 02b |

### Cirugías

| Dato | Detalle |
|---|---|
| Identificador | `apa.cirugias` |
| Tipo | Texto largo · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Traumatismos

| Dato | Detalle |
|---|---|
| Identificador | `apa.traumatismos` |
| Tipo | Texto largo · Obligatorio: no |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

### Duración de la enfermedad

| Dato | Detalle |
|---|---|
| Identificador | `apa.duracion_enfermedad` |
| Tipo | Una opción · Obligatorio: no |
| Lista | Duración de la enfermedad (`duracion_enf`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Agudo, hasta 3 meses |  |  |
| Subagudo, de 3 meses a 1 año |  |  |
| Subcrónico, de 1 a 5 años |  |  |
| Crónico, más de 5 años |  |  |

## 2.4.4 Antecedentes familiares

Guía general de la sección:

**Cómo preguntar**

- ¿Sus padres, hermanos, pareja e hijos están sanos? ¿Qué edad tienen? Si alguno falleció, ¿de qué murió? (02b)
- ¿Algún familiar ha tenido una enfermedad parecida a la suya? (02b)
- ¿En su familia hay presión alta, diabetes, cáncer, asma, migraña, epilepsia o problemas del corazón? (02b)
- ¿Y derrame cerebral, colesterol alto, úlcera, cálculos en la vesícula o várices? (02b)
- ¿Vive o ha vivido con alguien que tenga tuberculosis? (02b)
- ¿Tiene contacto con animales o mascotas? (02b)

**Cómo conducirlo**

- No olvide preguntar por tíos y abuelos, tanto paternos como maternos. (02b)

**No olvidar**

- Si sospecha una enfermedad estrictamente hereditaria (hemofilia, riñón poliquístico), haga un árbol genealógico riguroso. (02b)

### Antecedentes familiares

| Dato | Detalle |
|---|---|
| Identificador | `afa.familiares` |
| Tipo | Párrafo redactado · Obligatorio: no |
| Lista | Frases · familiares (`f_familiares`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | En tercera persona |

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| `a1` | Padre con antecedente de | Carga hereditaria paterna: si el padre tuvo hipertensión arterial, aumenta la probabilidad de que el paciente la desarrolle. | 02b |
| `a2` | Madre con antecedente de | Carga hereditaria materna; las enfermedades de la madre durante el embarazo se relacionan con cardiopatías congénitas del hijo. | 02b; 08a2 |
| `a3` | Hermano con antecedente de | Enfermedad en un hermano: sugiere carga hereditaria o exposición compartida, como la convivencia con un enfermo de tuberculosis. | 02b |
| `a4` | Hermana con antecedente de | Enfermedad en una hermana: sugiere carga hereditaria o exposición compartida, como la convivencia con un enfermo de tuberculosis. | 02b |
| `a5` | Abuelos con antecedente de | Antecedente en la segunda generación; precisar si el abuelo es paterno o materno. | 02b |
| `a6` | No refiere antecedentes familiares de importancia. | Interrogatorio familiar negativo para enfermedades hereditarias y para convivencia con enfermos. | 02b |

### Parientes con antecedente

| Dato | Detalle |
|---|---|
| Identificador | `afa.parentescos` |
| Tipo | Varias opciones · Obligatorio: no |
| Lista | Parentesco (`parentesco`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | — |

| Opción | Definición | Fuente |
|---|---|---|
| Padre |  |  |
| Madre |  |  |
| Hermano o hermana |  |  |
| Hijo o hija |  |  |
| Cónyuge |  |  |
| Abuelo paterno |  |  |
| Abuela paterna |  |  |
| Abuelo materno |  |  |
| Abuela materna |  |  |
| Tío o tía |  |  |

## Listas complementarias

Todas las listas del paquete ya se mostraron junto al primer campo que las usa. Índice para ubicarlas y ver dónde más se usan (las listas `bristol` y `f_familiares` incluidas):

| Lista | Tipo | Opciones | Dónde se muestra | Campos que la usan |
|---|---|---|---|---|
| Sexo (`sexo`) | Opciones | 2 | Sexo | `fil.sexo` |
| Raza (`raza`) | Opciones | 7 | Raza | `fil.raza` |
| Nacionalidad (`nacionalidad`) | Opciones | 3 | Nacionalidad | `fil.nacionalidad` |
| Estado civil (`estado_civil`) | Opciones | 6 | Estado civil | `fil.estado_civil` |
| Grado de instrucción (`grado_instruccion`) | Opciones | 10 | Grado de instrucción | `fil.grado_instruccion` |
| Ocupación (`ocupacion`) | Opciones | 14 | Ocupación | `fil.ocupacion` |
| Idioma (`idioma`) | Opciones | 4 | Idioma | `fil.idioma` |
| Religión (`religion`) | Opciones | 6 | Religión | `fil.religion` |
| Informante (`informante`) | Opciones | 3 | Informante | `fil.informante` |
| Duración de la enfermedad (`duracion_enf`) | Opciones | 4 | Duración de la enfermedad | `apa.duracion_enfermedad` |
| Apetito (`apetito`) | Opciones | 4 | Apetito | `fb.apetito` |
| Sed (`sed`) | Opciones | 3 | Sed | `fb.sed` |
| Sueño (`sueno`) | Opciones | 5 | Sueño | `fb.sueno` |
| Características de las heces (`heces_car`) | Opciones | 9 | Características de las heces | `fb.heces_car` |
| Características de la orina (`orina_car`) | Opciones | 11 | Características de la orina | `fb.orina_car` |
| Variación de peso (`peso_var`) | Opciones | 3 | Variación de peso | `fb.peso_var` |
| Material de la vivienda (`viv_material`) | Opciones | 8 | Material de la vivienda | `apn.vivienda_material` |
| Servicios básicos (`viv_servicios`) | Opciones | 9 | Servicios básicos | `apn.vivienda_servicios` |
| Crianza de animales (`animales`) | Opciones | 9 | Crianza de animales | `apn.crianza_animales` |
| Nutriente predominante (`nutriente`) | Opciones | 4 | Nutriente predominante | `apn.nutriente_predominante` |
| Vestimenta (`vestimenta`) | Opciones | 2 | Vestimenta | `apn.vestimenta` |
| Higiene (`higiene`) | Opciones | 3 | Higiene | `apn.higiene` |
| Deporte y actividad física (`actividad`) | Opciones | 5 | Deporte y actividad física | `apn.deporte` |
| Tabaco (`tabaco`) | Opciones | 3 | Tabaco | `apn.tabaco` |
| Alcohol (`alcohol`) | Opciones | 5 | Alcohol | `apn.alcohol` |
| Café, mate y té (`bebidas`) | Opciones | 5 | Café, mate y té | `apn.cafe_mate_te` |
| Tóxicos y exposiciones (`toxicos`) | Opciones | 8 | Tóxicos y exposiciones | `apn.toxicos` |
| Control prenatal (`control_prenatal`) | Opciones | 4 | Control prenatal | `afi.prenatales_control` |
| Edad gestacional (`edad_gest`) | Opciones | 4 | Edad gestacional | `afi.edad_gestacional` |
| Tipo de parto (`parto`) | Opciones | 5 | Tipo de parto | `afi.parto` |
| Lugar del parto (`parto_lugar`) | Opciones | 3 | Lugar del parto | `afi.parto_lugar` |
| Hito del desarrollo (`hito`) | Opciones | 3 | Primeros pasos | `afi.primeros_pasos`, `afi.denticion`, `afi.primeras_palabras`, `afi.control_esfinteres` |
| Características del catamenial (`catamenial`) | Opciones | 6 | Características del catamenial | `afi.caracteristicas_catamenial` |
| Anticonceptivo (`anticonceptivo`) | Opciones | 9 | Anticonceptivos | `afi.anticonceptivos` |
| Sí o no (`si_no_nr`) | Opciones | 3 | Menopausia | `afi.menopausia`, `afi.alergias`, `afi.transfusiones` |
| Último Papanicolau (`papanicolau`) | Opciones | 5 | Último Papanicolau | `afi.papanicolau` |
| Inmunizaciones (`inmunizaciones`) | Opciones | 9 | Inmunizaciones | `afi.inmunizaciones` |
| Hipertensión arterial (`hta_dx`) | Opciones | 4 | Hipertensión arterial | `apa.hta` |
| Diabetes mellitus (`dm_dx`) | Opciones | 5 | Diabetes mellitus | `apa.diabetes` |
| Asma bronquial (`asma_dx`) | Opciones | 3 | Asma bronquial | `apa.asma` |
| Otras patologías (`patologias`) | Opciones | 20 | Otras patologías | `apa.otras_patologias` |
| Adherencia al tratamiento (`adherencia`) | Opciones | 3 | Adherencia al tratamiento | `apa.adherencia` |
| Parentesco (`parentesco`) | Opciones | 10 | Parientes con antecedente | `afa.parentescos` |
| Consistencia de heces (Bristol) (`bristol`) | Escala | 7 | Consistencia (Bristol) | `ea.relato_cronologico` (otra área), `fb.heces_bristol`, `evo.evolucion` (otra área) |
| Frases · familiares (`f_familiares`) | Frases | 6 | Antecedentes familiares | `afa.familiares` |

## Discrepancias y pendientes

- **Guías en otra sección que su campo.** Las preguntas de alergias, transfusiones y vacunas están en 2.4.3 Antecedentes patológicos (como en la nota 02b), pero los campos `afi.alergias`, `afi.transfusiones` y `afi.inmunizaciones` están en 2.4.2 Antecedentes fisiológicos. La pregunta de contacto con animales está en 2.4.4 Antecedentes familiares (02b la pone ahí), pero el campo `apn.crianza_animales` está en 2.4.1. Conviene mover la guía o el campo para que coincidan.
- **Guía de deposiciones marcada «fuera de notas» sin serlo.** La nota 09a dice que el ritmo normal va de 3 evacuaciones al día a 1 cada 3 días, sin esfuerzo y con heces de consistencia normal; la guía dice «de 3 por día a 3 por semana». Ajustar el texto a 09a y cambiar su fuente.
- **Volumen urinario sin valor de referencia.** La nota 10a da 800 a 1800 mililitros en 24 horas (término medio 1400) y la capacidad vesical de 350 a 450 mililitros; el campo `fb.orina_vol` no tiene valor normal y la guía de balance hídrico (05b) solo menciona los 1400 mililitros.
- **Nicturia definida de dos formas.** La nota 10a la define como aumento del número de micciones nocturnas; la nota 08a2, como aumento del volumen urinario nocturno. La guía usa la de 10a.
- **Duración de la enfermedad: dos clasificaciones.** La lista `duracion_enf` usa la de 2020 en cuatro niveles (02b). La nota 02a advierte que los apuntes de 2018 usan otra regla para el tiempo de enfermedad del motivo de consulta (agudo hasta 10 días, crónico más de 60 días). Si la lista se reutiliza en la enfermedad actual, aclarar cuál aplica.
- **Tipo de parto.** La nota 02b nombra eutócico, cesárea y con fórceps; «Distócico» no aparece en las notas. Además, en 02b el tipo de parto se refiere al nacimiento del propio paciente, mientras que la misma sección tiene fecha de último parto y fórmula obstétrica (partos de la paciente): la etiqueta «Tipo de parto» puede confundirse. Sugerencia: «Tipo de parto al nacer» y «Lugar del parto al nacer».
- **Fórmula obstétrica incompleta.** La etiqueta dice «(gestaciones y partos)», pero 02b pide número de embarazos, partos y abortos, y la guía también pregunta por abortos.
- **Hitos del desarrollo.** La nota 02b pide edad de dentición, gateo, marcha y primeras palabras; el mapeo no tiene gateo y agrega control de esfínteres, que no está en las notas. Las edades esperadas de cada hito no están en las notas, por eso la lista `hito` no puede definir «Normal para la edad» con cifras.
- **Datos de 02b sin campo.** Orden de nacimiento, peso y tamaño al nacer, rendimiento escolar, edad de la pubertad, número de personas que dependen económicamente del paciente, salario aproximado, nivel cultural (bajo, medio o elevado) y vida conyugal. Tres preguntas de la guía («¿Qué número de hijo es?», «¿Cómo le fue en el colegio? ¿A qué edad empezó su pubertad?» y «¿Cuántas personas dependen económicamente de usted?») no tienen dónde anotarse. La nota 02a también pide las admisiones previas al hospital (guía «Anote quién da la información… y si tuvo ingresos previos») y el teléfono del propio paciente; el mapeo solo tiene el celular del responsable.
- **Otras patologías.** La nota 02b lista enfermedades de la infancia (sarampión, varicela, rubéola, tos ferina, parotiditis, fiebre reumática, amigdalitis) y malaria, que no están en la lista `patologias`; la guía (08a2) insiste en la fiebre reumática. Tuberculosis, hepatitis, neumonía, gastritis, infarto de miocardio y cáncer quedaron sin definición por ser evidentes.
- **Escala de Bristol sin fuente.** La escala `bristol` (descripciones de los 7 tipos) no aparece en las notas de Semiología, Fisiología ni Fisiopatología; 09a solo describe el estreñimiento (heces duras) y la diarrea (heces de menor consistencia). Sus descripciones deben tratarse como «fuera de notas».
- **Tóxicos.** La nota 02b agrupa «anabolizantes y anfetaminas»; la lista solo tiene Anabolizantes. «Humo de biomasa» y «Solventes» no aparecen en las notas. La intoxicación por plomo sí aparece (09a, 06b) y no está en la lista.
- **Características de las heces.** Las notas 09a y 09e distinguen enterorragia (sangre roja, mayor volumen) de hematoquecia (sangre roja viva, escasa, de origen proctológico); la lista solo tiene Hematoquecia. Faltan hipocolia (09a, ictericia hepatocelular) y esteatorrea (09d).
- **Características de la orina.** La nota 10a incluye urgencia miccional, retención urinaria, orina turbia o piuria, orina con espuma (proteinuria) y orina de mal olor; no están en la lista `orina_car`.
- **Sueño.** La guía pregunta si necesita varias almohadas para dormir (ortopnea, 08a), pero la lista `sueno` no tiene esa opción. Los subtipos de insomnio, el sueño no reparador y la hipersomnia no aparecen en las notas (solo «insomnio» en 08a, 08a2 y 13a); las definiciones del archivo van marcadas «fuera de notas». La guía de 7 a 8 horas de sueño está bien marcada como fuera de notas.
- **Funciones biológicas sin campo para la termorregulación.** La guía pregunta por intolerancia al frío o al calor y sudoración (13a), pero no hay campo para anotarlo.
- **Apetito.** Los términos hiporexia e hiperorexia no aparecen en las notas; 13a habla de «mayor apetito» en el hipertiroidismo y la anorexia se nombra como síntoma (01, 08a2, 10a) sin definirse.
- **Régimen catamenial.** La nota 02b solo nombra la dismenorrea; regular, irregular, con coágulos, hipermenorrea e hipomenorrea se definieron «fuera de notas». No hay opción de amenorrea, que 13a menciona en el hipotiroidismo.
- **Abreviaturas en el mapeo.** La etiqueta «DNI» y los valores «DIU», «BCG», «EPOC», «VIH» y «COVID-19» contradicen la regla de escribir sin siglas. Propuesta: «Documento nacional de identidad», «Dispositivo intrauterino», «Vacuna del bacilo de Calmette-Guérin», «Enfermedad pulmonar obstructiva crónica», «Infección por el virus de la inmunodeficiencia humana» y «Enfermedad por coronavirus 2019».
- **Ortografía.** El campo y la lista dicen «Papanicolau»; la guía y la nota 02a escriben «Papanicolaou».
- **Negación no uniforme.** La lista `si_no_nr` usa «No refiere», mientras que `hta_dx`, `dm_dx` y `asma_dx` usan «Niega». La menopausia usa la lista «Sí o no» con «No refiere», que suena poco natural para ese dato (mejor «No» o la edad de la menopausia).
- **Frases de antecedentes familiares.** En `f_familiares` la frase está guardada en la etiqueta y el formato de salida está vacío; no hay código `n` (el «normal» es `a6`) y el orden empieza en 20. Faltan frases para cónyuge, hijos y tíos, que 02b pide explícitamente junto con abuelos paternos y maternos; `a5` no distingue la línea paterna de la materna.
- **Opciones sin respaldo en las notas.** Informante «Mixto» (02a solo describe directa e indirecta), crianza de «Camélidos» y «Cuyes» (las notas solo hablan de pastores de ganado y de contacto con animales), control prenatal con corte en 6 atenciones, edad gestacional y lugar del parto.
- **Detalle de hábitos incompleto.** La nota 02b pide marca, frecuencia, años de consumo y tiempo de abstinencia del tabaco, y tipo, frecuencia, tiempo de consumo y tiempo de abstinencia del alcohol; los campos de detalle no piden la abstinencia (la guía sí pregunta «Si lo dejó, ¿hace cuánto?»).
- **Grado de instrucción y raza.** La nota 02b distingue analfabeto de alfabetizado; «Sin estudios» no equivale necesariamente a analfabeto. En raza, las notas hablan de raza mestiza, negra y de población nativa (02a, 09h); «Quechua» y «Aymara» son pueblos originarios que se repiten en la lista de idioma.
