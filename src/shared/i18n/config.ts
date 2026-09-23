/**
 * Idiomas del sitio.
 *
 * Agregar uno es literalmente añadirlo a esta tupla y crear su archivo en
 * `diccionarios/`. El esquema de Zod exige entonces que TODAS las claves
 * existan en el idioma nuevo, así que un diccionario a medias rompe el build
 * en vez de renderizar "undefined" en la página del cliente. Lo mismo pasa
 * con cada `.json` de contenido que usa `localizado()`: agregar un idioma
 * aquí obliga a traducir TODO lo demás, y el build dice exactamente dónde
 * falta.
 *
 * Alemán y francés se agregaron el 23/09/2026 porque el profesor da clase
 * desde Suiza y el cliente lo pidió así — «de momento solo esos», sin
 * italiano.
 *
 * El español se quitó el mismo día, unas horas después de agregar los otros
 * dos: el cliente lo pidió sin más explicación que «quita el español de los
 * idiomas». El contenido en español no se borró de los `.json` de
 * contenido —solo del diccionario de interfaz, que sí exige exactamente
 * estos cuatro— así que reactivarlo el día de mañana es threading un idioma
 * más a esta lista y traduciendo el diccionario, no reconstruir desde cero.
 * Los artículos del blog en español tampoco se borraron: siguen en
 * `content/blog/es/`, sencillamente no se sirven mientras `es` no esté aquí.
 */
export const IDIOMAS = ["en", "de", "fr"] as const;

export type Idioma = (typeof IDIOMAS)[number];

/**
 * Inglés y no español.
 *
 * ============ POR QUÉ CAMBIÓ ============
 * Hasta el 23/09/2026 era español, porque el negocio es costarricense. El
 * cliente pidió el cambio con un argumento que no tiene vuelta: «no sirve que
 * salga en español, los potenciales estudiantes no saben español». Quien
 * llega sin cabecera de idioma reconocible —un buscador, un enlace
 * compartido sin contexto— es exactamente quien todavía no habla la lengua
 * que el sitio enseña. Mostrársela primero es la única opción que no se
 * entiende a sí misma.
 * =========================================
 */
export const IDIOMA_POR_DEFECTO: Idioma = "en";

/** Etiqueta de cada idioma en su propia lengua, para el selector. */
export const NOMBRE_IDIOMA: Record<Idioma, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
};

/** `hreflang` / `og:locale` de cada idioma. */
export const LOCALE: Record<Idioma, string> = {
  en: "en_US",
  de: "de_DE",
  fr: "fr_FR",
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
 *
 * Con inglés como idioma por defecto, esto ya hace exactamente lo que pidió
 * el cliente sin ningún caso especial: un navegador en alemán o francés cae
 * en `de`/`fr` porque ahora están en `IDIOMAS`; uno en italiano, o en
 * cualquier otra lengua que el sitio no cubre, no encuentra nada en el bucle
 * y termina en `IDIOMA_POR_DEFECTO` — inglés.
 */
export function idiomaDesdeCabecera(acceptLanguage: string | null): Idioma {
  if (!acceptLanguage) return IDIOMA_POR_DEFECTO;

  for (const entrada of acceptLanguage.split(",")) {
    const prefijo = entrada.trim().slice(0, 2).toLowerCase();
    if (esIdioma(prefijo)) return prefijo;
  }

  return IDIOMA_POR_DEFECTO;
}
