import Image from "next/image";
import Link from "next/link";
import type { Articulo } from "../esquema";
import { HojaPalma } from "@/shared/components/ui/Decorados";
import { rutas } from "@/shared/config/sitio";
import { fechaISO, fechaLarga } from "@/shared/lib/fechas";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

/**
 * La tarjeta de un artículo en la rejilla del blog.
 *
 * ============ SIEMPRE HAY CABECERA, HAYA FOTO O NO ============
 * La portada es opcional en el esquema —y tiene que seguir siéndolo: los
 * artículos los va a escribir el profesor, y obligarle a buscar una imagen
 * con licencia para cada uno es la forma segura de que deje de escribir—.
 *
 * Pero antes, cuando faltaba, la tarjeta se quedaba SIN el bloque de imagen y
 * empezaba directamente por la fecha. En una rejilla de dos o tres columnas
 * eso deja una tarjeta corta al lado de otra alta, con el título a distinta
 * altura: se lee como un fallo, no como una variante. Pasó en cuanto hubo un
 * artículo sin foto.
 *
 * Ahora, cuando no hay portada se pinta un panel del mismo alto con el
 * degradado de la paleta y una hoja de palma recortada por la esquina. Ocupa
 * el mismo sitio, la rejilla no se descuadra, y no cuesta ni una petición de
 * red porque el dibujo es un SVG en línea.
 * ==============================================================
 */
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
      {/*
        `aria-hidden` y `tabIndex={-1}` en los dos casos: el título de abajo ya
        es un enlace al mismo artículo, y dos enlaces seguidos al mismo sitio
        obligan a quien navega con teclado o lector de pantalla a pasar dos
        veces por lo mismo.
      */}
      <Link
        href={rutas.articulo(lang, articulo.slug)}
        className="tarjeta-articulo__foto"
        data-sin-foto={!articulo.portada}
        tabIndex={-1}
        aria-hidden="true"
      >
        {articulo.portada ? (
          <Image
            src={articulo.portada}
            alt=""
            fill
            priority={prioridad}
            sizes="(min-width: 1100px) 30vw, (min-width: 700px) 46vw, 100vw"
            className="tarjeta-articulo__imagen"
          />
        ) : (
          <span className="tarjeta-articulo__dibujo">
            <HojaPalma />
          </span>
        )}
      </Link>

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
