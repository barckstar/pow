import type { MetadataRoute } from "next";
import { IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { rutas, URL_BASE } from "@/shared/config/sitio";
import { etiquetasDe, leerArticulos } from "@/features/blog/lib/leer";

/**
 * Sitemap con las dos variantes de idioma de cada ruta y todos los artículos
 * publicados (los borradores quedan fuera porque `leerArticulos` ya los
 * filtra).
 *
 * Cada entrada declara sus alternativas de idioma, que es la forma de decirle
 * a Google que /es/blog y /en/blog son la misma página en dos lenguas y no
 * contenido duplicado.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entradas: MetadataRoute.Sitemap = [];

  const rutasFijas: ((l: Idioma) => string)[] = [
    rutas.inicio,
    rutas.online,
    rutas.presencial,
    rutas.destinos,
    rutas.blog,
    rutas.precios,
    rutas.comunidad,
    rutas.reservar,
    (l) => `/${l}/creditos`,
  ];

  for (const construir of rutasFijas) {
    const alternativas = Object.fromEntries(
      IDIOMAS.map((idioma) => [idioma, `${URL_BASE}${construir(idioma)}`])
    );

    for (const idioma of IDIOMAS) {
      entradas.push({
        url: `${URL_BASE}${construir(idioma)}`,
        lastModified: new Date(),
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
        lastModified: new Date(),
      });
    }
  }

  return entradas;
}
