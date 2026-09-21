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
 *   - Y ninguno vuelve antes de tres días, ni siquiera cruzando de una vuelta
 *     a la siguiente. Ver `barajaDelCiclo`.
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
 * Dentro de un ciclo no hay repeticiones por construcción. El problema está en
 * el SALTO de una vuelta a la siguiente: las dos barajas se sortean por
 * separado y nada impide que la última carta de una y las primeras de la otra
 * coincidan.
 *
 * Se vio en la tabla de los primeros días: «Brete» salía el 1 y el 3 de
 * octubre. Cumplía la regla de no repetir dos días seguidos y aun así se leía
 * como que el sitio se repite, que es justo lo que había que evitar.
 *
 * Así que la regla es más dura: NINGÚN tiquismo puede volver antes de tres
 * días. Para eso, al empezar una vuelta:
 *
 *   - la primera carta no puede ser ninguna de las dos últimas de la vuelta
 *     anterior (eso cubre las distancias 1 y 2),
 *   - la segunda carta no puede ser la última de la anterior (distancia 2).
 *
 * Dentro de la vuelta la distancia mínima ya es de un ciclo entero, así que
 * con esas dos condiciones el mínimo global queda en tres días.
 *
 * ============ POR QUÉ LOS ARREGLOS NO TOCAN EL FINAL ============
 * Los intercambios buscan siempre entre las posiciones 1 y `total-2`, nunca la
 * última. Es deliberado: la última carta de un ciclo es lo que el ciclo
 * SIGUIENTE mira para hacer esta misma comprobación. Si un arreglo la
 * cambiase, el ciclo siguiente tendría que mirar un valor ya corregido, ese al
 * anterior, y así hacia atrás: una recursión sin fondo para pintar una
 * tarjeta.
 *
 * Tocando solo el principio, cada ciclo se resuelve mirando UNA mezcla cruda y
 * nada más.
 *
 * ============ HASTA DÓNDE LLEGA LA GARANTÍA ============
 * Con cinco cartas o más se cumple la regla de tres días.
 *
 * Con tres o cuatro no hay sitio para maniobrar y solo se garantiza no repetir
 * dos días seguidos.
 *
 * Con DOS no se garantiza nada, y no es un descuido: el arreglo solo puede
 * tocar las posiciones intermedias, y en una baraja de dos no hay ninguna.
 * Además, con dos cartas «no repetir» obliga a alternar, o sea que no quedaría
 * azar que repartir. El sitio tiene ocho.
 * ======================================================
 */
function barajaDelCiclo(ciclo: number, total: number): number[] {
  const cartas = mezclaCruda(ciclo, total);
  if (total < 3) return cartas;

  const anterior = mezclaCruda(ciclo - 1, total);
  const ultima = anterior[total - 1];
  const penultima = anterior[total - 2];

  /** Cambia la carta de `posicion` por la primera válida que encuentre. */
  function apartar(posicion: number, prohibidas: number[]) {
    if (!prohibidas.includes(cartas[posicion])) return;

    for (let j = posicion + 1; j <= total - 2; j += 1) {
      if (!prohibidas.includes(cartas[j])) {
        [cartas[posicion], cartas[j]] = [cartas[j], cartas[posicion]];
        return;
      }
    }
  }

  if (total < 5) {
    // Sin sitio para la regla de tres días: al menos, que no salga dos veces
    // seguidas.
    apartar(0, [ultima]);
    return cartas;
  }

  apartar(0, [ultima, penultima]);
  apartar(1, [ultima]);

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
