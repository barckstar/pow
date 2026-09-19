import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe } from "@/shared/lib/sitio";
import { rutas } from "@/shared/config/sitio";
import { etiquetasDe, leerArticulos } from "@/features/blog/lib/leer";
import { TarjetaArticulo } from "@/features/blog/components/TarjetaArticulo";

export async function generateStaticParams() {
  const todos = await Promise.all(
    IDIOMAS.map(async (lang) => {
      const etiquetas = await etiquetasDe(lang);
      return etiquetas.map(({ etiqueta }) => ({ lang, tag: etiqueta }));
    })
  );
  return todos.flat();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; tag: string }>;
}): Promise<Metadata> {
  const { lang, tag } = await params;
  if (!esIdioma(lang)) return {};

  const titulo =
    lang === "es" ? `Artículos sobre ${tag}` : `Articles tagged ${tag}`;
  const descripcion =
    lang === "es"
      ? `Todos los artículos del blog etiquetados como «${tag}»: español costarricense explicado por quien lo habla desde que nació.`
      : `Every blog article tagged "${tag}": Costa Rican Spanish explained by someone who has spoken it since birth.`;

  return metadatosDe({
    titulo,
    descripcion,
    ruta: rutas.etiqueta(lang, tag),
    lang,
    // Sin `alternativas`: una etiqueta puede existir en un idioma y no en el
    // otro, porque los artículos no siempre están traducidos.
  });
}

export default async function PaginaEtiqueta({
  params,
}: {
  params: Promise<{ lang: string; tag: string }>;
}) {
  const { lang, tag } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);
  const articulos = (await leerArticulos(idioma)).filter((a) =>
    a.etiquetas.includes(tag)
  );

  if (articulos.length === 0) notFound();

  return (
    <section className="seccion">
      <div className="seccion__interior">
        <h1 className="seccion__titulo">#{tag}</h1>
        <p className="seccion__intro">
          {articulos.length} {t.blog.leer.toLowerCase()}
        </p>

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

        <Link href={rutas.blog(idioma)} className="seccion__enlace">
          ← {t.blog.titulo}
        </Link>
      </div>
    </section>
  );
}
