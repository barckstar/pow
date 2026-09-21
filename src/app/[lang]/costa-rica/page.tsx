import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { rutas } from "@/shared/config/sitio";
import { SEO } from "@/shared/config/seo";
import { DESTINOS } from "@/features/destinos/esquema";
import { TarjetaDestino } from "@/features/destinos/components/TarjetaDestino";
import { HeroPagina } from "@/shared/components/ui/HeroPagina";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";
import { TiquismoDelDia } from "@/features/tiquismos/components/TiquismoDelDia";

/**
 * La página de la vía presencial: una sola, donde antes había dos.
 *
 * ============ POR QUÉ SE FUSIONARON ============
 * `/presencial` explicaba la modalidad y `/destinos` listaba los sitios. El
 * cliente lo dijo con estas palabras: «los destinos y aprender en Costa Rica
 * están pensados como un mismo tema». Y es así — lo que vende no es una
 * modalidad ni una lista de playas, es UNA cosa: aprender el idioma viajando
 * por el país, con la escuela y el hospedaje resueltos.
 *
 * Partido en dos, el visitante tenía que leer las dos páginas para entender la
 * oferta y ninguna se explicaba sola. Aquí va seguido: qué es, cómo funciona
 * y a dónde se puede ir.
 * ===============================================
 */
const FOTO = "/fotos/puente-colgante.jpg";

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
    ...SEO.costaRica[lang],
    ruta: rutas.costaRica(lang),
    lang,
    imagen: FOTO,
    alternativas: mismaRutaEnTodosLosIdiomas(rutas.costaRica),
  });
}

export default async function PaginaCostaRica({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);
  const p = t.paginas.costaRica;

  /*
   * Las tres patas de la oferta. Van en una lista y no escritas a mano tres
   * veces para que se vea de un golpe que son TRES y que pesan lo mismo: si
   * una se cuenta con más detalle que las otras, el visitante entiende que es
   * la importante, y aquí ninguna lo es.
   */
  const pilares = [
    { titulo: p.claseTitulo, texto: p.claseTexto, icono: <IconoPizarra /> },
    {
      titulo: p.hospedajeTitulo,
      texto: p.hospedajeTexto,
      icono: <IconoCasa />,
    },
    { titulo: p.viajeTitulo, texto: p.viajeTexto, icono: <IconoMochila /> },
  ];

  return (
    <>
      <HeroPagina
        foto={FOTO}
        fotoAlt={p.hero.fotoAlt}
        titulo={p.hero.titulo}
        acento={p.hero.acento}
        subtitulo={p.hero.subtitulo}
        cta={{ href: `#destinos`, texto: p.destinosTitulo }}
      />

      <section className="seccion con-adornos">
        <DecoradosSeccion variante="presencial" />

        <div className="seccion__interior">
          {/* El `<h1>` lo pone el hero. */}
          <h2 className="seccion__titulo">{p.comoTitulo}</h2>
          <p className="seccion__intro">{p.comoIntro}</p>

          <div className="pilares revelar">
            {pilares.map((pilar) => (
              <article key={pilar.titulo} className="pilar">
                <span className="pilar__icono" aria-hidden="true">
                  {pilar.icono}
                </span>
                <h3 className="pilar__titulo">{pilar.titulo}</h3>
                <p className="pilar__texto">{pilar.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/*
        `scroll-margin-top` lo pone la clase: el navbar es fijo, así que un
        ancla sin margen deja el titular escondido debajo de la barra.
      */}
      <section
        className="seccion con-adornos ancla"
        id="destinos"
        aria-labelledby="destinos-titulo"
      >
        <DecoradosSeccion variante="destinosPagina" />

        <div className="seccion__interior">
          <h2 className="seccion__titulo" id="destinos-titulo">
            {p.destinosTitulo}
          </h2>
          <p className="seccion__intro">{p.destinosIntro}</p>

          {/*
            El aviso va ANTES de las tarjetas.
            Los destinos son los que el cliente puso «por ejemplo» y la lista
            no está cerrada. Leerlo después de haber elegido uno no sirve de
            nada.
          */}
          <div className="aviso-pendiente">
            <p className="aviso-pendiente__titulo">
              <span className="pendiente">{t.pendiente.etiqueta}</span>
              <span>{p.pendienteTitulo}</span>
            </p>
            <p>{p.pendienteTexto}</p>
          </div>

          <div className="destinos revelar">
            {DESTINOS.map((destino, indice) => (
              <TarjetaDestino
                key={destino.id}
                destino={destino}
                lang={idioma}
                t={t}
                prioridad={indice === 0}
              />
            ))}
          </div>
        </div>
      </section>

      <TiquismoDelDia lang={idioma} t={t} />
    </>
  );
}

/* ────────────────────── Los tres iconos ──────────────────────
   Funcionales y de línea, del mismo juego que los de las tarjetas de la
   portada. Lo tropical lo ponen los adornos de la sección: estos tienen que
   decir «clase», «cama» y «viaje» de un vistazo, no decorar. */

function IconoPizarra() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="13" rx="1.5" />
      <path d="M7 8h7M7 11.5h4" />
      <path d="M12 16v5M8.5 21h7" />
    </svg>
  );
}

function IconoCasa() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      {/* Una cama dentro: una casa sola es «inicio», con cama es «hospedaje». */}
      <path d="M8.5 16.5v-2.5h7v2.5M8.5 16.5h7" />
    </svg>
  );
}

function IconoMochila() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9.5a6 6 0 0 1 12 0V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
      <path d="M9.5 8V5.5a2.5 2.5 0 0 1 5 0V8" />
      <path d="M9 14h6v3.5H9z" />
    </svg>
  );
}
