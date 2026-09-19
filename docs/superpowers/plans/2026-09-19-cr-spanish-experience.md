# Costa Rica Spanish Experience — Plan de implementación

> **Para quien ejecute:** los pasos usan casillas `- [ ]`. Spec de referencia: `docs/superpowers/specs/2026-09-19-cr-spanish-experience-design.md`.

**Objetivo:** sitio web bilingüe (es/en) en Next.js que vende clases de español costarricense —online desde Suiza y presenciales en Costa Rica— con blog en Markdown, reserva contra un puerto de calendario aún sin proveedor, y depósito por PayPal en sandbox.

**Arquitectura:** Feature-Based sobre App Router. `src/app/[lang]/` es capa de rutas delgada; toda la lógica vive en `src/features/<feature>/`. Los datos de contenido viven en JSON y Markdown validados por Zod en la frontera de importación, de modo que un dato malo rompe el build y no la página del cliente. Todo lo que no requiere interacción es Server Component: el JS que llega al navegador es el mínimo (navbar, reserva, PayPal).

**Stack:** Next.js 16.3.4 · React 19.2.8 · TypeScript estricto · Tailwind v4 · Zod 4 · Vitest · unified/remark/rehype (solo build) · schema-dts.

---

## Restricciones globales

Aplican a **todas** las tareas. No se repiten en cada una.

- **TypeScript estricto.** Nada de `.jsx`, nada de `any` sin justificación escrita.
- **Feature-Based.** Nada de lógica en `src/app/`.
- **Listas de contenido en JSON**, validadas con Zod al importar. Solo queda en TS el esquema, las funciones, y la config cuyos campos necesitan comentarios que expliquen de dónde salió el dato.
- **Paleta 70/30/10:** `#FFF4E6` dominante · `#0F6E78` secundario · `#D1481A` acento. El acento nunca ocupa superficies grandes.
- **Contraste WCAG AA medido**, mínimo 4.5:1 en texto normal. Verificado por script, no a ojo.
- **Animar solo `transform` y `opacity`.** Nada que dispare layout por frame.
- **Cero librerías de animación.** CSS propio.
- **Lighthouse > 95** en las cuatro categorías, auditado sobre el build de producción.
- **Respetar `prefers-reduced-motion`** en toda animación.
- **Metadatos completos por ruta** vía el helper único `metadatosDe()`. Nunca escribir `openGraph` suelto en una página.
- **No inventar datos del negocio.** Lo que no se sabe queda `null` y visible como pendiente.
- **Todo texto de interfaz pasa por el diccionario i18n.** Ninguna cadena visible escrita a mano en un componente.

---

## Estructura de archivos

```
content/blog/{es,en}/*.md          artículos

scripts/
  recortar-logo.py                 recorta el perezoso del concept board
  descargar-fotos.mjs              Unsplash → public/, con créditos
  verificar-contraste.mjs          falla si un par baja de 4.5:1
  verificar-metadatos.mjs          postbuild, sobre el HTML generado

src/
  middleware.ts                    / → /es | /en según Accept-Language
  app/
    [lang]/layout.tsx              html lang, fuentes, Navbar, Footer, BarraSocial
    [lang]/page.tsx                home
    [lang]/{online,presencial,destinos,precios,comunidad}/page.tsx
    [lang]/reservar/page.tsx
    [lang]/blog/page.tsx
    [lang]/blog/[slug]/page.tsx
    [lang]/blog/tag/[tag]/page.tsx
    [lang]/rss.xml/route.ts
    api/paypal/orden/route.ts
    api/paypal/captura/route.ts
    sitemap.ts · robots.ts · manifest.ts
  features/
    landing/     components/ data/
    tiquismos/   components/ data/tiquismos.json esquema.ts
    blog/        lib/{leer.ts,esquema.ts,markdown.tsx} components/
    destinos/    components/ data/destinos.json esquema.ts
    reservas/    lib/calendario/{tipos.ts,local.ts,remoto.ts} lib/horas.ts components/
    pagos/       lib/paypal.ts components/
    precios/     data/precios.json esquema.ts
    comunidad/
  shared/
    components/layout/{Navbar.tsx,Footer.tsx,BarraSocial.tsx}
    components/ui/
    i18n/{config.ts,esquema.ts,diccionario.ts,diccionarios/{es,en}.json}
    lib/{sitio.ts,localizado.ts}
    data/creditos-fotos.json
    config/sitio.ts
```

