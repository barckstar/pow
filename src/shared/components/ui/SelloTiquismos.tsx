import Image from "next/image";
import Link from "next/link";
import { rutas } from "@/shared/config/sitio";
import type { Idioma } from "@/shared/i18n/config";

/**
 * El perezoso surfista como sello redondo que lleva al archivo completo de
 * tiquismos (`/community#tiquismos`).
 *
 * Es solo imagen, así que el nombre accesible sale del `aria-label`. El
 * tamaño y la posición los pone quien lo usa con `className`.
 */
export function SelloTiquismos({
  lang,
  etiqueta,
  className = "",
}: {
  lang: Idioma;
  etiqueta: string;
  className?: string;
}) {
  return (
    <Link
      href={`${rutas.comunidad(lang)}#tiquismos`}
      className={`sello-perezoso ${className}`.trim()}
      aria-label={etiqueta}
      title={etiqueta}
    >
      <Image
        src="/fotos/comunidad-perezoso-surf.jpg"
        alt=""
        width={160}
        height={90}
        sizes="96px"
      />
    </Link>
  );
}
