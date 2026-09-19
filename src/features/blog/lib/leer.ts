import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";
import { esquemaFrontmatter, type Articulo } from "../esquema";
import { IDIOMAS, type Idioma } from "@/shared/i18n/config";

const DIRECTORIO = join(process.cwd(), "content", "blog");

/**
 * Palabras por minuto para el tiempo de lectura. 200 es la cifra habitual
 * para lectura de pantalla en prosa; se calcula sobre el texto real del
 * artículo, no se inventa.
 */
const PALABRAS_POR_MINUTO = 200;

const cache = new Map<Idioma, Articulo[]>();

async function leerCarpeta(idioma: Idioma): Promise<Articulo[]> {
  let nombres: string[];
  try {
    nombres = await readdir(join(DIRECTORIO, idioma));
  } catch {
    // Un idioma sin carpeta todavía es válido: simplemente no tiene blog.
    return [];
  }

  const articulos: Articulo[] = [];

  for (const nombre of nombres) {
    if (!nombre.endsWith(".md")) continue;

    const slug = nombre.replace(/\.md$/, "");
    const crudo = await readFile(join(DIRECTORIO, idioma, nombre), "utf8");
    const { data, content } = matter(crudo);

    const resultado = esquemaFrontmatter.safeParse(data);
    if (!resultado.success) {
      const detalle = resultado.error.issues
        .map((i) => `  · ${i.path.join(".") || "(raíz)"}: ${i.message}`)
        .join("\n");
      throw new Error(
        `Frontmatter inválido en content/blog/${idioma}/${nombre}:\n${detalle}`
      );
    }

    articulos.push({
      ...resultado.data,
      slug,
      cuerpo: content,
      minutos: Math.max(
        1,
        Math.round(content.trim().split(/\s+/).length / PALABRAS_POR_MINUTO)
      ),
    });
  }

  return articulos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

/**
 * Comprueba que cada `traduccion` declarada apunte a un artículo que existe
 * de verdad, en cualquiera de los otros idiomas.
 *
 * Importa porque de esa declaración salen los `hreflang`. Prometerle a Google
 * una versión en inglés que no existe es peor señal que no declarar nada, y
 * un enlace roto entre idiomas es invisible hasta que alguien lo pisa.
 */
function verificarTraducciones(porIdioma: Map<Idioma, Articulo[]>): void {
  const slugsPorIdioma = new Map(
    [...porIdioma].map(([idioma, lista]) => [
      idioma,
      new Set(lista.map((a) => a.slug)),
    ])
  );

  for (const [idioma, lista] of porIdioma) {
    for (const articulo of lista) {
      if (!articulo.traduccion) continue;

      const existe = [...slugsPorIdioma].some(
        ([otro, slugs]) => otro !== idioma && slugs.has(articulo.traduccion!)
      );

      if (!existe) {
        throw new Error(
          `content/blog/${idioma}/${articulo.slug}.md declara ` +
            `traduccion: "${articulo.traduccion}", pero no existe ningún ` +
            `artículo con ese slug en otro idioma.`
        );
      }
    }
  }
}

async function cargarTodo(): Promise<Map<Idioma, Articulo[]>> {
  const entradas = await Promise.all(
    IDIOMAS.map(async (idioma) => [idioma, await leerCarpeta(idioma)] as const)
  );
  const porIdioma = new Map(entradas);
  verificarTraducciones(porIdioma);
  return porIdioma;
}

/** Artículos publicados de un idioma, del más reciente al más antiguo. */
export async function leerArticulos(idioma: Idioma): Promise<Articulo[]> {
  const enCache = cache.get(idioma);
  if (enCache) return enCache;

  const porIdioma = await cargarTodo();
  for (const [lang, lista] of porIdioma) {
    // Los borradores no se listan, no entran al sitemap y no salen en el RSS.
    cache.set(
      lang,
      lista.filter((a) => !a.borrador)
    );
  }

  return cache.get(idioma) ?? [];
}

export async function leerArticulo(
  idioma: Idioma,
  slug: string
): Promise<Articulo | null> {
  const lista = await leerArticulos(idioma);
  return lista.find((a) => a.slug === slug) ?? null;
}

/**
 * El idioma en el que existe la traducción de un artículo, si existe.
 * Devuelve `null` cuando el artículo vive en un solo idioma, que es el caso
 * normal y aceptado.
 */
export async function idiomaDeLaTraduccion(
  articulo: Articulo,
  propio: Idioma
): Promise<Idioma | null> {
  if (!articulo.traduccion) return null;

  for (const idioma of IDIOMAS) {
    if (idioma === propio) continue;
    const lista = await leerArticulos(idioma);
    if (lista.some((a) => a.slug === articulo.traduccion)) return idioma;
  }

  return null;
}

/** Todas las etiquetas en uso, con cuántos artículos tiene cada una. */
export async function etiquetasDe(
  idioma: Idioma
): Promise<{ etiqueta: string; total: number }[]> {
  const lista = await leerArticulos(idioma);
  const cuenta = new Map<string, number>();

  for (const articulo of lista) {
    for (const etiqueta of articulo.etiquetas) {
      cuenta.set(etiqueta, (cuenta.get(etiqueta) ?? 0) + 1);
    }
  }

  return [...cuenta]
    .map(([etiqueta, total]) => ({ etiqueta, total }))
    .sort((a, b) => b.total - a.total || a.etiqueta.localeCompare(b.etiqueta));
}
