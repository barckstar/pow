"use client";

import { useEffect, useMemo, useState } from "react";
import { ZONA_COSTA_RICA } from "@/shared/config/sitio";
import { LOCALE, type Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";

/**
 * Franja serializada: el servidor no puede pasar objetos `Date` a un
 * componente de cliente, así que viajan como ISO.
 */
export type FranjaSerializada = {
  inicio: string;
  fin: string;
  disponible: boolean;
};

type Props = {
  franjas: FranjaSerializada[];
  lang: Idioma;
  t: Diccionario;
  /** El horario del profesor todavía no está confirmado por el cliente. */
  provisional: boolean;
};

/**
 * Los formateadores se cachean por zona e idioma.
 *
 * Construir un `Intl.DateTimeFormat` es caro —carga datos de localización— y
 * aquí se formatean dos horas y un día por cada franja. Con tres semanas de
 * horarios son más de doscientas construcciones por render: en la auditoría
 * de móvil eso salía como 890 ms de bloqueo del hilo principal. Reutilizarlos
 * lo convierte en una docena.
 */
const FORMATEADORES = new Map<string, Intl.DateTimeFormat>();

function formateador(
  clase: "hora" | "dia",
  zona: string,
  idioma: Idioma
): Intl.DateTimeFormat {
  const clave = `${clase}|${zona}|${idioma}`;
  const cacheado = FORMATEADORES.get(clave);
  if (cacheado) return cacheado;

  const locale = LOCALE[idioma].replace("_", "-");
  const nuevo =
    clase === "hora"
      ? new Intl.DateTimeFormat(locale, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: zona,
        })
      : new Intl.DateTimeFormat(locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          timeZone: zona,
        });

  FORMATEADORES.set(clave, nuevo);
  return nuevo;
}

function horaEn(iso: string, zona: string, idioma: Idioma): string {
  return formateador("hora", zona, idioma).format(new Date(iso));
}

function diaEn(iso: string, zona: string, idioma: Idioma): string {
  return formateador("dia", zona, idioma).format(new Date(iso));
}

export function SelectorDeFranjas({ franjas, lang, t, provisional }: Props) {
  /*
   * La zona empieza en la de Costa Rica y se corrige en el primer efecto con
   * la real del visitante. Hacerlo así —y no leyendo `Intl` durante el
   * render— es lo que evita que el HTML del servidor y el del cliente
   * discrepen y React tire un error de hidratación.
   */
  const [zona, setZona] = useState(ZONA_COSTA_RICA);
  const [detectada, setDetectada] = useState(false);
  const [elegida, setElegida] = useState<string | null>(null);

  useEffect(() => {
    try {
      const propia = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (propia) setZona(propia);
    } catch {
      // Sin soporte se queda la de Costa Rica, que es un valor razonable.
    }
    setDetectada(true);
  }, []);

  const porDia = useMemo(() => {
    const grupos = new Map<string, FranjaSerializada[]>();
    for (const franja of franjas) {
      const clave = diaEn(franja.inicio, zona, lang);
      const lista = grupos.get(clave) ?? [];
      lista.push(franja);
      grupos.set(clave, lista);
    }
    return [...grupos];
  }, [franjas, zona, lang]);

  const mismaZona = zona === ZONA_COSTA_RICA;

  return (
    <div className="reserva">
      {provisional ? (
        <p className="reserva__aviso">
          <span className="pendiente">{t.pendiente.etiqueta}</span>
          <span>{t.pendiente.generico}</span>
        </p>
      ) : null}

      <div className="reserva__zona">
        <label htmlFor="zona-horaria">{t.reserva.zonaHoraria}</label>
        <select
          id="zona-horaria"
          value={zona}
          onChange={(evento) => setZona(evento.target.value)}
        >
          {/* La zona detectada va primero aunque no esté en la lista corta:
              el visitante tiene que verse reflejado. */}
          {!ZONAS_HABITUALES.includes(zona) ? (
            <option value={zona}>{zona.replace(/_/g, " ")}</option>
          ) : null}
          {ZONAS_HABITUALES.map((z) => (
            <option key={z} value={z}>
              {z.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        {detectada ? null : <span className="reserva__cargando">…</span>}
      </div>

      {porDia.length === 0 ? (
        <p className="reserva__vacio">{t.reserva.sinFranjas}</p>
      ) : (
        <div className="reserva__dias">
          {porDia.map(([dia, lista]) => (
            <section key={dia} className="reserva__dia">
              {/* h2 y no h3: el único encabezado por encima en esta página es
                  el h1 del título, y saltarse un nivel rompe la navegación
                  por encabezados de los lectores de pantalla. */}
              <h2 className="reserva__dia-titulo">{dia}</h2>
              <ul className="reserva__franjas">
                {lista.map((franja) => {
                  const mia = horaEn(franja.inicio, zona, lang);
                  const tica = horaEn(franja.inicio, ZONA_COSTA_RICA, lang);
                  const seleccionada = elegida === franja.inicio;

                  return (
                    <li key={franja.inicio}>
                      <button
                        type="button"
                        className="reserva__franja"
                        disabled={!franja.disponible}
                        aria-pressed={seleccionada}
                        onClick={() => setElegida(franja.inicio)}
                      >
                        <span className="reserva__hora">{mia}</span>
                        {/* Las dos horas, siempre. Con el profesor en Suiza y
                            el estudiante en cualquier parte, enseñar una sola
                            es como no enseñar ninguna. */}
                        {mismaZona ? (
                          <span className="reserva__hora-otra">
                            {t.reserva.horaCostaRica}
                          </span>
                        ) : (
                          <span className="reserva__hora-otra">
                            {tica} {t.reserva.horaCostaRica}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {elegida ? (
        <div className="reserva__continuar">
          <p className="reserva__resumen">
            {diaEn(elegida, zona, lang)} · {horaEn(elegida, zona, lang)}{" "}
            {t.reserva.tuHora}
            <span aria-hidden="true"> · </span>
            {horaEn(elegida, ZONA_COSTA_RICA, lang)} {t.reserva.horaCostaRica}
          </p>
          {/* DEPOSITO está en null: el cliente no ha confirmado el monto, así
              que no se puede ofrecer pagar. Se dice, no se simula. */}
          <p className="reserva__pendiente-pago">
            <span className="pendiente">{t.pendiente.etiqueta}</span>
            <span>{t.pendiente.precio}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Lista corta de zonas para el selector. No pretende ser exhaustiva: cubre de
 * dónde vienen los estudiantes (Europa y América) más la del profesor. La
 * zona detectada del visitante se añade arriba si no está aquí.
 */
const ZONAS_HABITUALES = [
  "America/Costa_Rica",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/Bogota",
  "America/Sao_Paulo",
  "Europe/Zurich",
  "Europe/Madrid",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
];
