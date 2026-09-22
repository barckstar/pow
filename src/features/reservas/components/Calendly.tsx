"use client";

import { useEffect, useRef, useState } from "react";
import type { Clase } from "../esquema";
import type { Idioma } from "@/shared/i18n/config";

/**
 * El calendario de Calendly, cargado SOLO cuando alguien lo pide.
 *
 * ============ POR QUÉ NO VA EMBEBIDO DE ENTRADA ============
 * El widget de Calendly es JavaScript de terceros y pesa. Puesto en la página
 * sin más, se descarga y se ejecuta en TODA visita a `/reservar`, la use quien
 * la use, y se lo come del presupuesto del sitio entero — que en móvil ya está
 * en 86 de rendimiento y el estándar del proyecto es 95.
 *
 * Aquí la página pinta un botón propio y no pide nada a Calendly hasta que ese
 * botón se pulsa. Quien solo pasa a mirar no carga un solo byte de terceros;
 * quien va a reservar espera un segundo de más, que es justo cuando no
 * importa. Es el mismo patrón con el que se incrustan los vídeos de YouTube
 * sin hundir la puntuación.
 *
 * De paso resuelve media cuestión de privacidad: Calendly pone cookies y trata
 * datos personales. Si el script no se carga, no hay nada que consentir; y
 * quien pulsa el botón lee justo encima a dónde van sus datos.
 * ===========================================================
 */

/** El script oficial del widget. Se carga una vez por navegación. */
const SCRIPT = "https://assets.calendly.com/assets/external/widget.js";

/**
 * Lo que se le pide a Calendly por parámetros en la URL: los colores de la
 * marca.
 *
 * Sin esto el widget entra con el azul de Calendly y se nota que es de otra
 * casa. Son los mismos tokens de la paleta, sin almohadilla porque es como los
 * espera.
 *
 * ============ EL PANEL DE DETALLES SE QUEDA ============
 * Se probó `hide_event_type_details=1`, que quita la columna izquierda con el
 * nombre del evento, la duración y el tipo de reunión. Se ve PEOR: sin el
 * panel, Calendly pinta una sola columna estrecha y la centra, y el calendario
 * queda pequeño flotando en una caja medio vacía. Estrechar la caja tampoco lo
 * arregla — por debajo de unos 1000 px pasa a su maqueta apilada.
 *
 * El panel es lo que equilibra el ancho, y además dice dónde es la clase.
 * =======================================================
 *
 * ============ LO QUE NO SE TOCA ============
 * Calendly admite también `hide_gdpr_banner=1`. NO se usa: ese banner es el
 * consentimiento de cookies de un tercero que está tratando datos de quien
 * reserva. Esconderlo no quita la obligación, solo la prueba de que se
 * cumplió.
 * ===========================================
 */
const COLORES = {
  /* El teal del botón primario del sitio. */
  primary_color: "0f6e78",
  background_color: "ffffff",
  text_color: "2a1a12",
} as const;

/**
 * Le pega los parámetros de color a la URL.
 *
 * Con `URL` y no concatenando a mano: el enlace que pegue el cliente puede
 * traer ya sus propios parámetros —Calendly los añade en algunos flujos— y
 * entonces un `?` de más lo rompe. `searchParams.set` resuelve las dos formas
 * sin pensar.
 */
function conColores(url: string): string {
  try {
    const conParametros = new URL(url);
    for (const [clave, valor] of Object.entries(COLORES)) {
      conParametros.searchParams.set(clave, valor);
    }
    return conParametros.toString();
  } catch {
    /* Si no es una URL válida no se toca: el esquema ya rompe el build en ese
       caso, y aquí no toca decidir nada. */
    return url;
  }
}

