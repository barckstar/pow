"use server";

import { DESTINOS } from "@/features/destinos/esquema";
import { captchaValido, enviarCorreo, linea } from "@/shared/lib/correo";
import { OPCIONES } from "./esquema";
import { esquemaSolicitud, type EstadoSolicitud } from "./lead";

export async function enviarSolicitud(
  _anterior: EstadoSolicitud,
  formData: FormData,
): Promise<EstadoSolicitud> {
  // Honeypot: un humano no ve este campo. Se responde "ok" para no enseñarle
  // al bot que fue detectado.
  if (formData.get("sitioweb")) return "ok";

  const campos = esquemaSolicitud.safeParse({
    destino: formData.get("destino"),
    nombre: formData.get("nombre"),
    correo: formData.get("correo"),
    edad: formData.get("edad"),
    telefono: formData.get("telefono"),
    idiomas: formData.get("idiomas"),
    estancia: formData.get("estancia"),
    motivo: formData.get("motivo"),
    consentimiento: formData.get("consentimiento"),
  });
  if (!campos.success) return "invalido";

  const token = String(formData.get("cf-turnstile-response") ?? "");
  if (!(await captchaValido(token))) return "captcha";

  const s = campos.data;
  const destino = DESTINOS.find((d) => d.id === s.destino)?.nombre ?? s.destino;
  // El correo lo lee Chris: las etiquetas salen en inglés, que es el idioma
  // del sitio y el que traen todas las opciones.
  const etiqueta = (lista: typeof OPCIONES.estancia, id?: string) =>
    lista.find((o) => o.id === id)?.etiqueta.en ?? "—";

  const texto = [
    `Destino: ${destino}`,
    `Nombre: ${s.nombre}`,
    `Correo: ${s.correo}`,
    `Teléfono: ${s.telefono ?? "—"}`,
    `Edad: ${s.edad ?? "—"}`,
    `Idiomas que habla: ${s.idiomas ?? "—"}`,
    `Cuánto tiempo piensa estar: ${etiqueta(OPCIONES.estancia, s.estancia)}`,
    `Por qué quiere aprender: ${etiqueta(OPCIONES.motivo, s.motivo)}`,
    `Idioma del sitio: ${String(formData.get("idioma") ?? "")}`,
  ].join("\n");

  return enviarCorreo({
    asunto: `Solicitud de inmersión (${destino}): ${linea(s.nombre)}`,
    texto,
    responderA: s.correo,
  });
}
