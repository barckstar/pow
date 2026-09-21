import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { rutas } from "@/shared/config/sitio";
import { etiquetasDe, leerArticulos } from "@/features/blog/lib/leer";
import { TarjetaArticulo } from "@/features/blog/components/TarjetaArticulo";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";

const TEXTOS = {
  es: {
    titulo: "Blog sobre español costarricense",
    descripcion:
      "Artículos sobre el español que se habla en Costa Rica: expresiones, voseo, cultura y cómo suena de verdad la lengua en el país.",
  },
  en: {
    titulo: "Costa Rican Spanish blog",
    descripcion:
      "Articles about the Spanish spoken in Costa Rica: expressions, voseo, culture, and how the language actually sounds in the country.",
  },
} as const;

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
    titulo: TEXTOS[lang].titulo,
    descripcion: TEXTOS[lang].descripcion,
    ruta: rutas.blog(lang),
    lang,
    alternativas: mismaRutaEnTodosLosIdiomas(rutas.blog),
  });
}

export default async function PaginaBlog({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);
  const articulos = await leerArticulos(idioma);
  const etiquetas = await etiquetasDe(idioma);

  return (
    <section className="seccion con-adornos">
      <DecoradosSeccion variante="blog" />

      <div className="seccion__interior">
        <h1 className="seccion__titulo">{t.blog.titulo}</h1>
        <p className="seccion__intro">{t.blog.intro}</p>

        {etiquetas.length > 0 ? (
          <nav className="blog__etiquetas" aria-label={t.blog.etiquetas}>
            {etiquetas.map(({ etiqueta, total }) => (
              <Link
                key={etiqueta}
                href={rutas.etiqueta(idioma, etiqueta)}
                className="blog__etiqueta"
              >
                #{etiqueta} <span aria-hidden="true">({total})</span>
              </Link>
            ))}
          </nav>
        ) : null}

        {articulos.length === 0 ? (
          /* Un idioma puede no tener artículos todavía: se dice, en vez de
             mostrar una rejilla vacía. */
          <p className="blog__vacio">{t.blog.vacio}</p>
        ) : (
          <div className="blog__rejilla">
            {articulos.map((articulo, indice) => (
              <TarjetaArticulo
                key={articulo.slug}
                articulo={articulo}
                lang={idioma}
                t={t}
                prioridad={indice === 0}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
