"use server";

import { esquemaLead, type EstadoLead } from "./lead";
import { captchaValido, enviarCorreo, linea } from "@/shared/lib/correo";

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

  return enviarCorreo({
    asunto: `Nueva reserva: ${linea(l.nombre)}`,
    texto,
    responderA: l.correo,
  });
}
