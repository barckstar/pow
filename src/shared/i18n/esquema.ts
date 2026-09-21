import { z } from "zod";

/**
 * El hero de una página interior.
 *
 * Se declara UNA vez y se reutiliza en `/online` y en `/presencial`. Escrito
 * a mano en cada una, el día que se añada un campo —una segunda línea de
 * acento, un pie de foto— habría que acordarse de las dos, y el esquema
 * estricto solo avisaría de la que se editó.
 */
const esquemaHeroPagina = z
  .object({
    titulo: z.string().min(1),
    /** La segunda línea del titular, en color. */
    acento: z.string().min(1),
    subtitulo: z.string().min(1),
    /** Obligatorio: la foto del hero es contenido, no decoración. */
    fotoAlt: z.string().min(10),
  })
  .strict();

/**
 * Forma del diccionario de interfaz.
 *
 * Todo texto VISIBLE del sitio vive aquí o en un JSON de contenido. Ninguna
 * cadena se escribe a mano dentro de un componente: si no está en el
 * diccionario, no se puede traducir, y el día que entre alemán habría que
 * cazarla a grep.
 *
 * `.strict()` es intencional: una clave de más significa que alguien tradujo
 * algo que ya no existe, y eso también conviene saberlo.
 */
export const esquemaDiccionario = z
  .object({
    nav: z
      .object({
        inicio: z.string().min(1),
        online: z.string().min(1),
        presencial: z.string().min(1),
        destinos: z.string().min(1),
        blog: z.string().min(1),
        precios: z.string().min(1),
        comunidad: z.string().min(1),
        reservar: z.string().min(1),
        abrirMenu: z.string().min(1),
        cerrarMenu: z.string().min(1),
        cambiarIdioma: z.string().min(1),
      })
      .strict(),

    hero: z
      .object({
        titulo: z.string().min(1),
        /*
         * El titular lleva el acento partido en dos colores, como el
         * "Live Experiences." del concept board: la primera parte en naranja
         * y la segunda en teal.
         */
        tituloAcentoNaranja: z.string().min(1),
        tituloAcentoTeal: z.string().min(1),
        subtitulo: z.string().min(1),
        /** Los dos CTA del hero: una vía de negocio cada uno. */
        ctaOnline: z.string().min(1),
        ctaPresencial: z.string().min(1),
        /** CTA de reserva para el resto de páginas. */
        ctaReservar: z.string().min(1),
        insignia: z.string().min(1),
      })
      .strict(),

    experiencias: z
      .object({
        titulo: z.string().min(1),
        onlineTitulo: z.string().min(1),
        onlineTexto: z.string().min(1),
        onlineEnlace: z.string().min(1),
        presencialTitulo: z.string().min(1),
        presencialTexto: z.string().min(1),
        presencialEnlace: z.string().min(1),
      })
      .strict(),

    destinos: z
      .object({
        titulo: z.string().min(1),
        intro: z.string().min(1),
        verTodos: z.string().min(1),
        /** La etiqueta del aviso de anuncio pagado. Ver el esquema de
            destinos: el aviso es obligación legal, no cortesía. */
        anuncio: z.string().min(1),
        /** El botón de cada ficha, que lleva al formulario con ese destino. */
        solicitar: z.string().min(1),
        /** Rótulo de la segunda foto, la de la clase. */
        enClase: z.string().min(1),
        /** Se antepone al nombre de la escuela socia. */
        escuela: z.string().min(1),
      })
      .strict(),

    confianza: z
      .object({
        profesorTitulo: z.string().min(1),
        profesorTexto: z.string().min(1),
        horarioTitulo: z.string().min(1),
        horarioTexto: z.string().min(1),
        reservaTitulo: z.string().min(1),
        reservaTexto: z.string().min(1),
        culturaTitulo: z.string().min(1),
        culturaTexto: z.string().min(1),
      })
      .strict(),

    tiquismo: z
      .object({
        etiqueta: z.string().min(1),
        significa: z.string().min(1),
        ejemplo: z.string().min(1),
        leerMas: z.string().min(1),
      })
      .strict(),

    faq: z
      .object({
        titulo: z.string().min(1),
        intro: z.string().min(1),
      })
      .strict(),

    blog: z
      .object({
        titulo: z.string().min(1),
        intro: z.string().min(1),
        leer: z.string().min(1),
        minutos: z.string().min(1),
        etiquetas: z.string().min(1),
        vacio: z.string().min(1),
        anterior: z.string().min(1),
        siguiente: z.string().min(1),
        publicado: z.string().min(1),
        actualizado: z.string().min(1),
        tambienEn: z.string().min(1),
      })
      .strict(),

    reserva: z
      .object({
        titulo: z.string().min(1),
        intro: z.string().min(1),
        tipoClase: z.string().min(1),
        fecha: z.string().min(1),
        hora: z.string().min(1),
        zonaHoraria: z.string().min(1),
        tuHora: z.string().min(1),
        horaCostaRica: z.string().min(1),
        sinFranjas: z.string().min(1),
        cargando: z.string().min(1),
        error: z.string().min(1),
        continuar: z.string().min(1),
        deposito: z.string().min(1),
        depositoTexto: z.string().min(1),
        pagoSeguro: z.string().min(1),
      })
      .strict(),

    pendiente: z
      .object({
        etiqueta: z.string().min(1),
        precio: z.string().min(1),
        generico: z.string().min(1),
      })
      .strict(),

    footer: z
      .object({
        lema: z.string().min(1),
        navegacion: z.string().min(1),
        legal: z.string().min(1),
        privacidad: z.string().min(1),
        terminos: z.string().min(1),
        creditosFotos: z.string().min(1),
        derechos: z.string().min(1),
      })
      .strict(),

    social: z
      .object({
        compartir: z.string().min(1),
        copiado: z.string().min(1),
        seguir: z.string().min(1),
      })
      .strict(),

    comun: z
      .object({
        volverInicio: z.string().min(1),
        noEncontrado: z.string().min(1),
        noEncontradoTexto: z.string().min(1),
        saltarAlContenido: z.string().min(1),
      })
      .strict(),

    paginas: z
      .object({
        online: z
          .object({
            hero: esquemaHeroPagina,
            titulo: z.string().min(1),
            intro: z.string().min(1),
            pasosTitulo: z.string().min(1),
            paso1Titulo: z.string().min(1),
            paso1Texto: z.string().min(1),
            paso2Titulo: z.string().min(1),
            paso2Texto: z.string().min(1),
            paso3Titulo: z.string().min(1),
            paso3Texto: z.string().min(1),
            profesorTitulo: z.string().min(1),
            profesorTexto: z.string().min(1),
          })
          .strict(),
        presencial: z
          .object({
            hero: esquemaHeroPagina,
            titulo: z.string().min(1),
            intro: z.string().min(1),
            texto: z.string().min(1),
            /** Dónde se dan. Es el dato que el cliente no ha confirmado, así
                que la sección existe para DECIR que no está confirmado. */
            dondeTitulo: z.string().min(1),
            dondeTexto: z.string().min(1),
          })
          .strict(),
        destinos: z
          .object({ titulo: z.string().min(1), intro: z.string().min(1) })
          .strict(),
        solicitud: z
          .object({
            titulo: z.string().min(1),
            /** Con destino elegido: se le pega el nombre detrás. */
            tituloCon: z.string().min(1),
            intro: z.string().min(1),
            destino: z.string().min(1),
            nombre: z.string().min(1),
            edad: z.string().min(1),
            idiomas: z.string().min(1),
            idiomasAyuda: z.string().min(1),
            telefono: z.string().min(1),
            correo: z.string().min(1),
            estancia: z.string().min(1),
            motivo: z.string().min(1),
            /** Primera opción de los desplegables. */
            elegir: z.string().min(1),
            enviar: z.string().min(1),
            avisoTitulo: z.string().min(1),
            avisoTexto: z.string().min(1),
            privacidad: z.string().min(1),
          })
          .strict(),
        precios: z
          .object({
            titulo: z.string().min(1),
            intro: z.string().min(1),
            sinPrecios: z.string().min(1),
          })
          .strict(),
        comunidad: z
          .object({
            titulo: z.string().min(1),
            intro: z.string().min(1),
            sinRedes: z.string().min(1),
            archivoTitulo: z.string().min(1),
          })
          .strict(),
        creditos: z
          .object({
            titulo: z.string().min(1),
            intro: z.string().min(1),
            foto: z.string().min(1),
            /** Para las fotos cedidas cuyo permiso aún no está por escrito. */
            permisoPendiente: z.string().min(1),
          })
          .strict(),
      })
      .strict(),
  })
  .strict();

export type Diccionario = z.infer<typeof esquemaDiccionario>;
