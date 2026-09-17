"""Recorta el encabezado y el pie de la plantilla PDF y genera los iconos de la app.

Uso: py scripts/extraer-membrete.py   (requiere PyMuPDF: py -m pip install pymupdf)
"""

from pathlib import Path

import fitz  # PyMuPDF

RAIZ = Path(__file__).resolve().parent.parent
PDF = RAIZ / "plantilla-historia-clinica.pdf"
PUBLICO = RAIZ / "web" / "public"
ESCALA = 3

RECORTES = {
    "header.png": (0, 69.5),
    "footer.png": (755, 841.92),
}

ICONO_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" rx="112" fill="#0f5f6b"/>
<rect x="136" y="96" width="240" height="320" rx="28" fill="#ffffff"/>
<rect x="206" y="72" width="100" height="56" rx="18" fill="#cfe9ec"/>
<rect x="238" y="176" width="36" height="120" rx="8" fill="#0f5f6b"/>
<rect x="196" y="218" width="120" height="36" rx="8" fill="#0f5f6b"/>
<rect x="184" y="334" width="144" height="16" rx="8" fill="#9cc9cf"/>
<rect x="184" y="366" width="96" height="16" rx="8" fill="#9cc9cf"/>
</svg>"""


def recortar() -> None:
    doc = fitz.open(PDF)
    pagina = doc[0]
    ancho = pagina.rect.width
    for nombre, (y0, y1) in RECORTES.items():
        clip = fitz.Rect(0, y0, ancho, min(y1, pagina.rect.height))
        pix = pagina.get_pixmap(matrix=fitz.Matrix(ESCALA, ESCALA), clip=clip, alpha=False)
        pix.save(PUBLICO / nombre)
        print(f"{nombre}: {pix.width}x{pix.height}")


def iconos() -> None:
    (PUBLICO / "icon.svg").write_text(ICONO_SVG, encoding="utf-8")
    svg = fitz.open("svg", ICONO_SVG.encode("utf-8"))
    for lado in (192, 512):
        pagina = svg[0]
        factor = lado / pagina.rect.width
        pix = pagina.get_pixmap(matrix=fitz.Matrix(factor, factor), alpha=True)
        pix.save(PUBLICO / f"icon-{lado}.png")
        print(f"icon-{lado}.png: {pix.width}x{pix.height}")


if __name__ == "__main__":
    PUBLICO.mkdir(parents=True, exist_ok=True)
    recortar()
    iconos()