---

## Tarea 1 — Scaffold y herramientas

**Archivos:** `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `src/app/globals.css`

**Produce:** proyecto que compila vacío. Scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`.

- [ ] Crear `package.json` con las versiones exactas de `gordillos-pizza` más las deps del blog
- [ ] `npm install`
- [ ] `tsconfig.json` estricto con alias `@/*` → `src/*`
- [ ] `next.config.ts` con `images.formats = ['image/avif','image/webp']`
- [ ] Verificar: `npm run build` termina sin error
- [ ] Commit

## Tarea 2 — Paleta, tokens y verificación de contraste

**Archivos:** `src/app/globals.css`, `scripts/verificar-contraste.mjs`

**Produce:** variables CSS `--crema --teal --naranja --tinta --enlace` y los decorativos. Script que falla si un par cae bajo 4.5:1.

- [ ] Escribir `verificar-contraste.mjs` con los pares de la §6 del spec
- [ ] Correrlo: debe reportar los 5 pares en AA
- [ ] Definir los tokens en `@theme` de Tailwind v4 dentro de `globals.css`
- [ ] Enganchar el script en `npm run verify`
- [ ] Commit

## Tarea 3 — i18n

**Archivos:** `src/shared/i18n/{config.ts,esquema.ts,diccionario.ts,diccionarios/es.json,diccionarios/en.json}`, `src/shared/lib/localizado.ts`, `src/middleware.ts`, `src/app/[lang]/layout.tsx`

**Produce:**
- `IDIOMAS: readonly ['es','en']`, `type Idioma = (typeof IDIOMAS)[number]`
- `getDiccionario(lang: Idioma): Promise<Diccionario>`
- `localizado<T extends ZodType>(inner: T)` → objeto con una clave por idioma, todas obligatorias

- [ ] Test: un diccionario al que le falta una clave hace fallar el parseo
- [ ] Correr el test, verificar que falla
- [ ] Implementar `esquema.ts` y `diccionario.ts`
- [ ] Correr el test, verificar que pasa
- [ ] `middleware.ts`: `/` → `/es` o `/en` por `Accept-Language`
- [ ] `layout.tsx` con `generateStaticParams` sobre `IDIOMAS` y `<html lang>`
- [ ] Verificar en navegador: `/` redirige, `/es` y `/en` responden 200
- [ ] Commit

## Tarea 4 — Metadatos y SEO base

**Archivos:** `src/shared/config/sitio.ts`, `src/shared/lib/sitio.ts`, `src/app/{sitemap.ts,robots.ts,manifest.ts}`

**Produce:** `metadatosDe({ titulo, descripcion, ruta, lang, imagen? }): Metadata` — siempre con `openGraph` completo, canónica y `hreflang`.

- [ ] Test: `metadatosDe()` sin `imagen` igual devuelve `og:image`
- [ ] Implementar el helper
- [ ] `sitemap.ts` con las dos variantes de idioma
- [ ] Commit

## Tarea 5 — Logo e iconos

**Archivos:** `scripts/recortar-logo.py`, `src/app/{icon.png,apple-icon.png,favicon.ico}`, `public/marca/perezoso.png`

- [ ] Localizar el perezoso en la imagen del concept board y recortarlo
- [ ] Limpiar el fondo, exportar PNG con transparencia
- [ ] Generar favicon multitamaño, PNG 512 y apple-icon 180
- [ ] Verificar visualmente cada salida
- [ ] Commit

## Tarea 6 — Fotografía

**Archivos:** `scripts/descargar-fotos.mjs`, `public/fotos/*`, `src/shared/data/creditos-fotos.json`

- [ ] Elegir en Unsplash: playa de Manuel Antonio y Volcán Arenal desde La Fortuna
- [ ] Descargar en resolución alta, convertir a AVIF y WebP
- [ ] Registrar autor, URL y licencia de cada foto en `creditos-fotos.json` con su esquema Zod
- [ ] Verificar pesos: ninguna sobre 250 KB en AVIF a 1600 px
- [ ] Commit

