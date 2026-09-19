import { describe, expect, it } from "vitest";
import {
  desfaseEnMinutos,
  diferenciaEnHoras,
  horaEnZona,
  instanteDesdeHoraLocal,
  partesEnZona,
} from "./horas";

const ZURICH = "Europe/Zurich";
const COSTA_RICA = "America/Costa_Rica";

describe("desfase horario", () => {
  it("Suiza está en UTC+1 en enero", () => {
    expect(desfaseEnMinutos(new Date("2026-01-15T12:00:00Z"), ZURICH)).toBe(60);
  });

  it("Suiza está en UTC+2 en julio, por el horario de verano", () => {
    expect(desfaseEnMinutos(new Date("2026-07-15T12:00:00Z"), ZURICH)).toBe(120);
  });

  it("Costa Rica está en UTC-6 todo el año: no aplica horario de verano", () => {
    const enero = desfaseEnMinutos(new Date("2026-01-15T12:00:00Z"), COSTA_RICA);
    const julio = desfaseEnMinutos(new Date("2026-07-15T12:00:00Z"), COSTA_RICA);

    expect(enero).toBe(-360);
    expect(julio).toBe(-360);
  });
});

/*
 * Este bloque es la razón de ser del módulo. La diferencia entre la zona del
 * profesor y la de Costa Rica NO es constante, porque solo una de las dos
 * cambia la hora. Dar por fija esa diferencia hace que el estudiante llegue a
 * la clase una hora tarde durante medio año.
 */
describe("el cambio de horario de verano mueve la diferencia", () => {
  it("son 7 horas en invierno europeo", () => {
    expect(
      diferenciaEnHoras(new Date("2026-01-15T12:00:00Z"), ZURICH, COSTA_RICA)
    ).toBe(7);
  });

  it("son 8 horas en verano europeo", () => {
    expect(
      diferenciaEnHoras(new Date("2026-07-15T12:00:00Z"), ZURICH, COSTA_RICA)
    ).toBe(8);
  });

  it("una clase a las 10:00 en Suiza cae a las 03:00 en Costa Rica en enero", () => {
    const instante = instanteDesdeHoraLocal(ZURICH, {
      anio: 2026,
      mes: 1,
      dia: 15,
      hora: 10,
      minuto: 0,
    });

    expect(horaEnZona(instante, ZURICH)).toBe("10:00");
    expect(horaEnZona(instante, COSTA_RICA)).toBe("03:00");
  });

  it("la MISMA clase a las 10:00 cae a las 02:00 en Costa Rica en julio", () => {
    const instante = instanteDesdeHoraLocal(ZURICH, {
      anio: 2026,
      mes: 7,
      dia: 15,
      hora: 10,
      minuto: 0,
    });

    expect(horaEnZona(instante, ZURICH)).toBe("10:00");
    expect(horaEnZona(instante, COSTA_RICA)).toBe("02:00");
  });
});

describe("semanas del cambio de horario", () => {
  // En 2026 Europa adelanta el reloj el domingo 29 de marzo y lo atrasa el
  // domingo 25 de octubre, ambos a las 01:00 UTC.
  it("el día antes de adelantar sigue en UTC+1", () => {
    const instante = instanteDesdeHoraLocal(ZURICH, {
      anio: 2026,
      mes: 3,
      dia: 28,
      hora: 10,
      minuto: 0,
    });
    expect(horaEnZona(instante, ZURICH)).toBe("10:00");
    expect(diferenciaEnHoras(instante, ZURICH, COSTA_RICA)).toBe(7);
  });

  it("el día después de adelantar ya está en UTC+2", () => {
    const instante = instanteDesdeHoraLocal(ZURICH, {
      anio: 2026,
      mes: 3,
      dia: 30,
      hora: 10,
      minuto: 0,
    });
    expect(horaEnZona(instante, ZURICH)).toBe("10:00");
    expect(diferenciaEnHoras(instante, ZURICH, COSTA_RICA)).toBe(8);
  });

  it("el día después de atrasar vuelve a UTC+1", () => {
    const instante = instanteDesdeHoraLocal(ZURICH, {
      anio: 2026,
      mes: 10,
      dia: 26,
      hora: 10,
      minuto: 0,
    });
    expect(horaEnZona(instante, ZURICH)).toBe("10:00");
    expect(diferenciaEnHoras(instante, ZURICH, COSTA_RICA)).toBe(7);
  });
});

describe("ida y vuelta", () => {
  it("descomponer y recomponer devuelve el mismo instante", () => {
    for (const iso of [
      "2026-01-15T09:30:00Z",
      "2026-03-29T05:00:00Z",
      "2026-07-04T18:45:00Z",
      "2026-10-25T23:15:00Z",
    ]) {
      const original = new Date(iso);
      const partes = partesEnZona(original, ZURICH);
      const recompuesto = instanteDesdeHoraLocal(ZURICH, partes);

      expect(recompuesto.toISOString()).toBe(original.toISOString());
    }
  });

  it("funciona igual para una zona sin horario de verano", () => {
    const original = new Date("2026-07-04T18:00:00Z");
    const partes = partesEnZona(original, COSTA_RICA);
    expect(instanteDesdeHoraLocal(COSTA_RICA, partes).toISOString()).toBe(
      original.toISOString()
    );
  });
});

describe("formato de hora", () => {
  it("usa siempre dos dígitos", () => {
    const instante = instanteDesdeHoraLocal(COSTA_RICA, {
      anio: 2026,
      mes: 5,
      dia: 3,
      hora: 9,
      minuto: 5,
    });
    expect(horaEnZona(instante, COSTA_RICA)).toBe("09:05");
  });

  it("la medianoche es 00:00 y no 24:00", () => {
    const instante = instanteDesdeHoraLocal(COSTA_RICA, {
      anio: 2026,
      mes: 5,
      dia: 3,
      hora: 0,
      minuto: 0,
    });
    expect(horaEnZona(instante, COSTA_RICA)).toBe("00:00");
  });
});
