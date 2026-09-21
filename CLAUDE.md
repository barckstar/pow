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

| Línea | Qué es | Estado |
|---|---|---|
| **Online** | clases uno a uno por videollamada, desde Suiza | **es el producto** |
| Inmersión en CR | escuela + hospedaje + viajar, en cuatro destinos | en preparación |

**Lo online es el corazón del negocio, y no es una interpretación.** El propio
cliente lo escribió en el artículo que mandó: «while Costa Rica immersion
experiences will also be part of the project **in the future**, the heart of
CSE is personalized online Spanish learning». Ese artículo está publicado en el
blog en los dos idiomas y su contenido alimenta `/online`.

La vía de inmersión es **un solo tema**, no dos. `/presencial` y `/destinos`
eran páginas separadas y se fusionaron en `/costa-rica` porque el cliente lo
dijo así: «los destinos y aprender en Costa Rica están pensados como un mismo
tema». Son tres patas que van juntas: **la clase** en una escuela de la zona,
**el hospedaje** que resuelve esa escuela, y **el viaje**, que es donde se
practica.

**Lo que sigue sin cerrar:** la lista de destinos —los cuatro de hoy son los
que el cliente puso «por ejemplo»—, los acuerdos con cada escuela
(`"confirmada": false`) y las condiciones del hospedaje. La página lo dice en
un aviso antes de las tarjetas.

El embudo es: `/costa-rica` → ficha de destino → `/solicitud/<destino>`.

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
  features/{landing,online,tiquismos,faq,blog,destinos,solicitud,
              reservas}/
  shared/components/ui/
    Olas.tsx                olas del hero de la PORTADA, y solo de ahí
    HeroPagina.tsx          hero compartido de /online y /costa-rica
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

`destinos.json` son los cuatro destinos de inmersión, y cada uno lleva DOS
fotografías: el atractivo y una clase de verdad ahí. El cliente pidió las dos
—«fotos de los destinos pero también imágenes de los estudiantes»— y tiene
razón: una playa sola vende un viaje, no una escuela.

El esquema contempla además los anuncios pagados con un `.refine()` que hace
imposible guardar un anuncio sin anunciante o un anunciante sin marcar el
anuncio — el aviso de publicidad es obligación legal, no cortesía, y no se
puede añadir «después».

El parseo corre durante el build: un dato malo rompe la compilación en vez de
aparecer vacío en el teléfono del cliente.

### Formulario de solicitud

Los campos los dictó el cliente: nombre, edad, idiomas, **teléfono**, **correo**,
cuánto tiempo planea estar (15 días / 1 mes / mes y medio / 2 meses) y motivo
(idiomas / trabajo / viajes / cultura / familia). Las dos listas viven en
`features/solicitud/data/opciones.json`, validadas.

**El botón está `disabled` a propósito y no es un olvido.** En cuanto un
teléfono y un correo viajen a algún sitio, esto pasa a tratar datos personales:
hay que elegir dónde se guardan, cuánto tiempo y quién los ve, y publicar aviso
de privacidad y consentimiento. Ni siquiera hay correo de contacto confirmado.
El formulario se ve entero y encima lleva el aviso de por qué. Conectarlo es
añadir el `action` y quitar dos líneas.

**El destino va en la RUTA, no en la query.** Estuvo como `?destino=…` y leer
`searchParams` en el servidor obliga a Next a renderizar bajo demanda: sin HTML
estático, `verificar-metadatos.mjs` no tiene nada que revisar y la página nueva
se quedaba fuera de la única red que caza un metadato ausente. Como segmento son
diez páginas prerenderizadas, cada una con su título nombrando el destino.

### Reservar — lo hace Calendly, no el sitio

Las cuatro cosas de una reserva las hace **Calendly**: la franja con sus husos
horarios, el formulario de datos, el **cobro del depósito** (admite PayPal, y
sin pagar no se confirma la franja) y el **enlace de Zoom**, que crea su
integración y manda por correo con la invitación de calendario.

Lo que aporta el sitio son dos cosas:

**Los tres pasos escritos antes del widget.** Calendly no los cuenta: el
visitante llega, ve un calendario y no sabe que va a pagar ahí ni que el enlace
le llega solo. Diez segundos de lectura que ahorran la pregunta que más se
responde a mano en un negocio así.

**Carga al hacer clic, no de entrada.** `features/reservas/components/Calendly.tsx`
pinta un botón propio y no pide un solo byte a Calendly hasta que se pulsa.
Embebido sin más, su JavaScript de terceros se descarga en toda visita a
`/reservar` y se come el presupuesto de rendimiento — y en móvil el sitio ya
está en 86 con un estándar de 95. Es el patrón con el que se incrustan los
vídeos de YouTube sin hundir la puntuación. De regalo resuelve media cuestión
de privacidad: si el script no se carga, no hay cookies de terceros que
consentir, y quien pulsa lee justo encima a dónde van sus datos.

Mientras `CALENDLY` sea `null` en `sitio.ts`, la página explica el proceso y
dice que todavía no se puede reservar. No se pinta un calendario que no aparta
nada.

**Lo que se quitó al decidir esto:** el selector de franjas propio, el puerto
de calendario con sus dos adaptadores, la librería de husos horarios con sus
tests del cambio de hora y las dos rutas de servidor de PayPal. Unas 500 líneas
que funcionaban. Mantener una segunda forma de reservar —que además no cobraba
ni creaba la reunión— era garantizar que las dos divergieran. Está en el
historial, en el commit `0dcca7e`.

⚠️ Cobrar y conectar Zoom son **funciones de plan de pago** de Calendly. Sin
cobro, cualquiera aparta una franja sin pagar.

### Metadatos

Todas las páginas pasan por `metadatosDe()` en `shared/lib/sitio.ts`. En Next
el `openGraph` de una página **reemplaza** al del layout en vez de fusionarse,
así que escribirlo suelto deja la página sin `og:image`.

El `<title>` se deja sin sufijo: lo añade `title.template` del layout. Ponerlo
en los dos sitios lo duplicaba.

`scripts/verificar-metadatos.mjs` corre en `postbuild` sobre el HTML generado
y **rompe el build** si algo falta.

### Imágenes

Siete fotografías vienen de **Unsplash** (licencia de uso comercial, sin
atribución obligatoria; se registra igual). Cada una se verifica dos veces:
que sea el sitio que dice ser, y que aguante el recorte de `object-fit: cover`.

⚠️ **Las cinco fotos de clase NO son de Unsplash.** Las entregó el cliente,
salen de las webs de las escuelas socias y llevan personas reconocibles.
Publicarlas necesita dos permisos que no son el mismo: el de la escuela
—derechos de autor— y el de quien aparece —derechos de imagen—. El cliente
pidió publicarlas ya y asumió esa responsabilidad; el dato queda escrito en
`creditos-cedidas.json` con `"permisoConfirmado": false`, y `/creditos` lo dice.

Los créditos son **dos archivos** y no uno: `descargar-fotos.mjs` reescribe
`creditos-fotos.json` entero cada vez que corre, así que una entrada añadida a
mano ahí desaparecería sin dejar rastro.

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
