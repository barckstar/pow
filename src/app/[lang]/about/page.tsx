import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { rutas } from "@/shared/config/sitio";
import { SEO } from "@/shared/config/seo";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";
import { RuedaCarreta } from "@/shared/components/ui/Decorados";

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
    ...SEO.about[lang],
    ruta: rutas.about(lang),
    lang,
    alternativas: mismaRutaEnTodosLosIdiomas(rutas.about),
  });
}

/**
 * «Quiénes somos» — página nueva del 23/09/2026, a pedido del cliente.
 *
 * ============ CONTENIDO INVENTADO, DISEÑO PROPIO ============
 * El cliente lo pidió así: «aun no tenemos informacion asi que puedes
 * inventar». Es la única página del sitio con esa licencia — el resto sigue
 * la regla de no rellenar con suposiciones lo que no está confirmado. Aun así
 * lleva su aviso de pendiente al final (`cierrePendiente`): un texto de
 * mentira sobre un negocio real puede acabar citado, y eso hay que decirlo
 * donde se lee, no solo en un comentario del código.
 *
 * El diseño es distinto a propósito, no una plantilla más de `.seccion`:
 *   1. Un hero SIN FOTO — teal a crema en vertical, con el titular partido en
 *      dos colores como en la portada. Las demás páginas interiores usan una
 *      fotografía; esta habla de una persona y una idea, no de un lugar.
 *   2. Una cita destacada, aparte del cuerpo del texto, como una pull-quote
 *      de revista — no existe en ninguna otra página del sitio.
 *   3. Cuatro valores en tarjetas con número en vez de icono: no hay un
 *      icono que diga «crecimiento a propósito», y forzar uno sería peor que
 *      no ponerlo.
 * ==============================================
 */
export default async function PaginaAbout({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);
  const p = t.paginas.about;

  const valores = [
    { titulo: p.valor1Titulo, texto: p.valor1Texto },
    { titulo: p.valor2Titulo, texto: p.valor2Texto },
    { titulo: p.valor3Titulo, texto: p.valor3Texto },
    { titulo: p.valor4Titulo, texto: p.valor4Texto },
  ];

  return (
    <>
      <section className="about-hero">
        {/* La rueda de carreta también aquí, más grande y sola: es la firma
            de la página, no un adorno de fondo — por eso no sale de
            DecoradosSeccion, que reparte piezas pequeñas por los bordes. */}
        <span className="about-hero__rueda" aria-hidden="true">
          <RuedaCarreta />
        </span>

        <div className="about-hero__interior">
          <p className="about-hero__insignia">{p.heroInsignia}</p>
          <h1 className="about-hero__titulo">
            {p.heroTitulo}
            <span className="about-hero__acento">{p.heroAcento}</span>
          </h1>
          <p className="about-hero__subtitulo">{p.heroSubtitulo}</p>
        </div>
      </section>

      <section className="seccion con-adornos">
        <DecoradosSeccion variante="about" />

        <div className="seccion__interior about-historia">
          <div className="about-historia__texto">
            <h2 className="seccion__titulo">{p.historiaTitulo}</h2>
            <p>{p.historiaTexto1}</p>
            <p>{p.historiaTexto2}</p>
          </div>

          <blockquote className="about-cita">
            <p>{p.historiaCita}</p>
          </blockquote>
        </div>
      </section>

      <section className="about-valores">
        <div className="about-valores__interior">
          <h2 className="seccion__titulo">{p.valoresTitulo}</h2>
          <p className="seccion__intro">{p.valoresIntro}</p>

          <ol className="about-valores__lista">
            {valores.map((valor, indice) => (
              <li key={valor.titulo} className="about-valor">
                <span className="about-valor__numero" aria-hidden="true">
                  {String(indice + 1).padStart(2, "0")}
                </span>
                <h3 className="about-valor__titulo">{valor.titulo}</h3>
                <p>{valor.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="about-cierre">
        <div className="about-cierre__interior">
          <h2 className="about-cierre__titulo">{p.cierreTitulo}</h2>
          <p className="about-cierre__texto">{p.cierreTexto}</p>
          <Link href={rutas.reservar(idioma)} className="boton boton--primario">
            {p.cierreCta}
          </Link>

          <p className="about-cierre__pendiente">
            <span className="pendiente">{t.pendiente.etiqueta}</span>
            <span>{p.cierrePendiente}</span>
          </p>
        </div>
      </section>
    </>
  );
}
