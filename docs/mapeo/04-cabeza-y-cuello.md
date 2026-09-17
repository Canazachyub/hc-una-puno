# 04 · Examen regional: cabeza, ojos, nariz, oídos, boca y cuello

> Documento de consulta del mapeo de HC App. Fuentes: seed/esquema.csv, seed/opciones.csv, seed/guias.csv y las notas de Semiología. Las definiciones y la guía son para estudiar y llenar la historia; no se imprimen en el Word.

## Resumen

Esta área corresponde a la sección «3.A.2 Examen físico por regiones». Tiene seis campos de tipo Párrafo redactado, ninguno obligatorio: Cabeza, Ojos, Nariz, Oídos, Boca y Cuello. Los seis se llenan igual:

1. **Normal.** El botón escribe la frase normal completa del campo. Si ya hay otro texto, la app pide confirmar antes de reemplazarlo.
2. **Hallazgos alterados.** Cada frase de la lista (códigos `a1`, `a2`…) es un botón. Al tocarlo, la frase se agrega al final del párrafo. Si tiene datos entre llaves, antes se abre un formulario con opciones para completarlos. La app separa cada frase de la anterior con un punto.
3. **Escalas.** Ojos, Boca y Cuello tienen además un botón «+» que agrega el grado de una escala (tabla de abajo).
4. **Pulir redacción.** Ordena el párrafo con Gemini y necesita conexión.
5. **Regla común: describir sin interpretar.** Se escribe lo que se ve, se palpa o se ausculta. La columna «Significado clínico» es para estudiar y razonar el caso; no va en la historia.

**Datos entre llaves.** Las opciones salen de las sugerencias de la app (shared/formato.ts):

| Dato | Opciones | Campos donde aparece |
|---|---|---|
| `{lado}` | derecho, izquierdo o bilateral | Ojos, Oídos, Cuello |
| `{lado_f}` | derecha, izquierda o bilateral (concuerda en femenino) | Cabeza, Ojos, Nariz, Oídos, Boca |
| `{cuero}` | seborrea, caspa, pediculosis o alopecia areata | Cabeza |
| `{pupila_d}` | diámetro de la pupila derecha en milímetros: 2, 3, 4, 5 o 6 | Ojos |
| `{pupila_i}` | diámetro de la pupila izquierda en milímetros: 2, 3, 4, 5 o 6 | Ojos |
| `{rinorrea}` | serosa, purulenta o sanguinolenta | Nariz |
| `{timpano}` | abombada, retraída o perforada | Oídos |
| `{otorrea}` | serosa, mucosa o purulenta | Oídos |
| `{aliento}` | alcohólico, urémico, hepático o cetónico | Boca |
| `{region_cuello}` | anterior, lateral derecha o lateral izquierda | Cuello |
| `{tiroides}` | difuso o nodular | Cuello |
| `{cadena}` | submandibular, cervical anterior, cervical posterior, supraclavicular, preauricular u occipital | Cuello |
| `{cm}` | centímetros, de 1 a 6 | Cuello |

**Escalas que usan estos campos** (vienen de otras áreas, seed/opciones.csv):

| Escala | Grados | Qué escribe | Campos |
|---|---|---|---|
| Palidez, ictericia o cianosis (`cruces`, área 03) | +/+++ leve · ++/+++ moderada · +++/+++ intensa | «Palidez ++/+++» (el hallazgo se elige: palidez, ictericia o cianosis) | Ojos, Boca |
| Grado de deshidratación (`deshidratacion`, área 03) | Leve (menos del 5 %) · Moderada (5 a 9 %, mucosas secas y signo del pliegue) · Grave (10 % o más, hipotensión y oliguria) | «Deshidratación moderada» | Boca |
| Amplitud de pulsos (`pulsos`, área 05) | 0 ausente · 1+ disminuido · 2+ normal · 3+ aumentado · 4+ saltón | «Pulsos 2+/4+» | Cuello |
| Intensidad de soplos de Levine (`levine`, área 05) | I/VI a VI/VI (IV/VI ya tiene frémito) | «Soplo de intensidad III/VI en la escala de Levine» | Cuello |

**Códigos de fuente** (notas de Semiología): 03b instrumentos · 05b hidratación · 05f piel y mucosas · 05g edema · 05j ganglios linfáticos · 05k facies · 06a cabeza, cara y ojos · 06b oídos, nariz y cavidad oral · 06c cuello · 08e pulso venoso yugular · 11d pares craneales · 11e síndromes neurológicos · 11g cefalea · 11j pares oculomotores y pupila · 13a tiroides.

## Cabeza

| Dato | Detalle |
|---|---|
| Identificador | `efr.cabeza` · lista `f_cabeza` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Valor normal | Normocéfalo, sin deformidades ni cicatrices. Cabello de implantación normal. Cuero cabelludo sin lesiones. |
| Escalas que admite | Ninguna |
| Reglas de redacción | Describir sin interpretar |

**Guía**

*Qué usar*

- Cinta métrica para medir diámetros corporales, incluida la cabeza. (03b)

