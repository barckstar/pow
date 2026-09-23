import type { Idioma } from "@/shared/i18n/config";

/**
 * Una bandera por idioma, para el selector del navbar.
 *
 * ============ SVG PROPIO, NO UN PAQUETE DE ICONOS ============
 * Un paquete de banderas trae 200 países que este sitio no usa nunca, y las
 * de verdad —con el escudo, las proporciones oficiales exactas— se ven igual
 * de mal que estas a 20 px: el detalle se pierde y solo queda el color. Cuatro
 * rectángulos con las franjas de cada bandera pesan menos que una sola
 * imagen del paquete, y no dependen de que un tercero lo siga manteniendo.
 *
 * Llevó una cuarta bandera, la de Costa Rica para «es», el mismo 23/09/2026
 * en que el cliente quitó español de `IDIOMAS` unas horas después de
 * pedirla. Se borró de aquí con el resto de lo que dependía de ese idioma;
 * si vuelve, la decisión que valía la pena anotar es que «es» debería llevar
 * la bandera de Costa Rica y no la de España —este sitio no enseña español
 * genérico— y esa nota ya no tiene dónde vivir salvo en el historial de git.
 */

/** Lienzo común: proporción 3:2, la que usan tres de las cuatro banderas. */
const VIEWBOX = "0 0 30 20";

function EstadosUnidos() {
  const franjas = Array.from({ length: 7 }, (_, i) => i);
  return (
    <svg viewBox={VIEWBOX} aria-hidden="true">
      <rect width="30" height="20" fill="#ffffff" />
      {franjas.map((i) => (
        <rect
          key={i}
          y={(i * 20) / 13}
          width="30"
          height={20 / 13}
          fill="#B22234"
        />
      ))}
      <rect width="13" height={(20 * 7) / 13} fill="#3C3B6E" />
    </svg>
  );
}

function Alemania() {
  const alto = 20 / 3;
  return (
    <svg viewBox={VIEWBOX} aria-hidden="true">
      <rect width="30" height={alto} fill="#000000" />
      <rect y={alto} width="30" height={alto} fill="#DD0000" />
      <rect y={alto * 2} width="30" height={alto} fill="#FFCE00" />
    </svg>
  );
}

function Francia() {
  const ancho = 30 / 3;
  return (
    <svg viewBox={VIEWBOX} aria-hidden="true">
      <rect width={ancho} height="20" fill="#0055A4" />
      <rect x={ancho} width={ancho} height="20" fill="#ffffff" />
      <rect x={ancho * 2} width={ancho} height="20" fill="#EF4135" />
    </svg>
  );
}

const BANDERA: Record<Idioma, () => React.ReactElement> = {
  en: EstadosUnidos,
  de: Alemania,
  fr: Francia,
};

/** `alt=""` siempre: la bandera es decoración del código de idioma, que ya
    lleva su propio `aria-label` en el enlace que la envuelve. Ponerle un
    segundo nombre aquí duplicaría el anuncio para quien usa lector de
    pantalla. */
export function Bandera({ idioma }: { idioma: Idioma }) {
  const Dibujo = BANDERA[idioma];
  return (
    <span className="bandera">
      <Dibujo />
    </span>
  );
}
