import { describe, expect, it } from "vitest";
import {
  calcularEstado,
  UMBRAL_MICRO_SCROLL,
  UMBRAL_OCULTAR,
  UMBRAL_TOPE,
} from "./navbarScroll";

const base = { ultimaY: 0, ocultoPrevio: false, menuAbierto: false };

describe("estado alto / compacto", () => {
  it("está en el tope justo debajo del umbral", () => {
    expect(calcularEstado({ ...base, y: UMBRAL_TOPE - 1 }).enTope).toBe(true);
  });

  it("se compacta exactamente en el umbral", () => {
    expect(calcularEstado({ ...base, y: UMBRAL_TOPE }).enTope).toBe(false);
  });

  it("sigue compacto muy abajo de la página", () => {
    expect(calcularEstado({ ...base, y: 4000, ultimaY: 3900 }).enTope).toBe(
      false
    );
  });
});

describe("ocultar y reaparecer", () => {
  it("nunca se oculta dentro de los primeros 150 px", () => {
    const estado = calcularEstado({
      ...base,
      y: UMBRAL_OCULTAR,
      ultimaY: UMBRAL_OCULTAR - 100,
    });
    expect(estado.oculto).toBe(false);
  });

  it("se oculta al bajar una vez pasados los 150 px", () => {
    const estado = calcularEstado({
      ...base,
      y: UMBRAL_OCULTAR + 100,
      ultimaY: UMBRAL_OCULTAR + 20,
    });
    expect(estado.oculto).toBe(true);
  });

  it("reaparece al subir", () => {
    const estado = calcularEstado({
      y: 600,
      ultimaY: 700,
      ocultoPrevio: true,
      menuAbierto: false,
    });
    expect(estado.oculto).toBe(false);
  });

  it("volver al tope lo devuelve visible y alto", () => {
    const estado = calcularEstado({
      y: 0,
      ultimaY: 400,
      ocultoPrevio: true,
      menuAbierto: false,
    });
    expect(estado).toEqual({ enTope: true, oculto: false });
  });
});

describe("umbral de micro-scroll", () => {
  it("un desplazamiento de 5 px hacia abajo no lo oculta", () => {
    const estado = calcularEstado({
      y: 505,
      ultimaY: 500,
      ocultoPrevio: false,
      menuAbierto: false,
    });
    expect(estado.oculto).toBe(false);
  });

  it("un desplazamiento de 5 px hacia arriba no lo muestra", () => {
    const estado = calcularEstado({
      y: 495,
      ultimaY: 500,
      ocultoPrevio: true,
      menuAbierto: false,
    });
    expect(estado.oculto).toBe(true);
  });

  it("justo en el umbral sí reacciona", () => {
    const estado = calcularEstado({
      y: 500 + UMBRAL_MICRO_SCROLL,
      ultimaY: 500,
      ocultoPrevio: false,
      menuAbierto: false,
    });
    expect(estado.oculto).toBe(true);
  });
});

describe("menú móvil abierto", () => {
  it("no se oculta aunque se baje, o el menú se iría con él", () => {
    const estado = calcularEstado({
      y: 900,
      ultimaY: 400,
      ocultoPrevio: false,
      menuAbierto: true,
    });
    expect(estado.oculto).toBe(false);
  });

  it("si ya estaba oculto y se abre el menú, vuelve a aparecer", () => {
    const estado = calcularEstado({
      y: 900,
      ultimaY: 900,
      ocultoPrevio: true,
      menuAbierto: true,
    });
    expect(estado.oculto).toBe(false);
  });
});
