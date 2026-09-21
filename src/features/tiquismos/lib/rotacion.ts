/**
 * Elige el tiquismo del día.
 *
 * ============ TIENE QUE SER DETERMINISTA ============
 * Con `Math.random()` el servidor renderizaría un tiquismo y el cliente otro,
 * y React tiraría un error de hidratación en la consola de todo visitante. La
 * semilla es la FECHA, así que servidor y cliente llegan al mismo número sin
 * hablarse.
 *
 * Se usa UTC a propósito: todos los visitantes del mundo ven el mismo
 * tiquismo el mismo día, y el HTML cacheado no depende de la zona horaria de
 * quien lo pidió primero.
 * ====================================================
 *
 * ============ AZAR SIN REPETICIONES: UNA BARAJA POR CICLO ============
 * Antes el índice avanzaba de uno en uno: el tiquismo de mañana era siempre el
 * siguiente de la lista. Cumplía lo de cambiar a diario, pero el orden era
 * siempre el mismo y quien entra dos días seguidos lo nota.
 *
 * Lo obvio sería `hash(dia) % total`, y está mal: un hash con módulo repite.
 * Con ocho tiquismos saldría el mismo dos días seguidos cada tanto, y alguno
 * pasaría semanas sin aparecer. Eso no es «al azar», es descuidado.
 *
 * Aquí el tiempo se parte en CICLOS de `total` días y cada ciclo tiene su
 * propia BARAJA —una permutación completa de la lista, mezclada con el número
 * de ciclo como semilla—. Dentro del ciclo se van sacando cartas en orden. Eso
 * da tres propiedades a la vez:
 *
 *   - Cambia todos los días.
 *   - El orden es impredecible y distinto en cada vuelta.
 *   - Dentro de una vuelta NINGUNO se repite hasta que han salido todos.
 *
 * Y sigue siendo una función pura de la fecha, así que la hidratación cuadra.
 * =====================================================================
 */
const MS_POR_DIA = 86_400_000;

/**
 * Generador pseudoaleatorio de 32 bits (mulberry32).
 *
 * Hace falta uno PROPIO porque `Math.random()` no admite semilla, y sin
 * semilla no hay determinismo. Son cinco líneas y no arrastra dependencia.
 *
 * No sirve para criptografía y no le hace falta: lo único que se le pide es
 * repartir bien y dar siempre lo mismo para la misma semilla.
 */
function generador(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * La baraja cruda de un ciclo: una permutación de `0..total-1`.
 *
 * Fisher–Yates, que es el único barajado que reparte todas las permutaciones
 * con la misma probabilidad. El truco de «ordenar por un número al azar»
 * —`sort(() => Math.random() - 0.5)`— sesga el resultado y además depende de
 * cómo implemente `sort` cada motor, o sea que ni siquiera sería determinista
 * entre navegadores.
 */
function mezclaCruda(ciclo: number, total: number): number[] {
  const cartas = Array.from({ length: total }, (_, i) => i);
  // El desplazamiento evita que el ciclo 0 salga sin mezclar, que es justo el
  // que más se va a mirar: el de la semana en que se publique el sitio.
  const azar = generador(ciclo * 2654435761 + 0x9e3779b9);

  for (let i = total - 1; i > 0; i -= 1) {
    const j = Math.floor(azar() * (i + 1));
    [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
  }

  return cartas;
}

/**
 * La baraja que se usa de verdad: la cruda, con la costura arreglada.
 *
 * ============ LA COSTURA ENTRE DOS VUELTAS ============
 * Dentro de un ciclo no hay repeticiones por construcción. El único sitio
 * donde pueden salir dos días seguidos iguales es el SALTO de una vuelta a la
 * siguiente: la última carta de una baraja y la primera de la otra se sortean
 * por separado y nada impide que coincidan. Con ocho tiquismos pasaría una vez
 * cada nueve semanas más o menos — poco, pero es justo el fallo que se nota,
 * porque es el único que el visitante puede ver sin llevar la cuenta.
 *
 * Se arregla intercambiando las dos PRIMERAS cartas cuando hay choque.
 *
 * Y se intercambian las dos primeras, y no la primera con la última, por una
 * razón que no es de estilo: la posición final no se toca, así que la última
 * carta de un ciclo sigue siendo la de su mezcla cruda. Si la comprobación
 * cambiara también el final, el ciclo siguiente tendría que mirar un valor ya
 * corregido, ese al anterior, y así hacia atrás: una recursión sin fondo para
 * pintar una tarjeta. Tocando solo el principio, cada ciclo se resuelve
 * mirando UNA mezcla cruda y nada más.
 *
 * Con menos de tres cartas no se aplica: intercambiar las dos primeras de una
 * baraja de dos SÍ cambia la última, y la recursión volvería. Con uno o dos
 * tiquismos tampoco hay nada que repartir.
 * ======================================================
 */
function barajaDelCiclo(ciclo: number, total: number): number[] {
  const cartas = mezclaCruda(ciclo, total);
  if (total < 3) return cartas;

  const anterior = mezclaCruda(ciclo - 1, total);
  if (cartas[0] === anterior[total - 1]) {
    [cartas[0], cartas[1]] = [cartas[1], cartas[0]];
  }

  return cartas;
}

export function indiceDelDia(fecha: Date, total: number): number {
  if (total <= 0) throw new Error("La lista de tiquismos está vacía");

  const diaAbsoluto = Math.floor(fecha.getTime() / MS_POR_DIA);

  /*
   * `Math.floor` y no `Math.trunc`: para fechas anteriores a 1970 el día es
   * negativo, y truncar mandaría los días -1 a -7 al ciclo 0 junto con los
   * días 0 a 7. Dos días distintos acabarían con la misma carta.
   *
   * Por lo mismo, el módulo de un negativo es negativo en JavaScript y el
   * doble módulo lo normaliza.
   */
  const ciclo = Math.floor(diaAbsoluto / total);
  const posicion = ((diaAbsoluto % total) + total) % total;

  return barajaDelCiclo(ciclo, total)[posicion];
}
