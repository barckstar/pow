import type {
  BreadcrumbList,
  Course,
  Graph,
  Person,
  WithContext,
} from "schema-dts";
import type { Idioma } from "@/shared/i18n/config";
import { IDIOMAS } from "@/shared/i18n/config";
import { NOMBRE_SITIO, REDES, URL_BASE } from "@/shared/config/sitio";

/**
 * JSON-LD del sitio.
 *
 * Se tipa con `schema-dts` porque en JSON-LD una propiedad mal escrita no
 * falla: Google la ignora en silencio y el dato nunca aparece. Con el tipo, el
 * compilador la caza.
 *
 * ============ SOLO DATOS QUE EXISTEN ============
 * Nada de teléfono, dirección, precio ni valoraciones: siguen en `null` en
 * `sitio.ts` y en `PENDIENTE.md`. Un dato inventado en structured data es
 * motivo de acción manual de Google, y además es mentirle a quien busca. Las
 * funciones de abajo leen de la configuración y omiten lo que sea `null`, así
 * que el día que el cliente confirme un dato, aparece aquí sin tocar nada.
 * =================================================
 */

/** Identificadores estables: permiten enlazar unos nodos con otros. */
export const ID_ORGANIZACION = `${URL_BASE}/#organizacion`;
export const ID_SITIO = `${URL_BASE}/#sitio`;

const DESCRIPCION: Record<Idioma, string> = {
  en: "Costa Rican Spanish lessons: one-to-one online classes with a native teacher, and immersion in Costa Rica.",
  de: "Costa-ricanisches Spanisch: Einzelunterricht online mit einem Muttersprachler und Immersion in Costa Rica.",
  fr: "Espagnol costaricien : cours individuels en ligne avec un professeur natif, et immersion au Costa Rica.",
};

/** Idioma del sitio en la forma BCP 47 que pide schema.org. */
const IN_LANGUAGE: Record<Idioma, string> = { en: "en", de: "de", fr: "fr" };

/** Redes confirmadas por el cliente. Las que están en `null` no se emiten. */
function redesConfirmadas(): string[] {
  return [REDES.facebook, REDES.instagram].filter(
    (url): url is string => typeof url === "string"
  );
}

/** Organización + sitio web, en un solo `@graph`. Va en el layout. */
export function jsonLdSitio(lang: Idioma): Graph {
  const sameAs = redesConfirmadas();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": ID_ORGANIZACION,
        name: NOMBRE_SITIO,
        url: URL_BASE,
        description: DESCRIPCION[lang],
        logo: {
          "@type": "ImageObject",
          url: `${URL_BASE}/marca/perezoso.png`,
        },
        image: `${URL_BASE}/og/por-defecto.jpg`,
        // Los idiomas en que se atiende de verdad, no una lista aspiracional.
        knowsLanguage: ["es-CR", ...IDIOMAS],
        ...(sameAs.length > 0 ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": ID_SITIO,
        url: URL_BASE,
        name: NOMBRE_SITIO,
        inLanguage: IN_LANGUAGE[lang],
        publisher: { "@id": ID_ORGANIZACION },
      },
    ],
  };
}

export type Miga = { nombre: string; ruta: string };

/**
 * Migas de pan. La primera es siempre la portada del idioma; el llamador
 * pasa el resto en orden, la página actual la última.
 */
export function jsonLdMigas(
  migas: readonly Miga[]
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: migas.map((miga, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: miga.nombre,
      item: `${URL_BASE}${miga.ruta}`,
    })),
  };
}

/**
 * El profesor como `Person`, enlazado a la organización.
 *
 * `bio` y `papel` ya vienen en el idioma de la página; el nombre propio no se
 * traduce. Sin dirección ni contacto: no los hay.
 */
export function jsonLdProfesor(profesor: {
  id: string;
  nombre: string;
  descripcion: string;
  foto: string | null;
}): Person {
  return {
    "@type": "Person",
    "@id": `${URL_BASE}/#profesor-${profesor.id}`,
    name: profesor.nombre,
    description: profesor.descripcion,
    worksFor: { "@id": ID_ORGANIZACION },
    ...(profesor.foto ? { image: `${URL_BASE}${profesor.foto}` } : {}),
  };
}

/**
 * Las clases en línea como `Course`.
 *
 * Sin `offers`: el precio está sin confirmar y un `Offer` sin precio es un
 * dato roto para Google. Cuando `DEPOSITO`/precios dejen de ser `null`, es
 * aquí donde se añade.
 */
export function jsonLdCursoOnline({
  lang,
  nombre,
  descripcion,
  ruta,
  profesores,
}: {
  lang: Idioma;
  nombre: string;
  descripcion: string;
  ruta: string;
  profesores: Person[];
}): WithContext<Course> {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: nombre,
    description: descripcion,
    url: `${URL_BASE}${ruta}`,
    inLanguage: IN_LANGUAGE[lang],
    teaches: "Costa Rican Spanish",
    provider: { "@id": ID_ORGANIZACION },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      ...(profesores.length > 0 ? { instructor: profesores } : {}),
    },
  };
}

/**
 * Etiqueta lista para insertar.
 *
 * `JSON.stringify` no escapa `<`, y un `</script>` dentro de un texto del
 * contenido cerraría la etiqueta y dejaría inyectar HTML. Se sustituye por su
 * escape Unicode, que JSON interpreta igual.
 */
export function EtiquetaJsonLd({ datos }: { datos: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(datos).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Migas de una página interior: portada → página. Solo JSON-LD, sin nada
 * visible; lo que hace es que Google enseñe «Sitio › Página» en vez de la URL
 * cruda. Las páginas más profundas (un artículo) pasan la miga intermedia.
 */
export function MigasJsonLd({
  lang,
  intermedias = [],
  nombre,
  ruta,
}: {
  lang: Idioma;
  intermedias?: readonly Miga[];
  nombre: string;
  ruta: string;
}) {
  return (
    <EtiquetaJsonLd
      datos={jsonLdMigas([
        { nombre: NOMBRE_SITIO, ruta: `/${lang}` },
        ...intermedias,
        { nombre, ruta },
      ])}
    />
  );
}
