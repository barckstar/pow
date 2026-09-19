import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { BlogPosting, WithContext } from "schema-dts";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe } from "@/shared/lib/sitio";
import { fechaISO, fechaLarga } from "@/shared/lib/fechas";
import {
  idiomaDeLaTraduccion,
  leerArticulo,
  leerArticulos,
} from "@/features/blog/lib/leer";
import { renderizarMarkdown } from "@/features/blog/lib/markdown";
import { NOMBRE_SITIO, rutas, URL_BASE } from "@/shared/config/sitio";

export async function generateStaticParams() {
  const todos = await Promise.all(
    IDIOMAS.map(async (lang) => {
      const articulos = await leerArticulos(lang);
      return articulos.map((a) => ({ lang, slug: a.slug }));
    })
  );
  return todos.flat();
}

/**
 * Construye el mapa de `hreflang` SOLO con las traducciones que existen de
 * verdad. Un artículo que vive en un único idioma no declara alternativa:
 * prometerle a Google una versión que no existe es peor que no decir nada.
 */
async function alternativasDe(
  slug: string,
  idioma: Idioma
): Promise<Partial<Record<Idioma, string>>> {
  const articulo = await leerArticulo(idioma, slug);
  if (!articulo) return {};

  const alternativas: Partial<Record<Idioma, string>> = {
    [idioma]: rutas.articulo(idioma, slug),
  };

  const otro = await idiomaDeLaTraduccion(articulo, idioma);
  if (otro && articulo.traduccion) {
    alternativas[otro] = rutas.articulo(otro, articulo.traduccion);
  }

  return alternativas;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!esIdioma(lang)) return {};

  const articulo = await leerArticulo(lang, slug);
  if (!articulo) return {};

  return metadatosDe({
    titulo: articulo.titulo,
    descripcion: articulo.resumen,
    ruta: rutas.articulo(lang, slug),
    lang,
    imagen: articulo.portada,
    tipo: "article",
    publicado: articulo.fecha.toISOString(),
    modificado: (articulo.actualizado ?? articulo.fecha).toISOString(),
    alternativas: await alternativasDe(slug, lang),
  });
}

export default async function PaginaArticulo({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const articulo = await leerArticulo(idioma, slug);
  if (!articulo) notFound();

  const t = await getDiccionario(idioma);
  const contenido = await renderizarMarkdown(articulo.cuerpo);
  const otroIdioma = await idiomaDeLaTraduccion(articulo, idioma);

  const jsonLd: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: articulo.titulo,
    description: articulo.resumen,
    datePublished: articulo.fecha.toISOString(),
    dateModified: (articulo.actualizado ?? articulo.fecha).toISOString(),
    inLanguage: idioma,
    mainEntityOfPage: `${URL_BASE}${rutas.articulo(idioma, slug)}`,
    publisher: { "@type": "Organization", name: NOMBRE_SITIO },
    ...(articulo.portada ? { image: `${URL_BASE}${articulo.portada}` } : {}),
  };

  return (
    <article className="articulo">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="articulo__cabecera">
        <p className="articulo__meta">
          <time dateTime={fechaISO(articulo.fecha)}>
            {t.blog.publicado} {fechaLarga(articulo.fecha, idioma)}
          </time>
          <span aria-hidden="true"> · </span>
          <span>
            {articulo.minutos} {t.blog.minutos}
          </span>
        </p>

        <h1 className="articulo__titulo">{articulo.titulo}</h1>
        <p className="articulo__resumen">{articulo.resumen}</p>

        <ul className="articulo__etiquetas">
          {articulo.etiquetas.map((etiqueta) => (
            <li key={etiqueta}>
              <Link href={rutas.etiqueta(idioma, etiqueta)}>#{etiqueta}</Link>
            </li>
          ))}
        </ul>

        {otroIdioma && articulo.traduccion ? (
          <p className="articulo__traduccion">
            <Link
              href={rutas.articulo(otroIdioma, articulo.traduccion)}
              hrefLang={otroIdioma}
            >
              {t.blog.tambienEn}
            </Link>
          </p>
        ) : null}
      </header>

      {articulo.portada && articulo.portadaAlt ? (
        <div className="articulo__portada">
          <Image
            src={articulo.portada}
            alt={articulo.portadaAlt}
            fill
            priority
            sizes="(min-width: 800px) 760px, 100vw"
            className="articulo__portada-imagen"
          />
        </div>
      ) : null}

      <div className="articulo__cuerpo">{contenido}</div>

      <footer className="articulo__pie">
        <Link href={rutas.blog(idioma)}>← {t.blog.titulo}</Link>
      </footer>
    </article>
  );
}
