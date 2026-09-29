import type { MetadataRoute } from "next";
import { URL_BASE } from "@/shared/config/sitio";

/**
 * Rastreadores de IA que se admiten de forma explícita.
 *
 * Es una decisión de negocio, no un descuido: este sitio vende clases, y que
 * un asistente sepa recomendarlas es adquisición. `userAgent: "*"` ya los
 * cubre, pero declararlos deja por escrito que están permitidos y facilita
 * cerrar uno concreto sin tocar el resto. `public/llms.txt` es su resumen.
 */
const RASTREADORES_IA = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Las rutas de servidor no tienen nada que indexar.
        disallow: ["/api/"],
      },
      { userAgent: RASTREADORES_IA, allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${URL_BASE}/sitemap.xml`,
  };
}
