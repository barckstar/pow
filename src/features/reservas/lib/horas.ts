/**
 * Conversión de horas entre zonas, sin librería de fechas.
 *
 * Todo pasa por aquí porque el caso de este sitio tiene una trampa real: el
 * profesor está en Suiza, que aplica horario de verano, y las clases
 * presenciales son en Costa Rica, que NO lo aplica nunca. La diferencia entre
 * ambas no es fija: son 7 horas en invierno europeo y 8 en verano.
 *
 * Si esto falla, el estudiante llega a la clase con una hora de diferencia.
 * Por eso vive aislado y con tests a ambos lados del cambio.
 */

export type PartesDeFecha = {
  anio: number;
  mes: number;
  dia: number;
  hora: number;
  minuto: number;
};

const FORMATEADORES = new Map<string, Intl.DateTimeFormat>();

function formateador(zona: string): Intl.DateTimeFormat {
  const cacheado = FORMATEADORES.get(zona);
  if (cacheado) return cacheado;

  const nuevo = new Intl.DateTimeFormat("en-US", {
    timeZone: zona,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  FORMATEADORES.set(zona, nuevo);
  return nuevo;
}

/** Descompone un instante en su hora de pared dentro de una zona. */
export function partesEnZona(instante: Date, zona: string): PartesDeFecha {
  const partes = formateador(zona).formatToParts(instante);
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    Number(partes.find((p) => p.type === tipo)?.value);

  return {
    anio: valor("year"),
    mes: valor("month"),
    dia: valor("day"),
    // Intl devuelve "24" para la medianoche en algunos entornos; se normaliza.
    hora: valor("hour") % 24,
    minuto: valor("minute"),
  };
}

/**
 * Minutos que hay que sumarle al UTC para obtener la hora local de la zona.
 * Positivo al este de Greenwich. Depende del instante: eso es precisamente
 * el horario de verano.
 */
export function desfaseEnMinutos(instante: Date, zona: string): number {
  const p = partesEnZona(instante, zona);
  const segundos = formateador(zona)
    .formatToParts(instante)
    .find((x) => x.type === "second")?.value;

  const comoSiFueraUTC = Date.UTC(
    p.anio,
    p.mes - 1,
    p.dia,
    p.hora,
    p.minuto,
    Number(segundos ?? 0)
  );

  return Math.round((comoSiFueraUTC - instante.getTime()) / 60_000);
}

/**
 * Construye el instante exacto que corresponde a una hora de pared en una
 * zona concreta. Es la operación inversa de `partesEnZona`.
 *
 * Se hace en dos pasadas: la primera estima el desfase suponiendo que la hora
 * dada es UTC, y la segunda lo recalcula ya situada en el instante correcto.
 * Hace falta porque el desfase depende del propio instante, y una sola pasada
 * se equivoca en una hora justo en las semanas del cambio de horario.
 */
export function instanteDesdeHoraLocal(
  zona: string,
  { anio, mes, dia, hora, minuto }: PartesDeFecha
): Date {
  const supuesto = Date.UTC(anio, mes - 1, dia, hora, minuto);

  const desfase1 = desfaseEnMinutos(new Date(supuesto), zona);
  const primerIntento = new Date(supuesto - desfase1 * 60_000);

  const desfase2 = desfaseEnMinutos(primerIntento, zona);
  if (desfase2 === desfase1) return primerIntento;

  return new Date(supuesto - desfase2 * 60_000);
}

/**
 * Diferencia en horas entre dos zonas EN UN INSTANTE DADO.
 * Se pasa el instante justamente porque no es constante.
 */
export function diferenciaEnHoras(
  instante: Date,
  zonaA: string,
  zonaB: string
): number {
  return (
    (desfaseEnMinutos(instante, zonaA) - desfaseEnMinutos(instante, zonaB)) / 60
  );
}

/** La hora "HH:MM" de un instante en una zona, en formato de 24 horas. */
export function horaEnZona(instante: Date, zona: string): string {
  const { hora, minuto } = partesEnZona(instante, zona);
  return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
}

/** Zona horaria del visitante, o una por defecto si el navegador no la da. */
export function zonaDelVisitante(porDefecto: string): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || porDefecto;
  } catch {
    return porDefecto;
  }
}
