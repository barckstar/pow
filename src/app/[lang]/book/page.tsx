import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { rutas } from "@/shared/config/sitio";
import { MigasJsonLd } from "@/shared/lib/jsonLd";
import { SEO } from "@/shared/config/seo";
import { FormularioReserva } from "@/features/reservas/components/FormularioReserva";
import { OPCIONES } from "@/features/solicitud/esquema";
import Image from "next/image";
import Link from "next/link";
import { DESTINOS } from "@/features/destinos/esquema";
import { PROFESORES } from "@/features/online/esquemaProfesores";
import { FranjaHero } from "@/shared/components/ui/FranjaHero";
import { Hibisco, Lapa } from "@/shared/components/ui/Decorados";
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

  const profe = PROFESORES[0];

  return (
    <>
      <MigasJsonLd
        lang={idioma}
        nombre={SEO.reservar[idioma].titulo}
        ruta={rutas.reservar(idioma)}
      />
      <FranjaHero
        insignia={r.insignia}
        titulo={r.titulo}
        subtitulo={r.intro}
        decoracion={<Lapa />}
      />

      {/*
        La tarjeta SUBE sobre el final del hero (margen negativo): el degradado
        teal→crema pasa por detrás y el formulario queda «dentro» del hero en
        vez de empezar después de él. Es lo que le quita el aspecto de hoja
        plana.
      */}
      <section className="reserva con-adornos">
        <DecoradosSeccion variante="reservar" />

        <div className="reserva__tarjeta">
          <aside className="reserva__lateral">
            <span className="reserva__flor" aria-hidden="true">
              <Hibisco />
            </span>
            {profe?.foto ? (
              <Image
                src={profe.foto}
                alt={profe.nombre}
                width={160}
                height={160}
                className="reserva__foto"
                sizes="120px"
              />
            ) : null}
            <h2 className="reserva__lateral-titulo">{r.paso2Titulo}</h2>
            <p>{r.paso2Texto}</p>

            <hr className="reserva__linea" />

            <h2 className="reserva__lateral-titulo reserva__lateral-titulo--lugares">
              {r.lugaresTitulo}
            </h2>
            <ul className="reserva__lugares">
              {DESTINOS.slice(0, 2).map((d) => (
                <li key={d.id}>
                  <Link href={rutas.solicitud(idioma, d.id)} className="reserva__lugar">
                    <Image
                      src={d.foto}
                      alt=""
                      width={120}
                      height={120}
                      sizes="60px"
                      className="reserva__lugar-foto"
                    />
                    <span className="reserva__lugar-texto">
                      <strong>{d.nombre}</strong>
                      <span>{d.zona}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={rutas.costaRica(idioma)} className="reserva__mas">
              {r.lugaresEnlace} →
            </Link>
          </aside>

          <div className="reserva__formulario">
            <FormularioReserva
              lang={idioma}
              t={r.form}
              motivos={OPCIONES.motivo.map((o) => ({
                id: o.id,
                etiqueta: o.etiqueta[idioma],
              }))}
            />
          </div>
        </div>
      </section>
    </>
  );
}
