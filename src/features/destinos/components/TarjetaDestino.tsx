import Image from "next/image";
import type { Destino } from "../esquema";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

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
    <article className="destino">
      <div className="destino__foto">
        <Image
          src={destino.foto}
          alt={destino.fotoAlt[lang]}
          fill
          priority={prioridad}
          sizes="(min-width: 900px) 42vw, 100vw"
          className="destino__imagen"
        />
      </div>

      <div className="destino__cuerpo">
        <p className="destino__zona">{destino.zona}</p>
        <h3 className="destino__nombre">{destino.nombre}</h3>
        <p className="destino__lema">{destino.lema[lang]}</p>
        <p className="destino__descripcion">{destino.descripcion[lang]}</p>

        {/* Las sedes presenciales no están confirmadas por el cliente. Se
            dice, en vez de dejar entender que ya se puede reservar ahí. */}
        {destino.disponible ? null : (
          <p className="destino__pendiente">
            <span className="pendiente">{t.pendiente.etiqueta}</span>
            <span>{t.pendiente.generico}</span>
          </p>
        )}
      </div>
    </article>
  );
}
