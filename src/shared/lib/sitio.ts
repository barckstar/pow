import type { Metadata } from "next";
import { IDIOMAS, LOCALE, type Idioma } from "@/shared/i18n/config";
import {
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
  const imagenAbsoluta = `${URL_BASE}${imagen ?? OG_POR_DEFECTO}`;
  const tituloCompleto = `${titulo} | ${NOMBRE_SITIO}`;

  const languages = Object.fromEntries(
    Object.entries(alternativas ?? { [lang]: ruta }).map(([idioma, r]) => [
      idioma,
      `${URL_BASE}${r}`,
    ])
  );

  return {
    metadataBase: new URL(URL_BASE),
    title: tituloCompleto,
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

/** Mapa de traducciones para una ruta que existe en todos los idiomas. */
export function mismaRutaEnTodosLosIdiomas(
  construir: (lang: Idioma) => string
): Record<Idioma, string> {
  return Object.fromEntries(
    IDIOMAS.map((idioma) => [idioma, construir(idioma)])
  ) as Record<Idioma, string>;
}
