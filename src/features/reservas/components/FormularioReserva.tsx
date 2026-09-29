"use client";

import Script from "next/script";
import { useActionState, useEffect, useState } from "react";
import { enviarReserva } from "../actions";
import type { EstadoLead } from "../lead";
import type { Idioma } from "@/shared/i18n/config";

type Opcion = { id: string; etiqueta: string };

export type TextosFormulario = {
  nivel: string;
  nivelCero: string;
  nivelBasico: string;
  nivelMedio: string;
  nivelAvanzado: string;
  preferencia: string;
  prefWhatsapp: string;
  prefLlamada: string;
  prefCorreo: string;
  pais: string;
  hora: string;
  horaManana: string;
  horaTarde: string;
  horaNoche: string;
  nombre: string;
  telefono: string;
  correo: string;
  motivo: string;
  elegir: string;
  modalidad: string;
  online: string;
  costaRica: string;
  noSe: string;
  mensaje: string;
  consentimiento: string;
  enviar: string;
  enviando: string;
  gracias: string;
  graciasTexto: string;
  errorInvalido: string;
  errorCaptcha: string;
  errorEnvio: string;
};

/**
 * Formulario de reserva: deja un contacto para que Chris llame.
 *
 * Es el único componente de cliente de la página, y el captcha —Cloudflare
 * Turnstile— se carga con `lazyOnload`: no compite con el LCP.
 */
export function FormularioReserva({
  lang,
  t,
  motivos,
}: {
  lang: Idioma;
  t: TextosFormulario;
  motivos: Opcion[];
}) {
  // React vacía el formulario tras cada envío; si falló, quien escribió no
  // tiene que volver a teclearlo todo, así que se recuerdan los valores.
  const [valores, setValores] = useState<Record<string, string>>({});
  const [estado, accion, enviando] = useActionState<EstadoLead, FormData>(
    async (anterior, formData) => {
      setValores(
        Object.fromEntries(
          [...formData].filter(([, v]) => typeof v === "string"),
        ) as Record<string, string>,
      );
      return enviarReserva(anterior, formData);
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
        <p className="solicitud__campo">
          <label htmlFor="nombre">{t.nombre}</label>
          <input id="nombre" name="nombre" defaultValue={valores.nombre} type="text" autoComplete="name" required minLength={2} maxLength={100} />
        </p>
        <p className="solicitud__campo">
          <label htmlFor="telefono">{t.telefono}</label>
          <input id="telefono" name="telefono" defaultValue={valores.telefono} type="tel" autoComplete="tel" required minLength={6} maxLength={30} />
        </p>
        <p className="solicitud__campo">
          <label htmlFor="correo">{t.correo}</label>
          <input id="correo" name="correo" defaultValue={valores.correo} type="email" autoComplete="email" required maxLength={120} />
        </p>
        <p className="solicitud__campo">
          <label htmlFor="motivo">{t.motivo}</label>
          <select id="motivo" name="motivo" defaultValue={valores.motivo ?? ""} required>
            <option value="" disabled>
              {t.elegir}
            </option>
            {motivos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.etiqueta}
              </option>
            ))}
          </select>
        </p>

        <p className="solicitud__campo">
          <label htmlFor="pais">{t.pais}</label>
          <input id="pais" name="pais" defaultValue={valores.pais} type="text" autoComplete="country-name" required minLength={2} maxLength={60} />
        </p>
        <p className="solicitud__campo">
          <label htmlFor="nivel">{t.nivel}</label>
          <select id="nivel" name="nivel" defaultValue={valores.nivel ?? ""} required>
            <option value="" disabled>
              {t.elegir}
            </option>
            <option value="cero">{t.nivelCero}</option>
            <option value="basico">{t.nivelBasico}</option>
            <option value="medio">{t.nivelMedio}</option>
            <option value="avanzado">{t.nivelAvanzado}</option>
          </select>
        </p>

        <p className="solicitud__campo">
          <label htmlFor="preferencia">{t.preferencia}</label>
          <select id="preferencia" name="preferencia" defaultValue={valores.preferencia ?? ""} required>
            <option value="" disabled>
              {t.elegir}
            </option>
            <option value="whatsapp">{t.prefWhatsapp}</option>
            <option value="llamada">{t.prefLlamada}</option>
            <option value="correo">{t.prefCorreo}</option>
          </select>
        </p>

        <p className="solicitud__campo">
          <label htmlFor="hora">{t.hora}</label>
          <select id="hora" name="hora" defaultValue={valores.hora ?? ""} required>
            <option value="" disabled>
              {t.elegir}
            </option>
            <option value="manana">{t.horaManana}</option>
            <option value="tarde">{t.horaTarde}</option>
            <option value="noche">{t.horaNoche}</option>
          </select>
        </p>

        <fieldset className="solicitud__campo solicitud__campo--ancho solicitud__opciones">
          <legend>{t.modalidad}</legend>
          {(
            [
              ["online", t.online],
              ["costa-rica", t.costaRica],
              ["no-se", t.noSe],
            ] as const
          ).map(([valor, etiqueta], i) => (
            <label key={valor} className="solicitud__radio">
              <input type="radio" name="modalidad" value={valor} required={i === 0} defaultChecked={valores.modalidad === valor} />
              <span>{etiqueta}</span>
            </label>
          ))}
        </fieldset>

        <p className="solicitud__campo solicitud__campo--ancho">
          <label htmlFor="mensaje">{t.mensaje}</label>
          <textarea id="mensaje" name="mensaje" defaultValue={valores.mensaje} rows={4} maxLength={1000} />
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
