# Arma docs/HC_mapeo_completo.xlsx desde docs/mapeo/datos/mapeo.json (npm run mapeo)
# y las definiciones buscadas en las notas (docs/mapeo/datos/definiciones-*.csv).
# Uso: py scripts/mapeo_excel.py

import json
import re
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.table import Table, TableStyleInfo

RAIZ = Path(__file__).resolve().parent.parent
DOCS = RAIZ / 'docs'
DATOS = DOCS / 'mapeo' / 'datos'
SALIDA = DOCS / 'HC_mapeo_completo.xlsx'

m = json.loads((DATOS / 'mapeo.json').read_text(encoding='utf-8'))

AREA_LARGA = {a['id']: f"{a['id']} · {a['titulo']}" for a in m['areas']}
# En las hojas de datos, el nombre corto para que cada fila ocupe un renglón.
CORTO = {
    '01': 'Filiación y antecedentes',
    '02': 'Enfermedad actual',
    '03': 'Ectoscopía y examen general',
    '04': 'Cabeza y cuello',
    '05': 'Tórax y cardiovascular',
    '06': 'Abdomen, extremidades y neurológico',
    '07': 'Diagnóstico y evolución',
    '08': 'Exámenes auxiliares',
}
AREA = {i: f'{i} · {CORTO.get(i, t)}' for i, t in AREA_LARGA.items()}
ARCHIVO_AREA = {a['id']: a['archivo'] for a in m['areas']}
SECCION = {s['id']: s['titulo'] for s in m['secciones']}
CAMPO = {c['campo_id']: c for c in m['campos']}

# Definiciones buscadas en las notas (seed/definiciones.csv): (lista, valor) → (definición, fuente)
definiciones = {(d['lista_id'], d['valor']): (d['definicion'], d['fuente']) for d in m['definiciones']}

# Semáforo: 0 normal, 1 leve, 2 moderado, 3 grave (shared/gravedad.ts)
COLOR_GRAVEDAD = {0: 'C8E6C9', 1: 'FFF3B0', 2: 'FFD8B0', 3: 'F8C4C0'}


def pintar(ws, columna, gravedades):
    """Rellena la celda de la columna con el color de su gravedad (fila 2 en adelante)."""
    for i, g in enumerate(gravedades, start=2):
        if g is not None:
            ws.cell(i, columna).fill = PatternFill('solid', fgColor=COLOR_GRAVEDAD[g])

AZUL = '105E68'
SUAVE = 'E8F3F4'
ENCABEZADO = Font(bold=True, color='FFFFFF')
ARRIBA = Alignment(vertical='top', wrap_text=True)

wb = Workbook()


def hoja(nombre, columnas, filas, anchos, color=AZUL):
    """Hoja con tabla de Excel (filtros y bandas), encabezado fijo y texto ajustado."""
    ws = wb.create_sheet(nombre)
    ws.sheet_properties.tabColor = color
    ws.append(columnas)
    for f in filas:
        ws.append(['' if v is None else v for v in f])
    for i, ancho in enumerate(anchos, start=1):
        ws.column_dimensions[get_column_letter(i)].width = ancho
    for fila in ws.iter_rows(min_row=2):
        for celda in fila:
            celda.alignment = ARRIBA
    for celda in ws[1]:
        celda.font = ENCABEZADO
        celda.fill = PatternFill('solid', fgColor=color)
        celda.alignment = Alignment(vertical='center', wrap_text=True)
    ws.row_dimensions[1].height = 30
    ws.freeze_panes = 'A2'
    if filas:
        ref = f'A1:{get_column_letter(len(columnas))}{len(filas) + 1}'
        nombre_tabla = re.sub(r'[^A-Za-z0-9]', '', nombre.title()) or 'Tabla'
        t = Table(displayName=f'T{nombre_tabla}', ref=ref)
        t.tableStyleInfo = TableStyleInfo(name='TableStyleLight9', showRowStripes=True)
        ws.add_table(t)
    return ws


def frase(formato, valor):
    """Frase que se escribe en la historia, como shared/formato.ts: el nivel va en minúscula
    a mitad de oración ("Deshidratación leve"); los demás datos, entre corchetes."""
    if not formato:
        return ''

    def poner(x):
        if x.group(1) != 'valor':
            return f"[{x.group(1).replace('_', ' ')}]"
        if x.start() > 0 and re.match(r'^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]', valor):
            return valor[0].lower() + valor[1:]
        return valor

    return re.sub(r'\{([a-z_]+)\}', poner, formato)


