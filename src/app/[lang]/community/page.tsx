import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { esIdioma, IDIOMAS, type Idioma } from "@/shared/i18n/config";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { metadatosDe, mismaRutaEnTodosLosIdiomas } from "@/shared/lib/sitio";
import { REDES, rutas } from "@/shared/config/sitio";
import { SEO } from "@/shared/config/seo";
import { TIQUISMOS } from "@/features/tiquismos/esquema";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";
import { FranjaHero } from "@/shared/components/ui/FranjaHero";
import { Mariposa } from "@/shared/components/ui/Decorados";

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
    ...SEO.comunidad[lang],
    ruta: rutas.comunidad(lang),
    lang,
    alternativas: mismaRutaEnTodosLosIdiomas(rutas.comunidad),
  });
}

/**
 * Esta página muestra SOLO lo que existe de verdad. No hay contadores de
 * miembros, ni testimonios, ni actividad inventada: el negocio arranca y esos
 * datos no existen. Lo que sí existe, desde el 25/09/2026, es el grupo de
 * Facebook, y desde antes el archivo de tiquismos.
 *
 * ============ EL 25/09/2026 EL CLIENTE PIDIÓ MÁS VIDA, Y TENÍA RAZÓN ============
 * La versión anterior era un `<h1>` y un párrafo sobre fondo crema, con el
 * botón de Facebook suelto en el aire debajo. El cliente lo vio así y lo dijo
 * sin rodeos: «no me gusta y necesita más vida […] que sea regla general de
 * diseño». Dos cambios, no uno:
 *
 *   1. `FranjaHero` en vez del título suelto — ya no es una excepción de
 *      «Quiénes somos», es el hero de TODA página interior desde hoy.
 *   2. El botón de Facebook pasa a ser una TARJETA con su propio ícono,
 *      título y texto — dice qué es el grupo y por qué entrar, no solo
 *      «Join our Facebook group» flotando sin contexto.
 *
 * El mismo día la tarjeta blanca se quedó corta —«quería un diseño más
 * bonito y que llame más la atención a unirse»— y pasó a ser una
 * INVITACIÓN: la ilustración del perezoso surfista que mandó el cliente a
 * sangre arriba, y debajo un panel teal con tres razones concretas y el
 * botón naranja, el único CTA de la página. Sube sobre la cola crema del
 * hero para que se vea sin hacer scroll. La línea de «vendrán grupos de
 * conversación» se quitó por completo, a pedido del cliente.
 * =================================================================
 */
export default async function PaginaComunidad({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();

  const idioma: Idioma = lang;
  const t = await getDiccionario(idioma);
  const c = t.paginas.comunidad;
  const hayRedes = Object.values(REDES).some(Boolean);

  return (
    <>
      <FranjaHero
        insignia={c.heroInsignia}
        titulo={c.titulo}
        acento={c.acento}
        subtitulo={c.intro}
        decoracion={<Mariposa />}
      />

      <section className="seccion con-adornos">
        <DecoradosSeccion variante="comunidad" />

        <div className="seccion__interior seccion__interior--estrecho">
          {hayRedes ? (
            <ul className="redes-comunidad">
              {/*
                Solo Facebook por ahora. Es un GRUPO —no una página— y por eso
                la invitación habla de "entrar" y no de "seguir": la acción real
                es pedir unirse, no darle a un botón de me gusta.
              */}
              {REDES.facebook ? (
                <li className="invitacion-grupo">
                  <div className="invitacion-grupo__ilustracion">
                    <Image
                      src="/fotos/comunidad-perezoso-surf.jpg"
                      alt={c.ilustracionAlt}
                      width={1440}
                      height={810}
                      sizes="(min-width: 1024px) 60rem, 100vw"
                    />
                  </div>

                  <div className="invitacion-grupo__cuerpo">
                    <p className="invitacion-grupo__insignia">
                      <span
                        className="invitacion-grupo__icono"
                        aria-hidden="true"
                      >
                        <IconoFacebook />
                      </span>
                      {c.facebookInsignia}
                    </p>
                    <h2 className="invitacion-grupo__titulo">
                      {c.facebookTitulo}
                    </h2>
                    <p className="invitacion-grupo__texto">{c.facebookTexto}</p>

                    <ul className="invitacion-grupo__razones">
                      {c.facebookRazones.map((razon) => (
                        <li key={razon}>{razon}</li>
                      ))}
                    </ul>

                    <a
                      href={REDES.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="boton boton--acento invitacion-grupo__boton"
                    >
                      {c.facebookEnlace}&nbsp;→
                    </a>
                    <p className="invitacion-grupo__nota">{c.facebookNota}</p>
                  </div>
                </li>
              ) : null}
            </ul>
          ) : (
            <div className="hueco">
              <span className="pendiente">{t.pendiente.etiqueta}</span>
              <p>{c.sinRedes}</p>
            </div>
          )}

          <h2 className="subseccion__titulo">{c.archivoTitulo}</h2>

          <ul className="archivo-tiquismos">
            {TIQUISMOS.map((tiquismo) => (
              <li key={tiquismo.id} className="archivo-tiquismo">
                <h3>
                  {tiquismo.expresion}{" "}
                  <span className="archivo-tiquismo__pron">
                    /{tiquismo.pronunciacion}/
                  </span>
                </h3>
                <p>{tiquismo.significado[idioma]}</p>
                <p className="archivo-tiquismo__ejemplo" lang="es">
                  «{tiquismo.ejemplo}»
                </p>
                {tiquismo.articulo ? (
                  <Link href={rutas.articulo(idioma, tiquismo.articulo)}>
                    {t.tiquismo.leerMas} →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

/* Propio y no importado de `BarraSocial.tsx`: es la misma convención que ya
   usa ese archivo y `Experiencias.tsx` — un SVG de unas pocas líneas no
   justifica compartir un componente entre dos sitios que no comparten nada
   más. */
function IconoFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z" />
    </svg>
  );
}
