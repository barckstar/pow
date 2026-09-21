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

/**
 * Una calle de San José, no una playa.
 *
 * Esta página ya no vende «Costa Rica» —eso es lo que cambió—, vende hablar
 * cara a cara. Una postal de arena prometía un viaje que aquí no se está
 * vendiendo; la calle es donde de verdad suena el español que enseña la
 * escuela.
 */
const FOTO = "/fotos/calle-san-jose.jpg";

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
    ...SEO.presencial[lang],
    ruta: rutas.presencial(lang),
    lang,
    imagen: FOTO,
    alternativas: mismaRutaEnTodosLosIdiomas(rutas.presencial),
  });
}

export default async function PaginaPresencial({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);
  const p = t.paginas.presencial;

  return (
    <>
      <HeroPagina
        foto={FOTO}
        fotoAlt={p.hero.fotoAlt}
        titulo={p.hero.titulo}
        acento={p.hero.acento}
        subtitulo={p.hero.subtitulo}
        cta={{
          href: rutas.destinos(idioma),
          texto: t.experiencias.presencialEnlace,
        }}
      />

      <section className="seccion con-adornos">
        <DecoradosSeccion variante="presencial" />

        <div className="seccion__interior seccion__interior--estrecho">
          {/* El `<h1>` lo pone el hero. */}
          <h2 className="seccion__titulo">{p.titulo}</h2>
          <p className="seccion__intro">{p.intro}</p>
          <p>{p.texto}</p>

          {/*
            ============ ESTA SECCIÓN EXISTE PARA DECIR QUE NO SE SABE ============
            Antes esta página listaba Manuel Antonio y La Fortuna como si fueran
            sedes. No lo son: el cliente no ha confirmado ninguna. Ahora la
            página vende el MODO —cara a cara— y el lugar sale con su etiqueta
            de pendiente, que es lo que manda `PENDIENTE.md`.

            Los dos lugares siguen en el sitio, pero donde les toca: en
            `/destinos`, como fichas turísticas que no prometen ninguna clase.
            ======================================================================
          */}
          <h3 className="subseccion__titulo">{p.dondeTitulo}</h3>
          <p>{p.dondeTexto}</p>
          <p className="reserva__aviso">
            <span className="pendiente">{t.pendiente.etiqueta}</span>
            <span>{t.pendiente.generico}</span>
          </p>

          {/* El paso siguiente de ESTA página es elegir destino, no irse a
              las clases en línea, que es la otra vía. */}
          <Link href={rutas.destinos(idioma)} className="boton boton--primario">
            {t.destinos.verTodos}
          </Link>

          <p className="seccion__enlace-suelto">
            <Link href={rutas.online(idioma)} className="seccion__enlace">
              {t.experiencias.onlineEnlace} →
            </Link>
          </p>
        </div>
      </section>

      <TiquismoDelDia lang={idioma} t={t} />
    </>
  );
}
