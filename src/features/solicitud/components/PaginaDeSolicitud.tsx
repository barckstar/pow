import Link from "next/link";
import { FormularioSolicitud } from "./FormularioSolicitud";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";
import { rutas } from "@/shared/config/sitio";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

/**
 * El cuerpo de la página de solicitud, con y sin destino elegido.
 *
 * Vive aquí y no duplicado en las dos rutas —`/solicitud` y
 * `/solicitud/[destino]`— porque lo único que cambia entre ellas es el
 * titular y qué opción viene marcada en el desplegable. Escrito dos veces, el
 * día que se toque el aviso legal o el enlace de vuelta habría que acordarse
 * de las dos, y la que se olvide no falla: se queda distinta, que es peor
 * porque no se nota.
 */
export function PaginaDeSolicitud({
  lang,
  t,
  destino,
}: {
  lang: Idioma;
  t: Diccionario;
  /** Id y nombre del destino, cuando se llega desde una ficha. */
  destino?: { id: string; nombre: string };
}) {
  const p = t.paginas.solicitud;

  return (
    <section className="seccion con-adornos">
      <DecoradosSeccion variante="reservar" />

      <div className="seccion__interior seccion__interior--estrecho">
        <h1 className="seccion__titulo">
          {destino ? `${p.tituloCon} ${destino.nombre}` : p.titulo}
        </h1>
        <p className="seccion__intro">{p.intro}</p>

        <FormularioSolicitud lang={lang} t={t} destinoElegido={destino?.id} />

        <p className="seccion__enlace-suelto">
          <Link href={rutas.costaRica(lang)} className="seccion__enlace">
            ← {t.destinos.verTodos}
          </Link>
        </p>
      </div>
    </section>
  );
}
