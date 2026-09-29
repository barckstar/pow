import Link from "next/link";
import { TIQUISMOS } from "../esquema";
import { indiceDelDia } from "../lib/rotacion";
import { rutas } from "@/shared/config/sitio";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

/**
 * Componente firma del sitio.
 *
 * Enseña algo de verdad antes de pedir nada, que es lo que diferencia esta
 * escuela de una plantilla con un formulario. Rota una expresión por día.
 *
 * ============ POR QUÉ SE REHIZO ============
 * La primera versión era una caja con un degradado de dorado a coral y el
 * texto dentro, todo del mismo peso y alineado a la izquierda. Tres problemas,
 * y los tres se veían de lejos:
 *
 *   1. EL DEGRADADO EMBARRABA. Dorado sobre coral sobre crema son tres tonos
 *      cálidos a la misma altura; la caja se leía como una mancha naranja sin
 *      forma, no como una pieza.
 *   2. NO SE LEÍA COMO UNA FICHA. Es la entrada de un diccionario —palabra,
 *      pronunciación, significado, ejemplo— y estaba escrita como un párrafo
 *      detrás de otro. La estructura estaba en el HTML y no en la pantalla.
 *   3. EL EJEMPLO NO SE DISTINGUÍA. Es lo único que el visitante se va a
 *      llevar de memoria y competía en peso con la explicación de al lado.
 *
 * Ahora: superficie blanca —que devuelve la crema al 70 % del reparto—, cinta
 * de color arriba, la palabra a un tamaño que manda, y el ejemplo en su propio
 * panel con el filete naranja. El calor de la paleta lo ponen la cinta, la
 * etiqueta y el panel del ejemplo, no el fondo entero.
 *
 * Se usa `<dl>` de verdad para significado y ejemplo: son pares término /
 * definición, y con la etiqueta como `<dt>` un lector de pantalla los anuncia
 * emparejados en vez de leer seis párrafos sueltos.
 * ===========================================
 */
export function TiquismoDelDia({ lang, t }: { lang: Idioma; t: Diccionario }) {
  const tiquismo = TIQUISMOS[indiceDelDia(new Date(), TIQUISMOS.length)];

  return (
    <section
      className="tiquismo con-adornos"
      aria-labelledby="tiquismo-titulo"
    >
      <DecoradosSeccion variante="tiquismo" />

      <article className="tiquismo__caja revelar">
        <span className="tiquismo__cinta" aria-hidden="true" />

        <p className="tiquismo__etiqueta">{t.tiquismo.etiqueta}</p>

        <div className="tiquismo__palabra">
          <h2 className="tiquismo__expresion" id="tiquismo-titulo">
            {tiquismo.expresion}
          </h2>
          <p className="tiquismo__pronunciacion" aria-label="pronunciación">
            /{tiquismo.pronunciacion}/
          </p>
        </div>

        <dl className="tiquismo__ficha">
          <dt className="tiquismo__subtitulo">{t.tiquismo.significa}</dt>
          <dd className="tiquismo__significado">{tiquismo.significado[lang]}</dd>

          <dt className="tiquismo__subtitulo">{t.tiquismo.ejemplo}</dt>
          <dd className="tiquismo__ejemplo">
            <p className="tiquismo__frase" lang="es">
              {tiquismo.ejemplo}
            </p>
            <p className="tiquismo__explicacion">
              {tiquismo.ejemploExplicado[lang]}
            </p>
          </dd>
        </dl>

        {tiquismo.articulo ? (
          <Link
            href={rutas.articulo(lang, tiquismo.articulo)}
            className="tiquismo__enlace"
          >
            {t.tiquismo.leerMas}
            <span className="tiquismo__flecha" aria-hidden="true">
              →
            </span>
          </Link>
        ) : null}
      </article>
    </section>
  );
}