*Cómo explorar*

- Inspección y palpación. Empezar por la posición de la cabeza (normal erecta) y buscar movimientos anormales. (06a)
- Palpar cuero cabelludo: cabello, alopecia, seborrea, pediculosis, lipomas. En el lactante, palpar fontanelas. (06a)
- Simetría facial: comparar ambos lados pidiendo arrugar la frente, cerrar los ojos y sonreír. (06a)

*Qué buscar*

- Signo de Musset: leve flexión de la cabeza sincrónica con cada latido (insuficiencia aórtica). (06a)
- Circunferencia normal 54 cm en mujer y 56 cm en varón. Macrocefalia si aumenta, microcefalia menor de 51 cm. (06a)
- Fontanela hundida: deshidratación. Abombada: hidrocefalia. Anterior cierra a los 10-20 meses, posterior hacia los 2 meses. (06a)
- Parálisis facial periférica: toda la hemicara, sin arrugas frontales, no cierra el ojo, comisura desviada al lado sano. (06a)

**Hallazgos**

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| n (Normal) | Normocéfalo, sin deformidades ni cicatrices. Cabello de implantación normal. Cuero cabelludo sin lesiones. | Cráneo de forma y tamaño normales: circunferencia de 54 cm en la mujer y 56 cm en el varón. | 06a |
| a1 | Se palpan puntos dolorosos en | Dolor a la palpación de un sitio del cráneo o la cara; en la cefalea se palpan articulación temporomandibular, senos maxilares y músculos del cuello. | 06a; 11g |
| a2 | Cabeza inclinada lateralmente. | Posición anormal de la cabeza; se inclina en amigdalitis, tortícolis, tétanos o meningitis, y para compensar la parálisis del cuarto par craneal. | 06a; 11j |
| a3 | Signo de Musset: leve flexión de la cabeza sincrónica con cada latido. | Flexión de la cabeza sincrónica con el latido por la amplitud del pulso arterial; característico de la insuficiencia aórtica. | 06a; 08e |
| a4 | Cuero cabelludo con {cuero}. | Hallazgo del cuero cabelludo: seborrea, caspa, pediculosis (escolares con higiene deficiente) o alopecia areata. | 06a |
| a5 | Asimetría facial. | Pérdida de simetría entre ambas hemicaras; en parálisis facial, parotiditis, tumores, secuelas de accidente cerebrovascular o cardiopatías embolígenas. | 06a |
| a6 | Hemicara {lado_f} con borramiento de arrugas frontales, ceja descendida, cierre palpebral incompleto, surco nasogeniano borrado y comisura labial desviada al lado sano. | Parálisis facial periférica: lesión del nervio facial que compromete toda la hemicara, incluida la frente; la central respeta la frente. | 06a; 11d |
| a7 | Edema facial. | Hinchazón de la cara; síndrome nefrótico (facial y palpebral, matutino), nefrítico, Cushing, preeclampsia u obstrucción de la vena cava superior. | 05g |
| a8 | Eritema en alas de mariposa sobre mejillas y nariz. | Eritema papuloescamoso sobre mejillas y nariz; característico del lupus eritematoso sistémico. | 05k; 06b |
| a9 | Signo de Chvostek positivo. | Contracción exagerada de músculos faciales al percutir el arco cigomático; hipersensibilidad del nervio facial en tetania e hipocalcemia. | 06b; 11d |
| a10 | Madarosis. | Caída de las cejas; se observa en mixedema, lepra, desnutrición avanzada, sífilis y esclerodermia. | 06a |

Datos entre llaves: `{cuero}` = seborrea, caspa, pediculosis o alopecia areata · `{lado_f}` = derecha, izquierda o bilateral (concuerda en femenino).

- `a1` no tiene dato entre llaves ni punto final: la app deja el cursor al final para escribir el sitio (por ejemplo, «región frontal»).
- `a6` describe la parálisis facial periférica sin nombrarla; eso respeta la regla de describir sin interpretar.

## Ojos

| Dato | Detalle |
|---|---|
| Identificador | `efr.ojos` · lista `f_ojos` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Valor normal | Simétricos, sin edema palpebral. Conjuntivas rosadas. Escleras anictéricas. Pupilas isocóricas de 3 mm, reactivas a la luz y a la acomodación. Movimientos oculares conservados. |
| Escalas que admite | Palidez, ictericia o cianosis (lista `cruces`, área 03) |
| Reglas de redacción | Describir sin interpretar |

**Guía**

*Qué usar*

- Linterna para los reflejos pupilares. Una gasa para el reflejo corneal. (06a)

*Cómo explorar*

- Interrogar primero: dolor, ardor, epífora, ojo seco, ojo rojo, diplopía, fotofobia y secreción. (06a)
- Palpar el globo con párpados cerrados y compresión suave: tensión alta en glaucoma, baja en deshidratación. (06a)
- Reflejos: fotomotor (iluminar un ojo), consensual (se contrae el otro) y acomodación (acercar un objeto a la nariz). (06a)

