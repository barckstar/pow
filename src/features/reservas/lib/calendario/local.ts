import { z } from "zod";
import horarioCrudo from "../../data/horario-profesor.json";
import {
  FranjaNoDisponible,
  type Franja,
  type ProveedorCalendario,
  type ReservaConfirmada,
  type SolicitudReserva,
} from "./tipos";
import { instanteDesdeHoraLocal, partesEnZona } from "../horas";

/**
 * Proveedor de calendario que genera las franjas a partir del horario semanal
 * del profesor.
 *
 * Es determinista y no toca la red: funciona hoy, se puede probar, y sirve de
 * implementación de referencia. Cuando exista un proveedor real, `remoto.ts`
 * ocupa su lugar sin que la interfaz cambie.
 *
 * Lo que NO hace, y por eso no puede ser la versión definitiva: no sabe qué
 * franjas ya están reservadas. Eso solo lo sabe un calendario de verdad.
 */

const DIAS = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
] as const;

const horaDelDia = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "formato HH:MM");

const esquemaHorario = z
  .object({
    /** Si el cliente ya confirmó este horario. Mientras sea false, la interfaz lo dice. */
    confirmado: z.boolean(),
    zona: z.string().min(1),
    duracionMinutos: z.number().int().positive(),
    descansoMinutos: z.number().int().min(0),
    antelacionMinimaHoras: z.number().int().min(0),
    diasVisibles: z.number().int().positive().max(120),
    semana: z.object(
      Object.fromEntries(
        DIAS.map((dia) => [
          dia,
          z.array(z.tuple([horaDelDia, horaDelDia])),
        ])
      ) as Record<(typeof DIAS)[number], z.ZodArray<z.ZodTuple<[typeof horaDelDia, typeof horaDelDia]>>>
    ),
  })
  .strict()
  .superRefine((h, ctx) => {
    for (const dia of DIAS) {
      for (const [indice, [desde, hasta]] of h.semana[dia].entries()) {
        if (desde >= hasta) {
          ctx.addIssue({
            code: "custom",
            path: ["semana", dia, indice],
            message: `el tramo ${desde}-${hasta} termina antes de empezar`,
          });
        }
      }
    }
  });

export const HORARIO = esquemaHorario.parse(horarioCrudo);

/** `true` mientras el cliente no haya confirmado su horario real. */
export const HORARIO_PROVISIONAL = !HORARIO.confirmado;

function minutosDesdeMedianoche(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function crearCalendarioLocal(): ProveedorCalendario {
  return {
    async disponibilidad(desde: Date, hasta: Date): Promise<Franja[]> {
      const franjas: Franja[] = [];
      const paso = HORARIO.duracionMinutos + HORARIO.descansoMinutos;

      const noAntesDe = new Date(
        Date.now() + HORARIO.antelacionMinimaHoras * 3_600_000
      );

      // Se recorre día a día EN LA ZONA DEL PROFESOR. Iterar en UTC daría el
      // día equivocado para quien reserva desde América, y además el horario
      // semanal está expresado en su hora de pared, no en UTC.
      const cursor = new Date(desde);

      while (cursor <= hasta) {
        const partes = partesEnZona(cursor, HORARIO.zona);

        // El día de la semana también hay que leerlo en su zona.
        const diaSemana = new Date(
          Date.UTC(partes.anio, partes.mes - 1, partes.dia)
        ).getUTCDay();
        const tramos = HORARIO.semana[DIAS[diaSemana]];

        for (const [inicioTramo, finTramo] of tramos) {
          const arranque = minutosDesdeMedianoche(inicioTramo);
          const cierre = minutosDesdeMedianoche(finTramo);

          for (let m = arranque; m + HORARIO.duracionMinutos <= cierre; m += paso) {
            const inicio = instanteDesdeHoraLocal(HORARIO.zona, {
              anio: partes.anio,
              mes: partes.mes,
              dia: partes.dia,
              hora: Math.floor(m / 60),
              minuto: m % 60,
            });

            if (inicio < desde || inicio > hasta) continue;

            franjas.push({
              inicio,
              fin: new Date(inicio.getTime() + HORARIO.duracionMinutos * 60_000),
              // Sin calendario real no se sabe qué está ocupado; lo único que
              // se puede afirmar es que una franja demasiado próxima no sirve.
              disponible: inicio >= noAntesDe,
            });
          }
        }

        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }

      return franjas.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
    },

    async reservar(solicitud: SolicitudReserva): Promise<ReservaConfirmada> {
      const desde = new Date(solicitud.inicio.getTime() - 60_000);
      const hasta = new Date(solicitud.inicio.getTime() + 60_000);
      const [franja] = await this.disponibilidad(desde, hasta, HORARIO.zona);

      if (!franja || !franja.disponible) {
        throw new FranjaNoDisponible(solicitud.inicio);
      }

      return {
        // Identificador derivado del instante: sin backend no hay secuencia,
        // y así dos reservas de la misma franja colisionan en vez de
        // duplicarse silenciosamente.
        id: `local-${solicitud.inicio.toISOString()}`,
        inicio: franja.inicio,
        fin: franja.fin,
        // Un enlace de videollamada lo genera el proveedor real. Inventarlo
        // aquí sería darle al estudiante una dirección que no existe.
        enlaceClase: null,
      };
    },

    async cancelar(): Promise<void> {
      // Sin almacenamiento no hay nada que cancelar. Se resuelve en silencio
      // en vez de lanzar, para que la interfaz pueda llamarlo sin ramificar.
    },
  };
}
