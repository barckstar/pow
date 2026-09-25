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

El embudo es: `/costa-rica` → ficha de destino → `/apply/<destino>`.

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

**Se carga al acercarse a la pantalla, no al pulsar un botón y tampoco de
entrada.** Hubo un botón —«Ver los horarios libres»— y el cliente lo quitó:
quiere el calendario a la vista. Tiene razón en lo que importa, un botón entre
la gente y la reserva es fricción justo donde no conviene.

Pero embeber el widget sin más descarga su JavaScript de terceros en TODA
visita a `/book`, la use quien la use, y se come el presupuesto de
rendimiento — en móvil el sitio ya está en 86 con un estándar de 95. Así que
`features/reservas/components/Calendly.tsx` lo carga con un
`IntersectionObserver` de 400 px de margen: para quien mira, el calendario
simplemente está ahí; para el navegador, no existe hasta que hace falta. Es el
patrón con el que se incrustan los vídeos de YouTube sin hundir la puntuación,
disparado por el scroll en vez de por un clic.

⚠️ **Al depurarlo, ojo con el panel del navegador oculto.** Un documento con
`visibilityState: "hidden"` no corre el bucle de pintado, y sin bucle de
pintado el navegador **no entrega las llamadas del `IntersectionObserver`**. El
widget se queda en su estado de espera y parece roto sin que haya un solo error
en consola. No lo está: en cuanto la pestaña se ve, dispara. Se comprueba con
`document.visibilityState` y contando `requestAnimationFrame` — si salen cero
fotogramas, el problema es el entorno de prueba, no el código.

⚠️ **Los colores de marca del embebido son de plan de pago.**
`primary_color`, `background_color` y `text_color` van en la URL y la cuenta
gratuita **los ignora**: el calendario sale con el azul de Calendly. Los
parámetros se quedan puestos porque en la cuenta del cliente, que sí tiene
plan, sí aplican.

**Un esqueleto mientras Calendly pinta.** Entre que el observador dispara y
que el widget aparece pasan segundos, y durante esos segundos el cliente vio
lo peor posible: un rectángulo crema vacío del alto de la pantalla, que se lee
como una página rota. Ahora hay un esqueleto con la forma de lo que viene
—panel a la izquierda, rejilla del mes a la derecha, zona horaria abajo— y la
línea «Cargando el calendario…».

**La señal de «ya pintó» es `calendly.page_height`**, leída del `widget.js` de
Calendly. Es el único mensaje que su script escucha y lo manda la página
incrustada cuando ya midió, o sea cuando hay algo delante de la gente. La
lógica está en `features/reservas/lib/senal.ts`, con pruebas — incluida la del
origen, que se compara por IGUALDAD para que `https://calendly.com.otra.cosa`
no cuele.

Se probaron y se descartaron otras dos, las dos por avisar de lo que no es:

- El `load` del `iframe` dice que el marco cargó, no que dentro haya algo. Con
  las cookies de terceros bloqueadas llega igual y deja la caja en blanco.
- La rueda de Calendly —`div.calendly-spinner`— **no la quita nunca**: su
  `widget.js` tiene un `buildSpinner()` que la crea y nada que la borre. El
  `iframe` se pinta encima.

**Y no hay tope de tiempo.** Lo hubo, de 20 s, y en una captura de Chrome se
vio lo que hacía: el esqueleto se iba por el tope y dejaba la caja en blanco,
el mismo fallo, más tarde. Si `page_height` no llega es que no hay calendario
debajo, y entonces un esqueleto es más verdad que un hueco vacío. Debajo de la
caja hay una línea fija con la salida a calendly.com, puesta desde el primer
momento y no a los quince segundos: para saber que algo falló habría que
acertar con la señal de que fue bien, y un temporizador que se equivoca en la
página que cierra la venta no vale lo que promete.

