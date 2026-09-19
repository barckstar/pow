import Image from "next/image";
import Link from "next/link";
import { rutas } from "@/shared/config/sitio";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

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
          alt={
            lang === "es"
              ? "La selva de Manuel Antonio bajando hasta el Pacífico, con un islote en el horizonte"
              : "The rainforest of Manuel Antonio dropping down to the Pacific, with an islet on the horizon"
          }
          fill
          priority
          // `priority` precarga, pero la auditoría de descubrimiento del LCP
          // pedía además la pista de prioridad explícita en la precarga.
          fetchPriority="high"
          // La foto va detrás de un velo oscuro: por debajo de 75 no se
          // aprecia diferencia y se ahorran bytes en el recurso que marca
          // el LCP.
          quality={55}
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

      <div className="hero__texto">
        <h1 className="hero__titulo">
          {t.hero.titulo}
          <span className="hero__titulo-acento">{t.hero.tituloAcento}</span>
        </h1>

        <p className="hero__subtitulo">{t.hero.subtitulo}</p>

        <div className="hero__botones">
          {/* Un solo botón sólido. El secundario va en contorno: dos rellenos
              compitiendo era el defecto del concept board original. */}
          <Link href={rutas.reservar(lang)} className="boton boton--primario">
            {t.hero.ctaPrimario}
          </Link>
          <Link href={rutas.online(lang)} className="boton boton--contorno">
            {t.hero.ctaSecundario}
          </Link>
        </div>

        <p className="hero__insignia">{t.hero.insignia}</p>
      </div>
    </section>
  );
}
