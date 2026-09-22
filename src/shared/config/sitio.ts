import type { Idioma } from "@/shared/i18n/config";

/**
 * Configuración del sitio.
 *
 * Vive en TypeScript y no en JSON a propósito: cada campo necesita un
 * comentario que diga de dónde salió el dato o por qué está vacío, y JSON no
 * admite comentarios. Esa memoria es justamente lo que se pierde.
 *
 * Todo lo que está en `null` es un dato REAL que el cliente aún no ha dado.
 * No se rellena con suposiciones: se muestra como pendiente en la página.
 * Lista completa en PENDIENTE.md.
 */

/**
 * Dominio del sitio.
 *
 * PENDIENTE: el cliente no ha comprado dominio todavía. El valor de abajo es
 * provisional y se usa si no hay variable de entorno.
 *
 * ============ POR QUÉ ESTE SÍ ES UNA VARIABLE ============
 * No es un secreto, pero **cambia según dónde corra el sitio**: en una
 * previsualización de Vercel el dominio es otro, y ahí las canónicas, los
 * `og:url`, el sitemap y el RSS tienen que apuntar a esa previsualización y no
 * a producción. Con el valor escrito en el código, una preview se anuncia a sí
 * misma como si fuera el sitio de verdad — y eso es exactamente lo que hace
 * que Google acabe indexando una preview.
 *
 * VA SIN `NEXT_PUBLIC_` a propósito: solo lo leen el layout, el sitemap, el
 * robots, el RSS y el JSON-LD, que corren en el servidor. Con el prefijo se
 * incrustaría en el paquete del navegador sin que nadie lo use.
 * =========================================================
 */
export const URL_BASE = normalizarBase(
  process.env.URL_BASE?.trim() || "https://costaricaspanishexperience.com"
);

/**
 * Quita la barra final y comprueba que sea una URL absoluta.
 *
 * Lo de la barra no es manía: en todo el proyecto se concatena
 * `${URL_BASE}${ruta}`, y las rutas ya empiezan por `/`. Con una barra final
 * en la variable, cada canónica del sitio saldría como `https://sitio.com//es`
 * — que es una URL distinta para un buscador, y duplica el sitio entero.
 *
 * Y si no es absoluta, `new URL()` del layout revienta con un mensaje que no
 * dice de dónde viene. Mejor fallar aquí, diciendo cuál es la variable.
 */
function normalizarBase(valor: string): string {
  let url: URL;
  try {
    url = new URL(valor);
  } catch {
    throw new Error(
      `URL_BASE tiene que ser una URL absoluta con protocolo, y es: "${valor}". ` +
        "Por ejemplo https://costaricaspanishexperience.com"
    );
  }

  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error(
      `URL_BASE tiene que ir por https (salvo en localhost), y es: "${valor}"`
    );
  }

  return valor.replace(/\/+$/, "");
}

export const NOMBRE_SITIO = "Costa Rica Spanish Experience";

/**
 * Versión corta para el sufijo del <title>.
 *
 * El nombre completo ocupa 29 caracteres y, con el separador, deja solo 34
 * para el título de la página dentro del límite de 65 que usan los
 * buscadores. Con el corto quedan 44, que ya da para un titular de artículo
 * decente. `og:site_name` y el JSON-LD siguen llevando el nombre completo.
 */
export const NOMBRE_CORTO = "Costa Rica Spanish";

/**
 * Zona horaria del profesor. Vive en Suiza y da las clases en línea desde
 * ahí. Importa porque Suiza aplica horario de verano y Costa Rica no: la
 * diferencia entre ambas cambia dos veces al año.
 */
export const ZONA_PROFESOR = "Europe/Zurich";

/**
 * Depósito que se cobra para apartar una clase.
 * PENDIENTE: el monto no está confirmado por el cliente. Mientras sea `null`
 * la ruta de reserva muestra el aviso de pendiente y no ofrece pagar.
 */
export const DEPOSITO: { monto: number; moneda: string } | null = null;

/*
 * ============ EL CALENDARIO YA NO SE CONFIGURA AQUÍ ============
 * Estuvo la constante `CALENDLY`, leyendo `NEXT_PUBLIC_CALENDLY_URL`. Con una
 * sola duración de clase estaba bien; dejó de estarlo en cuanto el cliente
 * pidió varias —una hora, dos, cinco—.
 *
 * Cada duración es un tipo de evento distinto en Calendly, con su enlace, y
 * además lleva etiqueta y descripción propias. Eso es CONTENIDO, y el
 * contenido va en `.json` validado como el resto: vive en
 * `features/reservas/data/clases.json`.
 *
 * El argumento que justificaba la variable de entorno —que cambia según dónde
 * corra— tampoco aplicaba: la cuenta de Calendly es la misma en pruebas y en
 * producción. `URL_BASE` sí cambia, y por eso se queda.
 * ===============================================================
 */


