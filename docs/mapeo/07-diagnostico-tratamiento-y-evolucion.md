# 07 · Diagnóstico, síndromes, tratamiento, plan de trabajo y evolución

> Documento de consulta del mapeo de HC App. Fuentes: seed/esquema.csv, seed/opciones.csv, seed/guias.csv y las notas de Semiología. Las definiciones y la guía son para estudiar y llenar la historia; no se imprimen en el Word.

## Resumen

Esta área cierra la historia clínica: reúne los datos positivos en el **resumen semiológico**, los convierte en **diagnósticos** (presuntivo, sindrómico y diferencial) y deja por escrito qué se hace con el paciente: **tratamiento**, **plan de trabajo** (exámenes) y **evolución** diaria. Los diagnósticos se escriben como listas de líneas; tratamiento, plan y evolución se arman con frases prediseñadas que el estudiante completa.

- Secciones: 4 (IV. Diagnóstico, V. Tratamiento, VI. Plan de trabajo, VII. Evolución).
- Campos: 7 (2 obligatorios: resumen semiológico y diagnóstico presuntivo). Por tipo: Párrafo redactado 4, Lista de puntos 3.
- Listas propias: 6. Frases: `f_tratamiento` (7), `f_plan` (15), `f_evolucion` (6). Escalas: `nyha` (4 niveles), `mmrc` (5), `ecog` (5).
- Listas de otras áreas que usa: `eva` (área 03), `godet` (área 06), `levine` (área 05), `bristol` (área 01), `deshidratacion` (área 03), `conciencia` (área 03).
- Guías: 119 filas; 87 son cuadros de síndromes (ámbito `dx.sindromico`) y 32 son consejos de «Cómo conducirlo».
- Umbrales de interpretación: ninguno.
- Definiciones nuevas en `datos/definiciones-07.csv`: 28 (para qué sirve cada frase de tratamiento, plan de trabajo y evolución). Las escalas ya tienen etiqueta y no se repiten.

| Sección | Campo | Tipo | Obligatorio | Lista |
|---|---|---|---|---|
| IV. Diagnóstico | Resumen semiológico | Párrafo redactado | Sí | — |
| IV. Diagnóstico | Diagnóstico presuntivo | Lista de puntos | Sí | — |
| IV. Diagnóstico | Diagnóstico sindrómico | Lista de puntos | No | — |
| IV. Diagnóstico | Diagnóstico diferencial | Lista de puntos | No | — |
| V. Tratamiento | Tratamiento | Párrafo redactado | No | `f_tratamiento` |
| VI. Plan de trabajo | Plan de trabajo | Párrafo redactado | No | `f_plan` |
| VII. Evolución | Evolución | Párrafo redactado | No | `f_evolucion` |

## Del dato al diagnóstico

La nota 01 da el método y la nota 02c el orden en que se cierra la historia. De la queja del paciente (síntoma, subjetivo) y del hallazgo del examinador (signo, objetivo) se pasa al síndrome; el síndrome orienta una hipótesis; los exámenes la confirman, la descartan o la modifican, y solo el diagnóstico definitivo decide el tratamiento y el pronóstico.

```mermaid
flowchart LR
  RS["Resumen semiológico"] -->|"agrupa los datos positivos en"| SIND["Diagnóstico sindrómico"]
  SIND -->|"orienta la hipótesis"| PRES["Diagnóstico presuntivo"]
  PRES -->|"se compara con"| DIF["Diagnóstico diferencial"]
  DIF -->|"se contrasta con exámenes en el"| PLAN["Plan de trabajo"]
  PLAN -->|"diagnóstico definitivo"| TX["Tratamiento"]
  TX -->|"se controla día a día en la"| EVO["Evolución"]
```

| Paso | Qué va | Pregunta que responde | Fuente |
|---|---|---|---|
| 1. Resumen semiológico | Solo los datos positivos de la anamnesis (incluida la revisión de sistemas) y del examen físico, cada uno por separado, distinguiendo síntomas de signos. | ¿Qué tiene de anormal este paciente? | 02c; 01 |
| 2. Diagnóstico sindrómico | El conjunto de síntomas y signos que define un estado morboso, sostenido por la combinación de inspección, palpación, percusión y auscultación. Todavía no es una enfermedad. | ¿Con qué forma clínica se presenta? | 01; 07e |
| 3. Diagnóstico presuntivo | La hipótesis o impresión diagnóstica, cambiable, fundamentada en las consideraciones diagnósticas. Se precisa en tres capas: funcional (mecanismo), anatómica (sitio y tipo de lesión) y etiológica (causa de fondo). | ¿Qué mecanismo, qué lesión y qué causa lo explican? | 01; 02c |
| 4. Diagnóstico diferencial | Las otras enfermedades que dan un cuadro parecido y el dato que las separa: signo asociado, antecedente, edad, sexo o patrón de los cuatro métodos. En el anciano pueden coexistir varias. | ¿Qué más podría ser y cómo lo distingo? | 09g; 09f; 07e; 09e; 02c |
| 5. Plan de trabajo | Los exámenes auxiliares que contrastan la sospecha (laboratorio, imágenes, endoscopias, cultivos, biopsias), los que miden la gravedad o buscan complicaciones y los que siguen la respuesta al tratamiento. | ¿Qué examen confirma, descarta o modifica la hipótesis? | 02c; 01 |
| 6. Tratamiento | Con el diagnóstico definitivo: su intención (sintomático, curativo, paliativo o profiláctico) y quién lo ejecuta (clínico o quirúrgico), ajustado a las enfermedades asociadas. | ¿Qué se hace y con qué fin? | 01; 08h |
| 7. Evolución | Nota diaria con fecha y hora, apreciación subjetiva y objetiva, verificación del tratamiento y la dieta, interpretación, comentario y decisiones, y los datos y la firma del médico. Al final, pronóstico (bueno o malo) y epicrisis al alta o al fallecimiento. | ¿Cómo va el paciente y qué se decide hoy? | 02c |

**Ejemplos de las notas**

- Paciente diabético con los pies hinchados: síndrome edematoso (sindrómico), retención hidrosalina (funcional), glomeruloesclerosis renal (anatómico) y diabetes mellitus (etiológico). — *01*
- Piel amarilla, heces decoloradas y orinas encendidas son tres datos positivos distintos del resumen que, reunidos, sostienen una sola sospecha diagnóstica. — *02c*
- Paciente con fiebre: síndrome febril; hipótesis de fiebre tifoidea; plan con hemograma, reacción de Vidal o hemocultivo según la procedencia; tratamiento dirigido cuando el diagnóstico se confirma. — *01*
- Error de método más común del estudiante: tratar la hipótesis como si ya fuera el diagnóstico final. — *01*

En el formulario, el diagnóstico presuntivo aparece antes que el sindrómico (orden 20 y 30); al redactar conviene pensar primero el síndrome, como pide el método (ver Discrepancias).

## Resumen semiológico

*Sección IV. Diagnóstico*

