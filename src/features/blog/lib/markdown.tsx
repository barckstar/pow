import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactElement } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import Image from "next/image";
import Link from "next/link";
import { imageSize } from "image-size";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeReact from "rehype-react";

/**
 * Markdown → elementos de React.
 *
 * La pieza clave es `rehype-react`: devuelve ELEMENTOS, no una cadena de
 * HTML. Eso es lo que permite sustituir `img` por `next/image` y `a` por
 * `next/link`. Con una cadena y `dangerouslySetInnerHTML` habría que
 * conformarse con `<img>` crudas, y una imagen cruda dentro de un artículo
 * hunde el LCP y el CLS — ahí se va el Lighthouse.
 *
 * Todo este módulo corre en el servidor, en build time. Ninguna de estas
 * dependencias llega al navegador.
 */

const medidasCache = new Map<string, { width: number; height: number }>();

/**
 * Lee las dimensiones reales del archivo para reservar su hueco.
 *
 * Así quien escribe un artículo no tiene que declarar medidas a mano en el
 * Markdown —nadie lo haría— y aun así el CLS queda en cero.
 */
function medidasDe(src: string): { width: number; height: number } {
  const cacheada = medidasCache.get(src);
  if (cacheada) return cacheada;

  const ruta = join(process.cwd(), "public", src.replace(/^\//, ""));
  const { width, height } = imageSize(readFileSync(ruta));

  if (!width || !height) {
    throw new Error(`No se pudieron leer las dimensiones de ${src}`);
  }

  const medidas = { width, height };
  medidasCache.set(src, medidas);
  return medidas;
}

function ImagenDeArticulo({ src, alt }: { src?: string; alt?: string }) {
  if (!src) return null;

  // Una imagen remota no se puede medir en build: se deja fuera a propósito
  // en vez de servirla sin dimensiones y arruinar el CLS.
  if (!src.startsWith("/")) {
    throw new Error(
      `La imagen "${src}" de un artículo debe ser local (empezar por "/"). ` +
        `Copiala a public/blog/ y referenciala desde ahí.`
    );
  }

  const { width, height } = medidasDe(src);

  return (
    <Image
      src={src}
      alt={alt ?? ""}
      width={width}
      height={height}
      sizes="(min-width: 800px) 720px, 100vw"
      className="articulo__imagen"
    />
  );
}

function EnlaceDeArticulo({
  href,
  children,
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  if (!href) return <>{children}</>;

  const esExterno = /^https?:\/\//.test(href);
  if (esExterno) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return <Link href={href}>{children}</Link>;
}

const procesador = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeReact, {
    Fragment,
    jsx,
    jsxs,
    components: {
      img: ImagenDeArticulo,
      a: EnlaceDeArticulo,
    },
  });

export async function renderizarMarkdown(md: string): Promise<ReactElement> {
  const archivo = await procesador.process(md);
  return archivo.result as ReactElement;
}
