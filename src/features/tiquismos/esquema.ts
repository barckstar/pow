import { z } from "zod";
import { localizado } from "@/shared/lib/localizado";
import datos from "./data/tiquismos.json";

/**
 * Un "tiquismo" es una expresión propia del español de Costa Rica.
 *
 * Es el componente firma del sitio: lo que separa "aprendé español" de
 * "aprendé el español que se habla en Costa Rica". Cada entrada tiene que ser
 * una expresión real y de uso corriente — no se inventan ni se exageran, que
 * un extranjero las va a usar delante de ticos.
 */
const esquemaTiquismo = z
  .object({
    /** Identificador estable; también es el ancla en la página. */
    id: z.string().regex(/^[a-z0-9-]+$/, "solo minúsculas, números y guiones"),
    /** La expresión tal cual se dice. */
    expresion: z.string().min(1),
    /** Pronunciación aproximada, para quien aún no lee español con fluidez. */
    pronunciacion: z.string().min(1),
    significado: localizado(z.string().min(10)),
    /** Frase de ejemplo, siempre en español: es lo que se va a oír. */
    ejemplo: z.string().min(5),
    /** Qué quiere decir esa frase, en cada idioma. */
    ejemploExplicado: localizado(z.string().min(5)),
    /** Slug del artículo del blog que lo desarrolla, si existe. */
    articulo: z.string().nullable(),
  })
  .strict();

const esquemaTiquismos = z
  .array(esquemaTiquismo)
  .min(1)
  .superRefine((lista, ctx) => {
    const vistos = new Set<string>();
    for (const [indice, tiquismo] of lista.entries()) {
      if (vistos.has(tiquismo.id)) {
        ctx.addIssue({
          code: "custom",
          path: [indice, "id"],
          message: `id repetido: "${tiquismo.id}"`,
        });
      }
      vistos.add(tiquismo.id);
    }
  });

export type Tiquismo = z.infer<typeof esquemaTiquismo>;

/**
 * El parseo corre al importar el módulo, es decir durante el build: un dato
 * malo rompe la compilación en vez de aparecer vacío en el teléfono de un
 * visitante.
 */
export const TIQUISMOS: Tiquismo[] = esquemaTiquismos.parse(datos);