**Las duraciones viven en `features/reservas/data/clases.json`**, no en una
variable de entorno. Estuvieron en `NEXT_PUBLIC_CALENDLY_URL` mientras hubo una
sola; con varias dejó de caber, porque cada una lleva enlace, etiqueta y
descripción — o sea contenido — y porque la cuenta de Calendly no cambia entre
entornos. Con el archivo vacío, la página explica el proceso y dice que todavía
no se puede reservar; con una duración va directa al calendario; con varias
enseña un selector antes.

⚠️ Varias duraciones, el cobro y la integración con Zoom son **funciones de
plan de pago** de Calendly. El gratuito deja un solo tipo de evento activo.

**Lo que se quitó al decidir esto:** el selector de franjas propio, el puerto
de calendario con sus dos adaptadores, la librería de husos horarios con sus
tests del cambio de hora y las dos rutas de servidor de PayPal. Unas 500 líneas
que funcionaban. Mantener una segunda forma de reservar —que además no cobraba
ni creaba la reunión— era garantizar que las dos divergieran. Está en el
historial, en el commit `0dcca7e`.

⚠️ Cobrar y conectar Zoom son **funciones de plan de pago** de Calendly. Sin
cobro, cualquiera aparta una franja sin pagar.

### Quién da las clases — lo primero de `/online`

Estaba al final, después de los pasos, lo que se practica y por qué. El cliente
lo movió arriba del todo y tiene razón en lo que importa: quien entra a mirar
clases particulares no compara temarios, decide si se fía de la persona con la
que va a pasar una hora hablando. Esa decisión se toma en los primeros
segundos, y antes se tomaba en la página quince.

Va en **franja teal**, no en otra sección crema. El resto de `/online` es crema
sobre crema, y una sección más del mismo color pegada al hero no se lee como
«aquí empieza algo». El teal es el 30 % de la paleta y su trabajo es ese; la
portada ya hace el mismo gesto con `.confianza`.

**Es una lista aunque hoy solo esté Chris Pow**, porque el cliente dijo que
habrá más. La rejilla es `auto-fit`: con uno sale una ficha ancha —retrato a un
lado, texto al otro— y con dos o tres se reparten en columnas sin tocar la hoja
de estilos.

Vive en `features/online/data/profesores.json` con su esquema al lado, y no en
`sitio.ts`, donde estuvo un rato: `papel`, `bio` y las etiquetas de los datos
van en dos idiomas, y el contenido bilingüe de este sitio va en `.json`
validado. `ZONA_PROFESOR` sí se queda en `sitio.ts` — no es contenido, no se
traduce, y lo usan también `/book` y la cuenta de horarios.

**El retrato va a sangre**, no dentro de un marco con aire alrededor: ocupa el
borde de la ficha —en escritorio la columna izquierda entera, de arriba abajo;
en móvil una banda a lo ancho— y se funde con la crema con un degradado que se
come **el último 5 %** y nada más. Es el mismo gesto que los velos del hero, y
el 5 % no es capricho: un degradado largo sobre un retrato apaga la cara.

Dos detalles que no se ven pero sostienen eso:

- El degradado sale de `color-mix(… var(--color-crema) 0%, transparent)` y no
  de `transparent` a secas. `transparent` es negro con alfa 0, y varios
  navegadores interpolan hacia él: el degradado sale con un halo gris antes de
  llegar a la crema.
- El hueco reserva su tamaño **haya foto o no**, así que el día que llegue un
  archivo nuevo no se mueve nada y el CLS sigue en 0.

Conviene un **retrato con la cara en el tercio de arriba**: el recorte es
`cover` anclado al 18 % de altura, o sea que lo que se pierde es lo de abajo.
Con `50% 50%` una caja apaisada le corta la frente a la gente.

⚠️ La etiqueta de la zona horaria decía **«Tu zona horaria»** y enseñaba la del
profesor — o sea, le decía a cada visitante que vivía en Zúrich. Dice «Zona
horaria del profesor», y estaba mal en los dos sitios donde sale.

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

