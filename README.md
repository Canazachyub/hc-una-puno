# HC App · historia clínica al pie de la cama

App personal de un solo usuario para llenar historias clínicas con la plantilla de la Facultad de Medicina Humana de la UNA Puno, **eligiendo antes que escribiendo**, con apoyo de voz o texto libre, y exportarlas a Word con un clic.

En esta carpeta:

- `plantilla-historia-clinica.pdf` — la fuente de verdad. De ahí salen las secciones, el orden y el membrete del Word.
- `seed/esquema.csv` — los 152 campos de la historia, ya definidos.
- `seed/opciones.csv` — las 99 listas de opciones, escalas y frases, ya definidas.
- `seed/guias.csv` — la guía de llenado sacada de las notas: cómo preguntar, cómo explorar, valores normales, exámenes, síndromes y umbrales de signos vitales con su nivel de gravedad, por edad y altitud (1047 entradas).
- `seed/definiciones.csv` — 496 definiciones buscadas en las notas y el significado clínico de cada hallazgo del examen físico.
- `seed/laboratorio.csv` — 74 parámetros de laboratorio con sinónimos, unidad, rangos por sexo y edad, y su semáforo.
- `seed/sindromes.json` — los 87 síndromes de la guía convertidos en criterios (cardinales y de apoyo) con qué explorar para confirmarlos.
- `web/` — la app (Vite + React). `backend/` — Apps Script. `shared/` — tipos y lógica común. `scripts/` — notas → Knowledge, membrete, pruebas.

## Estado

Fases 1 a 4 construidas y probadas, con las mejoras 2, 4, 5, 6, 7, 8 y 12 de la revisión de septiembre de 2026 (ver **Mejoras**).

- **En línea**: el backend va en Apps Script y la app en GitHub Pages (ver **Despliegue en línea**). Se entra desde cualquier red con usuario y contraseña; no hace falta estar en la misma Wi-Fi que la PC.
- **En local**: el mismo backend corre en la PC sobre un Apps Script emulado (ver **Despliegue local**). Sirve para desarrollar, probar y como respaldo.
- `npm test` corre 83 pruebas: la capa compartida, escalas, semáforo, definiciones, valores normales por edad y altitud, laboratorio (ajuste de hemoglobina por altura, unidades, rango del informe), síndromes (negaciones, palabras completas), seguimiento, escritura sin siglas, migraciones, fechas, el documento (con tabla de laboratorio y evoluciones), el acceso, el backend completo sobre un Apps Script emulado (con Gemini simulado: foto del informe, redacciones, decisiones) y la persistencia en disco.
- El recorrido de la interfaz se probó con Edge y Gemini real: PIN y cifrado, síndromes, seguimiento con nota SOAP, laboratorio a mano y con foto, vista previa, presentación de caso, epicrisis en Word, decisiones, bloqueo y altitud.
- `npm run word:ejemplo` genera `salida/HC_Quispe_Mamani_40123456_ep1.docx` con una historia ficticia para revisar el formato.

---

## Principio de diseño

**Escribir es el último recurso.** Todo campo que pueda resolverse eligiendo, se elige. Grado de instrucción no se escribe: se toca "Secundaria completa". El examen físico no se escribe desde cero: se toca "Normal" y se corrige lo que esté alterado. El edema no se describe: se elige el grado en la escala y la app arma la frase.

Solo tres cosas se escriben de verdad: el relato cronológico, el resumen semiológico y los detalles que ninguna lista puede prever. Y para esos tres está la entrada libre con Gemini.

Segundo principio: **menos es más**. Si dudas entre dos caminos, toma el que tenga menos piezas.

---

## Decisiones tomadas

No las reabras.

- Un solo usuario. Sin roles, sin docentes, sin compartir.
- Frontend estático en GitHub Pages. Backend en Apps Script. Datos en una hoja de cálculo de Google.
- **Cinco hojas.** Una historia clínica es **una fila**. La clave es el DNI.
- TypeScript en las dos capas. Vite + React en el frontend. `clasp` para el backend.
- **El Word se genera en el navegador** con la librería `docx`. Un clic, sin ida y vuelta, funciona sin señal.
- La API key de Gemini vive en Script Properties. El navegador nunca la ve.
- Las notas de Semiología están en Markdown en `C:\Users\User\Documents\CEREBRO DIGITAL\MEDICINA UNAP\MEDICINA UNAP\wiki\SEMIOLOGIA\clases`.

No uses Next.js. No hay renderizado en servidor que lo justifique.

---

## Arquitectura

```
Navegador (GitHub Pages)          Apps Script              Google
  formulario por selección          valida la sesión         Sheets  (5 hojas)
  entrada libre: voz o texto        arma prompts             Drive   (audios)
  IndexedDB (borradores, cola)      llama a Gemini           Script Properties (API key)
  genera el Word                    escribe en la hoja
```

El navegador dibuja, graba y sincroniza. Apps Script valida, razona y escribe.

---

## Las cinco hojas

### 1. `HC` — una fila por historia clínica

Una columna por campo, nombrada con el `campo_id` de `seed/esquema.csv`. Más ocho columnas de control:

```
dni · episodio · estado · completitud · version · esquema_version · creado_en · actualizado_en
```

- **La fila 1 son los `campo_id`.** Apps Script lee la cabecera y mapea por nombre, nunca por índice. Agregar un campo es agregar una columna al final y una fila en `Esquema`. No rompe nada.
- `episodio` empieza en 1. Si el mismo paciente vuelve, se crea otra fila con el mismo DNI y episodio 2. La clave real es `dni + episodio`.
- `version` es un contador para bloqueo optimista.
- Los campos `multi` se guardan separados por ` | `.
- Campo vacío queda vacío. Nunca escribas "no refiere" por defecto: eso afirma algo que no se preguntó.

### 2. `Esquema` — una fila por campo

Se importa desde `seed/esquema.csv`. Define el formulario, valida, ordena el Word y arma los prompts.

```
campo_id · seccion · orden · label · tipo · obligatorio · lista_id · valor_normal · reglas · ayuda_kb
```

**Tipos de campo** y cómo se dibuja cada uno:

| tipo | Control |
|---|---|
| `opcion` | Botones o chips, se elige uno. Nunca un desplegable largo si caben como chips. |
| `opcion_otro` | Igual, más un chip "Otra" que abre un input |
| `multi` | Chips de selección múltiple |
| `escala` | Lista de niveles con su etiqueta explicativa. Al elegir, arma la frase con `formato_salida` |
| `texto` | Input de una línea |
| `texto_largo` | Área de texto |
| `narrativa` | Área de texto con botón "Normal" y botones de frases |
| `lista` | Lista de ítems que se agregan uno por uno |
| `numero` | Input numérico, con teclado numérico en móvil |
| `fecha` | Selector de fecha |
| `calculado` | Solo lectura. La fórmula va en `reglas` |

