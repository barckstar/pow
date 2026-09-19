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

console.log("");

if (fallos > 0) {
  console.error(
    `  ${fallos} combinación(es) por debajo del mínimo WCAG AA. Corregir antes de continuar.\n`
  );
  process.exit(1);
}

console.log(`  ${PARES.length} combinaciones verificadas, todas en AA.\n`);
