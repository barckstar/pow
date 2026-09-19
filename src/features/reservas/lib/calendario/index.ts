import type { ProveedorCalendario } from "./tipos";
import { crearCalendarioLocal } from "./local";
import { crearCalendarioRemoto } from "./remoto";

/**
 * ESTA es la línea que se cambia el día que exista proveedor de calendario.
 *
 * Nada más en el proyecto necesita tocarse: los componentes hablan con la
 * interfaz `ProveedorCalendario`, no con una implementación.
 */
const PROVEEDOR: "local" | "remoto" = "local";

let instancia: ProveedorCalendario | null = null;

export function calendario(): ProveedorCalendario {
  if (!instancia) {
    instancia =
      PROVEEDOR === "local" ? crearCalendarioLocal() : crearCalendarioRemoto();
  }
  return instancia;
}

export type { Franja, ProveedorCalendario } from "./tipos";
export { FranjaNoDisponible } from "./tipos";
export { HORARIO, HORARIO_PROVISIONAL } from "./local";
