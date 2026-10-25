"use client";

import Script from "next/script";
import { useActionState, useEffect, useState } from "react";
import { enviarVoluntariado } from "../actions";
import type { EstadoVoluntario } from "../esquema";
import type { Idioma } from "@/shared/i18n/config";

type Opcion = { id: string; etiqueta: string };

export type TextosVoluntariado = {
  requeridos: string;
  nombre: string;
  correo: string;
  edad: string;
  edadAyuda: string;
  telefono: string;
  intereses: string;
  interesesAyuda: string;
  otro: string;
  sobreTi: string;
  sobreTiAyuda: string;
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
 * Formulario de interés por el voluntariado.
 *
 * Mismo patrón que el de `/book` —Server Action, honeypot y Cloudflare
 * Turnstile con `lazyOnload`— porque pide el mismo tipo de dato y se protege
 * igual. Es de cliente por dos cosas que el HTML solo no hace: abrir el campo
 * «Other» cuando se marca, y no perder lo escrito si el envío falla.
 */
export function FormularioVoluntariado({
  lang,
  t,
  intereses,
  idOtro,
}: {
  lang: Idioma;
  t: TextosVoluntariado;
  intereses: Opcion[];
  /** El id del interés que abre el campo de texto. */
  idOtro: string;
}) {
  // React vacía el formulario tras cada envío; si falló, quien escribió no
  // tiene que volver a teclearlo todo, así que se recuerdan los valores.
  const [valores, setValores] = useState<Record<string, string>>({});
  const [marcados, setMarcados] = useState<string[]>([]);
  const [estado, accion, enviando] = useActionState<
    EstadoVoluntario,
    FormData
  >(async (anterior, formData) => {
    setValores(
      Object.fromEntries(
        [...formData].filter(([, v]) => typeof v === "string"),
      ) as Record<string, string>,
    );
    return enviarVoluntariado(anterior, formData);
  }, "inicial");
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

  const alternar = (id: string) =>
    setMarcados((actuales) =>
      actuales.includes(id)
        ? actuales.filter((x) => x !== id)
        : [...actuales, id],
    );

  const conOtro = marcados.includes(idOtro);

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

      <p className="solicitud__requeridos">{t.requeridos}</p>

      <div className="solicitud__campos">
        <p className="solicitud__campo">
          <label htmlFor="v-nombre">{t.nombre} *</label>
          <input id="v-nombre" name="nombre" defaultValue={valores.nombre} type="text" autoComplete="name" required minLength={2} maxLength={100} />
        </p>
        <p className="solicitud__campo">
          <label htmlFor="v-correo">{t.correo} *</label>
          <input id="v-correo" name="correo" defaultValue={valores.correo} type="email" autoComplete="email" required maxLength={120} />
        </p>
        <p className="solicitud__campo">
          <label htmlFor="v-edad">{t.edad} *</label>
          <input id="v-edad" name="edad" defaultValue={valores.edad} type="number" inputMode="numeric" min={10} max={110} required aria-describedby="v-edad-ayuda" />
          <span className="solicitud__ayuda" id="v-edad-ayuda">
            {t.edadAyuda}
          </span>
        </p>
        <p className="solicitud__campo">
          <label htmlFor="v-telefono">{t.telefono} *</label>
          {/* `type="tel"` abre el teclado numérico en el móvil y no valida
              formato: los teléfonos internacionales no tienen uno. */}
          <input id="v-telefono" name="telefono" defaultValue={valores.telefono} type="tel" autoComplete="tel" placeholder="+" required minLength={6} maxLength={30} />
        </p>

        <fieldset className="solicitud__campo solicitud__campo--ancho solicitud__opciones solicitud__opciones--columna">
          <legend>{t.intereses} *</legend>
          <span className="solicitud__ayuda">{t.interesesAyuda}</span>
          {intereses.map((interes) => (
            <label key={interes.id} className="solicitud__radio">
              {/*
                «Al menos una» no existe en HTML. Mientras no haya ninguna
                marcada, TODAS son `required`: el navegador avisa con su
                mensaje de siempre, y en cuanto se marca una dejan de serlo.
              */}
              <input
                type="checkbox"
                name="intereses"
                value={interes.id}
                checked={marcados.includes(interes.id)}
                onChange={() => alternar(interes.id)}
                required={marcados.length === 0}
              />
              <span>{interes.etiqueta}</span>
            </label>
          ))}
        </fieldset>

        {conOtro ? (
          <p className="solicitud__campo solicitud__campo--ancho">
            <label htmlFor="v-otro">{t.otro} *</label>
            <input id="v-otro" name="otro" defaultValue={valores.otro} type="text" required maxLength={200} />
          </p>
        ) : null}

        <p className="solicitud__campo solicitud__campo--ancho">
          <label htmlFor="v-sobre-ti">{t.sobreTi}</label>
          <textarea id="v-sobre-ti" name="sobreTi" defaultValue={valores.sobreTi} rows={4} maxLength={1000} aria-describedby="v-sobre-ti-ayuda" />
          <span className="solicitud__ayuda" id="v-sobre-ti-ayuda">
            {t.sobreTiAyuda}
          </span>
        </p>
      </div>

      <label className="solicitud__radio solicitud__consentimiento">
        <input type="checkbox" name="consentimiento" required />
        <span>{t.consentimiento} *</span>
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
