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
  const ultimaY = useRef<number>(0);
  const menuAbiertoRef = useRef<boolean>(false);
  const estadoRef = useRef(estado);
  const pathname = usePathname();

  /*
   * ============ EL MENÚ SE CIERRA SOLO, SIN EFECTO ============
   * Al navegar, el menú móvil tiene que cerrarse: si no, se queda abierto
   * encima de la página nueva.
   *
   * Estaba resuelto con `useEffect(() => setMenuAbierto(false), [pathname])`.
   * Funcionaba y es el patrón que React desaconseja —y que ESLint marcaba como
   * error—: un `setState` dentro de un efecto pinta el componente dos veces, y
   * además deja un fotograma con el menú abierto sobre la página nueva.
   *
   * Aquí el estado guarda EN QUÉ RUTA se abrió. Si la ruta actual es otra, el
   * menú está cerrado por definición: no hay nada que sincronizar porque el
   * valor se deriva. Se cierra en el mismo render de la navegación.
   * ============================================================
   */
  const [menu, setMenu] = useState({ abierto: false, ruta: pathname });
  const menuAbierto = menu.abierto && menu.ruta === pathname;

  const alternarMenu = () =>
    setMenu({ abierto: !menuAbierto, ruta: pathname });

  /*
   * El listener del scroll se registra UNA sola vez y lee el estado del menú
   * por ref, para no tener que volver a suscribirse cada vez que se abre o se
   * cierra.
   *
   * La escritura del ref va en un efecto y no en el cuerpo del render: durante
   * el render un componente tiene que ser una función pura de sus props y su
   * estado, y escribir un ref ahí rompe eso —React puede descartar un render a
   * medias, y el ref se quedaría con un valor que nunca llegó a pintarse—. Lo
   * marcaba ESLint con `react-hooks/refs`.
   *
   * Que el ref se actualice después del pintado no afecta: quien lo lee es un
   * listener de scroll, que por definición ocurre más tarde.
   */
  useEffect(() => {
    menuAbiertoRef.current = menuAbierto;
  }, [menuAbierto]);

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
      {/* Panel de fondo. Va aparte del header para poder ser translúcido y
          desenfocado sin arrastrar en ello al logo ni a los enlaces: la
          opacidad de un elemento se aplica a todos sus hijos. */}
      <div className="navbar__fondo" aria-hidden="true" />

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
            onClick={alternarMenu}
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