## Tarea 7 — Navbar

**Archivos:** `src/shared/components/layout/Navbar.tsx`, `src/shared/lib/useScrollNavbar.ts`

**Produce:** `useScrollNavbar(): { enTope: boolean; oculto: boolean }`

Tres estados según §7 del spec: `enTope` bajo 24 px, compacto por encima, `oculto` al bajar tras 150 px con umbral de 6 px.

- [ ] Tests del hook: micro-scroll de 4 px no cambia nada; bajar 200 px oculta; subir muestra; bajo 150 px nunca oculta
- [ ] Correr, verificar que fallan
- [ ] Implementar el hook con listener `{ passive: true }` y cleanup
- [ ] Correr, verificar que pasan
- [ ] Componente: dos filas en tope, una en compacto, logo por `transform: scale()`, altura por `--nav-h` sobre elemento `fixed`
- [ ] `<body>` con `padding-top` fijo de la altura compacta
- [ ] Menú móvil: nunca ocultar el navbar con el menú abierto
- [ ] **Medir en navegador sobre build de producción: CLS = 0 y transición sin layout por frame**
- [ ] Commit

## Tarea 8 — Footer y barra social

**Archivos:** `src/shared/components/layout/{Footer.tsx,BarraSocial.tsx}`

Las cinco personalizaciones del estándar: perezoso rematando el riel, color de acento en reposo y color oficial de cada red al hover (vía **variable CSS en línea**, no clase de Tailwind), etiqueta en color de CTA, entrada con ~1 s de retraso, `scale(.92)→1` con `transform-origin: right`. Botón de compartir con Web Share API → portapapeles → WhatsApp Web. Oculta en móvil.

- [ ] Implementar ambos
- [ ] Verificar en navegador a 1280 px y 375 px
- [ ] Commit

## Tarea 9 — Tiquismos

**Archivos:** `src/features/tiquismos/{esquema.ts,data/tiquismos.json,components/TiquismoDelDia.tsx,lib/rotacion.ts}`

**Produce:** `tiquismoDelDia(fecha: Date, total: number): number` — determinista, sin `Math.random()`.

- [ ] Test: la misma fecha devuelve el mismo índice; fechas distintas rotan
- [ ] Implementar la rotación y el componente
- [ ] Cargar tiquismos reales y verificables del español costarricense
- [ ] Verificar: sin error de hidratación en consola
- [ ] Commit

## Tarea 10 — Home

**Archivos:** `src/features/landing/components/*`, `src/app/[lang]/page.tsx`

Hero con foto real (un solo CTA sólido, el secundario outline) · Elegí tu experiencia · Destinos · Franja de confianza · Tiquismo del día · cierre hacia `/reservar`.

- [ ] Implementar secciones
- [ ] Verificar: un solo `<h1>`, `alt` en toda imagen, LCP medido
- [ ] Commit

## Tarea 11 — Destinos, Online, Presencial, Precios, Comunidad

**Archivos:** `src/features/{destinos,precios,comunidad}/*`, `src/app/[lang]/{destinos,online,presencial,precios,comunidad}/page.tsx`

Precios sin confirmar quedan `null` y **visibles como pendientes**. `/comunidad` solo con lo que existe de verdad.

- [ ] Implementar las cinco rutas con sus datos en JSON validado
- [ ] Commit

## Tarea 12 — Blog

**Archivos:** `src/features/blog/{esquema.ts,lib/leer.ts,lib/markdown.tsx,components/*}`, rutas de blog, `content/blog/{es,en}/*.md`

**Produce:**
- `leerArticulos(lang: Idioma): Promise<Articulo[]>` — ordenados por fecha desc, sin borradores
- `leerArticulo(lang: Idioma, slug: string): Promise<Articulo | null>`
- `renderizarMarkdown(md: string): Promise<ReactElement>` — con `img` → `next/image`

