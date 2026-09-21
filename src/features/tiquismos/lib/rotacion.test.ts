import { describe, expect, it } from "vitest";
import { indiceDelDia } from "./rotacion";

const MS_POR_DIA = 86_400_000;

/**
 * Un día por su NÚMERO ABSOLUTO desde la época Unix, no por su fecha.
 *
 * Los ciclos se cuentan sobre ese número, así que probar «la vuelta que
 * empieza el 19 de septiembre» no prueba nada: ese día cae a media vuelta. Con
 * el día absoluto se puede pedir un arranque de ciclo exacto y comprobar la
 * propiedad que de verdad se garantiza.
 */
function enDia(diaAbsoluto: number): Date {
  return new Date(diaAbsoluto * MS_POR_DIA);
}

/** El primer día de la vuelta número `vuelta`, para una lista de `total`. */
function arranqueDeVuelta(vuelta: number, total: number): number {
  return vuelta * total;
}

describe("tiquismo del día", () => {
  it("la misma fecha siempre da el mismo índice", () => {
    const fecha = new Date("2026-09-19T10:00:00Z");
    expect(indiceDelDia(fecha, 8)).toBe(indiceDelDia(fecha, 8));
  });

  it("distintas horas del mismo día UTC dan el mismo índice", () => {
    const manana = new Date("2026-09-19T00:30:00Z");
    const noche = new Date("2026-09-19T23:30:00Z");
    expect(indiceDelDia(manana, 8)).toBe(indiceDelDia(noche, 8));
  });

  /*
   * La costura entre vueltas es el único sitio donde podían salir dos días
   * seguidos iguales, y es el fallo que el visitante ve sin llevar la cuenta.
   * Se barren 800 días, o sea cien vueltas con sus cien costuras.
   */
  it("nunca repite dos días seguidos", () => {
    for (let d = -400; d < 400; d += 1) {
      expect(indiceDelDia(enDia(d), 8)).not.toBe(indiceDelDia(enDia(d + 1), 8));
    }
  });

  /*
   * La propiedad que justifica toda la baraja: cambiar a diario es fácil; no
   * repetir hasta haberlos sacado todos es lo que un `hash % total` no da.
   */
  it("una vuelta completa saca los ocho, sin repetir ninguno", () => {
    const total = 8;
    for (const vuelta of [0, 1, 2, 50, -3]) {
      const vistos = new Set<number>();
      for (let d = 0; d < total; d += 1) {
        vistos.add(indiceDelDia(enDia(arranqueDeVuelta(vuelta, total) + d), total));
      }
      expect(vistos.size).toBe(total);
    }
  });

  /*
   * Y la que lo separa de la versión anterior, que avanzaba de uno en uno: dos
   * vueltas seguidas no pueden salir en el mismo orden.
   */
  it("el orden cambia de una vuelta a la siguiente", () => {
    const total = 8;
    const orden = (vuelta: number) =>
      Array.from({ length: total }, (_, d) =>
        indiceDelDia(enDia(arranqueDeVuelta(vuelta, total) + d), total)
      ).join(",");

    expect(orden(0)).not.toBe(orden(1));
    expect(orden(1)).not.toBe(orden(2));
    expect(orden(0)).not.toBe(orden(2));
  });

  it("siempre devuelve un índice dentro de la lista", () => {
    for (let d = -400; d < 400; d += 37) {
      const indice = indiceDelDia(enDia(d), 8);
      expect(indice).toBeGreaterThanOrEqual(0);
      expect(indice).toBeLessThan(8);
    }
  });

  it("funciona con fechas anteriores a 1970, donde el módulo sería negativo", () => {
    const indice = indiceDelDia(new Date("1965-03-04T00:00:00Z"), 8);
    expect(indice).toBeGreaterThanOrEqual(0);
    expect(indice).toBeLessThan(8);
  });

  /*
   * El caso que rompe con `Math.trunc` en vez de `Math.floor`: los días -1 a
   * -8 caerían en el mismo ciclo que los días 0 a 7 y la vuelta anterior a la
   * época saldría con huecos.
   */
  it("no solapa ciclos al cruzar la época Unix", () => {
    const total = 8;
    const vistos = new Set<number>();
    for (let d = -total; d < 0; d += 1) {
      vistos.add(indiceDelDia(enDia(d), total));
    }
    expect(vistos.size).toBe(total);
  });

  it("no se atasca con un solo tiquismo", () => {
    expect(indiceDelDia(enDia(0), 1)).toBe(0);
    expect(indiceDelDia(enDia(1), 1)).toBe(0);
  });

  it("rechaza una lista vacía en vez de devolver NaN", () => {
    expect(() => indiceDelDia(new Date(), 0)).toThrow();
  });
});
