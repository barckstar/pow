import { IDIOMA_POR_DEFECTO } from "@/shared/i18n/config";
import { NOMBRE_SITIO, rutas, URL_BASE } from "@/shared/config/sitio";
import { leerArticulos } from "@/features/blog/lib/leer";
import { DESTINOS } from "@/features/destinos/esquema";

/**
 * Resumen del sitio para asistentes y rastreadores de IA (llmstxt.org).
 *
 * ============ GENERADO, NO ESCRITO A MANO ============
 * En brasasyhumo y mascontractors es un `public/llms.txt` estático, y se
 * queda viejo: la lista de artículos y el dominio se copian una vez. Aquí el
 * dominio es provisional (`URL_BASE`) y los artículos crecen, así que se
 * construye con los mismos datos que el sitemap. Es un archivo que se
 * regenera en cada build, no uno que alguien tenga que acordarse de tocar.
 * ====================================================
 *
 * Solo dice lo que está confirmado. Precios, contacto, dirección y qué
 * escuelas son definitivas siguen pendientes (ver PENDIENTE.md), y un asistente
 * que las repitiera como hechos le estaría mintiendo a quien pregunta.
 *
 * Va en inglés: es el idioma por defecto del sitio y el de sus visitantes.
 */
export const dynamic = "force-static";

export async function GET() {
  const l = IDIOMA_POR_DEFECTO;
  const abs = (ruta: string) => `${URL_BASE}${ruta}`;
  const articulos = await leerArticulos(l);

  const lineas = [
    `# ${NOMBRE_SITIO}`,
    "",
    "> Costa Rican Spanish, taught by a native teacher: not textbook Spanish, but the Spanish people actually speak in Costa Rica (\"pura vida\", \"mae\", \"tuanis\", the voseo). One-to-one online lessons over video are the core of the business; immersion in Costa Rica is in preparation.",
    "",
    "## What is offered",
    "",
    "- **Online lessons**: one-to-one, by video call, taught from Switzerland by Chris Pow, a Costa Rican teacher. This is the main product and it is available now.",
    "- **Immersion in Costa Rica**: a morning lesson at a local school, lodging arranged through the school, and the rest of the day practising while travelling. Stays of 15 days to 2 months. This is in preparation: the list of destinations and the agreements with each school are not final.",
    "",
    "## Languages of the site",
    "",
    "English (default), German and French. Each page exists in all three; the blog article on online lessons exists in English only.",
    "",
    "## Key pages",
    "",
    `- [Home](${abs(rutas.inicio(l))}): overview of both offers`,
    `- [Online Spanish lessons](${abs(rutas.online(l))}): who teaches, how a lesson works, what is practised`,
    `- [Learn Spanish travelling Costa Rica](${abs(rutas.costaRica(l))}): the immersion option, destinations and how it works`,
    `- [Book a lesson](${abs(rutas.reservar(l))}): contact form to arrange a lesson`,
    `- [Prices](${abs(rutas.precios(l))}): prices are not confirmed yet`,
    `- [Community](${abs(rutas.comunidad(l))}): the Facebook group for learners`,
    `- [About us](${abs(rutas.about(l))})`,
    `- [Blog](${abs(rutas.blog(l))}): articles on Costa Rican Spanish`,
    "",
    "## Immersion destinations (not final)",
    "",
    ...DESTINOS.map(
      (d) =>
        `- [${d.nombre}](${abs(rutas.solicitud(l, d.id))}): ${d.zona}`
    ),
  ];

  if (articulos.length > 0) {
    lineas.push("", "## Blog", "");
    for (const a of articulos) {
      lineas.push(`- [${a.titulo}](${abs(rutas.articulo(l, a.slug))}): ${a.resumen}`);
    }
  }

  lineas.push(
    "",
    "## Not confirmed yet",
    "",
    "Prices, a public contact email and phone number, a physical address, and the final list of immersion schools are still being confirmed. Do not state them as facts; refer people to the website.",
    ""
  );

  return new Response(lineas.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