*Qué buscar*

- Mirada, exoftalmos (bilateral en Graves) o enoftalmos. Ptosis, enoftalmos y miosis unilaterales: Claude Bernard Horner. (06a)
- Párpados, cerrados y luego abiertos: edema, xantelasma, ptosis, ectropión, entropión, orzuelo, chalazión. (06a)
- Conjuntiva pálida, amarilla o hiperémica. Esclerótica ictérica. Córnea opaca, diferenciar del arco senil. (06a)
- Pupilas redondas, centrales, 2-4 mm, isocóricas. Miosis menos de 2 mm, midriasis más de 4-7 mm. Catarata: pupila blanca. (06a)

**Hallazgos**

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| n (Normal) | Simétricos, sin edema palpebral. Conjuntivas rosadas. Escleras anictéricas. Pupilas isocóricas de 3 mm, reactivas a la luz y a la acomodación. Movimientos oculares conservados. | Pupilas redondas, centrales e iguales, de 2 a 4 mm (promedio 3 mm), con reflejos fotomotor, consensual y de acomodación presentes. | 06a; 11j |
| a1 | Conjuntivas pálidas | Palidez de la mucosa conjuntival; orienta a anemia. Se gradúa con la escala de cruces. | 06a; 05f |
| a2 | Escleras ictéricas | Coloración amarilla por bilirrubina mayor de 2,5 mg/dl, mejor vista en la esclerótica; orienta a síndrome ictérico. Se gradúa con cruces. | 05f; 06a |
| a3 | Conjuntivas hiperémicas. | Enrojecimiento conjuntival por más glóbulos rojos o inflamación: conjuntivitis, poliglobulia de altura, alergia o traumatismo. | 06a; 05f |
| a4 | Exoftalmos {lado}. | Protrusión del globo ocular; bilateral en Graves-Basedow; unilateral en fístula arteriovenosa, trombosis del seno cavernoso o hematoma retrobulbar. | 06a |
| a5 | Ptosis palpebral {lado_f}. | Caída del párpado superior; por parálisis del tercer par craneal, miastenia gravis o, con miosis y enoftalmos, síndrome de Claude Bernard Horner. | 06a; 11j |
| a6 | Pupilas anisocóricas: derecha de {pupila_d} mm e izquierda de {pupila_i} mm. | Pupilas de distinto diámetro; suele ser patológica (tercer par, síndrome de Horner), aunque el 5 % de la población la tiene leve y fisiológica. | 11j |
| a7 | Miosis bilateral. | Pupilas menores de 2 mm; con reflejo fotomotor conservado orienta a coma metabólico; puntiformes, a lesión pontina o uso de opioides. | 11j; 11e |
| a8 | Midriasis {lado_f}. | Pupila mayor de 6 mm (4 a 7 mm según el autor); unilateral y sin respuesta a la luz sugiere parálisis completa del tercer par craneal. | 11j; 06a |
| a9 | Reflejo fotomotor ausente en ojo {lado}. | La pupila no se contrae al iluminarla; lesión de la vía aferente (nervio óptico, retina) o de la eferente (tercer par craneal). | 11j |
| a10 | Edema palpebral {lado}. | Hinchazón del párpado; síndrome nefrótico o nefrítico, edema alérgico o de Quincke, mixedema o signo de Romaña (enfermedad de Chagas). | 06a; 05g |
| a11 | Xantelasma en párpado {lado}. | Placas amarillentas sobreelevadas en el ángulo interno del párpado por depósito de lípidos; sugiere hipercolesterolemia. | 06a |
| a12 | Pterigión en ojo {lado}. | Repliegue conjuntival que crece desde el ángulo interno (pingüécula crecida, la carnosidad popular); favorecido por el polvo. | 06a |
| a13 | Opacidad del cristalino en ojo {lado}. | Catarata: opacificación del cristalino vista como pupila blanquecina; frecuente en la vejez, la diabetes mellitus y el uso prolongado de corticoides. | 06a |

Datos entre llaves: `{lado}` = derecho, izquierdo o bilateral · `{lado_f}` = derecha, izquierda o bilateral (concuerda en femenino) · `{pupila_d}` = diámetro de la pupila derecha en milímetros: 2, 3, 4, 5 o 6 · `{pupila_i}` = diámetro de la pupila izquierda en milímetros: 2, 3, 4, 5 o 6.

- `a1` y `a2` no terminan en punto: se puede escribir el grado a mano a continuación («Conjuntivas pálidas ++/+++») o usar el botón de la escala de cruces.
- `a6` pide los dos diámetros por separado; el valor normal del campo usa 3 mm.

## Nariz

| Dato | Detalle |
|---|---|
| Identificador | `efr.nariz` · lista `f_nariz` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Valor normal | Fosas nasales permeables, mucosa rosada, sin secreciones ni epistaxis. Senos paranasales no dolorosos a la palpación. |
| Escalas que admite | Ninguna |
| Reglas de redacción | Describir sin interpretar |

**Guía**