**El retrato de Chris** lo dio él mismo para esta web, así que lleva
`"permisoConfirmado": true` en `creditos-cedidas.json` — es su cara, su foto y
su negocio. Es el único de ese archivo que está en `true`.

⚠️ **Las cinco fotos de clase NO son de Unsplash.** Las entregó el cliente,
salen de las webs de las escuelas socias y llevan personas reconocibles.
Publicarlas necesita dos permisos que no son el mismo: el de la escuela
—derechos de autor— y el de quien aparece —derechos de imagen—. El cliente
pidió publicarlas ya y asumió esa responsabilidad; el dato queda escrito en
`creditos-cedidas.json` con `"permisoConfirmado": false`, y `/credits` lo dice.

Los créditos son **dos archivos** y no uno: `descargar-fotos.mjs` reescribe
`creditos-fotos.json` entero cada vez que corre, así que una entrada añadida a
mano ahí desaparecería sin dejar rastro.

⚠️ La búsqueda de Unsplash mezcla fotos gratuitas con las de **Unsplash+**, que
son de pago. Se distinguen por el autor: «Unsplash+ Community», usuario `plus`.

Todo el detalle, incluido por qué no se generan imágenes con IA, en
[`docs/imagenes.md`](docs/imagenes.md).

**El logo** ya no es el recorte de baja resolución del concept board. El
cliente mandó el original —2000x2000, con transparencia real— el 23/09/2026, y
`scripts/recortar-logo.py` se reescribió para partir de él: ya no hace falta
el relleno por inundación de la v1, que buscaba un fondo casi blanco porque el
board no era transparente. Sigue guardando en `public/marca/perezoso.png`, así
que ningún componente cambió de ruta — solo el `width`/`height` de cada
`<Image>`, porque la proporción real (1,18:1) no es la del recorte viejo
(1,29:1).

**El logo del navbar creció dos veces el mismo día**, a pedido del cliente
—«lo máximo sin que se vea desproporcionado»—. El techo real es
`--nav-h: 4.25rem` (68 px): la barra no lleva relleno vertical, así que
cualquier alto mayor se sale de ella. Terminó en 2.85rem/3.2rem (según el
ancho de pantalla), que deja unos 17-22 px de aire repartidos arriba y abajo
— de sobra para que no toque los bordes.

⚠️ **El icono del PWA y el favicon necesitan MÁS margen que el logo grande,
no el mismo.** `icon.png`/`favicon.ico` se generaban con el mismo recorte
ajustado que `perezoso.png` —4 % de margen— y en la pestaña del navegador se
veía apretado: el cliente lo dijo, «el fav icon no se ve bien […] este aun es
muy grande». La comparación que lo delató fue el propio `apple-icon.png`, que
sin que nadie lo pidiera ya llevaba más aire (150 px de contenido sobre un
lienzo de 180). `recortar-logo.py` generaliza esa misma proporción
—`PROPORCION_ICONO = 150/180`— al icono de PWA y a los favicons de 48 y 32;
el de 16 la aplica sobre el recorte de la cara, no sobre el cuadrado entero.

### Tres idiomas, inglés por defecto — español se agregó y se quitó el mismo día

El 23/09/2026 el cliente pidió sumar alemán y francés —«de momento solo esos,
los italianos que mamen picha»— y cambiar el idioma por defecto de español a
inglés: «no sirve que salga en español, los potenciales estudiantes no saben
español». Unas horas después, sin más explicación, pidió quitar español por
completo: «quita el español de los idiomas». `IDIOMAS` terminó el día en
`["en", "de", "fr"]`, en `shared/i18n/config.ts`.

