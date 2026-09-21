import { z } from "zod";
import { localizado } from "@/shared/lib/localizado";
import datos from "./data/clases.json";

/**
 * Qué se practica en una clase en línea, en qué situaciones y por qué.
 *
 * ============ NO SON INVENTADAS ============
 * Las tres listas salen del artículo que escribió el cliente («Why Online
 * Spanish Classes Are the Smartest Way to Learn Spanish in 2026»), que también
 * está publicado en el blog. Se transcriben, no se amplían: si mañana él añade
 * una situación, se añade aquí y sale a la vez en la página y en el artículo.
 *
 * Viven en un `.json` validado y no escritas en el componente por la regla de
 * siempre: así se traducen, se revisan de un vistazo y un dato malo rompe el
 * build en vez de aparecer vacío en el teléfono de alguien.
 * ===========================================
 */
const esquemaEtiqueta = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    etiqueta: localizado(z.string().min(1)),
  })
  .strict();

const esquemaClases = z
  .object({
    /** Las cuatro cosas en las que carga el peso la clase. */
    habilidades: z.array(esquemaEtiqueta).min(2),
    /** Las situaciones que se ensayan. */
    situaciones: z.array(esquemaEtiqueta).min(2),
    /** Por qué aprende la gente. Ordena la sección de personalización. */
    motivos: z.array(esquemaEtiqueta).min(2),
  })
  .strict();

export type Etiqueta = z.infer<typeof esquemaEtiqueta>;

export const CLASES = esquemaClases.parse(datos);
