#!/usr/bin/env node
/**
 * Verifica que cada combinación de color que el sitio usa para TEXTO cumpla
 * WCAG AA (4.5:1 en texto normal, 3:1 en texto grande).
 *
 * Existe porque la paleta del concept board original fallaba los cuatro pares
 * principales — blanco sobre el naranja de marca daba 2.86:1 — y eso no se ve
 * a ojo. Si alguien "ajusta un poquito" un token, este script lo caza antes
 * de que llegue a una auditoría de Lighthouse.
 *
 * Corre con: npm run verify
 */

const MINIMO_NORMAL = 4.5;
const MINIMO_GRANDE = 3.0;

/** Canal sRGB → lineal, según la fórmula de WCAG 2.x. */
function canalLineal(valor255) {
  const c = valor255 / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminancia(hex) {
  const limpio = hex.replace("#", "");
  const r = parseInt(limpio.slice(0, 2), 16);
  const g = parseInt(limpio.slice(2, 4), 16);
  const b = parseInt(limpio.slice(4, 6), 16);
  return (
    0.2126 * canalLineal(r) + 0.7152 * canalLineal(g) + 0.0722 * canalLineal(b)
  );
}

function contraste(hexA, hexB) {
  const a = luminancia(hexA);
  const b = luminancia(hexB);
  const claro = Math.max(a, b);
  const oscuro = Math.min(a, b);
  return (claro + 0.05) / (oscuro + 0.05);
}

const CREMA = "#FFF4E6";
const BLANCO = "#FFFFFF";
const TINTA = "#2A1A12";
const TEAL = "#0F6E78";
// Un solo naranja para los dos roles: relleno de botón con texto blanco
// (5.30:1) y texto/enlace sobre la crema (4.88:1). El #D1481A que se evaluó
// primero daba 4.51:1 con blanco — pasaba por una centésima, y un token que
// depende de una centésima se rompe la primera vez que alguien lo retoca.
const NARANJA = "#C03F18";
const DORADO = "#F4B641";
// Dorado aclarado para TEXTO sobre teal. El de marca solo da 3.29:1 ahí, y
// eso no se ve a ojo: lo encontró Lighthouse en los titulares del pie.
const DORADO_TEXTO = "#FFE9BC";

/*
 * Mezclas que la hoja de estilos calcula con `color-mix()` y que el navegador
 * resuelve solo. Aquí van PRECALCULADAS porque este script no interpreta CSS:
 * si alguien cambia el porcentaje en `globals.css` y no lo cambia aquí, el
 * script seguiría diciendo que todo está bien mientras mide otra cosa.
 *
 * Por eso cada una lleva anotada su receta exacta al lado. Comprobarlas es
 * una resta.
 */
/** `color-mix(in srgb, var(--color-coral) 28%, #ffffff)` — fondo de la
    etiqueta del tiquismo del día. Estuvo en el 45 % y daba 4,37:1; lo cazó
    este script antes de que llegara a una auditoría. */
const CORAL_SOBRE_BLANCO = "#FFEDE5";
/** `color-mix(in srgb, var(--color-naranja) 8%, #ffffff)` — relleno en reposo
    de los botones de contorno de las tarjetas. */
const NARANJA_TENUE = "#FAF0ED";
/** `color-mix(in srgb, var(--color-dorado) 12%, #ffffff)` — panel del ejemplo
    del tiquismo. */
const DORADO_TENUE = "#FEF6E8";

/*
 * ============ EL NAVBAR DE CRISTAL ============
 * El navbar es translúcido y lo que tiene detrás no se controla. Así que se
 * mide contra el PEOR FONDO QUE EXISTE, que es el negro: si pasa ahí, pasa
 * sobre cualquier fotografía.
 *
 * Son dos estados con dos opacidades distintas, y la diferencia no es de
 * gusto:
 *
 *   - AL BAJAR va al 97 %, porque detrás puede pasar una foto oscura —el
 *     bosque de Monteverde, la selva del Río Celeste— mientras se hace scroll.
 *   - EN EL TOPE va al 90 %, que se ve bastante más de cristal, y ahí se puede
 *     porque detrás solo hay un hero, y todos los heroes llevan un velo de
 *     crema al 75 % en esa franja. El compuesto es 0,90 + 0,10 × 0,75 = 97,5 %.
 *
 * Si alguien cambia una de las dos cifras en `globals.css` y no la otra, este
 * script lo caza. Ese es todo el motivo de que estén aquí.
 * ==============================================
 */
/** Navbar compacto: 97 % de crema sobre negro. */
const CRISTAL_BAJANDO = "#F7EDDF";
/** Navbar en el tope: 90 % de crema, sobre el velo del hero al 75 %, sobre
    negro. O sea 97,5 % de crema efectivo. */
const CRISTAL_EN_TOPE = "#F9EEE0";

/** `color-mix(in srgb, var(--color-turquesa) 22%, #ffffff)` — fondo de las
    fichas de habilidades en `/online`. */
const TURQUESA_TENUE = "#DBF2F2";

/**
 * Cada par es una combinación que EXISTE en la interfaz. No se listan colores
 * decorativos: esos nunca llevan texto encima, y esa es justamente la regla
 * que los mantiene fuera de aquí.
 */
const PARES = [
  { nombre: "Texto de cuerpo sobre fondo", frente: TINTA, fondo: CREMA, tamano: "normal" },
  { nombre: "Enlace / acento sobre fondo", frente: NARANJA, fondo: CREMA, tamano: "normal" },
  { nombre: "Titular teal sobre fondo", frente: TEAL, fondo: CREMA, tamano: "normal" },
  { nombre: "Botón primario (blanco sobre teal)", frente: BLANCO, fondo: TEAL, tamano: "normal" },
  { nombre: "Botón de acento (blanco sobre naranja)", frente: BLANCO, fondo: NARANJA, tamano: "normal" },
  { nombre: "Texto sobre superficie teal", frente: CREMA, fondo: TEAL, tamano: "normal" },
  { nombre: "Insignia dorada (tinta sobre dorado)", frente: TINTA, fondo: DORADO, tamano: "normal" },
  { nombre: "Titular del pie (dorado claro sobre teal)", frente: DORADO_TEXTO, fondo: TEAL, tamano: "normal" },
  { nombre: "Insignia del hero (teal sobre blanco)", frente: TEAL, fondo: BLANCO, tamano: "normal" },
  { nombre: "Botón de contorno (teal sobre crema)", frente: TEAL, fondo: CREMA, tamano: "normal" },
  { nombre: "Acento del titular (naranja sobre crema)", frente: NARANJA, fondo: CREMA, tamano: "normal" },
  { nombre: "Iconos de confianza sobre teal", frente: DORADO_TEXTO, fondo: TEAL, tamano: "normal" },

  // Tarjetas rediseñadas: tiquismo del día, experiencias y fichas de lugar.
  { nombre: "Etiqueta del tiquismo (naranja sobre coral claro)", frente: NARANJA, fondo: CORAL_SOBRE_BLANCO, tamano: "normal" },
  { nombre: "Palabra del tiquismo (teal sobre blanco)", frente: TEAL, fondo: BLANCO, tamano: "grande" },
  { nombre: "Ejemplo del tiquismo (tinta sobre dorado tenue)", frente: TINTA, fondo: DORADO_TENUE, tamano: "normal" },
  { nombre: "Botón de tarjeta en reposo (naranja sobre naranja tenue)", frente: NARANJA, fondo: NARANJA_TENUE, tamano: "normal" },
  { nombre: "Texto de tarjeta sobre blanco", frente: TINTA, fondo: BLANCO, tamano: "normal" },
  { nombre: "Zona de la ficha (naranja sobre blanco)", frente: NARANJA, fondo: BLANCO, tamano: "normal" },
  { nombre: "Aviso de anuncio (crema sobre tinta)", frente: CREMA, fondo: TINTA, tamano: "normal" },
  { nombre: "Anunciante (tinta sobre dorado)", frente: TINTA, fondo: DORADO, tamano: "normal" },

  // Navbar de cristal. El naranja de la marca es el par más ajustado del
  // sitio entero: es lo que fija cuánta transparencia se puede permitir.
  { nombre: "Marca naranja sobre el cristal al bajar", frente: NARANJA, fondo: CRISTAL_BAJANDO, tamano: "normal" },
  { nombre: "Marca teal sobre el cristal al bajar", frente: TEAL, fondo: CRISTAL_BAJANDO, tamano: "normal" },
  { nombre: "Enlaces del navbar al bajar (tinta)", frente: TINTA, fondo: CRISTAL_BAJANDO, tamano: "normal" },
  { nombre: "Marca naranja sobre el cristal en el tope", frente: NARANJA, fondo: CRISTAL_EN_TOPE, tamano: "normal" },
  { nombre: "Marca teal sobre el cristal en el tope", frente: TEAL, fondo: CRISTAL_EN_TOPE, tamano: "normal" },

  // Fichas de `/online`, que salen del artículo del cliente.
  { nombre: "Ficha de habilidad (teal sobre turquesa tenue)", frente: TEAL, fondo: TURQUESA_TENUE, tamano: "normal" },
  { nombre: "Ficha de situación (tinta sobre blanco)", frente: TINTA, fondo: BLANCO, tamano: "normal" },
];

/*
 * Pares que NO deben usarse nunca para texto. Se comprueban al revés: si
 * alguno empezara a pasar AA sería porque alguien cambió la paleta, y
 * conviene enterarse. Están aquí sobre todo como documentación ejecutable de
 * por qué existen las variantes oscuras.
 */
const PROHIBIDOS = [
  { nombre: "dorado de marca sobre teal", frente: DORADO, fondo: TEAL },
  { nombre: "blanco sobre turquesa decorativo", frente: BLANCO, fondo: "#5CC3C6" },
];

let fallos = 0;
console.log("\n  Contraste WCAG — pares en uso\n");

for (const { nombre, frente, fondo, tamano } of PARES) {
  const ratio = contraste(frente, fondo);
  const minimo = tamano === "grande" ? MINIMO_GRANDE : MINIMO_NORMAL;
  const pasa = ratio >= minimo;
  if (!pasa) fallos += 1;
  const marca = pasa ? "OK  " : "FALLA";
  console.log(
    `  ${marca} ${ratio.toFixed(2).padStart(5)}:1  (mín ${minimo})  ${nombre}`
  );
}

console.log("\n  Combinaciones que NO deben llevar texto\n");
for (const { nombre, frente, fondo } of PROHIBIDOS) {
  const ratio = contraste(frente, fondo);
  console.log(
    `  ${ratio.toFixed(2).padStart(5)}:1  ${nombre} — solo decorativo`
  );
}

console.log("");

if (fallos > 0) {
  console.error(
    `  ${fallos} combinación(es) por debajo del mínimo WCAG AA. Corregir antes de continuar.\n`
  );
  process.exit(1);
}

console.log(`  ${PARES.length} combinaciones verificadas, todas en AA.\n`);