export function Calendly({
  clases,
  lang,
  etiquetaBoton,
  avisoTerceros,
  titulo,
  textoDuracion,
  textoCambiar,
}: {
  /** Las duraciones disponibles, ya ordenadas de menor a mayor. */
  clases: Clase[];
  lang: Idioma;
  etiquetaBoton: string;
  /** Lo que se dice ANTES de cargar nada: quién es Calendly y qué recibe. */
  avisoTerceros: string;
  /** Para el `aria-label` del hueco donde Calendly monta su iframe. */
  titulo: string;
  /** Sufijo de la duración: «min». */
  textoDuracion: string;
  /** Para volver al selector cuando hay más de una duración. */
  textoCambiar: string;
}) {
  /**
   * Cuál se está mirando. `null` es «todavía no eligió».
   *
   * Con una sola duración no hay nada que elegir, así que se da por elegida
   * desde el principio: un selector de un solo botón es un paso de más.
   */
  const [elegida, setElegida] = useState<Clase | null>(
    clases.length === 1 ? clases[0] : null
  );
  const [abierto, setAbierto] = useState(false);
  const [conTeclado, setConTeclado] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    /*
     * Si el script ya está en la página —porque alguien cambió de duración y
     * volvió— no se vuelve a inyectar: Calendly ya inicializó los contenedores
     * que encontró, y un segundo ejemplar monta el widget dos veces.
     */
    if (document.querySelector(`script[src="${SCRIPT}"]`)) return;

    const etiqueta = document.createElement("script");
    etiqueta.src = SCRIPT;
    etiqueta.async = true;
    document.body.appendChild(etiqueta);
  }, [abierto]);

  /*
   * Al abrir con TECLADO, el foco pasa al contenedor.
   *
   * Sin esto, quien navega con teclado pulsa el botón, el botón desaparece y
   * el foco se va al `<body>`: hay que tabular desde el principio de la página
   * para llegar al calendario que uno mismo acaba de abrir.
   *
   * ============ Y SOLO CON TECLADO ============
   * Moviendo el foco también al hacer clic, Chrome pinta el anillo de
   * `:focus-visible` alrededor del contenedor — un cerco naranja de 1280 px
   * rodeando el calendario, que para quien usa ratón es ruido y nada más.
   *
   * `event.detail` vale 0 cuando el `click` vino de Enter o Espacio sobre el
   * botón, y 1 o más cuando vino de un ratón de verdad. Es la forma exacta de
   * distinguirlos, y no una heurística.
   * ============================================
   */
  useEffect(() => {
    if (abierto && conTeclado) contenedor.current?.focus();
  }, [abierto, conTeclado]);

  function abrir(detail: number) {
    setConTeclado(detail === 0);
    setAbierto(true);
  }

  if (abierto && elegida) {
    return (
      <div className="calendly">
        {/*
          El widget se remonta al cambiar de duración gracias a la `key`.
          Sin ella React reutilizaría el mismo nodo, Calendly ya lo habría
          inicializado con la URL anterior y el calendario no cambiaría.
        */}
        <div
          key={elegida.id}
          ref={contenedor}
          tabIndex={-1}
          /*
           * `data-url` y la clase son el contrato de Calendly: su script busca
           * los elementos con esta clase y monta el iframe dentro. No se
           * inventa nada aquí, se sigue su documentación.
           *
           * El alto lo reserva el CSS y Calendly lo afina con `data-resize`.
           * Sin esa reserva la página pega un salto cuando el iframe aparece,
           * que es CLS — y aquí está en 0.
           */
          className="calendly-inline-widget calendly__widget"
          data-url={conColores(elegida.calendly)}
          data-resize="true"
          aria-label={`${titulo}: ${elegida.etiqueta[lang]}`}
        />

        {clases.length > 1 ? (
          <button
            type="button"
            className="calendly__cambiar"
            onClick={() => {
              setAbierto(false);
              setElegida(null);
            }}
          >
            ← {textoCambiar}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="calendly">
      <p className="calendly__aviso">{avisoTerceros}</p>

      {clases.length === 1 ? (
        <button
          type="button"
          className="boton boton--acento"
          onClick={(evento) => abrir(evento.detail)}
        >
          {etiquetaBoton}
        </button>
      ) : (
        /*
         * Una tarjeta por duración, y cada una abre su propio calendario.
         *
         * Se elige ANTES de cargar el widget y no dentro de él por dos razones:
         * Calendly solo sabe enseñar un tipo de evento por iframe, y así la
         * comparación entre duraciones se hace en el idioma del sitio y con la
         * descripción de cada una, que Calendly no tiene.
         */
        <ul className="duraciones">
          {clases.map((clase) => (
            <li key={clase.id}>
              <button
                type="button"
                className="duracion"
                onClick={(evento) => {
                  setElegida(clase);
                  abrir(evento.detail);
                }}
              >
                <span className="duracion__tiempo">
                  {clase.duracion} {textoDuracion}
                </span>
                <span className="duracion__etiqueta">
                  {clase.etiqueta[lang]}
                </span>
                <span className="duracion__descripcion">
                  {clase.descripcion[lang]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