*Cómo explorar*

- Permeabilidad: ocluir un orificio con el dedo mientras respira por el otro, y luego al revés. Normal: fácil y silenciosa. (06b)
- Presionar sobre los pómulos buscando dolor (sinusitis). (06b)
- Olfato (I par): cada fosa por separado, ojos cerrados, con sustancias no irritantes (menta, café, canela, clavo). (11d)

*Qué buscar*

- Forma: nariz en silla de montar (sífilis), rinofima, eritema en alas de mariposa (lupus), telangiectasias (alcoholismo). (06b)
- Aleteo nasal exagerado: disnea intensa. (06b)
- Secreción serosa y blanquecina en rinitis alérgica, purulenta verde-amarillenta en sinusitis. Anotar epistaxis. (06b)

**Hallazgos**

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| n (Normal) | Fosas nasales permeables, mucosa rosada, sin secreciones ni epistaxis. Senos paranasales no dolorosos a la palpación. | Respiración nasal fácil y silenciosa por cada fosa. | 06b |
| a1 | Presenta aleteo nasal. | Movimiento exagerado de las alas nasales al respirar; traduce disnea intensa (bronconeumonía, asma infantil). | 06b; 05k |
| a2 | Nariz en silla de montar. | Nariz hundida por destrucción de los huesos nasales; se asocia a sífilis, incluso congénita. | 06b |
| a3 | Rinofima. | Hipertrofia rosada violácea de la nariz (nariz de tomate) por crecimiento glandular y de tejido conjuntivo. | 06b |
| a4 | Fosa nasal {lado_f} no permeable. | Obstrucción al paso del aire por la fosa; por rinitis, pólipos o hipertrofia de cornetes; si es bilateral produce disnea nasal. | 06b |
| a5 | Rinorrea {rinorrea}. | Secreción nasal: serosa y blanquecina en rinitis alérgica, purulenta verde amarillenta en sinusitis; también puede ser sanguinolenta. | 06b |
| a6 | Dolor a la presión sobre los pómulos. | Sensibilidad dolorosa a la presión sobre los pómulos; orienta a sinusitis. | 06b |
| a7 | Epistaxis por fosa nasal {lado_f}. | Hemorragia nasal; causas locales (traumatismo, rinitis, sinusitis, tumores, cocaína) o sistémicas (hipertensión arterial, cirrosis, hemofilia, leucemia). | 06b |
| a8 | Hiposmia {lado_f}. | Disminución del olfato (primer par craneal); por pólipos, hipertrofia de cornetes, neuritis gripal o hipertensión intracraneana. | 06b; 11d |

Datos entre llaves: `{lado_f}` = derecha, izquierda o bilateral (concuerda en femenino) · `{rinorrea}` = serosa, purulenta o sanguinolenta.

## Oídos

| Dato | Detalle |
|---|---|
| Identificador | `efr.oidos` · lista `f_oidos` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Valor normal | Pabellones auriculares de implantación normal, conductos permeables sin secreciones. Audición conservada bilateral. |
| Escalas que admite | Ninguna |
| Reglas de redacción | Describir sin interpretar |

**Guía**

*Qué usar*

- Otoscopio para el conducto auditivo y la membrana timpánica. (06b)
- Diapasón de 512 a 1024 Hz si se detecta hipoacusia. (11d)

*Cómo explorar*

- Otoscopia: traccionar el pabellón hacia arriba, atrás y afuera. Revisar conducto (cerumen, cuerpo extraño) y tímpano. (06b)
- Audición gruesa: comparar voz normal y cuchicheada, o reloj a 20 cm del oído. (06b)
- Rinne: diapasón en la mastoides hasta que deje de oír, luego a 2-3 cm del conducto. Normal: vuelve a oírlo por vía aérea. (11d)
- Weber: diapasón en el vértex. Normal en la línea media. Lateraliza al oído sordo en conducción, al sano en neurosensorial. (11d)

*Qué buscar*

- Pabellón: aotía, microtia, macrotia, tofos. Dolor al presionar la mastoides orienta a mastoiditis. (06b)
- Membrana timpánica normal blanca translúcida, íntegra y adherida. En otitis: abombada, retraída o desgarrada. (06b)