def nombres(ids):
    return ', '.join(CAMPO[i]['etiqueta'] if i in CAMPO else i for i in ids)


REGLAS = {
    'describir_no_interpretar': 'Describir sin interpretar',
    'tercera_persona': 'En tercera persona',
    'con_lateralidad': 'Indicar el lado',
    'terminos_medicos': 'Con términos médicos',
    'con_hora': 'Fecha con hora',
    'con_sustento': 'Cada diagnóstico con su sustento',
    'palabras_paciente': 'Con las palabras del paciente',
    'max_3': 'Máximo tres',
    'orden_cronologico': 'En orden cronológico',
    'hilo_sintoma_guia': 'Hilado desde el síntoma guía',
    'constructor_sintoma': 'Botón Describir síntoma',
    'solo_datos_positivos': 'Solo datos positivos',
    'sin_codigos': 'Un diagnóstico por línea, sin códigos',
    'farmaco_dosis_via_intervalo': 'Fármaco, dosis, vía y frecuencia',
    'examen_con_pregunta': 'Examen y la pregunta que responde',
    'valor_unidad_rango': 'Fecha, valor, unidad y rango',
    'soap': 'Subjetivo, objetivo, análisis y plan',
}


def reglas(lista):
    out = []
    for r in lista:
        if r.startswith('escalas:'):
            continue
        if r.startswith('formula:'):
            out.append(f"Se calcula: {r[8:].replace('peso/talla^2', 'peso / talla²').replace('ao+rv+rm', 'apertura ocular + respuesta verbal + respuesta motora')}")
        else:
            out.append(REGLAS.get(r, r))
    return '; '.join(out)


# ---------- Campos ----------
filas = []
for c in m['campos']:
    filas.append([
        c.get('plantilla_nombre', ''),
        AREA.get(c['area'], ''),
        c.get('seccion_titulo_plantilla', c['seccion_titulo']),
        c.get('subtitulo', ''),
        c['orden'],
        c['etiqueta'],
        c['campo_id'],
        c['tipo_legible'],
        'Sí' if c['obligatorio'] else 'No',
        c['lista_nombre'],
        c['valor_normal'],
        ', '.join(e['nombre'] for e in c['escalas']),
        reglas(c['reglas']),
        sum(1 for g in m['guias'] if g['ambito'] in c['ambitos_guia']),
        f"mapeo/{ARCHIVO_AREA.get(c['area'], '')}",
    ])
hoja('Campos', ['Plantilla', 'Área', 'Sección', 'Grupo', 'Orden', 'Campo', 'Identificador', 'Tipo', 'Obligatorio', 'Lista de opciones', 'Valor normal (botón Normal)', 'Escalas que admite', 'Reglas de redacción', 'Entradas de guía', 'Documento'],
     filas, [26, 30, 30, 24, 8, 30, 24, 18, 11, 24, 60, 30, 32, 10, 34])

# ---------- Opciones (listas de una opción o varias) ----------
filas, colores = [], []
for l in m['listas']:
    if l['tipo'] != 'opcion':
        continue
    for o in l['opciones']:
        propia = o['etiqueta'].strip()
        buscada = definiciones.get((l['lista_id'], o['valor']))
        if propia:
            definicion, fuente = propia, 'Catálogo de la app'
        elif buscada:
            definicion, fuente = buscada
        else:
            definicion, fuente = '—', 'Término de uso común'
        filas.append([AREA.get(l['area'], ''), l['nombre'], l['lista_id'], o['orden'], o['valor'], o['gravedad_nombre'], definicion, fuente, nombres(l['usada_en'])])
        colores.append(o['gravedad'])
ws = hoja('Opciones', ['Área', 'Lista', 'Identificador de lista', 'Orden', 'Opción', 'Semáforo', 'Definición (solo pantalla)', 'Fuente', 'Se usa en'],
          filas, [30, 28, 20, 8, 34, 12, 70, 22, 40], '2E7D32')
pintar(ws, 6, colores)

