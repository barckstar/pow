/**
 * El contrato del calendario.
 *
 * La interfaz de reserva se programa CONTRA ESTO, nunca contra un proveedor
 * concreto. Hoy no hay proveedor decidido; cuando lo haya, se escribe un
 * adaptador que cumpla esta interfaz y se cambia una línea en la
 * configuración. La interfaz no se entera.
 */

/** Una franja concreta ofrecida al visitante. */
export type Franja = {
  /** Instante exacto de inicio. Sin zona: es un punto en el tiempo. */
  inicio: Date;
  fin: Date;
  disponible: boolean;
};

export type SolicitudReserva = {
  inicio: Date;
  /** Identificador del tipo de clase elegido. */
  tipoClase: string;
  /** Zona horaria desde la que reserva el estudiante, para la confirmación. */
  zonaEstudiante: string;
  nombre: string;
  correo: string;
  /** Referencia del pago del depósito, cuando ya se capturó. */
  referenciaPago?: string;
};

export type ReservaConfirmada = {
  id: string;
  inicio: Date;
  fin: Date;
  /** Enlace a la videollamada, si el proveedor lo genera. */
  enlaceClase: string | null;
};

export interface ProveedorCalendario {
  /** Franjas entre dos fechas. `zona` es solo informativa para el proveedor. */
  disponibilidad(desde: Date, hasta: Date, zona: string): Promise<Franja[]>;
  reservar(solicitud: SolicitudReserva): Promise<ReservaConfirmada>;
  cancelar(id: string): Promise<void>;
}

/**
 * Error que la interfaz sabe distinguir de un fallo de red: significa que la
 * franja se ocupó entre que se mostró y se intentó reservar.
 */
export class FranjaNoDisponible extends Error {
  constructor(inicio: Date) {
    super(`La franja de ${inicio.toISOString()} ya no está disponible`);
    this.name = "FranjaNoDisponible";
  }
}
