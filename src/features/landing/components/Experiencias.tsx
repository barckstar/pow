import Link from "next/link";
import { rutas } from "@/shared/config/sitio";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

/**
 * La bifurcación del sitio: dos públicos distintos entran por la misma
 * puerta y aquí se separan. Va inmediatamente después del hero por eso.
 */
export function Experiencias({ lang, t }: { lang: Idioma; t: Diccionario }) {
  const opciones = [
    {
      href: rutas.online(lang),
      titulo: t.experiencias.onlineTitulo,
      texto: t.experiencias.onlineTexto,
      enlace: t.experiencias.onlineEnlace,
      icono: <IconoPantalla />,
      variante: "online" as const,
    },
    {
      href: rutas.presencial(lang),
      titulo: t.experiencias.presencialTitulo,
      texto: t.experiencias.presencialTexto,
      enlace: t.experiencias.presencialEnlace,
      icono: <IconoPalmera />,
      variante: "presencial" as const,
    },
  ];

  return (
    <section className="seccion" aria-labelledby="experiencias-titulo">
      <div className="seccion__interior">
        <h2 className="seccion__titulo" id="experiencias-titulo">
          {t.experiencias.titulo}
        </h2>

        <div className="experiencias">
          {opciones.map((opcion) => (
            <article
              key={opcion.href}
              className="experiencia"
              data-variante={opcion.variante}
            >
              <span className="experiencia__icono" aria-hidden="true">
                {opcion.icono}
              </span>
              <h3 className="experiencia__titulo">{opcion.titulo}</h3>
              <p className="experiencia__texto">{opcion.texto}</p>
              <Link href={opcion.href} className="experiencia__enlace">
                {opcion.enlace} →
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

function IconoPalmera() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c0-6 .5-10 1.5-13" />
      <path d="M13.5 9C11 6.5 7 6 4.5 8.5" />
      <path d="M13.5 9c2.5-2.5 6.5-3 9-.5" />
      <path d="M13.5 9c-1-3 .5-6 3.5-7" />
      <path d="M6 22h12" />
    </svg>
  );
}