- [ ] Test: frontmatter con `resumen` de 20 caracteres falla el parseo
- [ ] Test: `traduccion` que apunta a un slug inexistente falla el parseo
- [ ] Test: `borrador: true` no aparece en el listado
- [ ] Correr, verificar que fallan
- [ ] Implementar esquema y lectura
- [ ] Correr, verificar que pasan
- [ ] Pipeline unified con mapeo de `img` a `next/image` leyendo dimensiones en build
- [ ] Listado paginado de 12, artículo, filtrado por etiqueta, `rss.xml` por idioma
- [ ] `hreflang` recíproco **solo** cuando la traducción existe
- [ ] Escribir dos artículos de ejemplo sobre hechos verificables
- [ ] Verificar: CLS = 0 en artículo con portada
- [ ] Commit

## Tarea 13 — Horas y calendario

**Archivos:** `src/features/reservas/lib/horas.ts`, `src/features/reservas/lib/calendario/{tipos.ts,local.ts,remoto.ts}`, `src/features/reservas/data/horario-profesor.json`

**Produce:**
- `interface ProveedorCalendario { disponibilidad(desde,hasta,zona): Promise<Franja[]>; reservar(s): Promise<ReservaConfirmada>; cancelar(id): Promise<void> }`
- `convertir(fecha: Date, desde: string, hacia: string): { hora: string; dia: string }`
- `type Franja = { inicio: Date; fin: Date; disponible: boolean }`

- [ ] **Test crítico de DST:** una clase a las 10:00 `Europe/Zurich` cae a distinta hora de Costa Rica en enero y en julio, porque Suiza aplica horario de verano y Costa Rica no. Cubrir ambos lados del cambio
- [ ] Test: una franja fuera del horario del profesor no se ofrece
- [ ] Correr, verificar que fallan
- [ ] Implementar `horas.ts` con `Intl`, sin librería de fechas
- [ ] Implementar `local.ts` leyendo `horario-profesor.json`
- [ ] Escribir `remoto.ts`: contrato firmado, cuerpo con `TODO` señalados
- [ ] Correr, verificar que pasan
- [ ] Commit

## Tarea 14 — Interfaz de reserva

**Archivos:** `src/features/reservas/components/*`, `src/app/[lang]/reservar/page.tsx`

- [ ] Selector de zona horaria con detección automática
- [ ] Calendario de franjas mostrando **las dos horas**: la del visitante y la de Costa Rica
- [ ] Estados vacío, cargando y error
- [ ] Verificar por teclado y con lector de foco
- [ ] Commit

## Tarea 15 — PayPal

**Archivos:** `src/features/pagos/{lib/paypal.ts,components/BotonPayPal.tsx}`, `src/app/api/paypal/{orden,captura}/route.ts`, `.env.example`

- [ ] Test: la ruta de orden rechaza un monto que no coincide con la configuración
- [ ] Correr, verificar que falla
- [ ] Implementar ambas rutas contra la API REST de PayPal, secreto solo en servidor
- [ ] Correr, verificar que pasa
- [ ] SDK cargado en diferido, solo tras elegir franja
- [ ] Verificar: el bundle de `/reservar` no incluye el SDK hasta la interacción
- [ ] Commit

## Tarea 16 — Verificación de metadatos en postbuild

**Archivos:** `scripts/verificar-metadatos.mjs`, `package.json`

- [ ] Adaptar la plantilla de `D:\klegium-web\scripts\verificar-metadatos.mjs`
- [ ] Que corra sobre el HTML generado y **falle el build** si algo falta
- [ ] Enganchar en `postbuild`
- [ ] Correr y arreglar lo que reporte
- [ ] Commit

## Tarea 17 — Auditoría final

- [ ] `npm run build` limpio, `typecheck` y `lint` sin error
- [ ] Lighthouse sobre el build de producción: **> 95 en las cuatro categorías**, en móvil y escritorio
- [ ] Recorrido completo en navegador a 375 px, 768 px y 1280 px
- [ ] Reportar los números reales, no "debería funcionar"

## Tarea 18 — Documentación del proyecto

**Archivos:** `D:\pow\CLAUDE.md`, `D:\pow\PENDIENTE.md`, fila nueva en `D:\CLAUDE.md`

- [ ] `CLAUDE.md` con stack, arquitectura, reparto 70/30/10 y decisiones
- [ ] `PENDIENTE.md` con la lista exacta de datos que faltan del cliente
- [ ] Agregar la fila a la tabla del workspace
- [ ] Commit
