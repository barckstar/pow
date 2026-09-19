import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { rutas, ZONA_PROFESOR } from "@/shared/config/sitio";
import { SEO } from "@/shared/config/seo";
import { TiquismoDelDia } from "@/features/tiquismos/components/TiquismoDelDia";

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
    ...SEO.online[lang],
    ruta: rutas.online(lang),
    lang,
    alternativas: mismaRutaEnTodosLosIdiomas(rutas.online),
  });
}

export default async function PaginaOnline({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);
  const p = t.paginas.online;

  const pasos = [
    { titulo: p.paso1Titulo, texto: p.paso1Texto },
    { titulo: p.paso2Titulo, texto: p.paso2Texto },
    { titulo: p.paso3Titulo, texto: p.paso3Texto },
  ];

  return (
    <>
      <section className="seccion">
        <div className="seccion__interior seccion__interior--estrecho">
          <h1 className="seccion__titulo">{p.titulo}</h1>
          <p className="seccion__intro">{p.intro}</p>

          <h2 className="subseccion__titulo">{p.pasosTitulo}</h2>
          <ol className="pasos">
            {pasos.map((paso, indice) => (
              <li key={paso.titulo} className="paso">
                <span className="paso__numero" aria-hidden="true">
                  {indice + 1}
                </span>
                <div>
                  <h3 className="paso__titulo">{paso.titulo}</h3>
                  <p>{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>

          <h2 className="subseccion__titulo">{p.profesorTitulo}</h2>
          <p>{p.profesorTexto}</p>
          {/* El nombre, la foto y la biografía del profesor son datos que el
              cliente aún no ha dado. Se marca en vez de rellenar. */}
          <p className="reserva__aviso">
            <span className="pendiente">{t.pendiente.etiqueta}</span>
            <span>{t.pendiente.generico}</span>
          </p>

          <p className="dato-zona">
            <strong>{t.reserva.zonaHoraria}:</strong>{" "}
            {ZONA_PROFESOR.replace(/_/g, " ")}
          </p>

          <Link href={rutas.reservar(idioma)} className="boton boton--primario">
            {t.hero.ctaPrimario}
          </Link>
        </div>
      </section>

      <TiquismoDelDia lang={idioma} t={t} />
    </>
  );
}
