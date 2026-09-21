import Image from "next/image";
import type { Destino } from "../esquema";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

/**
 * La ficha de un lugar.
 *
 * ============ EL AVISO DE ANUNCIO VA PRIMERO ============
 * Cuando la ficha es un anuncio pagado, la etiqueta se pinta ENCIMA de la
 * fotografía y es lo primero del orden del documento, no una línea gris al
 * final. Un aviso que aparece después de que ya te leíste la ficha no es un
 * aviso: es una nota al pie.
 *
 * Hoy ninguna ficha lo lleva —las cinco son contenido propio—, pero el camino
 * tiene que estar hecho y probado antes de que entre el primer hotel, no
 * después. Ver la nota del esquema.
 * ========================================================
 */
export function TarjetaDestino({
  destino,
  lang,
  t,
  prioridad = false,
}: {
  destino: Destino;
  lang: Idioma;
  t: Diccionario;
  prioridad?: boolean;
}) {
  return (
    <article className="destino" data-patrocinado={destino.patrocinado}>
      <div className="destino__foto">
        <Image
          src={destino.foto}
          alt={destino.fotoAlt[lang]}
          fill
          priority={prioridad}
          sizes="(min-width: 1100px) 32vw, (min-width: 700px) 46vw, 100vw"
          className="destino__imagen"
        />

        {destino.patrocinado && destino.anunciante ? (
          <p className="destino__anuncio">
            <span className="destino__anuncio-etiqueta">
              {t.destinos.anuncio}
            </span>
            <a href={destino.anunciante.url} rel="sponsored nofollow noopener">
              {destino.anunciante.nombre}
            </a>
          </p>
        ) : null}
      </div>

      <div className="destino__cuerpo">
        <p className="destino__zona">{destino.zona}</p>
        <h3 className="destino__nombre">{destino.nombre}</h3>
        <p className="destino__lema">{destino.lema[lang]}</p>
        <p className="destino__descripcion">{destino.descripcion[lang]}</p>

        {/* Los tres hechos concretos. Es lo que separa una ficha de un
            párrafo de folleto: se pueden comprobar uno por uno. */}
        <ul className="destino__destacados">
          {destino.destacados[lang].map((punto) => (
            <li key={punto}>{punto}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
