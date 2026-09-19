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
| Presencial | Manuel Antonio y La Fortuna | por confirmar |

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
  features/{landing,tiquismos,blog,destinos,reservas,pagos}/
  shared/{components,i18n,config,lib,data}/
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

### Navbar — tres estados

Alto de dos filas en el tope, compacto de una fila al salir, oculto al bajar.
Umbral de 6 px, se oculta solo pasados 150 px, nunca con el menú móvil
abierto, listener `{ passive: true }`.

**No usar variables CSS dentro de un `transform` con transición.** Una
propiedad personalizada sin registrar con `@property` no vuelve a disparar el
`transform` cuando solo cambia la variable: se queda congelado en el último
valor resuelto. Los dos estados van con valores literales.

El header mide siempre la altura alta y lo que cambia de tamaño es un panel de
fondo que se escala. El `padding-top` del `<body>` es fijo e igual a la altura
compacta, así el CLS es 0 en los tres estados.

### i18n

Diccionarios JSON con esquema Zod **estricto**: exige las mismas claves en
todos los idiomas y rechaza cadenas vacías. Agregar alemán es un `de.json` y
una línea en `shared/i18n/config.ts`. Se leen en Server Components: coste cero
en el navegador.

### Contenido en JSON

Tiquismos, destinos y créditos de fotos viven en `.json` validado al importar.
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
