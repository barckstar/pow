import type { MetadataRoute } from "next";
import { URL_BASE } from "@/shared/config/sitio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Las rutas de pago no tienen nada que indexar y responden solo a POST.
      disallow: ["/api/"],
    },
    sitemap: `${URL_BASE}/sitemap.xml`,
  };
}
