import Image from "next/image";
import Link from "next/link";
import { Olas } from "@/shared/components/ui/Olas";
import { rutas } from "@/shared/config/sitio";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

/*
 * Era un `lang === "es" ? … : …`. Con solo dos idiomas nadie lo notó, pero
 * en cuanto entraron alemán y francés los dos caían en el `alt` en inglés
 * sin que nadie lo hubiera decidido así — de/fr no rompían el build porque
 * la comparación seguía siendo válida, solo incompleta. Quitar español de
 * `IDIOMAS` sí lo rompió, que es como se encontró.
 */
const ALT_HERO: Record<Idioma, string> = {
  en: "The rainforest of Manuel Antonio dropping down to the Pacific, with an islet on the horizon",
  de: "Der Regenwald von Manuel Antonio fällt zum Pazifik ab, mit einem Eiland am Horizont",
  fr: "La forêt tropicale de Manuel Antonio descendant vers le Pacifique, avec un îlot à l'horizon",
};

export function Hero({ lang, t }: { lang: Idioma; t: Diccionario }) {
  return (
    <section className="hero">
      {/*
        Es el LCP de la página: `priority` para que no espere a la
        hidratación, `sizes="100vw"` porque ocupa el ancho completo, y `fill`
        con un contenedor de altura fija para que el hueco esté reservado
        desde el primer pintado y el CLS quede en cero.
      */}
      <div className="hero__foto">
        <Image
          src="/fotos/manuel-antonio-selva.jpg"
          alt={ALT_HERO[lang]}
          fill
          priority
          // `priority` precarga, pero la auditoría de descubrimiento del LCP
          // pedía además la pista de prioridad explícita en la precarga.
          fetchPriority="high"
          /*
           * Calidad por defecto. Se probó con 55 cuando la foto iba detrás
           * de un velo oscuro, pero ahora el degradado es de crema y la
           * mitad derecha de la fotografía se ve limpia. Además está medido
           * que bajar la calidad no movía la puntuación de Lighthouse: el
           * LCP aquí es latencia, no bytes.
           */
          quality={75}
          /*
           * `100vw` y no un ancho fijo para móvil. Se probó
           * `(max-width: 640px) 640px` y el resultado fue el contrario del
           * buscado: al declarar un hueco de 640 px CSS, Next lo multiplica
           * por la densidad de pantalla y acababa sirviendo la variante de
           * 1200 px (81 KB) en vez de la de 750 (30 KB). El rendimiento de
           * móvil cayó de 89 a 81.
           */
          sizes="100vw"
          className="hero__imagen"
        />
        <div className="hero__velo" aria-hidden="true" />
      </div>

      {/* Las olas cierran el hero y se funden con la franja teal de abajo:
          la capa de adelante es exactamente ese color. */}
      <Olas />

      <div className="hero__texto">
        <h1 className="hero__titulo">
          {t.hero.titulo}
          {/* El acento va partido en dos colores, como el "Live Experiences."
              del concept board: naranja y teal. */}
          <span className="hero__titulo-acento">
            <span className="hero__acento-naranja">
              {t.hero.tituloAcentoNaranja}
            </span>{" "}
            <span className="hero__acento-teal">{t.hero.tituloAcentoTeal}</span>
          </span>
        </h1>

        <p className="hero__subtitulo">{t.hero.subtitulo}</p>

        <div className="hero__botones">
          {/*
            Dos botones sólidos, como el board: uno por cada vía de negocio.
            No compiten porque no son el mismo paso del embudo, son dos
            productos distintos, y cada uno lleva el color de su lado.
          */}
          <Link href={rutas.online(lang)} className="boton boton--primario">
            {t.hero.ctaOnline}
          </Link>
          {/*
            Lleva a los DESTINOS, no a reservar.
            Reservar es el flujo de las clases en línea, que se pagan con
            depósito. La vía presencial es inmersión en Costa Rica y su primer
            paso es elegir a cuál de los cuatro sitios se quiere ir; el
            formulario viene después, ya con el destino puesto.
          */}
          <Link href={rutas.costaRica(lang)} className="boton boton--acento">
            {t.hero.ctaPresencial}
          </Link>
        </div>

        <p className="hero__insignia">{t.hero.insignia}</p>
      </div>
    </section>
  );
}
