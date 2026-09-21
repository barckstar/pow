import {
  Adorno,
  CapaDecorados,
  Estrella,
  Hibisco,
  HojaPalma,
  Lapa,
  Mariposa,
  Monstera,
  Ola,
  Palmera,
  RamaCafe,
  RuedaCarreta,
  Sol,
  Tucan,
  Volcan,
  type Decorado,
} from "./Decorados";

/**
 * El juego de adornos de cada sección, listo para poner en una línea.
 *
 * ============ POR QUÉ UNA RECETA POR SECCIÓN Y NO ADORNOS SUELTOS ============
 * Colocarlos a mano en cada sección tiene dos problemas que solo se ven con el
 * sitio entero delante:
 *
 *   1. Se repiten sin querer. Con doce secciones y trece dibujos es facilísimo
 *      poner la misma palmera en el mismo sitio dos veces y que el sitio se vea
 *      con plantilla.
 *   2. Se acumulan. Cada uno parece inofensivo, pero quince adornos animados a
 *      la vez son quince capas en el compositor.
 *
 * Con las recetas aquí se ve DE UN VISTAZO cuántos hay en cada sección y si
 * alguno se repite. Ninguna pasa de cinco.
 * ============================================================================
 *
 * ============ EL DIBUJO TIENE QUE VER CON LO QUE SE LEE ============
 * No son al azar. El volcán y la ola donde se habla de los destinos, porque
 * son el Arenal y Manuel Antonio. La rueda de carreta en el tiquismo del día,
 * porque las dos cosas son folclore. La rama de café en los precios y en el
 * blog, que es donde se cuenta el país. El tucán en `/online`, que es la
 * sección sin fotografía y la que más necesita que algo recuerde dónde está
 * esto pasando.
 *
 * Un adorno que tiene que ver con lo que se lee deja de ser relleno.
 * ===================================================================
 */

/**
 * ============ LA OPACIDAD DEPENDE DEL COLOR, NO DEL CAPRICHO ============
 * El teal sobre la crema da 5,49:1 y el turquesa decorativo 1,84:1 — a plena
 * opacidad. Puestos los dos al mismo número, el teal mancha y el turquesa
 * directamente no está. Por eso son dos niveles.
 *
 * Lo que cuenta para el reparto 70/30/10 es la TINTA —color por grosor por
 * opacidad—, nunca el número de la opacidad suelto.
 * ========================================================================
 */
/** Teal y naranja: pesan solos. Más arriba dejan de ser fondo. */
const TENUE = 0.22;
/** Turquesa, dorado, coral: sin esto no llegan a verse. */
const VIVO = 0.55;

const TEAL = "var(--color-teal)";
const TURQUESA = "var(--color-turquesa)";
const DORADO = "var(--color-dorado)";
const CORAL = "var(--color-coral)";
const NARANJA = "var(--color-naranja)";

export type VarianteDecorado =
  | "experiencias"
  | "destinos"
  | "destinosPagina"
  | "tiquismo"
  | "faq"
  | "online"
  | "presencial"
  | "precios"
  | "comunidad"
  | "reservar"
  | "blog";

type Pieza = Omit<Decorado, "children"> & { dibujo: React.ReactNode };

/*
 * Las posiciones son el CENTRO de cada adorno, en porcentaje de la sección.
 *
 * Van a los extremos —por debajo del 14 % o por encima del 86 %— a propósito:
 * el contenido vive en una columna de 80 rem centrada, así que en una pantalla
 * ancha esa franja de los lados es el hueco vacío que hay que llenar, y en una
 * estrecha no hay hueco y la capa entera se apaga. Ver `.capa-adornos` en
 * globals.css.
 */