`valor_normal` es el valor de la lista que representa el hallazgo normal. Si dice `n`, el botón "Normal" inserta la frase con `valor = n` de esa lista. En el examen físico esto es lo que más tiempo ahorra: entras, tocas Normal en las diez regiones sin hallazgos, y escribes solo las dos que están alteradas.

### 3. `Opciones` — una fila por opción

Se importa desde `seed/opciones.csv`. Unifica tres cosas que funcionan igual:

```
lista_id · nombre · tipo · orden · valor · etiqueta · formato_salida
```

- `tipo: opcion` — lista simple. Se elige el `valor` y ese texto va al campo.
- `tipo: escala` — lista graduada. La `etiqueta` explica el nivel para que sepas cuál elegir. `formato_salida` es la plantilla de la frase, con marcadores como `{valor}`, `{lateralidad}`, `{nivel}`, `{localizacion}`, `{cm}`. Los marcadores que no sean `{valor}` abren un input pequeño al elegir.
- `tipo: frase` — fragmentos para campos narrativos. El de `valor = n` es el hallazgo normal completo. Los demás son inicios de frase que completas.

Para agregar una escala nueva desde tus notas de Semiología: agregas filas aquí y pones el `lista_id` en el campo que corresponda. Sin desplegar nada.

### 4. `Knowledge` — una fila por fragmento de las notas

```
id · seccion · titulo · contenido · origen_archivo
```

La llena `scripts/kb-build.ts`, que recorre la carpeta de Semiología, trocea cada `.md` por encabezado de nivel 2 y asigna cada trozo a una sección de la HC según palabras clave del título. Si un fragmento pasa de 45 000 caracteres, se parte.

### 5. `Registro` — eventos

Audios, dudas y auditoría en una sola hoja, distinguidos por `tipo`.

```
id · tipo · dni · episodio · seccion · campo_id · contenido · estado · fecha
```

`tipo`: `entrada` (el texto crudo que dictaste o escribiste, con su origen) · `audio` (drive_file_id y transcripción) · `imagen` (foto de un informe de laboratorio) · `duda` (pregunta pendiente) · `decision` (qué hacer con cada diferencia con las notas) · `auditoria` · `opid` (idempotencia).

La hoja `HC` lleva además dos columnas de sistema con JSON: `seg.evoluciones` (seguimiento diario) y `seg.laboratorio` (resultados). Se sincronizan como cualquier campo y el servidor valida su forma.

**La configuración no lleva hoja.** Va en Script Properties: `API_KEY_GEMINI`, `MODELO`, `CARPETA_DRIVE_ID`, `SPREADSHEET_ID`, y el acceso: `USUARIO`, `CLAVE_HASH` (sal + hash), `CLAVE_INICIAL` (temporal, se borra al primer ingreso) y `SESIONES` (hashes de los tokens de sesión con su vencimiento).

**Antes de usar:** el spreadsheet contiene nombres y DNI de pacientes reales. Déjalo sin compartir y sin publicar en la web.

---

## Flujo de usuario

```
Lista de historias → Nueva → DNI → índice de secciones con barra de completitud
      │
      ▼
Entras a una sección. Arriba, el cuadro de entrada libre:

┌──────────────────────────────────────────────┐
│  CONTAR                                  🎙  │
│  ┌────────────────────────────────────────┐  │
│  │ señora de 55, viene por hinchazón de   │  │
│  │ piernas hace como 6 meses, empezó de   │  │
│  │ a poquitos...                          │  │
│  └────────────────────────────────────────┘  │
│                [ Organizar ]                 │
└──────────────────────────────────────────────┘

Hablas o escribes, da igual. Si fue voz, transcribe primero y te muestra
el literal para corregir. Si fue texto, va directo.
      │
      ▼
Gemini reparte lo dicho entre los campos y devuelve dudas
      │
      ▼
┌──────────────────────────────────────────────┐
│ Forma de inicio   (Brusco)(Súbito)[Insidioso]│ ← ya seleccionado
│ Curso             [Progresivo](Estacionario) │
│ Relato            párrafo redactado          │
│ Edema             ⟨¿Grado de godet?⟩         │ ← escala sugerida, un toque
│ Abdomen           [ Normal ]  ← un toque llena la frase completa
├──────────────────────────────────────────────┤
│ DUDAS (3)                                    │
│ · ¿tiene ortopnea?                           │
│ · ¿fecha exacta de inicio?                   │
└──────────────────────────────────────────────┘
      │
      ├── corriges tocando otra opción o escribiendo encima
      ├── vuelves a contar algo más: se suma, no se pisa. Si contradice
      │   lo ya registrado, te muestra los dos valores y eliges.
      ▼
Siguiente sección → ... → Revisar → Generar Word
```

**Tres maneras de llenar un campo, siempre disponibles:** elegir de la lista, escribir directo en el campo, o contar y que Gemini reparta. Ninguna bloquea a las otras.

**El panel de dudas** es lo que más valor da. Gemini no completa lo que no dijiste, pero te devuelve la pregunta que no hiciste, mientras todavía estás frente al paciente. Las dudas se acumulan por historia y se marcan resueltas al llenar el campo.

### Qué funciona sin señal

| Acción | Sin señal |
|---|---|
| Elegir opciones y escalas | Sí |
| Botón Normal y frases | Sí |
| Escribir a mano | Sí |
| Escribir en el cuadro de Contar | Sí, queda en cola |
| Grabar audio | Sí, queda en cola |
| Organizar con Gemini | No, espera señal |
| Generar el Word | Sí |
| Seguimiento diario, laboratorio a mano, semáforo y síndromes | Sí |
| Presentación de caso | Sí, en versión rápida; con Gemini necesita señal |
| Leer la foto del informe, nota SOAP y epicrisis | No, necesitan señal |

Que el Word salga sin señal es a propósito: si necesitas imprimir en el hospital, no dependes de nada.

---

## API

Un solo `doPost`, router por acción.

```
POST https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
Content-Type: text/plain;charset=utf-8

{ "action": "...", "token": "...", "opId": "uuid", "payload": { ... } }
```

**El error que hay que evitar sí o sí:** Apps Script no responde peticiones preflight de CORS. Si mandas `application/json` o cualquier cabecera propia, el navegador hace preflight y el fetch falla con un error vacío. Por eso el `Content-Type` es texto plano y **el token de sesión va en el cuerpo, jamás en una cabecera**.

