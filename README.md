# Costa Rica Spanish Experience

Sitio web de una escuela que enseña **español costarricense**: no «clases de
español», sino aprender a hablar como tico — `pura vida`, `mae`, `tuanis`,
`¿diay?`, el voseo. Bilingüe español / inglés.

Es un negocio real y todavía no está publicado. Hay datos del cliente sin
confirmar, y **se ven en la página** con una etiqueta de «Pendiente» en vez de
rellenarse con suposiciones. La lista está en [`PENDIENTE.md`](PENDIENTE.md).

---

## Arrancar

Node 20 o superior.

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>, que redirige a `/es` o `/en` según el
`Accept-Language` del navegador.

**No hace falta ninguna variable de entorno**, ni para desarrollar ni para
desplegar. La reserva, el cobro y los enlaces de videollamada los lleva
Calendly desde su panel; el detalle está en
[`docs/variables-de-entorno.md`](docs/variables-de-entorno.md).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción **y** verificación de metadatos |
| `npm start` | Sirve el build |
| `npm test` | Vitest, 43 pruebas |
| `npm run typecheck` | TypeScript en modo estricto |
| `npm run lint` | ESLint |
| `npm run verify` | Contraste WCAG de los 27 pares de color en uso |

Tres scripts de un solo uso:

```bash
node scripts/descargar-fotos.mjs    # fotos de Unsplash + sus créditos
python scripts/recortar-logo.py     # perezoso, favicon e iconos
python scripts/generar-og.py        # imagen Open Graph 1200×630
```

## Qué hay dentro

Next.js 16 con React 19, TypeScript estricto, Tailwind v4 y Zod 4.
**Sin librerías de animación**: todo es CSS, y solo se animan `transform` y
`opacity`.

```
content/blog/{es,en}/*.md     artículos, fuera de src/
docs/                         variables de entorno, licencias de imagen
scripts/                      utilidades y los dos verificadores del build
src/
  proxy.ts                    / → /es | /en por Accept-Language
  app/[lang]/…                rutas (capa delgada)
  features/…                  landing, online, tiquismos, faq, blog,
                              destinos, solicitud, reservas
  shared/…                    componentes, i18n, config, utilidades, datos
```

La arquitectura es por features: `src/app/` solo enruta, y una feature nunca
importa de otra —lo compartido vive en `shared/`—.

## Tres cosas que conviene saber antes de tocar nada

**El build falla si los datos están mal.** Los tiquismos, las preguntas
frecuentes, los lugares, los créditos de las fotos y los dos diccionarios de
interfaz se validan con Zod **al importarlos**. Una clave que falte en inglés o
una foto sin texto alternativo rompen la compilación en vez de aparecer vacías
en el teléfono de alguien.

**El color se verifica, no se elige a ojo.** La paleta sigue un reparto 70/30/10
y `npm run verify` recalcula los 27 pares en uso y falla si alguno baja de
4,5:1. Ya cazó dos fallos que no se veían mirando la pantalla.

**Los metadatos también.** `scripts/verificar-metadatos.mjs` corre en
`postbuild` sobre el HTML generado de las 40 páginas y rompe el build si a
alguna le falta el título, la descripción, la canónica, el `og:image` o los
`hreflang`.

El resto de decisiones de fondo —y sobre todo las que conviene no deshacer—
están en [`CLAUDE.md`](CLAUDE.md), con el porqué de cada una.

## Licencias

El código es privado y del cliente.

Las fotografías vienen de Unsplash bajo su licencia de uso comercial, y la
autoría de cada una está registrada en `src/shared/data/creditos-fotos.json` y
publicada en `/creditos`. Los iconos tropicales son dibujos propios. El detalle,
incluido qué mirar antes de añadir una imagen nueva, en
[`docs/imagenes.md`](docs/imagenes.md).
