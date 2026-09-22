import { z } from "zod";
import { localizado } from "@/shared/lib/localizado";
import datos from "./data/clases.json";

/**
 * Las duraciones de clase que se pueden reservar.
 *
 * ============ POR QUÉ ESTO VIVE AQUÍ Y NO EN UNA VARIABLE DE ENTORNO ============
 * El enlace de Calendly estuvo en `NEXT_PUBLIC_CALENDLY_URL`, y con una sola
 * duración estaba bien. Dejó de estarlo en cuanto el cliente pidió varias —una
 * hora, dos, cinco—, por tres razones:
 *
 *   1. Ya NO es solo una URL. Cada opción lleva etiqueta, duración y una línea
 *      de para qué sirve. Eso es contenido, y el contenido del sitio va en
 *      `.json` validado, como los tiquismos o los destinos.
 *   2. Una lista no cabe en una variable de entorno sin meter JSON dentro de
 *      un string, que es frágil de escribir a mano y no avisa cuando está mal.
 *   3. El argumento que justificaba la variable —que cambia entre entornos—
 *      no aplica: la cuenta de Calendly es la misma en pruebas y en
 *      producción. `URL_BASE` sí cambia, y por eso se queda donde está.
 *
 * Los enlaces son públicos: los ve cualquiera que abra la página. No hay nada
 * que esconder en un `.env`.
 * ===============================================================================
 *
 * EN CALENDLY, cada duración es un «Event Type» aparte con su propio enlace.
 * ⚠️ El plan gratuito solo deja UNO activo a la vez. Varias duraciones exigen
 * plan de pago — que es el mismo que hace falta para cobrar el depósito.
 */
const CALENDLY = /^https:\/\/calendly\.com\/[\w-]+\/[\w-]+/;

const esquemaClase = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    /** Minutos. Se enseña en la tarjeta y ordena la lista. */
    duracion: z.number().int().min(15).max(600),
    etiqueta: localizado(z.string().min(3)),
    /** Una línea de para qué sirve esta duración y no otra. */
    descripcion: localizado(z.string().min(10)),
    /**
     * El enlace del tipo de evento. Se valida con el mismo patrón que usaba la
     * variable de entorno: un token o la URL del panel no pasan de aquí.
     */
    calendly: z.string().regex(CALENDLY, {
      message:
        "Tiene que ser el enlace de «Copy link» del tipo de evento (https://calendly.com/usuario/evento), no un token ni la URL del panel",
    }),
  })
  .strict();

export type Clase = z.infer<typeof esquemaClase>;

/**
 * Ordenadas por duración, no por el orden del archivo.
 *
 * Así quien edite el JSON puede añadir una opción al final sin pensar dónde va,
 * y la página siempre las enseña de la más corta a la más larga — que es el
 * orden en el que alguien las compara.
 */
export const CLASES: Clase[] = z
  .array(esquemaClase)
  .parse(datos)
  .sort((a, b) => a.duracion - b.duracion);
