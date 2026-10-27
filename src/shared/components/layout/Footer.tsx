import Image from "next/image";
import Link from "next/link";
import { CONTACTO, FUENTES, NOMBRE_SITIO, rutas } from "@/shared/config/sitio";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

type Props = {
  lang: Idioma;
  t: Diccionario;
};

export function Footer({ lang, t }: Props) {
  const anio = new Date().getFullYear();

  const enlaces = [
    { href: rutas.online(lang), texto: t.nav.online },
    { href: rutas.costaRica(lang), texto: t.nav.costaRica },
    { href: rutas.blog(lang), texto: t.nav.blog },
    { href: rutas.precios(lang), texto: t.nav.precios },
    { href: rutas.comunidad(lang), texto: t.nav.comunidad },
    { href: rutas.voluntariado(lang), texto: t.nav.voluntariado },
  ];

  return (
    <footer className="pie">
      <div className="pie__interior">
        <div className="pie__marca">
          {/* 177x150: la relación de aspecto real del logo nuevo (1,18:1),
              no la del recorte viejo. */}
          <Image
            src="/marca/perezoso.png"
            alt=""
            width={177}
            height={150}
            className="pie__perezoso"
          />
          <p className="pie__lema">{t.footer.lema}</p>
          {CONTACTO.correo ? (
            <a href={`mailto:${CONTACTO.correo}`} className="pie__contacto">
              {CONTACTO.correo}
            </a>
          ) : null}

          {/*
            Una línea y una nota, sin tarjeta: el pie es el sitio donde esto
            se encuentra cuando se busca, no donde tiene que gritar. El enlace
            va a `/volunteer`; la nota manda a SINAC, que tiene su propio
            programa para las áreas protegidas — lo que la página nuestra no
            sustituye ni promete.
          */}
          <div className="pie__voluntariado">
            <Link
              href={rutas.voluntariado(lang)}
              className="pie__voluntariado-enlace"
            >
              <IconoCorazon />
              <span>{t.footer.voluntariado}</span>
              <span aria-hidden="true">→</span>
            </Link>
            <p className="pie__voluntariado-nota">
              {t.footer.sinac}{" "}
              <a
                href={FUENTES.sinacVoluntariado}
                target="_blank"
                rel="noopener noreferrer"
              >
                SINAC<span aria-hidden="true"> ↗</span>
              </a>
            </p>
          </div>
        </div>

        <nav className="pie__navegacion" aria-label={t.footer.navegacion}>
          <h2 className="pie__titulo">{t.footer.navegacion}</h2>
          <ul>
            {enlaces.map((enlace) => (
              <li key={enlace.href}>
                <Link href={enlace.href}>{enlace.texto}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pie__legal">
          <h2 className="pie__titulo">{t.footer.legal}</h2>
          <ul>
            <li>
              <Link href={rutas.creditos(lang)}>{t.footer.creditosFotos}</Link>
            </li>
          </ul>
        </div>
      </div>

      <p className="pie__derechos">
        © {anio} {NOMBRE_SITIO}. {t.footer.derechos}
      </p>
    </footer>
  );
}

/** Un corazón de línea, el mismo trazo que el resto de iconos del sitio. */
function IconoCorazon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pie__voluntariado-icono"
    >
      <path d="M12 20.5s-8-4.7-8-10.2A4.5 4.5 0 0 1 12 7.6a4.5 4.5 0 0 1 8 2.7c0 5.5-8 10.2-8 10.2z" />
    </svg>
  );
}
