import { z } from "zod";
import { OPCIONES } from "@/features/solicitud/esquema";

/**
 * El contacto que deja alguien en `/reservar`.
 *
 * Mientras no haya calendario, la reserva es un lead: Chris llama y agenda a
 * mano. Por eso el formulario pide lo justo para poder llamar y para decidir
 * de qué hablar cuando lo haga.
 *
 * El motivo reutiliza las opciones que dictó el cliente para `/solicitud`: son
 * las categorías con las que él clasifica a la gente.
 */
export const MODALIDADES = ["online", "costa-rica", "no-se"] as const;
export const NIVELES = ["cero", "basico", "medio", "avanzado"] as const;
export const PREFERENCIAS = ["whatsapp", "llamada", "correo"] as const;
export const HORAS = ["manana", "tarde", "noche"] as const;

const MOTIVOS = OPCIONES.motivo.map((o) => o.id) as [string, ...string[]];

export const esquemaLead = z.object({
  nombre: z.string().trim().min(2).max(100),
  // Sin formato fijo: los teléfonos internacionales no tienen uno.
  telefono: z
    .string()
    .trim()
    .min(6)
    .max(30)
    .regex(/^[+\d\s().-]+$/),
  correo: z.string().trim().max(120).pipe(z.email()),
  motivo: z.enum(MOTIVOS),
  modalidad: z.enum(MODALIDADES),
  nivel: z.enum(NIVELES),
  preferencia: z.enum(PREFERENCIAS),
  hora: z.enum(HORAS),
  pais: z.string().trim().min(2).max(60),
  mensaje: z.string().trim().max(1000).optional(),
  /** Casilla marcada llega como "on". Sin ella no se envía nada. */
  consentimiento: z.literal("on"),
});

export type Lead = z.infer<typeof esquemaLead>;

/** Lo que devuelve la acción; el cliente lo traduce a texto. */
export type EstadoLead = "inicial" | "ok" | "invalido" | "captcha" | "error";
