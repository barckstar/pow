import Image from "next/image";
import Link from "next/link";

/**
 * El hero de una página interior.
 *
 * ============ QUÉ PROBLEMA RESUELVE ============
 * `/online` y `/presencial` son las dos páginas de venta del sitio —de ellas
 * cuelga la reserva— y empezaban las dos con un `<h1>` sobre la crema y nada
 * más. Ni una fotografía. Después de una portada a sangre con el Pacífico
 * detrás, entrar ahí se sentía como salir del sitio.
 *
 * Esto les da la misma entrada que la portada: fotografía a lo ancho, velo de
 * crema y titular partido en dos colores. El sitio deja de tener dos calidades
 * distintas según en qué página estés.
 * ===============================================
 *
 * ============ SIN OLAS: SON DE LA PORTADA ============
 * Se probaron aquí y se quitaron por decisión del cliente, y tiene sentido:
 * una firma que aparece en todas partes deja de ser una firma. Las olas son el
 * remate de la portada y solo de la portada.
 *
 * Lo que cierra estos heroes es el redondeo de la esquina inferior derecha,
 * que responde al de la superior izquierda. Sin él, el corte de abajo se veía
 * como una foto mal recortada; con él, la fotografía se lee como una pieza con
 * forma propia.
 * =====================================================
 *
 * ============ POR QUÉ ES COMPARTIDO Y NO DOS HEROES ============
 * Las dos páginas necesitaban lo mismo con distinto contenido. Copiado dos
 * veces, el día que se toque el velo o la altura hay que acordarse de las dos
 * —y la que se olvide no falla, simplemente se queda distinta, que es peor
 * porque no se nota hasta que alguien mira las dos seguidas—.
 *
 * Vive en `shared/` y no en una feature porque lo usan dos features distintas,
 * que es lo único que la arquitectura por features prohíbe de plano.
 * ===============================================================
 *
 * @param prioridad Marca la foto como LCP. Va en `true` siempre que este hero
 *   sea lo primero de la página, que es su único uso hoy. Se deja como
 *   parámetro para no tener que adivinarlo desde dentro: el componente no sabe
 *   dónde lo montan.
 */
export function HeroPagina({
  foto,
  fotoAlt,
  titulo,
  acento,
  subtitulo,
  cta,
  prioridad = true,
  encuadre = "completo",
}: {
  foto: string;
  fotoAlt: string;
  titulo: string;
  acento: string;
  subtitulo: string;
  cta?: { href: string; texto: string };
  prioridad?: boolean;
  /**
   * `completo`: la foto cubre todo el hero y el velo de crema tapa su mitad
   * izquierda, que es donde va el texto. Sirve cuando el motivo de la foto
   * está a la derecha.
   *
   * `derecha`: la foto ocupa solo el lado derecho y se funde con la crema por
   * su borde izquierdo. Para fotos cuyo motivo está más a la izquierda —el
   * perezoso de `/volunteer` queda entre el 25 y el 45 % del ancho—, que con
   * el velo completo se quedaba escondido bajo la crema.
   */
  encuadre?: "completo" | "derecha";
}) {
  return (
    <section
      className={
        encuadre === "derecha"
          ? "hero-pagina hero-pagina--derecha"
          : "hero-pagina"
      }
    >
      <div className="hero-pagina__foto">
        <Image
          src={foto}
          alt={fotoAlt}
          fill
          priority={prioridad}
          /* `priority` precarga, pero la auditoría de descubrimiento del LCP
             pide además la pista de prioridad explícita en la precarga. */
          fetchPriority={prioridad ? "high" : "auto"}
          /* Ocupa el ancho completo. Declarar un ancho fijo para móvil sale
             mal: Next lo multiplica por la densidad de pantalla y acaba
             sirviendo una variante más grande, no más pequeña. Está medido en
             el hero de la portada. */
          sizes="100vw"
          className="hero-pagina__imagen"
        />
        <div className="hero-pagina__velo" aria-hidden="true" />
      </div>

      <div className="hero-pagina__texto">
        <h1 className="hero-pagina__titulo">
          {titulo}
          <span className="hero-pagina__acento">{acento}</span>
        </h1>
        <p className="hero-pagina__subtitulo">{subtitulo}</p>

        {cta ? (
          <Link href={cta.href} className="boton boton--acento">
            {cta.texto}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
