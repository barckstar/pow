"use server";

import { captchaValido, enviarCorreo, linea } from "@/shared/lib/correo";
import {
  esquemaVoluntario,
  ID_OTRO,
  type EstadoVoluntario,
} from "./esquema";

// El correo lo lee Chris, en español, igual que el de `/book`.
const ETIQUETA_INTERES: Record<string, string> = {
  fauna: "Fauna y conservación animal",
  playas: "Limpieza de playas y protección ambiental",
  bienestar: "Salud mental y bienestar",
  social: "Asistencia social y apoyo comunitario",
  [ID_OTRO]: "Otro",
};

export async function enviarVoluntariado(
  _anterior: EstadoVoluntario,
  formData: FormData,
): Promise<EstadoVoluntario> {
  // Honeypot: un humano no ve este campo. Se responde "ok" para no enseñarle
  // al bot que fue detectado.
  if (formData.get("sitioweb")) return "ok";

  const campos = esquemaVoluntario.safeParse({
    nombre: formData.get("nombre"),
    correo: formData.get("correo"),
    telefono: formData.get("telefono"),
    edad: formData.get("edad"),
    intereses: formData.getAll("intereses"),
    otro: formData.get("otro") || undefined,
    sobreTi: formData.get("sobreTi") || undefined,
    consentimiento: formData.get("consentimiento"),
  });
  if (!campos.success) return "invalido";

  const token = String(formData.get("cf-turnstile-response") ?? "");
  if (!(await captchaValido(token))) return "captcha";

  const v = campos.data;
  const idioma = String(formData.get("idioma") ?? "");

  const texto = [
    `Nombre: ${v.nombre}`,
    `Correo: ${v.correo}`,
    `Teléfono: ${v.telefono}`,
    `Edad: ${v.edad}`,
    `Le interesa: ${v.intereses.map((i) => ETIQUETA_INTERES[i] ?? i).join("; ")}`,
    v.intereses.includes(ID_OTRO) ? `Otro: ${v.otro}` : null,
    `Idioma del sitio: ${idioma}`,
    "",
    v.sobreTi ? `Sobre la persona:\n${v.sobreTi}` : "(no escribió nada más)",
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  return enviarCorreo({
    asunto: `Interés en voluntariado: ${linea(v.nombre)}`,
    texto,
    responderA: v.correo,
  });
}
