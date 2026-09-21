import { z } from "zod";
import deUnsplash from "./creditos-fotos.json";
import cedidas from "./creditos-cedidas.json";

/**
 * Autoría de cada fotografía del sitio.
 *
 * La licencia de Unsplash no obliga a atribuir, pero saber de dónde salió cada
 * imagen es lo que permite reemplazarla o defenderla después — y esto es un
 * negocio real, no una maqueta.
 *
 * ============ SON DOS LISTAS Y NO UNA, POR UNA RAZÓN TONTA ============
 * `creditos-fotos.json` lo ESCRIBE `scripts/descargar-fotos.mjs` cada vez que
 * corre, y lo escribe entero. Una entrada añadida a mano ahí desaparece la
 * próxima vez que alguien descargue las fotos, sin avisar y sin dejar rastro.
 *
 * Así que las fotos que no vienen de Unsplash viven en su propio archivo, que
 * el script no toca nunca. Las dos se juntan aquí.
 * ======================================================================
 */

/** Lo que comparten las dos listas. */
const base = {
  archivo: z.string().startsWith("/fotos/"),
  autor: z.string().min(1),
  fuente: z.string().min(1),
  licencia: z.string().min(1),
  descripcion: z.string().min(10),
};

/** Las de Unsplash, con enlace al perfil del autor y a la foto. */
const esquemaDeBanco = z
  .object({
    ...base,
    perfil: z.string().url(),
    pagina: z.string().url(),
  })
  .strict();

/**
 * Las que entregó el cliente.
 *
 * ============ `permisoConfirmado` NO ES DECORATIVO ============
 * Son fotografías de las escuelas socias con PERSONAS RECONOCIBLES dentro.
 * Publicarlas necesita dos permisos que no son el mismo: el de la escuela
 * —derechos de autor sobre la foto— y el de quien sale —derechos de imagen—.
 *
 * El cliente pidió publicarlas ya y asumió esa responsabilidad, así que están
 * en el sitio. Pero el dato queda escrito: mientras sea `false`, la página de
 * créditos lo dice con la misma etiqueta amarilla que el resto de lo que está
 * sin confirmar. Un pendiente que se ve se arregla; uno que solo vive en un
 * correo, no.
 * =============================================================
 */
const esquemaCedida = z
  .object({
    ...base,
    permisoConfirmado: z.boolean(),
  })
  .strict();

export type CreditoDeBanco = z.infer<typeof esquemaDeBanco>;
export type CreditoCedida = z.infer<typeof esquemaCedida>;

/**
 * Una unión, no una intersección con campos opcionales.
 *
 * Con opcionales, `credito.perfil` compilaría para una foto cedida y saldría
 * `undefined` en producción: un enlace vacío en la página de créditos. Con la
 * unión, TypeScript obliga a preguntar de cuál de las dos se trata antes de
 * tocar nada que solo tenga una.
 */
export type Credito = CreditoDeBanco | CreditoCedida;

/** Discrimina las dos por un campo que solo existe en una. */
export function esDeBanco(credito: Credito): credito is CreditoDeBanco {
  return "perfil" in credito;
}

export const CREDITOS: Credito[] = [
  ...z.array(esquemaDeBanco).parse(deUnsplash),
  ...z.array(esquemaCedida).parse(cedidas),
];
