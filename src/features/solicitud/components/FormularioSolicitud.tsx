"use client";

import Script from "next/script";
import { useActionState, useEffect, useState } from "react";
import { enviarSolicitud } from "../actions";
import type { EstadoSolicitud } from "../lead";
import type { Idioma } from "@/shared/i18n/config";

type Opcion = { id: string; etiqueta: string };

export type TextosSolicitud = {
  destino: string;
  nombre: string;
  edad: string;
  idiomas: string;
  idiomasAyuda: string;
  telefono: string;
  correo: string;
  estancia: string;
  motivo: string;
  elegir: string;
  enviar: string;
  enviando: string;
  consentimiento: string;
  gracias: string;
  graciasTexto: string;
  errorInvalido: string;
  errorCaptcha: string;
  errorEnvio: string;
};

/**
 * El formulario de solicitud de inmersión.
 *
 * ============ YA ENVÍA, Y CON LA MISMA PROTECCIÓN QUE LOS OTROS ============
 * Estuvo con el botón `disabled` y un aviso porque pide teléfono y correo y no
 * había dónde mandarlos. Ahora el sitio genera contactos: `/book`,
 * `/volunteer` y este comparten Server Action, honeypot y Cloudflare
 * Turnstile —con `lazyOnload`, para que no compita con el LCP—, y mandan el
 * correo por `shared/lib/correo.ts`.
 *
 * Es de cliente por una sola cosa: no perder lo escrito cuando el envío falla.
 * ====================================================================
 */
export function FormularioSolicitud({
  lang,
  t,
  destinos,
  estancias,
  motivos,
  destinoElegido,
}: {
  lang: Idioma;
  t: TextosSolicitud;
  destinos: Opcion[];
  estancias: Opcion[];
  motivos: Opcion[];
  /** Id del destino, cuando se llega desde una ficha. Ya validado. */
  destinoElegido?: string;
}) {
  // React vacía el formulario tras cada envío; si falló, quien escribió no
  // tiene que volver a teclearlo todo, así que se recuerdan los valores.
  const [valores, setValores] = useState<Record<string, string>>({});
  const [estado, accion, enviando] = useActionState<EstadoSolicitud, FormData>(
    async (anterior, formData) => {
      setValores(
        Object.fromEntries(
          [...formData].filter(([, v]) => typeof v === "string"),
        ) as Record<string, string>,
      );
      return enviarSolicitud(anterior, formData);
    },
    "inicial",
  );
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // El token de Turnstile es de un solo uso: tras un fallo hay que pedir otro.
  useEffect(() => {
    if (estado !== "inicial" && estado !== "ok") {
      (window as { turnstile?: { reset: () => void } }).turnstile?.reset();
    }
  }, [estado]);

  if (estado === "ok") {
    return (
      <div className="solicitud__aviso" role="status">
        <p className="solicitud__aviso-titulo">
          <span>{t.gracias}</span>
        </p>
        <p>{t.graciasTexto}</p>
      </div>
    );
  }

  const error =
    estado === "invalido"
      ? t.errorInvalido
      : estado === "captcha"
        ? t.errorCaptcha
        : estado === "error"
          ? t.errorEnvio
          : null;

  return (
    <form className="solicitud" action={accion}>
      <input type="hidden" name="idioma" value={lang} />

      {/* Honeypot: fuera de pantalla y del árbol de accesibilidad. */}
      <p className="solicitud__trampa" aria-hidden="true">
        <label>
          Website
          <input type="text" name="sitioweb" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <div className="solicitud__campos">
        <p className="solicitud__campo solicitud__campo--ancho">
          <label htmlFor="destino">{t.destino}</label>
          <select
            id="destino"
            name="destino"
            defaultValue={valores.destino ?? destinoElegido ?? ""}
            required
          >
            <option value="" disabled>
              {t.elegir}
            </option>
            {/*
              Solo el nombre, sin la zona. Un `<option>` no se parte en varias
              líneas ni se recorta con puntos suspensivos: «Sámara — Guanacaste,
              península de Nicoya» se salía del desplegable en un teléfono y la
              mitad no se leía.
            */}
            {destinos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.etiqueta}
              </option>
            ))}
          </select>
        </p>

        <p className="solicitud__campo">
          <label htmlFor="nombre">{t.nombre}</label>
          <input id="nombre" name="nombre" defaultValue={valores.nombre} type="text" autoComplete="name" required minLength={2} maxLength={100} />
        </p>

        <p className="solicitud__campo">
          <label htmlFor="edad">{t.edad}</label>
          {/* `min` y `max` no son por desconfianza: son la diferencia entre que
              el navegador avise al momento y que llegue un «1» que nadie puede
              interpretar. El tope alto a propósito — esto no es un filtro. */}
          <input id="edad" name="edad" defaultValue={valores.edad} type="number" inputMode="numeric" min={5} max={110} />
        </p>

        <p className="solicitud__campo">
          <label htmlFor="correo">{t.correo}</label>
          <input id="correo" name="correo" defaultValue={valores.correo} type="email" autoComplete="email" required maxLength={120} />
        </p>

        <p className="solicitud__campo">
          <label htmlFor="telefono">{t.telefono}</label>
          {/* `type="tel"` abre el teclado numérico en el móvil y no valida
              formato, que es lo correcto: los teléfonos internacionales no
              tienen un formato único. */}
          <input id="telefono" name="telefono" defaultValue={valores.telefono} type="tel" autoComplete="tel" minLength={6} maxLength={30} />
        </p>

        <p className="solicitud__campo solicitud__campo--ancho">
          <label htmlFor="idiomas">{t.idiomas}</label>
          <input id="idiomas" name="idiomas" defaultValue={valores.idiomas} type="text" maxLength={200} />
          <span className="solicitud__ayuda">{t.idiomasAyuda}</span>
        </p>

        <p className="solicitud__campo">
          <label htmlFor="estancia">{t.estancia}</label>
          <select id="estancia" name="estancia" defaultValue={valores.estancia ?? ""}>
            <option value="" disabled>
              {t.elegir}
            </option>
            {estancias.map((o) => (
              <option key={o.id} value={o.id}>
                {o.etiqueta}
              </option>
            ))}
          </select>
        </p>

        <p className="solicitud__campo">
          <label htmlFor="motivo">{t.motivo}</label>
          <select id="motivo" name="motivo" defaultValue={valores.motivo ?? ""}>
            <option value="" disabled>
              {t.elegir}
            </option>
            {motivos.map((o) => (
              <option key={o.id} value={o.id}>
                {o.etiqueta}
              </option>
            ))}
          </select>
        </p>
      </div>

      <label className="solicitud__radio solicitud__consentimiento">
        <input type="checkbox" name="consentimiento" required />
        <span>{t.consentimiento}</span>
      </label>

      {siteKey ? (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="lazyOnload"
          />
          <div className="cf-turnstile" data-sitekey={siteKey} data-language={lang} />
        </>
      ) : null}

      {error ? (
        <p className="solicitud__error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="boton boton--acento" disabled={enviando}>
        {enviando ? t.enviando : t.enviar}
      </button>
    </form>
  );
}
