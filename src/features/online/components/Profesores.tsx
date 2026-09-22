import Image from "next/image";
import { PROFESORES } from "../esquemaProfesores";
import { ZONA_PROFESOR } from "@/shared/config/sitio";
import type { Idioma } from "@/shared/i18n/config";

/**
 * La sección de quién da las clases, en `/online`.
 *
 * ============ VA LA PRIMERA, DESPUÉS DEL HERO ============
 * Estaba al final, después de los pasos, lo que se practica y por qué. El
 * cliente lo movió arriba y tiene razón en lo que importa: quien entra a mirar
 * clases particulares no está comparando temarios, está decidiendo si se fía
 * de la persona con la que va a pasar una hora hablando. Esa decisión se toma
 * en los primeros segundos, y antes se tomaba en la página quince.
 *
 * El orden queda: quién es → cómo funciona → qué se practica.
 * =========================================================
 *
 * ============ FRANJA TEAL, Y NO OTRA SECCIÓN CREMA ============
 * El resto de `/online` es crema sobre crema. Una sección más del mismo color
 * justo debajo del hero no se lee como «aquí empieza algo», se lee como que la
 * página ya arrancó.
 *
 * El teal es el 30 % de la paleta y su trabajo es exactamente este: separar
 * bloques sin meter un color nuevo. Además la portada ya usa una franja teal
 * pegada al hero —`.confianza`— así que el gesto no es de esta página, es del
 * sitio.
 *
 * Y encima de la franja, la ficha en crema: el contraste hace que el retrato y
 * el nombre sean lo primero que agarra el ojo al bajar del hero, que es
 * justamente lo que se pidió.
 * ==============================================================
 */
export function Profesores({
  lang,
  titulo,
  entrada,
  etiquetaPendiente,
  fotoPendiente,
  fotoAlt,
  etiquetaZona,
}: {
  lang: Idioma;
  /** «Quién da las clases». */
  titulo: string;
  /** Una línea debajo del título. Da contexto antes del nombre. */
  entrada: string;
  /** La insignia amarilla de «Pendiente», compartida con el resto del sitio. */
  etiquetaPendiente: string;
  /** Lo que dice el marco mientras no hay retrato. */
  fotoPendiente: string;
  /** Plantilla del `alt`. Lleva `{nombre}` dentro. */
  fotoAlt: string;
  /** «Zona horaria del profesor». */
  etiquetaZona: string;
}) {
  return (
    <section className="profesores-banda">
      <div className="profesores-banda__interior">
        <h2 className="profesores-banda__titulo">{titulo}</h2>
        <p className="profesores-banda__entrada">{entrada}</p>

        <ul className="profesores">
          {PROFESORES.map((profesor) => (
            <li key={profesor.id} className="profesor">
              <div className="profesor__retrato">
                {profesor.foto ? (
                  <Image
                    src={profesor.foto}
                    alt={fotoAlt.replace("{nombre}", profesor.nombre)}
                    fill
                    /* El marco mide 12 rem y nunca más: pedirle al navegador
                       una imagen de ancho de pantalla sería tirar bytes. */
                    sizes="12rem"
                    className="profesor__foto"
                  />
                ) : (
                  <span className="profesor__hueco">
                    <span className="pendiente">{etiquetaPendiente}</span>
                    <span>{fotoPendiente}</span>
                  </span>
                )}
              </div>

              <div className="profesor__cuerpo">
                <p className="profesor__papel">{profesor.papel[lang]}</p>
                <h3 className="profesor__nombre">{profesor.nombre}</h3>
                <p className="profesor__bio">{profesor.bio[lang]}</p>

                <ul className="profesor__datos">
                  {profesor.datos.map((dato) => (
                    <li key={dato.id} className="profesor__dato">
                      {dato.etiqueta[lang]}
                    </li>
                  ))}
                  {/*
                    La zona horaria cierra la fila porque es del MISMO tipo que
                    los otros tres —un hecho suelto sobre él— y antes andaba
                    suelta por la página, en una línea propia que no pertenecía
                    a ningún sitio.

                    Sale de `ZONA_PROFESOR` y no del JSON: la usan también
                    `/reservar` y la cuenta de horarios, así que dos copias
                    serían dos copias que se separan.
                  */}
                  <li className="profesor__dato profesor__dato--zona">
                    {etiquetaZona}: {ZONA_PROFESOR.replace(/_/g, " ")}
                  </li>
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
