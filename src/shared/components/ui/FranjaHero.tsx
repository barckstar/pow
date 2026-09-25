/**
 * El hero tipográfico de una página interior — teal degradando a crema, con
 * una insignia, un titular partido en dos colores y una entradilla.
 *
 * ============ POR QUÉ EXISTE ESTE COMPONENTE ============
 * Nació en «Quiénes somos» el 23/09/2026 y el cliente pidió generalizarlo el
 * 25/09/2026, después de ver `/comunidad`: «no me gusta y necesita más vida,
 * más sabor, más estético […] que sea regla general de diseño». Tenía razón.
 * La plantilla de las páginas «simples» —`/comunidad`, `/precios`— era un
 * título, una entradilla y una columna de texto, todo en crema sobre crema:
 * ni un color que separe bloques, ni una forma que no sea un párrafo. Se veía
 * bien en `/about` y en la franja del profesor de `/online` porque esas dos
 * SÍ rompen la monotonía; el resto de las páginas interiores, no.
 *
 * La regla, para no repetir el error: NINGUNA página interior arranca con un
 * `<h1>` suelto sobre fondo crema. Arranca con esto, o con un hero
 * fotográfico (`HeroPagina`) cuando la página habla de un lugar. Un color
 * plano de principio a fin no es nunca la respuesta, sea cual sea el tamaño
 * o la importancia de la página.
 * ==========================================================
 *
 * Cada color de aquí es uno YA verificado en `verificar-contraste.mjs` para
 * el mismo par fondo/texto —blanco y dorado-texto sobre teal, crema sobre
 * teal— así que usar este componente en una página nueva no exige medir
 * ningún par nuevo.
 */
export function FranjaHero({
  insignia,
  titulo,
  acento,
  subtitulo,
  decoracion,
}: {
  /** El chip corto encima del titular. */
  insignia: string;
  titulo: string;
  /** La segunda línea del titular, en dorado. Opcional: no toda página
      necesita partir el título en dos. */
  acento?: string;
  subtitulo: string;
  /** Un dibujo de `Decorados.tsx`, grande y solo — la firma visual de esta
      página, no un adorno repetido de otra sección. */
  decoracion?: React.ReactNode;
}) {
  return (
    <section className="franja-hero">
      {decoracion ? (
        <span className="franja-hero__decoracion" aria-hidden="true">
          {decoracion}
        </span>
      ) : null}

      <div className="franja-hero__interior">
        <p className="franja-hero__insignia">{insignia}</p>
        <h1 className="franja-hero__titulo">
          {titulo}
          {acento ? (
            <span className="franja-hero__acento">{acento}</span>
          ) : null}
        </h1>
        <p className="franja-hero__subtitulo">{subtitulo}</p>
      </div>
    </section>
  );
}
