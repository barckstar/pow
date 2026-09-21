#!/usr/bin/env node
/**
 * Descarga las fotografías del sitio desde Unsplash y deja constancia de su
 * autoría.
 *
 * Se usan fotos de Unsplash porque su licencia permite uso comercial sin
 * pedir permiso, y esto es un negocio real, no una maqueta. La atribución no
 * es obligatoria según la licencia, pero se registra igual: saber de dónde
 * salió cada imagen es lo que permite reemplazarla o defenderla después.
 * Las condiciones y el porqué de cada decisión están en `docs/imagenes.md`.
 *
 * ============ CUIDADO CON UNSPLASH+ ============
 * La búsqueda de Unsplash mezcla en los mismos resultados las fotos gratuitas
 * y las de UNSPLASH+, que son de pago y NO llevan la Unsplash License. Se ven
 * iguales en la rejilla. La forma de distinguirlas es el autor: las de pago
 * salen a nombre de «Unsplash+ Community», con el usuario `plus`.
 *
 * Pasó eligiendo la lapa: el primer resultado de «scarlet macaw costa rica»
 * era una de Unsplash+ y se descartó por eso, no por la foto.
 * ===============================================
 *
 * ============ CADA FOTO SE VERIFICA DOS VECES ============
 *   1. QUE SEA EL SITIO. Una búsqueda por «Arenal» devuelve montañas que no
 *      son el Arenal, y publicar un volcán equivocado en el sitio de una
 *      escuela costarricense es el tipo de error que se nota. Cuando el autor
 *      lo dice en la descripción de la foto, esa es la prueba; si no lo dice,
 *      la foto no entra.
 *   2. QUE SE VEA BIEN RECORTADA. Todas van con `object-fit: cover`, así que
 *      una composición centrada se parte por la mitad en móvil.
 * =========================================================
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

/*
 * ============ MONTEVERDE, RIO CELESTE Y PUERTO VIEJO SE QUITARON ============
 * Estaban aqui de cuando `/destinos` eran cinco fichas turisticas. El cliente
 * aclaro cuales son los destinos de inmersion —Manuel Antonio, Samara, La
 * Fortuna y San Jose— y esas tres se quedaron sin ninguna pagina que las use.
 *
 * Se borran en vez de dejarlas descargandose: `/creditos` dice que lista las
 * fotografias DE ESTE SITIO, y tres que no salen en ninguna pagina convierten
 * esa lista en una aproximacion. Los identificadores de Unsplash estan en el
 * historial de git por si el cliente anade uno de esos destinos.
 * ============================================================================
 */
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
  /*
   * La lapa roja: la pidió el cliente por su nombre y es la portada de
   * `/online`, que hasta ahora era la única página sin una sola fotografía.
   *
   * El autor confirma en la descripción de Unsplash que está hecha en Isla
   * Tortuga, Costa Rica. Importa: media internet etiqueta como «lapa de Costa
   * Rica» guacamayos fotografiados en Perú o en un zoológico de Florida.
   *
   * Y encaja con el velo del hero sin tocar nada: el ave ocupa la mitad
   * derecha y la izquierda es follaje desenfocado, que es justo donde cae el
   * bloque de texto.
   */
  {
    archivo: "lapa-roja.jpg",
    idImagen: "1625877030477-84ff2e9833e4",
    pagina: "https://unsplash.com/photos/vh6V3QHcsNY",
    autor: "Omar Mena",
    perfil: "https://unsplash.com/@menaomar",
    descripcion:
      "Una lapa roja de cerca, con el pico claro y el ojo blanco, sobre follaje desenfocado. Fotografiada en Isla Tortuga.",
  },
  /*
   * Una calle de San José, para `/presencial`.
   *
   * No es una postal y por eso está: la página ya no vende «Costa Rica», vende
   * hablar cara a cara. Una playa a pantalla completa prometía otra cosa. Esta
   * es la calle donde de verdad suena el español que enseña la escuela.
   */
  {
    archivo: "calle-san-jose.jpg",
    idImagen: "1590268879033-e53b7bcc3338",
    pagina: "https://unsplash.com/photos/phFxZTQCO3s",
    autor: "Robin Canfield",
    perfil: "https://unsplash.com/@robincanfield",
    descripcion:
      "Una calle de San José en cuesta, con las casas de colores y los cables cruzando de lado a lado.",
  },
  /*
   * Una calle de un pueblo costarricense, para el artículo del voseo.
   *
   * El artículo trata de cómo se habla de verdad —vos, usted, tú— y no de
   * un paisaje. Una playa de postal ahí sería relleno bonito; una calle con
   * gente, rótulos y cables es el sitio donde esa conversación pasa.
   *
   * El autor describe la foto como un pueblo surfero de Costa Rica a
   * contraluz, con un motociclista pasando entre rótulos de tours.
   */
  {
    archivo: "pueblo-tico.jpg",
    idImagen: "1778874294856-a3e32a698216",
    pagina: "https://unsplash.com/photos/51I_5jfjvK4",
    autor: "35MM North",
    perfil: "https://unsplash.com/@35mm_north",
    descripcion:
      "La calle de un pueblo costarricense a contraluz, con palmeras, rótulos y los cables del tendido cruzando el cielo.",
  },
  /*
   * Sámara.
   *
   * ============ ES BARRIGONA, Y SE DICE ============
   * Unsplash no tiene ninguna foto que su autor confirme como playa Sámara: la
   * búsqueda devuelve una sola, y sin decir dónde está hecha. Esta es Playa
   * Barrigona, del mismo tramo de costa y a unos diez kilómetros —eso sí lo
   * dice el autor—.
   *
   * Se usa igual, pero el pie y el texto alternativo dicen Barrigona, no
   * Sámara. Poner un sitio por otro en la web de una escuela costarricense es
   * el tipo de error que un tico detecta en dos segundos.
   * =================================================
   */
  {
    archivo: "samara-barrigona.jpg",
    idImagen: "1643122542225-6a618183b16d",
    pagina: "https://unsplash.com/photos/daZIoyJhk8A",
    autor: "Luis Diego Aguilar",
    perfil: "https://unsplash.com/@luisdy18",
    descripcion:
      "Playa Barrigona desde el aire, en la península de Nicoya a unos diez kilómetros de Sámara: la selva bajando hasta la arena blanca.",
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