/*
 * ============ QUIÉN DA LAS CLASES NO SE CONFIGURA AQUÍ ============
 * Estuvo la constante `PROFESOR`, con el nombre y la ruta del retrato. Duró
 * poco: en cuanto la ficha creció —papel, biografía y tres datos sueltos— se
 * vio que casi todo eso va en DOS IDIOMAS, y el contenido bilingüe de este
 * sitio vive en `.json` validado al importar, no en TypeScript.
 *
 * Está en `features/online/data/profesores.json`, con su esquema al lado. Es
 * una lista aunque hoy solo esté Chris Pow, porque el cliente ya dijo que
 * habrá más.
 * ==================================================================
 */

/**
 * Redes sociales del negocio.
 * PENDIENTE: no se han confirmado. Una URL inventada manda al visitante al
 * perfil de otra persona, así que hasta tenerlas la barra social solo muestra
 * el botón de compartir.
 */
export const REDES: {
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
} = {
  whatsapp: null,
  instagram: null,
  facebook: null,
};

/**
 * Contacto público.
 * PENDIENTE: sin confirmar.
 */
export const CONTACTO: { correo: string | null; telefono: string | null } = {
  correo: null,
  telefono: null,
};

/** Imagen por defecto para Open Graph cuando una ruta no trae la suya. */
export const OG_POR_DEFECTO = "/og/por-defecto.jpg";

/** Rutas del sitio, centralizadas para que los enlaces no se escriban a mano. */
export const rutas = {
  inicio: (l: Idioma) => `/${l}`,
  online: (l: Idioma) => `/${l}/online`,
  /*
   * ============ `/presencial` Y `/destinos` ERAN LA MISMA PÁGINA ============
   * Estaban separadas: una explicaba la modalidad y la otra listaba los
   * sitios. El cliente lo dijo claro — «los destinos y aprender en Costa Rica
   * están pensados como un mismo tema»— y tiene razón: lo que vende no es una
   * modalidad ni una lista de playas, es UNA cosa, aprender el idioma
   * viajando por el país.
   *
   * Dos páginas para un solo tema tenían el problema de siempre: el visitante
   * tiene que leer las dos para entender la oferta, y ninguna de las dos se
   * explica sola. Ahora es una: el concepto, cómo funciona y los destinos,
   * seguidos.
   *
   * La ruta se llama `/costa-rica` y no `/presencial` porque una URL también
   * se lee: «presencial» es una palabra de dentro de casa.
   * ========================================================================
   */
  costaRica: (l: Idioma) => `/${l}/costa-rica`,
  blog: (l: Idioma) => `/${l}/blog`,
  articulo: (l: Idioma, slug: string) => `/${l}/blog/${slug}`,
  etiqueta: (l: Idioma, tag: string) => `/${l}/blog/tag/${tag}`,
  precios: (l: Idioma) => `/${l}/precios`,
  comunidad: (l: Idioma) => `/${l}/comunidad`,
  reservar: (l: Idioma) => `/${l}/reservar`,
  /**
   * El formulario de solicitud de inmersión.
   *
   * ============ EL DESTINO VA EN LA RUTA, NO EN LA QUERY ============
   * Estuvo como `?destino=manuel-antonio`, que parecía más simple: una página
   * en vez de cinco. Y tenía un coste que solo se ve al construir:
   *
   * Leer `searchParams` en el servidor OBLIGA a Next a renderizar la ruta bajo
   * demanda. Deja de generarse HTML estático, y sin HTML estático
   * `scripts/verificar-metadatos.mjs` no tiene nada que revisar — o sea que
   * justo la página nueva se quedaba fuera de la única red que tiene este
   * sitio para cazar un metadato que falte.
   *
   * Como segmento, las cinco variantes por idioma se prerenderizan, el
   * verificador las cubre, y de paso cada una puede llevar su propio título y
   * su propia descripción nombrando el destino, que es mejor para buscar que
   * cinco páginas iguales.
   * ==================================================================
   */
  solicitud: (l: Idioma, destino?: string) =>
    destino ? `/${l}/solicitud/${destino}` : `/${l}/solicitud`,
} as const;
