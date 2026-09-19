#!/usr/bin/env python3
"""
Genera la imagen Open Graph por defecto, 1200x630.

La medida no es negociable: es la que usan WhatsApp, Facebook, LinkedIn y X
para la tarjeta del enlace. Servir una foto de otra proporcion hace que el
recorte automatico se coma el titular o la marca, y por ahi es justo por donde
va a circular este sitio.

Uso:  python scripts/generar-og.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
FOTO = RAIZ / "public" / "fotos" / "manuel-antonio-selva.jpg"
PEREZOSO = RAIZ / "public" / "marca" / "perezoso.png"
DESTINO = RAIZ / "public" / "og" / "por-defecto.jpg"

ANCHO, ALTO = 1200, 630
TINTA_VELO = (6, 40, 44)
CREMA = (255, 244, 230)
DORADO = (244, 182, 65)


def fuente(tamano, negrita=True):
    """Busca una fuente del sistema; cae a la de PIL si no hay ninguna."""
    candidatas = [
        "C:/Windows/Fonts/segoeuib.ttf" if negrita else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if negrita else "C:/Windows/Fonts/arial.ttf",
    ]
    for ruta in candidatas:
        if Path(ruta).exists():
            return ImageFont.truetype(ruta, tamano)
    return ImageFont.load_default(tamano)


def main():
    foto = Image.open(FOTO).convert("RGB")

    # Recorte centrado a 1200x630 conservando la proporcion de la foto.
    escala = max(ANCHO / foto.width, ALTO / foto.height)
    nueva = (round(foto.width * escala), round(foto.height * escala))
    foto = foto.resize(nueva, Image.LANCZOS)
    izq = (foto.width - ANCHO) // 2
    arr = (foto.height - ALTO) // 2
    lienzo = foto.crop((izq, arr, izq + ANCHO, arr + ALTO))

    # Velo en degradado: sin el, el texto blanco depende del pixel que le
    # toque detras. Mas opaco a la izquierda, donde va el titular.
    velo = Image.new("RGBA", (ANCHO, ALTO), (0, 0, 0, 0))
    pincel = ImageDraw.Draw(velo)
    for x in range(ANCHO):
        alfa = int(232 - (x / ANCHO) * 130)
        pincel.line([(x, 0), (x, ALTO)], fill=TINTA_VELO + (alfa,))
    lienzo = Image.alpha_composite(lienzo.convert("RGBA"), velo)

    pincel = ImageDraw.Draw(lienzo)

    # Marca arriba
    perezoso = Image.open(PEREZOSO).convert("RGBA")
    alto_logo = 76
    ancho_logo = round(perezoso.width * alto_logo / perezoso.height)
    perezoso = perezoso.resize((ancho_logo, alto_logo), Image.LANCZOS)
    lienzo.paste(perezoso, (72, 62), perezoso)

    pincel.text((72 + ancho_logo + 18, 78), "COSTA RICA", font=fuente(26), fill=DORADO)
    pincel.text(
        (72 + ancho_logo + 18, 110),
        "SPANISH EXPERIENCE",
        font=fuente(22, negrita=False),
        fill=CREMA,
    )

    # Titular
    pincel.text((72, 250), "Aprendé español.", font=fuente(72), fill=CREMA)
    pincel.text((72, 336), "Hablá como tico.", font=fuente(72), fill=DORADO)

    pincel.text(
        (72, 460),
        "Clases en línea y presenciales en Costa Rica",
        font=fuente(30, negrita=False),
        fill=CREMA,
    )

    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    lienzo.convert("RGB").save(DESTINO, quality=86, optimize=True)

    kb = DESTINO.stat().st_size // 1024
    print(f"  {DESTINO.relative_to(RAIZ)}  {ANCHO}x{ALTO}  {kb} KB")


if __name__ == "__main__":
    main()
