"use client";

import { useEffect, useRef, useState } from "react";
import type { Clase } from "../esquema";
import type { Idioma } from "@/shared/i18n/config";

/**
 * El calendario de Calendly, cargado cuando el hueco se acerca a la pantalla.
 *
 * ============ SIN BOTÓN, PERO TAMPOCO DE ENTRADA ============
 * Hubo un botón —«Ver los horarios libres»— que cargaba el widget al pulsarlo.
 * El cliente lo quitó: quiere el calendario a la vista, sin un paso de por
 * medio. Es su decisión y tiene razón en lo que importa — un botón entre la
 * gente y la reserva es fricción en el único sitio donde no conviene.
 *
 * Pero el widget de Calendly es JavaScript de terceros y pesa. Cargándolo al
 * pintar la página se descarga en TODA visita a `/reservar`, la use quien la
 * use, y se lo come del presupuesto de rendimiento — que en móvil ya está en
 * 86 con un estándar de 95.
 *
 * La salida es cargarlo cuando el hueco SE ACERCA A LA PANTALLA, con un
 * `IntersectionObserver`. Para quien mira, el calendario simplemente está ahí:
 * no hay que pulsar nada. Para el navegador, no existe hasta que hace falta.
 * El margen de 400 px hace que empiece a cargar antes de que se vea, así que
 * cuando llega ya está puesto.
 *
 * Es el mismo patrón con el que se incrustan los vídeos de YouTube sin hundir
 * la puntuación, solo que disparado por el scroll en vez de por un clic.
 * ============================================================
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
 * ⚠️ LA CUENTA GRATUITA LOS IGNORA. Personalizar el color del embebido es
 * función de plan de pago: en la cuenta de pruebas el calendario sale azul
 * igualmente. Se dejan puestos porque en la cuenta del cliente, que sí tiene
 * plan, sí aplican — y porque quitarlos ahora obligaría a acordarse de volver
 * a ponerlos el día del cambio de cuenta.
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
  avisoTerceros,
  titulo,
  textoDuracion,
  textoCambiar,
}: {
  /** Las duraciones disponibles, ya ordenadas de menor a mayor. */
  clases: Clase[];
  lang: Idioma;
  /** Quién es Calendly y qué recibe. Se lee encima del calendario. */
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
   * desde el principio y el calendario sale solo.
   */
  const [elegida, setElegida] = useState<Clase | null>(
    clases.length === 1 ? clases[0] : null
  );
  const [cargar, setCargar] = useState(false);
  const hueco = useRef<HTMLDivElement>(null);

  /*
   * Carga el script cuando el hueco se acerca a la pantalla.
   *
   * El observador se desconecta en cuanto dispara: esto pasa una vez por
   * navegación y no hay razón para seguir escuchando el scroll después.
   */
  useEffect(() => {
    if (cargar || !elegida) return;
    const nodo = hueco.current;
    if (!nodo) return;

    /*
     * Sin soporte —navegadores viejos— se carga sin esperar a nada. Mejor
     * pagar el peso que dejar a alguien sin calendario.
     *
     * Va en un `queueMicrotask` y no a pelo por dos razones que son la misma:
     * un `setState` síncrono dentro de un efecto pinta el componente dos veces
     * seguidas —lo marca ESLint con `set-state-in-effect`— y además así este
     * camino se comporta igual que el otro, donde quien llama a `setCargar` es
     * también una función diferida, la del observador.
     */
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setCargar(true));
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setCargar(true);
          observador.disconnect();
        }
      },
      { rootMargin: "400px" }
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, [cargar, elegida]);

  useEffect(() => {
    if (!cargar) return;

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
  }, [cargar]);

  /* Con varias duraciones hay que elegir antes: Calendly solo sabe enseñar un
     tipo de evento por iframe. */
  if (!elegida) {
    return (
      <div className="calendly">
        <p className="calendly__aviso">{avisoTerceros}</p>

        <ul className="duraciones">
          {clases.map((clase) => (
            <li key={clase.id}>
              <button
                type="button"
                className="duracion"
                onClick={() => setElegida(clase)}
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
      </div>
    );
  }

  return (
    <div className="calendly">
      <p className="calendly__aviso">{avisoTerceros}</p>

      {/*
        El hueco existe SIEMPRE, cargue o no el widget.
        Es lo que le da al observador algo que vigilar, y lo que reserva el
        espacio para que la página no pegue un salto cuando el iframe entra
        — que es CLS, y aquí está en 0.

        La `key` lo remonta al cambiar de duración: sin ella React reutilizaría
        el nodo, Calendly ya lo habría inicializado con la URL anterior y el
        calendario no cambiaría.

        ============ `data-resize` SE QUEDA, Y POR QUÉ ============
        Se probó quitarlo. Sin él, el `iframe` ocupa la caja fija y SE
        DESPLAZA POR DENTRO: quien baja por la página con el cursor encima
        del calendario deja de bajar por la página y se pone a recorrer el
        calendario. En una caja de 46 rem, en la página que cierra la venta,
        eso es peor que cualquier puntuación.

        Con él, Calendly mide su contenido y ajusta la caja. El precio es un
        salto de maquetación al cargar —0,069 de CLS— y el precio se paga
        donde toca: reservando de entrada el alto en el que el widget se
        queda, para que el ajuste no mueva nada. Los números están en
        `globals.css` y están MEDIDOS, no estimados.

        Los cambios de alto al elegir un día no cuentan: un salto a menos de
        500 ms de una interacción está excluido del CLS por definición.
        ===========================================================
      */}
      <div
        key={elegida.id}
        ref={hueco}
        className={
          cargar
            ? "calendly-inline-widget calendly__widget"
            : "calendly__widget calendly__widget--esperando"
        }
        data-url={cargar ? conColores(elegida.calendly) : undefined}
        data-resize="true"
        /*
         * `role="region"` no es decoración: `aria-label` sobre un `<div>` sin
         * rol es un atributo PROHIBIDO por ARIA —lo marca axe con
         * `aria-prohibited-attr`— y los lectores de pantalla sencillamente
         * ignoran la etiqueta. Con el rol, el hueco es una zona con nombre a
         * la que se puede saltar, que es justo lo que es.
         */
        role="region"
        aria-label={`${titulo}: ${elegida.etiqueta[lang]}`}
      />

      {clases.length > 1 ? (
        <button
          type="button"
          className="calendly__cambiar"
          onClick={() => {
            setElegida(null);
            setCargar(false);
          }}
        >
          ← {textoCambiar}
        </button>
      ) : null}
    </div>
  );
}
