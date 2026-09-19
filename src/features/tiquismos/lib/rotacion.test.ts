import { describe, expect, it } from "vitest";
import { indiceDelDia } from "./rotacion";

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

  it("el día siguiente avanza exactamente una posición", () => {
    const hoy = new Date("2026-09-19T12:00:00Z");
    const manana = new Date("2026-09-20T12:00:00Z");
    expect(indiceDelDia(manana, 8)).toBe((indiceDelDia(hoy, 8) + 1) % 8);
  });

  it("recorre la lista entera antes de repetir", () => {
    const total = 8;
    const vistos = new Set<number>();
    for (let dia = 0; dia < total; dia += 1) {
      const fecha = new Date(Date.UTC(2026, 8, 19 + dia, 12));
      vistos.add(indiceDelDia(fecha, total));
    }
    expect(vistos.size).toBe(total);
  });

  it("siempre devuelve un índice dentro de la lista", () => {
    for (let dia = -400; dia < 400; dia += 37) {
      const fecha = new Date(Date.UTC(2026, 8, 19 + dia));
      const indice = indiceDelDia(fecha, 8);
      expect(indice).toBeGreaterThanOrEqual(0);
      expect(indice).toBeLessThan(8);
    }
  });

  it("funciona con fechas anteriores a 1970, donde el módulo sería negativo", () => {
    const indice = indiceDelDia(new Date("1965-03-04T00:00:00Z"), 8);
    expect(indice).toBeGreaterThanOrEqual(0);
    expect(indice).toBeLessThan(8);
  });

  it("rechaza una lista vacía en vez de devolver NaN", () => {
    expect(() => indiceDelDia(new Date(), 0)).toThrow();
  });
});