**Ese solo cambio obliga a traducir TODO.** `localizado()` construye su
esquema de Zod a partir de `IDIOMAS`, así que en cuanto se agregó `de` y `fr`
el build empezó a exigirlos en cada `.json` de contenido que usa
`localizado()` —`destinos`, `faq`, `tiquismos`, `clases` de online y de
reservas, `profesores`, `opciones` de solicitud— y en cada `Record<Idioma,…>`
suelto —`SEO`, los `TEXTOS` de la portada y del blog, `CARGADORES` de
`diccionario.ts`—. No es un efecto colateral, es el porqué de que agregar un
idioma sea una sola línea en `config.ts`: el propio build dice, archivo por
archivo, dónde falta. Al quitar español pasó lo mismo al revés: `tsc` señaló,
uno por uno, cada sitio que todavía asumía que «es» existía.

⚠️ **Ahí salieron tres comparaciones `lang === "es" ? … : …` que llevaban
así desde siempre**, en la página de etiquetas del blog, en el feed RSS y en
el `alt` del hero — escritas a mano en vez de vivir en el diccionario, y
nunca actualizadas cuando entraron alemán y francés: los dos caían en la
rama de inglés sin que nadie lo hubiera decidido. No rompían el build porque
`"es"` seguía siendo un valor válido de `Idioma`; se convirtieron en errores
de tipo en cuanto se quitó, que es como se encontraron. Las tres tienen ahora
un `Record<Idioma, …>` con las tres lenguas resueltas de verdad.

**Español no se borró de los datos, solo de la lista de idiomas activos.**
`es.json` sigue en `diccionarios/`, sin que `CARGADORES` lo importe; los
`content/blog/es/*.md` siguen publicados como archivos, sin que `IDIOMAS` los
sirva; los campos `"es"` de cada `.json` de contenido —`destinos`, `faq`,
`tiquismos`…— se quedaron tal cual, porque `localizado()` no es `.strict()`
y una clave de más se descarta en silencio al validar, no rompe nada.
Reactivar español es agregarlo a `IDIOMAS` otra vez, no rehacer el trabajo.

⚠️ **Dos artículos del blog en inglés dejaron de compilar** por esto mismo:
declaraban `traduccion: <slug-en-español>` en su frontmatter, y
`verificarTraducciones()` en `leer.ts` comprueba que esa `traduccion` exista
en ALGÚN idioma que el build lea de verdad — que ya no incluye español. Se
quitó la línea de los dos archivos con una nota explicando por qué, en vez de
relajar la comprobación: prometerle a Google un `hreflang` a un idioma que el
sitio no sirve es exactamente lo que esa función existe para evitar.

**`/es/*` redirige a `/en/*` con un 301, no un 307.** El resto de `proxy.ts`
usa 307 porque el idioma se decide por visitante; esto es lo contrario, una
decisión permanente del sitio, y un 301 le dice a Google que transfiera el
valor de esas URL en vez de seguir comprobándolas.

⚠️ **Un apóstrofo en francés puede romper el límite de caracteres.**
`scripts/verificar-metadatos.mjs` mide el `<title>` y la descripción sobre el
HTML ya generado, sin decodificar entidades. React escapa cada `'` como
`&#x27;` —seis caracteres en vez de uno— así que «l'espagnol» cuenta como si
tuviera cinco caracteres de más. Con un destino largo de por medio
—«Manuel Antonio, Guanacaste, península de Nicoya»— eso fue la diferencia
entre pasar y no pasar los 65 o los 165. La salida no es prohibir el
apóstrofo —sería mala gramática— sino medirlo: `seoDeSolicitud()` en
`seo.ts` tiene la cuenta hecha para el caso más largo.

**El selector de idioma es un desplegable con bandera, no una fila de
códigos sueltos.** Primero fue eso —una fila de cuatro—, y el cliente lo
pidió cerrar en un botón con el idioma actual y su bandera, que al pulsarlo
abre la lista de los demás. Es un patrón manual de disclosure —botón +
`<ul>` con `hidden`—, no un `<select>`: cada opción es una navegación real a
otra URL, y eso es un `<Link>`, no el valor de un formulario. Se cierra
solo al elegir, al pulsar fuera o con Escape.