# ---------- Escalas ----------
filas, colores = [], []
for l in m['listas']:
    if l['tipo'] != 'escala':
        continue
    for o in l['opciones']:
        filas.append([AREA.get(l['area'], ''), l['nombre'], l['lista_id'], o['orden'], o['valor'], o['gravedad_nombre'], o['etiqueta'], frase(o['formato_salida'], o['valor']) or o['valor'], nombres(l['usada_en'])])
        colores.append(o['gravedad'])
ws = hoja('Escalas', ['Área', 'Escala', 'Identificador', 'Orden', 'Nivel', 'Semáforo', 'Descripción del nivel', 'Frase que se escribe en la historia', 'Campos donde se usa'],
          filas, [30, 30, 16, 8, 16, 12, 44, 60, 50], '6A1B9A')
pintar(ws, 5, colores)
pintar(ws, 6, colores)

# ---------- Frases por región ----------
filas = []
for l in m['listas']:
    if l['tipo'] != 'frase':
        continue
    for o in l['opciones']:
        normal = o['valor'] == 'n'
        buscada = definiciones.get((l['lista_id'], o['valor']), ('', ''))
        datos = ', '.join(sorted({d.replace('_', ' ') for d in re.findall(r'\{([a-z_]+)\}', o['etiqueta'])}))
        filas.append([
            AREA.get(l['area'], ''),
            l['nombre'].replace('Frases · ', '').capitalize(),
            nombres(l['usada_en']),
            'Normal' if normal else o['valor'],
            re.sub(r'\{([a-z_]+)\}', lambda x: f"[{x.group(1).replace('_', ' ')}]", o['etiqueta']).strip(),
            datos,
            'Frase normal (botón Normal)' if normal else buscada[0],
            '' if normal else buscada[1],
        ])
hoja('Frases por región', ['Área', 'Región o sección', 'Campo', 'Código', 'Frase que se escribe', 'Datos a completar', 'Significado clínico (solo pantalla)', 'Fuente'],
     filas, [30, 22, 34, 10, 70, 22, 60, 18], 'EF6C00')

# ---------- Valores normales ----------
filas = []
for c in m['campos']:
    if c['valor_normal']:
        filas.append([AREA.get(c['area'], ''), c['seccion_titulo'], c['etiqueta'], c['valor_normal'], 'Catálogo de la app', 'Botón Normal'])
for g in m['guias']:
    if g['tipo'] == 'normal':
        seccion = 'Exámenes auxiliares' if g['ambito'].startswith('ex.') else SECCION.get(CAMPO.get(g['ambito'], {}).get('seccion', g['ambito']), '')
        filas.append([AREA.get(g['area'], ''), seccion, g['ambito_titulo'], g['texto'], g['archivo'], 'Guía de llenado'])
hoja('Valores normales', ['Área', 'Sección', 'Tema', 'Valor normal', 'Fuente', 'Dónde aparece'],
     filas, [30, 26, 30, 90, 30, 18], 'C62828')

# ---------- Umbrales ----------
filas = [[u['campo'], u['campo_id'], u['minimo'], u['maximo'], u['interpretacion'], u['gravedad_nombre'], u['archivo']] for u in m['umbrales']]
ws = hoja('Umbrales', ['Dato', 'Identificador', 'Desde', 'Hasta', 'La app muestra', 'Semáforo', 'Fuente'], filas, [36, 22, 10, 10, 60, 12, 16], 'C62828')
pintar(ws, 5, [u['gravedad'] for u in m['umbrales']])
pintar(ws, 6, [u['gravedad'] for u in m['umbrales']])
ws.append([])
ws.append(['Vacío en Desde o Hasta = sin límite. El índice de masa corporal sigue la clasificación de la nota 05c (no la de la Organización Mundial de la Salud). La saturación de oxígeno y la gravedad del Glasgow vienen de fuera de las notas; en Puno, 88 a 92% de saturación puede ser normal.'])
ws.cell(ws.max_row, 1).alignment = Alignment(wrap_text=False)
ws.cell(ws.max_row, 1).font = Font(italic=True, color='555555')

