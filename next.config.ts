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
};

export default nextConfig;