⚠️ **La bandera de «es» habría sido la de Costa Rica, no la de España** —la
decisión quedó tomada y escrita en `Banderas.tsx` antes de que el cliente
pidiera quitar español esa misma tarde. Este sitio no enseña español
genérico, así que si español vuelve, esa nota vuelve con él: la convención
más extendida en selectores de idioma usa España para «es», y aquí sería
justo lo contrario de lo que vende el negocio.

⚠️ **El selector de escritorio nunca estuvo en el menú móvil.** Estaba en
`.navbar__idioma`, oculto por completo por debajo de 1100 px — o sea en
cualquier teléfono. Se repite dentro de `#menu-movil`, como fila de chips con
bandera en vez de desplegable: un menú dentro de un menú es un paso de
interacción de más en móvil.

⚠️ **`#menu-movil` no tenía ni una sola regla de CSS.** Se vio al abrirlo de
verdad en un viewport de 390 px: los enlaces se pintaban sueltos, sin fondo,
sin espaciado, con el subrayado azul por defecto del navegador, superpuestos
al contenido de la página — el menú móvil de TODO el sitio, no solo de esta
sesión, llevaba así desde siempre. La causa: es hijo del `<header>`, que es
`position: fixed` y mide `--nav-h` de alto, así que su contenido se salía de
esa caja sin que nada lo posicionara. Ahora `.navbar__movil` es
`position: fixed`, anclado a `--nav-h`, con fondo y tipografía propios.

**El artículo del blog en `/online` se oculta en alemán y francés**, no
enlaza al inglés. `ARTICULO` en esa página es un `Partial<Record<Idioma,
string>>` con una sola clave, `en`: el cliente solo escribió el artículo en
ese idioma, y la regla de siempre es que un hueco visible se arregla, no que
se tape con un enlace a un idioma que no es el que alguien está leyendo.

### «Quiénes somos» — página nueva, contenido inventado

El cliente la pidió el 23/09/2026 con una condición explícita: «aun no
tenemos informacion asi que puedes inventar». Es la ÚNICA página del sitio
con esa licencia — el resto sigue la regla de no rellenar con suposiciones lo
que el cliente no ha confirmado, y aquí se rompe a propósito porque el propio
cliente lo autorizó.

Aun así lleva su aviso de pendiente al cierre (`cierrePendiente`, con el
mismo componente `pendiente` del resto del sitio): un texto inventado sobre
un negocio real puede acabar citado como si fuera la historia oficial, y eso
hay que decirlo donde se lee, no solo en un comentario del código.

El diseño es propio, no la maqueta de `.seccion` que usan las demás páginas
interiores:

- Un **hero sin foto** — teal degradando a crema, con el titular partido en
  dos colores como en la portada. Las demás páginas interiores llevan una
  fotografía; esta habla de una persona y de por qué existe el negocio, no de
  un lugar.
- Una **cita destacada** aparte del cuerpo del texto, tipo pull-quote de
  revista — no existe en ninguna otra página.
- Cuatro valores en tarjetas con un **numeral grande** en vez de icono: no
  hay un icono que diga «crecimiento a propósito», y forzar uno habría sido
  peor que no ponerlo.

⚠️ El numeral se probó al 22 % de teal pensando que, al llevar `aria-hidden`,
no necesitaba el contraste de un texto que se lee. Es la trampa exacta:
`aria-hidden` saca el nodo del árbol de accesibilidad, no de la vista.
Lighthouse lo marcó — 1,48:1 sobre blanco, cuando un texto grande necesita
3:1. Al 80 % de teal da 4,05:1.

### Regla general de diseño: ninguna página interior va sola sobre crema

El 25/09/2026 el cliente vio `/community` sin más cambio que el enlace de
Facebook y lo dijo sin rodeos: «no me gusta y necesita más vida, más sabor,
más estético […] que sea regla general de diseño». La página era la plantilla
que llevaban `/community` y `/pricing` desde el principio —`<h1>`, una
entradilla y un párrafo, todo en crema sobre crema— y el cliente pidió
explícitamente tratarlo como regla, no como arreglo de una sola página.

