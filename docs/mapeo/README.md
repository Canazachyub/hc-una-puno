# Mapeo de la historia clínica

Documentos de consulta de todo lo que usa HC App: los 152 campos de la plantilla, las 99 listas de opciones y escalas, los valores normales, la guía de llenado, los umbrales de los signos vitales, los síndromes y los exámenes auxiliares. Cada definición cita la nota de Semiología de donde sale (02a, 05e, 08c…), la ruta de otro curso del wiki o «fuera de notas».

Las definiciones y la guía son para estudiar y llenar la historia. Se ven en la app, nunca en el Word.

| Documento | Qué cubre |
|---|---|
| [01 · Filiación, funciones biológicas y antecedentes](01-anamnesis-filiacion-y-antecedentes.md) | 87 campos de filiación, funciones biológicas y los cuatro antecedentes |
| [02 · Enfermedad actual y síntomas](02-enfermedad-actual-y-sintomas.md) | Relato, 74 síntomas, semiología del dolor y guía por síntoma guía |
| [03 · Ectoscopía y examen general](03-ectoscopia-y-examen-general.md) | Signos vitales, somatometría, Glasgow, dolor, llenado capilar y umbrales |
| [04 · Cabeza y cuello](04-cabeza-y-cuello.md) | Cabeza, ojos, nariz, oídos, boca y cuello |
| [05 · Tórax y cardiovascular](05-torax-y-cardiovascular.md) | Tórax, síndromes pleuropulmonares, focos y escalas de soplos y pulsos |
| [06 · Abdomen, extremidades y neurológico](06-abdomen-extremidades-y-neurologico.md) | Abdomen y sus signos, genitourinario, columna, extremidades, reflejos y fuerza |
| [07 · Diagnóstico, tratamiento y evolución](07-diagnostico-tratamiento-y-evolucion.md) | Método diagnóstico, 87 síndromes, NYHA, mMRC y ECOG |
| [08 · Exámenes auxiliares](08-examenes-auxiliares.md) | 24 exámenes: cuándo pedirlos, tabla maestra de valores normales y cómo leerlos |

Todo junto, con filtros, está en [`../HC_mapeo_completo.xlsx`](../HC_mapeo_completo.xlsx).

Cada documento termina con **Discrepancias y pendientes**: diferencias entre la app y las notas. Lo corregido se marca al inicio de esa sección; el Excel las reúne en la hoja «Revisión con las notas».

## Datos

- `datos/mapeo.json`: el mapeo en bruto, generado desde `seed/` por `scripts/mapeo.ts`.
- `datos/revision.json`: la sección «Discrepancias y pendientes» de cada documento, con su estado. La app la muestra en Consulta; lo corregido se marca en `CORREGIDO` de `scripts/mapeo.ts`.
- Las definiciones buscadas en las notas y el significado clínico de cada hallazgo están en `seed/definiciones.csv` (`lista_id,valor,definicion,fuente`). La app las muestra junto a cada opción y en Consulta.

## Regenerar el Excel

```
npm run mapeo
```

Lee `seed/` (incluidas las definiciones) y los `.md` para la revisión. Los `.md` no se regeneran solos: si cambia el catálogo, hay que revisarlos. Si el Excel está abierto, se guarda una copia «(actualizado)» al lado.

## En la app

Todo esto también está dentro de la app, sin señal:

- **📚 Consulta** (botón arriba a la derecha): buscador por escalas, valores normales, interpretación de signos vitales, síntomas, hallazgos por región, definiciones, síndromes, exámenes, guía, revisión con las notas y siglas.
- **Semáforo** en cada escala, en la interpretación de signos vitales y en llenado capilar y estado general: verde normal, amarillo leve, naranja moderado, rojo grave, siempre con su nombre escrito.
- **ⓘ Qué significa cada opción / cada hallazgo** debajo de cada campo.
- **🚦 Hallazgos a vigilar** en el resumen de cada historia, de más grave a menos.
