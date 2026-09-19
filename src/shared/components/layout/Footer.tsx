import Image from "next/image";
import Link from "next/link";
import { CONTACTO, NOMBRE_SITIO, rutas } from "@/shared/config/sitio";
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
    { href: rutas.presencial(lang), texto: t.nav.presencial },
    { href: rutas.destinos(lang), texto: t.nav.destinos },
    { href: rutas.blog(lang), texto: t.nav.blog },
    { href: rutas.precios(lang), texto: t.nav.precios },
    { href: rutas.comunidad(lang), texto: t.nav.comunidad },
  ];

  return (
    <footer className="pie">
      <div className="pie__interior">
        <div className="pie__marca">
          <Image
            src="/marca/perezoso.png"
            alt=""
            width={155}
            height={120}
            className="pie__perezoso"
          />
          <p className="pie__lema">{t.footer.lema}</p>
          {/* CONTACTO está en null: el cliente aún no ha dado correo ni
              teléfono. Se muestra el aviso en vez de inventar datos. */}
          {CONTACTO.correo ? (
            <a href={`mailto:${CONTACTO.correo}`} className="pie__contacto">
              {CONTACTO.correo}
            </a>
          ) : (
            <span className="pendiente" data-pendiente>
              {t.pendiente.etiqueta}
            </span>
          )}
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
              <Link href={`/${lang}/creditos`}>{t.footer.creditosFotos}</Link>
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