**Acceso con usuario y contraseña.** `auth.login` (la única acción sin sesión) valida usuario y contraseña y devuelve un token de sesión de 30 días; la app lo guarda y lo manda en cada petición. `auth.cambiar` cambia contraseña y usuario y cierra las demás sesiones; `auth.salir` cierra la actual. Tras 5 intentos fallidos el ingreso se bloquea 15 minutos. Si la sesión vence, la app vuelve a pedir el ingreso sin perder lo guardado en el dispositivo.

| Acción | Payload | Devuelve |
|---|---|---|
| `ping` | — | versión del esquema |
| `catalogos.get` | `desde` | Esquema, Opciones, índice de Knowledge |
| `hc.list` | `limite`, `cursor` | filas resumidas |
| `hc.get` | `dni`, `episodio` | la fila completa |
| `hc.crear` | `dni` | fila nueva |
| `hc.guardar` | `dni`, `episodio`, `version`, `campos[]` | nueva versión o conflicto |
| `entrada.transcribir` | `audioBase64`, `mime`, `dni`, `seccion` | transcripción literal |
| `entrada.organizar` | `texto`, `origen`, `dni`, `seccion` | campos, dudas, escalas, conflictos |
| `hc.revisar` | `dni`, `episodio` | faltantes e incoherencias |
| `sync.lote` | `ops[]` | un resultado por operación |
| `kb.cargar` | `filas[]`, `reemplazar` | total de filas en Knowledge (lo usa `kb-build`) |
| `auth.login` | `usuario`, `clave` | token de sesión (no pide sesión) |
| `auth.cambiar` | `clave_actual`, `clave_nueva`, `usuario_nuevo?` | usuario vigente |
| `auth.salir` | — | cierra la sesión actual |
| `entrada.laboratorio` | `imagenBase64`, `mime`, `dni`, `episodio` | fecha y resultados leídos de la foto, con nombres completos |
| `entrada.redactar` | `tipo` (`presentacion`, `epicrisis`, `evolucion`), `valores`, `extra` | texto; en la evolución, también la nota SOAP |
| `revision.decidir` | `decisiones[]` | guarda una decisión por punto de la revisión |
| `revision.listar` | — | todas las decisiones |

`entrada.organizar` acepta además `contexto` (los valores del dispositivo, que pueden ir por delante de la hoja) y `campo_objetivo` (para **Pulir redacción** de un solo campo, o redactar el resumen semiológico desde la historia). `hc.guardar` compara cada campo con el valor sobre el que se editó (`base`): si la hoja ya tiene otro, no lo pisa y lo devuelve como conflicto. `hc.revisar` devuelve también `redaccion`: campos con lenguaje coloquial y su texto corregido.

`opId` lo genera el cliente. Si llega repetido, Apps Script responde el resultado guardado sin volver a escribir. Toda escritura va dentro de `LockService.getScriptLock()`.

---

## Entrada libre

Dos pasos separados. El texto crudo se guarda siempre como evidencia en `Registro`, así que puedes reorganizar sin volver a dictar.

**Paso 1, solo si fue voz.** Audio a Gemini, temperatura 0: transcribe literal en español, respeta términos médicos y palabras en quechua o aymara, no interpretes, no resumas, no corrijas. Si fue texto escrito, este paso se salta.

**Cliente de Gemini.** `backend/src/Gemini.ts` usa la Interactions API (`POST /v1beta/interactions`), que es la recomendada hoy; la salida forzada va en `response_format.schema`, el equivalente actual de `responseSchema`. Va con `store: false` para que Google no conserve la conversación con datos del paciente. Modelo por defecto: `gemini-3.8-flash` (Script Property `MODELO`). Los modelos Gemini 3 ya no aceptan `temperature`; se usa `thinking_level`. El audio va en línea: webm, ogg/opus, m4a, mp3 y wav, hasta 14 MB.

**Paso 2, organizar.** Salida forzada con esquema JSON. Se construye en `backend/src/Prompts.ts` leyendo las hojas, con un glosario semiológico (lumbalgia y no «dolor lumbar», con su irradiación, intensidad y factores) y los fragmentos de tus notas más relacionados con lo dictado:

```
ROL
Conviertes lo que un estudiante de medicina dicta o escribe al pie de la cama
en los campos de una historia clínica de la Facultad de Medicina Humana de la
UNA Puno. No diagnosticas, no sugieres tratamientos, no completas lo que no
se dijo.

REGLA PRIMERA
No inventes. Si la entrada no contiene un dato, el campo va vacío y el dato se
reporta en "dudas". Una historia incompleta es preferible a una historia con
un dato que el paciente nunca dijo.

ORIGEN DE LA ENTRADA: {voz | texto}
Si es voz, viene con muletillas y repeticiones: límpialas.
Si es texto, viene telegráfico y con abreviaturas: expándelas.

SECCIÓN ACTIVA: {seccion}
CAMPOS: {filas de Esquema de esa sección con id, label, tipo, lista_id}
Para los campos de tipo opcion, multi o escala, el valor que devuelvas TIENE
que ser uno de los valores válidos de su lista. Si ninguno encaja, deja el
campo vacío y repórtalo en "dudas".

LISTAS VÁLIDAS: {filas de Opciones de las listas usadas en esta sección}
REGLAS DE REDACCIÓN: {fragmentos de Knowledge de esta sección}

Siempre aplican:
- Tercera persona. Presente para el examen físico, pasado para el relato.
- El motivo de consulta va entre comillas con las palabras del paciente. De ahí
  en adelante, términos médicos: edema y no hinchazón, disnea y no falta de
  aire, ictericia y no color amarillo.
- El relato va en orden cronológico, con el síntoma guía como hilo conductor y
  las demás molestias colgando de la fecha en que aparecieron.
- El examen físico describe, no interpreta. "Matidez en base derecha" es un
  hallazgo; "derrame pleural" es un diagnóstico y no va ahí.
- Todo hallazgo lleva lateralidad, localización e intensidad si corresponde.
- Si existe escala, se usa la escala. Nunca "edema moderado" cuando hay godet.

CONTEXTO YA REGISTRADO
Síntoma guía: {ea.sintoma_guia} · Edad y sexo: {fil.edad}, {fil.sexo}
Si la entrada contradice lo registrado, no lo sobrescribas: repórtalo en
"conflictos".

ENTRADA: {texto}

DEVUELVE
{
  "campos": [{ "id": "...", "valor": "...", "confianza": 0.0-1.0 }],
  "dudas": ["pregunta concreta que el estudiante debe hacerle al paciente"],
  "escalas_sugeridas": [{ "campo": "...", "lista_id": "...", "razon": "..." }],
  "conflictos": [{ "campo": "...", "registrado": "...", "entrada": "..." }]
}
```

