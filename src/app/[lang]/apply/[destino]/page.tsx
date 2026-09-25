import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { rutas } from "@/shared/config/sitio";
import { seoDeSolicitud } from "@/shared/config/seo";
import { DESTINOS } from "@/features/destinos/esquema";
import { PaginaDeSolicitud } from "@/features/solicitud/components/PaginaDeSolicitud";

/**
 * Las cuatro solicitudes con destino, por idioma: ocho páginas estáticas.
 *
 * Salen de `DESTINOS`, no de una lista escrita a mano. El día que el cliente
 * confirme un quinto destino, se añade al JSON y esta ruta aparece sola, con
 * sus metadatos compuestos y verificada por el `postbuild`.
 */
export function generateStaticParams() {
  return IDIOMAS.flatMap((lang) =>
    DESTINOS.map((destino) => ({ lang, destino: destino.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; destino: string }>;
}): Promise<Metadata> {
  const { lang, destino } = await params;
  if (!esIdioma(lang)) return {};

  const elegido = DESTINOS.find((d) => d.id === destino);
  if (!elegido) return {};

  return metadatosDe({
    ...seoDeSolicitud(lang, elegido.nombre, elegido.zona),
    ruta: rutas.solicitud(lang, elegido.id),
    lang,
    /* La foto de la clase de ESE destino: es la que enseña de qué va la
       página cuando el enlace se comparte por WhatsApp. */
    imagen: elegido.fotoClase,
    alternativas: mismaRutaEnTodosLosIdiomas((l) =>
      rutas.solicitud(l, elegido.id)
    ),
  });
}

export default async function PaginaSolicitudConDestino({
  params,
}: {
  params: Promise<{ lang: string; destino: string }>;
}) {
  const { lang, destino } = await params;
  if (!esIdioma(lang)) notFound();

  /*
   * Un destino que no está en la lista es un 404, no un formulario vacío.
   *
   * `generateStaticParams` solo genera los cuatro, pero la ruta sigue
   * existiendo para cualquier otra cosa que alguien escriba en la barra. Sin
   * esto, `/es/solicitud/cualquier-cosa` devolvería la página con el titular a
   * medias y un 200, que para un buscador es una página real y vacía.
   */
  const elegido = DESTINOS.find((d) => d.id === destino);
  if (!elegido) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);

  return (
    <PaginaDeSolicitud
      lang={idioma}
      t={t}
      destino={{ id: elegido.id, nombre: elegido.nombre }}
    />
  );
}
