# Costa Rica Spanish Experience — Diseño del sitio web

- **Fecha:** 2026-09-19
- **Carpeta:** `D:\pow`
- **Estado:** diseño aprobado, pendiente de plan de implementación
- **Naturaleza:** negocio real (amigo del usuario). No se inventan datos.

---

## 1. Qué es y qué lo diferencia

Sitio web (no la app) de una escuela que enseña **español costarricense** — no español genérico. El producto es aprender a hablar como tico: `pura vida`, `mae`, `tuanis`, `¿diay?`, el voseo costarricense.

Ese es el único argumento con el que un negocio de este tamaño puede competir contra Duolingo o Preply, así que se trata como decisión de producto y aparece en la interfaz, no solo en el copy.

### Dos líneas de negocio, separadas y explícitas

| Línea | Dónde | Quién |
|---|---|---|
| **Online** | remoto, desde Suiza | el profesor (amigo del usuario) |
| **Presencial** | Costa Rica: Manuel Antonio, La Fortuna | por confirmar |

### Fuera de alcance en esta versión

- Colombia, México, El Salvador y España (estaban en el concept board). Sin sedes, profesores ni precios reales, incluirlos sería inventar datos.
- La aplicación móvil del concept board. Solo web.
- LMS / seguimiento de progreso del estudiante ("Lesson 8/20"). Eso es la app.

### `/comunidad` — contingente

El board promete una sección de comunidad. El negocio arranca: **no hay comunidad todavía**, y una página de comunidad sin miembros es una promesa vacía.

Decisión: la ruta se construye, pero su contenido es lo que **sí** existe — las redes reales del negocio, el "Tiquismo del día" archivado y un formulario para avisar cuando abran grupos de conversación. No se muestran contadores de miembros, testimonios ni actividad inventada. Si el profesor no tiene redes todavía, la ruta no se publica y queda listada en `PENDIENTE.md`.

---

## 2. Stack

Estándar de la casa, idéntico a `gordillos-pizza` / `brasa-y-humo`:

- Next.js 16.3.4 (App Router), React 19.2.8
- TypeScript estricto
- Tailwind CSS v4
- Zod 4 para validar todo JSON en la frontera
- `schema-dts` para JSON-LD
- Vitest para las piezas con lógica (husos horarios, generación de franjas, parseo de artículos)
- `unified` + `remark-parse` + `remark-gfm` + `remark-rehype` + `rehype-react` + `gray-matter` para el blog (§5). **Solo build time; nada de esto llega al navegador.**
- **Cero librerías de animación.** Todo en CSS, animando únicamente `transform` y `opacity`.

### Arquitectura

Feature-Based. `src/app/` es solo capa de rutas.

```
content/blog/{es,en}/        artículos en Markdown — fuera de src/ (ver §5)

src/
  app/[lang]/...              rutas delgadas
  app/api/paypal/...          rutas de servidor
  features/
    landing/                  hero, secciones del home
    tiquismos/                componente firma (ver §4)
    blog/                     lectura de .md, esquema, listado, artículo
    destinos/                 Manuel Antonio, La Fortuna
    reservas/                 calendario, husos horarios, formulario
    pagos/                    PayPal
    precios/
    comunidad/
  shared/
    components/layout/        Navbar, Footer, BarraSocial
    components/ui/
    i18n/                     config, esquema, diccionarios
    config/
    lib/
    types/
```

---

## 3. Rutas e internacionalización

```
/                      → redirige a /es o /en según Accept-Language
/[lang]                Home
/[lang]/online         Clases online
/[lang]/presencial     Clases en Costa Rica
/[lang]/destinos       Manuel Antonio · La Fortuna
/[lang]/precios
/[lang]/reservar       Selección de franja + depósito PayPal
/[lang]/comunidad
/[lang]/blog           Listado de artículos (§5)
/[lang]/blog/[slug]    Artículo
/[lang]/blog/tag/[tag] Filtrado por etiqueta
/[lang]/rss.xml        Feed por idioma
```

### i18n sin librería externa

Next 16 lo resuelve nativo con el segmento dinámico `[lang]`. Requisito del usuario: diccionarios en JSON para poder sumar idiomas después (el profesor vive en Suiza; alemán y francés son candidatos reales).

