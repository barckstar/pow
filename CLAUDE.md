# CLAUDE.md — Costa Rica Spanish Experience

Sitio web de una escuela que enseña **español costarricense**. Negocio real
(amigo del usuario). Carpeta: `D:\pow`.

> **Antes de tocar nada: leer [`PENDIENTE.md`](PENDIENTE.md).** Hay datos del
> negocio sin confirmar que están en `null` a propósito y **se ven en la
> página**. No se rellenan con suposiciones.

## Qué vende y qué lo diferencia

No vende "clases de español": vende aprender a hablar **como tico** — `pura
vida`, `mae`, `tuanis`, `¿diay?`, el voseo costarricense. Es el único
argumento con el que un negocio de este tamaño compite contra Duolingo, así
que es decisión de producto y aparece en la interfaz, no solo en el copy.

Dos líneas:

| Línea | Dónde | Quién |
|---|---|---|
| Online | remoto, desde Suiza | el profesor |
| En persona | **sin decidir** — se anuncia el modo, no el sitio | el profesor |

La vía presencial **ya no se anuncia como «en Costa Rica»**. Vende el modo
—cara a cara— y el lugar sale con su etiqueta de pendiente, en la página y en
los metadatos. Manuel Antonio y La Fortuna siguen en el sitio, pero en
`/destinos`, como fichas turísticas que no prometen ninguna clase.

**Fuera de alcance:** Colombia, México, El Salvador y España (estaban en el
concept board original, sin datos reales detrás). La app móvil. El LMS.

## Stack

Next.js 16.3.4 · React 19.2.8 · TypeScript estricto · Tailwind v4 · Zod 4 ·
Vitest · `unified`/`remark`/`rehype` (solo build) · `schema-dts`.

**Cero librerías de animación.** Todo CSS, animando solo `transform` y
`opacity`.

## Arquitectura

Feature-Based. `src/app/` es capa de rutas delgada.

```
content/blog/{es,en}/*.md     artículos (fuera de src/)
scripts/                      recortar-logo, descargar-fotos, generar-og,
                              verificar-contraste, verificar-metadatos
src/
  proxy.ts                    / → /es | /en por Accept-Language
  app/[lang]/…                rutas
  app/api/paypal/…            rutas de servidor
  features/{landing,tiquismos,faq,blog,destinos,reservas,pagos}/
  shared/components/ui/
    Olas.tsx                olas del hero de la PORTADA, y solo de ahí
    HeroPagina.tsx          hero compartido de /online y /presencial
    Decorados.tsx           13 dibujos tropicales en SVG, propios
    DecoradosSeccion.tsx    una receta de adornos por sección
  shared/{i18n,config,lib,data}/
```

## Decisiones que conviene no deshacer

### Paleta — 70/30/10, con contraste medido

| Franja | Token | Hex | Uso |
|---|---|---|---|
| **70 %** | `--color-crema` | `#FFF4E6` | fondos |
| **30 %** | `--color-teal` | `#0F6E78` | superficies, botón primario |
| **10 %** | `--color-naranja` | `#C03F18` | CTA, precios, enlaces |
| texto | `--color-tinta` | `#2A1A12` | cuerpo |
| dorado texto | `--color-dorado-texto` | `#FFE9BC` | texto sobre teal |

Los colores del concept board (`#FB6D3A`, `#5CC3C6`, `#F4B641`, `#FFBEA3`)
**no pasan AA** y quedan como decorativos: nunca llevan texto encima.

`npm run verify` recalcula los pares y falla si alguno baja de 4.5:1.

### Navbar — una sola altura

Alto fijo (`--nav-h`), **sin zoom**. Lo único que hace al hacer scroll es
esconderse al bajar y volver al subir: umbral de 6 px, se oculta solo pasados
150 px, nunca con el menú móvil abierto, listener `{ passive: true }`.

Tuvo tres estados —alto de dos filas en el tope, compacto al salir, oculto al
bajar— y **se quitaron por petición del cliente**. Quitar solo el `scale(1.3)`
del logo no bastó: el zoom que se veía era la barra entera cambiando de tamaño.

Se conservan dos cosas del diseño anterior, porque no cuestan movimiento:
esconderse al bajar, y el fondo sólido en el tope frente a translúcido con
desenfoque al salir (cambio de color, no de geometría).

El `padding-top` del `<body>` es exactamente `--nav-h`, así que el CLS es 0 por
construcción y no por haber cuadrado dos números.

**No usar variables CSS dentro de un `transform` con transición.** Una
propiedad personalizada sin registrar con `@property` no vuelve a disparar el
`transform` cuando solo cambia la variable: se queda congelado en el último
valor resuelto. Ya no aplica a ningún estado del navbar, pero la trampa sigue
ahí para quien anime otra cosa.

### Olas — solo en la portada

Cierran el hero de `/` y se funden con la franja teal que viene debajo. Se
probaron en `/online` y `/presencial` y **se quitaron**: una firma que aparece
en todas partes deja de ser una firma.

La geometría está copiada de `D:\ticoshot`, que la tiene resuelta. Dos cosas se
habían desviado y producían una franja sucia sobre la fotografía:

- **Opacidad de las capas de atrás.** Al 0,38 no se ve una ola, se ve la selva
  de la foto a través de la ola. Van al 0,55 y 0,7, como ticoshot.
- **Amplitud de la onda.** Había quedado en el 27 % del lienzo; una curva así,
  estirada a lo ancho de la pantalla, es una recta horizontal, que es el peor
  caso para el antialiasing. Es del 36 %, como ticoshot.