En la interfaz: confianza menor a 0,7 se pinta en amarillo. Las escalas sugeridas aparecen como un chip en el campo que al tocarlo abre el selector.

**Tercer prompt, `hc.revisar`:** recibe la HC completa y el esquema, devuelve campos obligatorios vacíos e incoherencias entre secciones. No diagnostica.

---

## El Word

Se genera en el navegador con `docx`, en `web/src/lib/docx/`.

El membrete sale del PDF de esta carpeta. Extráelo una vez con un script y guarda los dos PNG en `web/public/`:

- **Encabezado**: recorte de la página 1 desde `y=0` hasta `y=69.5` puntos, ancho completo de 595,2 pt, a 3x de resolución.
- **Pie**: recorte desde `y=755` hasta `y=841.92` puntos, mismo ancho y resolución.

En el documento: A4, márgenes en dxa de 1700 arriba, 1800 abajo y 1000 a los lados, encabezado a 280 y pie a 240. Las dos imágenes centradas, 660 px de ancho y alto proporcional.

Formato: título "HISTORIA CLÍNICA" centrado; cada sección con número romano y borde superior; campos como `**Etiqueta:** valor` con sangría; los narrativos justificados. El orden y los nombres completos los da `docx/estructura.ts`, calcada del PDF; lo que no esté ahí sale al final de su sección.

`docx/documento.ts` arma una representación intermedia que usan el Word y la **Vista previa** (Resumen → 👁 Vista previa), así lo que se ve es lo que se imprime. En la vista previa:

- **Con líneas para llenar a mano**: los vacíos salen con línea de subrayado. **Solo lo registrado**: sin vacíos ni títulos huérfanos. La elección se recuerda.
- Tocar cualquier parte lleva a ese campo, resaltado.
- Avisa si quedan siglas o diminutivos.

Signos vitales en tabla sin bordes: presión arterial | temperatura, frecuencia cardíaca | saturación de oxígeno, frecuencia respiratoria en su fila (escrita completa no cabe al lado de otra). Glasgow sale como «15/15 (apertura ocular 4, respuesta verbal 5, respuesta motora 6)»; dolor y llenado capilar, siempre.

---

## Estructura

```
HISTORIAS CLINICAS/
├─ plantilla-historia-clinica.pdf
├─ seed/esquema.csv · opciones.csv · guias.csv · definiciones.csv · laboratorio.csv · sindromes.json
│        knowledge.csv (generado, no se sube)
├─ shared/
│  ├─ types.ts                     tipos compartidos por las dos capas
│  ├─ catalogo.ts · csv.ts         filas de hoja o CSV → Campo y Opcion
│  ├─ formato.ts                   aplica y lee formato_salida de las escalas
│  ├─ valores.ts                   valida valores contra el esquema y las listas
│  ├─ calc.ts                      campos calculados (IMC, Glasgow)
│  ├─ sintoma.ts                   redacción del síntoma (Describir síntoma)
│  ├─ abreviaturas.ts              siglas → completas; diminutivos
│  ├─ migraciones.ts               formatos antiguos → vigentes
│  ├─ fechas.ts                    edad y tiempo de enfermedad
│  ├─ guias.ts                     guía de llenado, ámbitos e interpretación de signos vitales
│  ├─ contexto.ts                  grupo de edad, sexo y altitud para interpretar
│  ├─ gravedad.ts                  semáforo de cada nivel de escala
│  ├─ laboratorio.ts               catálogo, unidades, ajuste por altura e interpretación
│  ├─ sindromes.ts                 criterios, negaciones y síndromes compatibles
│  ├─ seguimiento.ts               evoluciones y resultados (columnas de sistema)
│  ├─ schemas.ts                   Zod para las respuestas de Gemini
│  └─ secciones.ts                 orden, títulos y subtítulos de la plantilla
├─ web/
│  ├─ src/
│  │  ├─ lib/
│  │  │  ├─ api.ts                 único punto de contacto con Apps Script
│  │  │  ├─ db.ts                  Dexie, con capa de cifrado
│  │  │  ├─ cifrado.ts · seguridad.ts  AES-GCM, PIN, huella y bloqueo automático
│  │  │  ├─ historia.ts            edición local, completitud, dudas, deshacer
│  │  │  ├─ sync.ts                cola, reintentos, conflictos, entradas pendientes
│  │  │  ├─ recorder.ts            MediaRecorder y audios subidos
│  │  │  ├─ schema.ts · vista.ts   catálogos (semilla empaquetada + hoja)
│  │  │  ├─ guias.ts · escritura.ts guía empaquetada · revisión de siglas y diminutivos
│  │  │  └─ docx/                  documento (representación intermedia) · builder ·
│  │  │                            estructura (calcada del PDF) · descargar
│  │  ├─ components/               Campos · Niveles · ConstructorSintoma · Guia ·
│  │  │                            EntradaLibre · Paneles · FormRenderer · Basicos
│  │  └─ views/                    Historias · Historia (índice y sección) · Revisar ·
│  │                               VistaPrevia · Ajustes · Ingreso · Bloqueo · Consulta ·
│  │                               Seguimiento · Laboratorio
│  └─ public/                      manifest · sw.js · header.png · footer.png · iconos
├─ backend/
│  ├─ appsscript.json · build.mjs  esbuild → dist/Code.js (clasp 3 ya no compila TS)
│  ├─ desplegar.mjs                despliega siempre sobre el mismo deployment
│  └─ src/
│     ├─ Router.ts                 doPost, auth, idempotencia
│     ├─ Repo.ts                   acceso a la hoja, cabecera dinámica, lock
│     ├─ Catalogos.ts · HC.ts · Entrada.ts · Prompts.ts · Gemini.ts · Revisar.ts
│     ├─ Redaccion.ts              foto de laboratorio, presentación, epicrisis, nota SOAP
│     ├─ Decisiones.ts             decisiones sobre las diferencias con las notas
│     ├─ Configuracion.ts          página del dueño: hoja, contraseña temporal, clave de Gemini
│     ├─ Auth.ts                   usuario, contraseña y sesiones
│     └─ Setup.ts                  crea las 5 hojas, el usuario, la carpeta y el respaldo
├─ local/                          servidor local: gas-node (Apps Script emulado) · motor · servidor
├─ datos/                          (local, no se sube) hojas CSV, audios, respaldos, certificado
├─ INICIAR HC.cmd                  arranca el servidor local con doble clic
├─ DESPLEGAR EN LINEA.cmd          despliegue guiado en Apps Script y GitHub Pages
├─ scripts/
│  ├─ kb-build.ts                  notas de Semiología → hoja Knowledge
│  ├─ migrar.ts                    historias del servidor local → servidor en Google
│  ├─ desplegar-en-linea.ts        el despliegue guiado · entorno.ts: .env.local y llamadas a la API
│  ├─ extraer-membrete.py          recorta encabezado y pie del PDF, genera iconos
│  ├─ pruebas.ts · gas-simulado.ts pruebas con Apps Script en memoria
│  ├─ word-ejemplo.ts              Word de muestra con una historia ficticia
│  └─ mapeo.ts · mapeo_excel.py    mapeo completo → docs/HC_mapeo_completo.xlsx
├─ docs/                           mapeo por área (.md) y Excel
└─ .github/workflows/pages.yml     pruebas + build + GitHub Pages en cada push a main
```

