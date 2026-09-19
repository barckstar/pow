import { NextResponse, type NextRequest } from "next/server";
import { IDIOMAS, idiomaDesdeCabecera } from "@/shared/i18n/config";

/**
 * Toda ruta pública vive bajo /es o /en. Esto manda ahí a quien entre por la
 * raíz o por una ruta sin prefijo, eligiendo idioma por `Accept-Language`.
 *
 * Es un redirect 307 (temporal) a propósito: el idioma depende del visitante,
 * no de la URL, así que no queremos que un proxy cachee "/" → "/es" para
 * todo el mundo.
 */
export function middleware(peticion: NextRequest) {
  const { pathname } = peticion.nextUrl;

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
