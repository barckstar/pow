import { describe, expect, it } from "vitest";
import { esquemaFrontmatter } from "./esquema";

const valido = {
  titulo: "¿Qué significa realmente «pura vida»?",
  resumen:
    "Sirve de saludo, de gracias y de «todo bien». De dónde viene la frase más costarricense que existe y cómo usarla sin que suene forzada.",
  fecha: "2026-09-19",
  etiquetas: ["tiquismos"],
};

describe("frontmatter de un artículo", () => {
  it("acepta un artículo bien formado", () => {
    expect(esquemaFrontmatter.safeParse(valido).success).toBe(true);
  });

  it("rechaza un resumen demasiado corto para una meta description", () => {
    const corto = { ...valido, resumen: "Muy corto." };
    expect(esquemaFrontmatter.safeParse(corto).success).toBe(false);
  });

  it("rechaza un resumen que Google cortaría por largo", () => {
    const largo = { ...valido, resumen: "a".repeat(200) };
    expect(esquemaFrontmatter.safeParse(largo).success).toBe(false);
  });

  it("rechaza una portada sin texto alternativo", () => {
    const sinAlt = { ...valido, portada: "/fotos/arenal.jpg" };
    const resultado = esquemaFrontmatter.safeParse(sinAlt);

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0]?.path).toEqual(["portadaAlt"]);
    }
  });

  it("acepta una portada con su texto alternativo", () => {
    const conAlt = {
      ...valido,
      portada: "/fotos/arenal.jpg",
      portadaAlt: "El cono del Volcán Arenal desde La Fortuna",
    };
    expect(esquemaFrontmatter.safeParse(conAlt).success).toBe(true);
  });

  it("rechaza una fecha de actualización anterior a la de publicación", () => {
    const alReves = { ...valido, actualizado: "2026-01-01" };
    expect(esquemaFrontmatter.safeParse(alReves).success).toBe(false);
  });

  it("rechaza un artículo sin etiquetas", () => {
    expect(
      esquemaFrontmatter.safeParse({ ...valido, etiquetas: [] }).success
    ).toBe(false);
  });

  it("rechaza etiquetas con mayúsculas o espacios: van en la URL", () => {
    expect(
      esquemaFrontmatter.safeParse({ ...valido, etiquetas: ["Pura Vida"] })
        .success
    ).toBe(false);
  });

  it("rechaza campos que no existen en el esquema", () => {
    const conSobra = { ...valido, autor: "alguien" };
    expect(esquemaFrontmatter.safeParse(conSobra).success).toBe(false);
  });

  it("los artículos no son borradores salvo que lo digan", () => {
    const resultado = esquemaFrontmatter.parse(valido);
    expect(resultado.borrador).toBe(false);
  });
});
