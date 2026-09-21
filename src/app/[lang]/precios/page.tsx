import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { DEPOSITO, rutas } from "@/shared/config/sitio";
import { SEO } from "@/shared/config/seo";
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
   */
  return (
    <section className="seccion con-adornos">
      <DecoradosSeccion variante="precios" />

      <div className="seccion__interior seccion__interior--estrecho">
        <h1 className="seccion__titulo">{t.paginas.precios.titulo}</h1>
        <p className="seccion__intro">{t.paginas.precios.intro}</p>

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
  );
}
