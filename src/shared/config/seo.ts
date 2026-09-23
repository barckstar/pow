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
 * destinos por cuatro idiomas: dieciséis pares de título y descripción que
 * habría que mantener a mano y que se desincronizarían con `destinos.json` en
 * cuanto alguien renombrara un sitio. Y dos, que el verificador del
 * `postbuild` comprueba la longitud sobre el HTML ya generado, así que un
 * nombre largo rompe el build y no se cuela.
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
  switch (lang) {
    case "en":
      return {
        titulo: `Immersion in ${nombre}`,
        descripcion: `Study Spanish by immersion in ${nombre}, ${zona}. Tell us how long you plan to stay and we will tell you which school suits you.`,
      };
    /*
     * El título NO puede ser «Immersion in ${nombre}» como en inglés: son
     * literalmente la misma cadena —«Immersion» es préstamo directo en
     * alemán— y `verificar-metadatos.mjs` lo cazó como título duplicado entre
     * idiomas. «Spanisch-Immersion» es igual de natural en alemán y ya no
     * coincide con ningún otro.
     */
    case "de":
      return {
        titulo: `Spanisch-Immersion in ${nombre}`,
        descripcion: `Lerne Spanisch in ${nombre} (${zona}) in Vollimmersion. Sag uns, wie lange du bleibst, und wir sagen dir, welche Schule passt.`,
      };
    /*
     * Aquí sin «l'espagnol»: la elisión francesa se escapa en el HTML como
     * `&#x27;`, seis caracteres en vez de uno, y el verificador mide sobre
     * ese HTML ya escapado. Con el destino y la zona más largos —Manuel
     * Antonio en Guanacaste, península de Nicoya— ese apóstrofo de más era
     * la diferencia entre pasar y no pasar los 165 caracteres.
     */
    case "fr":
      return {
        titulo: `Immersion à ${nombre}`,
        descripcion: `Immersion en espagnol à ${nombre} (${zona}). Dis-nous combien de temps tu restes, et on te dira quelle école te convient.`,
      };
    case "es":
      return {
        titulo: `Inmersión en ${nombre}`,
        descripcion: `Estudiá español en inmersión en ${nombre}, ${zona}. Contanos cuánto tiempo planeás quedarte y te decimos qué escuela te sirve.`,
      };
  }
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
    de: {
      titulo: "Online-Spanischunterricht",
      descripcion:
        "Costa-ricanischer Spanischunterricht per Video, mit Terminen für Europa und Amerika und Preisen ohne Kleingedrucktes.",
    },
    fr: {
      titulo: "Cours d'espagnol en ligne",
      descripcion:
        "Cours d'espagnol costaricien individuels par vidéo, avec des créneaux adaptés à l'Europe et aux Amériques, sans petits caractères.",
    },
  },
  /*
   * Una sola entrada para lo que antes eran dos páginas.
   *
   * El título carga los dos términos por los que busca la gente que está
   * planeando esto —aprender español y Costa Rica— y la descripción dice las
   * tres patas: clase, hospedaje y viaje. Los nombres de los destinos NO van
   * aquí: el cliente todavía está cerrando cuáles son, y un metadato que
   * promete cuatro sitios concretos se queda mintiendo en cuanto cambie uno.
   */
  costaRica: {
    es: {
      titulo: "Aprendé español viajando por Costa Rica",
      descripcion:
        "Clase por la mañana en una escuela del lugar, el hospedaje resuelto y el resto del día practicando por el país. Inmersión de quince días a dos meses.",
    },
    en: {
      titulo: "Learn Spanish travelling Costa Rica",
      descripcion:
        "A lesson each morning at a local school, lodging sorted, and the rest of the day practising around the country. Immersion from fifteen days to two months.",
    },
    de: {
      titulo: "Spanisch lernen auf Reisen durch Costa Rica",
      descripcion:
        "Vormittags Unterricht an einer Schule vor Ort, die Unterkunft organisiert, der Rest des Tages das ganze Land als Klassenzimmer. Von 15 Tagen bis zu zwei Monaten.",
    },
    /*
     * El título va sin «l'espagnol»: la elisión se escapa como `&#x27;` en el
     * HTML —seis caracteres en vez de uno— y ahí sí importaba, porque «en
     * voyageant» ya lo dejaba en el límite. «Apprends l'espagnol» se cambia
     * por un giro sin apóstrofo que dice lo mismo.
     */
    fr: {
      titulo: "Apprendre l'espagnol au Costa Rica",
      descripcion:
        "Un cours le matin dans une école locale, l'hébergement organisé, et le reste de la journée à pratiquer à travers le pays. Immersion de quinze jours à deux mois.",
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
    de: {
      titulo: "Frag nach deiner Immersion in Costa Rica",
      descripcion:
        "Sag uns das Reiseziel, wie lange du bleiben möchtest und warum du lernen willst, und wir sagen dir, welche Schule und welches Niveau zu dir passen.",
    },
    fr: {
      titulo: "Demande ton immersion au Costa Rica",
      descripcion:
        "Dis-nous la destination, combien de temps tu prévois de rester et pourquoi tu veux apprendre, et on te dira quelle école et quel niveau te conviennent.",
    },
  },
  /*
   * Estaba escrito dentro de la propia página y se trae aquí, que es donde
   * viven todos: juntos se ve de un vistazo que ninguno se repite, y Google
   * penaliza los títulos duplicados entre páginas de un mismo sitio.
   *
   * La descripción dice las tres cosas del proceso —franja, pago y enlace—
   * porque es exactamente lo que alguien quiere saber antes de entrar.
   */
  reservar: {
    es: {
      titulo: "Reservá tu clase de español",
      descripcion:
        "Elegí día y hora en tu zona horaria, apartá la clase con el depósito por PayPal y recibí el enlace de la videollamada por correo.",
    },
    en: {
      titulo: "Book your Spanish lesson",
      descripcion:
        "Pick a day and time in your own timezone, hold the lesson with a PayPal deposit, and get the video call link by email.",
    },
    de: {
      titulo: "Buche deine Spanischstunde",
      descripcion:
        "Wähle Tag und Uhrzeit in deiner Zeitzone, sichere die Stunde mit einer PayPal-Anzahlung und erhalte den Videolink per E-Mail.",
    },
    fr: {
      titulo: "Réserve ton cours d'espagnol",
      descripcion:
        "Choisis un jour et une heure dans ton fuseau horaire, réserve le cours avec un acompte PayPal et reçois le lien de l'appel vidéo par e-mail.",
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
    de: {
      titulo: "Preise für den Unterricht",
      descripcion:
        "Preise für Online- und Präsenzunterricht sowie für die Buchungsanzahlung. Keine erfundenen Zahlen, solange sie nicht bestätigt sind.",
    },
    fr: {
      titulo: "Tarifs des cours",
      descripcion:
        "Tarifs des cours d'espagnol en ligne et en présentiel, et de l'acompte de réservation. Aucun chiffre inventé tant qu'il n'est pas confirmé.",
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
    de: {
      titulo: "Community und Gesprächsgruppen",
      descripcion:
        "Gesprächsgruppen, die Social-Media-Konten der Schule und das vollständige Archiv der Tiquismos: costa-ricanische Ausdrücke, einzeln erklärt.",
    },
    fr: {
      titulo: "Communauté et groupes de conversation",
      descripcion:
        "Groupes de conversation, réseaux sociaux de l'école et archive complète des tiquismos : expressions costariciennes expliquées une à une.",
    },
  },
  creditos: {
    es: {
      titulo: "Créditos de las fotografías",
      descripcion:
        "Autoría y licencia de cada fotografía usada en el sitio: los paisajes de Unsplash y las fotos de clase cedidas por las escuelas socias.",
    },
    en: {
      titulo: "Photography credits",
      descripcion:
        "Authorship and licence of every photograph on this site: the landscapes from Unsplash and the classroom photos provided by the partner schools.",
    },
    de: {
      titulo: "Bildnachweise",
      descripcion:
        "Urheberschaft und Lizenz jedes Fotos auf dieser Website: die Landschaften von Unsplash und die von den Partnerschulen zur Verfügung gestellten Klassenzimmerfotos.",
    },
    fr: {
      titulo: "Crédits photographiques",
      descripcion:
        "Auteur et licence de chaque photographie de ce site : les paysages d'Unsplash et les photos de classe fournies par les écoles partenaires.",
    },
  },
  /*
   * Página nueva del 23/09/2026. El título no lleva el nombre del negocio
   * —lo añade `title.template` del layout— así que puede permitirse ser
   * directo: es literalmente la respuesta a «¿por qué esta escuela?».
   */
  about: {
    es: {
      /*
       * No «Quiénes somos» a secas: son 13 caracteres y el mínimo que exige
       * `verificar-metadatos.mjs` es 15. La etiqueta del menú sí puede ser
       * corta —no tiene ese límite—, pero el `<title>` no.
       */
      titulo: "Sobre esta escuela",
      descripcion:
        "Por qué existe Costa Rica Spanish Experience: profesores reales enseñando el español que de verdad se habla en Costa Rica, no el de los libros.",
    },
    en: {
      titulo: "About Costa Rica Spanish Experience",
      descripcion:
        "Why this school exists: real teachers teaching the Spanish that is actually spoken in Costa Rica, not the textbook version.",
    },
    de: {
      titulo: "Über Costa Rica Spanish Experience",
      descripcion:
        "Warum es diese Schule gibt: echte Lehrer unterrichten das Spanisch, das in Costa Rica wirklich gesprochen wird — nicht das aus dem Lehrbuch.",
    },
    fr: {
      titulo: "À propos de Costa Rica Spanish Experience",
      descripcion:
        "Pourquoi cette école existe : de vrais professeurs enseignent l'espagnol réellement parlé au Costa Rica, pas celui des manuels.",
    },
  },
};
