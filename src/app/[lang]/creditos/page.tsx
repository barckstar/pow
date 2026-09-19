import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { rutas } from "@/shared/config/sitio";
import { SEO } from "@/shared/config/seo";
import { CREDITOS } from "@/shared/data/creditos";

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
    ...SEO.creditos[lang],
    ruta: `/${lang}/creditos`,
    lang,
    alternativas: mismaRutaEnTodosLosIdiomas((l) => `/${l}/creditos`),
  });
}

export default async function PaginaCreditos({
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
      <div className="seccion__interior seccion__interior--estrecho">
        <h1 className="seccion__titulo">{t.paginas.creditos.titulo}</h1>
        <p className="seccion__intro">{t.paginas.creditos.intro}</p>

        <ul className="creditos">
          {CREDITOS.map((credito) => (
            <li key={credito.archivo} className="credito">
              <p className="credito__descripcion">{credito.descripcion}</p>
              <p className="credito__autor">
                {t.paginas.creditos.foto}{" "}
                <a
                  href={credito.perfil}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {credito.autor}
                </a>{" "}
                ·{" "}
                <a
                  href={credito.pagina}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {credito.fuente}
                </a>{" "}
                · {credito.licencia}
              </p>
              <p className="credito__archivo">
                <code>{credito.archivo}</code>
              </p>
            </li>
          ))}
        </ul>

        <a href={rutas.inicio(idioma)} className="seccion__enlace">
          ← {t.comun.volverInicio}
        </a>
      </div>
    </section>
  );
}
