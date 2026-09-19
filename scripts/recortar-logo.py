#!/usr/bin/env python3
"""
Recorta el perezoso surfeando del concept board y genera el juego de iconos.

El logo original solo existe dentro de la lamina de concepto (1536x1024), a
unos 160x146 px. Eso alcanza de sobra para el navbar (se dibuja a ~44 px, o
88 px en pantalla retina) y para la barra social, pero queda justo para el
icono de 512 de PWA. Ver PENDIENTE.md: hace falta el archivo original del
logo en alta para usos grandes.

El fondo se quita con relleno por inundacion DESDE LOS BORDES, no borrando
todo pixel claro: dentro del sol hay tonos casi tan claros como el fondo, y
un filtro por color a secas le abriria agujeros.

Uso:  python scripts/recortar-logo.py
"""

from collections import deque
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = Path(
    r"C:/Users/barck/AppData/Local/Temp/claude/D--"
    r"/8fd15a34-2ff2-4094-996a-9d80bf0c3232/images/1.webp"
)

# Limites del logo dentro de la lamina, ajustados a ojo sobre la imagen real.
CAJA = (6, 2, 170, 150)

# Color de fondo del board y tolerancia del relleno. 42 es el valor mas alto
# que quita la linea diagonal tenue de la tarjeta del hero sin comerse el
# borde claro de la espuma de la ola.
FONDO = (253, 247, 238)
TOLERANCIA = 42

CREMA = (255, 244, 230)


def parecido_al_fondo(pixel, referencia, tolerancia):
    return all(abs(pixel[i] - referencia[i]) <= tolerancia for i in range(3))


def quitar_fondo(img):
    """Hace transparente el fondo conectado a los bordes de la imagen."""
    img = img.convert("RGBA")
    ancho, alto = img.size
    pixeles = img.load()

    visitados = bytearray(ancho * alto)
    cola = deque()

    for x in range(ancho):
        cola.append((x, 0))
        cola.append((x, alto - 1))
    for y in range(alto):
        cola.append((0, y))
        cola.append((ancho - 1, y))

    while cola:
        x, y = cola.popleft()
        if not (0 <= x < ancho and 0 <= y < alto):
            continue
        indice = y * ancho + x
        if visitados[indice]:
            continue
        if not parecido_al_fondo(pixeles[x, y], FONDO, TOLERANCIA):
            continue

        visitados[indice] = 1
        pixeles[x, y] = (0, 0, 0, 0)
        cola.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    return img


def solo_la_figura_principal(img):
    """
    Deja unicamente la mancha opaca conectada mas grande.

    La caja de recorte atrapa trozos de elementos vecinos del board —una
    esquina rosa de la tarjeta de abajo, por ejemplo— que no son fondo y por
    tanto sobreviven al relleno. Filtrar por tamano de componente los quita
    sin tener que afinar la caja a ojo cada vez.
    """
    ancho, alto = img.size
    pixeles = img.load()

    etiqueta = [0] * (ancho * alto)
    componentes = {}
    siguiente = 0

    for inicio_y in range(alto):
        for inicio_x in range(ancho):
            indice_inicio = inicio_y * ancho + inicio_x
            if etiqueta[indice_inicio] or pixeles[inicio_x, inicio_y][3] == 0:
                continue

            siguiente += 1
            tamano = 0
            cola = deque([(inicio_x, inicio_y)])
            etiqueta[indice_inicio] = siguiente

            while cola:
                x, y = cola.popleft()
                tamano += 1
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if not (0 <= nx < ancho and 0 <= ny < alto):
                        continue
                    indice = ny * ancho + nx
                    if etiqueta[indice] or pixeles[nx, ny][3] == 0:
                        continue
                    etiqueta[indice] = siguiente
                    cola.append((nx, ny))

            componentes[siguiente] = tamano

    if not componentes:
        return img

    principal = max(componentes, key=componentes.get)
    descartados = sum(t for c, t in componentes.items() if c != principal)
    if descartados:
        print(f"  descartados   {len(componentes) - 1} fragmento(s), {descartados} px")

    for y in range(alto):
        for x in range(ancho):
            if etiqueta[y * ancho + x] != principal:
                pixeles[x, y] = (0, 0, 0, 0)

    return img


