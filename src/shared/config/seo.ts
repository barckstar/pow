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
  presencial: {
    es: {
      titulo: "Clases presenciales en Costa Rica",
      descripcion:
        "Clases de español presenciales en Costa Rica: la conversación sale del aula y se practica en el parque, la soda y la pulpería.",
    },
    en: {
      titulo: "In-person lessons in Costa Rica",
      descripcion:
        "In-person Spanish lessons in Costa Rica: conversation leaves the classroom and happens in the park, the soda and the corner shop.",
    },
  },
  destinos: {
    es: {
      titulo: "Destinos: Manuel Antonio y La Fortuna",
      descripcion:
        "Los dos lugares de Costa Rica donde se dan las clases presenciales: Manuel Antonio, entre selva y playa, y La Fortuna, a los pies del Arenal.",
    },
    en: {
      titulo: "Destinations: Manuel Antonio and La Fortuna",
      descripcion:
        "The two places in Costa Rica where in-person lessons happen: Manuel Antonio, between rainforest and beach, and La Fortuna, below the Arenal.",
    },
  },
  precios: {
    es: {
      titulo: "Precios de las clases",
      descripcion:
        "Precios de las clases de español en línea y presenciales, y del depósito de reserva. Sin cifras inventadas mientras no estén confirmadas.",
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
