import { describe, expect, it } from "vitest";
import { filasDeComparacion, PAQUETES } from "./esquema";

describe("paquetes y precios", () => {
  it("la tabla comparativa tiene las doce filas del cliente", () => {
    expect(filasDeComparacion()).toHaveLength(12);
  });

  it("las cifras de la tabla son las de las tarjetas, no una copia", () => {
    const fila = (id: string) =>
      filasDeComparacion().find((f) => f.id === id);

    expect(fila("principiante-individual")).toMatchObject({
      clases: 15,
      precio: 230,
    });
    expect(fila("principiante-grupo")).toMatchObject({ clases: 15, precio: 180 });
    expect(fila("intermedio-3")).toMatchObject({ clases: 18, precio: 350 });
    expect(fila("conversacion-clase")).toMatchObject({ clases: 1, precio: 28 });
    expect(fila("escolar-paquete")).toMatchObject({ clases: 8, precio: 220 });
  });

  it("hay cuatro bloques: individual, parejas, grupo y escolar", () => {
    expect(PAQUETES.grupos.map((g) => g.id)).toEqual([
      "individual",
      "parejas",
      "grupo",
      "escolar",
    ]);
  });
});
