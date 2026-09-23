import { esquemaDiccionario, type Diccionario } from "./esquema";
import { IDIOMAS, type Idioma } from "./config";

/**
 * Los diccionarios se importan de forma estática por idioma para que el
 * bundler los resuelva en build time. Se leen SOLO en Server Components, así
 * que nada de esto viaja al navegador.
 */
/*
 * `es.json` se queda en el repo, sin importar. El cliente quitó español de
 * `IDIOMAS` el 23/09/2026 sin pedir que se borrara el trabajo de traducción
 * — así que sigue ahí, listo por si vuelve a pedirlo: reactivarlo es una
 * línea aquí y otra en `IDIOMAS`, no traducir de cero.
 */
const CARGADORES: Record<Idioma, () => Promise<unknown>> = {
  en: () => import("./diccionarios/en.json").then((m) => m.default),
  de: () => import("./diccionarios/de.json").then((m) => m.default),
  fr: () => import("./diccionarios/fr.json").then((m) => m.default),
};

const cache = new Map<Idioma, Diccionario>();

/**
 * Devuelve el diccionario validado del idioma pedido.
 *
 * El parseo corre al arrancar, durante el build: un diccionario con una clave
 * faltante o sobrante revienta ahí, no en el teléfono de un visitante.
 */
export async function getDiccionario(idioma: Idioma): Promise<Diccionario> {
  const enCache = cache.get(idioma);
  if (enCache) return enCache;

  const crudo = await CARGADORES[idioma]();
  const resultado = esquemaDiccionario.safeParse(crudo);

  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((i) => `  · ${i.path.join(".") || "(raíz)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `El diccionario "${idioma}" no cumple el esquema:\n${detalle}`
    );
  }

  cache.set(idioma, resultado.data);
  return resultado.data;
}

/** Valida todos los diccionarios de una. Lo usan los tests y el build. */
export async function validarTodosLosDiccionarios(): Promise<void> {
  await Promise.all(IDIOMAS.map((idioma) => getDiccionario(idioma)));
}
