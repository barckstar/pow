import { describe, expect, it, vi } from "vitest";

/**
 * El monto del depósito no está confirmado por el cliente, así que DEPOSITO
 * es `null` y `depositoObligatorio()` debe negarse a inventar uno.
 *
 * Esto no es una comprobación cosmética: si algún día alguien pusiera un
 * valor por defecto "temporal" aquí, el sitio cobraría un importe que el
 * negocio no ha decidido.
 */
describe("depósito", () => {
  it("se niega a operar mientras el monto no esté confirmado", async () => {
    const { depositoObligatorio, PagosNoConfigurados } = await import(
      "./paypal"
    );

    expect(() => depositoObligatorio()).toThrow(PagosNoConfigurados);
  });

  it("devuelve el monto configurado cuando existe", async () => {
    vi.resetModules();
    vi.doMock("@/shared/config/sitio", () => ({
      DEPOSITO: { monto: 20, moneda: "USD" },
    }));

    const { depositoObligatorio } = await import("./paypal");
    expect(depositoObligatorio()).toEqual({ monto: 20, moneda: "USD" });

    vi.doUnmock("@/shared/config/sitio");
    vi.resetModules();
  });
});
