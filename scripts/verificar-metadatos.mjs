#!/usr/bin/env node
/**
 * Verifica que cada página servida tenga sus metadatos completos.
 *
 * Corre sobre el HTML YA GENERADO, no sobre el código fuente: comprueba lo
 * que de verdad se sirve. Está enganchado en `postbuild`, así que un metadato
 * que falte rompe el build en vez de descubrirse cuando un enlace se ve roto
 * en WhatsApp.
 *
 * La trampa concreta que esto caza: en Next.js el `openGraph` de una página
 * REEMPLAZA al del layout en vez de fusionarse. Una página que declare solo
 * `openGraph: { title }` se queda sin `og:image` y nadie lo nota hasta que
 * alguien comparte el enlace.
 *
 * Uso:  npm run build   (se ejecuta solo)
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const SALIDA = join(RAIZ, ".next", "server", "app");

/** Longitudes a las que recortan los buscadores. */
const LIMITES = {
  titulo: { min: 15, max: 65 },
  descripcion: { min: 70, max: 165 },
};

const ICONOS = [
  "src/app/favicon.ico",
  "src/app/icon.png",
  "src/app/apple-icon.png",
  "public/og/por-defecto.jpg",
];

/** Rutas internas de Next que no son páginas del sitio. */
const INTERNAS = ["_not-found", "_global-error", "_error"];

const fallos = [];

function exigir(condicion, mensaje) {
  if (!condicion) fallos.push(mensaje);
}

function buscarHtml(dir, encontrados = []) {
  if (!existsSync(dir)) return encontrados;
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) buscarHtml(ruta, encontrados);
    else if (entrada.name.endsWith(".html")) encontrados.push(ruta);
  }
  return encontrados;
}

function contenidoMeta(html, propiedad) {
  // El orden de los atributos no está garantizado, así que se buscan ambas
  // formas en vez de asumir una.
  const patrones = [
    new RegExp(
      `<meta[^>]+(?:property|name)="${propiedad}"[^>]*content="([^"]*)"`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content="([^"]*)"[^>]*(?:property|name)="${propiedad}"`,
      "i"
    ),
  ];
  for (const patron of patrones) {
    const encontrado = html.match(patron);
    if (encontrado) return encontrado[1];
  }
  return null;
}

// ----------------------------------------------------------------- iconos
for (const icono of ICONOS) {
  const ruta = join(RAIZ, icono);
  if (!existsSync(ruta)) {
    fallos.push(`Falta el archivo: ${icono}`);
    continue;
  }
  exigir(
    statSync(ruta).size > 500,
    `El archivo está vacío o es inválido: ${icono}`
  );
}

// ---------------------------------------------------------------- páginas
const paginas = buscarHtml(SALIDA).filter(
  (p) => !INTERNAS.some((i) => p.includes(i))
);

if (paginas.length === 0) {
  console.error(
    "\n  No se encontró ningún HTML generado. ¿Se corrió `next build` antes?\n"
  );
  process.exit(1);
}

const titulosVistos = new Map();
const descripcionesVistas = new Map();

for (const ruta of paginas) {
  const html = readFileSync(ruta, "utf8");
  const nombre = ruta.slice(SALIDA.length + 1).replace(/\\/g, "/");

  // --- title
  const titulo = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  if (!titulo) {
    fallos.push(`${nombre}: sin <title>`);
  } else {
    exigir(
      titulo.length >= LIMITES.titulo.min && titulo.length <= LIMITES.titulo.max,
      `${nombre}: el título mide ${titulo.length} caracteres, fuera de ${LIMITES.titulo.min}-${LIMITES.titulo.max} — "${titulo}"`
    );
    const previa = titulosVistos.get(titulo);
    exigir(
      !previa,
      `${nombre}: título duplicado, ya lo usa ${previa} — "${titulo}"`
    );
    titulosVistos.set(titulo, nombre);
  }

  // --- description
  const descripcion = contenidoMeta(html, "description");
  if (!descripcion) {
    fallos.push(`${nombre}: sin meta description`);
  } else {
    exigir(
      descripcion.length >= LIMITES.descripcion.min &&
        descripcion.length <= LIMITES.descripcion.max,
      `${nombre}: la descripción mide ${descripcion.length} caracteres, fuera de ${LIMITES.descripcion.min}-${LIMITES.descripcion.max}`
    );
    const previa = descripcionesVistas.get(descripcion);
    exigir(!previa, `${nombre}: descripción duplicada, ya la usa ${previa}`);
    descripcionesVistas.set(descripcion, nombre);
  }

  // --- canónica
  exigir(
    /<link[^>]+rel="canonical"[^>]+href="https?:\/\//i.test(html),
    `${nombre}: sin <link rel="canonical"> absoluto`
  );

  // --- Open Graph completo. og:image es el que más se olvida y el que hace
  //     que el enlace se vea roto al compartirlo.
  for (const propiedad of [
    "og:title",
    "og:description",
    "og:image",
    "og:url",
    "og:site_name",
    "og:locale",
  ]) {
    exigir(Boolean(contenidoMeta(html, propiedad)), `${nombre}: falta ${propiedad}`);
  }

  const imagenOg = contenidoMeta(html, "og:image");
  exigir(
    !imagenOg || imagenOg.startsWith("http"),
    `${nombre}: og:image debe ser una URL absoluta, es "${imagenOg}"`
  );

  // --- Twitter
  exigir(
    contenidoMeta(html, "twitter:card") === "summary_large_image",
    `${nombre}: twitter:card debe ser summary_large_image`
  );

  // --- lang
  exigir(/<html[^>]+lang="[a-z]{2}"/i.test(html), `${nombre}: <html> sin lang`);

  // --- un único h1
  const h1 = html.match(/<h1[\s>]/gi)?.length ?? 0;
  exigir(h1 === 1, `${nombre}: tiene ${h1} <h1>, debe haber exactamente 1`);

  // --- alt en toda imagen
  const imagenesSinAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) ?? []).length;
  exigir(
    imagenesSinAlt === 0,
    `${nombre}: ${imagenesSinAlt} <img> sin atributo alt`
  );
}

// ------------------------------------------------------------------ salida
console.log(`\n  Metadatos — ${paginas.length} páginas revisadas`);

if (fallos.length > 0) {
  console.error(`\n  ${fallos.length} problema(s):\n`);
  for (const fallo of fallos) console.error(`  · ${fallo}`);
  console.error("");
  process.exit(1);
}

console.log("  Todo correcto.\n");
