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
        /** Una sola entrada: `/presencial` y `/destinos` son la misma pagina. */
        costaRica: z.string().min(1),
        /** Página nueva, agregada el 23/09/2026. Contenido inventado a falta
            de que el cliente redacte el suyo — ver `paginas.about`. */
        about: z.string().min(1),
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
        /* Los tres pasos del proceso, que ahora corre Calendly entero. */
        paso1Titulo: z.string().min(1),
        paso1Texto: z.string().min(1),
        paso2Titulo: z.string().min(1),
        paso2Texto: z.string().min(1),
        paso3Titulo: z.string().min(1),
        paso3Texto: z.string().min(1),
        /** Encabeza el selector cuando hay varias. */
        duracionTitulo: z.string().min(1),
        /** Sufijo de los minutos en cada tarjeta. */
        duracionMin: z.string().min(1),
        /** Para volver al selector desde el calendario. */
        duracionCambiar: z.string().min(1),
        /** Bajo el esqueleto, mientras Calendly pinta. */
        cargando: z.string().min(1),
        /** La salida a calendly.com, bajo la caja. */
        alternativa: z.string().min(1),
        /** La etiqueta de ese enlace. */
        alternativaEnlace: z.string().min(1),
        /** Quién es Calendly y qué recibe. Se lee ANTES de cargarlo. */
        avisoTerceros: z.string().min(1),
        /** Título accesible del iframe que monta Calendly. */
        tituloWidget: z.string().min(1),
        /* Mientras no haya cuenta de Calendly. */
        pendienteTitulo: z.string().min(1),
        pendienteTexto: z.string().min(1),
        /* Los usa `/precios` para el depósito y `/online` para la zona. */
        zonaHoraria: z.string().min(1),
        deposito: z.string().min(1),
        depositoTexto: z.string().min(1),
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
            /** La línea bajo el título de la franja. */
            profesorEntrada: z.string().min(1),
            /** Plantilla del `alt` del retrato. Lleva `{nombre}` dentro. */
            profesorFotoAlt: z.string().min(1),
            /** Lo que dice el marco mientras no hay retrato. */
            profesorFotoPendiente: z.string().min(1),
            /* Lo que se practica y en qué situaciones. Las listas viven en
               `features/online/data/clases.json`; aquí solo los rótulos. */
            practicaTitulo: z.string().min(1),
            practicaTexto: z.string().min(1),
            situacionesTexto: z.string().min(1),
            medidaTitulo: z.string().min(1),
            medidaTexto: z.string().min(1),
            medidaCierre: z.string().min(1),
            /** Enlace al artículo del cliente sobre esto mismo. */
            leerArticulo: z.string().min(1),
          })
          .strict(),
        costaRica: z
          .object({
            hero: esquemaHeroPagina,
            /** Las tres patas de la oferta. */
            comoTitulo: z.string().min(1),
            comoIntro: z.string().min(1),
            claseTitulo: z.string().min(1),
            claseTexto: z.string().min(1),
            hospedajeTitulo: z.string().min(1),
            hospedajeTexto: z.string().min(1),
            viajeTitulo: z.string().min(1),
            viajeTexto: z.string().min(1),
            /** La sección de los destinos, dentro de esta misma página. */
            destinosTitulo: z.string().min(1),
            destinosIntro: z.string().min(1),
            /** Lo que todavía no está cerrado: la lista y las escuelas. */
            pendienteTitulo: z.string().min(1),
            pendienteTexto: z.string().min(1),
          })
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
            /** El chip del `FranjaHero`. */
            heroInsignia: z.string().min(1),
            titulo: z.string().min(1),
            intro: z.string().min(1),
            sinPrecios: z.string().min(1),
          })
          .strict(),
        comunidad: z
          .object({
            /** El chip del `FranjaHero`. */
            heroInsignia: z.string().min(1),
            titulo: z.string().min(1),
            /** La segunda línea del titular, en dorado. */
            acento: z.string().min(1),
            intro: z.string().min(1),
            /** La invitación al grupo de Facebook: ilustración, chip, título,
                texto, tres razones para entrar y el botón. Sustituye a la
                tarjeta blanca pequeña del 25/09/2026, que el cliente vio
                todavía sin fuerza para invitar a unirse. */
            facebookInsignia: z.string().min(1),
            facebookTitulo: z.string().min(1),
            facebookTexto: z.string().min(1),
            /** Exactamente tres: la rejilla está pensada para tres líneas
                cortas, y una cuarta ya es una lista que nadie lee. */
            facebookRazones: z.array(z.string().min(1)).length(3),
            /** El enlace visible al grupo de Facebook, cuando existe. */
            facebookEnlace: z.string().min(1),
            /** La línea pequeña bajo el botón: qué pasa al pulsarlo. */
            facebookNota: z.string().min(1),
            /** Lo que antes decía la entradilla —que vendrán grupos de
                conversación y otras cuentas— baja aquí, debajo de la
                invitación: es verdad y se dice, pero no es lo primero. */
            proximamente: z.string().min(1),
            /** Texto alternativo de la ilustración del perezoso surfista. */
            ilustracionAlt: z.string().min(1),
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
        /**
         * «Quiénes somos», agregada el 23/09/2026 a pedido del cliente.
         *
         * ============ CONTENIDO INVENTADO, Y MARCADO COMO TAL ============
         * El cliente lo dijo explícito: «aun no tenemos informacion asi que
         * puedes inventar». Es la única página del sitio con licencia para
         * eso — todo lo demás sigue la regla de no rellenar con suposiciones
         * lo que el cliente no ha confirmado.
         *
         * Aun así lleva su propio aviso de pendiente al cierre
         * (`cierrePendiente`), por la misma razón que el resto del sitio: un
         * hueco visible se arregla, uno invisible se publica. Aquí el hueco
         * es texto de mentira que puede acabar citado como si fuera la
         * historia real de un negocio real.
         * ==================================================================
         */
        about: z
          .object({
            heroTitulo: z.string().min(1),
            /** La segunda línea del titular, en color. */
            heroAcento: z.string().min(1),
            heroSubtitulo: z.string().min(1),
            /** Chip corto encima del titular. */
            heroInsignia: z.string().min(1),
            historiaTitulo: z.string().min(1),
            historiaTexto1: z.string().min(1),
            historiaTexto2: z.string().min(1),
            /** Cita destacada, aparte del cuerpo. */
            historiaCita: z.string().min(1),
            valoresTitulo: z.string().min(1),
            valoresIntro: z.string().min(1),
            valor1Titulo: z.string().min(1),
            valor1Texto: z.string().min(1),
            valor2Titulo: z.string().min(1),
            valor2Texto: z.string().min(1),
            valor3Titulo: z.string().min(1),
            valor3Texto: z.string().min(1),
            valor4Titulo: z.string().min(1),
            valor4Texto: z.string().min(1),
            cierreTitulo: z.string().min(1),
            cierreTexto: z.string().min(1),
            cierreCta: z.string().min(1),
            /** El aviso de que esta página es un primer boceto. */
            cierrePendiente: z.string().min(1),
          })
          .strict(),
      })
      .strict(),
  })
  .strict();

export type Diccionario = z.infer<typeof esquemaDiccionario>;
