import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { rutas } from "@/shared/config/sitio";
import { SEO } from "@/shared/config/seo";
import { DESTINOS } from "@/features/destinos/esquema";
import { TarjetaDestino } from "@/features/destinos/components/TarjetaDestino";

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
    ...SEO.destinos[lang],
    ruta: rutas.destinos(lang),
    lang,
    imagen: "/fotos/manuel-antonio.jpg",
    alternativas: mismaRutaEnTodosLosIdiomas(rutas.destinos),
  });
}

export default async function PaginaDestinos({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);

  return (
    <section className="seccion">
      <div className="seccion__interior">
        <h1 className="seccion__titulo">{t.paginas.destinos.titulo}</h1>
        <p className="seccion__intro">{t.paginas.destinos.intro}</p>

        <div className="destinos">
          {DESTINOS.map((destino, indice) => (
            <TarjetaDestino
              key={destino.id}
              destino={destino}
              lang={idioma}
              t={t}
              prioridad={indice === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
