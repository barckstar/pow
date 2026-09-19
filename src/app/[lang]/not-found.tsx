import Link from "next/link";
import { getDiccionario } from "@/shared/i18n/diccionario";
import { IDIOMA_POR_DEFECTO } from "@/shared/i18n/config";
import { rutas } from "@/shared/config/sitio";

/**
 * El 404 no recibe los params de la ruta, así que no puede saber el idioma.
 * Se usa el idioma por defecto: es preferible un 404 legible en español a uno
 * que reviente por falta de contexto.
 */
export default async function NoEncontrado() {
  const t = await getDiccionario(IDIOMA_POR_DEFECTO);

  return (
    <section className="seccion">
      <div className="seccion__interior seccion__interior--estrecho">
        <h1 className="seccion__titulo">{t.comun.noEncontrado}</h1>
        <p className="seccion__intro">{t.comun.noEncontradoTexto}</p>
        <Link
          href={rutas.inicio(IDIOMA_POR_DEFECTO)}
          className="boton boton--primario"
        >
          {t.comun.volverInicio}
        </Link>
      </div>
    </section>
  );
}
