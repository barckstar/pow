import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { FUENTES, rutas } from "@/shared/config/sitio";
import { MigasJsonLd } from "@/shared/lib/jsonLd";
import { SEO } from "@/shared/config/seo";
import { HeroPagina } from "@/shared/components/ui/HeroPagina";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";
import { FormularioVoluntariado } from "@/features/voluntariado/components/FormularioVoluntariado";
import { ID_OTRO, INTERESES } from "@/features/voluntariado/esquema";

/**
 * La foto del hero, que mandó el cliente: dos voluntarios con un perezoso. No
 * es de banco —está en `creditos-cedidas.json` con el permiso sin confirmar—.
 */
const FOTO = "/fotos/voluntariado-perezoso.jpg";

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
    ...SEO.voluntariado[lang],
    ruta: rutas.voluntariado(lang),
    lang,
    imagen: FOTO,
    alternativas: mismaRutaEnTodosLosIdiomas(rutas.voluntariado),
  });
}

/**
 * Voluntariado: una página para recoger interés, no para prometer puestos.
 *
 * ============ QUÉ SE DICE Y QUÉ NO ============
 * El cliente lo planteó así: la página es un puente entre el español y algo
 * con sentido que hacer en Costa Rica, y el emparejamiento real se hace en
 * privado, después de recibir cada consulta. Por eso aquí NO hay lista de
 * programas, plazas, precios ni nombres de organizaciones: no hay ninguno
 * confirmado, y anunciar un tipo de voluntariado que luego no existe es
 * justo lo que esta página no puede permitirse.
 *
 * Lo que sí hace es decir para quién es, qué tipos de trabajo se pueden
 * pedir, cómo se pide y qué pasa después — que es lo que busca quien llega
 * aquí, sea persona o asistente de búsqueda.
 * =============================================
 */
export default async function PaginaVoluntariado({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);
  const p = t.paginas.voluntariado;

  const areas = INTERESES.filter((i) => i.id !== ID_OTRO);

  const pasos = [
    { titulo: p.paso1Titulo, texto: p.paso1Texto },
    { titulo: p.paso2Titulo, texto: p.paso2Texto },
    { titulo: p.paso3Titulo, texto: p.paso3Texto },
  ];

  return (
    <>
      <MigasJsonLd
        lang={idioma}
        nombre={SEO.voluntariado[idioma].titulo}
        ruta={rutas.voluntariado(idioma)}
      />
      <HeroPagina
        foto={FOTO}
        fotoAlt={p.hero.fotoAlt}
        titulo={p.hero.titulo}
        acento={p.hero.acento}
        subtitulo={p.hero.subtitulo}
        cta={{ href: "#interes", texto: p.cta }}
        encuadre="derecha"
      />

      <section className="seccion con-adornos">
        <DecoradosSeccion variante="voluntariado" />

        <div className="seccion__interior seccion__interior--estrecho">
          {/* El `<h1>` lo pone el hero. */}
          <h2 className="seccion__titulo">{p.introTitulo}</h2>
          <div className="voluntariado__texto">
            <p>{p.intro1}</p>
            <p>{p.intro2}</p>
            <p>{p.intro3}</p>
            <p className="voluntariado__cierre">{p.introCierre}</p>
          </div>
          <p className="voluntariado__fuente">
            {p.fuente}{" "}
            <a
              href={FUENTES.ocdeCostaRica}
              target="_blank"
              rel="noopener noreferrer"
            >
              {p.fuenteEnlace}
            </a>
          </p>
        </div>
      </section>

      <section
        className="seccion con-adornos"
        aria-labelledby="voluntariado-areas"
      >
        <div className="seccion__interior">
          <h2 className="seccion__titulo" id="voluntariado-areas">
            {p.areasTitulo}
          </h2>
          <p className="seccion__intro">{p.areasIntro}</p>

          <ul className="areas revelar">
            {areas.map((area) => (
              <li key={area.id} className="area">
                <span className="area__icono" aria-hidden="true">
                  <IconoArea id={area.id} />
                </span>
                <span className="area__titulo">{area.etiqueta[idioma]}</span>
              </li>
            ))}
          </ul>

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

          <p className="voluntariado__salvaguarda">{p.salvaguarda}</p>
        </div>
      </section>

      {/*
        El formulario va DEBAJO, a propósito: el cliente pidió que aparezca
        «al hacer scroll down». `.ancla` deja el margen del navbar fijo para
        que el botón del hero no lo deje escondido.
      */}
      <section className="seccion ancla" id="interes" aria-labelledby="interes-titulo">
        <div className="seccion__interior seccion__interior--estrecho">
          <h2 className="seccion__titulo" id="interes-titulo">
            {p.formTitulo}
          </h2>
          <p className="seccion__intro">{p.formIntro}</p>

          <FormularioVoluntariado
            lang={idioma}
            t={p.form}
            intereses={INTERESES.map((i) => ({
              id: i.id,
              etiqueta: i.etiqueta[idioma],
            }))}
            idOtro={ID_OTRO}
          />
        </div>
      </section>
    </>
  );
}

/* Iconos de línea, del mismo juego que los de `/costa-rica`: dicen «de qué
   va» cada tipo de trabajo de un vistazo, no decoran. */
function IconoArea({ id }: { id: string }) {
  const comun = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (id) {
    case "fauna":
      // Una huella.
      return (
        <svg {...comun}>
          <ellipse cx="12" cy="16" rx="4.5" ry="3.6" />
          <circle cx="6" cy="10.5" r="1.7" />
          <circle cx="10" cy="6.5" r="1.7" />
          <circle cx="14.5" cy="6.5" r="1.7" />
          <circle cx="18.5" cy="10.5" r="1.7" />
        </svg>
      );
    case "playas":
      // Una ola.
      return (
        <svg {...comun}>
          <path d="M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
          <path d="M2 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
          <path d="M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
        </svg>
      );
    case "bienestar":
      // Un corazón.
      return (
        <svg {...comun}>
          <path d="M12 20.5s-8-4.7-8-10.2A4.5 4.5 0 0 1 12 7.6a4.5 4.5 0 0 1 8 2.7c0 5.5-8 10.2-8 10.2z" />
        </svg>
      );
    default:
      // Dos personas.
      return (
        <svg {...comun}>
          <circle cx="8.5" cy="7.5" r="3" />
          <path d="M3 20c0-3.3 2.5-5.5 5.5-5.5S14 16.7 14 20" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M16 14.7c2.9.3 5 2.5 5 5.3" />
        </svg>
      );
  }
}
