import { describe, expect, it } from "vitest";
import { esquemaDiccionario } from "./esquema";
import { getDiccionario } from "./diccionario";
import { IDIOMAS, esIdioma, idiomaDesdeCabecera } from "./config";
import es from "./diccionarios/es.json";

describe("esquema del diccionario", () => {
  it("rechaza un diccionario al que le falta una clave", () => {
    const incompleto = structuredClone(es) as Record<string, unknown>;
    delete (incompleto.nav as Record<string, unknown>).reservar;

    const resultado = esquemaDiccionario.safeParse(incompleto);

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0]?.path).toEqual(["nav", "reservar"]);
    }
  });

  it("rechaza una clave sobrante: significa una traducción huérfana", () => {
    const conSobra = structuredClone(es) as Record<string, unknown>;
    (conSobra.nav as Record<string, unknown>).seccionQueYaNoExiste = "algo";

    expect(esquemaDiccionario.safeParse(conSobra).success).toBe(false);
  });

  it("rechaza una cadena vacía: un texto en blanco es un texto olvidado", () => {
    const conVacio = structuredClone(es) as Record<string, unknown>;
    (conVacio.hero as Record<string, unknown>).titulo = "";

    expect(esquemaDiccionario.safeParse(conVacio).success).toBe(false);
  });
});

describe("carga de diccionarios", () => {
  it.each(IDIOMAS)("el diccionario '%s' cumple el esquema", async (idioma) => {
    const diccionario = await getDiccionario(idioma);
    expect(diccionario.nav.reservar.length).toBeGreaterThan(0);
  });

  it("todos los idiomas tienen exactamente el mismo juego de claves", async () => {
    const claves = await Promise.all(
      IDIOMAS.map(async (idioma) => {
        const d = await getDiccionario(idioma);
        return JSON.stringify(rutasDeClaves(d).sort());
      })
    );

    expect(new Set(claves).size).toBe(1);
  });
});

describe("detección de idioma", () => {
  it("reconoce los idiomas soportados", () => {
    expect(esIdioma("es")).toBe(true);
    expect(esIdioma("en")).toBe(true);
    expect(esIdioma("de")).toBe(true);
    expect(esIdioma("fr")).toBe(true);
    expect(esIdioma("it")).toBe(false);
  });

  it("elige el primer idioma soportado de Accept-Language", () => {
    expect(idiomaDesdeCabecera("en-US,en;q=0.9,es;q=0.8")).toBe("en");
    expect(idiomaDesdeCabecera("es-CR,es;q=0.9")).toBe("es");
    expect(idiomaDesdeCabecera("de-DE,de;q=0.9,en;q=0.8")).toBe("de");
    expect(idiomaDesdeCabecera("fr-FR,fr;q=0.9")).toBe("fr");
  });

  /*
   * El caso real que motivó agregar alemán y francés: el profesor da clase
   * desde Suiza, donde un navegador puede anunciar cualquiera de los tres
   * —o los tres, en ese orden—. Antes de este cambio los tres caían en
   * inglés por descarte; ahora el primero que el sitio cubre gana.
   */
  it("reconoce un navegador suizo en cualquiera de sus idiomas", () => {
    expect(idiomaDesdeCabecera("fr-CH,de;q=0.9,en;q=0.7")).toBe("fr");
    expect(idiomaDesdeCabecera("de-CH,fr;q=0.9,en;q=0.7")).toBe("de");
  });

  /** Italiano de verdad no está: «de momento solo esos», dijo el cliente. */
  it("salta un idioma que no cubrimos y cae al que sí está más adelante", () => {
    expect(idiomaDesdeCabecera("it-IT,it;q=0.9,es;q=0.7")).toBe("es");
  });

  it("cae al idioma por defecto sin cabecera, o si ninguna entrada es de las que cubrimos", () => {
    expect(idiomaDesdeCabecera(null)).toBe("en");
    expect(idiomaDesdeCabecera("")).toBe("en");
    expect(idiomaDesdeCabecera("it-IT,it;q=0.9")).toBe("en");
  });
});

/** Aplana un objeto a la lista de rutas de sus hojas: ["nav.inicio", ...] */
function rutasDeClaves(objeto: unknown, prefijo = ""): string[] {
  if (typeof objeto !== "object" || objeto === null) return [prefijo];

  return Object.entries(objeto).flatMap(([clave, valor]) =>
    rutasDeClaves(valor, prefijo ? `${prefijo}.${clave}` : clave)
  );
}
