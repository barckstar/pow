import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF primero: pesa ~30% menos que WebP en fotografía, que es todo lo
    // que servimos aquí. Next negocia con el Accept del navegador y cae a
    // WebP solo donde AVIF no está soportado.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
