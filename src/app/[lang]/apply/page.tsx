import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { rutas } from "@/shared/config/sitio";
import { SEO } from "@/shared/config/seo";
import { PaginaDeSolicitud } from "@/features/solicitud/components/PaginaDeSolicitud";

export function generateStaticParams() {
  return IDIOMAS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!esIdioma(lang)) return {};

  return metadatosDe({
    ...SEO.solicitud[lang],
    ruta: rutas.solicitud(lang),
    lang,
    imagen: "/fotos/clase-manuel-antonio.jpg",
    alternativas: mismaRutaEnTodosLosIdiomas((l) => rutas.solicitud(l)),
  });
}

/**
 * El formulario sin destino elegido.
 *
 * Existe aparte de `/solicitud/[destino]` para quien llega por el menú o por
 * un enlace suelto, sin haber pasado por una ficha. El selector sale vacío y
 * lo elige quien rellena.
 */
export default async function PaginaSolicitud({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);

  return <PaginaDeSolicitud lang={idioma} t={t} />;
}