```
src/shared/i18n/
  config.ts          IDIOMAS = ['es','en'] as const   ← sumar 'de' es esta línea
  esquema.ts         Zod: forma del diccionario
  diccionario.ts     getDiccionario(lang), cacheado
  diccionarios/
    es.json
    en.json
```

**Decisión clave:** el esquema de Zod exige las **mismas claves en todos los idiomas**. Un `de.json` incompleto **rompe el build** en vez de renderizar `undefined` en producción.

**Coste en el cliente: cero.** Los diccionarios se leen en Server Components; no viajan en el bundle. Esto es parte de cómo se sostiene el Lighthouse > 95.

### Contenido traducible

Las listas de contenido viven en JSON por feature, con los campos traducibles como objeto por idioma:

```json
{ "nombre": { "es": "Volcán Arenal", "en": "Arenal Volcano" } }
```

Un helper `localizado(z.string())` en el esquema de Zod construye esa forma y exige que estén todos los idiomas de `IDIOMAS`.

---

## 4. Componente firma: "Tiquismo del día"

Tarjeta que enseña una expresión costarricense real: la expresión, su significado, un ejemplo de uso y (cuando el profesor los grabe) audio.

- Se reutiliza en el home, en `/online` y en el footer, rotando.
- Los datos viven en `features/tiquismos/data/tiquismos.json`.
- Da valor a quien todavía no compró y es lo que impide que el sitio se lea como plantilla.
- La rotación es determinista por día (no `Math.random()`), para que el HTML del servidor y el del cliente coincidan y no haya error de hidratación.
- **Cada tiquismo puede crecer hasta ser un artículo del blog** (ver §5). El componente enlaza al artículo cuando existe.

---

## 5. Blog en Markdown

### Por qué existe

Nadie busca "Costa Rica Spanish Experience" en Google. Sí buscan *"what does pura vida mean"*, *"tico slang"*, *"Costa Rican Spanish vs Spanish"*. El blog es el canal de adquisición del negocio, no un adorno: cada artículo es una puerta de entrada al embudo que termina en `/reservar`.

Por eso el blog no es una feature aislada — se conecta con los tiquismos (§4), que son su fuente natural de temas.

### Dónde viven los artículos

Markdown plano, fuera de `src/`, para que se editen sin abrir el editor de código:

```
content/blog/
  es/
    que-significa-pura-vida.md
    voseo-costarricense.md
  en/
    what-does-pura-vida-mean.md
```

El idioma lo determina **la carpeta**, no un campo. Menos formas de equivocarse.

### Frontmatter validado con Zod

Igual que toda frontera de datos del proyecto: se parsea, no se confía.

```yaml
---
titulo: "¿Qué significa realmente 'pura vida'?"
resumen: "No es solo un saludo..."          # 70–165 car., alimenta la meta description
fecha: 2026-09-19
actualizado: 2026-10-02                     # opcional
portada: /blog/pura-vida.jpg                # opcional
portadaAlt: "Atardecer en Manuel Antonio"   # obligatorio si hay portada
etiquetas: [tiquismos, cultura]
traduccion: what-does-pura-vida-mean        # opcional: slug del par en el otro idioma
borrador: false
---
```

El esquema valida de verdad: slugs únicos por idioma, `resumen` dentro del rango que exige la meta description, fechas parseables, `portadaAlt` no vacío cuando hay portada, y que `traduccion` **apunte a un archivo que exista**. Un enlace roto entre idiomas rompe el build, no el sitio en producción.

### Política de traducción

**Un artículo puede existir en un solo idioma.** Escribir todo dos veces no se sostiene y frenaría la publicación.

- `/es/blog` lista solo los artículos en español; `/en/blog` solo los de inglés.
- Cuando existe el par, los artículos se enlazan entre sí y emiten `hreflang` recíproco.
- Cuando no existe, **no se emite `hreflang`** para ese artículo. Declarar una traducción que no existe es peor que no declarar nada.
- `borrador: true` excluye el artículo del build, del sitemap y del RSS.

### Pipeline de Markdown

`unified` + `remark-parse` + `remark-gfm` + `remark-rehype` + `rehype-react`, con `gray-matter` para el frontmatter.

Son ~6 dependencias en un proyecto que hoy tiene 4, así que la justificación importa: **todas corren solo en el servidor, en build time, y ninguna llega al navegador.** La regla de "nada de librerías" del estándar apunta a peso en el cliente, y aquí el peso en cliente es cero.