const RECETAS: Record<VarianteDecorado, Pieza[]> = {
  /* La bifurcación del sitio. La lapa vigila desde la derecha. */
  experiencias: [
    {
      dibujo: <Monstera />,
      x: 5,
      y: 26,
      tam: 9,
      giro: -14,
      color: TURQUESA,
      opacidad: VIVO,
      animacion: "vaiven",
      duracion: 13,
    },
    {
      dibujo: <Lapa />,
      x: 95,
      y: 66,
      tam: 10,
      giro: 8,
      color: TEAL,
      opacidad: TENUE,
      animacion: "flotar",
      retraso: 1.5,
    },
    {
      dibujo: <HojaPalma />,
      x: 92,
      y: 14,
      tam: 6,
      giro: 24,
      color: DORADO,
      opacidad: VIVO,
      animacion: "vaiven",
      retraso: 3,
    },
    {
      dibujo: <Estrella />,
      x: 12,
      y: 82,
      tam: 1.8,
      color: NARANJA,
      opacidad: 0.3,
      animacion: "destello",
      retraso: 0.8,
    },
  ],

  /* Los dos destinos de la home: el volcán es el Arenal, la ola es Manuel
     Antonio. */
  destinos: [
    {
      dibujo: <Volcan />,
      x: 6,
      y: 20,
      tam: 8,
      color: TEAL,
      opacidad: TENUE,
      animacion: "respirar",
      duracion: 14,
    },
    {
      dibujo: <Ola />,
      x: 94,
      y: 78,
      tam: 8.5,
      color: TURQUESA,
      opacidad: VIVO,
      animacion: "deriva",
      retraso: 2,
    },
    {
      dibujo: <Palmera />,
      x: 96,
      y: 22,
      tam: 6.5,
      giro: 10,
      color: DORADO,
      opacidad: VIVO,
      animacion: "vaiven",
      retraso: 4,
    },
    {
      dibujo: <Estrella />,
      x: 9,
      y: 74,
      tam: 2,
      color: NARANJA,
      opacidad: 0.3,
      animacion: "destello",
      retraso: 2.4,
    },
  ],

  /* La página entera de destinos: más aire que llenar, cinco piezas. */
  destinosPagina: [
    {
      dibujo: <Lapa />,
      x: 5,
      y: 13,
      tam: 9,
      giro: -10,
      color: TEAL,
      opacidad: TENUE,
      animacion: "flotar",
    },
    {
      dibujo: <Volcan />,
      x: 95,
      y: 30,
      tam: 8,
      color: TURQUESA,
      opacidad: VIVO,
      animacion: "respirar",
      retraso: 2,
      duracion: 15,
    },
    {
      dibujo: <Ola />,
      x: 7,
      y: 62,
      tam: 8,
      color: TURQUESA,
      opacidad: VIVO,
      animacion: "deriva",
      retraso: 3.5,
    },
    {
      dibujo: <Palmera />,
      x: 94,
      y: 80,
      tam: 7,
      giro: -8,
      color: DORADO,
      opacidad: VIVO,
      animacion: "vaiven",
      retraso: 1,
    },
    {
      dibujo: <Estrella />,
      x: 12,
      y: 40,
      tam: 2,
      color: NARANJA,
      opacidad: 0.3,
      animacion: "destello",
      retraso: 1.6,
    },
  ],

  /* El tiquismo del día. La rueda de carreta porque las dos cosas son lo
     mismo: folclore costarricense contado sin disfraz. */
  tiquismo: [
    {
      dibujo: <RuedaCarreta />,
      x: 8,
      y: 50,
      tam: 11,
      color: TEAL,
      opacidad: 0.16,
      animacion: "giro",
      duracion: 90,
    },
    {
      dibujo: <Hibisco />,
      x: 93,
      y: 26,
      tam: 6.5,
      giro: 14,
      color: CORAL,
      opacidad: VIVO,
      animacion: "respirar",
      retraso: 1.2,
    },
    {
      dibujo: <HojaPalma />,
      x: 91,
      y: 80,
      tam: 7,
      giro: -30,
      color: DORADO,
      opacidad: VIVO,
      animacion: "vaiven",
      retraso: 3,
    },
    {
      dibujo: <Estrella />,
      x: 18,
      y: 16,
      tam: 1.7,
      color: NARANJA,
      opacidad: 0.3,
      animacion: "destello",
    },
  ],

  faq: [
    {
      dibujo: <RamaCafe />,
      x: 5,
      y: 30,
      tam: 8,
      giro: -12,
      color: TEAL,
      opacidad: TENUE,
      animacion: "vaiven",
      duracion: 14,
    },
    {
      dibujo: <Monstera />,
      x: 95,
      y: 72,
      tam: 8.5,
      giro: 16,
      color: TURQUESA,
      opacidad: VIVO,
      animacion: "vaiven",
      retraso: 2.5,
    },
    {
      dibujo: <Estrella />,
      x: 91,
      y: 18,
      tam: 1.8,
      color: NARANJA,
      opacidad: 0.3,
      animacion: "destello",
      retraso: 1,
    },
  ],

  /* `/online` no tiene fotografía: es la sección que más depende de esto para
     no parecer un formulario. */
  online: [
    {
      dibujo: <Tucan />,
      x: 93,
      y: 20,
      tam: 9,
      giro: 6,
      color: TEAL,
      opacidad: TENUE,
      animacion: "flotar",
    },
    {
      dibujo: <Monstera />,
      x: 6,
      y: 46,
      tam: 9,
      giro: -18,
      color: TURQUESA,
      opacidad: VIVO,
      animacion: "vaiven",
      retraso: 2,
    },
    {
      dibujo: <Hibisco />,
      x: 94,
      y: 74,
      tam: 6,
      giro: -12,
      color: CORAL,
      opacidad: VIVO,
      animacion: "respirar",
      retraso: 3.4,
    },
    {
      dibujo: <Estrella />,
      x: 13,
      y: 14,
      tam: 1.8,
      color: NARANJA,
      opacidad: 0.3,
      animacion: "destello",
      retraso: 0.6,
    },
  ],

  presencial: [
    {
      dibujo: <Palmera />,
      x: 5,
      y: 24,
      tam: 8,
      giro: -8,
      color: TEAL,
      opacidad: TENUE,
      animacion: "vaiven",
      duracion: 15,
    },
    {
      dibujo: <Volcan />,
      x: 95,
      y: 58,
      tam: 8.5,
      color: TURQUESA,
      opacidad: VIVO,
      animacion: "respirar",
      retraso: 2,
      duracion: 16,
    },
    {
      dibujo: <HojaPalma />,
      x: 93,
      y: 16,
      tam: 6,
      giro: 28,
      color: DORADO,
      opacidad: VIVO,
      animacion: "vaiven",
      retraso: 4,
    },
    {
      dibujo: <Estrella />,
      x: 10,
      y: 72,
      tam: 2,
      color: NARANJA,
      opacidad: 0.3,
      animacion: "destello",
      retraso: 1.8,
    },
  ],

  /* El café es lo que construyó el país; va donde se habla de dinero. */
  precios: [
    {
      dibujo: <RamaCafe />,
      x: 6,
      y: 36,
      tam: 9,
      giro: -10,
      color: TEAL,
      opacidad: TENUE,
      animacion: "vaiven",
      duracion: 13,
    },
    {
      dibujo: <Hibisco />,
      x: 94,
      y: 64,
      tam: 7,
      giro: 18,
      color: CORAL,
      opacidad: VIVO,
      animacion: "respirar",
      retraso: 2.2,
    },
    {
      dibujo: <Estrella />,
      x: 90,
      y: 22,
      tam: 1.8,
      color: NARANJA,
      opacidad: 0.3,
      animacion: "destello",
    },
  ],

  comunidad: [
    {
      dibujo: <Lapa />,
      x: 6,
      y: 24,
      tam: 9,
      giro: -6,
      color: TEAL,
      opacidad: TENUE,
      animacion: "flotar",
    },
    {
      dibujo: <Mariposa />,
      x: 94,
      y: 44,
      tam: 6.5,
      giro: 12,
      color: TURQUESA,
      opacidad: VIVO,
      animacion: "flotar",
      retraso: 1.8,
      duracion: 8,
    },
    {
      dibujo: <Hibisco />,
      x: 92,
      y: 82,
      tam: 6,
      giro: -16,
      color: CORAL,
      opacidad: VIVO,
      animacion: "respirar",
      retraso: 3.2,
    },
    {
      dibujo: <Estrella />,
      x: 12,
      y: 70,
      tam: 2,
      color: NARANJA,
      opacidad: 0.3,
      animacion: "destello",
      retraso: 1.1,
    },
  ],

  reservar: [
    {
      dibujo: <Sol />,
      x: 94,
      y: 16,
      tam: 7,
      color: DORADO,
      opacidad: VIVO,
      animacion: "giro",
      duracion: 70,
    },
    {
      dibujo: <Monstera />,
      x: 5,
      y: 58,
      tam: 9,
      giro: -20,
      color: TURQUESA,
      opacidad: VIVO,
      animacion: "vaiven",
      retraso: 2.6,
    },
    {
      dibujo: <Estrella />,
      x: 90,
      y: 78,
      tam: 1.8,
      color: NARANJA,
      opacidad: 0.3,
      animacion: "destello",
      retraso: 0.9,
    },
  ],

  blog: [
    {
      dibujo: <RamaCafe />,
      x: 4,
      y: 22,
      tam: 8,
      giro: -14,
      color: TEAL,
      opacidad: 0.18,
      animacion: "vaiven",
      duracion: 15,
    },
    {
      dibujo: <Tucan />,
      x: 96,
      y: 70,
      tam: 8,
      giro: 8,
      color: TURQUESA,
      opacidad: VIVO,
      animacion: "flotar",
      retraso: 2.4,
    },
    {
      dibujo: <Estrella />,
      x: 93,
      y: 20,
      tam: 1.7,
      color: NARANJA,
      opacidad: 0.3,
      animacion: "destello",
      retraso: 1.4,
    },
  ],
};

/**
 * Pinta la capa de adornos de una sección.
 *
 * Uso: `<DecoradosSeccion variante="online" />` dentro de un contenedor que
 * lleve la clase `con-adornos`.
 */
export function DecoradosSeccion({
  variante,
}: {
  variante: VarianteDecorado;
}) {
  return (
    <CapaDecorados>
      {RECETAS[variante].map(({ dibujo, ...resto }, i) => (
        <Adorno key={i} {...resto}>
          {dibujo}
        </Adorno>
      ))}
    </CapaDecorados>
  );
}
