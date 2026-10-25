import { z } from "zod";
import { localizado } from "@/shared/lib/localizado";
import datos from "./data/intereses.json";

/**
 * Los tipos de voluntariado por los que se puede preguntar, tal como los
 * dictó el cliente el 23/10/2026.
 *
 * `otro` es especial: abre un campo de texto y lo vuelve obligatorio. Es la
 * única opción que el código reconoce por su id; el resto son datos.
 */
const esquemaInteres = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    etiqueta: localizado(z.string().min(1)),
  })
  .strict();

export const INTERESES = z.array(esquemaInteres).min(2).parse(datos);

export type Interes = z.infer<typeof esquemaInteres>;

export const ID_OTRO = "otro";

const IDS = INTERESES.map((i) => i.id) as [string, ...string[]];

/**
 * El interés por el voluntariado que deja alguien en `/volunteer`.
 *
 * El formulario pide lo justo para poder responder y para saber qué programas
 * encajan: la EDAD no es curiosidad, es lo que decide a qué programas puede
 * apuntarse alguien, porque cada organización pone el suyo.
 */
export const esquemaVoluntario = z
  .object({
    nombre: z.string().trim().min(2).max(100),
    correo: z.string().trim().max(120).pipe(z.email()),
    // Sin formato fijo: los teléfonos internacionales no tienen uno.
    telefono: z
      .string()
      .trim()
      .min(6)
      .max(30)
      .regex(/^[+\d\s().-]+$/),
    edad: z.coerce.number().int().min(10).max(110),
    intereses: z.array(z.enum(IDS)).min(1),
    /** Solo cuenta si marcó «Other». */
    otro: z.string().trim().max(200).optional(),
    sobreTi: z.string().trim().max(1000).optional(),
    /** Casilla marcada llega como "on". Sin ella no se envía nada. */
    consentimiento: z.literal("on"),
  })
  .refine((v) => !v.intereses.includes(ID_OTRO) || Boolean(v.otro), {
    path: ["otro"],
    message: "Falta decir cuál es el «otro»",
  });

export type Voluntario = z.infer<typeof esquemaVoluntario>;

/** Lo que devuelve la acción; el cliente lo traduce a texto. */
export type EstadoVoluntario =
  | "inicial"
  | "ok"
  | "invalido"
  | "captcha"
  | "error";