**Hallazgos**

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| n (Normal) | Pabellones auriculares de implantación normal, conductos permeables sin secreciones. Audición conservada bilateral. | Pabellón sin anomalías; si se hace otoscopia, membrana timpánica blanca translúcida, íntegra y adherida. | 06b |
| a1 | Tapón de cerumen en conducto auditivo {lado}. | Cerumen que ocluye el conducto auditivo externo; causa ótica, local y corregible, de acúfenos. | 06b |
| a2 | Membrana timpánica {lado_f} {timpano}. | Membrana no blanca translúcida ni íntegra: abombada o retraída en la otitis; desgarrada o perforada, puede dar otorragia. | 06b |
| a3 | Otorrea {otorrea} por oído {lado}. | Salida de líquido por el oído: seroso, mucoso o purulento; el líquido claro sugiere líquido cefalorraquídeo por fractura de base de cráneo. | 06b |
| a4 | Otorragia por oído {lado}. | Salida de sangre por el conducto auditivo; por traumatismo del conducto o ruptura de la membrana timpánica. | 06b |
| a5 | Dolor a la presión de la apófisis mastoides {lado_f}. | Dolor que se exacerba al presionar la apófisis mastoides; orienta a mastoiditis como causa de otalgia. | 06b |
| a6 | Tofos en pabellón auricular {lado}. | Depósitos en el pabellón auricular que traducen hiperuricemia. | 06b |
| a7 | Disminución de la agudeza auditiva en oído {lado} a la voz cuchicheada. | Hipoacusia o disacusia al comparar voz normal y cuchicheada; se precisa con diapasón si es de conducción o de percepción. | 06b; 11d |
| a8 | Weber lateralizado hacia oído {lado}. | Con el diapasón en el vértex: hacia el oído sordo indica hipoacusia de conducción; hacia el oído sano, hipoacusia neurosensorial del otro. | 11d |
| a9 | Rinne patológico en oído {lado}. | La vía ósea se conserva o supera a la aérea (lo normal es lo contrario); orienta a hipoacusia de conducción en ese oído. | 11d |

Datos entre llaves: `{lado}` = derecho, izquierdo o bilateral · `{lado_f}` = derecha, izquierda o bilateral (concuerda en femenino) · `{timpano}` = abombada, retraída o perforada · `{otorrea}` = serosa, mucosa o purulenta.

- `a8`: en la prueba de Weber el sonido se lateraliza hacia un solo oído; elegir derecho o izquierdo, nunca bilateral.

## Boca

| Dato | Detalle |
|---|---|
| Identificador | `efr.boca` · lista `f_boca` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Valor normal | Labios de coloración normal, mucosa oral húmeda. Dentadura en regular estado de conservación. Lengua húmeda, sin saburra. Orofaringe sin congestión, amígdalas no hipertróficas. |
| Escalas que admite | Palidez, ictericia o cianosis (lista `cruces`, área 03); Grado de deshidratación (lista `deshidratacion`, área 03) |
| Reglas de redacción | Describir sin interpretar |

**Guía**

*Qué usar*

- Bajalenguas y linterna o buena luz para la cavidad oral y la garganta. (03b)

*Cómo explorar*

- Retirar prótesis. Ver labios, mucosa, encías (cara labial y lingual) y contar dientes: 20 temporales, 32 permanentes. (06b)
- Faringe: presionar con el bajalenguas el lateral de la lengua, nunca la punta ni la base, y pedir que pronuncie A. (06b)
- Lengua en tres posiciones: en reposo, protruida y con la punta hacia el paladar. Desvío al protruir: hemiplejia o XII par. (06b)

*Qué buscar*

- Faringe roja (faringitis), amígdalas crecidas o supuradas (amigdalitis). Trismus: no puede abrir la boca. (06b)
- Lengua seca (descartar respiración bucal), en fresa, blanca por cándida, saburral, escrotal, macroglosia. (06b)
- Labios pálidos, cianóticos o con queilitis. Manchas de Koplik frente a molares, placas de cándida, pigmento de Addison. (06b)
- Aliento alcohólico, urémico, hepático o cetónico (a manzana). Halitosis por mal aseo, caries o infección. (06b)

**Hallazgos**

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| n (Normal) | Labios de coloración normal, mucosa oral húmeda. Dentadura en regular estado de conservación. Lengua húmeda, sin saburra. Orofaringe sin congestión, amígdalas no hipertróficas. | Mucosa rosada y húmeda (buena hidratación); lengua rojo rosada, levemente húmeda y discretamente rugosa. | 06b; 05f |
| a1 | Mucosa oral seca. Lengua saburral. | Mucosa seca: deshidratación (descartar respiración bucal). Lengua saburral: capa blanca o lengua sucia (fiebre tifoidea); poco valor aislada. | 06b; 05b |
| a2 | Cianosis peribucal. | Coloración azulada alrededor de la boca por hemoglobina reducida mayor de 5 g/dl; orienta a dificultad respiratoria o hipoxemia. | 05f; 06b |
| a3 | Labios pálidos. | Pérdida del color rosado normal de los labios; orienta a anemia. | 06b |
| a4 | Queilitis angular. | Inflamación de las comisuras labiales; por frío, anemia o carencia de vitaminas del complejo B. | 06b |
| a5 | Herpes labial. | Lesión herpética del labio; acompaña a la facies neumónica (herpes en la comisura labial). | 06b; 05k |
| a6 | Placas blancas adherentes en mucosa oral. | Estomatitis por Cándida albicans: placas blancas adherentes, a veces con halo rojo; frecuente en niños desnutridos. | 06b |
| a7 | Faringe eritematosa. | Enrojecimiento de la faringe al explorarla con bajalenguas; orienta a faringitis. | 06b |
| a8 | Amígdalas hipertróficas y supuradas. | Amígdalas crecidas y con pus; orienta a amigdalitis, estreptocócica o viral. | 06b |
| a9 | Lengua desviada hacia la {lado_f} al protruirla. | Desvío de la lengua protruida hacia el lado paralizado; lesión del nervio hipogloso o hemiplejia por accidente cerebrovascular. | 06b; 11d |
| a10 | Encías eritematosas, esponjosas y sangrantes. | Gingivitis: encías rojas, esponjosas y sangrantes; se ve en pelagra, escorbuto y linfomas. | 06b |
| a11 | Piezas dentarias ausentes. | Número de dientes menor al normal (32 en el adulto, 20 en el niño); anotar cuáles faltan y si usa prótesis. | 06b |
| a12 | Aliento {aliento}. | Olor que orienta: urémico (a orina) en insuficiencia renal, hepático (a carne descompuesta), cetónico (a manzana) en cetoacidosis diabética, o alcohólico. | 06b |
| a13 | Halitosis. | Mal aliento por mal aseo bucal, restos alimenticios, caries o infecciones bucales o respiratorias. | 06b |