Lo que compran:

- **`rehype-react` produce elementos de React, no una cadena de HTML.** Eso permite mapear `img` → `next/image` y `a` → `next/link`. Es la razón de fondo de la elección: una `<img>` cruda en un artículo con fotos destroza el LCP y el CLS, y ahí se va el Lighthouse.
- Anclas automáticas en los encabezados (`#como-se-usa`), que habilitan tabla de contenidos y enlaces profundos.
- Tablas, listas de tareas y tachado de GFM.

Sin `dangerouslySetInnerHTML` en ninguna parte.

### Rutas y derivados

```
/[lang]/blog              listado, paginado de 12
/[lang]/blog/[slug]       artículo
/[lang]/blog/tag/[tag]    filtrado por etiqueta
/[lang]/rss.xml           feed por idioma
```

Todo estático (`generateStaticParams`): el blog no toca el servidor en runtime.

Cada artículo emite JSON-LD de `BlogPosting`, canónica propia, Open Graph con la portada (o la imagen por defecto del sitio si no tiene), y tiempo de lectura calculado del contenido real — no inventado. El `sitemap.xml` incluye todos los artículos publicados de ambos idiomas.

### Imágenes de artículos

Van en `public/blog/`, preconvertidas a AVIF/WebP por un script, y servidas por `next/image` a través del mapeo de `rehype-react`. Las dimensiones se leen del archivo en build time, así que el hueco queda reservado y el CLS es 0 sin que el autor declare nada en el Markdown.

---

## 6. Paleta — 70/30/10 con contraste medido

La paleta del concept board **no pasa WCAG AA**. Medido con script propio:

| Combinación del board | Ratio | Veredicto |
|---|---|---|
| Blanco sobre `#FB6D3A` | 2.86:1 | falla incluso texto grande |
| Blanco sobre `#1E9DAA` | 3.25:1 | solo texto grande |
| Blanco sobre `#5CC3C6` | 2.08:1 | falla |
| Blanco sobre `#F4B641` | 1.81:1 | falla |

La identidad no cambia: se **derivan variantes oscuras** para texto e interacción y los tonos originales quedan para ilustración y decoración.

| Franja | Token | Hex | Uso | Contraste medido |
|---|---|---|---|---|
| **70 % dominante** | `--crema` | `#FFF4E6` | fondos de página | — |
| **30 % secundario** | `--teal` | `#0F6E78` | superficies oscuras, botón primario | 5.96:1 con blanco |
| **10 % acento** | `--naranja` | `#D1481A` | CTA, precios, estados activos | 4.51:1 con blanco |
| texto | `--tinta` | `#2A1A12` | cuerpo | 15.41:1 sobre crema |
| enlaces | `--enlace` | `#B33A0F` | links sobre crema | 5.48:1 sobre crema |
| decorativos | — | `#FB6D3A` `#5CC3C6` `#F4B641` `#FFBEA3` | ilustración, degradados, fondos de icono | **nunca detrás de texto** |

**Regla de acento:** el naranja nunca ocupa superficies grandes. Y en el hero solo hay **un** botón sólido (teal); el secundario es outline. Dos CTA sólidos compitiendo era un defecto del board.

Un script (`scripts/verificar-contraste.mjs`) recalcula estos pares y falla si alguno baja de 4.5:1.

---

## 7. Navbar

Además del comportamiento que ya es constante en todos los sitios del usuario, este lleva una animación extra pedida explícitamente: **arriba del todo el header es alto y de dos filas, y colapsa a una sola fila compacta apenas se sale del tope.**

Tres estados independientes:

| Estado | Disparador | Efecto |
|---|---|---|
| `enTope` | `scrollY < 24` | dos filas: lockup del logo arriba, enlaces abajo. Logo a escala grande. Fondo sólido. |
| *(compacto)* | `scrollY >= 24` | una fila. Logo `scale(1)`. `backdrop-blur` + fondo semitransparente. |
| `oculto` | scroll hacia abajo, umbral 6 px, solo pasados 150 px | `-translate-y-full` |

Invariantes heredados del estándar:

