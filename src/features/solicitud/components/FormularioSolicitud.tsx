import { DESTINOS } from "@/features/destinos/esquema";
import { OPCIONES } from "../esquema";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

/**
 * El formulario de solicitud de inmersión.
 *
 * ============ NO ENVÍA A NINGUNA PARTE, Y ESO ES LO DECIDIDO ============
 * Pide nombre, edad, idiomas, TELÉFONO y CORREO. En cuanto eso viaje a algún
 * sitio, el sitio pasa a tratar datos personales, y eso no es conectar un
 * `action`: es elegir dónde se guardan, cuánto tiempo, quién los ve, y
 * escribir el aviso de privacidad y el consentimiento que el RGPD exige. No
 * hay todavía ni correo de contacto confirmado.
 *
 * Así que el formulario está entero y se ve entero, pero el botón sale
 * `disabled` y encima hay un aviso que explica por qué. Es la misma regla que
 * el resto del sitio: un hueco visible se arregla, uno invisible se publica.
 *
 * Conectarlo cuando llegue el momento es añadir el `action` y quitar dos
 * líneas de aquí. Lo que NO se puede hacer es dejarlo enviando a un sitio
 * provisional «mientras tanto».
 * =======================================================================
 *
 * ============ SIN UNA LÍNEA DE JAVASCRIPT ============
 * Es un Server Component. El destino lo pone la ruta y se preselecciona con
 * `defaultValue` en el servidor; la validación de formato la hace el navegador
 * con `type`, `required`, `min` y `max`. No hay estado, no hay hidratación y
 * no viaja nada al navegador por esto.
 * ======================================================
 */
export function FormularioSolicitud({
  lang,
  t,
  destinoElegido,
}: {
  lang: Idioma;
  t: Diccionario;
  /** Id del destino, cuando se llega desde una ficha. Ya validado. */
  destinoElegido?: string;
}) {
  const f = t.paginas.solicitud;

  return (
    <form className="solicitud" noValidate={false}>
      {/*
        El aviso va ANTES de los campos y no junto al botón.
        Enterarse de que esto no se envía después de rellenar ocho campos es
        peor que no poder rellenarlos.
      */}
      <div className="solicitud__aviso" id="solicitud-aviso">
        <p className="solicitud__aviso-titulo">
          <span className="pendiente">{t.pendiente.etiqueta}</span>
          <span>{f.avisoTitulo}</span>
        </p>
        <p>{f.avisoTexto}</p>
      </div>

      <div className="solicitud__campos">
        <p className="solicitud__campo solicitud__campo--ancho">
          <label htmlFor="destino">{f.destino}</label>
          <select
            id="destino"
            name="destino"
            defaultValue={destinoElegido ?? ""}
            required
          >
            <option value="" disabled>
              {f.elegir}
            </option>
            {/*
              Solo el nombre, sin la zona. Un `<option>` no se parte en varias
              líneas ni se recorta con puntos suspensivos: «Sámara — Guanacaste,
              península de Nicoya» se salía del desplegable en un teléfono y la
              mitad no se leía. Los cuatro nombres son inconfundibles entre
              ellos, así que la zona no estaba distinguiendo nada.
            */}
            {DESTINOS.map((destino) => (
              <option key={destino.id} value={destino.id}>
                {destino.nombre}
              </option>
            ))}
          </select>
        </p>

        <p className="solicitud__campo">
          <label htmlFor="nombre">{f.nombre}</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            required
          />
        </p>

        <p className="solicitud__campo">
          <label htmlFor="edad">{f.edad}</label>
          {/*
            `min` y `max` no son por desconfianza: son la diferencia entre que
            el navegador avise al momento y que llegue un «1» que nadie puede
            interpretar. El tope alto a propósito — esto no es un filtro.
          */}
          <input id="edad" name="edad" type="number" min={5} max={110} />
        </p>

        <p className="solicitud__campo">
          <label htmlFor="correo">{f.correo}</label>
          <input
            id="correo"
            name="correo"
            type="email"
            autoComplete="email"
            required
          />
        </p>

        <p className="solicitud__campo">
          <label htmlFor="telefono">{f.telefono}</label>
          {/* `type="tel"` abre el teclado numérico en el móvil y no valida
              formato, que es lo correcto: los teléfonos internacionales no
              tienen un formato único. */}
          <input id="telefono" name="telefono" type="tel" autoComplete="tel" />
        </p>

        <p className="solicitud__campo solicitud__campo--ancho">
          <label htmlFor="idiomas">{f.idiomas}</label>
          <input id="idiomas" name="idiomas" type="text" />
          <span className="solicitud__ayuda">{f.idiomasAyuda}</span>
        </p>

        <p className="solicitud__campo">
          <label htmlFor="estancia">{f.estancia}</label>
          <select id="estancia" name="estancia" defaultValue="">
            <option value="" disabled>
              {f.elegir}
            </option>
            {OPCIONES.estancia.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>
                {opcion.etiqueta[lang]}
              </option>
            ))}
          </select>
        </p>

        <p className="solicitud__campo">
          <label htmlFor="motivo">{f.motivo}</label>
          <select id="motivo" name="motivo" defaultValue="">
            <option value="" disabled>
              {f.elegir}
            </option>
            {OPCIONES.motivo.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>
                {opcion.etiqueta[lang]}
              </option>
            ))}
          </select>
        </p>
      </div>

      {/*
        `aria-describedby` apunta al aviso: quien navega con lector de pantalla
        llega al botón, lo oye deshabilitado, y ahí mismo oye por qué. Sin esto
        solo oiría «no disponible».
      */}
      <button
        type="submit"
        className="boton boton--acento"
        disabled
        aria-describedby="solicitud-aviso"
      >
        {f.enviar}
      </button>

      <p className="solicitud__privacidad">{f.privacidad}</p>
    </form>
  );
}