Datos entre llaves: `{lado_f}` = derecha, izquierda o bilateral (concuerda en femenino) · `{aliento}` = alcohólico, urémico, hepático o cetónico.

- `a1` agrega dos hallazgos a la vez; si solo hay uno, borrar el que no corresponde.
- `a9`: elegir derecha o izquierda; la lengua no se desvía a ambos lados.

## Cuello

| Dato | Detalle |
|---|---|
| Identificador | `efr.cuello` · lista `f_cuello` |
| Tipo · Obligatorio | Párrafo redactado · No |
| Valor normal | Cilíndrico, móvil, sin rigidez de nuca. Tráquea centrada. Tiroides no palpable. No se palpan adenopatías. Sin ingurgitación yugular. No se auscultan soplos carotídeos. |
| Escalas que admite | Amplitud de pulsos (lista `pulsos`, área 05); Intensidad de soplos de Levine (lista `levine`, área 05) |
| Reglas de redacción | Describir sin interpretar |

**Guía**

*Qué usar*

- Estetoscopio para auscultar tiroides y vasos. En el cuello no se percute. (06c)

*Posición*

- Yugulares: paciente a 30-45°, cabeza algo rotada a la izquierda, luz tangencial. Preferir la yugular derecha. (06c)

*Cómo explorar*

- Ganglios: examinador detrás, cuello algo flexionado e inclinado al lado examinado, palpar con índice, medio y anular. (05j)
- De Quervain: paciente sentado, examinador detrás, pulgares en la nuca (séptima vértebra cervical), palpar cada lóbulo separando el esternocleidomastoideo. (06c)
- Lahey: examinador de frente, ambos pulgares sobre la tiroides y pedir que degluta para ver su movilidad. (06c)
- Reflujo hepatoyugular: comprimir el hipocondrio derecho 30-60 s. Positivo si aumenta la ingurgitación yugular. (08e)

*Qué buscar*

- Forma, posición, movilidad, latido carotídeo, ingurgitación yugular y cicatrices (tiroidectomía, biopsia). (06c)
- Tiroides: volumen (bocio), consistencia, temperatura, movilidad al deglutir, superficie, nódulos, frémito, soplo, dolor. (06c)

**Hallazgos**

| Código | Frase que se escribe | Significado clínico | Fuente |
|---|---|---|---|
| n (Normal) | Cilíndrico, móvil, sin rigidez de nuca. Tráquea centrada. Tiroides no palpable. No se palpan adenopatías. Sin ingurgitación yugular. No se auscultan soplos carotídeos. | Cuello casi cilíndrico y móvil; ganglios normalmente no palpables; tiroides impalpable, o lisa, elástica y móvil en personas delgadas. | 06c |
| a1 | Ingurgitación yugular a 45° hasta {cm} cm sobre el ángulo esternal, con reflujo hepatoyugular positivo. | Presión elevada en la aurícula derecha: insuficiencia cardiaca derecha, sobrecarga hídrica, taponamiento, pericarditis constrictiva o síndrome mediastínico. | 08e; 06c |
| a2 | Se palpan adenopatías en cadena | Ganglios palpables (normalmente no se palpan); describir tamaño, número, consistencia, sensibilidad y adherencia. | 06c; 05j |
| a3 | Reflujo hepatoyugular positivo. | La ingurgitación yugular aumenta al comprimir el hipocondrio derecho durante 30 a 60 segundos; traduce insuficiencia cardiaca derecha. | 06c; 08e |
| a4 | Signo de Kussmaul positivo: la ingurgitación yugular aumenta con la inspiración. | La ingurgitación yugular aumenta al inspirar en vez de disminuir; característico de la pericarditis constrictiva. | 06c; 08e |
| a5 | Latidos carotídeos amplios y visibles (danza arterial). | Latidos arteriales amplios visibles en el cuello; insuficiencia aórtica o estados hiperdinámicos (fiebre, anemia, hipertiroidismo). | 08e; 06c |
| a6 | Frémito palpable en región {region_cuello} del cuello. | Vibración palpable; casi siempre soplo irradiado de estenosis aórtica; también estrechez carotídea, aneurisma o bocio hiperfuncionante. | 08e; 06c |
| a7 | Soplo sistólico en trayecto carotídeo {lado}. | Soplo arterial por obstrucción (estrechez, aneurisma), estado hipercinético o irradiación de una estenosis aórtica. | 06c |
| a8 | Aumento de volumen tiroideo {tiroides}, móvil con la deglución. | Bocio difuso o nodular; con soplo orienta a bocio tóxico (Basedow-Graves); sin soplo, no tóxico: pubertad, embarazo o déficit de yodo. | 06c; 13a |
| a9 | Adenopatía en cadena {cadena}, de {cm} cm. | Ganglio palpable; la cadena orienta: submandibular a infección viral o periodontal, preauricular a virus o linfoma, supraclavicular a metástasis. | 05j |
| a10 | Adenopatía supraclavicular izquierda. | Ganglio de Virchow-Troisier: prácticamente patognomónico de cáncer gástrico metastásico; el signo solo vale del lado izquierdo. | 06c; 05j |
| a11 | Rigidez de nuca. | Resistencia dolorosa a la flexión pasiva del cuello; signo de irritación meníngea (meningitis). No confundir con tortícolis. | 06c; 11e |

