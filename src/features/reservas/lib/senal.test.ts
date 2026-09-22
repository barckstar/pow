import { describe, it, expect } from "vitest";
import { esCalendlyListo } from "./senal";

/*
 * Esto decide cuándo se quita el esqueleto del calendario. Si se equivoca por
 * arriba, tapa un calendario que funciona; si se equivoca por abajo, deja una
 * caja en blanco en la página que cierra la venta. Las dos se vieron pasar,
 * así que las dos tienen prueba.
 */
describe("esCalendlyListo", () => {
  const ORIGEN = "https://calendly.com";

  it("acepta el aviso de que Calendly ya pintó", () => {
    expect(
      esCalendlyListo(ORIGEN, {
        event: "calendly.page_height",
        payload: { height: "660px" },
      })
    ).toBe(true);
  });

  it("rechaza otros mensajes suyos, que no dicen que haya pintado", () => {
    expect(esCalendlyListo(ORIGEN, { event: "calendly.prefill" })).toBe(false);
    expect(esCalendlyListo(ORIGEN, { event: "calendly.event_scheduled" })).toBe(
      false
    );
  });

  /*
   * El caso que justifica comparar el origen por igualdad y no con
   * `includes` ni `startsWith`: un dominio que EMPIEZA por el bueno y no lo
   * es. Con una comprobación floja, cualquiera monta ese subdominio y decide
   * cuándo se quita el esqueleto de esta página.
   */
  it("rechaza orígenes que solo se le parecen", () => {
    const listo = { event: "calendly.page_height" };
    expect(esCalendlyListo("https://calendly.com.ejemplo.test", listo)).toBe(
      false
    );
    expect(esCalendlyListo("https://evil.test", listo)).toBe(false);
    expect(esCalendlyListo("http://calendly.com", listo)).toBe(false);
    expect(esCalendlyListo("https://www.calendly.com", listo)).toBe(false);
  });

  it("aguanta cualquier basura en el dato sin romperse", () => {
    for (const basura of [null, undefined, "", "calendly.page_height", 0, []]) {
      expect(esCalendlyListo(ORIGEN, basura)).toBe(false);
    }
  });
});
