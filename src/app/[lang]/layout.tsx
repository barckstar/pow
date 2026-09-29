import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import { IDIOMAS, esIdioma, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { Navbar } from "@/shared/components/layout/Navbar";
import { Footer } from "@/shared/components/layout/Footer";
import { BarraSocial } from "@/shared/components/layout/BarraSocial";
import { NOMBRE_CORTO, NOMBRE_SITIO, URL_BASE } from "@/shared/config/sitio";
import { EtiquetaJsonLd, jsonLdSitio } from "@/shared/lib/jsonLd";
import "../globals.css";

/*
 * Poppins es la tipografía del sistema de diseño. Se cargan solo los tres
 * pesos que el sitio usa de verdad: cada peso extra es un archivo más que
 * descargar. `display: swap` evita el texto invisible mientras carga, que es
 * lo que Lighthouse penaliza como FOIT.
 */
const poppins = Poppins({
  /*
   * Solo `latin`. El subconjunto `latin-ext` cubre caracteres de Europa
   * central y oriental que ni el español ni el inglés usan, y duplicaba el
   * número de archivos de fuente: 6 peticiones y 41 KB en la auditoría de
   * móvil, frente a 3 y ~21 KB. Las vocales acentuadas, la ñ, la ü y los
   * signos de apertura ¿ ¡ están todos en `latin`.
   */
  subsets: ["latin"],
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
    // El sufijo va con el nombre corto para que el título de cada página
    // quepa en los 65 caracteres que muestran los buscadores.
    template: `%s | ${NOMBRE_CORTO}`,
  },
  /*
   * Red de seguridad: cada página pasa por `metadatosDe()` con su propia
   * descripción, pero el 404 y cualquier ruta futura que se olvide de
   * hacerlo heredan esta en vez de salir sin ninguna.
   */
  description:
    "Costa Rican Spanish lessons: one-to-one online classes with a native teacher, and immersion in Costa Rica.",
  applicationName: NOMBRE_SITIO,
  category: "education",
  keywords: [
    "Costa Rican Spanish",
    "learn Spanish online",
    "Spanish lessons",
    "Spanish immersion Costa Rica",
    "voseo",
    "tico slang",
  ],
  /*
   * `max-image-preview: large` deja a Google enseñar la foto grande en
   * Discover y en los resultados. Es el valor por defecto que se pierde si no
   * se declara, y el sitio vive de fotografía.
   */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  /* Sin esto iOS convierte cualquier número del texto en un enlace de teléfono. */
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#0F6E78",
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
        <EtiquetaJsonLd datos={jsonLdSitio(idioma)} />

        <a href="#contenido" className="salto-al-contenido">
          {t.comun.saltarAlContenido}
        </a>

        <Navbar lang={idioma} t={t} />

        <main id="contenido">{children}</main>

        <BarraSocial lang={idioma} t={t} />
        <Footer lang={idioma} t={t} />
      </body>
    </html>
  );
}
