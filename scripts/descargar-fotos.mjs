#!/usr/bin/env node
/**
 * Descarga las fotografías del sitio desde Unsplash y deja constancia de su
 * autoría.
 *
 * Se usan fotos de Unsplash porque su licencia permite uso comercial sin
 * pedir permiso, y esto es un negocio real, no una maqueta. La atribución no
 * es obligatoria según la licencia, pero se registra igual: saber de dónde
 * salió cada imagen es lo que permite reemplazarla o defenderla después.
 *
 * Cada foto se verificó A OJO antes de elegirla: una búsqueda por "Arenal"
 * devuelve montañas que no son el Arenal, y publicar un volcán equivocado en
 * el sitio de una escuela costarricense es el tipo de error que se nota.
 *
 * Uso:  node scripts/descargar-fotos.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DESTINO = join(RAIZ, "public", "fotos");

/** Ancho de descarga. 2400 cubre pantallas retina sin pasarse de peso. */
const ANCHO = 2400;
const CALIDAD = 75;

const FOTOS = [
  {
    archivo: "manuel-antonio.jpg",
    idImagen: "1611602316663-92dc58e199ed",
    pagina: "https://unsplash.com/photos/rodDBPqBfKA",
    autor: "Luiz Cent",
    perfil: "https://unsplash.com/@luizcent",
    descripcion:
      "Vista aérea de Punta Catedral en Manuel Antonio: la franja de arena entre dos bahías, con la selva encima.",
  },
  {
    archivo: "manuel-antonio-selva.jpg",
    idImagen: "1629126756026-1ea6391c2c28",
    pagina: "https://unsplash.com/photos/g0zUgpRaAcs",
    autor: "Vincent Branciforti",
    perfil: "https://unsplash.com/@vfbranciforti",
    descripcion:
      "La selva de Manuel Antonio bajando hasta el Pacífico, con un islote en el horizonte.",
  },
  {
    archivo: "arenal.jpg",
    idImagen: "1705351978871-2b3316c25e6d",
    pagina: "https://unsplash.com/photos/1GEY6GsWEk0",
    autor: "Daniel Ingersoll",
    perfil: "https://unsplash.com/@daninger4995",
    descripcion:
      "El cono del Volcán Arenal visto desde La Fortuna, con la base cubierta de selva.",
  },
];

await mkdir(DESTINO, { recursive: true });

const creditos = [];

for (const foto of FOTOS) {
  const url = `https://images.unsplash.com/photo-${foto.idImagen}?w=${ANCHO}&q=${CALIDAD}&fm=jpg&fit=max`;
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`No se pudo descargar ${foto.archivo}: ${respuesta.status}`);
  }

  const datos = Buffer.from(await respuesta.arrayBuffer());
  await writeFile(join(DESTINO, foto.archivo), datos);

  const kb = Math.round(datos.byteLength / 1024);
  console.log(`  ${foto.archivo.padEnd(28)} ${String(kb).padStart(5)} KB   ${foto.autor}`);

  creditos.push({
    archivo: `/fotos/${foto.archivo}`,
    autor: foto.autor,
    perfil: foto.perfil,
    pagina: foto.pagina,
    fuente: "Unsplash",
    licencia: "Unsplash License",
    descripcion: foto.descripcion,
  });
}

const rutaCreditos = join(RAIZ, "src", "shared", "data", "creditos-fotos.json");
await mkdir(join(RAIZ, "src", "shared", "data"), { recursive: true });
await writeFile(rutaCreditos, `${JSON.stringify(creditos, null, 2)}\n`, "utf8");

console.log(`\n  ${creditos.length} fotos y sus créditos en creditos-fotos.json\n`);
