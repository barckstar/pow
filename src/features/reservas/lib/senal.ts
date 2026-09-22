/**
 * ¿Este `message` es Calendly diciendo que ya pintó?
 *
 * Vive fuera del componente por la misma razón que `navbarScroll.ts`: es una
 * decisión con varias esquinas —el origen, la forma del dato, el nombre del
 * evento— y una decisión con esquinas se prueba. Dentro de un `useEffect` no
 * se puede probar sin montar medio navegador.
 *
 * ============ POR QUÉ ESTE MENSAJE Y NO OTRO ============
 * Está leído del `widget.js` de Calendly, no supuesto. `calendly.page_height`
 * es el ÚNICO mensaje que su propio script escucha, y lo manda la página
 * incrustada cuando ya pintó y sabe cuánto mide. Es también lo que mueve
 * `data-resize`: la caja pasa sola de 46 rem a los ~41 que necesita, y ese
 * cambio de alto es la señal de que el mensaje llegó.
 *
 * Se descartaron dos alternativas, las dos por lo mismo — avisan de algo que
 * no es «hay un calendario delante de la gente»:
 *
 *  · El `load` del `iframe` dice que el MARCO cargó, no que dentro haya algo.
 *    Con las cookies de terceros bloqueadas llega igual.
 *  · La rueda de Calendly —`div.calendly-spinner`— no sirve porque NO LA
 *    QUITA NUNCA: en su `widget.js` hay un `buildSpinner()` que la crea y no
 *    hay nada que la borre. El `iframe` se pinta encima y ya.
 * =======================================================
 */

/** De dónde tiene que venir. Exacto, no «que contenga». */
const ORIGEN = "https://calendly.com";

/** El nombre del evento, tal cual lo manda. */
const EVENTO = "calendly.page_height";

/**
 * El origen se comprueba SIEMPRE y por igualdad.
 *
 * Un `message` puede mandarlo cualquier ventana o cualquier `iframe` de la
 * página. Aquí lo peor que haría un impostor es quitar un esqueleto antes de
 * tiempo, que es poca cosa; pero comparar orígenes «a ver si empieza por» o
 * «a ver si contiene» es exactamente el fallo que deja pasar
 * `https://calendly.com.ejemplo.test`, y esa costumbre no se coge para un
 * caso barato y luego se deja para uno caro.
 */
export function esCalendlyListo(origen: string, dato: unknown): boolean {
  if (origen !== ORIGEN) return false;
  if (typeof dato !== "object" || dato === null) return false;
  return (dato as { event?: unknown }).event === EVENTO;
}
