import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF primero: pesa ~30% menos que WebP en fotografía, que es todo lo
    // que servimos aquí. Next negocia con el Accept del navegador y cae a
    // WebP solo donde AVIF no está soportado.
    formats: ["image/avif", "image/webp"],
    /*
     * Next 16 solo sirve las calidades declaradas aquí; cualquier otra que
     * se pase en `quality` se ignora en silencio y cae a 75. Se comprobó
     * mirando la URL servida, que seguía trayendo `q=75` pese al
     * `quality={55}` del hero.
     *
     * 55 es para la foto del hero, que va detrás de un velo oscuro y donde
     * la diferencia no se aprecia. 75 es el resto.
     */
    qualities: [55, 75],
  },
  /*
   * ============ LAS RUTAS EN ESPAÑOL SE FUERON EL 25/09/2026 ============
   * El sitio se sirve en inglés, alemán y francés, y aun así cinco páginas
   * tenían la URL en español —`/en/comunidad`, `/en/precios`…—. El cliente
   * lo vio en la barra del navegador: «el link está en español, no debería».
   * Una URL también se lee, y se comparte.
   *
   * Las viejas redirigen con un 301 —`permanent: true` en Next es un 308,
   * que para Google cuenta igual— porque es un cambio definitivo del sitio,
   * no una decisión por visitante: mismo razonamiento que el `/es/*` de
   * `proxy.ts`. Van aquí y no en el proxy porque son un mapa fijo de rutas,
   * que es justo para lo que existe `redirects()`.
   * ======================================================================
   */
  async redirects() {
    const renombradas: [string, string][] = [
      ["comunidad", "community"],
      ["precios", "pricing"],
      ["reservar", "book"],
      ["solicitud", "apply"],
      ["creditos", "credits"],
    ];
    return renombradas.flatMap(([vieja, nueva]) => [
      {
        source: `/:lang/${vieja}`,
        destination: `/:lang/${nueva}`,
        permanent: true,
      },
      {
        source: `/:lang/${vieja}/:resto*`,
        destination: `/:lang/${nueva}/:resto*`,
        permanent: true,
      },
    ]);
  },
};

export default nextConfig;