- `fixed top-0 z-50`
- Umbral de **6 px** para ignorar micro-scroll
- Solo se oculta pasados **~150 px**; arriba del todo siempre visible
- Listener `{ passive: true }` con cleanup en el return del efecto
- `transition-transform duration-300`
- **Nunca se oculta con el menú móvil abierto** (`oculto && !menuAbierto`)
- Respeta `prefers-reduced-motion`
- `useRef<number>(0)` para la última posición

### El punto delicado: altura sin layout thrash

Animar `height` provoca layout en cada frame, y la regla del usuario es animar solo `transform` y `opacity`.

Solución:

- El logo se encoge con `transform: scale()` y `transform-origin` a la izquierda — GPU, sin layout.
- La altura del header se maneja con una variable CSS `--nav-h` con transición, sobre un elemento `position: fixed`, que está **fuera del flujo** y por tanto no reflowea el documento.
- El `<body>` lleva `padding-top` fijo igual a la **altura compacta**, así el CLS es 0 independientemente del estado.

**Verificación obligatoria:** medir en el navegador sobre el build de producción (CLS y frames durante la transición) antes de darlo por bueno. No a ojo.

---

## 8. Reservas y el calendario que aún no existe

Requisito del usuario: estructura visual lista para conectar cuando exista el proveedor de calendario.

### Patrón: puerto y adaptadores

La interfaz se programa contra un contrato, nunca contra un proveedor.

```ts
// src/features/reservas/lib/calendario/tipos.ts
export interface ProveedorCalendario {
  disponibilidad(desde: Date, hasta: Date, zona: string): Promise<Franja[]>
  reservar(solicitud: SolicitudReserva): Promise<ReservaConfirmada>
  cancelar(id: string): Promise<void>
}
```

Dos implementaciones:

1. `calendarioLocal.ts` — lee `horario-profesor.json` (horario real del profesor cuando lo entregue) y genera las franjas. Determinista, sin red, funciona hoy, testeable con Vitest.
2. `calendarioRemoto.ts` — adaptador con el contrato ya firmado y los `TODO` señalados. Destino probable: Cal.com o Google Calendar.

Cambiar de uno a otro es **una línea** en `shared/config`. La interfaz no se entera.

### Husos horarios — no es opcional

El profesor está en Suiza y los estudiantes en cualquier parte.

- Horario base del profesor en `Europe/Zurich`.
- Zona del visitante detectada con `Intl.DateTimeFormat().resolvedOptions().timeZone`, con selector manual.
- Cada franja muestra **las dos horas**: `10:00 tu hora (Madrid) · 18:00 en Costa Rica`.
- Toda conversión pasa por una función única y testeada, incluyendo cambio de horario de verano. **Costa Rica no aplica DST y Suiza sí**, así que hay semanas del año en que la diferencia entre ambas cambia. Los tests cubren fechas a ambos lados del cambio.

---

## 9. Pagos — PayPal, depósito de reserva

Se cobra un **depósito para apartar la clase**, no el total. El resto se arregla directamente con el profesor.

- SDK de PayPal cargado **solo en `/reservar` y solo tras elegir franja** (lazy). No toca el LCP de ninguna página.
- Dos rutas de servidor: `POST /api/paypal/orden` y `POST /api/paypal/captura`. El *client secret* vive **solo en el servidor**, nunca en el bundle.
- El monto se verifica **en el servidor** contra la configuración antes de crear la orden. Nunca se confía en el monto que manda el cliente.
- Arranca contra **sandbox**. Pasar a producción es cambiar variables de entorno.
- El monto del depósito vive en config de **TypeScript** (no JSON) con un comentario que documenta de dónde salió el dato.

---

## 10. Imágenes, logo y marca

### Fotografía

- Fuente: **Unsplash** (licencia de uso comercial sin permiso previo; apta para un negocio real). Verificado que responde; Pexels bloquea descarga automatizada.
- Temas pedidos por el usuario: playa de Costa Rica (Manuel Antonio) y **Volcán Arenal / La Fortuna**.
- Autor y URL de cada foto quedan registrados en `src/shared/data/creditos-fotos.json`.
- Servidas con `next/image`, AVIF/WebP, `sizes` correcto y `placeholder="blur"`.

### Logo

El perezoso con gafas de sol se **recorta** de la imagen del concept board con Python/PIL (disponible: 3.11.9 + PIL 12.3), se limpia el fondo y genera:

- `favicon.ico` multitamaño
- PNG 512 (PWA/Android)
- `apple-icon.png` 180
- la pieza de marca que remata la barra social

