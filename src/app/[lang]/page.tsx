import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { esIdioma, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { rutas } from "@/shared/config/sitio";
import { Hero } from "@/features/landing/components/Hero";
import { Experiencias } from "@/features/landing/components/Experiencias";
import { Confianza } from "@/features/landing/components/Confianza";
import { TiquismoDelDia } from "@/features/tiquismos/components/TiquismoDelDia";
import { Faq } from "@/features/faq/components/Faq";
import { TarjetaDestino } from "@/features/destinos/components/TarjetaDestino";
import { DESTINOS } from "@/features/destinos/esquema";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";

const TEXTOS = {
  es: {
    titulo: "Aprendé español costarricense",
    descripcion:
      "Clases de español costarricense en línea con profesor nativo, o presenciales en Manuel Antonio y La Fortuna. El español que de verdad se habla en Costa Rica.",
  },
  en: {
    titulo: "Learn Costa Rican Spanish",
    descripcion:
      "Costa Rican Spanish lessons online with a native teacher, or in person in Manuel Antonio and La Fortuna. The Spanish that is actually spoken in Costa Rica.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!esIdioma(lang)) return {};

  return metadatosDe({
    titulo: TEXTOS[lang].titulo,
    descripcion: TEXTOS[lang].descripcion,
    ruta: rutas.inicio(lang),
    lang,
    imagen: "/fotos/manuel-antonio.jpg",
    alternativas: mismaRutaEnTodosLosIdiomas(rutas.inicio),
  });
}

export default async function PaginaInicio({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);

  return (
    <>
      <Hero lang={idioma} t={t} />
      <Confianza t={t} />
      <Experiencias lang={idioma} t={t} />

      <section className="seccion con-adornos" aria-labelledby="destinos-titulo">
        <DecoradosSeccion variante="destinos" />

        <div className="seccion__interior">
          <h2 className="seccion__titulo" id="destinos-titulo">
            {t.destinos.titulo}
          </h2>
          <p className="seccion__intro">{t.destinos.intro}</p>

          <div className="destinos revelar">
            {DESTINOS.map((destino) => (
              <TarjetaDestino
                key={destino.id}
                destino={destino}
                lang={idioma}
                t={t}
              />
            ))}
          </div>

          <Link href={rutas.destinos(idioma)} className="seccion__enlace">
            {t.destinos.verTodos} →
          </Link>
        </div>
      </section>

      <TiquismoDelDia lang={idioma} t={t} />

      {/* El FAQ va al final: resuelve la última objeción justo antes de que
          alguien se vaya, y aporta el JSON-LD de FAQPage. */}
      <Faq lang={idioma} t={t} />
    </>
  );
}
