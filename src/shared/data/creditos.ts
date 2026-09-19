import { z } from "zod";
import datos from "./creditos-fotos.json";

/**
 * Autoría de cada fotografía del sitio.
 *
 * Lo genera `scripts/descargar-fotos.mjs` al descargarlas y se valida aquí al
 * importar. La licencia de Unsplash no obliga a atribuir, pero saber de dónde
 * salió cada imagen es lo que permite reemplazarla o defenderla después — y
 * esto es un negocio real, no una maqueta.
 */
const esquemaCredito = z
  .object({
    archivo: z.string().startsWith("/fotos/"),
    autor: z.string().min(1),
    perfil: z.string().url(),
    pagina: z.string().url(),
    fuente: z.string().min(1),
    licencia: z.string().min(1),
    descripcion: z.string().min(10),
  })
  .strict();

export type Credito = z.infer<typeof esquemaCredito>;

export const CREDITOS: Credito[] = z.array(esquemaCredito).parse(datos);
