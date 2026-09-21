import Link from "next/link";
import { rutas } from "@/shared/config/sitio";
import { Monstera, Ola } from "@/shared/components/ui/Decorados";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

/**
 * La bifurcación del sitio: dos públicos distintos entran por la misma
 * puerta y aquí se separan. Va inmediatamente después del hero por eso.
 *
 * ============ QUÉ SE CAMBIÓ Y POR QUÉ ============
 * La primera versión eran dos rectángulos blancos con un icono chico, un
 * título y un enlace de texto. Funcionaban y no se miraban: en la página son
 * el PRIMER PASO —la decisión de la que cuelga todo lo demás— y pesaban
 * visualmente menos que la franja de confianza que tienen encima.
 *
 * Lo que las levanta ahora:
 *
 *   1. UNA MARCA DE AGUA GRANDE por tarjeta, recortada por la esquina. Es lo
 *      que les da tamaño sin meter una fotografía, que costaría dos peticiones
 *      de red justo debajo del LCP.
 *   2. UNA CINTA DE COLOR arriba, distinta por vía. Antes las dos tarjetas
 *      eran idénticas salvo el texto; el color es lo que se lee de lejos.
 *   3. EL ENLACE ES UN BOTÓN, no una línea de texto con una flecha. Era el
 *      único sitio del sitio donde la acción principal de un bloque no se veía
 *      como acción.
 * =================================================
 */
export function Experiencias({ lang, t }: { lang: Idioma; t: Diccionario }) {
  const opciones = [
    {
      href: rutas.online(lang),
      titulo: t.experiencias.onlineTitulo,
      texto: t.experiencias.onlineTexto,
      enlace: t.experiencias.onlineEnlace,
      icono: <IconoPantalla />,
      /* La monstera para lo remoto y la ola para lo presencial: la planta de
         interior contra el mar. */
      marca: <Monstera />,
      variante: "online" as const,
    },
    {
      href: rutas.presencial(lang),
      titulo: t.experiencias.presencialTitulo,
      texto: t.experiencias.presencialTexto,
      enlace: t.experiencias.presencialEnlace,
      icono: <IconoDosPersonas />,
      marca: <Ola />,
      variante: "presencial" as const,
    },
  ];

  return (
    <section
      className="seccion con-adornos"
      aria-labelledby="experiencias-titulo"
    >
      <DecoradosSeccion variante="experiencias" />

      <div className="seccion__interior">
        <h2 className="seccion__titulo" id="experiencias-titulo">
          {t.experiencias.titulo}
        </h2>

        <div className="experiencias revelar">
          {opciones.map((opcion) => (
            <article
              key={opcion.href}
              className="experiencia"
              data-variante={opcion.variante}
            >
              {/* La cinta de color de la vía. Decorativa: lo que distingue las
                  dos tarjetas para quien no ve color es el título. */}
              <span className="experiencia__cinta" aria-hidden="true" />

              <span className="experiencia__marca" aria-hidden="true">
                {opcion.marca}
              </span>

              <span className="experiencia__icono" aria-hidden="true">
                {opcion.icono}
              </span>
              <h3 className="experiencia__titulo">{opcion.titulo}</h3>
              <p className="experiencia__texto">{opcion.texto}</p>

              <Link href={opcion.href} className="experiencia__enlace">
                {opcion.enlace}
                <span className="experiencia__flecha" aria-hidden="true">
                  →
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function IconoPantalla() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

/**
 * Dos personas conversando.
 *
 * Antes aquí había una palmera, de cuando esta vía se llamaba «En Costa Rica».
 * Ya no se anuncia por el sitio sino por el modo, así que el icono tiene que
 * decir «cara a cara», no «trópico». Lo tropical lo ponen la marca de agua y
 * los adornos de la sección, que es su papel.
 */
function IconoDosPersonas() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8.5" cy="7.5" r="3" />
      <path d="M3 20c0-3.3 2.5-5.5 5.5-5.5S14 16.7 14 20" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14.7c2.9.3 5 2.5 5 5.3" />
    </svg>
  );
}
