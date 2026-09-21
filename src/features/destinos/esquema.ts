import { z } from "zod";
import { localizado } from "@/shared/lib/localizado";
import datos from "./data/destinos.json";

/**
 * Lugares de Costa Rica.
 *
 * ============ ESTO YA NO SON «SEDES DE CLASE» ============
 * Antes esta sección listaba los dos sitios donde se darían las clases
 * presenciales, y cada tarjeta llevaba un `disponible: false` con la etiqueta
 * de pendiente, porque el cliente no ha confirmado ninguna sede.
 *
 * La vía presencial ya no se anuncia por el sitio sino por el modo —cara a
 * cara, el dónde sigue por confirmar—, así que esa columna se quedó sin
 * significado. La sección pasa a ser lo que el cliente pidió: FICHAS DE
 * LUGARES TURÍSTICOS. Lo que hace es traer gente que está planeando el viaje,
 * que es exactamente la gente que después quiere aprender el idioma.
 *
 * Ninguna ficha promete una clase en ese lugar. Eso era lo que obligaba a la
 * etiqueta de pendiente y ya no hace falta.
 * =========================================================
 *
 * ============ EL HUECO PARA LOS ANUNCIOS PAGADOS ============
 * El cliente quiere poder vender estos espacios a hoteles y operadores más
 * adelante. El esquema lo contempla ya, por una razón concreta: un anuncio
 * pagado que no se distingue del contenido propio es publicidad encubierta, y
 * eso no es una cuestión de gusto sino de ley —en la UE, la Directiva de
 * Prácticas Comerciales Desleales; en Estados Unidos, las guías de
 * endorsements de la FTC—. Ese aviso no se puede añadir «después», porque
 * después es cuando se olvida.
 *
 * Así que la marca vive en el dato y no en el criterio de quien escriba la
 * ficha, y el `.refine()` de abajo hace imposible guardar un anuncio sin
 * anunciante o un anunciante sin marcar el anuncio. Hoy las cinco fichas son
 * contenido propio y todas llevan `patrocinado: false`.
 * ============================================================
 */
const esquemaDestino = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    nombre: z.string().min(1),
    /** Provincia o zona, para situar a quien no conoce el país. */
    zona: z.string().min(1),
    lema: localizado(z.string().min(3)),
    descripcion: localizado(z.string().min(40)),
    /**
     * Tres cosas concretas que ver o hacer.
     *
     * Exactamente tres, no «hasta tres»: la tarjeta las pinta en una lista de
     * alto fijo y con dos o con cinco la rejilla se descuadra. Y son HECHOS
     * —un parque, una catarata, una reserva—, nunca adjetivos de folleto.
     */
    destacados: localizado(z.array(z.string().min(3)).length(3)),
    foto: z.string().startsWith("/fotos/"),
    /** Obligatorio y no vacío: una foto sin alt es una barrera. */
    fotoAlt: localizado(z.string().min(10)),
    /** Si la ficha es un anuncio pagado. Ver la nota de arriba. */
    patrocinado: z.boolean(),
    /** Quién paga el anuncio. `null` en el contenido propio. */
    anunciante: z
      .object({ nombre: z.string().min(1), url: z.string().url() })
      .strict()
      .nullable(),
  })
  .strict()
  .refine((d) => d.patrocinado === (d.anunciante !== null), {
    message:
      "Un anuncio necesita anunciante, y un anunciante obliga a marcar el anuncio. Los dos campos van siempre juntos.",
    path: ["anunciante"],
  });

const esquemaDestinos = z.array(esquemaDestino).min(1);

export type Destino = z.infer<typeof esquemaDestino>;

export const DESTINOS: Destino[] = esquemaDestinos.parse(datos);