### Barra social lateral

Constante del estándar, personalizada con esta marca:

1. El perezoso recortado remata el riel (pieza de marca, no un icono más).
2. Iconos en color de acento en reposo; al hover toman el color oficial de su red (WhatsApp `#25D366`, Instagram `#E1306C`, Facebook `#1877F2`).
3. Etiqueta emergente en el color de los CTA.
4. Entra deslizándose con ~1 s de retraso para no competir con el hero.
5. El riel crece de `scale(.92)` a `1` con `transform-origin: right`.

Incluye **botón de compartir**, separado por una línea, con tres respaldos: Web Share API → portapapeles → WhatsApp Web. **Oculta en móvil** (`md:`).

El color por red entra como **variable CSS en línea**, no como clase de Tailwind: un `hover:text-[${color}]` armado dentro de un `.map` no existe al compilar.

---

## 11. Metadatos, SEO y calidad

### Obligatorio desde el primer build

Helper único `metadatosDe({ titulo, descripcion, ruta, lang })` en `src/shared/lib/sitio.ts` por el que pasan **todas** las páginas.

> Trampa de Next.js que este helper evita: el `openGraph` de una página **reemplaza** al del layout en vez de fusionarse. Una página que define solo `title` dentro de `openGraph` se queda **sin `og:image`**.

Por ruta: `<title>` único (15–65), `meta description` única (70–165), canónica, Open Graph completo con `og:image` 1200×630, `twitter:card` `summary_large_image`, `lang` en `<html>`, exactamente un `<h1>`, `alt` en toda imagen.

Por sitio: `favicon.ico`, PNG 512, `apple-icon` 180, manifest, `sitemap.xml` (con las dos variantes de idioma **y todos los artículos publicados**), `robots.txt`, JSON-LD de `Organization` y `Course`, y `hreflang` entre `/es` y `/en`.

Por artículo del blog: JSON-LD de `BlogPosting`, canónica propia, Open Graph con la portada, y entrada en el `rss.xml` de su idioma. El `hreflang` recíproco **solo** cuando la traducción existe de verdad (§5).

`scripts/verificar-metadatos.mjs` corre en `postbuild` **sobre el HTML generado** y **falla el build** si algo falta. Plantilla: `D:\klegium-web\scripts\verificar-metadatos.mjs`.

### Lighthouse > 95 en las cuatro categorías

Se construye desde el inicio, no se parchea. Auditado sobre el **build de producción**, nunca sobre el dev server.

---

## 12. Datos que faltan — no se inventan

Es un negocio real. Todo lo siguiente queda en `null` y **visible como pendiente en la página**, igual que en `ticoshot`. Lista completa en `D:\pow\PENDIENTE.md`.

- Precios de las clases y monto exacto del depósito
- Nombre, foto, bio y horario real del profesor
- Reseñas de estudiantes (se transcriben de fuentes reales, no se inventan)
- Credenciales de PayPal de producción
- Proveedor de calendario definitivo
- Dominio, correo y teléfono de contacto
- Redes sociales reales del negocio
- Datos de las sedes presenciales en Costa Rica
- Artículos del blog: se entrega la maquinaria y **dos artículos de ejemplo escritos sobre hechos verificables del español costarricense** (qué significa "pura vida", el voseo). Todo lo que sea experiencia personal del profesor o de sus estudiantes lo escribe él.

---

## 13. Riesgos conocidos

| Riesgo | Mitigación |
|---|---|
| El nombre "Costa Rica Spanish Experience" es largo para dominio y marca | Señalado al usuario; no bloquea el desarrollo |
| DST: Suiza cambia hora, Costa Rica no | Conversión centralizada + tests con fechas de ambos lados del cambio |
| El hero ilustrado del board es pesado y es el LCP | Se usa fotografía real optimizada; se mide el LCP antes de entregar |
| Sin proveedor de calendario, la disponibilidad es simulada | El puerto aísla el cambio a un archivo; la UI ya es la definitiva |
| Un blog sin artículos nuevos envejece peor que no tener blog | El listado no muestra "última actualización"; los tiquismos dan una cantera de temas cortos y publicables |
| El navbar pasa de 6 a 7 enlaces con el blog | La fila alta del tope tiene espacio de sobra; en compacto y en móvil se revisa el corte a 1280 px y 375 px |
