"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { REDES } from "@/shared/config/sitio";
import type { Diccionario } from "@/shared/i18n/esquema";

/**
 * Barra social lateral.
 *
 * El color oficial de cada red entra como variable CSS EN LÍNEA, no como
 * clase de Tailwind. Tailwind genera sus clases leyendo el código fuente, y
 * un `hover:text-[${color}]` armado dentro de un `.map` sencillamente no
 * existe al compilar.
 *
 * REDES está en `null` mientras el cliente no confirme sus perfiles. Una URL
 * inventada manda al visitante al perfil de otra persona, así que hasta
 * entonces el riel solo lleva la marca y el botón de compartir.
 */

type Red = {
  clave: string;
  href: string;
  etiqueta: string;
  color: string;
  icono: React.ReactNode;
};

export function BarraSocial({ t }: { t: Diccionario }) {
  const [visible, setVisible] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Entra con retraso para no competir con el hero en el primer vistazo.
  useEffect(() => {
    const temporizador = window.setTimeout(() => setVisible(true), 1000);
    return () => window.clearTimeout(temporizador);
  }, []);

  useEffect(() => {
    if (!copiado) return;
    const temporizador = window.setTimeout(() => setCopiado(false), 2000);
    return () => window.clearTimeout(temporizador);
  }, [copiado]);

  const redes: Red[] = [];

  if (REDES.whatsapp) {
    redes.push({
      clave: "whatsapp",
      href: REDES.whatsapp,
      etiqueta: "WhatsApp",
      color: "#25D366",
      icono: <IconoWhatsApp />,
    });
  }
  if (REDES.instagram) {
    redes.push({
      clave: "instagram",
      href: REDES.instagram,
      etiqueta: "Instagram",
      color: "#E1306C",
      icono: <IconoInstagram />,
    });
  }
  if (REDES.facebook) {
    redes.push({
      clave: "facebook",
      href: REDES.facebook,
      etiqueta: "Facebook",
      color: "#1877F2",
      icono: <IconoFacebook />,
    });
  }

  async function compartir() {
    const url = window.location.href;
    const datos = { title: document.title, url };

    // Tres niveles: hoja nativa del sistema, portapapeles, y WhatsApp Web
    // como último recurso si el portapapeles está bloqueado (pasa en
    // contextos sin HTTPS y en algunos navegadores embebidos).
    if (navigator.share) {
      try {
        await navigator.share(datos);
        return;
      } catch {
        // Cancelar la hoja nativa lanza: no es un error que haya que tratar.
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      return;
    } catch {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(url)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  return (
    <aside className="social" data-visible={visible} aria-label={t.social.seguir}>
      <div className="social__marca" aria-hidden="true">
        {/*
          177x150: la relación de aspecto real del logo nuevo (900x762,
          1,18:1), no la del recorte viejo (1,29:1). Con el número antiguo la
          imagen se habría estirado para llenar una caja que ya no le
          corresponde.
        */}
        <Image src="/marca/perezoso.png" alt="" width={177} height={150} />
      </div>

      {redes.map((red) => (
        <a
          key={red.clave}
          href={red.href}
          target="_blank"
          rel="noopener noreferrer"
          className="social__icono"
          style={{ "--color-red": red.color } as React.CSSProperties}
        >
          {red.icono}
          <span className="social__etiqueta">{red.etiqueta}</span>
        </a>
      ))}

      {/* Separado por una línea: compartir no es una red, es una acción. */}
      <div className="social__separador" aria-hidden="true" />

      <button type="button" onClick={compartir} className="social__icono social__compartir">
        <IconoCompartir />
        <span className="social__etiqueta">
          {copiado ? t.social.copiado : t.social.compartir}
        </span>
      </button>
    </aside>
  );
}

/* Iconos propios: un SVG de 20 líneas no justifica una librería de iconos. */

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.36c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.22 8.24c0 4.54-3.69 8.21-8.24 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42l-.47-.01c-.16 0-.43.06-.65.31-.22.25-.85.84-.85 2.03 0 1.2.87 2.35.99 2.51.12.16 1.71 2.61 4.15 3.66.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

function IconoInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.73 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.41a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
    </svg>
  );
}

function IconoFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z" />
    </svg>
  );
}

function IconoCompartir() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}
