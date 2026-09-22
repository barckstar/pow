import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { rutas, ZONA_PROFESOR } from "@/shared/config/sitio";
import { SEO } from "@/shared/config/seo";
import { Calendly } from "@/features/reservas/components/Calendly";
import { CLASES } from "@/features/reservas/esquema";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";

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
    ...SEO.reservar[lang],
    ruta: rutas.reservar(lang),
    lang,
    alternativas: mismaRutaEnTodosLosIdiomas(rutas.reservar),
  });
}

/**
 * La reserva de una clase en línea.
 *
 * ============ LA PÁGINA EXPLICA; CALENDLY HACE ============
 * Los tres pasos —franja, pago y enlace de Zoom— los ejecuta Calendly entero.
 * Lo que aporta esta página es contarlos ANTES de abrir el widget, porque el
 * widget no los cuenta: el visitante llega, ve un calendario y no sabe que va
 * a tener que pagar ahí mismo ni que el enlace le va a llegar solo.
 *
 * Tres pasos escritos arriba cuestan diez segundos de lectura y evitan la
 * pregunta «¿y cómo me conecto?», que es la que más se responde a mano en un
 * negocio así.
 * =========================================================
 */
export default async function PaginaReservar({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);
  const r = t.reserva;

  const pasos = [
    { titulo: r.paso1Titulo, texto: r.paso1Texto },
    { titulo: r.paso2Titulo, texto: r.paso2Texto },
    { titulo: r.paso3Titulo, texto: r.paso3Texto },
  ];

  return (
    <section className="seccion con-adornos">
      <DecoradosSeccion variante="reservar" />

      {/*
        La columna ANCHA, no la estrecha.

        El texto sigue midiendo lo de siempre —lo envuelve `reservar__texto`—
        pero el calendario necesita sitio: Calendly pone el mes y la lista de
        horas uno al lado del otro a partir de unos 1000 px, y por debajo los
        apila y mete su propio scroll dentro de un hueco pequeño. En la columna
        de 47 rem no cabía y se veía una ventanita con barra de desplazamiento.
      */}
      <div className="seccion__interior">
        <div className="reservar__texto">
          <h1 className="seccion__titulo">{r.titulo}</h1>
          <p className="seccion__intro">{r.intro}</p>

          <ol className="pasos">
            {pasos.map((paso, indice) => (
              <li key={paso.titulo} className="paso">
                <span className="paso__numero" aria-hidden="true">
                  {indice + 1}
                </span>
                <div>
                  <h2 className="paso__titulo">{paso.titulo}</h2>
                  <p>{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/*
          Sin cuenta de Calendly no se pinta un calendario de mentira: se dice
          que no se puede reservar todavía. Es la misma regla que el resto del
          sitio — un hueco visible se arregla, uno invisible se publica.
        */}
        {CLASES.length > 0 ? (
          <>
            {CLASES.length > 1 ? (
              <h2 className="seccion__titulo reservar__texto">
                {r.duracionTitulo}
              </h2>
            ) : null}

            <Calendly
              clases={CLASES}
              lang={idioma}
              etiquetaBoton={r.abrir}
              avisoTerceros={r.avisoTerceros}
              titulo={r.tituloWidget}
              textoDuracion={r.duracionMin}
              textoCambiar={r.duracionCambiar}
            />
          </>
        ) : (
          <div className="aviso-pendiente reservar__texto">
            <p className="aviso-pendiente__titulo">
              <span className="pendiente">{t.pendiente.etiqueta}</span>
              <span>{r.pendienteTitulo}</span>
            </p>
            <p>{r.pendienteTexto}</p>
          </div>
        )}

        <p className="dato-zona reservar__texto">
          <strong>{r.zonaHoraria}:</strong> {ZONA_PROFESOR.replace(/_/g, " ")}
        </p>
      </div>
    </section>
  );
}
