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
 * Dominio de producción.
 * PENDIENTE: el cliente no ha comprado dominio. Este valor es provisional y
 * solo afecta a canónicas y og:url; cambiarlo aquí lo arregla en todo el sitio.
 */
export const URL_BASE = "https://costaricaspanishexperience.com";

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

/**
 * El calendario de reservas.
 *
 * ============ CALENDLY LO HACE TODO, Y ESO FUE UNA DECISIÓN ============
 * Reserva, formulario, cobro y enlace de Zoom: las cuatro cosas las hace
 * Calendly, no este sitio.
 *
 *   - La FRANJA y los HUSOS HORARIOS los gestiona Calendly.
 *   - El FORMULARIO —nombre, correo y las preguntas que se quieran— es el suyo.
 *   - El COBRO va dentro de su flujo: sin pagar no se confirma la franja, que
 *     es lo que pidió el cliente. Admite PayPal.
 *   - El ENLACE DE ZOOM lo crea su integración con Zoom y lo manda por correo
 *     a la dirección que la persona escribió, junto con la invitación de
 *     calendario y los recordatorios.
 *
 * Antes de esto el sitio tenía su propio selector de franjas, su puerto de
 * calendario con dos adaptadores, una librería de conversión de husos horarios
 * con tests del cambio de hora y dos rutas de servidor para PayPal. Todo eso
 * se quitó al tomar esta decisión: mantener una segunda forma de reservar, que
 * además no cobraba ni creaba la reunión, era garantizar que las dos
 * divergieran. Está en el historial, en el commit `0dcca7e`, por si hubiera
 * que volver.
 * =======================================================================
 *
 * Mientras sea `null`, `/reservar` explica el proceso y dice que todavía no
 * se puede reservar, en vez de enseñar un calendario que no lleva a ningún
 * sitio. Hace falta la cuenta de Calendly con el plan que cubra cobros e
 * integración con Zoom.
 */
export const CALENDLY: { url: string } | null = null;

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