Datos entre llaves: `{cm}` = centímetros, de 1 a 6 · `{region_cuello}` = anterior, lateral derecha o lateral izquierda · `{lado}` = derecho, izquierdo o bilateral · `{tiroides}` = difuso o nodular · `{cadena}` = submandibular, cervical anterior, cervical posterior, supraclavicular, preauricular u occipital.

- `a2` no tiene dato entre llaves ni punto final: escribir a mano la cadena. `a9` hace lo mismo con menú de cadenas y tamaño.
- `a1` ya incluye el reflujo hepatoyugular positivo; no marcar además `a3`.
- `a10` es el ganglio de Virchow-Troisier: solo se usa si está en la fosa supraclavicular izquierda.

## Discrepancias y pendientes

### Frases que conviene revisar

- `f_cabeza a1` («Se palpan puntos dolorosos en») y `f_cuello a2` («Se palpan adenopatías en cadena») quedan abiertas, sin dato entre llaves. Si se toca otro botón antes de escribir el sitio, la app pone un punto y la frase queda trunca. Sugerencia: «Se palpan puntos dolorosos en {sitio}.». Además, `f_cuello a2` hace casi lo mismo que `a9` («Adenopatía en cadena {cadena}, de {cm} cm.»); conviene dejar solo una.
- `f_ojos a1` («Conjuntivas pálidas») y `a2` («Escleras ictéricas») no terminan en punto. Si después se usa el botón de cruces, el párrafo queda «Conjuntivas pálidas. Palidez ++/+++», que repite el hallazgo. Sugerencia: que el grado se pida dentro de la misma frase.
- `f_cuello a1` ya trae «con reflujo hepatoyugular positivo» y `a3` es ese mismo signo. Si se marcan los dos, se repite. Además, no toda ingurgitación yugular tiene reflujo positivo. Sugerencia: que `a1` termine en «…sobre el ángulo esternal.».
- `f_boca a1` junta dos hallazgos con significado distinto: la mucosa seca habla de hidratación y la lengua saburral tiene poco valor por sí sola (06b). Sugerencia: separarlos en dos botones.
- `f_oidos a9` («Rinne patológico») interpreta en vez de describir, y la regla del campo pide describir. Sugerencia: «Prueba de Rinne en oído {lado}: la vía ósea se percibe igual o más que la aérea.» (11d).
- `f_cabeza a2` («Cabeza inclinada lateralmente.») no pide hacia qué lado. Sugerencia: agregar el lado, sin la opción bilateral.
- Valor normal de Boca: «Dentadura en regular estado de conservación» es una valoración, no un hallazgo normal. Las notas piden anotar el número de piezas (20 o 32) y su conservación (06b). Sugerencia: «Dentadura completa y conservada».
- Valor normal de Cuello: «Tráquea centrada» no aparece en las notas (fuera de notas) y la lista no tiene ninguna frase para una tráquea desviada.

### Datos entre llaves

- `{lado}` y `{lado_f}` ofrecen «bilateral». En algunas frases eso no tiene sentido: Weber lateralizado (`f_oidos a8`), lengua desviada (`f_boca a9`) y hemicara (`f_cabeza a6`), que describe una parálisis de un solo lado. En otras se lee mal: «en ojo bilateral», «por oído bilateral», «en párpado bilateral», «fosa nasal bilateral», «membrana timpánica bilateral» (`f_ojos a9`, `a11`, `a12`, `a13`; `f_oidos a1` a `a4`, `a6`, `a7`, `a9`; `f_nariz a4`, `a7`). Sugerencia: quitar «bilateral» en Weber, lengua y hemicara, y en las demás escribir «en ambos ojos» o «en ambos oídos».
- A `{otorrea}` le falta «clara». Según 06b, el líquido claro sugiere líquido cefalorraquídeo por fractura de base de cráneo, que es un hallazgo de alarma. A `{rinorrea}` se le podría sumar «con falsas membranas» (difteria, 06b).
- `{cadena}` no incluye las cadenas amigdaliana, submentoniana ni retroauricular. La retroauricular orienta a rubeola, sarampión o toxoplasmosis (05j).
- `{timpano}` dice «perforada» y la nota dice «desgarrada». Significan lo mismo; no hay que cambiar nada.