**La regla: ninguna página interior arranca con un `<h1>` suelto sobre fondo
crema.** Arranca con `FranjaHero` (`shared/components/ui/FranjaHero.tsx`) —una
franja teal degradando a crema, con insignia, titular y un dibujo grande de
`Decorados.tsx` como firma— o con `HeroPagina` cuando la página habla de un
lugar concreto (`/online`, `/costa-rica`). Un color plano de principio a fin
no es nunca la respuesta, sea cual sea el tamaño de la página.

`FranjaHero` nació en «Quiénes somos» el 23/09/2026 como diseño propio de esa
página; el 25/09/2026 se generalizó y `/about`, `/community` y `/pricing` lo
usan hoy. Cada página nueva le suma su propia insignia (`heroInsignia` en el
diccionario, esquema en `esquema.ts`) y su propio dibujo de decoración — no se
repite el mismo entre páginas, porque la gracia es que cada una tenga su
firma.

El mismo criterio aplica al contenido bajo el hero: un enlace o botón suelto
en el aire (como el de Facebook en `/community` antes de esto) se convierte en
una tarjeta con ícono, título y texto que explique qué es y por qué entrar
(`.tarjeta-red`, hoy sustituida en `/community` por `.invitacion-grupo`) — no basta con mover el elemento a una franja de color, el
elemento mismo necesita contexto.

**La invitación de `/community`.** La tarjeta blanca se quedó corta el mismo
día —«quería un diseño más bonito y que llame más la atención a unirse»— y
pasó a ser una invitación: la ilustración del perezoso surfista que mandó el
cliente a sangre arriba, un panel teal con tres razones para entrar y el
botón naranja con un halo que late **tres veces y se para** (el cliente ya
pidió bajarle el movimiento a las olas). Sube 9 rem sobre la cola crema del
`FranjaHero` para asomar en la primera pantalla. La línea de «vendrán grupos
de conversación» salió de la entradilla y quedó debajo, pequeña.

### Las URL van en inglés

El 25/09/2026 el cliente vio `/en/comunidad` en la barra del navegador: «el
link está en español, no debería». Cinco rutas cambiaron: `comunidad` →
`community`, `precios` → `pricing`, `reservar` → `book`, `solicitud` →
`apply`, `creditos` → `credits`. Las viejas redirigen de forma permanente
desde `redirects()` en `next.config.ts`. Los identificadores del código
(`rutas.comunidad`, `features/solicitud/`…) siguen en español, como todo el
código: lo que se traduce es lo que ve el visitante.

### Tres correcciones que el cliente pidió y que no cuadran con el resto del sitio

Van aplicadas TEXTUALMENTE, como pidió el cliente, y quedan anotadas aquí
porque contradicen contenido que ya existe en otra parte del sitio. No se
resolvió la contradicción por mi cuenta —eso sería inventar cuál de las dos
versiones es la real— así que sigue pendiente de que el cliente lo aclare.

1. **`experiencias.onlineTexto`** dice ahora «Private, group, and couples'
   lessons with local teachers» (clases privadas, en grupo y en pareja, con
   profesores —en plural—). Hoy el sitio solo tiene UN profesor
   (`features/online/data/profesores.json`) y UN tipo de clase, uno a uno
   (`features/reservas/data/clases.json`); la propia FAQ lo dice sin rodeos:
   «For now booking is set up for one-to-one lessons. Whether there will be
   conversation groups… is not settled yet.»
2. El **hero** de la portada tiene el mismo plural: «Tailored online lessons
   with local teachers» (profesores, en plural).
3. **`confianza.reservaTitulo`/`reservaTexto`** pasó de «Reserve with a
   deposit / Hold your lesson with a PayPal deposit» a «Contact Us / Chat
   directly with a member of our team». No hay ningún canal de contacto
   directo montado —`CONTACTO.correo` y `.telefono` siguen en `null`— y el
   resto del sitio (`/book`, `/online`) sigue describiendo el depósito
   por PayPal como el paso real.

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

