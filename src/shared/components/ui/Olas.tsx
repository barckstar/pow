/**
 * Las olas que cierran el hero y entran en la franja teal.
 *
 * Tres capas de SVG a distinta velocidad y opacidad. El parallax no sale de
 * calcular nada: sale de que la de adelante corre en 18 s y la del fondo en
 * 42 s. El ojo lee esa diferencia como profundidad.
 *
 * CÓMO EL BUCLE NO TIENE COSTURA
 * El SVG mide el 200 % del ancho y su path lleva el dibujo REPETIDO. Al
 * correrlo un 50 % exacto, el segundo ejemplar cae justo donde estaba el
 * primero. Cualquier otro porcentaje deja un salto visible en cada vuelta.
 *
 * VAN EN LÍNEA y no como `<img src="ola.svg">`: están sobre el pliegue y una
 * petición de red más competiría con el LCP, que en móvil ya es el cuello de
 * botella de este sitio.
 *
 * Solo se anima `transform`, así que va por compositor. `prefers-reduced-motion`
 * las deja quietas (regla global en globals.css).
 */

/**
 * Cuatro periodos de 720 sobre un lienzo de 2880: el dibujo se repite cada
 * 1440, que es exactamente la mitad. De ahí el bucle limpio.
 */
const ONDA =
  "M0 70 c180 -50 540 50 720 0 c180 -50 540 50 720 0 " +
  "c180 -50 540 50 720 0 c180 -50 540 50 720 0 L2880 140 L0 140 Z";

type Capa = {
  color: string;
  opacidad: number;
  /** Segundos que tarda un ciclo completo. */
  duracion: number;
  /** Alto del riel de esa capa. */
  alto: string;
  /** Cuánto se levanta respecto al borde inferior. */
  abajo: string;
};

/*
 * La capa de adelante es el teal de la franja de confianza que viene justo
 * debajo: así el agua no termina en una línea recta, se funde con la sección
 * siguiente.
 */
const CAPAS: Capa[] = [
  {
    color: "var(--color-turquesa)",
    opacidad: 0.5,
    duracion: 42,
    alto: "5.5rem",
    abajo: "1.75rem",
  },
  {
    color: "var(--color-teal)",
    opacidad: 0.45,
    duracion: 27,
    alto: "4.5rem",
    abajo: "0.75rem",
  },
  {
    color: "var(--color-teal)",
    opacidad: 1,
    duracion: 18,
    alto: "3.5rem",
    abajo: "0",
  },
];

type EstiloOla = React.CSSProperties & Record<`--${string}`, string>;

export function Olas() {
  return (
    <div className="olas" aria-hidden="true">
      {CAPAS.map((capa) => (
        <div
          key={capa.duracion}
          className="olas__capa"
          style={{ bottom: capa.abajo, height: capa.alto }}
        >
          <svg
            className="ola"
            viewBox="0 0 2880 140"
            /* `none`: una ola tiene que cubrir el ancho de la pantalla, no
               conservar su proporción. */
            preserveAspectRatio="none"
            style={{ "--ola-duracion": `${capa.duracion}s` } as EstiloOla}
          >
            <path d={ONDA} fill={capa.color} fillOpacity={capa.opacidad} />
          </svg>
        </div>
      ))}
    </div>
  );
}
