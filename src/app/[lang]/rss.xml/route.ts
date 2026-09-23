import { esIdioma, IDIOMAS, LOCALE, type Idioma } from "@/shared/i18n/config";
import { leerArticulos } from "@/features/blog/lib/leer";
import { NOMBRE_SITIO, rutas, URL_BASE } from "@/shared/config/sitio";

export function generateStaticParams() {
  return IDIOMAS.map((lang) => ({ lang }));
}

/*
 * Era un `lang === "es" ? … : …`, y de/fr caían en la rama de inglés sin que
 * nadie lo decidiera — el mismo hueco que en la página de etiquetas del
 * blog. Quitar español de `IDIOMAS` lo convirtió en un error de tipo, que es
 * justo la señal de que hacía falta arreglarlo de verdad.
 */
const DESCRIPCION_FEED: Record<Idioma, string> = {
  en: "Costa Rican Spanish explained by someone who has spoken it since birth.",
  de: "Costa-ricanisches Spanisch erklärt von jemandem, der es von Geburt an spricht.",
  fr: "L'espagnol costaricien expliqué par quelqu'un qui le parle depuis sa naissance.",
};

/** Escapa lo que XML no admite dentro de un nodo de texto. */
function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(
  _peticion: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  if (!esIdioma(lang)) {
    return new Response("Not found", { status: 404 });
  }

  // Un feed por idioma: mezclarlos le daría al lector artículos en una lengua
  // que quizá no lee.
  const articulos = await leerArticulos(lang);

  const items = articulos
    .map((articulo) => {
      const url = `${URL_BASE}${rutas.articulo(lang, articulo.slug)}`;
      return `    <item>
      <title>${escapar(articulo.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapar(articulo.resumen)}</description>
      <pubDate>${articulo.fecha.toUTCString()}</pubDate>
${articulo.etiquetas
  .map((e) => `      <category>${escapar(e)}</category>`)
  .join("\n")}
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapar(NOMBRE_SITIO)}</title>
    <link>${URL_BASE}${rutas.blog(lang)}</link>
    <description>${escapar(DESCRIPCION_FEED[lang])}</description>
    <language>${LOCALE[lang].replace("_", "-")}</language>
    <atom:link href="${URL_BASE}/${lang}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