# ---------- Guía de llenado ----------
filas = []
for g in m['guias']:
    if g['tipo'] in ('umbral', 'sindrome') or g['ambito'].startswith('ex.'):
        continue
    if g['ambito'].startswith('s.'):
        seccion = 'Síntoma guía'
    elif g['ambito'] in SECCION:
        seccion = SECCION[g['ambito']]
    else:
        seccion = SECCION.get(CAMPO.get(g['ambito'], {}).get('seccion', ''), '')
        if not seccion:
            campo = next((c for c in m['campos'] if g['ambito'] in c['ambitos_guia']), None)
            seccion = campo['seccion_titulo'] if campo else ''
    filas.append([AREA.get(g['area'], ''), seccion, g['ambito_titulo'], g['tipo_titulo'], g['texto'], g['archivo']])
hoja('Guía de llenado', ['Área', 'Sección', 'Tema', 'Tipo', 'Texto', 'Fuente'], filas, [30, 28, 30, 18, 100, 16], '00838F')

# ---------- Síntomas ----------
filas = [[s['valor'], s['definicion'], s['guia'] or '—'] for s in m['sintomas']]
hoja('Síntomas', ['Síntoma', 'Definición', 'Guía de síntoma que aplica'], filas, [28, 80, 28], '2E7D32')

# ---------- Síndromes ----------
filas = []
for g in m['guias']:
    if g['tipo'] == 'sindrome':
        nombre, _, cuadro = g['texto'].partition(':')
        filas.append([nombre.strip(), cuadro.strip(), g['archivo']])
hoja('Síndromes', ['Síndrome', 'Síntomas y signos', 'Fuente'], filas, [42, 110, 12], '4E342E')

# ---------- Exámenes auxiliares ----------
filas = [[g['ambito_titulo'], g['tipo_titulo'], g['texto'], g['archivo']] for g in m['guias'] if g['ambito'].startswith('ex.')]
hoja('Exámenes auxiliares', ['Examen', 'Tipo', 'Texto', 'Fuente'], filas, [30, 18, 100, 40], '1565C0')

# ---------- Revisión con las notas (sección "Discrepancias y pendientes" de cada .md) ----------
# Viene de scripts/mapeo.ts (allí se marca lo ya corregido).
filas = [[AREA[r['area']], r['n'], r['tema'], r['texto'], r['estado']] for r in m['revision']]
ws = hoja('Revisión con las notas', ['Área', 'N.º', 'Tema', 'Diferencia entre la app y las notas', 'Estado'], filas, [30, 6, 26, 120, 18], 'AD1457')
for fila in ws.iter_rows(min_row=2, min_col=5, max_col=5):
    for celda in fila:
        color = {'Corregido': 'C8E6C9', 'Corregido en parte': 'FFF9C4'}.get(celda.value, 'FFE0E0')
        celda.fill = PatternFill('solid', fgColor=color)

# ---------- Siglas ----------
filas = [[a['sigla'], a['completo']] for a in m['abreviaturas']]
hoja('Siglas', ['Sigla o abreviatura', 'Se escribe en la historia'], filas, [22, 60], '616161')

# ---------- Léeme (primera hoja) ----------
ws = wb['Sheet']
ws.title = 'Léeme'
wb.move_sheet(ws, offset=-(len(wb.sheetnames) - 1))
ws.sheet_properties.tabColor = AZUL
ws.column_dimensions['A'].width = 44
for col in 'BCDEFG':
    ws.column_dimensions[col].width = 14
ws.column_dimensions['H'].width = 56

ws['A1'] = 'HC App · Mapeo completo de la historia clínica'
ws['A1'].font = Font(bold=True, size=16, color=AZUL)
ws['A2'] = f'Generado el {date.today().strftime("%d/%m/%Y")} desde seed/esquema.csv, seed/opciones.csv, seed/guias.csv y las notas de Semiología (FMH UNA Puno).'
ws['A3'] = 'Las definiciones, la guía y los significados clínicos son para estudiar y llenar la historia: se ven en la app, no se imprimen en el Word.'
for celda in ('A2', 'A3'):
    ws[celda].font = Font(color='555555')