def main():
    lamina = Image.open(ORIGEN).convert("RGB")
    recorte = lamina.crop(CAJA)
    sin_fondo = solo_la_figura_principal(quitar_fondo(recorte))

    # Recorta al contenido real: el relleno pudo dejar margen transparente.
    caja_contenido = sin_fondo.getbbox()
    if caja_contenido:
        sin_fondo = sin_fondo.crop(caja_contenido)

    destino_marca = RAIZ / "public" / "marca"
    destino_app = RAIZ / "src" / "app"
    destino_marca.mkdir(parents=True, exist_ok=True)

    # Original a resolucion nativa: lo que usan navbar y barra social.
    sin_fondo.save(destino_marca / "perezoso.png")

    # Version cuadrada sobre lienzo transparente, base de los iconos.
    lado = max(sin_fondo.size)
    cuadrado = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    cuadrado.paste(
        sin_fondo,
        ((lado - sin_fondo.width) // 2, (lado - sin_fondo.height) // 2),
    )

    # Icono PWA 512. Upscale con LANCZOS; queda suave pero legible.
    # La cuantización a 256 colores lo baja de ~257 KB a ~40 KB conservando
    # la transparencia: el dibujo es plano y no tiene degradados finos.
    # FASTOCTREE y no MEDIANCUT: es el único método de cuantización que PIL
    # admite sobre RGBA, y aquí la transparencia hay que conservarla.
    icono = cuadrado.resize((512, 512), Image.LANCZOS)
    icono.quantize(colors=256, method=Image.FASTOCTREE).save(
        destino_app / "icon.png", optimize=True
    )

    # Apple no respeta la transparencia: la rellena de negro. Se compone
    # sobre la crema de marca con un margen, que es como Apple espera el
    # icono (sin bordes redondeados: los pone el sistema).
    apple = Image.new("RGBA", (180, 180), CREMA + (255,))
    contenido = cuadrado.resize((150, 150), Image.LANCZOS)
    apple.paste(contenido, (15, 15), contenido)
    # Paleta de 128 colores: el dibujo es plano y no lo nota, pero el archivo
    # baja de ~30 KB a ~9 KB. Lo descarga todo iPhone que guarde el sitio.
    apple.convert("RGB").quantize(colors=128, method=Image.MEDIANCUT).save(
        destino_app / "apple-icon.png", optimize=True
    )

    # Favicon multitamano. A 16 px el perezoso entero es una mancha, asi que
    # esos tamanos usan un recorte a la cara, que es lo unico reconocible.
    cara = sin_fondo.crop(caja_de_la_cara(sin_fondo.size))
    tamanos_grandes = [48, 32]
    tamanos_pequenos = [16]
    marcos = [
        cuadrado.resize((t, t), Image.LANCZOS) for t in tamanos_grandes
    ] + [cuadrar(cara).resize((t, t), Image.LANCZOS) for t in tamanos_pequenos]
    marcos[0].save(
        destino_app / "favicon.ico",
        format="ICO",
        sizes=[(t, t) for t in tamanos_grandes + tamanos_pequenos],
        append_images=marcos[1:],
    )

    print(f"  recorte       {sin_fondo.size[0]}x{sin_fondo.size[1]}")
    print(f"  perezoso.png  {destino_marca / 'perezoso.png'}")
    print(f"  icon.png      512x512")
    print(f"  apple-icon    180x180 sobre crema")
    print(f"  favicon.ico   48, 32, 16")


def caja_de_la_cara(tamano):
    """La cara con gafas ocupa el cuadrante superior izquierdo del dibujo."""
    ancho, alto = tamano
    return (
        int(ancho * 0.10),
        int(alto * 0.10),
        int(ancho * 0.58),
        int(alto * 0.58),
    )


def cuadrar(img):
    lado = max(img.size)
    lienzo = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    lienzo.paste(img, ((lado - img.width) // 2, (lado - img.height) // 2))
    return lienzo


if __name__ == "__main__":
    main()
