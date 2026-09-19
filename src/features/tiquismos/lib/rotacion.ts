/**
 * Elige el tiquismo del día.
 *
 * Tiene que ser DETERMINISTA. Con `Math.random()` el servidor renderizaría un
 * tiquismo y el cliente otro, y React tiraría un error de hidratación en la
 * consola de todo visitante. Con la fecha como semilla, servidor y cliente
 * llegan al mismo número.
 *
 * Se calcula a partir del día absoluto (días transcurridos desde la época
 * Unix) para que el índice avance de uno en uno y la rotación recorra toda la
 * lista antes de repetir.
 */
const MS_POR_DIA = 86_400_000;

export function indiceDelDia(fecha: Date, total: number): number {
  if (total <= 0) throw new Error("La lista de tiquismos está vacía");

  // Se usa UTC a propósito: así todos los visitantes del mundo ven el mismo
  // tiquismo el mismo día, y el HTML cacheado no depende de la zona horaria
  // de quien lo pidió primero.
  const diaAbsoluto = Math.floor(fecha.getTime() / MS_POR_DIA);

  // El módulo de un negativo es negativo en JavaScript; el doble módulo lo
  // normaliza para fechas anteriores a 1970.
  return ((diaAbsoluto % total) + total) % total;
}
