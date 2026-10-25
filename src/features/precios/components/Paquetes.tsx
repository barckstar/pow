import { filasDeComparacion, PAQUETES, type Curso } from "../esquema";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

/**
 * Los paquetes y la tabla comparativa de `/pricing`.
 *
 * Es un Server Component sin una línea de JavaScript: todo es contenido que ya
 * está en el HTML, y la tabla se lee igual con lector de pantalla que sin él.
 *
 * El precio se formatea con `Intl` y la moneda de cada idioma —«€230» en
 * inglés, «230 €» en alemán y francés— en vez de pegarle un símbolo a un
 * número: es lo que cada lector espera ver, y el número sigue siendo UN número
 * en los datos.
 */
export function Paquetes({ lang, t }: { lang: Idioma; t: Diccionario }) {
  const p = t.paginas.precios;

  const euros = (importe: number) =>
    new Intl.NumberFormat(lang, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(importe);

  const clases = (n: number) => `${n} ${n === 1 ? p.clase : p.clases}`;

  return (
    <>
      {PAQUETES.grupos.map((grupo) => (
        <section
          key={grupo.id}
          className="paquetes"
          aria-labelledby={`paquetes-${grupo.id}`}
        >
          <h2 className="paquetes__titulo" id={`paquetes-${grupo.id}`}>
            {grupo.titulo[lang]}
          </h2>
          {grupo.intro ? (
            <p className="paquetes__intro">{grupo.intro[lang]}</p>
          ) : null}

          <div className="paquetes__rejilla">
            {grupo.cursos.map((curso) => (
              <TarjetaCurso
                key={curso.id}
                curso={curso}
                lang={lang}
                euros={euros}
                clases={clases}
              />
            ))}
          </div>

          {grupo.nota ? (
            <p className="paquetes__nota">{grupo.nota[lang]}</p>
          ) : null}
        </section>
      ))}

      <section className="paquetes" aria-labelledby="paquetes-comparacion">
        <h2 className="paquetes__titulo" id="paquetes-comparacion">
          {p.comparacionTitulo}
        </h2>

        <div className="tabla-precios">
          <table>
            <thead>
              <tr>
                <th scope="col">{p.colCurso}</th>
                <th scope="col">{p.colClases}</th>
                <th scope="col">{p.colPrecio}</th>
              </tr>
            </thead>
            <tbody>
              {filasDeComparacion().map((f) => (
                <tr key={f.id}>
                  <th scope="row">{f.fila[lang]}</th>
                  <td>{f.clases}</td>
                  <td>{euros(f.precio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {PAQUETES.notas.length > 0 ? (
          <ul className="paquetes__notas">
            {PAQUETES.notas.map((nota) => (
              <li key={nota.en}>{nota[lang]}</li>
            ))}
          </ul>
        ) : null}
      </section>
    </>
  );
}

function TarjetaCurso({
  curso,
  lang,
  euros,
  clases,
}: {
  curso: Curso;
  lang: Idioma;
  euros: (importe: number) => string;
  clases: (n: number) => string;
}) {
  return (
    <article
      className="paquete"
      data-destacado={curso.destacado ? "true" : undefined}
    >
      {curso.destacado ? (
        <p className="paquete__cinta">{curso.destacado[lang]}</p>
      ) : null}

      <h3 className="paquete__nombre">
        {curso.nombre[lang]}
        {curso.nivel ? (
          <span className="paquete__nivel">{curso.nivel}</span>
        ) : null}
      </h3>

      {curso.subtitulo ? (
        <p className="paquete__subtitulo">{curso.subtitulo[lang]}</p>
      ) : null}

      {curso.descripcion ? (
        <p className="paquete__descripcion">{curso.descripcion[lang]}</p>
      ) : null}

      <ul className="paquete__opciones">
        {curso.opciones.map((opcion) => (
          <li key={opcion.id} className="paquete__opcion">
            <div className="paquete__opcion-texto">
              {opcion.etiqueta ? (
                <span className="paquete__etiqueta">{opcion.etiqueta[lang]}</span>
              ) : null}
              <span className="paquete__meta">
                {clases(opcion.clases)}
                {opcion.detalle ? ` · ${opcion.detalle[lang]}` : ""}
              </span>
            </div>
            <span className="paquete__precio">{euros(opcion.precio)}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