**Portada** (`/es`):

| | Rendimiento | Accesibilidad | Prácticas | SEO | CLS |
|---|---|---|---|---|---|
| Escritorio | **99** | **100** | **100** | **100** | 0 |
| Móvil | **86** | **100** | **100** | **100** | 0 |

**Clases en línea** (`/es/online`):

| | Rendimiento | Accesibilidad | Prácticas | SEO | CLS |
|---|---|---|---|---|---|
| Escritorio | **100** | **100** | **100** | **100** | 0 |
| Móvil | **96** | **100** | **100** | **100** | 0 |

El rendimiento en móvil va entre 95 y 97 según la corrida. **No es el retrato
de Chris**: está medido que se sirve a 640 px y pesa 23 KB. Es el ruido normal
del simulador.

**Quiénes somos** (`/en/about`), medido en inglés porque es el idioma por
defecto desde el 23/09/2026:

| | Rendimiento | Accesibilidad | Prácticas | SEO | CLS |
|---|---|---|---|---|---|
| Escritorio | **100** | **100** | **100** | **100** | 0 |
| Móvil | **96** | **100** | **100** | **100** | 0 |

**Reservar** (`/es/reservar`), que es la única página con un embebido de
terceros:

| | Rendimiento | Accesibilidad | Prácticas | SEO | CLS |
|---|---|---|---|---|---|
| Escritorio | **99** | **100** | **78** | **100** | 0,05 |
| Móvil | **97** | **100** | **79** | **100** | 0 |

**El rendimiento en móvil de la portada no llega al estándar de 95.** El techo
es el LCP (~3,0 s simulados) de la fotografía a pantalla completa del hero.
Está medido que no es un problema de bytes: reducir la imagen de 30 KB a 16 KB
no movió la puntuación. Son la latencia y la cadena de dependencias que simula
Lighthouse en móvil. Subir de 95 exige sacar la foto del camino del LCP, que es
una decisión de diseño. Ver `PENDIENTE.md`.

**Las prácticas de `/book` no llegan a 95, y no se pueden arreglar con el
calendario a la vista.** Lo que falla es un solo control, `third-party-cookies`
(peso 5 de los 6 que se pierden): al cargar el widget, Calendly deja cuatro
cookies de terceros —`__cf_bm` y `_cfuvid` de Cloudflare, `OptanonConsent` de
OneTrust y `m` de Stripe—. No hay parámetro del embebido que lo evite; es lo
que es embeber Calendly.

El botón que había antes SÍ lo evitaba, porque nada se cargaba hasta que
alguien pulsaba, y ese clic hacía además de consentimiento. El cliente pidió
quitarlo. Es su decisión y el resto del sitio —las otras 39 páginas— sigue en
100. Lo que queda anotado es la consecuencia, que además de puntuación es de
privacidad: **ahora esas cookies se dejan al bajar hasta el calendario, sin que
nadie haya consentido nada.** Con alumnos en Europa o en Suiza eso hay que
resolverlo antes de publicar, y la salida no es esconder el banner de Calendly.
Está en `PENDIENTE.md`.

**El CLS de 0,05 en escritorio lo produce `data-resize`.** Calendly mide su
contenido y ajusta la caja —de los 46 rem reservados a los ~41 que necesita— y
eso mueve lo que hay debajo —el esqueleto se lo come en parte, de ahí que
bajara de 0,069 a 0,05—. Se probó quitar el atributo: el CLS se va a 0 y a
cambio el `iframe` se queda la rueda del ratón, así que quien baja por la
página con el cursor encima del calendario deja de bajar por la página. Peor
negocio. Se podría afinar reservando exactamente el alto en el que se queda,
pero ese número cambia con la descripción del evento y con la cuenta —y la
cuenta va a cambiar—, así que sería cuadrar dos números que se descuadran
solos. 0,069 está dentro del «bueno» de Google, que es 0,1.
