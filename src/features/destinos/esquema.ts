import { z } from "zod";
import { localizado } from "@/shared/lib/localizado";
import datos from "./data/destinos.json";

/**
 * Lugares de Costa Rica donde se dan clases presenciales.
 *
 * Solo entran sitios REALES con foto verificada. El concept board original
 * prometía cinco países; sin sedes, profesores ni precios confirmados, eso
 * habría sido inventar datos.
 */
const esquemaDestino = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    nombre: z.string().min(1),
    /** Provincia o zona, para situar a quien no conoce el país. */
    zona: z.string().min(1),
    lema: localizado(z.string().min(3)),
    descripcion: localizado(z.string().min(40)),
    foto: z.string().startsWith("/fotos/"),
    /** Obligatorio y no vacío: una foto sin alt es una barrera. */
    fotoAlt: localizado(z.string().min(10)),
    /**
     * Si las clases presenciales en este destino ya están confirmadas.
     * PENDIENTE: el cliente no ha confirmado sedes, así que están en false y
     * la tarjeta lo dice en vez de prometer algo que no existe.
     */
    disponible: z.boolean(),
  })
  .strict();

const esquemaDestinos = z.array(esquemaDestino).min(1);

export type Destino = z.infer<typeof esquemaDestino>;

export const DESTINOS: Destino[] = esquemaDestinos.parse(datos);
