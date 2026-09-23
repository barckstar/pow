import { NextResponse, type NextRequest } from "next/server";
import { IDIOMAS, idiomaDesdeCabecera } from "@/shared/i18n/config";

/**
 * Toda ruta pública vive bajo uno de los prefijos de `IDIOMAS`. Esto manda
 * ahí a quien entre por la raíz o por una ruta sin prefijo, eligiendo idioma
 * por `Accept-Language`.
 *
 * Es un redirect 307 (temporal) a propósito: el idioma depende del visitante,
 * no de la URL, así que no queremos que un proxy cachee "/" → "/en" para
 * todo el mundo.
 */
export function proxy(peticion: NextRequest) {
  const { pathname } = peticion.nextUrl;

  /*
   * ============ /ES/* SE VA A /EN/*, Y PARA SIEMPRE ============
   * Español dejó de ser un idioma del sitio el 23/09/2026, después de haber
   * estado publicado. El sitio ya puede haber quedado indexado con esas
   * URL, y un `/es/online` que de repente da 404 es peor que uno que
   * redirige: pierde el enlace, la visita y lo que Google tuviera guardado
   * de esa página.
   *
   * Es un 301 y no un 307 A PROPÓSITO, al revés que el resto de esta
   * función: esto no es «qué idioma prefiere este visitante ahora», es «este
   * sitio ya no tiene una versión en español», que es permanente y no
   * cambia visitante a visitante. Un 307 le diría a Google que seguirá
   * comprobando `/es/*` para siempre; un 301 le dice que transfiera el valor
   * de esa URL a la nueva y deje de mirar la vieja.
   * ===============================================================
   */
  if (pathname === "/es" || pathname.startsWith("/es/")) {
    const destino = new URL(
      `/en${pathname.slice("/es".length)}`,
      peticion.url
    );
    destino.search = peticion.nextUrl.search;
    return NextResponse.redirect(destino, 301);
  }

  const yaTieneIdioma = IDIOMAS.some(
    (idioma) => pathname === `/${idioma}` || pathname.startsWith(`/${idioma}/`)
  );
  if (yaTieneIdioma) return NextResponse.next();

  const idioma = idiomaDesdeCabecera(peticion.headers.get("accept-language"));
  const destino = new URL(
    `/${idioma}${pathname === "/" ? "" : pathname}`,
    peticion.url
  );
  destino.search = peticion.nextUrl.search;

  return NextResponse.redirect(destino, 307);
}

export const config = {
  /*
   * Se excluyen los archivos que no son páginas. Si el middleware corriera
   * sobre ellos, un /favicon.ico terminaría redirigido a /es/favicon.ico y
   * devolvería 404.
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.webmanifest|robots.txt|sitemap.xml|fotos|marca|blog/).*)",
  ],
};
