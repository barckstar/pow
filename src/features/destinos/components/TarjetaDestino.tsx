import Image from "next/image";
import Link from "next/link";
import type { Destino } from "../esquema";
import { rutas } from "@/shared/config/sitio";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

/**
 * La ficha de un destino de inmersión.
 *
 * ============ DOS FOTOS, Y LA SEGUNDA ES LA QUE CONVENCE ============
 * Arriba el atractivo —la playa, el volcán, la calle— que es la razón para
 * querer ir. Abajo, una clase de verdad en ese mismo sitio, que es la prueba
 * de que ahí se estudia.
 *
 * El cliente mandó las dos series por separado y pidió expresamente que fueran
 * las dos: «fotos de los destinos pero también imágenes de los estudiantes en
 * las clases». Tiene razón — una playa sola vende un viaje, no una escuela.
 * ====================================================================
 *
 * ============ EL AVISO DE ANUNCIO VA PRIMERO ============
 * Cuando la ficha es un anuncio pagado, la etiqueta se pinta ENCIMA de la
 * fotografía y es lo primero del orden del documento, no una línea gris al
 * final. Un aviso que aparece después de que ya te leíste la ficha no es un
 * aviso: es una nota al pie.
 *
 * Hoy ninguna ficha lo lleva, pero el camino tiene que estar hecho y probado
 * antes de que entre el primer hotel, no después.
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

        <figure className="destino__clase">
          <Image
            src={destino.fotoClase}
            alt={destino.fotoClaseAlt[lang]}
            width={640}
            height={360}
            /* Estas fotos las entregó el cliente y varias vienen recortadas de
               web, con lados raros. Un alto fijo y `cover` las cuadra todas sin
               que ninguna deforme la tarjeta. */
            sizes="(min-width: 1100px) 30vw, (min-width: 700px) 44vw, 92vw"
            className="destino__clase-imagen"
          />
          <figcaption className="destino__clase-pie">
            {t.destinos.enClase}
            {destino.escuela ? (
              <>
                {" · "}
                <span className="destino__escuela">
                  {destino.escuela.nombre}
                </span>
                {/*
                  El cliente escribió que la información de las escuelas
                  «tengo que conseguirla bien». Hasta que el acuerdo esté
                  cerrado, el nombre se enseña marcado y no como un hecho.
                */}
                {destino.escuela.confirmada ? null : (
                  <span className="pendiente pendiente--chica">
                    {t.pendiente.etiqueta}
                  </span>
                )}
              </>
            ) : null}
          </figcaption>
        </figure>

        <Link
          href={rutas.solicitud(lang, destino.id)}
          className="destino__cta"
        >
          {t.destinos.solicitar} {destino.nombre}
          <span className="destino__flecha" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
