"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { calcularEstado } from "@/shared/lib/navbarScroll";
import { rutas } from "@/shared/config/sitio";
import { IDIOMAS, NOMBRE_IDIOMA, type Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

type Props = {
  lang: Idioma;
  t: Diccionario;
};

export function Navbar({ lang, t }: Props) {
  const [estado, setEstado] = useState({ enTope: true, oculto: false });
  const [menuAbierto, setMenuAbierto] = useState(false);
  const ultimaY = useRef<number>(0);
  const menuAbiertoRef = useRef<boolean>(false);
  const estadoRef = useRef(estado);
  const pathname = usePathname();

  // El listener se registra una sola vez; lee el estado del menú por ref para
  // no tener que volver a suscribirse cada vez que el menú se abre o cierra.
  menuAbiertoRef.current = menuAbierto;

  useEffect(() => {
    function alHacerScroll() {
      const y = window.scrollY;

      /*
       * El cálculo va FUERA del updater de setState y el ref se actualiza
       * aquí, no dentro.
       *
       * React 19 invoca los updaters dos veces en modo estricto para detectar
       * efectos secundarios. Con `ultimaY.current = y` dentro del updater, la
       * segunda invocación leía el valor que acababa de escribir la primera,
       * el delta daba 0, caía en el umbral de micro-scroll y el navbar se
       * quedaba congelado tras el primer cambio de estado.
       */
      const previo = estadoRef.current;
      const siguiente = calcularEstado({
        y,
        ultimaY: ultimaY.current,
        ocultoPrevio: previo.oculto,
        menuAbierto: menuAbiertoRef.current,
      });
      ultimaY.current = y;

      if (
        siguiente.enTope === previo.enTope &&
        siguiente.oculto === previo.oculto
      ) {
        return;
      }

      estadoRef.current = siguiente;
      setEstado(siguiente);
    }

    // Lectura inicial: si se llega con el scroll ya avanzado (recarga a media
    // página, o un enlace con ancla), el header debe nacer compacto.
    alHacerScroll();

    window.addEventListener("scroll", alHacerScroll, { passive: true });
    return () => window.removeEventListener("scroll", alHacerScroll);
  }, []);

  // Al navegar, el menú se cierra solo. Sin esto queda abierto sobre la página
  // nueva.
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  const enlaces = [
    { href: rutas.online(lang), texto: t.nav.online },
    { href: rutas.presencial(lang), texto: t.nav.presencial },
    { href: rutas.destinos(lang), texto: t.nav.destinos },
    { href: rutas.blog(lang), texto: t.nav.blog },
    { href: rutas.precios(lang), texto: t.nav.precios },
    { href: rutas.comunidad(lang), texto: t.nav.comunidad },
  ];

  const otroIdioma = IDIOMAS.find((i) => i !== lang) ?? lang;
  const rutaSinIdioma = pathname.replace(/^\/[a-z]{2}/, "") || "";

  return (
    <header
      className="navbar"
      data-tope={estado.enTope}
      data-oculto={estado.oculto && !menuAbierto}
      aria-label={NOMBRE_SITIO_CORTO}
    >
      {/* Panel de fondo: se escala en vertical en vez de cambiar de alto, así
          la transición es puro transform y no dispara layout. */}
      <div className="navbar__fondo" aria-hidden="true" />

      {/*
        La onda que remata el área crema, como en el concept board: baja por
        la izquierda —dejando aire bajo el logo— y sube hacia la derecha para
        entrar en la foto del hero.

        Va en su propio elemento y no dentro del panel de fondo a propósito:
        el panel se escala en vertical y la curva saldría aplastada. Aquí solo
        se desplaza, y se desvanece al compactarse el header porque a media
        página una curva crema flotando sobre el contenido no tiene sentido.
      */}
      <svg
        className="navbar__onda"
        viewBox="0 0 1200 44"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M0,0 H1200 V3 C 880,5 600,42 0,42 Z" />
      </svg>

      <div className="navbar__contenido">
        {/*
          Sin `aria-label`: el enlace ya contiene el nombre de la marca como
          texto visible, y un aria-label distinto lo reemplazaría. Un lector
          de pantalla anunciaría "Inicio" mientras quien usa control por voz
          dice "Costa Rica" y no pasa nada. Lo detectó Lighthouse
          (label-content-name-mismatch).
        */}
        <Link href={rutas.inicio(lang)} className="navbar__logo">
          <Image
            src="/marca/perezoso.png"
            alt=""
            width={155}
            height={120}
            priority
            className="navbar__perezoso"
          />
          <span className="navbar__marca">
            <span className="navbar__marca-linea1">Costa Rica</span>
            <span className="navbar__marca-linea2">Spanish Experience</span>
          </span>
        </Link>

        <div className="navbar__acciones">
          <nav className="navbar__enlaces" aria-label={t.nav.inicio}>
            {enlaces.map((enlace) => (
              <Link
                key={enlace.href}
                href={enlace.href}
                className="navbar__enlace"
                aria-current={pathname === enlace.href ? "page" : undefined}
              >
                {enlace.texto}
              </Link>
            ))}
          </nav>

          <Link
            href={`/${otroIdioma}${rutaSinIdioma}`}
            className="navbar__idioma"
            hrefLang={otroIdioma}
            aria-label={`${t.nav.cambiarIdioma}: ${NOMBRE_IDIOMA[otroIdioma]}`}
          >
            {otroIdioma.toUpperCase()}
          </Link>

          <Link href={rutas.reservar(lang)} className="navbar__cta">
            {t.nav.reservar}
          </Link>

          <button
            type="button"
            className="navbar__hamburguesa"
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label={menuAbierto ? t.nav.cerrarMenu : t.nav.abrirMenu}
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            <span className="navbar__barra" />
            <span className="navbar__barra" />
            <span className="navbar__barra" />
          </button>
        </div>
      </div>

      <div
        id="menu-movil"
        className="navbar__movil"
        data-abierto={menuAbierto}
        hidden={!menuAbierto}
      >
        <nav aria-label={t.nav.inicio}>
          {enlaces.map((enlace) => (
            <Link key={enlace.href} href={enlace.href} className="navbar__movil-enlace">
              {enlace.texto}
            </Link>
          ))}
        </nav>
        <Link href={rutas.reservar(lang)} className="navbar__movil-cta">
          {t.nav.reservar}
        </Link>
      </div>
    </header>
  );
}

const NOMBRE_SITIO_CORTO = "Costa Rica Spanish Experience";
