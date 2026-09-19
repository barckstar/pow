import { z } from "zod";
import { localizado } from "@/shared/lib/localizado";
import datos from "./data/faq.json";

/**
 * Preguntas frecuentes.
 *
 * Doble función: resuelven la duda antes de que alguien abandone, y son de lo
 * poco que Google muestra como resultado enriquecido. Por eso el JSON-LD de
 * `FAQPage` solo incluye las entradas con respuesta COMPLETA.
 */
const esquemaPregunta = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    pregunta: localizado(z.string().min(10)),
    respuesta: localizado(z.string().min(30)),
    /**
     * La respuesta depende de un dato que el cliente aún no ha confirmado.
     *
     * Estas se muestran con la etiqueta de pendiente y **quedan fuera del
     * JSON-LD**: Google exige que la respuesta esté completa, y marcar como
     * resultado enriquecido un "todavía no lo sabemos" es pedir una
     * penalización.
     */
    pendiente: z.boolean(),
  })
  .strict();

const esquemaFaq = z
  .array(esquemaPregunta)
  .min(1)
  .superRefine((lista, ctx) => {
    const vistos = new Set<string>();
    for (const [indice, p] of lista.entries()) {
      if (vistos.has(p.id)) {
        ctx.addIssue({
          code: "custom",
          path: [indice, "id"],
          message: `id repetido: "${p.id}"`,
        });
      }
      vistos.add(p.id);
    }
  });

export type Pregunta = z.infer<typeof esquemaPregunta>;

export const FAQ: Pregunta[] = esquemaFaq.parse(datos);
