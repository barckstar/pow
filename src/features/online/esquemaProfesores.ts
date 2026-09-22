import { z } from "zod";
import { localizado } from "@/shared/lib/localizado";
import datos from "./data/profesores.json";

/**
 * Quién da las clases.
 *
 * ============ UNA LISTA, AUNQUE HOY SEA UNO ============
 * Hoy está Chris Pow y nadie más. Es una lista igualmente porque el cliente lo
 * dijo así —«por el momento solo tenemos a Chris»— y porque la diferencia
 * entre un objeto y un array de uno es esta línea, mientras que cambiarlo
 * después toca el esquema, el componente, la hoja de estilos y los dos
 * diccionarios.
 *
 * La rejilla ya está hecha para varios: con uno sale una ficha ancha —retrato
 * a un lado, texto al otro— y con dos o tres se reparten en columnas sin tocar
 * nada. Es `auto-fit`, no un número escrito a mano.
 * =======================================================
 *
 * ============ POR QUÉ AQUÍ Y NO EN `sitio.ts` ============
 * Estuvo un rato en `sitio.ts`, y estaba mal puesto: `papel`, `bio` y las
 * etiquetas de los datos van en DOS IDIOMAS, y el contenido bilingüe de este
 * sitio vive en `.json` validado al importar. En TypeScript no se traduce sin
 * escribir el idioma a mano en el componente, que es justo lo que esa regla
 * evita.
 *
 * Lo que sí se queda en `sitio.ts` es `ZONA_PROFESOR`: no es contenido, no se
 * traduce, y lo usan también `/reservar` y el cálculo de horarios.
 * =========================================================
 */
const esquemaProfesor = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    /** Nombre propio. No se traduce, por razones obvias. */
    nombre: z.string().min(1),
    /**
     * La ruta del retrato dentro de `public/`, o `null` mientras no haya.
     *
     * Con `null` la ficha pinta el marco con su aviso en vez de esconderse:
     * un hueco visible se arregla, uno invisible se publica. El marco reserva
     * su tamaño en los dos casos, así que el día que entre la foto no se mueve
     * nada — el CLS del sitio es 0 por construcción.
     *
     * Va **retrato**: el hueco está cortado a 4:5 y una apaisada se recorta
     * por los lados.
     */
    foto: z.string().startsWith("/").nullable(),
    /** La línea de encima del nombre. Corta: es una etiqueta, no un cargo. */
    papel: localizado(z.string().min(1)),
    bio: localizado(z.string().min(1)),
    /**
     * Los tres datos sueltos de la ficha.
     *
     * Son RESÚMENES de lo que ya dice la biografía, no datos nuevos: de dónde
     * es, desde dónde enseña y qué enseña. Nada que el cliente no haya
     * confirmado. El tope de cuatro no es capricho — a partir de ahí la fila
     * se parte en móvil y deja de leerse como un vistazo.
     */
    datos: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9-]+$/),
            etiqueta: localizado(z.string().min(1)),
          })
          .strict()
      )
      .min(1)
      .max(4),
  })
  .strict();

export type Profesor = z.infer<typeof esquemaProfesor>;

export const PROFESORES = z.array(esquemaProfesor).min(1).parse(datos);
