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

/**
 * Los metadatos de una solicitud CON destino, compuestos a partir del propio
 * destino.
 *
 * Se componen en vez de escribirse a mano por dos razones. Una, que son cuatro
 * destinos por dos idiomas: ocho pares de título y descripción que habría que
 * mantener a mano y que se desincronizarían con `destinos.json` en cuanto
 * alguien renombrara un sitio. Y dos, que el verificador del `postbuild`
 * comprueba la longitud sobre el HTML ya generado, así que un nombre largo
 * rompe el build y no se cuela.
 *
 * Las cuentas, para que nadie las tenga que rehacer: el título lleva pegado
 * « | Costa Rica Spanish», que son 21 caracteres, y el límite es 65. El
 * nombre más largo es «Manuel Antonio», que deja el título en 48.
 */
export function seoDeSolicitud(
  lang: Idioma,
  nombre: string,
  zona: string
): Textos {
  if (lang === "en") {
    return {
      titulo: `Immersion in ${nombre}`,
      descripcion: `Study Spanish by immersion in ${nombre}, ${zona}. Tell us how long you plan to stay and we will tell you which school suits you.`,
    };
  }

  return {
    titulo: `Inmersión en ${nombre}`,
    descripcion: `Estudiá español en inmersión en ${nombre}, ${zona}. Contanos cuánto tiempo planeás quedarte y te decimos qué escuela te sirve.`,
  };
}

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
   * Vuelven a nombrar Costa Rica, y los cuatro destinos con ellos.
   *
   * Estuvieron sin nombrarla mientras el lugar de las presenciales era un
   * pendiente. El cliente aclaró que la vía presencial ES inmersión en el
   * país, en Manuel Antonio, Sámara, La Fortuna y San José, así que eso es lo
   * que se indexa: son los cuatro términos por los que alguien que planea el
   * viaje va a buscar.
   *
   * Lo que sigue pendiente es la escuela de cada destino, y eso no se indexa
   * ni se promete: se dice en la página.
   */
  presencial: {
    es: {
      titulo: "Inmersión en español en Costa Rica",
      descripcion:
        "Aprendé español viviendo en Costa Rica: clase por la mañana y el país de aula el resto del día, en Manuel Antonio, Sámara, La Fortuna o San José.",
    },
    en: {
      titulo: "Spanish immersion in Costa Rica",
      descripcion:
        "Learn Spanish living in Costa Rica: a lesson in the morning and the country as your classroom after, in Manuel Antonio, Sámara, La Fortuna or San José.",
    },
  },
  destinos: {
    es: {
      titulo: "Destinos de inmersión en Costa Rica",
      descripcion:
        "Manuel Antonio, Sámara, La Fortuna y San José: cuatro destinos donde estudiar español en inmersión, con lo que hay en cada uno y por qué elegirlo.",
    },
    en: {
      titulo: "Spanish immersion destinations",
      descripcion:
        "Manuel Antonio, Sámara, La Fortuna and San José: four places to study Spanish by immersion, what is in each one and why you might pick it.",
    },
  },
  solicitud: {
    es: {
      titulo: "Solicitá tu inmersión en Costa Rica",
      descripcion:
        "Contanos el destino, cuánto tiempo planeás quedarte y por qué querés aprender, y te decimos qué escuela y qué nivel te sirven.",
    },
    en: {
      titulo: "Enquire about your immersion",
      descripcion:
        "Tell us the destination, how long you plan to stay and why you want to learn, and we will tell you which school and level suit you.",
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
