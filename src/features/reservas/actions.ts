"use server";

import { esquemaLead, type EstadoLead } from "./lead";

// El correo lo lee Chris, en español, aunque el sitio ya no lo tenga como idioma.
const ETIQUETA_MOTIVO: Record<string, string> = {
  idiomas: "Pasión por los idiomas",
  trabajo: "Trabajo",
  viajes: "Viajes",
  cultura: "Cultura",
  familia: "Familia",
};

const ETIQUETA_NIVEL = {
  cero: "Principiante total",
  basico: "Algo básico",
  medio: "Intermedio",
  avanzado: "Avanzado",
} as const;

const ETIQUETA_PREFERENCIA = {
  whatsapp: "WhatsApp",
  llamada: "Llamada",
  correo: "Correo",
} as const;

const ETIQUETA_HORA = {
  manana: "Mañana",
  tarde: "Tarde",
  noche: "Noche",
} as const;

const ETIQUETA_MODALIDAD = {
  online: "Clases online",
  "costa-rica": "Aprender en Costa Rica",
  "no-se": "Todavía no lo sabe",
} as const;

/**
 * Verifica el captcha en el servidor. El token del navegador por sí solo no
 * prueba nada: hay que preguntarle a Cloudflare si es válido.
 */
async function captchaValido(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
    },
  );
  if (!res.ok) return false;
  const datos = (await res.json()) as { success?: boolean };
  return datos.success === true;
}

/** Fuera saltos de línea: lo que se copia al asunto no puede abrir cabeceras. */
const linea = (s: string) => s.replace(/[\r\n]+/g, " ");

export async function enviarReserva(
  _anterior: EstadoLead,
  formData: FormData,
): Promise<EstadoLead> {
  // Honeypot: un humano no ve este campo. Se responde "ok" para no enseñarle
  // al bot que fue detectado.
  if (formData.get("sitioweb")) return "ok";

  const campos = esquemaLead.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    correo: formData.get("correo"),
    motivo: formData.get("motivo"),
    modalidad: formData.get("modalidad"),
    nivel: formData.get("nivel"),
    preferencia: formData.get("preferencia"),
    hora: formData.get("hora"),
    pais: formData.get("pais"),
    mensaje: formData.get("mensaje") || undefined,
    consentimiento: formData.get("consentimiento"),
  });
  if (!campos.success) return "invalido";

  const token = String(formData.get("cf-turnstile-response") ?? "");
  if (!(await captchaValido(token))) return "captcha";

  const clave = process.env.RESEND_API_KEY;
  const destino = process.env.CORREO_DESTINO;
  if (!clave || !destino) {
    console.error("Faltan RESEND_API_KEY o CORREO_DESTINO");
    return "error";
  }

  const l = campos.data;
  const motivo = ETIQUETA_MOTIVO[l.motivo] ?? l.motivo;
  const idioma = String(formData.get("idioma") ?? "");

  const texto = [
    `Nombre: ${l.nombre}`,
    `Teléfono: ${l.telefono}`,
    `Correo: ${l.correo}`,
    `País: ${l.pais}`,
    `Prefiere que lo contacten por: ${ETIQUETA_PREFERENCIA[l.preferencia]}`,
    `Mejor hora para llamar: ${ETIQUETA_HORA[l.hora]} (hora de su país)`,
    `Nivel de español: ${ETIQUETA_NIVEL[l.nivel]}`,
    `Modalidad: ${ETIQUETA_MODALIDAD[l.modalidad]}`,
    `Motivo: ${motivo}`,
    `Idioma del sitio: ${idioma}`,
    "",
    l.mensaje ? `Mensaje:\n${l.mensaje}` : "(sin mensaje)",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clave}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.CORREO_ORIGEN ??
          "Costa Rica Spanish <onboarding@resend.dev>",
        to: [destino],
        reply_to: l.correo,
        subject: `Nueva reserva: ${linea(l.nombre)}`,
        text: texto,
      }),
    });
    if (!res.ok) {
      console.error("Resend", res.status, await res.text());
      return "error";
    }
    return "ok";
  } catch (e) {
    console.error("Resend", e);
    return "error";
  }
}
