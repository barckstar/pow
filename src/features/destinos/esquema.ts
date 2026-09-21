import { z } from "zod";
import { localizado } from "@/shared/lib/localizado";
import datos from "./data/destinos.json";

/**
 * Los cuatro destinos de inmersión en Costa Rica.
 *
 * ============ QUÉ SON AHORA Y QUÉ FUERON ============
 * Pasaron por tres formas en una semana, y conviene saber por qué está en la
 * tercera:
 *
 *   1. SEDES DE CLASE del profesor. Se descartó porque no había ninguna
 *      confirmada y cada tarjeta acababa con una etiqueta de pendiente.
 *   2. FICHAS TURÍSTICAS sueltas, sin relación con las clases.
 *   3. LA PUERTA DE ENTRADA DE LA VÍA PRESENCIAL, que es lo que el cliente
 *      aclaró que son: cuatro sitios de Costa Rica donde hay escuelas de
 *      inmersión socias, y donde cada tarjeta lleva al formulario de solicitud
 *      con ese destino ya elegido.
 *
 * Por eso cada destino tiene DOS fotografías y no una: el atractivo —playa,
 * volcán, ciudad— y una clase de verdad en ese sitio. La primera es la razón
 * para viajar y la segunda es la prueba de que ahí se estudia. Una sola de las
 * dos vende la mitad.
 * =====================================================
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

    /** El atractivo: la razón para elegir ese destino y no otro. */
    foto: z.string().startsWith("/fotos/"),
    /** Obligatorio y no vacío: una foto sin alt es una barrera. */
    fotoAlt: localizado(z.string().min(10)),

    /** Una clase de verdad en ese sitio. La entregó el cliente. */
    fotoClase: z.string().startsWith("/fotos/"),
    fotoClaseAlt: localizado(z.string().min(10)),

    /**
     * La escuela socia.
     *
     * ============ `confirmada` ES EL DATO, NO UN ADORNO ============
     * El cliente escribió, con estas palabras, que «la info de las escuelas en
     * CR tengo que conseguirla bien». O sea: los nombres están, el acuerdo no.
     *
     * Anunciar una escuela con la que no hay acuerdo firmado es exactamente el
     * tipo de dato inventado que `PENDIENTE.md` prohíbe, y además es el que
     * más caro sale: la escuela existe y puede leerlo.
     *
     * Así que el nombre se guarda —es información real que dio el cliente— y
     * mientras `confirmada` sea `false` la tarjeta lo dice con la etiqueta
     * amarilla en vez de presentarlo como un hecho.
     * ==============================================================
     */
    escuela: z
      .object({
        nombre: z.string().min(1),
        confirmada: z.boolean(),
      })
      .strict()
      .nullable(),

    /**
     * Si la ficha es un anuncio pagado de un tercero.
     *
     * Hoy ninguna lo es, y el hueco sigue aquí porque el cliente quiere poder
     * vender estos espacios a hoteles y operadores. Un anuncio pagado que no
     * se distingue del contenido propio es publicidad encubierta, y eso no es
     * cuestión de gusto sino de ley —Directiva de Prácticas Comerciales
     * Desleales en la UE, guías de endorsements de la FTC en Estados Unidos—.
     * Ese aviso no se puede añadir «después», porque después es cuando se
     * olvida.
     */
    patrocinado: z.boolean(),
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

/** Los identificadores válidos, para validar el `?destino=` del formulario. */
export const IDS_DESTINO = DESTINOS.map((d) => d.id);

export function esDestino(id: string | undefined): id is string {
  return typeof id === "string" && IDS_DESTINO.includes(id);
}