`api.ts` y `Repo.ts` aíslan todo. Si mañana Sheets se queda corto, se cambia `Repo.ts` y nada más.

**Opciones tomadas de las notas de Semiología** (en `seed/opciones.csv`, extraídas de `wiki/SEMIOLOGIA/clases`):

- `sintoma` (74 términos; los de dolor tienen la etiqueta empezando con «Dolor»), `localizacion` (regiones para localizar e irradiar), `dolor_caracter`, `patron_sintoma`, `agravante`, `atenuante`, `respuesta_tto` y `llenado_capilar`.
- Frases iniciales de hallazgos alterados por región (`f_*`), con los datos a completar entre llaves (`{lado}`, `{foco}`, `{region_abd}`, `{cm}`…). Al tocarlas se abre un mini formulario con sugerencias (`shared/formato.ts`).
- **Describir síntoma** (regla `constructor_sintoma` en el relato): se toca síntoma, tiempo, inicio y, si es dolor, localización, carácter, intensidad, irradiación, agravantes y atenuantes. La frase la arma `shared/sintoma.ts`: «Paciente refiere que hace 5 días, de inicio insidioso, presenta lumbalgia a nivel de la región lumbar, de carácter opresivo…».
- **Escalas por campo** (regla `escalas:eva|nyha|…` en `reglas`): cada campo ofrece solo las que le corresponden. Cabeza no ofrece ninguna; extremidades ofrecen godet, pulsos, fuerza y ROT. Gemini solo puede sugerir esas.
- **Normal en los campos vacíos**: también llena Glasgow (15/15), conciencia, llenado capilar, murmullo vesicular, ruidos agregados, pulsos, fuerza y ROT, sin pisar lo ya escrito.
- Gemini recibe ese mismo léxico, el glosario de las notas («como si algo apretara» → opresivo) y el orden del relato.
- En local, si cambian `seed/esquema.csv` u `seed/opciones.csv`, el servidor los reimporta al arrancar. Lo editado a mano en `datos/hojas/Esquema.csv` u `Opciones.csv` se reemplaza. `seed/guias.csv` va empaquetada en la app (funciona sin señal): el servidor la recompila al arrancar. Columnas: `ambito` (campo, sección, `s.*` síntoma o `ex.*` examen), `tipo` (pregunta, consejo, alerta, instrumento, posicion, tecnica, buscar, normal, interpretacion, indicacion, lectura, sindrome, umbral), `texto` y `archivo` (nota de origen). Un `umbral` se escribe `variable|mín|máx|etiqueta`.

**Escritura completa** (regla de 02a · Historia clínica: «lo más seguro es evitar las abreviaturas por completo»):

- Las etiquetas del formulario y del Word van completas: «Miembro inferior derecho», «Frecuencia respiratoria», «Dolor (escala visual análoga)». Las escalas se guardan como frase: «Intensidad 7/10 en la escala visual análoga», «Reflejos osteotendinosos 2+/4+», «Fuerza muscular 5/5».
- `shared/abreviaturas.ts` detecta y escribe completas las siglas (MID, HTA, c/8h, FC, ROT, pte., aprox.…) y detecta diminutivos coloquiales (dolorcito, ratito, hinchadita). Gemini tiene prohibido usarlos y el backend los desarrolla igual por si se le escapan. Revisar y la vista previa avisan y ofrecen **Escribir todo completo**; los diminutivos se corrigen a mano.
- `shared/migraciones.ts` pasa al formato nuevo lo guardado antes («EVA 7/10» → «Intensidad 7/10 en la escala visual análoga»), una vez en el servidor y una vez en cada dispositivo.

**Guía de llenado** (`seed/guias.csv`, se muestra solo en pantalla, nunca en el Word):

- **Guía de la sección**, arriba de cada sección: cómo preguntar y cómo conducir la anamnesis; en Enfermedad actual, la guía del síntoma guía elegido (dolor, disnea, tos y hemoptisis, cefalea…); en Plan de trabajo y Exámenes, cada examen con cuándo pedirlo, valores normales y cómo leerlo.
- **📖 Guía** en cada campo: qué instrumento usar, posición, técnica, qué buscar, valores normales y cómo interpretarlos. Cada tema sale una sola vez (Glasgow en apertura ocular, extremidades en el primer miembro); en la rejilla de signos vitales va debajo, separada por dato.
- En Diagnóstico sindrómico, cada síndrome de la guía trae **+ Agregar**.
- **Interpretación al escribir**: frecuencia cardíaca 110 → «Taquicardia»; temperatura 38,2 → «Fiebre moderada»; presión sistólica 145 → «Hipertensión arterial grado I»; índice de masa corporal, saturación y Glasgow igual. Los umbrales siguen las notas (el índice de masa corporal usa la clasificación de 05c, que no es la de la OMS). Los de saturación y gravedad de Glasgow vienen de fuera de las notas y lo dicen; la saturación advierte que en altura 88 a 92% puede ser normal.
- Cada entrada cita su nota (08c, 05e…) o el curso de donde viene (Bioquímica, Fisiología…). Lo que no está en las notas dice «fuera de notas».
- **Qué significa cada opción**: las listas con definición (síntomas, signos) la muestran debajo al elegir («Hemoptisis: sangre roja rutilante expulsada con la tos»).

**Fechas y tiempos:**

- Fecha de ingreso y de elaboración abren calendario con hora; la de elaboración se llena sola al crear la historia. La de nacimiento, solo fecha.
- **Edad**: con la fecha de nacimiento, ofrece «Usar 54 años» (cumplidos a la fecha de ingreso).
- **Tiempo de enfermedad**: «Calcular desde la fecha de inicio de los síntomas» cuenta hasta el ingreso y elige la unidad (horas, días, semanas, meses o años).
- Criterio: fechas administrativas exactas y con hora; el relato en tiempo relativo («hace 3 días»); «aproximadamente» solo cuando el paciente no recuerda con precisión (chip **Aproximadamente** en Describir síntoma).

