import type {
  Franja,
  ProveedorCalendario,
  ReservaConfirmada,
  SolicitudReserva,
} from "./tipos";

/**
 * Adaptador para el proveedor de calendario REAL.
 *
 * El contrato ya está firmado: lo único que falta es rellenar estos tres
 * métodos cuando se decida el proveedor (los candidatos hablados son Cal.com
 * y Google Calendar). Cambiar de `local` a `remoto` es una línea en
 * `shared/config`, y ni un solo componente de la interfaz cambia.
 *
 * Lo que hay que hacer al conectarlo:
 *
 *  1. Meter la clave de API en `.env.local` como CALENDARIO_API_KEY. Este
 *     archivo corre en el servidor, así que el secreto no llega al navegador.
 *  2. Traducir la respuesta del proveedor al tipo `Franja`. Ojo con las
 *     fechas: la mayoría devuelve cadenas ISO en UTC, y hay que construir
 *     `Date` con ellas, no con horas de pared.
 *  3. Marcar `disponible: false` en las franjas que el proveedor dé como
 *     ocupadas, en vez de omitirlas, para que la interfaz pueda mostrarlas
 *     tachadas — ver una franja ocupada informa más que no verla.
 *  4. Lanzar `FranjaNoDisponible` cuando el proveedor rechace una reserva por
 *     colisión; cualquier otro fallo debe propagarse como error normal para
 *     que la interfaz muestre el mensaje de error y no el de "sin huecos".
 */
export function crearCalendarioRemoto(): ProveedorCalendario {
  return {
    async disponibilidad(
      _desde: Date,
      _hasta: Date,
      _zona: string
    ): Promise<Franja[]> {
      throw new Error(
        "El calendario remoto todavía no está conectado. " +
          "Ver PENDIENTE.md: falta decidir el proveedor."
      );
    },

    async reservar(_solicitud: SolicitudReserva): Promise<ReservaConfirmada> {
      throw new Error(
        "El calendario remoto todavía no está conectado. " +
          "Ver PENDIENTE.md: falta decidir el proveedor."
      );
    },

    async cancelar(_id: string): Promise<void> {
      throw new Error(
        "El calendario remoto todavía no está conectado. " +
          "Ver PENDIENTE.md: falta decidir el proveedor."
      );
    },
  };
}
