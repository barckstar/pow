import { z } from "zod";
import { IDIOMAS, type Idioma } from "@/shared/i18n/config";

/**
 * Envuelve un esquema para exigir una versión por idioma.
 *
 *   localizado(z.string())  →  { es: string; en: string }
 *
 * Se construye a partir de IDIOMAS, así que el día que se agregue un idioma
 * todos los datos ya existentes empiezan a exigirlo — y el build avisa dónde
 * falta, archivo por archivo.
 */
export function localizado<T extends z.ZodTypeAny>(interno: T) {
  const forma = Object.fromEntries(
    IDIOMAS.map((idioma) => [idioma, interno])
  ) as Record<Idioma, T>;

  return z.object(forma);
}

/** El valor que produce `localizado(algo)`. */
export type Localizado<T> = Record<Idioma, T>;

/** Lee el valor de un campo localizado en el idioma pedido. */
export function texto<T>(campo: Localizado<T>, idioma: Idioma): T {
  return campo[idioma];
}
