import type { MetadataRoute } from "next";
import { IDIOMA_POR_DEFECTO, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { rutas, URL_BASE } from "@/shared/config/sitio";
import { DESTINOS } from "@/features/destinos/esquema";
import { etiquetasDe, leerArticulos } from "@/features/blog/lib/leer";

/**
 * Sitemap con todas las variantes de idioma de cada ruta y todos los
 * artículos publicados (los borradores quedan fuera porque `leerArticulos` ya
 * los filtra).
 *
 * Cada entrada declara sus alternativas de idioma, que es la forma de decirle
 * a Google que /en/blog y /de/blog son la misma página en dos lenguas y no
 * contenido duplicado.
 *
 * ============ SIN `lastModified` DONDE NO HAY FECHA REAL ============
 * Estuvo `new Date()` en todas las rutas fijas: cada build las declaraba
 * modificadas «ahora», sin que hubiera cambiado nada. Google acaba por ignorar
 * el `lastmod` de un sitio que miente en él, y entonces tampoco cree al de los
 * artículos, que sí lo llevan de verdad. Solo lo tienen las entradas con una
 * fecha que existe.
 * ====================================================================
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entradas: MetadataRoute.Sitemap = [];

  const rutasFijas: ((l: Idioma) => string)[] = [
    rutas.inicio,
    rutas.online,
    rutas.costaRica,
    rutas.blog,
    rutas.precios,
    rutas.comunidad,
    rutas.reservar,
    rutas.about,
    (l) => rutas.solicitud(l),
    ...DESTINOS.map((d) => (l: Idioma) => rutas.solicitud(l, d.id)),
    rutas.creditos,
  ];

  for (const construir of rutasFijas) {
    const alternativas: Record<string, string> = Object.fromEntries(
      IDIOMAS.map((idioma) => [idioma, `${URL_BASE}${construir(idioma)}`])
    );
    alternativas["x-default"] = alternativas[IDIOMA_POR_DEFECTO];

    for (const idioma of IDIOMAS) {
      entradas.push({
        url: `${URL_BASE}${construir(idioma)}`,
        alternates: { languages: alternativas },
      });
    }
  }

  for (const idioma of IDIOMAS) {
    for (const articulo of await leerArticulos(idioma)) {
      entradas.push({
        url: `${URL_BASE}${rutas.articulo(idioma, articulo.slug)}`,
        lastModified: articulo.actualizado ?? articulo.fecha,
      });
    }

    for (const { etiqueta } of await etiquetasDe(idioma)) {
      entradas.push({
        url: `${URL_BASE}${rutas.etiqueta(idioma, etiqueta)}`,
      });
    }
  }

  return entradas;
}
