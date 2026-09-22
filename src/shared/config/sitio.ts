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
 * ============ ES UN ENLACE PÚBLICO, NO UN SECRETO ============
 * Lo que hace falta es la URL del tipo de evento, la misma que se le pasa a un
 * estudiante por WhatsApp:
 *
 *     https://calendly.com/usuario/clase-de-espanol
 *
 * NO lleva token. La API de Calendly (`api.calendly.com`, con un Personal
 * Access Token) sirve para que un servidor lea reservas o registre webhooks, y
 * este sitio no hace ninguna de las dos cosas. Un token aquí sería un secreto
 * en un repositorio público sin ninguna función.
 *
 * Por eso la variable lleva `NEXT_PUBLIC_`: ese prefijo hace que Next la
 * incruste en el JavaScript que llega al navegador, y aquí eso es correcto y
 * no una fuga — la URL acaba en el HTML de todas formas, porque es a donde
 * apunta el widget. Un secreto de verdad JAMÁS lleva ese prefijo.
 * =============================================================
 *
 * Mientras no esté puesta, `/reservar` explica el proceso y dice que todavía
 * no se puede reservar, en vez de enseñar un calendario que no lleva a ningún
 * sitio.
 */
const URL_CALENDLY = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim();

export const CALENDLY: { url: string } | null = URL_CALENDLY
  ? { url: URL_CALENDLY }
  : null;

/*
 * ============ QUÉ TIENE QUE SER Y QUÉ NO ============
 * El primer segmento es el usuario y el segundo el tipo de evento. La lista
 * negra no es paranoia: `calendly.com/event_types/...` es la URL del PANEL de
 * administración, encaja en el patrón de dos segmentos y es el error más fácil
 * de cometer, porque es la que uno tiene en la barra mientras configura el
 * evento. Embebida, carga una pantalla de login.
 *
 * La otra confusión típica es pegar el token: Calendly llama «API» tanto a la
 * clave como a los enlaces en su panel.
 * ====================================================
 */
const ESPERADO = /^https:\/\/calendly\.com\/([\w-]+)\/[\w-]+/;

/**
 * Primeros segmentos que NO son el usuario de nadie.
 *
 * Dos familias, y las dos son errores reales que ya pasaron:
 *
 *   RUTAS DEL PROPIO CALENDLY. `calendly.com/event_types/...` es la URL del
 *   PANEL de administración: encaja en el patrón de dos segmentos y es la que
 *   uno tiene en la barra mientras configura el evento.
 *
 *   PLACEHOLDERS. `tu-usuario`, `prueba`, `ejemplo`... Son los de los ejemplos
 *   de la documentación de este mismo proyecto, y pegarlos tal cual es lo más
 *   fácil del mundo. El resultado no es un error visible: Calendly sirve su
 *   PÁGINA DE PUBLICIDAD —con un «Get started for free»— dentro del hueco del
 *   calendario, y el sitio parece estar anunciando a Calendly en vez de
 *   ofrecer horas. Pasó en la primera prueba.
 */
const NO_SON_USUARIOS = new Set([
  // Rutas del propio Calendly.
  "event_types",
  "app",
  "api",
  "login",
  "signup",
  "integrations",
  "users",
  "settings",
  "pages",
  // Placeholders de la documentación.
  "tu-usuario",
  "tu_usuario",
  "usuario",
  "prueba",
  "ejemplo",
  "example",
  "test",
  "demo",
  "username",
  "your-name",
  "your-username",
]);

/*
 * La comprobación va en una FUNCIÓN y no suelta con un `if`.
 *
 * Suelta no serviría de nada el día que la variable no esté puesta:
 * TypeScript estrecha `CALENDLY` a `null` en este mismo archivo y el cuerpo
 * del `if` se vuelve código muerto — ni siquiera compila, porque `.url` no
 * existe en `never`. Dentro de una función el parámetro lleva su tipo
 * declarado y no hay estrechamiento que valga.
 *
 * Corre al importar, así que un enlace mal pegado rompe el build en vez de
 * dejar un calendario que no carga.
 */
function comprobarCalendly(config: { url: string } | null) {
  if (!config) return;

  const encaja = ESPERADO.exec(config.url);
  if (encaja && !NO_SON_USUARIOS.has(encaja[1])) return;

  throw new Error(
    [
      `NEXT_PUBLIC_CALENDLY_URL no sirve: "${config.url}".`,
      "Tiene que ser TU enlace de reserva: el del botón «Copy link» del tipo de evento.",
      "La prueba: pegalo en una pestaña de incógnito. Si ves tu calendario, es el bueno;",
      "si ves la web de Calendly con «Get started for free», esa dirección no existe.",
      "No es un token, no es la URL del panel (/event_types/...) y no es un ejemplo",
      "de la documentación.",
    ].join(" ")
  );
}

comprobarCalendly(CALENDLY);

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
