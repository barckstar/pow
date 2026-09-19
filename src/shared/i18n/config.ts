/**
 * Idiomas del sitio.
 *
 * Agregar uno es literalmente añadirlo a esta tupla y crear su archivo en
 * `diccionarios/`. El esquema de Zod exige entonces que TODAS las claves
 * existan en el idioma nuevo, así que un diccionario a medias rompe el build
 * en vez de renderizar "undefined" en la página del cliente.
 *
 * Candidatos reales a futuro: alemán y francés — el profesor vive en Suiza.
 */
export const IDIOMAS = ["es", "en"] as const;

export type Idioma = (typeof IDIOMAS)[number];

export const IDIOMA_POR_DEFECTO: Idioma = "es";

/** Etiqueta de cada idioma en su propia lengua, para el selector. */
export const NOMBRE_IDIOMA: Record<Idioma, string> = {
  es: "Español",
  en: "English",
};

/** `hreflang` / `og:locale` de cada idioma. */
export const LOCALE: Record<Idioma, string> = {
  es: "es_CR",
  en: "en_US",
};

export function esIdioma(valor: string): valor is Idioma {
  return (IDIOMAS as readonly string[]).includes(valor);
}

/**
 * Elige idioma a partir de la cabecera `Accept-Language`.
 *
 * Implementación deliberadamente corta: solo mira el prefijo de dos letras de
 * cada entrada, en el orden en que el navegador las manda (que ya viene
 * ordenado por preferencia). No hace falta interpretar los pesos `q=` para
 * decidir entre dos idiomas.
 */
export function idiomaDesdeCabecera(acceptLanguage: string | null): Idioma {
  if (!acceptLanguage) return IDIOMA_POR_DEFECTO;

  for (const entrada of acceptLanguage.split(",")) {
    const prefijo = entrada.trim().slice(0, 2).toLowerCase();
    if (esIdioma(prefijo)) return prefijo;
  }

  return IDIOMA_POR_DEFECTO;
}
