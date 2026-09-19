import Link from "next/link";
import { TIQUISMOS } from "../esquema";
import { indiceDelDia } from "../lib/rotacion";
import { rutas } from "@/shared/config/sitio";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

/**
 * Componente firma del sitio.
 *
 * Enseña algo de verdad antes de pedir nada, que es lo que diferencia esta
 * escuela de una plantilla con un formulario. Rota una expresión por día.
 */
export function TiquismoDelDia({ lang, t }: { lang: Idioma; t: Diccionario }) {
  const tiquismo = TIQUISMOS[indiceDelDia(new Date(), TIQUISMOS.length)];

  return (
    <section className="tiquismo" aria-labelledby="tiquismo-titulo">
      <div className="tiquismo__caja">
        <p className="tiquismo__etiqueta">{t.tiquismo.etiqueta}</p>

        <h2 className="tiquismo__expresion" id="tiquismo-titulo">
          {tiquismo.expresion}
        </h2>
        <p className="tiquismo__pronunciacion" aria-label="pronunciación">
          /{tiquismo.pronunciacion}/
        </p>

        <div className="tiquismo__bloque">
          <h3 className="tiquismo__subtitulo">{t.tiquismo.significa}</h3>
          <p>{tiquismo.significado[lang]}</p>
        </div>

        <div className="tiquismo__bloque">
          <h3 className="tiquismo__subtitulo">{t.tiquismo.ejemplo}</h3>
          <p className="tiquismo__frase" lang="es">
            {tiquismo.ejemplo}
          </p>
          <p className="tiquismo__explicacion">
            {tiquismo.ejemploExplicado[lang]}
          </p>
        </div>

        {tiquismo.articulo ? (
          <Link
            href={rutas.articulo(lang, tiquismo.articulo)}
            className="tiquismo__enlace"
          >
            {t.tiquismo.leerMas} →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
