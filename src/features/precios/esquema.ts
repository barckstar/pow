import { z } from "zod";
import { localizado } from "@/shared/lib/localizado";
import datos from "./data/paquetes.json";

/**
 * Los paquetes y precios que dictó el cliente el 23/09/2026 — «Pricing official
 * information to add in "Packages" tab».
 *
 * ============ UN PRECIO VIVE EN UN SOLO SITIO ============
 * La tabla comparativa del final NO repite las cifras: cada fila apunta por id
 * a una opción de las tarjetas y toma de ahí clases y precio. Con las cifras
 * escritas dos veces, el día que cambie una la otra se queda vieja sin que
 * nada falle, y en una página de precios eso es cobrar de menos o de más en la
 * puerta.
 *
 * El orden de la tabla sí es el del cliente —por curso, no por tarjeta—, y por
 * eso es una lista de ids aparte en vez de recorrer las tarjetas en orden.
 * ========================================================
 */
const id = z.string().regex(/^[a-z0-9-]+$/);
const texto = localizado(z.string().min(1));

const esquemaOpcion = z
  .object({
    id,
    /** «Full module», «2 people»… Opcional: el curso en grupo no lo lleva. */
    etiqueta: texto.optional(),
    clases: z.number().int().positive(),
    /** En euros. Sin céntimos: el cliente no los usa en ningún precio. */
    precio: z.number().positive(),
    /** Lo que va tras el número de clases: frecuencia, plazas, cuota por clase. */
    detalle: texto.optional(),
    /** El nombre de la fila en la tabla comparativa, si sale en ella. */
    fila: texto.optional(),
  })
  .strict();

const esquemaCurso = z
  .object({
    id,
    nombre: texto,
    /** MCER, por ejemplo «A1–A2». No se traduce: es un estándar. */
    nivel: z.string().min(1).optional(),
    subtitulo: texto.optional(),
    /** La cinta de la tarjeta: «Popular choice». */
    destacado: texto.optional(),
    descripcion: texto.optional(),
    opciones: z.array(esquemaOpcion).min(1),
  })
  .strict();

const esquemaGrupo = z
  .object({
    id,
    titulo: texto,
    intro: texto.optional(),
    nota: texto.optional(),
    cursos: z.array(esquemaCurso).min(1),
  })
  .strict();

const esquemaPaquetes = z
  .object({
    grupos: z.array(esquemaGrupo).min(1),
    /** Ids de opción, en el orden de la tabla. */
    comparacion: z.array(id).min(1),
    /** Las dos aclaraciones del cliente que van bajo la tabla. */
    notas: z.array(texto),
  })
  .strict()
  .superRefine((paquetes, ctx) => {
    const opciones = paquetes.grupos.flatMap((g) =>
      g.cursos.flatMap((c) => c.opciones),
    );
    const vistas = new Set<string>();
    for (const o of opciones) {
      if (vistas.has(o.id)) {
        ctx.addIssue({ code: "custom", message: `Opción repetida: ${o.id}` });
      }
      vistas.add(o.id);
    }
    for (const ref of paquetes.comparacion) {
      const opcion = opciones.find((o) => o.id === ref);
      if (!opcion) {
        ctx.addIssue({
          code: "custom",
          message: `La comparación apunta a «${ref}», que no existe`,
        });
      } else if (!opcion.fila) {
        ctx.addIssue({
          code: "custom",
          message: `«${ref}» sale en la tabla pero no tiene \`fila\``,
        });
      }
    }
  });

export type Opcion = z.infer<typeof esquemaOpcion>;
export type Curso = z.infer<typeof esquemaCurso>;
export type Grupo = z.infer<typeof esquemaGrupo>;

export const PAQUETES = esquemaPaquetes.parse(datos);

/** Las filas de la tabla comparativa, resueltas y en el orden del cliente. */
export function filasDeComparacion() {
  const opciones = PAQUETES.grupos.flatMap((g) =>
    g.cursos.flatMap((c) => c.opciones),
  );
  return PAQUETES.comparacion.map((ref) => {
    // `superRefine` ya garantizó que existe y que lleva `fila`.
    const o = opciones.find((x) => x.id === ref)!;
    return { id: o.id, fila: o.fila!, clases: o.clases, precio: o.precio };
  });
}
