import Image from "next/image";
import Link from "next/link";
import type { Articulo } from "../esquema";
import { rutas } from "@/shared/config/sitio";
import { fechaISO, fechaLarga } from "@/shared/lib/fechas";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

export function TarjetaArticulo({
  articulo,
  lang,
  t,
  prioridad = false,
}: {
  articulo: Articulo;
  lang: Idioma;
  t: Diccionario;
  prioridad?: boolean;
}) {
  return (
    <article className="tarjeta-articulo">
      {articulo.portada ? (
        <Link
          href={rutas.articulo(lang, articulo.slug)}
          className="tarjeta-articulo__foto"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={articulo.portada}
            alt=""
            fill
            priority={prioridad}
            sizes="(min-width: 900px) 30vw, 100vw"
            className="tarjeta-articulo__imagen"
          />
        </Link>
      ) : null}

      <div className="tarjeta-articulo__cuerpo">
        <p className="tarjeta-articulo__meta">
          <time dateTime={fechaISO(articulo.fecha)}>
            {fechaLarga(articulo.fecha, lang)}
          </time>
          <span aria-hidden="true"> · </span>
          <span>
            {articulo.minutos} {t.blog.minutos}
          </span>
        </p>

        <h3 className="tarjeta-articulo__titulo">
          <Link href={rutas.articulo(lang, articulo.slug)}>
            {articulo.titulo}
          </Link>
        </h3>

        <p className="tarjeta-articulo__resumen">{articulo.resumen}</p>

        <ul className="tarjeta-articulo__etiquetas">
          {articulo.etiquetas.map((etiqueta) => (
            <li key={etiqueta}>
              <Link href={rutas.etiqueta(lang, etiqueta)}>#{etiqueta}</Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