| Dato | Detalle |
|---|---|
| Identificador | `dx.resumen` |
| Tipo · Obligatorio | Párrafo redactado · Sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | Dolor · escala visual análoga (`eva`), Disnea de esfuerzo (NYHA) (`nyha`), Disnea crónica (mMRC) (`mmrc`), Edema con fóvea (`godet`), Intensidad de soplos (Levine) (`levine`), Estado de conciencia (`conciencia`), Capacidad funcional (ECOG) (`ecog`) |
| Reglas de redacción | En tercera persona; Solo datos positivos |

Es el puente entre el examen físico y el diagnóstico: se escribe en un solo párrafo, en tercera persona, y solo con datos positivos (lo alterado o lo que orienta). Las escalas se citan con su nombre completo, por ejemplo «Disnea en clase funcional III de la NYHA».

**Guía · Cómo conducirlo**

- Reúne solo los datos positivos de la anamnesis y del examen físico. Va después del examen físico y antes de las consideraciones diagnósticas. — *02c*
- Separa síntomas (subjetivos, los refiere el paciente) de signos (objetivos, los reconoces al examinar). No los confundas. — *01*
- Incluye lo hallado en la revisión de sistemas aunque no se relacione con el motivo de consulta. Puede revelar otra enfermedad. — *02c*
- Anota cada dato positivo por separado. Reunidos sostienen una sospecha: piel amarilla, heces decoloradas y orina encendida. — *02c*
- Revisa que no falte nada. La mayoría de los errores nacen de un interrogatorio o un examen físico incompletos. — *02c*