Lo que **no** se copia es la velocidad: allí 17 s, aquí 34, porque el cliente
pidió bajarles el movimiento.

El cuerpo del path baja más abajo que el `viewBox` a propósito: así el borde
inferior es un corte duro y no una fila de píxeles semitransparentes por la que
se cuela la foto. Y `.confianza` sube 1 px (`margin-top: -1px`) para tapar la
juntura fraccionaria que deja la altura del hero en `dvh`.

### Adornos tropicales

Trece dibujos SVG **propios** —lapa roja, tucán, volcán, rueda de carreta,
rama de café, monstera, palmera, hibisco, mariposa, ola, sol, hoja de palma,
estrella— repartidos por las secciones con una receta por sección en
`DecoradosSeccion.tsx`. Ninguna receta pasa de cinco piezas.

Son propios y no un paquete descargado porque casi todas las licencias
gratuitas de iconos exigen atribución visible. Ver
[`docs/imagenes.md`](docs/imagenes.md).

**En móvil la capa entera se apaga** (`@media (min-width: 1024px)`). El hueco
que rellenan solo existe cuando la ventana es más ancha que la columna de
contenido; en un teléfono no rellenan nada, se meten detrás del texto.

### i18n

Diccionarios JSON con esquema Zod **estricto**: exige las mismas claves en
todos los idiomas y rechaza cadenas vacías. Agregar alemán es un `de.json` y
una línea en `shared/i18n/config.ts`. Se leen en Server Components: coste cero
en el navegador.

### Contenido en JSON

Tiquismos, preguntas frecuentes, lugares y créditos de fotos viven en `.json`
validado al importar.

`destinos.json` **ya no son sedes de clase**: son fichas de lugares turísticos.
El esquema contempla ya los anuncios pagados con un `.refine()` que hace
imposible guardar un anuncio sin anunciante o un anunciante sin marcar el
anuncio — el aviso de publicidad es obligación legal, no cortesía, y no se
puede añadir «después».

El parseo corre durante el build: un dato malo rompe la compilación en vez de
aparecer vacío en el teléfono del cliente.

### Calendario — puerto y adaptadores

La interfaz habla con `ProveedorCalendario`, nunca con un proveedor. Hay dos
implementaciones: `local.ts` (genera franjas del horario semanal, funciona
hoy) y `remoto.ts` (contrato firmado, `TODO` marcados). **Cambiar de una a
otra es una línea en `calendario/index.ts`.**

### Husos horarios

El profesor está en `Europe/Zurich`, que aplica horario de verano; Costa Rica
**no lo aplica nunca**. La diferencia no es fija: 7 horas en invierno europeo
y 8 en verano. Toda conversión pasa por `features/reservas/lib/horas.ts`, con
tests a ambos lados del cambio. Si esto se rompe, el estudiante llega a la
clase con una hora de diferencia.

### PayPal

El monto lo pone **siempre el servidor**. Nunca se acepta el del cliente.
Mientras `DEPOSITO` sea `null` las rutas devuelven `503` explicando qué falta.
Variables de entorno en [`docs/variables-de-entorno.md`](docs/variables-de-entorno.md).

### Metadatos

Todas las páginas pasan por `metadatosDe()` en `shared/lib/sitio.ts`. En Next
el `openGraph` de una página **reemplaza** al del layout en vez de fusionarse,
así que escribirlo suelto deja la página sin `og:image`.

El `<title>` se deja sin sufijo: lo añade `title.template` del layout. Ponerlo
en los dos sitios lo duplicaba.

`scripts/verificar-metadatos.mjs` corre en `postbuild` sobre el HTML generado
y **rompe el build** si algo falta.

### Imágenes

Las nueve fotografías vienen de **Unsplash** (licencia de uso comercial, sin
atribución obligatoria; se registra igual). Cada una se verifica dos veces:
que sea el sitio que dice ser, y que aguante el recorte de `object-fit: cover`.

⚠️ La búsqueda de Unsplash mezcla fotos gratuitas con las de **Unsplash+**, que
son de pago. Se distinguen por el autor: «Unsplash+ Community», usuario `plus`.

Todo el detalle, incluido por qué no se generan imágenes con IA, en
[`docs/imagenes.md`](docs/imagenes.md).

## Comandos

```bash
npm run dev         # desarrollo
npm run build       # build + verificación de metadatos (postbuild)
npm run verify      # contraste WCAG de la paleta
npm test            # Vitest
npm run typecheck
```

Scripts de un solo uso:

```bash
python scripts/recortar-logo.py     # perezoso + favicon + iconos
python scripts/generar-og.py        # imagen Open Graph 1200x630
node scripts/descargar-fotos.mjs    # fotos de Unsplash + créditos
```

## Estado de Lighthouse

Medido sobre el build de producción (`next start`), mediana de tres corridas.

| | Rendimiento | Accesibilidad | Prácticas | SEO | CLS |
|---|---|---|---|---|---|
| Escritorio | **99** | **100** | **100** | **100** | 0 |
| Móvil | **86** | **100** | **100** | **100** | 0 |

**El rendimiento en móvil no llega al estándar de 95.** El techo es el LCP
(~3,0 s simulados) de la fotografía a pantalla completa del hero. Está medido
que no es un problema de bytes: reducir la imagen de 30 KB a 16 KB no movió la
puntuación. Son la latencia y la cadena de dependencias que simula Lighthouse
en móvil. Subir de 95 exige sacar la foto del camino del LCP, que es una
decisión de diseño. Ver `PENDIENTE.md`.