### Valores o definiciones dudosas

- Tamaño de la pupila: 06a da 2 a 4 mm como normal y midriasis por encima de 4 a 7 mm. 11j da 2 a 6 mm (promedio 3 mm) y midriasis por encima de 6 mm. La guía de Ojos sigue a 06a, pero `{pupila_d}` y `{pupila_i}` llegan hasta 6 mm.
- Membrana timpánica normal: blanca translúcida según el apunte de 2020 y rosa pálida y lustrosa según el de 2018 (06b).
- Escala `deshidratacion` (área 03): el seed dice leve menos del 5 %, moderada 5 a 9 % y grave 10 % o más. 05b dice leve 5 %, moderada 5 a 10 % y grave más de 10 %. Revisar en el área 03.
- `f_cuello a1` pide la altura de la ingurgitación «hasta {cm} cm sobre el ángulo esternal». Ese método no aparece en las notas (fuera de notas). 08e solo estima la presión venosa central levantando el brazo (normal de 8 a 12 cm de agua).
- `f_nariz a3` (rinofima): las notas la describen pero no dicen qué enfermedad la produce (fuera de notas).
- `f_cabeza a1`: las notas no nombran puntos dolorosos del cráneo. La definición usa lo que 11g manda palpar en la cefalea.
- `f_ojos a7` (miosis bilateral): 06a solo la define; su significado sale de la tabla de coma de 11e.

### Textos de la guía con diminutivo o abreviatura (seed/guias.csv)

- Ojos, «Qué usar»: el seed usa el diminutivo de «gasa». Aquí se escribió «Una gasa».
- Cuello, «Cómo explorar» (maniobra de De Quervain): el seed nombra la vértebra con su sigla. Aquí se escribió «(séptima vértebra cervical)».

### Hallazgos de las notas que la lista no tiene (sugerencias; no se agregaron)

- **Cabeza:** macrocefalia o microcefalia (circunferencia menor de 51 cm); fontanela hundida o abombada en el lactante; movimientos anormales (temblor, tics, corea); abultamiento parotídeo; telangiectasias faciales; hiperpigmentación facial de altura (06a, 06b).
- **Ojos:**
  - Movimientos oculares alterados o diplopía. El valor normal dice «Movimientos oculares conservados», pero no hay frase para cuando están alterados (parálisis del tercer, cuarto y sexto par, 11j).
  - Nistagmo.
  - Enoftalmos: bilateral en la deshidratación y unilateral en el síndrome de Horner.
  - Tríada de Claude Bernard Horner y miosis de un solo lado.
  - Reflejo corneal ausente.
  - Opacidad de la córnea y arco senil.
  - Quemosis, ectropión, entropión, orzuelo, chalazión y blefaritis.
  - Globo ocular duro (glaucoma) o blando (deshidratación) al palparlo.
  - Fuentes: 06a y 11j.
- **Nariz:** anosmia; rubicundez con telangiectasias por alcoholismo (la guía la menciona, pero no hay botón); nariz ancha y chata del mixedema (06b, 11d).
- **Oídos:** anomalías del pabellón (aotía, microtia, macrotia); cuerpo extraño en el conducto; signo de Romberg positivo, si no está en el área neurológica (06b, 11d).
- **Boca:**
  - La guía menciona manchas de Koplik (sarampión), lengua en fresa (escarlatina) y pigmentación de Addison, pero no tienen botón.
  - Lengua blanca por cándida, macroglosia, lengua escrotal y glositis.
  - Trismus.
  - Hiperplasia de encías por hidantoínas y ribete de plomo en las encías.
  - Dientes de Hutchinson.
  - Ictericia en el frenillo lingual.
  - Úvula desviada y reflejo nauseoso ausente.
  - Fuentes: 06b, 05f y 11d.
- **Cuello:**
  - Soplo tiroideo. Es el dato que separa el bocio tóxico del no tóxico (06c, 13a).
  - Tiroides dura como piedra (pétrea) o fija (orienta a cáncer) y nódulo tiroideo.
  - Características del ganglio: duro, fijo, fluctuante o fistulizado (escrófulas), o separados y duros como en el collar de caballo del linfoma.
  - Signos de Kernig y Brudzinski, si no están en el área neurológica.
  - Tortícolis, cicatriz de tiroidectomía, edema en esclavina, collar de Casal y latido carotídeo disminuido.
  - Fuentes: 06c, 05j y 08e.