*Escalas que admite: `nyha`, `mmrc` y `ecog` se detallan en [Escalas funcionales](#escalas-funcionales); las demás pertenecen a otras áreas (ver Resumen).*

## Diagnóstico presuntivo

*Sección IV. Diagnóstico*

| Dato | Detalle |
|---|---|
| Identificador | `dx.presuntivo` |
| Tipo · Obligatorio | Lista de puntos · Sí |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | Un diagnóstico por línea, sin códigos |

Se escribe como lista: un diagnóstico por línea, con su nombre completo y sin códigos de clasificación. Aquí caben las capas funcional, anatómica y etiológica de la nota 01.

**Guía · Cómo conducirlo**

- Es la hipótesis o impresión diagnóstica que surge de la anamnesis y el examen físico. Es cambiable. — *01*
- Se fundamenta en las consideraciones diagnósticas, a partir de los datos positivos del resumen semiológico. — *02c*
- Precisa además el diagnóstico funcional (mecanismo), anatómico (sitio y tipo de lesión) y etiológico (causa de fondo) — *01*
- Ejemplo: síndrome edematoso, retención hidrosalina, glomeruloesclerosis renal y diabetes mellitus como causa. — *01*
- No lo trates como diagnóstico final. Los exámenes lo confirman, descartan o modifican hasta el definitivo, que guía el tratamiento. — *01*

## Diagnóstico sindrómico

*Sección IV. Diagnóstico*

| Dato | Detalle |
|---|---|
| Identificador | `dx.sindromico` |
| Tipo · Obligatorio | Lista de puntos · No |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | Cada diagnóstico con su sustento |

Se escribe como lista: cada síndrome en una línea, seguido de los datos del resumen que lo sostienen (por ejemplo: «Síndrome edematoso: edema con fóvea en ambos miembros inferiores y oliguria»).

**Guía · Cómo conducirlo**

- Síndrome es el conjunto de síntomas y signos que definen un estado morboso. Todavía no es una enfermedad, orienta hacia ella. — *01*
- Responde a la pregunta: ¿con qué forma clínica se presenta? Ejemplo: síndrome edematoso en un diabético con pies hinchados. — *01*
- Ningún hallazgo aislado define un síndrome. Lo define la combinación de inspección, palpación, percusión y auscultación. — *07e*
- Reconocerlo rápido es el primer paso del razonamiento. Ejemplo: paciente con fiebre, síndrome febril, luego se plantea la causa. — *01*

**Guía · Síndromes**

- 87 cuadros clínicos, uno por fila, en el [Catálogo de síndromes](#catálogo-de-síndromes). La app los muestra como ayuda al elegir el síndrome.

## Diagnóstico diferencial

*Sección IV. Diagnóstico*

| Dato | Detalle |
|---|---|
| Identificador | `dx.diferencial` |
| Tipo · Obligatorio | Lista de puntos · No |
| Lista | — |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | Cada diagnóstico con su sustento |

Se escribe como lista: cada alternativa con el dato que la apoya o la aleja.

**Guía · Cómo conducirlo**

- No se resuelve con un solo dato. La localización del dolor orienta, pero el signo asociado y el antecedente distinguen. — *09g*
- Cambia con edad, sexo y procedencia. En fosa ilíaca derecha, en mujer piensa también en torsión de quiste ovárico. — *09f*
- Compara el patrón de los cuatro métodos. La atelectasia atrae el mediastino, el derrame lo desplaza al lado sano. — *07e*
- Confirma el signo antes de pedir estudios invasivos. Escleróticas blancas con piel amarilla sugieren carotenemia, no ictericia. — *09e*
- En el anciano no te detengas en la primera explicación: suelen coexistir varias enfermedades. — *02c*
- Cambia con la edad y el sexo. Ante dolor en fosa ilíaca derecha en una mujer, piensa también en torsión de quiste ovárico. — *09f*

## Tratamiento

*Sección V. Tratamiento*

| Dato | Detalle |
|---|---|
| Identificador | `tx.tratamiento` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | Frases · tratamiento (`f_tratamiento`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | Fármaco, dosis, vía y frecuencia |

Párrafo armado con frases prediseñadas; cada medicamento en su propia línea con fármaco, dosis, vía y frecuencia escritos completos.

**Guía · Cómo conducirlo**

- Se decide con el diagnóstico definitivo. Indica su intención: sintomático, curativo, paliativo o profiláctico. — *01*
- Indica quién lo ejecuta: tratamiento clínico (sin cirugía) o quirúrgico. — *01*
- Ejemplos: paracetamol en resfrío viral (sintomático), antibiótico en neumonía (curativo), penicilina benzatínica tras fiebre reumática. — *01*
- Es individual: ajústalo a las enfermedades asociadas del paciente, por ejemplo cuidando el riñón en el diabético. — *08h*

**Lista `f_tratamiento`** · Frases · tratamiento · tipo frase · usada en `tx.tratamiento`

| Código | Frase que se escribe | Para qué sirve | Fuente |
|---|---|---|---|
| `a1` | `{farmaco} {dosis} vía {via} cada {intervalo}.` | Línea de indicación de un medicamento: nombre, dosis, vía y frecuencia completos y sin abreviar; omitir uno de ellos causa errores de administración. | `FARMACOLOGIA 2026/clases/65_Prescripcion_racional_y_escritura_de_la_prescripcion.md` |
| `a2` | `Dieta {dieta}.` | Indica el tipo de dieta según el cuadro, por ejemplo hipoproteica en la encefalopatía hepática; su cumplimiento se verifica en la evolución diaria. | 09e; 02c |
| `a3` | `Reposo relativo.` | Limita la actividad física sin inmovilizar al paciente; el reposo prolongado en cama favorece la trombosis venosa profunda. | 08i |
| `a4` | `Control de funciones vitales cada {intervalo}.` | Ordena registrar los signos vitales con la periodicidad indicada; la temperatura, una o dos veces al día o cada 4 a 6 horas en casos especiales. | 05e; 02c |
| `a5` | `Control de diuresis.` | Mide el volumen de orina de 24 horas (normal 800 a 1800 ml) para detectar oliguria, menos de 400 ml, o anuria, menos de 100 ml. | 10a; 10c |
| `a6` | `Oxigenoterapia por cánula binasal con una fracción inspirada de oxígeno de {fio2}.` | Registra el aporte de oxígeno; se indica ante cianosis o hipoxemia con saturación menor de 90 %, como en la neumonía grave. | `FISIOPATOLOGIA 2026/clases/Clase_42_NEUMONIA.md` |
| `a7` | `Hidratación con {solucion} {volumen} por vía endovenosa.` | Registra la solución y el volumen por vena; se indica en la deshidratación o cuando las pérdidas por fiebre, taquipnea o sudoración no se cubren por boca. | `FISIOPATOLOGIA 2026/clases/Clase_42_NEUMONIA.md`; 05b |

Los marcadores entre llaves se reemplazan al escribir: `{farmaco}`, `{dosis}`, `{via}` e `{intervalo}` (el nombre del fármaco, la dosis con su unidad, la vía escrita completa, como oral o endovenosa, y el intervalo en horas), `{dieta}` (por ejemplo «hipoproteica»), `{fio2}` (el porcentaje, sin la sigla), `{solucion}` y `{volumen}`. La nota de Farmacología pide escribir la indicación completa y sin abreviar: ni siglas ni símbolos para la vía o la frecuencia. En Puno, una saturación de 88 a 92 % puede ser normal por la altura: la indicación de oxígeno se interpreta con ese dato.

## Plan de trabajo

*Sección VI. Plan de trabajo*

| Dato | Detalle |
|---|---|
| Identificador | `plan.plan` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | Frases · plan de trabajo (`f_plan`) |
| Valor normal | — |
| Escalas que admite | — |
| Reglas de redacción | Examen y la pregunta que responde |

Párrafo armado con frases prediseñadas; cada examen debería decir qué pregunta responde (usar la frase `a15` cuando la frase fija no lo dice).

**Guía · Cómo conducirlo**

- Ordena los exámenes auxiliares que contrastan la sospecha: laboratorio, endoscopias, radiografías, ecografías, cultivos o biopsias. — *02c*
- Pide exámenes que confirmen, descarten o modifiquen la hipótesis, midan la gravedad y busquen complicaciones. — *01*
- Ajusta el plan al caso y a la procedencia. Ejemplo: síndrome febril con sospecha de tifoidea, hemograma, reacción de Vidal, hemocultivo. — *01*
- Incluye exámenes para seguir la evolución y evaluar la respuesta al tratamiento. — *01*

**Lista `f_plan`** · Frases · plan de trabajo · tipo frase · usada en `plan.plan`

| Código | Frase que se escribe | Para qué sirve | Fuente |
|---|---|---|---|
| `a1` | `Se solicita hemograma completo.` | Se pide siempre en el paciente hospitalizado; muestra leucocitosis con desviación a la izquierda en la infección bacteriana y anemia aguda en la hemorragia. | 09c; 07e; 09e |
| `a2` | `Se solicita examen completo de orina.` | Estudia densidad, proteínas, glucosa y sedimento; más de 10 leucocitos por campo sugiere infección urinaria. Muestra: primera orina de la mañana. | 10b |
| `a3` | `Se solicita urea y creatinina.` | Miden la función renal global (creatinina normal 0,6 a 1,4 mg/dl; urea 15 a 45 mg/dl); se piden ante oliguria o riesgo de insuficiencia renal. | 10b; 09c |
| `a4` | `Se solicita glucosa.` | Glucosa en sangre: se pide ante sospecha de diabetes mellitus y forma parte del estudio del hipertenso y del síndrome nefrótico. | 09c; 08g; 10c |
| `a5` | `Se solicita perfil hepático.` | Bilirrubina total y fraccionada, transaminasas, fosfatasa alcalina y tiempo de protrombina, ante sospecha de enfermedad hepática o biliar. | 09c; 09e |
| `a6` | `Se solicita radiografía de tórax posteroanterior.` | Proyección de rutina del tórax: muestra condensación, derrame, neumotórax o cardiomegalia (índice cardiotorácico). | 07g; 07e; 08f |
| `a7` | `Se solicita radiografía simple de abdomen.` | Primer examen ante sospecha de obstrucción intestinal (niveles hidroaéreos); de pie muestra aire bajo el diafragma en la perforación. | 09c; 09g |
| `a8` | `Se solicita electrocardiograma.` | Registra la actividad eléctrica del corazón; se pide ante dolor torácico, arritmias o riesgo de hiperpotasemia en la insuficiencia renal. | 08f; 08l; 10c |
| `a9` | `Se solicita ecocardiograma.` | Imagen del corazón con ondas sonoras: valvulopatías, cardiopatías congénitas, miocardiopatías, vegetaciones de endocarditis y trombos. | 08f |
| `a10` | `Se solicita ecografía abdominal.` | Examen de primera línea para tumores, quistes, ascitis, cálculos y abscesos; aclara la obstrucción biliar y el líquido libre abdominal. | 09c; 09e; 09g |
| `a11` | `Se solicita baciloscopia en esputo.` | Tinción de Ziehl-Neelsen en tres muestras sucesivas; se pide si la tos dura más de 15 días o se sospecha tuberculosis pulmonar. | 07g |
| `a12` | `Se solicita gasometría arterial.` | Cuantifica el intercambio gaseoso: confirma la insuficiencia respiratoria y se pide de rutina en el enfisema. | 07g; 07e |
| `a13` | `Se solicita espirometría.` | Estudia la función pulmonar; confirma la obstrucción bronquial en el asma. | 07g; 07f |
| `a14` | `Se solicita examen parasitológico de heces.` | Busca huevos y parásitos intestinales en tres muestras de días sucesivos; se pide ante sospecha de parasitosis o diarrea crónica. | 09c; 09e |
| `a15` | `Se solicita {examen} para {objetivo}.` | Frase libre: nombra el examen y la pregunta que responde (confirmar o descartar la sospecha, medir la gravedad o buscar complicaciones). | 01 |

La nota 09c da una regla práctica para cualquier paciente hospitalizado: pedir siempre hemograma, y sumar glucosa si hay sospecha de diabetes, creatinina si hay riesgo de insuficiencia renal y gasometría arterial si hay signos de insuficiencia respiratoria.

## Evolución

*Sección VII. Evolución*

| Dato | Detalle |
|---|---|
| Identificador | `evo.evolucion` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Lista | Frases · evolución (`f_evolucion`) |
| Valor normal | — |
| Escalas que admite | Dolor · escala visual análoga (`eva`), Disnea de esfuerzo (NYHA) (`nyha`), Disnea crónica (mMRC) (`mmrc`), Edema con fóvea (`godet`), Consistencia de heces (Bristol) (`bristol`), Estado de conciencia (`conciencia`), Grado de deshidratación (`deshidratacion`) |
| Reglas de redacción | Fecha y subjetivo, objetivo, análisis y plan |

Párrafo armado con frases prediseñadas que siguen el orden de la nota diaria: fecha, lo subjetivo, lo objetivo, el análisis y el plan.

**Guía · Cómo conducirlo**

- Registra cada día: fecha y hora, apreciación subjetiva y objetiva, y verificación del tratamiento y la dieta. — *02c*
- Cierra cada nota con interpretación, comentario y decisiones, más los datos y la firma del médico. — *02c*
- Pronóstico: bueno si hay tratamiento y se espera curación, malo si el desenlace previsible es fatal. Formúlalo con cautela. — *02c*
- Epicrisis: al alta o fallecimiento, resume signos, síntomas, hallazgos del examen, resultados y tratamiento. — *02c*

**Lista `f_evolucion`** · Frases · evolución · tipo frase · usada en `evo.evolucion`

| Código | Frase que se escribe | Para qué sirve | Fuente |
|---|---|---|---|
| `a1` | `{fecha}. S:` | Abre la nota diaria con la fecha y da paso a lo subjetivo: lo que el paciente refiere desde la última visita. | 02c |
| `a2` | `O:` | Da paso a lo objetivo: los signos que el examinador reconoce en el examen del día. | 02c; 01 |
| `a3` | `A:` | Da paso al análisis: interpretación y comentario de los datos del día frente al diagnóstico y al tratamiento. | 02c |
| `a4` | `P:` | Da paso al plan: decisiones del día, verificación del tratamiento y la dieta, y exámenes por pedir. | 02c |
| `a5` | `Paciente refiere` | Introduce un síntoma: dato subjetivo que solo se conoce porque el paciente lo cuenta. | 01 |
| `a6` | `Al examen:` | Introduce los signos: datos objetivos que el examinador reconoce con sus sentidos al explorar. | 01 |

Orden sugerido: `a1` (fecha y subjetivo) → `a5` → `a2` (objetivo) → `a6` → `a3` (análisis) → `a4` (plan). Las letras «S:», «O:», «A:» y «P:» son abreviaturas (ver Discrepancias).

*Escalas que admite: `nyha` y `mmrc` se detallan en [Escalas funcionales](#escalas-funcionales); las demás pertenecen a otras áreas (ver Resumen).*

## Catálogo de síndromes

Los 87 cuadros de la guía del diagnóstico sindrómico, tal como están en el paquete, ordenados por sistema (respiratorio 16, cardiovascular 23, digestivo 18, renal y urinario 6, neurológico 14, endocrino 7, general 3). El nombre y el cuadro se separan en el primer «:». El sistema se asignó por la nota de origen, salvo cuatro cuadros de las notas 01 y 05g, asignados por su contenido. La fila duplicada se señala en Discrepancias.

| Síndrome | Síntomas y signos | Sistema | Fuente |
|---|---|---|---|
| Síndrome de condensación pulmonar | Fiebre, tos mucopurulenta, disnea, dolor pleurítico. Expansibilidad disminuida, vibraciones vocales aumentadas, matidez, soplo tubárico, crepitantes. | respiratorio | 07e |
| Síndrome de derrame pleural | Disnea, dolor gravativo. Abombamiento, vibraciones vocales disminuidas o abolidas, matidez con curva de Damoiseau, murmullo vesicular abolido, soplo pleurítico. | respiratorio | 07e |
| Síndrome de neumotórax | Dolor pleurítico, tos seca y disnea súbitas. Abombamiento, vibraciones vocales abolidas, hipersonoridad o timpanismo, silencio respiratorio. | respiratorio | 07e |
| Síndrome de atelectasia | Disnea, tos seca, fiebre si es aguda. Retracción intercostal, vibraciones vocales disminuidas, matidez, murmullo abolido, mediastino atraído al lado enfermo. | respiratorio | 07e |
| Síndrome cavitario (caverna o absceso) | Tos seca, hemoptisis. Expansibilidad disminuida, vibraciones vocales aumentadas, timpanismo o hipersonoridad, soplo cavitario. | respiratorio | 07e |
| Síndrome enfisematoso | Disnea progresiva, tos seca, cianosis y acropaquia tardías. Tórax en tonel, vibraciones vocales disminuidas, hipersonoridad, murmullo disminuido, espiración prolongada. | respiratorio | 07e |
| Síndrome de congestión pulmonar | Tos seca, disnea progresiva, ortopnea, disnea paroxística nocturna. Inspección y palpación normales, submatidez basal, crepitantes en bases, sibilancias. | respiratorio | 07e |
| Pleuritis aguda | Dolor pleurítico que aumenta con tos e inspiración, tos seca, disnea, fiebre. Expansibilidad y vibraciones vocales disminuidas, percusión normal o submate, frote pleural. | respiratorio | 07e |
| Pleuritis crónica (paquipleuritis) | Dolor leve, disnea a grandes esfuerzos. Retracción del hemitórax, vibraciones vocales disminuidas, submatidez o matidez, murmullo vesicular disminuido. | respiratorio | 07e |
| Cor pulmonale crónico | Enfermedad pulmonar crónica con hipoxia e hipertensión pulmonar que produce hipertrofia del ventrículo derecho, con o sin insuficiencia cardíaca derecha. | respiratorio | 07e |
| Insuficiencia respiratoria | Cianosis y aleteo nasal, desenlace de enfermedad pulmonar crónica o aguda, se confirma con gasometría arterial. | respiratorio | 07e |
| Bronquitis aguda | Fiebre, malestar, dolor retroesternal, tos seca y luego mucoide. Examen normal o levemente disminuido, subcrepitantes en ambos campos, roncus y sibilancias tardíos. | respiratorio | 07f |
| Bronquitis crónica | Tos con expectoración mucopurulenta más de 3 meses al año por 2 años seguidos, matutina, disnea. Subcrepitantes bilaterales difusos, roncus y sibilancias. | respiratorio | 07f |
| Síndrome bronquiectásico | Broncorrea matutina de 400 a 600 ml al día, hemoptisis. Expansibilidad disminuida, percusión normal o submatidez localizada, subcrepitantes localizados. | respiratorio | 07f |
| Obstrucción bronquial (asma) | Tos, disnea y sibilancias en crisis. Tórax en tonel si es avanzado, hipersonoridad, murmullo disminuido, espiración prolongada, roncus y sibilancias difusos. | respiratorio | 07f |
| Bronconeumonía | Fiebre, tos con expectoración purulenta, disnea, taquicardia, taquipnea, a veces cianosis. Inspección, palpación y percusión normales, subcrepitantes y crepitantes. | respiratorio | 07f |
| Síndrome de vena cava superior | Edema en esclavina (cara, cuello, brazos), circulación colateral torácica, ingurgitación yugular, cianosis facial, cefalea, disnea, somnolencia. | cardiovascular | 05g |
| Insuficiencia cardíaca izquierda | Disnea de esfuerzo, ortopnea, disnea paroxística nocturna, tos hemoptoica. Choque de punta afuera y abajo, galope, crepitantes en bases, pulso pequeño. | cardiovascular | 08g |
| Insuficiencia cardíaca derecha | Dolor en hipocondrio derecho, oliguria. Ingurgitación yugular, reflujo hepatoyugular, hepatomegalia congestiva, edema de miembros inferiores, ascitis. | cardiovascular | 08g |
| Insuficiencia cardíaca congestiva | Síntomas izquierdos (disnea, ortopnea, crepitantes en bases) más signos derechos (ingurgitación yugular, hepatomegalia, edema) en el mismo paciente. | cardiovascular | 08g |
| Síndrome hipertensivo | Presión arterial de 140/90 mmHg o más en 2 o más consultas, a menudo asintomático, cefalea occipital, zumbidos. Segundo ruido aórtico hiperfonético, fondo de ojo alterado. | cardiovascular | 08g |
| Encefalopatía hipertensiva | Cefalea intensa, epistaxis, vómitos y confusión mental, a veces convulsión, en hipertensión arterial grave. | cardiovascular | 08g |
| Estenosis mitral | Disnea progresiva, fatiga, palpitaciones por fibrilación auricular. Soplo diastólico en ruflar en foco mitral, pulso pequeño, presión convergente, cianosis labial. | cardiovascular | 08h |
| Insuficiencia mitral | Disnea, palpitaciones. Soplo holosistólico de regurgitación en foco mitral irradiado a axila y dorso, pulso pequeño, irregular si hay fibrilación auricular. | cardiovascular | 08h |
| Estenosis aórtica | Angina, síncope de esfuerzo y disnea. Soplo mesosistólico de eyección en foco aórtico irradiado al cuello, frémito sistólico, pulso parvus, presión convergente. | cardiovascular | 08h |
| Insuficiencia aórtica | Presión arterial divergente, pulso céler de Corrigan, signos de Musset y Quincke, danza arterial. Soplo diastólico en foco aórtico, doble soplo femoral de Duroziez. | cardiovascular | 08h |
| Estenosis tricuspídea | Cansancio, congestión hepática, edema, ascitis. Soplo presistólico y ruflar diastólico en foco tricuspídeo que aumenta con la inspiración (Rivero-Carvallo) | cardiovascular | 08h |
| Insuficiencia tricuspídea | Ingurgitación yugular visible, hepatomegalia, ascitis, cianosis tardía. Soplo sistólico de regurgitación en apéndice xifoides que aumenta con la inspiración. | cardiovascular | 08h |
| Coartación de aorta | Piernas frías, cefalea. Pulsos femorales débiles, presión alta en brazos y baja en piernas, circulación colateral intercostal, soplo sistólico y continuo dorsal. | cardiovascular | 08h |
| Tetralogía de Fallot | Niño cianótico, crisis anóxicas, posición de cuclillas, hipodesarrollo, hipocratismo digital. Segundo ruido único, soplo sistólico de eyección paraesternal izquierdo. | cardiovascular | 08h |
| Comunicación interauricular | Acianótico, infecciones respiratorias a repetición, disnea, hipodesarrollo. Segundo ruido desdoblado en foco pulmonar, soplo sistólico de eyección. | cardiovascular | 08h |
| Comunicación interventricular | Acianótica al inicio, infecciones pulmonares, disnea, hipodesarrollo. Soplo holosistólico en xifoides, frémito paraesternal izquierdo, clic de eyección. | cardiovascular | 08h |
| Síndrome isquémico agudo | Dolor súbito, miembro frío, pálido y luego cianótico, ampollas. Ausencia de pulso distal a la obstrucción comparado con el lado sano, confirmar con Doppler. | cardiovascular | 08i |
| Síndrome isquémico crónico | Claudicación intermitente que cede con reposo, luego dolor en reposo, pérdida de vello, úlceras, parestesias, gangrena. Asimetría de pulsos periféricos. | cardiovascular | 08i |
| Síndrome varicoso | Dolor, edema, hiperpigmentación, eczema, dermatofibrosis, úlceras varicosas. Dilataciones venosas visibles, prueba de Trendelenburg positiva. | cardiovascular | 08i |
| Trombosis venosa profunda | Edema unilateral del miembro inferior bajo el nivel del trombo, dolor en pantorrilla, signo de Homans positivo, reposo o cirugía reciente (tríada de Virchow) | cardiovascular | 08i |
| Tromboembolia pulmonar | Disnea súbita, dolor pleurítico, tos con esputo hemoptoico, taquipnea, cianosis, frote pleural. Shock si el émbolo es masivo (cor pulmonale agudo) | cardiovascular | 08i |
| Linfedema | Edema unilateral, duro, sin fóvea, piel engrosada en pata de elefante, por obstrucción linfática (filariasis, erisipela, ligadura quirúrgica) | cardiovascular | 08i |
| Várices de miembros inferiores | Dolor, edema, hiperpigmentación, eczema, dermatofibrosis, úlceras varicosas. Dilataciones venosas visibles, prueba de Trendelenburg positiva. | cardiovascular | 08i |
| Síndrome coledociano | Ictericia, prurito, hipocolia, acolia y coluria (orina color coca-cola) | digestivo | 01 |
| Síndrome ascítico | Aumento del volumen abdominal, disnea, oliguria. Abdomen en batracio, ombligo protruido, circulación colateral, matidez desplazable, signo de la oleada si es a tensión. | digestivo | 09e |
| Síndrome diarreico | Heces menos consistentes y más frecuentes. Alta: voluminosa, sin tenesmo. Baja: escasa, muy frecuente, con tenesmo, moco, pus o sangre. Ruidos hidroaéreos aumentados. | digestivo | 09e |
| Síndrome ictérico | Ictericia en escleróticas, prurito, coluria, acolia, anorexia, hepatomegalia dolorosa, esplenomegalia, vesícula palpable indolora si hay obstrucción (Courvoisier-Terrier) | digestivo | 09e |
| Insuficiencia hepática | Fetor hepático, ictericia, ascitis, edema, equimosis, telangiectasias, eritema palmar, ginecomastia, atrofia testicular, Dupuytren. Albúmina baja, transaminasas altas. | digestivo | 09e |
| Encefalopatía hepática | Confusión, inversión del sueño, asterixis (flapping), fetor hepático, alteración de la escritura, reflejos aumentados y luego disminuidos, Babinski, coma. | digestivo | 09e |
| Hipertensión portal | Ascitis, esplenomegalia, circulación colateral tipo porta y várices esofágicas con riesgo de hemorragia, por cirrosis o trombosis portal o suprahepática. | digestivo | 09e |
| Síndrome de malabsorción | Diarrea crónica, esteatorrea, pérdida de peso, tetania, dolor óseo, sangrados. Caquexia, glositis, queilitis, anemia, distensión abdominal, edema. | digestivo | 09e |
| Hemorragia digestiva | Alta con hematemesis y melena, baja con enterorragia o hematoquecia. Taquicardia, hipotensión postural, piel fría, síncope y shock si la pérdida pasa de 1500 ml. | digestivo | 09e |
| Abdomen agudo | Dolor abdominal de menos de 6 horas que exige decisión rápida. Tipos: inflamatorio, obstructivo, perforativo, hemorrágico y vascular. | digestivo | 09f |
| Apendicitis aguda | Dolor epigástrico que migra a fosa ilíaca derecha, anorexia, vómitos, fiebre leve tardía. McBurney doloroso, Blumberg, Rovsing, psoas u obturador positivos. | digestivo | 09f |
| Síndrome de perforación (úlcera perforada) | Dolor súbito en puñalada, abdomen en tabla, desaparición de la matidez hepática (Jobert), silencio abdominal, neumoperitoneo radiológico. | digestivo | 09f |
| Síndrome peritonítico | Defensa abdominal localizada o en tabla, Blumberg positivo, distensión, silencio por íleo paralítico, facies afilada, fiebre alta, taquicardia, hipotensión. | digestivo | 09f |
| Síndrome obstructivo intestinal | Dolor cólico, vómitos, falta de eliminación de gases y heces. Distensión abdominal, ruidos hidroaéreos de lucha y luego silencio, deshidratación. | digestivo | 09g |
| Íleo paralítico | Distensión, vómitos y falta de eliminación de gases y heces, con dolor continuo no cólico y silencio abdominal desde el inicio. | digestivo | 09g |
| Colecistitis aguda | Dolor en hipocondrio derecho irradiado a escápula y hombro derechos, signo de Murphy positivo, mujer con litiasis biliar conocida. | digestivo | 09g |
| Pancreatitis aguda | Dolor epigástrico en barra o cinturón irradiado a hipocondrios y dorso, signos de Cullen y Grey Turner tardíos, amilasa y lipasa elevadas. | digestivo | 09g |
| Embarazo ectópico roto | Retraso menstrual, dolor súbito en hipogastrio, palidez, taquicardia, hipotensión, signo de Lafont, matidez desplazable, Douglas abombado y doloroso. | digestivo | 09g |
| Insuficiencia renal aguda | Caída brusca de la función renal, oliguria o anuria, edema por hipervolemia, náuseas, vómitos, aliento urémico, alteración del sensorio. Urea y creatinina altas. | renal y urinario | 10c |
| Insuficiencia renal crónica | Filtración glomerular menor de 60 ml/min, poliuria, nicturia, anemia, hipertensión, náuseas, vómitos, aliento urémico, alteraciones neuropsíquicas. | renal y urinario | 10c |
| Síndrome nefrítico | Hematuria (orina color coca-cola), edema periorbitario moderado e hipertensión arterial, con oliguria y proteinuria leve a moderada. Antecedente estreptocócico. | renal y urinario | 10c |
| Síndrome nefrótico | Proteinuria de 3,5 g o más en 24 horas, hipoalbuminemia, hipercolesterolemia, edema intenso hasta anasarca, orina espumosa, derrames cavitarios. | renal y urinario | 10c |
| Infección urinaria baja (cistitis) | Disuria, polaquiuria, tenesmo vesical, hematuria. Leucocitos en orina y urocultivo positivo. | renal y urinario | 10c |
| Infección urinaria alta (pielonefritis) | Fiebre de 39 a 40 °C, dolor lumbar, náuseas, vómitos, signo de Giordano positivo (puño-percusión lumbar dolorosa) | renal y urinario | 10c |
| Síndrome piramidal | Paresia o plejía, espasticidad con signo de la navaja, hiperreflexia, clonus, Babinski y Hoffman positivos, marcha en guadaña. | neurológico | 11e |
| Síndrome extrapiramidal (parkinsoniano) | Rigidez en rueda dentada, bradicinesia, temblor de reposo, fuerza conservada, pérdida de reflejos posturales, marcha a pasos cortos. | neurológico | 11e |
| Síndrome cerebeloso | Hipotonía, marcha atáxica con base ampliada, temblor de intención, dismetría, disdiadococinesia, nistagmo, disartria escandida, fuerza conservada. | neurológico | 11e |
| Síndrome de Brown-Séquard | Déficit motor y pérdida de sensibilidad profunda del lado de la lesión, pérdida de dolor y temperatura del lado opuesto (hemisección medular) | neurológico | 11e |
| Síndrome de cordones posteriores | Pérdida de la sensibilidad vibratoria, marcha tabética, signo de Romberg positivo. | neurológico | 11e |
| Síndrome de cono medular | Anestesia en silla de montar (región perianal, sacrocoxígea, ano y genitales) | neurológico | 11e |
| Síndrome meníngeo | Cefalea intensa, vómitos, fiebre, rigidez de nuca, signos de Kernig, Brudzinski y Lasègue positivos, posición en gatillo de fusil. | neurológico | 11e |
| Síndrome de hipertensión endocraneana | Cefalea intensa, vómito explosivo sin náusea y edema de papila en el fondo de ojo (aparece días o semanas después) | neurológico | 11e |
| Síndrome convulsivo | Crisis paroxística por descarga cortical anormal, con o sin causa aguda. Epilepsia si recurre sin desencadenante. Incluye ausencias y crisis parciales complejas. | neurológico | 11e |
| Síndrome del tallo cerebral | Deterioro de conciencia con patrón respiratorio anormal (apnéustico, atáxico), alteraciones pupilares y postura de decorticación o decerebración. | neurológico | 11e |
| Coma | Pérdida del reconocimiento de sí y del entorno con déficit de alerta, se gradúa con Glasgow (ocular 1 a 4, motora 1 a 6, verbal 1 a 5, total 3 a 15) | neurológico | 11e |
| Síndrome de Guillain-Barré | Parálisis flácida, ascendente y simétrica con arreflexia, puede comprometer músculos respiratorios, antecedente infeccioso. | neurológico | 11e |
| Síndrome miasténico | Debilidad muscular fatigable, diplopía y dificultad para caminar, por falla de la unión neuromuscular. | neurológico | 11e |
| Trastorno del sensorio (síncope) | Pérdida transitoria de conciencia con recuperación espontánea, de origen neurológico o cardiovascular. | neurológico | 11e |
| Síndrome hipertiroideo | Intolerancia al calor, sudoración, pérdida de peso con apetito, nerviosismo, temblor fino, taquicardia, fibrilación auricular, exoftalmos, piel caliente y húmeda. | endocrino | 13a |
| Síndrome hipotiroideo | Cansancio, intolerancia al frío, aumento de peso, estreñimiento, bradicardia, piel seca, voz ronca, macroglosia, edema periorbitario, reflejos lentos. | endocrino | 13a |
| Síndrome de Cushing | Obesidad centrípeta, cara de luna llena, joroba de búfalo, estrías violáceas, equimosis, debilidad muscular proximal, hipertensión arterial, acné, hipertricosis. | endocrino | 13b |
| Insuficiencia suprarrenal crónica (Addison) | Astenia, pérdida de peso, náuseas, vómitos, diarrea, hipotensión postural, síncope, hiperpigmentación de piel, cicatrices y boca. | endocrino | 13b |
| Insuficiencia suprarrenal aguda (crisis addisoniana) | Náuseas, vómitos, pérdida brusca de líquidos y sales, riesgo de shock. | endocrino | 13b |
| Hiperaldosteronismo | Hipertensión arterial con hipopotasemia, cansancio, nicturia, parálisis o flacidez de miembros inferiores, signo de Chvostek. | endocrino | 13b |
| Feocromocitoma | Crisis bruscas de cefalea, sudoración, palpitaciones, taquicardia, palidez e hipertensión arterial paroxística. | endocrino | 13b |
| Síndrome febril | Fiebre, escalofríos, cefalea, malestar general, anorexia, taquicardia, taquipnea, sequedad de mucosas, oliguria, sudoración, delirio en ancianos, convulsión en niños. | general | 05e |
| Síndrome edematoso | Aumento de volumen en miembros inferiores, párpados o región sacra, signo de Godet (fóvea) graduado de 1 a 4 cruces, oliguria. Anasarca si es generalizado. | general | 05g |
| Síndrome pelagroide | Dermatitis, diarrea y demencia (las tres D) | general | 01 |

## Escalas funcionales

Escalas propias de esta área. Se citan dentro del texto con la frase de la última columna; no tienen campo propio.

**Lista `nyha`** · Disnea de esfuerzo (NYHA) · tipo escala · usada en `ea.relato_cronologico`, `dx.resumen`, `evo.evolucion`

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| I | Sin limitación | Disnea en clase funcional I de la NYHA |
| II | Síntomas con actividad ordinaria | Disnea en clase funcional II de la NYHA |
| III | Síntomas con actividad menor que la ordinaria | Disnea en clase funcional III de la NYHA |
| IV | Síntomas en reposo | Disnea en clase funcional IV de la NYHA |

**Lista `mmrc`** · Disnea crónica (mMRC) · tipo escala · usada en `ea.relato_cronologico`, `dx.resumen`, `evo.evolucion`

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| 0 | Solo con ejercicio intenso | Disnea grado 0 en la escala mMRC |
| 1 | Al apurar el paso o subir cuesta | Disnea grado 1 en la escala mMRC |
| 2 | Camina más lento que sus pares | Disnea grado 2 en la escala mMRC |
| 3 | Se detiene tras 100 m | Disnea grado 3 en la escala mMRC |
| 4 | No sale de casa | Disnea grado 4 en la escala mMRC |

**Lista `ecog`** · Capacidad funcional (ECOG) · tipo escala · usada en `ea.relato_cronologico`, `dx.resumen`

| Nivel | Descripción | Frase que se escribe |
|---|---|---|
| 0 | Actividad normal | Estado funcional grado 0 en la escala ECOG |
| 1 | Limitado para esfuerzo intenso | Estado funcional grado 1 en la escala ECOG |
| 2 | En cama menos del 50 % del día | Estado funcional grado 2 en la escala ECOG |
| 3 | En cama más del 50 % del día | Estado funcional grado 3 en la escala ECOG |
| 4 | Encamado | Estado funcional grado 4 en la escala ECOG |

Dónde se usan:

- `nyha`: `ea.relato_cronologico` (enfermedad actual), `dx.resumen` y `evo.evolucion`. Clasifica la limitación de la actividad física por los síntomas de la insuficiencia cardíaca. No está en las notas de Semiología; las etiquetas coinciden con `FISIOPATOLOGIA 2026/clases/Clase_17_MANIFESTACION_CLINICAS_DE_INSUFICIENCIA_CARDIACA.md` y `FARMACOLOGIA 2026/clases/13b_Diureticos_IECA_betabloqueadores_aldosterona_IC.md`.
- `mmrc`: `ea.relato_cronologico`, `dx.resumen` y `evo.evolucion`. Gradúa la disnea crónica según la actividad que la provoca. Fuera de notas (ninguna nota del wiki la trae).
- `ecog`: `ea.relato_cronologico` y `dx.resumen` (no en la evolución). Mide la capacidad funcional según el tiempo que el paciente pasa en cama. Fuera de notas.

Escalas de otras áreas que admiten los campos de esta área: dolor con la escala visual análoga (`eva`, área 03), estado de conciencia (`conciencia`, área 03), grado de deshidratación (`deshidratacion`, área 03), edema con fóvea (`godet`, área 06), intensidad de soplos de Levine (`levine`, área 05) y consistencia de heces de Bristol (`bristol`, área 01). El resumen semiológico admite `eva`, `nyha`, `mmrc`, `godet`, `levine`, `conciencia` y `ecog`; la evolución admite `eva`, `nyha`, `mmrc`, `godet`, `bristol`, `conciencia` y `deshidratacion`.

## Discrepancias y pendientes

### Síndromes de las notas que faltan en el catálogo

| Síndrome | Cuadro según la nota | Fuente |
|---|---|---|
| Síndrome pilórico | Vómito en retención (alimentos ingeridos 8 horas antes o más, sin bilis), ondas peristálticas visibles en el epigastrio dirigidas de izquierda a derecha; por úlcera cicatrizada o tumor. | 09a; 09c |
| Síndrome disentérico | Heces con pus y sangre, con pujo y tenesmo. | 09a |
| Síndrome de Stokes-Adams | Síncope con convulsiones tónico-clónicas y relajación de esfínteres por bloqueo auriculoventricular grave (frecuencia ventricular de 30 a 40 latidos por minuto). | 08a; 08l |
| Síndrome de motoneurona inferior | Flacidez, hipotonía, atrofia muscular (tras la tercera semana), hiporreflexia y fasciculaciones. El catálogo solo tiene el piramidal (motoneurona superior). | 11b |
| Síndrome de Horner | Miosis, ptosis y enoftalmos por lesión de la vía simpática pupilar. | 11e; 11j |
| Síndrome de Pickwick | Obesidad, hipoventilación con hipoxemia e hipercapnia, poliglobulia y somnolencia diurna; puede llevar a cor pulmonale crónico. | 05c |
| Vértigo periférico y vértigo central (síndrome vestibular) | Periférico: inicio súbito, episódico, rotatorio, con acúfenos, náuseas y vómitos, empeora con los cambios de postura. Central: insidioso, continuo, sin rotación verdadera, puede alterar la conciencia. Marcha en zigzag. | 11g; 05b |
| Cardiopatía isquémica: angina e infarto | Dolor precordial opresivo irradiado al brazo izquierdo; en la angina dura 2 a 10 minutos y cede con reposo o nitratos; en el infarto dura más de 20 minutos, no cede y se acompaña de sudoración fría, náuseas y disnea. | 08a; 08k |
| Pericarditis | Frote pericárdico (roce de cuero nuevo) que desaparece cuando se forma derrame, con ruidos cardíacos apagados. | 08d |
| Deshidratación | Sed, pérdida brusca de peso, piel seca con signo del pliegue, mucosas secas, ojos hundidos, taquicardia e hipotensión postural. Existe como escala, no como síndrome. | 05b |
| Coma mixedematoso | Forma extrema del hipotiroidismo, desencadenada por frío, infecciones o depresores del sistema nervioso central. | 13a |
| Hepatitis y cirrosis hepática | Hepatitis: hepatomegalia dolorosa, lisa y roma, con anorexia y luego ictericia. Cirrosis: hígado duro, de borde cortante, sin dolor. | 09d |
| Tromboflebitis | Aumento de volumen del miembro con trayecto venoso inflamado y doloroso; signos de Homans y de Olow. | 08i |
| Solo mencionados, sin cuadro propio en las notas | Síndrome urémico (10c), síndrome hepatorrenal (09e), síndrome de distrés respiratorio del adulto (07f), edema agudo de pulmón (07e; 08g), síndrome radicular (11e), síndrome mediastínico (06c; 08b; 08e), cor pulmonale de altura o enfermedad de Monge (08g, dicho en clase). | — |

### Duplicados y superposiciones

1. **«Síndrome varicoso» y «Várices de miembros inferiores»** (ambos de 08i) tienen el mismo texto palabra por palabra. Dejar uno; la nota usa «Várices en miembros inferiores».
2. **Guía del diagnóstico diferencial repetida** (09f): «Cambia con edad, sexo y procedencia…» y «Cambia con la edad y el sexo…». Dejar una. La segunda es la fiel a 09f, que ordena el contexto por edad, sexo, dolor y temperatura; la procedencia no está en ese bloque de 09f (aparece en el ejemplo de la fiebre tifoidea de la nota 01).
3. **Síndrome coledociano** (01) es la forma obstructiva del **síndrome ictérico** (09e); pueden quedar ambos, pero conviene que el cuadro del ictérico diga que la acolia y la coluria son del patrón obstructivo.
4. **Síndrome convulsivo** incluye la epilepsia, que 11e trata como síndrome aparte (síndrome epiléptico). No es un error, pero la nota los diferencia.

### Cuadros incompletos o imprecisos

1. **Síndrome cavitario:** 07e también nombra la vómica entre los síntomas.
2. **Hipertensión portal:** 09e advierte que el material no la desarrolla como entidad propia; el cuadro se armó con menciones dispersas.
3. **Cor pulmonale crónico e insuficiencia respiratoria:** 07e dice que no tienen un patrón propio de los cuatro métodos. El cuadro del cor pulmonale no trae signos; el correlato de 07e da ingurgitación yugular y edema de miembros inferiores.
4. **Abdomen agudo:** solo define y clasifica; no trae síntomas ni signos.
5. **Coartación de aorta:** 08h ubica el soplo sistólico de eyección en el borde esternal izquierdo y el soplo continuo en el dorso; el cuadro dice «soplo sistólico y continuo dorsal».
6. **Síndrome isquémico agudo:** 08i dice que el dolor es súbito en el 70 % de los casos y puede ser insidioso; el cuadro dice «dolor súbito».
7. **Trombosis venosa profunda:** en 08i el signo de Homans aparece como signo de tromboflebitis; la confirmación es la ecografía Doppler, que el cuadro no menciona.
8. **Síndrome meníngeo:** mezcla signos cardinales (rigidez de nuca, Kernig, Brudzinski, Lasègue) con accesorios (fiebre, vómitos) sin separarlos, como sí hace 11e.
9. **Coma:** 05a y el repaso R1 también lo gradúan en grados I a III (o IV); el cuadro solo cita Glasgow.
10. **Infección urinaria alta:** dice «dolor lumbar»; en la redacción semiológica que usa el estudiante corresponde «lumbalgia».
11. **Embarazo ectópico roto:** es de causa ginecológica; se catalogó en digestivo porque 09g lo trata como abdomen agudo hemorrágico.

### Frases

1. **Evolución con abreviaturas:** `a1` a `a4` escriben «S:», «O:», «A:» y «P:», letras sueltas que contradicen la regla de escribir sin abreviaturas (nota 02a). Propuesta: «Subjetivo:», «Objetivo:», «Análisis:» y «Plan:». El formato de cuatro partes no está en las notas; 02c solo enumera su contenido.
2. **`f_evolucion` `a1`** solo pone la fecha; 02c pide fecha y hora.
3. **`f_tratamiento` `a6` (oxígeno):** ninguna nota menciona «cánula binasal» ni «fracción inspirada». `FISIOPATOLOGIA 2026/clases/Clase_33_COR_PULMONALE_CRONICO.md` indica, en el cor pulmonale crónico, oxígeno húmedo por catéter nasal a 1 a 2 litros por minuto durante 16 horas: la dosis se expresa como flujo, no como fracción inspirada. Además, en Puno la saturación normal puede ser de 88 a 92 %.
4. **`f_tratamiento` `a3`:** «reposo relativo» no está en las notas; solo aparecen el reposo en cama con movilización de los miembros inferiores (Fisiopatología, clase 42) y el reposo prolongado como riesgo de trombosis venosa profunda (08i).
5. **`f_tratamiento` `a4`:** dice «funciones vitales»; las notas dicen «signos vitales». Unificar con las demás áreas.
6. **`f_plan` `a3`:** «Se solicita urea y creatinina» debería concordar en plural: «Se solicitan urea y creatinina».
7. **`f_plan` `a5`:** el término «perfil hepático» no está en las notas; 09c nombra sus componentes (bilirrubinas, transaminasas, fosfatasa alcalina, tiempo de protrombina).
8. **Exámenes que las notas piden a menudo y no tienen frase:** urocultivo (10c), electrolitos (08g; 10c), amilasa y lipasa (09g), perfil lipídico (10c), grupo sanguíneo y factor Rh (09g), endoscopia digestiva alta (09c; 09e), tomografía (09c), cultivo de esputo y prueba de tuberculina (07g), ecografía Doppler (08i), fondo de ojo (08g; 10c).

### Escalas

1. **NYHA:** no está en las notas de Semiología (sí en Fisiopatología y Farmacología, con las mismas etiquetas). La clase I es «sin limitación», así que la frase «Disnea en clase funcional I de la NYHA» se contradice un poco: en la clase I la actividad ordinaria no da síntomas. La escala gradúa también fatiga y palpitaciones, no solo disnea.
2. **mMRC y ECOG:** fuera de notas; sus etiquetas no pueden verificarse con el wiki.
3. **Coherencia por campo:** la evolución admite `bristol` y `deshidratacion` pero no `levine` ni `ecog`; el resumen semiológico admite `levine` y `ecog` pero no `bristol` ni `deshidratacion`. Si el resumen reúne todos los datos positivos, quizá deba admitir las mismas escalas que el examen físico.

### Estructura del formulario

1. **Orden de los diagnósticos:** el presuntivo (orden 20) va antes que el sindrómico (orden 30), mientras la nota 01 pone el síndrome como primer paso. Además, el sindrómico es opcional.
2. **Sin campos para pronóstico ni epicrisis:** 02c los pone al final de la historia; hoy solo aparecen como consejos en la guía de la evolución.
3. **Capas funcional, anatómica y etiológica** (nota 01): no tienen campo propio; la guía las manda al diagnóstico presuntivo.
