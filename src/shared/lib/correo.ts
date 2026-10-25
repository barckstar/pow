/**
 * Lo que comparten los formularios que mandan un correo a Chris: verificar el
 * captcha y enviar por Resend.
 *
 * Vive aquí y no dentro de `features/reservas/actions.ts` porque un archivo
 * `"use server"` solo puede exportar funciones asíncronas, y cada una que
 * exporte se convierte en un endpoint al que el navegador puede llamar. Con
 * `captchaValido` ahí dentro, cualquiera podría pedirle al servidor que valide
 * tokens a su antojo.
 */

/**
 * Verifica el captcha en el servidor. El token del navegador por sí solo no
 * prueba nada: hay que preguntarle a Cloudflare si es válido.
 */
export async function captchaValido(token: string): Promise<boolean> {
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
export const linea = (s: string) => s.replace(/[\r\n]+/g, " ");

/**
 * Manda el correo por Resend. Devuelve `"error"` —y lo deja en el log del
 * servidor— si faltan las claves o Resend responde mal; nunca lanza.
 */
export async function enviarCorreo({
  asunto,
  texto,
  responderA,
}: {
  asunto: string;
  texto: string;
  responderA: string;
}): Promise<"ok" | "error"> {
  const clave = process.env.RESEND_API_KEY;
  const destino = process.env.CORREO_DESTINO;
  if (!clave || !destino) {
    console.error("Faltan RESEND_API_KEY o CORREO_DESTINO");
    return "error";
  }

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
        reply_to: responderA,
        subject: asunto,
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
