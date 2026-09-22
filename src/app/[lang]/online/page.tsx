import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { rutas } from "@/shared/config/sitio";
import { SEO } from "@/shared/config/seo";
import { HeroPagina } from "@/shared/components/ui/HeroPagina";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";
import { TiquismoDelDia } from "@/features/tiquismos/components/TiquismoDelDia";
import { CLASES } from "@/features/online/esquema";
import { Profesores } from "@/features/online/components/Profesores";

/**
 * El artículo del cliente sobre las clases en línea, al que enlaza esta
 * página. Los dos slugs son distintos porque cada idioma tiene el suyo; el
 * cruce entre ambos lo lleva el `traduccion` del frontmatter.
 */
const ARTICULO = {
  es: "por-que-funcionan-las-clases-en-linea",
  en: "why-online-spanish-classes",
} as const;

/** La lapa roja. Es la portada de esta página y su imagen de Open Graph. */
const FOTO = "/fotos/lapa-roja.jpg";

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
    imagen: FOTO,
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
      <HeroPagina
        foto={FOTO}
        fotoAlt={p.hero.fotoAlt}
        titulo={p.hero.titulo}
        acento={p.hero.acento}
        subtitulo={p.hero.subtitulo}
        cta={{ href: rutas.reservar(idioma), texto: t.hero.ctaReservar }}
      />

      {/* Lo primero después del hero, por petición del cliente: quien entra a
          mirar clases particulares decide si se fía de la persona antes que
          nada, y eso estaba en la página quince. */}
      <Profesores
        lang={idioma}
        titulo={p.profesorTitulo}
        entrada={p.profesorEntrada}
        etiquetaPendiente={t.pendiente.etiqueta}
        fotoPendiente={p.profesorFotoPendiente}
        fotoAlt={p.profesorFotoAlt}
        etiquetaZona={t.reserva.zonaHoraria}
        cta={{ href: rutas.reservar(idioma), texto: t.hero.ctaReservar }}
      />

      <section className="seccion con-adornos">
        <DecoradosSeccion variante="online" />

        <div className="seccion__interior seccion__interior--estrecho">
          {/* El `<h1>` lo pone el hero. Aquí empieza en `<h2>`: dos `h1` en la
              misma página rompen el esquema de encabezados y lo caza
              Lighthouse. */}
          <h2 className="seccion__titulo">{p.titulo}</h2>
          <p className="seccion__intro">{p.intro}</p>

          <h3 className="subseccion__titulo">{p.pasosTitulo}</h3>
          <ol className="pasos">
            {pasos.map((paso, indice) => (
              <li key={paso.titulo} className="paso">
                <span className="paso__numero" aria-hidden="true">
                  {indice + 1}
                </span>
                <div>
                  <h4 className="paso__titulo">{paso.titulo}</h4>
                  <p>{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>

          {/*
            Todo lo que sigue sale del artículo que escribió el cliente y que
            está publicado en el blog. Se transcribe, no se amplía: la página y
            el artículo tienen que decir lo mismo, y si mañana él cambia una
            situación se cambia en `clases.json` y sale en los dos sitios.
          */}
          <h3 className="subseccion__titulo">{p.practicaTitulo}</h3>
          <p>{p.practicaTexto}</p>
          <ul className="fichas">
            {CLASES.habilidades.map((h) => (
              <li key={h.id} className="ficha ficha--fuerte">
                {h.etiqueta[idioma]}
              </li>
            ))}
          </ul>

          <p>{p.situacionesTexto}</p>
          <ul className="fichas">
            {CLASES.situaciones.map((s) => (
              <li key={s.id} className="ficha">
                {s.etiqueta[idioma]}
              </li>
            ))}
          </ul>

          <h3 className="subseccion__titulo">{p.medidaTitulo}</h3>
          <p>{p.medidaTexto}</p>
          <ul className="fichas">
            {CLASES.motivos.map((m) => (
              <li key={m.id} className="ficha">
                {m.etiqueta[idioma]}
              </li>
            ))}
          </ul>
          <p>{p.medidaCierre}</p>

          <p className="seccion__enlace-suelto">
            <Link
              href={rutas.articulo(idioma, ARTICULO[idioma])}
              className="seccion__enlace"
            >
              {p.leerArticulo} →
            </Link>
          </p>

          <Link href={rutas.reservar(idioma)} className="boton boton--primario">
            {t.hero.ctaReservar}
          </Link>
        </div>
      </section>

      <TiquismoDelDia lang={idioma} t={t} />
    </>
  );
}
