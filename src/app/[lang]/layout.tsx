import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import { IDIOMAS, esIdioma, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { Navbar } from "@/shared/components/layout/Navbar";
import { Footer } from "@/shared/components/layout/Footer";
import { BarraSocial } from "@/shared/components/layout/BarraSocial";
import { NOMBRE_SITIO, URL_BASE } from "@/shared/config/sitio";
import "../globals.css";

/*
 * Poppins es la tipografía del sistema de diseño. Se cargan solo los tres
 * pesos que el sitio usa de verdad: cada peso extra es un archivo más que
 * descargar. `display: swap` evita el texto invisible mientras carga, que es
 * lo que Lighthouse penaliza como FOIT.
 */
const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--fuente-poppins",
});

export function generateStaticParams() {
  return IDIOMAS.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(URL_BASE),
  title: {
    default: NOMBRE_SITIO,
    template: `%s | ${NOMBRE_SITIO}`,
  },
};

export default async function LayoutIdioma({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);

  return (
    <html lang={idioma} className={poppins.variable}>
      <body>
        <a href="#contenido" className="salto-al-contenido">
          {t.comun.saltarAlContenido}
        </a>

        <Navbar lang={idioma} t={t} />

        <main id="contenido">{children}</main>

        <BarraSocial t={t} />
        <Footer lang={idioma} t={t} />
      </body>
    </html>
  );
}
