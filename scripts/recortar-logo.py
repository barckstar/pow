#!/usr/bin/env python3
"""
Genera el juego de iconos a partir del logo del perezoso surfeando.

============ VERSIÓN 2: EL CLIENTE MANDÓ EL ORIGINAL ============
La primera versión de este script recortaba el perezoso de dentro del
concept board (1536x1024), a unos 160x146 px — apenas alcanzaba para el
icono de 512 de PWA, y quedaba borroso. Quedó anotado en PENDIENTE.md:
«hace falta el archivo original del logo en alta para usos grandes».

El cliente lo mandó: una ilustración de 2000x2000, ya con fondo transparente
de verdad (los cuatro cortes probados dieron alfa 0 exacto, no un blanco
casi-transparente), así que ya no hace falta el relleno por inundación de la
v1 — ese buscaba un fondo casi blanco por parecido de color porque el board
NO era transparente. Aquí el único trabajo es recortar al contenido y
generar cada tamaño.
====================================================================

Uso:  python scripts/recortar-logo.py
"""

from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = Path(
    r"C:/Users/barck/AppData/Local/Temp/claude/D--"
    r"/92b9b78e-71fd-4550-9630-d4bc3eb9fc8d/images/22.webp"
)

CREMA = (255, 244, 230)

# Margen transparente alrededor del recorte, en fracción del ancho. Sin él el
# trazo queda pegado al borde del lienzo cuadrado y se ve apretado en el
# icono de PWA.
MARGEN = 0.04

# La cara con gafas, en fracción de la caja cuadrada del logo. A 16 px el
# perezoso entero es una mancha de color sin forma —se comprobó recortando el
# cuadrado completo y bajándolo a 16 px—; la cara sola sí se lee como «un
# personaje con gafas oscuras». Ajustado a ojo sobre el recorte real.
CAJA_CARA = (0.20, 0.32, 0.55, 0.68)


def cuadrar(img: Image.Image) -> Image.Image:
    lado = max(img.size)
    lienzo = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    lienzo.paste(img, ((lado - img.width) // 2, (lado - img.height) // 2), img)
    return lienzo


def main():
    original = Image.open(ORIGEN).convert("RGBA")

    caja = original.getbbox()
    if not caja:
        raise SystemExit("El logo llegó vacío: getbbox() no encontró contenido opaco.")
    recorte = original.crop(caja)

    mx = round(recorte.width * MARGEN)
    my = round(recorte.height * MARGEN)
    con_margen = Image.new(
        "RGBA", (recorte.width + 2 * mx, recorte.height + 2 * my), (0, 0, 0, 0)
    )
    con_margen.paste(recorte, (mx, my), recorte)
    recorte = con_margen

    destino_marca = RAIZ / "public" / "marca"
    destino_app = RAIZ / "src" / "app"
    destino_marca.mkdir(parents=True, exist_ok=True)

    # El maestro que usan navbar, pie y barra social. 900 px de ancho alcanza
    # de sobra para su tamaño de pantalla más grande (el pie, a 3.5rem de
    # alto) incluso en una pantalla retina, y next/image genera sus propios
    # tamaños servidos a partir de éste — no hace falta guardar los 2000 px
    # originales.
    ancho_maestro = 900
    alto_maestro = round(recorte.height * ancho_maestro / recorte.width)
    maestro = recorte.resize((ancho_maestro, alto_maestro), Image.LANCZOS)
    maestro.save(destino_marca / "perezoso.png", optimize=True)

    cuadrado = cuadrar(recorte)

    # Icono PWA 512. La cuantización a 256 colores baja el archivo sin que se
    # note: el dibujo tiene degradados suaves pero pocos bordes finos.
    # FASTOCTREE porque es el único método de PIL que cuantiza conservando
    # alfa.
    icono = cuadrado.resize((512, 512), Image.LANCZOS)
    icono.quantize(colors=256, method=Image.FASTOCTREE).save(
        destino_app / "icon.png", optimize=True
    )

    # Apple no respeta la transparencia: la rellena de negro. Se compone
    # sobre la crema de marca con un margen — así es como Apple espera el
    # icono, sin bordes redondeados, que los pone el sistema.
    apple = Image.new("RGBA", (180, 180), CREMA + (255,))
    contenido = cuadrado.resize((150, 150), Image.LANCZOS)
    apple.paste(contenido, (15, 15), contenido)
    apple.convert("RGB").quantize(colors=128, method=Image.MEDIANCUT).save(
        destino_app / "apple-icon.png", optimize=True
    )

    # Favicon multitamaño. A 48 y 32 px el círculo entero se lee bien; a 16 px
    # se pierde toda la forma y queda una mancha de color, así que ese tamaño
    # usa el recorte de la cara — comprobado a ojo, en pantalla, antes de
    # fijar la caja de arriba.
    ancho, alto = cuadrado.size
    l, t, r, b = CAJA_CARA
    cara = cuadrar(
        cuadrado.crop((int(l * ancho), int(t * alto), int(r * ancho), int(b * alto)))
    )

    marco_48 = cuadrado.resize((48, 48), Image.LANCZOS)
    marco_32 = cuadrado.resize((32, 32), Image.LANCZOS)
    marco_16 = cara.resize((16, 16), Image.LANCZOS)
    marco_48.save(
        destino_app / "favicon.ico",
        format="ICO",
        sizes=[(48, 48), (32, 32), (16, 16)],
        append_images=[marco_32, marco_16],
    )

    print(f"  recorte       {recorte.size[0]}x{recorte.size[1]}")
    print(f"  perezoso.png  {maestro.size[0]}x{maestro.size[1]}")
    print("  icon.png      512x512")
    print("  apple-icon    180x180 sobre crema")
    print("  favicon.ico   48, 32, 16 (16 = solo la cara)")


if __name__ == "__main__":
    main()
