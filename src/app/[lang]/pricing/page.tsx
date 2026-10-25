import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { DEPOSITO, rutas } from "@/shared/config/sitio";
import { MigasJsonLd } from "@/shared/lib/jsonLd";
import { SEO } from "@/shared/config/seo";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";
import { FranjaHero } from "@/shared/components/ui/FranjaHero";
import { RamaCafe } from "@/shared/components/ui/Decorados";
import { Paquetes } from "@/features/precios/components/Paquetes";

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
   * Los precios los dictó el cliente el 23/09/2026 y viven en
   * `features/precios/data/paquetes.json`. Lo que SIGUE sin confirmar es el
   * depósito de reserva: mientras `DEPOSITO` sea `null` se dice, con la misma
   * etiqueta de pendiente del resto del sitio, en vez de callarlo o inventar
   * una cifra.
   *
   * El hero usa `FranjaHero` desde el 25/09/2026 — regla general para toda
   * página interior, no una excepción de «Quiénes somos». Ver ese componente
   * para el porqué.
   */
  return (
    <>
      <MigasJsonLd
        lang={idioma}
        nombre={SEO.precios[idioma].titulo}
        ruta={rutas.precios(idioma)}
      />
      <FranjaHero
        insignia={t.paginas.precios.heroInsignia}
        titulo={t.paginas.precios.titulo}
        subtitulo={t.paginas.precios.intro}
        decoracion={<RamaCafe />}
      />

      <section className="seccion con-adornos">
        <DecoradosSeccion variante="precios" />

        <div className="seccion__interior seccion__interior--paquetes">
          <Paquetes lang={idioma} t={t} />

          {DEPOSITO ? (
            <p className="dato-zona">
              <strong>{t.reserva.deposito}:</strong> {DEPOSITO.monto}{" "}
              {DEPOSITO.moneda} — {t.reserva.depositoTexto}
            </p>
          ) : (
            <div className="hueco">
              <span className="pendiente">{t.pendiente.etiqueta}</span>
              <p>{t.paginas.precios.depositoPendiente}</p>
            </div>
          )}

          <div className="paquetes__cierre">
            <h2 className="paquetes__cierre-titulo">
              {t.paginas.precios.demoTitulo}
            </h2>
            <p>{t.paginas.precios.demoTexto}</p>
            {/* Dorado y no naranja: el naranja se hunde en el panel teal y su
                hover es teal sobre teal. */}
            <Link href={rutas.reservar(idioma)} className="boton boton--demo">
              {t.hero.ctaDemo}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
