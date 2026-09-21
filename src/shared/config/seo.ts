import type { Idioma } from "@/shared/i18n/config";

/**
 * Títulos y descripciones de cada ruta, en un solo sitio.
 *
 * Están aquí y no en el diccionario de interfaz porque no son texto que se
 * lea en la página: son metadatos. Juntarlos permite además revisarlos de un
 * vistazo y comprobar que ninguno se repite — Google penaliza los títulos y
 * descripciones duplicados entre páginas de un mismo sitio.
 *
 * Restricciones que `scripts/verificar-metadatos.mjs` comprueba sobre el HTML
 * ya generado: título de 15 a 65 caracteres y descripción de 70 a 165.
 */
type Textos = { titulo: string; descripcion: string };

export const SEO: Record<string, Record<Idioma, Textos>> = {
  online: {
    es: {
      titulo: "Clases de español en línea",
      descripcion:
        "Clases de español costarricense uno a uno por videollamada, con horarios que sirven a Europa y a América y precios sin letra pequeña.",
    },
    en: {
      titulo: "Online Spanish lessons",
      descripcion:
        "One-to-one Costa Rican Spanish lessons over video, with slots that work for both Europe and the Americas and no small print.",
    },
  },
  /*
   * Ni el título ni la descripción nombran ya una ciudad ni un país.
   *
   * No es cosmética: mientras la sede no esté confirmada, un título que
   * prometa «en Costa Rica» atrae búsquedas que la página no puede responder,
   * y quien llega se va en cuanto lee que el lugar está por decidir. Lo que se
   * vende aquí es el modo —cara a cara—, y eso es lo que se indexa.
   */
  presencial: {
    es: {
      titulo: "Clases de español en persona",
      descripcion:
        "Clases de español costarricense cara a cara: el gesto, el tono y las interrupciones que una videollamada recorta. La sede, por confirmar.",
    },
    en: {
      titulo: "In-person Spanish lessons",
      descripcion:
        "Costa Rican Spanish lessons face to face: the gesture, the tone and the interruptions a video call trims away. Venue still to be confirmed.",
    },
  },
  destinos: {
    es: {
      titulo: "Lugares de Costa Rica que ver",
      descripcion:
        "Manuel Antonio, La Fortuna, Monteverde, Río Celeste y Puerto Viejo: cinco lugares de Costa Rica con lo que de verdad hay en cada uno.",
    },
    en: {
      titulo: "Places to see in Costa Rica",
      descripcion:
        "Manuel Antonio, La Fortuna, Monteverde, Río Celeste and Puerto Viejo: five places in Costa Rica with what is actually in each one.",
    },
  },
  precios: {
    es: {
      titulo: "Precios de las clases",
      descripcion:
        "Precios de las clases de español en línea y en persona, y del depósito de reserva. Sin cifras inventadas mientras no estén confirmadas.",
    },
    en: {
      titulo: "Lesson pricing",
      descripcion:
        "Pricing for online and in-person Spanish lessons, and for the booking deposit. No invented figures while they are not confirmed.",
    },
  },
  comunidad: {
    es: {
      titulo: "Comunidad y grupos de conversación",
      descripcion:
        "Grupos de conversación, redes de la escuela y el archivo completo de tiquismos: expresiones costarricenses explicadas una a una.",
    },
    en: {
      titulo: "Community and conversation groups",
      descripcion:
        "Conversation groups, the school's social accounts, and the full archive of tiquismos: Costa Rican expressions explained one by one.",
    },
  },
  creditos: {
    es: {
      titulo: "Créditos de las fotografías",
      descripcion:
        "Autoría y licencia de cada fotografía usada en el sitio. Todas vienen de Unsplash y se usan bajo su licencia de uso comercial.",
    },
    en: {
      titulo: "Photography credits",
      descripcion:
        "Authorship and licence of every photograph used on this site. All of them come from Unsplash under its commercial-use licence.",
    },
  },
};