ws['A5'] = 'Hojas'
ws['A5'].font = Font(bold=True, size=12)
descripcion = {
    'Campos': 'Los 152 campos de la plantilla: tipo, lista, valor normal, escalas y reglas de redacción.',
    'Opciones': 'Opciones de cada lista con su definición y de dónde sale.',
    'Escalas': 'Cada nivel de cada escala y la frase que escribe la app.',
    'Frases por región': 'Frase normal y hallazgos alterados de cada región, con su significado clínico.',
    'Valores normales': 'Todo valor normal: los del botón Normal y los de la guía (signos vitales, regiones, exámenes).',
    'Umbrales': 'Rangos con que la app interpreta los signos vitales al escribirlos.',
    'Guía de llenado': 'Cómo preguntar, qué usar, posición, técnica, qué buscar, cómo interpretar y alertas.',
    'Síntomas': 'Síntomas del catálogo con su definición y la guía que se abre al elegirlos.',
    'Síndromes': 'Catálogo de síndromes con su cuadro clínico.',
    'Exámenes auxiliares': 'Cuándo pedir cada examen, valores normales y cómo leerlo.',
    'Revisión con las notas': 'Diferencias que los agentes encontraron entre la app y tus notas, y cuáles ya se corrigieron.',
    'Siglas': 'Siglas que la app detecta y cómo se escriben completas.',
}
fila = 6
for nombre in wb.sheetnames[1:]:
    c = ws.cell(fila, 1, nombre)
    c.hyperlink = f"#'{nombre}'!A1"
    c.font = Font(color='1565C0', underline='single')
    ws.cell(fila, 2, f'{wb[nombre].max_row - 1} filas')
    ws.cell(fila, 3, descripcion.get(nombre, ''))
    fila += 1

fila += 1
ws.cell(fila, 1, 'Resumen por área').font = Font(bold=True, size=12)
fila += 1
cab = ['Área', 'Campos', 'Listas', 'Opciones', 'Entradas de guía', 'Definiciones nuevas', 'Documento .md', 'Ruta']
for i, t in enumerate(cab, start=1):
    c = ws.cell(fila, i, t)
    c.font = ENCABEZADO
    c.fill = PatternFill('solid', fgColor=AZUL)
    c.alignment = Alignment(wrap_text=True, vertical='center')
for a in m['areas']:
    fila += 1
    listas_area = [l for l in m['listas'] if l['area'] == a['id']]
    ids = {l['lista_id'] for l in listas_area}
    md = DOCS / 'mapeo' / a['archivo']
    valores = [
        AREA_LARGA[a['id']],
        sum(1 for c in m['campos'] if c['area'] == a['id']),
        len(listas_area),
        sum(len(l['opciones']) for l in listas_area),
        sum(1 for g in m['guias'] if g['area'] == a['id']),
        sum(1 for (lista, _) in definiciones if lista in ids),
        'Sí' if md.exists() else 'Pendiente',
        f"mapeo/{a['archivo']}",
    ]
    for i, v in enumerate(valores, start=1):
        c = ws.cell(fila, i, v)
        c.alignment = ARRIBA
        if fila % 2 == 0:
            c.fill = PatternFill('solid', fgColor=SUAVE)
    if md.exists():
        ws.cell(fila, 8).hyperlink = f"mapeo/{a['archivo']}"
        ws.cell(fila, 8).font = Font(color='1565C0', underline='single')

fila += 2
ws.cell(fila, 1, 'Cómo regenerarlo').font = Font(bold=True, size=12)
ws.cell(fila + 1, 1, 'En la carpeta del proyecto: npm run mapeo  (lee los CSV de seed/ y las definiciones de docs/mapeo/datos/).')
ws.cell(fila + 2, 1, 'Fuentes: código de nota = prefijo del archivo en wiki/SEMIOLOGIA/clases (02a, 05e, 08c…); "fuera de notas" = valor estándar que tus notas no traen.')

SALIDA.parent.mkdir(parents=True, exist_ok=True)
try:
    wb.save(SALIDA)
except PermissionError:
    # El archivo está abierto en Excel: se guarda al lado, sin tocar el abierto.
    SALIDA = SALIDA.with_name(f'{SALIDA.stem} (actualizado){SALIDA.suffix}')
    wb.save(SALIDA)
    print('El Excel estaba abierto: se guardó una copia actualizada al lado. Ciérralo y vuelve a correr npm run mapeo.')
print(f'{SALIDA}  ({len(definiciones)} definiciones nuevas)')
for nombre in wb.sheetnames:
    print(f'  {nombre}: {wb[nombre].max_row - 1}')
