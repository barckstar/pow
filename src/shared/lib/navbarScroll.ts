/**
 * Lógica de los tres estados del navbar, aislada del DOM para poder probarla.
 *
 * El componente solo escucha el scroll y le pasa números a `calcularEstado`.
 * Toda la decisión vive aquí, que es lo único que tiene reglas sutiles.
 */

/**
 * Por debajo de esto el header está en su versión alta de dos filas.
 * 24 px: suficiente para que el primer gesto de scroll ya lo compacte, sin
 * que un rebote de scroll elástico lo haga parpadear.
 */
export const UMBRAL_TOPE = 24;

/**
 * Desplazamientos menores se ignoran. Sin esto el navbar tiembla con el
 * micro-scroll de un trackpad o del rebote de iOS.
 */
export const UMBRAL_MICRO_SCROLL = 6;

/**
 * Solo se empieza a ocultar pasada esta altura. Arriba del todo el navbar
 * siempre está visible, pase lo que pase con la dirección del scroll.
 */
export const UMBRAL_OCULTAR = 150;

export type EstadoNavbar = {
  /** El header está en la versión alta de dos filas. */
  enTope: boolean;
  /** El header está desplazado fuera de la pantalla. */
  oculto: boolean;
};

export type EntradaEstado = {
  /** Posición actual del scroll. */
  y: number;
  /** Posición en la última lectura. */
  ultimaY: number;
  /** Si el header estaba oculto antes de esta lectura. */
  ocultoPrevio: boolean;
  /** El menú desplegable de móvil está abierto. */
  menuAbierto: boolean;
};

export function calcularEstado({
  y,
  ultimaY,
  ocultoPrevio,
  menuAbierto,
}: EntradaEstado): EstadoNavbar {
  const enTope = y < UMBRAL_TOPE;

  // Con el menú abierto el header NO se esconde: se llevaría el menú
  // desplegado consigo y el visitante se queda mirando una pantalla sin
  // navegación y sin forma de cerrarlo.
  if (menuAbierto) return { enTope, oculto: false };

  // Arriba del todo siempre visible.
  if (y <= UMBRAL_OCULTAR) return { enTope, oculto: false };

  const delta = y - ultimaY;

  // Micro-scroll: se conserva el estado anterior en vez de recalcularlo.
  if (Math.abs(delta) < UMBRAL_MICRO_SCROLL) {
    return { enTope, oculto: ocultoPrevio };
  }

  return { enTope, oculto: delta > 0 };
}
