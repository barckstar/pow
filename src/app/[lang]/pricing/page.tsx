import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { DEPOSITO, rutas } from "@/shared/config/sitio";
import { SEO } from "@/shared/config/seo";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";
import { FranjaHero } from "@/shared/components/ui/FranjaHero";
import { RamaCafe } from "@/shared/components/ui/Decorados";

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
    ...SEO.precios[lang],
    ruta: rutas.precios(lang),
    lang,
    alternativas: mismaRutaEnTodosLosIdiomas(rutas.precios),
  });
}

export default async function PaginaPrecios({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);

  /*
   * No hay tabla de precios porque el cliente no los ha confirmado. Un precio
   * inventado en una web se cobra en la puerta: es el tipo de dato que no se
   * rellena con una suposición.
   *
   * El hero usa `FranjaHero` desde el 25/09/2026 — regla general para toda
   * página interior, no una excepción de «Quiénes somos». Ver ese componente
   * para el porqué.
   */
  return (
    <>
      <FranjaHero
        insignia={t.paginas.precios.heroInsignia}
        titulo={t.paginas.precios.titulo}
        subtitulo={t.paginas.precios.intro}
        decoracion={<RamaCafe />}
      />

      <section className="seccion con-adornos">
        <DecoradosSeccion variante="precios" />

        <div className="seccion__interior seccion__interior--estrecho">
          <div className="hueco">
            <span className="pendiente">{t.pendiente.etiqueta}</span>
            <p>{t.paginas.precios.sinPrecios}</p>
          </div>

          {DEPOSITO ? (
            <p className="dato-zona">
              <strong>{t.reserva.deposito}:</strong> {DEPOSITO.monto}{" "}
              {DEPOSITO.moneda} — {t.reserva.depositoTexto}
            </p>
          ) : (
            <div className="hueco">
              <span className="pendiente">{t.pendiente.etiqueta}</span>
              <p>{t.pendiente.precio}</p>
            </div>
          )}

          <Link href={rutas.reservar(idioma)} className="seccion__enlace">
            {t.hero.ctaReservar} →
          </Link>
        </div>
      </section>
    </>
  );
}