**Flujo:** **Solo vacíos** muestra lo que falta (lo que llenas no desaparece mientras sigues ahí) y **Siguiente vacío ↓** baja al próximo; la barra queda fija arriba.

**Consulta y semáforo** (solo pantalla, sin señal):

- **📚 Consulta**, arriba a la derecha: un buscador (sin importar tildes ni mayúsculas) por escalas, valores normales, interpretación de signos vitales, síntomas, hallazgos por región, definiciones, síndromes, exámenes, guía, revisión con las notas y siglas. La guía de cada campo tiene un enlace que abre Consulta con su tema.
- **Semáforo de gravedad** (`shared/gravedad.ts`): cada nivel de cada escala, la interpretación de signos vitales (nivel en el quinto dato del umbral), llenado capilar y estado general se pintan verde, amarillo, naranja o rojo, siempre con el nombre escrito y con leyenda. También en modo oscuro.
- **ⓘ Qué significa cada opción** y **cada hallazgo**, con la nota de donde sale; al elegir un hallazgo con datos por completar, su significado aparece arriba.
- **🚦 Hallazgos a vigilar** en el resumen de la historia: signos vitales fuera de rango y escalas alteradas, de más grave a menos; un toque lleva al campo.

**Seguimiento, laboratorio y apoyo clínico:**

- **Protección del dispositivo**: tras el primer ingreso la app pide un PIN de 6 a 12 números (y, si el teléfono lo permite, huella o rostro). Con él se cifran en el dispositivo las historias, la cola y los audios (AES-GCM; la clave sale del PIN con PBKDF2 de 600 000 vueltas y solo vive en memoria). Se bloquea sola tras 5 minutos sin uso (configurable) o al salir de la app, y con 🔒 arriba. Tras 5 PIN errados espera 30 segundos, tras 8 espera 5 minutos. «Olvidé mi PIN» borra los datos del dispositivo; lo sincronizado se vuelve a traer con usuario y contraseña. El token de sesión tampoco queda en claro.
- **Semáforo según edad y altitud** (`shared/contexto.ts`): la edad sale de la fecha de nacimiento a la fecha de ingreso. Recién nacido, lactante, preescolar y escolar tienen sus rangos de frecuencia cardíaca y respiratoria; el adulto mayor, los suyos de temperatura y presión. La altitud se fija en Ajustes (3827 m por defecto): la saturación usa rangos de altura y la hemoglobina se ajusta con la tabla de la OMS (2011). Si un grupo no tiene rangos propios, la app no le aplica los del adulto (salvo temperatura, saturación y Glasgow).
- **🧪 Laboratorio** (Resumen o Exámenes): **📷 Foto del informe** → Gemini lee cada valor con su unidad y rango y lo pasa al nombre completo (HGB → Hemoglobina) → lo revisas y corriges → se guarda. También **✍ Escribir a mano**. Cada resultado lleva su color e interpretación según sexo, edad y altitud (con el rango del informe cuando el catálogo no tiene), la flecha frente al resultado anterior y sale en «Exámenes complementarios» del Word como tabla. La foto queda en tu carpeta de Drive; no se copian nombre ni DNI del informe.
- **🧩 Síndromes compatibles** (Resumen y Diagnóstico): cruza lo registrado (relato, examen, signos vitales interpretados, escalas y laboratorio) con los criterios de tus notas. Muestra el porcentaje, lo encontrado, lo negado («niega hemoptisis» no cuenta) y **qué falta explorar**. **+ Agregar** lo pasa al diagnóstico sindrómico. Es orientativo: no diagnostica.
- **📈 Seguimiento diario**: una evolución por día con signos vitales (se colorean al escribir y muestran el valor anterior), el día de hospitalización, notas dictadas o escritas y **✨ Redactar la nota SOAP** con Gemini. Tendencias con semáforo desde el ingreso y «↓ 14 desde el día 2». Salen en la sección de evolución del Word.
- **🎤 Presentación de caso y 📄 Epicrisis** (Resumen): la presentación cuenta todo el caso en uno o dos minutos para la visita (identificación, motivo, enfermedad actual, antecedentes relevantes, examen positivo, diagnósticos y plan), sin nombre ni DNI, con versión rápida sin señal y 🔊 para escucharla. **No es el resumen semiológico**: ese solo junta los datos positivos para llegar a los síndromes. La epicrisis resume la hospitalización al alta (con las evoluciones y el laboratorio) y sale en Word.
- **Decidir las diferencias con las notas** (📚 Consulta → Revisión con tus notas): en cada punto, **Seguir la nota**, **Mantener la app** o **Consultar al docente**, con comentario. Se guardan en el servidor, se filtran y salen en **📄 Word para el docente**.

**Mapeo completo** (`docs/`): ocho documentos por área en `docs/mapeo/` (campos, opciones con definición, valores normales, guía, síndromes, exámenes y las diferencias encontradas con las notas) y todo junto en `docs/HC_mapeo_completo.xlsx`, con filtros. `npm run mapeo` regenera el Excel desde `seed/` y las definiciones de `docs/mapeo/datos/`.

**Funciones que el README original no nombraba y se agregaron** porque las pediste o porque evitan escribir: subir un audio ya grabado (notas de voz de WhatsApp incluidas), **Pulir redacción** en cada campo narrativo, **Redactar desde la historia** en el resumen semiológico, **+ Escala** para insertar cualquier escala en un texto, **Normal en las regiones vacías**, **Deshacer** el último cambio de Gemini, **Compartir** el Word desde el celular y el campo de Gemini marcado hasta que lo revisas.

---

## Despliegue local (desarrollo y respaldo)

La app y el backend corren en tu PC, sin cuenta de Google. El servidor local (`local/`) ejecuta **el mismo** `backend/dist/Code.js` sobre un Apps Script emulado:

| En Apps Script | En local |
|---|---|
| Hoja de cálculo | `datos/hojas/*.csv` (se abren en Excel) |
| Script Properties | `datos/propiedades.json` + `.env.local` para la API key |
| Drive (audios) | `datos/audios/` |
| Respaldo diario | `datos/respaldos/`, 30 días, y copia opcional en `RESPALDOS_DIR` |
| Web App | `http://localhost:8787/api` |

**Arrancar:** doble clic en `INICIAR HC.cmd` (o `npm run local`). Compila todo, carga tus notas de Semiología si cambiaron y abre el navegador. Deja la ventana abierta.

