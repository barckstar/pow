import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { rutas, ZONA_COSTA_RICA } from "@/shared/config/sitio";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";
import {
  calendario,
  HORARIO,
  HORARIO_PROVISIONAL,
} from "@/features/reservas/lib/calendario";
import {
  SelectorDeFranjas,
  type FranjaSerializada,
} from "@/features/reservas/components/SelectorDeFranjas";

const TEXTOS = {
  es: {
    titulo: "Reservá tu clase de español",
    descripcion:
      "Elegí el día y la hora de tu clase de español costarricense. Los horarios se muestran en tu zona horaria y en la de Costa Rica.",
  },
  en: {
    titulo: "Book your Spanish lesson",
    descripcion:
      "Pick the day and time for your Costa Rican Spanish lesson. Times are shown in your own time zone and in Costa Rica's.",
  },
} as const;

export function generateStaticParams() {
  return IDIOMAS.map((lang) => ({ lang }));
}

/*
 * Se revalida cada hora: las franjas dependen de la hora actual (antelación
 * mínima), así que un HTML congelado en el build ofrecería huecos que ya
 * pasaron.
 */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!esIdioma(lang)) return {};

  return metadatosDe({
    titulo: TEXTOS[lang].titulo,
    descripcion: TEXTOS[lang].descripcion,
    ruta: rutas.reservar(lang),
    lang,
    alternativas: mismaRutaEnTodosLosIdiomas(rutas.reservar),
  });
}

export default async function PaginaReservar({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);

  const desde = new Date();
  const hasta = new Date(desde.getTime() + HORARIO.diasVisibles * 86_400_000);
  const franjas = await calendario().disponibilidad(
    desde,
    hasta,
    ZONA_COSTA_RICA
  );

  // Las fechas no cruzan la frontera servidor/cliente como objetos.
  const serializadas: FranjaSerializada[] = franjas.map((f) => ({
    inicio: f.inicio.toISOString(),
    fin: f.fin.toISOString(),
    disponible: f.disponible,
  }));

  return (
    <section className="seccion con-adornos">
      <DecoradosSeccion variante="reservar" />

      <div className="seccion__interior seccion__interior--estrecho">
        <h1 className="seccion__titulo">{t.reserva.titulo}</h1>
        <p className="seccion__intro">{t.reserva.intro}</p>

        <SelectorDeFranjas
          franjas={serializadas}
          lang={idioma}
          t={t}
          provisional={HORARIO_PROVISIONAL}
        />
      </div>
    </section>
  );
}
