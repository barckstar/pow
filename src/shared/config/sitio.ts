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
 * Zona horaria del profesor. Vive en Suiza y da las clases en línea desde
 * ahí. Importa porque Suiza aplica horario de verano y Costa Rica no: la
 * diferencia entre ambas cambia dos veces al año.
 */
export const ZONA_PROFESOR = "Europe/Zurich";

/** Zona horaria de las clases presenciales. Costa Rica no aplica DST nunca. */
export const ZONA_COSTA_RICA = "America/Costa_Rica";

/**
 * Depósito que se cobra para apartar una clase.
 * PENDIENTE: el monto no está confirmado por el cliente. Mientras sea `null`
 * la ruta de reserva muestra el aviso de pendiente y no ofrece pagar.
 */
export const DEPOSITO: { monto: number; moneda: string } | null = null;

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
  presencial: (l: Idioma) => `/${l}/presencial`,
  destinos: (l: Idioma) => `/${l}/destinos`,
  blog: (l: Idioma) => `/${l}/blog`,
  articulo: (l: Idioma, slug: string) => `/${l}/blog/${slug}`,
  etiqueta: (l: Idioma, tag: string) => `/${l}/blog/tag/${tag}`,
  precios: (l: Idioma) => `/${l}/precios`,
  comunidad: (l: Idioma) => `/${l}/comunidad`,
  reservar: (l: Idioma) => `/${l}/reservar`,
} as const;
