import { LOCALE, type Idioma } from "@/shared/i18n/config";

/**
 * Fecha larga y legible en el idioma de la página.
 *
 * Se fuerza `timeZone: "UTC"` porque las fechas de los artículos vienen del
 * frontmatter como día suelto (2026-09-19), que se interpreta como medianoche
 * UTC. Sin fijar la zona, un servidor al oeste de Greenwich renderizaría el
 * día anterior y el HTML dejaría de coincidir con lo que dice el archivo.
 */
export function fechaLarga(fecha: Date, idioma: Idioma): string {
  return new Intl.DateTimeFormat(LOCALE[idioma].replace("_", "-"), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(fecha);
}

/** Formato ISO corto (AAAA-MM-DD) para los atributos `datetime`. */
export function fechaISO(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}
