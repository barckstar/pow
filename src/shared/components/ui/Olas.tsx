/**
 * Las olas que cierran el hero de la PORTADA y entran en la franja teal.
 *
 * Solo van ahí. Llegaron a estar también en los heroes de `/online` y
 * `/presencial` y se quitaron: una firma que aparece en todas partes deja de
 * ser una firma.
 *
 * Tres capas de SVG a distinta velocidad, altura y opacidad. El parallax no
 * sale de calcular nada: sale de que la de adelante corre en 34 s y la del
 * fondo en 76 s. El ojo lee esa diferencia como profundidad.
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
 *
 * ============ EL RUIDO EN LA CRESTA: QUÉ ERA DE VERDAD ============
 * Se veía una franja sucia, como de píxeles rotos, donde el agua toca la
 * fotografía. Se intentó primero por el lado del rasterizado —quitar
 * `will-change`, pedir `shape-rendering="geometricPrecision"`— y ayudó, pero
 * no era la causa. Las dos causas de verdad eran de DIBUJO, y se ven
 * comparando con las olas de `ticoshot`, que están bien:
 *
 *   1. LAS CAPAS DE ATRÁS ERAN DEMASIADO TRANSPARENTES sobre una FOTOGRAFÍA.
 *      Iban al 0,38 y al 0,42. A esa opacidad no se ve una ola: se ve la selva
 *      de la foto A TRAVÉS de la ola, y la selva es textura fina. En ticoshot
 *      las capas van al 0,55 y al 0,7 y debajo no hay una foto, hay un
 *      degradado liso — por eso allí nunca dio problema.
 *
 *   2. LA ONDA ESTABA DEMASIADO PLANA. La amplitud había quedado en 44
 *      unidades sobre un lienzo de 160, o sea el 27 %. Estirada a lo ancho de
 *      la pantalla, una curva así es casi una recta horizontal, y un borde
 *      casi horizontal es el peor caso posible para el antialiasing: cada fila
 *      de píxeles cae en un escalón distinto. La de ticoshot es de 50 sobre
 *      140 —el 36 %— y por eso se lee como una ola y no como una raya
 *      temblorosa.
 *
 * Así que esta versión copia la geometría de ticoshot, que está probada, y
 * sube las opacidades. Lo que NO se copia es la velocidad: allí corren en 17 s
 * y aquí en 34, porque el cliente pidió expresamente bajarles el movimiento.
 * ==================================================================
 */

/**
 * Cuatro periodos de 720 sobre un lienzo de 2880: el dibujo se repite cada
 * 1440, que es exactamente la mitad. De ahí el bucle limpio.
 *
 * ============ EL CUERPO BAJA HASTA 180 Y EL LIENZO MIDE 140 ============
 * Los 40 de sobra se salen del viewBox y el SVG los recorta. Es deliberado: si
 * el relleno terminase justo en el borde inferior, ese borde llevaría
 * antialiasing, y con una altura fraccionaria —56,5 px— dejaría media fila de
 * píxeles semitransparentes por la que se cuela la fotografía de detrás. Era
 * la línea clara de un píxel que cruzaba la pantalla entre la ola y la franja
 * teal.
 *
 * Recortado por el viewBox, el borde de abajo es un corte duro: no hay medio
 * píxel que se pueda transparentar.
 * =======================================================================
 */
const ONDA =
  "M0 70 c180 -50 540 50 720 0 c180 -50 540 50 720 0 " +
  "c180 -50 540 50 720 0 c180 -50 540 50 720 0 L2880 180 L0 180 Z";

type Capa = {
  color: string;
  opacidad: number;
  /** Segundos que tarda un ciclo completo. */
  duracion: number;
};

/*
 * De atrás hacia adelante, y de claro a oscuro.
 *
 * La de adelante es el teal EXACTO de la franja de confianza que viene justo
 * debajo: así el agua no termina en una línea recta, se funde con la sección
 * siguiente. Las de atrás van aclarándose hacia arriba, que es como se ve el
 * agua de verdad y, de paso, lo que hace que la cresta se distinga del fondo
 * sin tener que subirle el contraste.
 *
 * Las alturas y las separaciones van en globals.css, una por capa, porque
 * cambian con el ancho de la pantalla.
 */
const CAPAS: Capa[] = [
  { color: "var(--color-turquesa)", opacidad: 0.55, duracion: 76 },
  { color: "var(--color-teal)", opacidad: 0.7, duracion: 52 },
  { color: "var(--color-teal)", opacidad: 1, duracion: 34 },
];

type EstiloOla = React.CSSProperties & Record<`--${string}`, string>;

export function Olas() {
  return (
    <div className="olas" aria-hidden="true">
      {CAPAS.map((capa, indice) => (
        <div key={capa.duracion} className="olas__capa" data-capa={indice}>
          <svg
            className="ola"
            viewBox="0 0 2880 140"
            /* `none`: una ola tiene que cubrir el ancho de la pantalla, no
               conservar su proporción. */
            preserveAspectRatio="none"
            /* Sin esto, el heurístico del navegador alinea el borde con la
               rejilla de píxeles en vez de suavizarlo, y el borde de una ola
               es casi horizontal: el peor caso. */
            shapeRendering="geometricPrecision"
            style={{ "--ola-duracion": `${capa.duracion}s` } as EstiloOla}
          >
            <path d={ONDA} fill={capa.color} fillOpacity={capa.opacidad} />
          </svg>
        </div>
      ))}
    </div>
  );
}
