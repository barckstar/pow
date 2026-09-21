"use client";

import { useEffect, useRef, useState } from "react";

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

export function Calendly({
  url,
  etiquetaBoton,
  avisoTerceros,
  titulo,
}: {
  /** La URL del tipo de evento en Calendly. */
  url: string;
  etiquetaBoton: string;
  /** Lo que se dice ANTES de cargar nada: quién es Calendly y qué recibe. */
  avisoTerceros: string;
  /** Para el `title` del iframe que monta Calendly. */
  titulo: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    /*
     * Si el script ya está en la página —porque alguien volvió atrás y otra
     * vez adelante— no se vuelve a inyectar: Calendly ya inicializó los
     * contenedores que encontró, y un segundo ejemplar monta el widget dos
     * veces.
     */
    if (document.querySelector(`script[src="${SCRIPT}"]`)) return;

    const etiqueta = document.createElement("script");
    etiqueta.src = SCRIPT;
    etiqueta.async = true;
    document.body.appendChild(etiqueta);
  }, [abierto]);

  /*
   * Al abrir, el foco pasa al contenedor.
   *
   * Sin esto, quien navega con teclado pulsa el botón, el botón desaparece y
   * el foco se va al `<body>`: hay que tabular desde el principio de la página
   * para llegar al calendario que uno mismo acaba de abrir.
   */
  useEffect(() => {
    if (abierto) contenedor.current?.focus();
  }, [abierto]);

  if (!abierto) {
    return (
      <div className="calendly">
        <p className="calendly__aviso">{avisoTerceros}</p>
        <button
          type="button"
          className="boton boton--acento"
          onClick={() => setAbierto(true)}
        >
          {etiquetaBoton}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={contenedor}
      tabIndex={-1}
      /*
       * `data-url` y la clase son el contrato de Calendly: su script busca los
       * elementos con esta clase y monta el iframe dentro. No se inventa nada
       * aquí, se sigue su documentación.
       *
       * La altura mínima va en el CSS y no en línea: el widget no tiene alto
       * propio hasta que carga, y sin reserva de espacio la página da un salto
       * — que es CLS, justo lo que el resto del sitio cuida.
       */
      className="calendly-inline-widget calendly__widget"
      data-url={url}
      data-resize="true"
      aria-label={titulo}
    />
  );
}