**Primer ingreso:** usuario `admin` y la contraseña temporal que muestra la ventana (también en `datos/PRIMER-ACCESO.txt`). Cámbialos en **Ajustes → Cambiar usuario o contraseña** y borra ese archivo. Si olvidas la contraseña, detén el servidor, borra `CLAVE_HASH` de `datos/propiedades.json` y agrega `"CLAVE_INICIAL": "una-nueva"`.

**`.env.local`** (no se sube): `GEMINI_API_KEY`, `GEMINI_MODELO`, `PUERTO` (8787), `PUERTO_HTTPS` (8443), `HC_NOTAS_DIR`, `RESPALDOS_DIR` opcional. `.env.servidor` fija `VITE_API_URL=./api` para la compilación local (`npm run build:local -w web`).

**Instancia de prueba** sin tocar tus datos: `HC_DATOS_DIR` y `PUERTO` como variables de entorno, p. ej. `$env:HC_DATOS_DIR="C:\temp\hc-prueba"; $env:PUERTO="8797"; npx tsx local/servidor.ts --sin-abrir`.

**Desde el celular** (misma red Wi-Fi que la PC):

- `http://IP-DE-LA-PC:8787` funciona para elegir, escribir, subir audios, usar Gemini y generar el Word. El navegador no permite el micrófono ni el modo sin señal en `http`: graba con la grabadora del teléfono y usa «Audio».
- `https://IP-DE-LA-PC:8443` habilita el micrófono. Para que tampoco salga la advertencia y funcione sin señal, instala una vez el certificado local: abre `http://IP-DE-LA-PC:8787/certificado.crt` en el celular.
  - Android: Ajustes → Seguridad → Cifrado y credenciales → Instalar un certificado → Certificado de CA.
  - iPhone: Ajustes → Perfil descargado → Instalar; luego General → Información → Confianza de certificados → activar.
- La ventana del servidor muestra la IP. Si el router le da otra a la PC, el certificado se regenera solo al arrancar.
- El celular solo llega a la PC mientras estén en la misma red y el servidor esté encendido. Lo que registres sin conexión queda en el celular y se sube al reconectar.

**Seguridad:** el acceso es con usuario y contraseña (hash con sal, sesiones de 30 días, bloqueo de 15 minutos tras 5 intentos fallidos). La carpeta `datos/` tiene nombres y DNI de pacientes: no la compartas ni la subas a GitHub (está en `.gitignore`). En una red pública (Wi-Fi del hospital) cualquiera de esa red puede ver la pantalla de ingreso; usa una contraseña fuerte.

---

## Despliegue en línea (Apps Script + GitHub Pages)

La app queda en **https://canazachyub.github.io/hc-una-puno/** (repositorio `Canazachyub/hc-una-puno`) y el backend en un Web App de Apps Script con tu cuenta de Google. Los datos van a una hoja privada de tu Drive. Quien use la app entra con **usuario y contraseña** (no con cuenta de Google).

Requisitos: Node 24, una cuenta de Google y una de GitHub (con `gh auth login`). Todo se ejecuta desde la carpeta del proyecto.

**Lo más simple: doble clic en `DESPLEGAR EN LINEA.cmd`** (o `npm run desplegar`). Te guía por los pasos 1 a 7, 9 y 10 de abajo: inicia sesión en Google, crea y publica el Web App, pone su dirección en GitHub, vuelve a publicar la app, abre la página de configuración y, si le das la contraseña temporal, sube tus notas y te ofrece pasar las historias locales. Se puede repetir para actualizar.

```powershell
npm install
npm test                      # 83 pruebas
npm run dev                   # la app en http://localhost:5173, funciona sin backend
```

**Backend (una sola vez)**

