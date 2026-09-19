import type { MetadataRoute } from "next";
import { NOMBRE_SITIO } from "@/shared/config/sitio";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: NOMBRE_SITIO,
    short_name: "CR Spanish",
    description:
      "Clases de español costarricense en línea y presenciales en Costa Rica.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF4E6",
    theme_color: "#0F6E78",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
