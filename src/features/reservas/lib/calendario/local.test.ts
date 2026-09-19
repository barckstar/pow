import { describe, expect, it } from "vitest";
import { crearCalendarioLocal, HORARIO } from "./local";
import { horaEnZona, partesEnZona } from "../horas";

const calendario = crearCalendarioLocal();

/** Lunes 2026-10-05, un día con tramo 17:00-21:00 en el horario del profesor. */
const LUNES = new Date("2026-10-05T00:00:00Z");
const MARTES = new Date("2026-10-06T00:00:00Z");
/** Domingo 2026-10-11: el horario no tiene tramos ese día. */
const DOMINGO = new Date("2026-10-11T00:00:00Z");
const LUNES_SIGUIENTE = new Date("2026-10-12T00:00:00Z");

describe("franjas a partir del horario del profesor", () => {
  it("ofrece franjas dentro del tramo declarado", async () => {
    const franjas = await calendario.disponibilidad(LUNES, MARTES, HORARIO.zona);
    expect(franjas.length).toBeGreaterThan(0);

    for (const franja of franjas) {
      const hora = horaEnZona(franja.inicio, HORARIO.zona);
      expect(hora >= "17:00").toBe(true);
      expect(hora < "21:00").toBe(true);
    }
  });

  it("no ofrece nada un día sin tramos en el horario", async () => {
    const franjas = await calendario.disponibilidad(
      DOMINGO,
      LUNES_SIGUIENTE,
      HORARIO.zona
    );
    const delDomingo = franjas.filter(
      (f) => partesEnZona(f.inicio, HORARIO.zona).dia === 11
    );
    expect(delDomingo).toHaveLength(0);
  });

  it("cada franja dura lo que dice el horario", async () => {
    const [franja] = await calendario.disponibilidad(
      LUNES,
      MARTES,
      HORARIO.zona
    );
    const minutos = (franja.fin.getTime() - franja.inicio.getTime()) / 60_000;
    expect(minutos).toBe(HORARIO.duracionMinutos);
  });

  it("las franjas vienen ordenadas y sin solaparse", async () => {
    const franjas = await calendario.disponibilidad(
      LUNES,
      LUNES_SIGUIENTE,
      HORARIO.zona
    );

    for (let i = 1; i < franjas.length; i += 1) {
      expect(franjas[i].inicio.getTime()).toBeGreaterThanOrEqual(
        franjas[i - 1].fin.getTime()
      );
    }
  });

  it("marca como no disponible lo que cae dentro de la antelación mínima", async () => {
    const ahora = new Date();
    const dentroDeTresSemanas = new Date(
      ahora.getTime() + 21 * 86_400_000
    );
    const franjas = await calendario.disponibilidad(
      ahora,
      dentroDeTresSemanas,
      HORARIO.zona
    );

    const limite = new Date(
      ahora.getTime() + HORARIO.antelacionMinimaHoras * 3_600_000
    );

    for (const franja of franjas) {
      expect(franja.disponible).toBe(franja.inicio >= limite);
    }
  });
});

/*
 * El horario del profesor está escrito en su hora de pared suiza. Cuando
 * Europa cambia la hora, esas franjas siguen a las 17:00 para él, pero se
 * mueven una hora para el estudiante. Si esto se rompiera, media clientela
 * llegaría tarde durante medio año.
 */
describe("las franjas siguen la hora de pared del profesor a través del cambio horario", () => {
  it("una franja de octubre (antes del cambio) empieza a las 17:00 en Suiza", async () => {
    const franjas = await calendario.disponibilidad(
      new Date("2026-10-19T00:00:00Z"),
      new Date("2026-10-20T00:00:00Z"),
      HORARIO.zona
    );
    expect(horaEnZona(franjas[0].inicio, HORARIO.zona)).toBe("17:00");
  });

  it("una franja de noviembre (después del cambio) también empieza a las 17:00 en Suiza", async () => {
    const franjas = await calendario.disponibilidad(
      new Date("2026-11-02T00:00:00Z"),
      new Date("2026-11-03T00:00:00Z"),
      HORARIO.zona
    );
    expect(horaEnZona(franjas[0].inicio, HORARIO.zona)).toBe("17:00");
  });

  it("pero en Costa Rica esas dos franjas caen a horas distintas", async () => {
    const [octubre] = await calendario.disponibilidad(
      new Date("2026-10-19T00:00:00Z"),
      new Date("2026-10-20T00:00:00Z"),
      HORARIO.zona
    );
    const [noviembre] = await calendario.disponibilidad(
      new Date("2026-11-02T00:00:00Z"),
      new Date("2026-11-03T00:00:00Z"),
      HORARIO.zona
    );

    expect(horaEnZona(octubre.inicio, "America/Costa_Rica")).toBe("09:00");
    expect(horaEnZona(noviembre.inicio, "America/Costa_Rica")).toBe("10:00");
  });
});