1. Activa la API de Apps Script en https://script.google.com/home/usersettings.
2. `cd backend` · `npx clasp login` (abre el navegador) · `npx clasp create-script --type standalone --title "HC App" --rootDir dist`.
3. `npm run deploy` (desde `backend/`): compila, sube y crea el deployment. Imprime la **URL del Web App** (`…/exec`) y guarda su id en `backend/.deployment`; los siguientes `npm run deploy` actualizan **ese mismo** deployment, así la URL no cambia nunca.
4. Abre `https://script.google.com/macros/s/<ID DEL SCRIPT>/dev` con tu cuenta de Google (el ID del script está en `backend/.clasp.json`, `scriptId`). La primera vez Google pide permisos: «Google no verificó esta app» es normal porque la app es tuya → Configuración avanzada → Ir a HC App → Permitir. La página:
   - crea la hoja privada con las 5 hojas y las semillas, la carpeta de Drive, el respaldo diario (30 días) y el usuario `admin`;
   - muestra la **contraseña temporal** (hasta que la cambies);
   - tiene un cuadro para pegar tu **clave de Gemini** (https://aistudio.google.com/apikey): la prueba y la guarda en Script Properties. El navegador nunca la ve.
   A cualquier otra persona esa dirección solo le responde «servidor activo».
5. Si el primer despliegue no quedó como Web App: `npx clasp open-script` → Implementar → Gestionar implementaciones → editar → tipo Aplicación web, ejecutar como **yo**, acceso **cualquier usuario**. `appsscript.json` ya lo declara así.

**App**

6. Sube el repositorio a GitHub y en Settings → Pages elige **GitHub Actions**. Cada push a `main` corre las pruebas, compila y publica `web/dist`.
7. En Settings → Secrets and variables → Actions → **Variables**, crea `HC_API_URL` con la URL del Web App (`…/exec`) y vuelve a correr el flujo (Actions → Publicar en GitHub Pages → Run workflow). La app publicada ya la trae: solo pide usuario y contraseña.
8. Abre la app en el celular, ingresa con `admin` y la contraseña temporal, crea tu PIN y cambia la contraseña en Ajustes. En Chrome o Safari, «Agregar a la pantalla de inicio» la deja como app y funciona sin señal.

**Tus notas y tus historias locales**

9. Copia `.env.local.example` como `.env.local` (si no lo tienes), pon `VITE_API_URL` (la URL `…/exec`), `HC_USUARIO` y `HC_CLAVE`, y ejecuta `npm run kb:build`: sube los fragmentos de tus notas a `Knowledge`. Vuelve a ejecutarlo cuando cambies tus notas.
10. Para pasar las historias del servidor local al de Google: `npm run migrar` (usa las mismas variables). Crea cada historia que falte y copia sus campos; si ya existe, solo llena lo vacío y avisa las diferencias. No borra nada del local.

**Tu propia hoja y tu propia carpeta.** En `.env.local` pon `HC_HOJA` (enlace de la hoja de cálculo) y `HC_CARPETA_DRIVE` (enlace de la carpeta para audios, fotos y respaldos). `npm run backend:build` los escribe en `backend/dist/Config.js` (para clasp) y al inicio de `salida/apps-script/Code.gs` (para pegar), en el bloque `HC_CONFIG`, que también puedes llenar a mano. Sin enlaces, usa la hoja donde está el script o crea una, y crea la carpeta «HC App». **Si la hoja o la carpeta están compartidas con «cualquier persona con el enlace», el servidor no las usa** (ni al instalar, ni para guardar audios o fotos, ni para el respaldo): cámbialas a «Restringido».

**Sin clasp: pegar el código a mano** (en lugar de los pasos 1 a 3)

1. En Google Drive crea una hoja de cálculo en blanco (por ejemplo «HC App · datos»). No la compartas.
2. En la hoja: Extensiones → Apps Script. Ponle nombre al proyecto («HC App»).
3. ⚙ Configuración del proyecto → marca «Mostrar el archivo de manifiesto appsscript.json en el editor». En el editor abre `appsscript.json` y reemplaza todo por el contenido de `salida/apps-script/appsscript.json`.
4. Abre `Código.gs`, borra todo y pega `salida/apps-script/Code.gs` (lo genera `npm run backend:build`). Revisa arriba el bloque `HC_CONFIG` (hoja y carpeta). Guarda.
5. Elige la función `setup` y ▶ Ejecutar. Acepta los permisos (Configuración avanzada → Ir a HC App). Las cinco hojas se crean **en esa misma hoja de cálculo** (tu «Hoja 1» se queda si tiene algo) y el registro de ejecución muestra el usuario y la contraseña temporal.
6. ⚙ Configuración del proyecto → Propiedades de la secuencia de comandos → agrega `API_KEY_GEMINI` con tu clave. Ejecuta `probarGemini` para comprobarla.
7. Implementar → Nueva implementación → ⚙ Aplicación web · Ejecutar como: **Yo** · Quién tiene acceso: **Cualquier usuario** → Implementar. Copia la URL que termina en `/exec` y sigue con el paso 7 de arriba (`HC_API_URL`).

Para actualizar por este camino: vuelve a pegar `Code.gs` y en Implementar → Gestionar implementaciones → ✎ → Versión: **Nueva versión** (así la URL no cambia).

**Actualizar:** `npm run deploy` en `backend/` para el servidor (las semillas nuevas se reimportan solas en la primera petición) y `git push` para la app.

Otras funciones del editor: `restablecerClave` (contraseña temporal nueva y cierra todas las sesiones), `reimportarSemillas` (sobrescribe Esquema y Opciones con los CSV) y `probarGemini`.

**Qué queda público y qué no:** el repositorio (si es público, como pide GitHub Pages gratuito) muestra el código, las semillas (opciones, guía, definiciones, síndromes, laboratorio) y el mapeo de `docs/`, que salen de tus notas. **No** se suben: `datos/` (pacientes), `.env.local` (clave de Gemini), `seed/knowledge.csv` (fragmentos de tus notas), `.clasp.json`, `.deployment` ni la plantilla en PDF. Los datos de pacientes viven solo en tu hoja privada y cifrados en tus dispositivos.

---

## Orden de construcción

**Fase 1.** Setup de la hoja desde los CSV, formulario que se dibuja solo con todos los tipos de campo, botón Normal, selectores de escala, guardado local, sincronización y Word. **Sin Gemini.** Con esto ya reemplaza el trabajo a mano.

**Fase 2.** Entrada libre por texto escrito, con `entrada.organizar`. Primero solo en enfermedad actual.

**Fase 3.** Grabador de voz y `entrada.transcribir`, con su cola.

**Fase 4.** `kb-build`, Knowledge dentro de los prompts, revisor de completitud y fotos de informes de laboratorio.

---

## Mejoras

Revisión de septiembre de 2026, qué se hizo con cada propuesta:

| # | Mejora | Estado |
|---|---|---|
| 1 | Red privada entre la PC y el celular | Descartada: el acceso es en línea (Apps Script + GitHub Pages) |
| 2 | PIN o huella, cifrado en el dispositivo y cierre automático | Hecha |
| 3 | Alertas tempranas (NEWS2, qSOFA, reglas de coherencia) | No se hará por ahora |
| 4 | Semáforo según edad y altitud | Hecha |
| 5 | Foto del informe → valores de laboratorio | Hecha |
| 6 | Razonamiento sindrómico | Hecha |
| 7 | Seguimiento diario | Hecha |
| 8 | Presentación de caso y epicrisis | Hecha |
| 9 | Modo estudio con repaso espaciado | No se hará por ahora |
| 10 | «Pregúntale a tus notas» | No se hará por ahora |
| 11 | Plantillas por rotación | **Mejora futura** |
| 12 | Decidir las diferencias con las notas | Hecha |

**Mejora futura: plantillas por rotación** (Cirugía, Pediatría, Ginecología y Obstetricia). La app se dibuja desde `seed/esquema.csv` y `seed/opciones.csv`, así que cada rotación sería otro par de archivos con sus secciones (por ejemplo, en Ginecología y Obstetricia: antecedentes obstétricos G_P_, fecha de última regla, altura uterina, latidos fetales; en Pediatría: antecedentes perinatales, desarrollo psicomotor, inmunizaciones, curvas de crecimiento), su estructura del Word calcada de la plantilla de la facultad y su guía desde las notas del curso. Qué haría falta: una columna `plantilla` en la hoja `HC`, elegir la plantilla al crear la historia y que `catalogos.get` entregue la de cada historia. Los rangos pediátricos del semáforo ya existen.

No empieces la fase 2 hasta que la fase 1 genere un Word correcto de punta a punta.

---

## Reglas para quien construya esto

- No agregues campos que no estén en `seed/esquema.csv`. Si algo parece faltar, cotéjalo contra el PDF y pregunta antes de inventarlo.
- Un campo con `lista_id` no acepta texto libre, salvo que su tipo sea `opcion_otro`.
- TypeScript estricto, sin `any`. Los tipos de `shared/types.ts` mandan en las dos capas.
- Toda respuesta de Gemini pasa por Zod antes de tocar el estado. Si no valida, se descarta y se reintenta una vez.
- Los valores que devuelve Gemini para campos con lista se verifican contra la lista antes de aceptarlos.
- Nada de secretos en el repositorio. La API key solo en Script Properties.
- La cabecera de la hoja `HC` se lee siempre por nombre de columna, nunca por posición.
- Cuando dudes entre agregar una pieza o resolverlo con lo que ya hay, resuélvelo con lo que ya hay.
