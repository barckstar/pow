import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { REDES, rutas } from "@/shared/config/sitio";
import { SEO } from "@/shared/config/seo";
import { TIQUISMOS } from "@/features/tiquismos/esquema";

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
    ...SEO.comunidad[lang],
    ruta: rutas.comunidad(lang),
    lang,
    alternativas: mismaRutaEnTodosLosIdiomas(rutas.comunidad),
  });
}

export default async function PaginaComunidad({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);
  const hayRedes = Object.values(REDES).some(Boolean);

  /*
   * Esta página muestra SOLO lo que existe de verdad. No hay contadores de
   * miembros, ni testimonios, ni actividad: el negocio arranca y esos datos
   * no existen. Lo que sí existe es el archivo de tiquismos, que ya es algo
   * que alguien puede venir a leer.
   */
  return (
    <section className="seccion">
      <div className="seccion__interior seccion__interior--estrecho">
        <h1 className="seccion__titulo">{t.paginas.comunidad.titulo}</h1>
        <p className="seccion__intro">{t.paginas.comunidad.intro}</p>

        {hayRedes ? null : (
          <div className="hueco">
            <span className="pendiente">{t.pendiente.etiqueta}</span>
            <p>{t.paginas.comunidad.sinRedes}</p>
          </div>
        )}

        <h2 className="subseccion__titulo">
          {t.paginas.comunidad.archivoTitulo}
        </h2>

        <ul className="archivo-tiquismos">
          {TIQUISMOS.map((tiquismo) => (
            <li key={tiquismo.id} className="archivo-tiquismo">
              <h3>
                {tiquismo.expresion}{" "}
                <span className="archivo-tiquismo__pron">
                  /{tiquismo.pronunciacion}/
                </span>
              </h3>
              <p>{tiquismo.significado[idioma]}</p>
              <p className="archivo-tiquismo__ejemplo" lang="es">
                «{tiquismo.ejemplo}»
              </p>
              {tiquismo.articulo ? (
                <Link href={rutas.articulo(idioma, tiquismo.articulo)}>
                  {t.tiquismo.leerMas} →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
