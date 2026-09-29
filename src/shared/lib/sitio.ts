import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import {
  IDIOMA_POR_DEFECTO,
  IDIOMAS,
  LOCALE,
  type Idioma,
} from "@/shared/i18n/config";
import {
  NOMBRE_CORTO,
  NOMBRE_SITIO,
  OG_POR_DEFECTO,
  URL_BASE,
} from "@/shared/config/sitio";

/**
 * Único punto por el que se generan los metadatos de TODAS las páginas.
 *
 * Existe por una trampa concreta de Next.js: el `openGraph` de una página
 * REEMPLAZA al del layout en vez de fusionarse. Una página que declare solo
 * `openGraph: { title }` se queda sin `og:image`, y el enlace se ve roto en
 * WhatsApp — que es justo por donde va a circular este sitio.
 *
 * Pasando todo por aquí es imposible olvidarlo. `scripts/verificar-metadatos.mjs`
 * lo comprueba sobre el HTML generado y rompe el build si algo falta.
 */
export function metadatosDe({
  titulo,
  descripcion,
  ruta,
  lang,
  imagen,
  tipo = "website",
  publicado,
  modificado,
  alternativas,
}: {
  /** Sin el nombre del sitio: se añade solo. 15–65 caracteres ya compuesto. */
  titulo: string;
  /** 70–165 caracteres. */
  descripcion: string;
  /** Ruta absoluta con prefijo de idioma, p. ej. "/es/blog". */
  ruta: string;
  lang: Idioma;
  /** Ruta de la imagen social. Si falta se usa la del sitio. */
  imagen?: string;
  tipo?: "website" | "article";
  publicado?: string;
  modificado?: string;
  /**
   * Traducciones que EXISTEN de verdad, por idioma.
   *
   * Solo se emite `hreflang` para lo que se pase aquí. Declararle a Google una
   * versión en inglés que no existe es peor señal que no declarar nada, y en
   * el blog los artículos pueden vivir en un solo idioma.
   */
  alternativas?: Partial<Record<Idioma, string>>;
}): Metadata {
  const url = `${URL_BASE}${ruta}`;
  const imagenAbsoluta = `${URL_BASE}${imagenSocial(imagen)}`;

  /*
   * El <title> se deja SIN sufijo: lo añade la plantilla `title.template` del
   * layout. Ponerlo aquí también lo duplicaba —"Precios | Costa Rica Spanish
   * Experience | Costa Rica Spanish Experience"— y lo cazó
   * scripts/verificar-metadatos.mjs en su primera corrida.
   *
   * Open Graph y Twitter no pasan por esa plantilla, así que ahí sí se compone
   * a mano.
   */
  const tituloCompleto = `${titulo} | ${NOMBRE_CORTO}`;

  const languages: Record<string, string> = Object.fromEntries(
    Object.entries(alternativas ?? { [lang]: ruta }).map(([idioma, r]) => [
      idioma,
      `${URL_BASE}${r}`,
    ])
  );

  /*
   * `x-default` es la versión para quien no encaja en ningún idioma declarado:
   * aquí, la del idioma por defecto. Solo se emite si esa traducción existe
   * de verdad — apuntarlo a una URL que no está sería el error que
   * `alternativas` existe para evitar.
   */
  const porDefecto = languages[IDIOMA_POR_DEFECTO];
  if (porDefecto) languages["x-default"] = porDefecto;

  /* Los otros idiomas en que la página existe, para `og:locale:alternate`. */
  const otrosLocales = Object.keys(languages)
    .filter((i): i is Idioma => i !== lang && (IDIOMAS as readonly string[]).includes(i))
    .map((i) => LOCALE[i]);

  return {
    metadataBase: new URL(URL_BASE),
    title: titulo,
    description: descripcion,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      type: tipo,
      title: tituloCompleto,
      description: descripcion,
      url,
      siteName: NOMBRE_SITIO,
      locale: LOCALE[lang],
      ...(otrosLocales.length > 0 ? { alternateLocale: otrosLocales } : {}),
      images: [{ url: imagenAbsoluta, width: 1200, height: 630, alt: titulo }],
      ...(tipo === "article"
        ? { publishedTime: publicado, modifiedTime: modificado }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: tituloCompleto,
      description: descripcion,
      images: [imagenAbsoluta],
    },
  };
}

/**
 * La versión 1200x630 de una fotografía, para compartir.
 *
 * Las fotos de `/fotos` son de 2400x1800 y pesan hasta 870 KB: WhatsApp
 * descarta las vistas previas de imágenes pesadas y recorta las que no son
 * 1,91:1, así que el enlace salía sin imagen. `public/og/<mismo nombre>.jpg`
 * es la misma foto recortada a 1200x630 y por debajo de 200 KB. Si no existe
 * para una foto, se usa la imagen del sitio antes que una que no se vería.
 */
function imagenSocial(imagen?: string): string {
  if (!imagen) return OG_POR_DEFECTO;
  if (!imagen.startsWith("/fotos/")) return imagen;
  const propia = imagen.replace("/fotos/", "/og/");
  return existsSync(join(process.cwd(), "public", propia))
    ? propia
    : OG_POR_DEFECTO;
}

/** Mapa de traducciones para una ruta que existe en todos los idiomas. */
export function mismaRutaEnTodosLosIdiomas(
  construir: (lang: Idioma) => string
): Record<Idioma, string> {
  return Object.fromEntries(
    IDIOMAS.map((idioma) => [idioma, construir(idioma)])
  ) as Record<Idioma, string>;
}
