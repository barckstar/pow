import { z } from "zod";

/**
 * Frontmatter de un artículo.
 *
 * Se valida de verdad, no solo "es un string": el `resumen` tiene que caber
 * en el rango que exige una meta description, y `traduccion` tiene que
 * apuntar a un archivo que exista (eso se comprueba en `leer.ts`, donde se
 * conoce el conjunto completo de slugs).
 *
 * Un artículo mal escrito rompe el build. Es el momento correcto para
 * enterarse: el alternativo es que Google indexe una descripción cortada.
 */
export const esquemaFrontmatter = z
  .object({
    /**
     * 44 caracteres es el techo real: el <title> le añade " | Costa Rica
     * Spanish" (21) y el total tiene que caber en los 65 que muestran los
     * buscadores. `scripts/verificar-metadatos.mjs` lo comprueba sobre el
     * HTML generado; este límite lo caza antes, al escribir el artículo.
     */
    titulo: z.string().min(10).max(44),
    /**
     * Alimenta la meta description. Google recorta por debajo de ~70 y por
     * encima de ~165 caracteres, así que el rango no es decorativo.
     */
    resumen: z.string().min(70).max(165),
    fecha: z.coerce.date(),
    actualizado: z.coerce.date().optional(),
    portada: z.string().startsWith("/").optional(),
    portadaAlt: z.string().min(10).optional(),
    etiquetas: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1).max(5),
    /** Slug del par en el otro idioma. Se verifica que exista al leer. */
    traduccion: z.string().regex(/^[a-z0-9-]+$/).optional(),
    borrador: z.boolean().default(false),
  })
  .strict()
  .refine((d) => !d.portada || Boolean(d.portadaAlt), {
    message: "Una portada sin `portadaAlt` deja la imagen sin texto alternativo",
    path: ["portadaAlt"],
  })
  .refine((d) => !d.actualizado || d.actualizado >= d.fecha, {
    message: "`actualizado` no puede ser anterior a `fecha`",
    path: ["actualizado"],
  });

export type Frontmatter = z.infer<typeof esquemaFrontmatter>;

export type Articulo = Frontmatter & {
  slug: string;
  /** Cuerpo en Markdown, sin el frontmatter. */
  cuerpo: string;
  /** Minutos de lectura, calculados del texto real. */
  minutos: number;
};
