import { z } from "zod";
import { IDS_DESTINO } from "@/features/destinos/esquema";
import { OPCIONES } from "./esquema";

/**
 * La solicitud de inmersión que deja alguien en `/apply`.
 *
 * Los campos son los que dictó el cliente. Solo son obligatorios el destino, el
 * nombre y el correo —sin eso no hay a quién contestar—; el resto ayuda a
 * decidir qué escuela y qué nivel encajan, pero no es motivo para perder a
 * alguien que no quiere rellenarlo todo.
 */
const ESTANCIAS = OPCIONES.estancia.map((o) => o.id) as [string, ...string[]];
const MOTIVOS = OPCIONES.motivo.map((o) => o.id) as [string, ...string[]];

/** `""` llega de un campo sin rellenar: es «no contestó», no un valor. */
const opcional = <T extends z.ZodTypeAny>(esquema: T) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), esquema.optional());

export const esquemaSolicitud = z.object({
  destino: z.enum(IDS_DESTINO as [string, ...string[]]),
  nombre: z.string().trim().min(2).max(100),
  correo: z.string().trim().max(120).pipe(z.email()),
  edad: opcional(z.coerce.number().int().min(5).max(110)),
  // Sin formato fijo: los teléfonos internacionales no tienen uno.
  telefono: opcional(
    z
      .string()
      .trim()
      .min(6)
      .max(30)
      .regex(/^[+\d\s().-]+$/),
  ),
  idiomas: opcional(z.string().trim().max(200)),
  estancia: opcional(z.enum(ESTANCIAS)),
  motivo: opcional(z.enum(MOTIVOS)),
  /** Casilla marcada llega como "on". Sin ella no se envía nada. */
  consentimiento: z.literal("on"),
});

export type Solicitud = z.infer<typeof esquemaSolicitud>;

/** Lo que devuelve la acción; el cliente lo traduce a texto. */
export type EstadoSolicitud =
  | "inicial"
  | "ok"
  | "invalido"
  | "captcha"
  | "error";
