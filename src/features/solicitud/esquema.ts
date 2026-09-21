import { z } from "zod";
import { localizado } from "@/shared/lib/localizado";
import datos from "./data/opciones.json";

/**
 * Las opciones de los dos desplegables del formulario de solicitud.
 *
 * Las dictó el cliente y se transcriben tal cual: quince días, un mes, mes y
 * medio o dos meses; y pasión por los idiomas, trabajo, viajes, cultura o
 * familia. No se añaden ni se reordenan sin que él lo pida — son las opciones
 * con las que va a clasificar a la gente que escriba.
 *
 * Viven en un `.json` validado y no escritas en el componente por la misma
 * regla que el resto del contenido: así se traducen, se revisan de un vistazo
 * y un dato malo rompe el build en vez de aparecer vacío en el teléfono de
 * alguien.
 */
const esquemaOpcion = z
  .object({
    /** Lo que viajaría en el envío. Estable aunque cambie la etiqueta. */
    id: z.string().regex(/^[a-z0-9-]+$/),
    etiqueta: localizado(z.string().min(1)),
  })
  .strict();

const esquemaOpciones = z
  .object({
    estancia: z.array(esquemaOpcion).min(2),
    motivo: z.array(esquemaOpcion).min(2),
  })
  .strict();

export type Opcion = z.infer<typeof esquemaOpcion>;

export const OPCIONES = esquemaOpciones.parse(datos);
