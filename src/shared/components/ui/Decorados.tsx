import type { CSSProperties, ReactNode } from "react";

/**
 * LOS ADORNOS TROPICALES DEL SITIO.
 *
 * Motivos de Costa Rica en LÍNEA FINA Y CONTINUA: trazo parejo, punta
 * redonda, sin relleno salvo donde la forma lo pide, y detalle suficiente para
 * que cada uno se reconozca solo, sin leyenda.
 *
 * ============ NO SON «ICONOS TROPICALES» GENÉRICOS ============
 * Una palmera y un hibisco los tiene cualquier plantilla de agencia de viajes.
 * Lo que ata este juego a Costa Rica son cuatro piezas que no salen en esa
 * plantilla:
 *
 *   - La LAPA ROJA. Es el ave que la gente asocia con el país y la que pidió
 *     el cliente por su nombre.
 *   - El VOLCÁN con el cono cortado: es el perfil del Arenal, que es la
 *     postal del país y uno de los dos destinos del sitio.
 *   - La RUEDA DE CARRETA pintada. Es el símbolo folclórico costarricense —la
 *     carreta típica es Patrimonio Inmaterial de la UNESCO— y no significa
 *     nada en ningún otro sitio del Caribe.
 *   - La RAMA DE CAFÉ. El café es lo que construyó el país; el grano rojo en
 *     la rama es la imagen con la que se cuenta esa historia.
 *
 * La palmera, la monstera y el hibisco están para dar aire entre esas cuatro,
 * no al revés.
 * ==============================================================
 *
 * ============ POR QUÉ VIVEN EN `shared/` ============
 * Los usan el hero, la home, `/online`, `/presencial`, `/destinos` y el blog.
 * Metidos en una feature, las demás tendrían que importar de ella — lo único
 * que la arquitectura por features prohíbe de plano.
 * ====================================================
 *
 * ============ POR QUÉ SVG EN LÍNEA Y NO IMÁGENES ============
 *   - Son decenas repartidos por la página. Como `<img>` serían decenas de
 *     peticiones de red, y varios están sobre el pliegue compitiendo con el
 *     LCP, que en móvil ya es el cuello de botella de este sitio.
 *   - Heredan `currentColor`: el mismo dibujo sirve en cualquier color de la
 *     paleta sin tener un archivo por variante.
 *   - Escalan sin pixelarse, de los 40 px de un adorno chico a los 260 de uno
 *     grande.
 *   - Son DIBUJOS PROPIOS, no un paquete descargado: no arrastran la
 *     atribución que casi todas las licencias gratuitas de iconos exigen, ni
 *     el riesgo de que el paquete cambie de licencia. Ver `docs/imagenes.md`.
 * =============================================================
 *
 * TODOS SON DECORATIVOS. El contenedor lleva `aria-hidden` y `pointer-events:
 * none`: no se anuncian a un lector de pantalla —sería ruido puro— y nunca
 * roban un clic destinado a lo que tienen debajo.
 */

/* ────────────────────────── El trazo común ────────────────────────── */

type Dibujo = { className?: string };

/**
 * El pulso de todos los dibujos.
 *
 * Trazo de 3 sobre un lienzo de 100. Van a un tercio de opacidad detrás del
 * texto: más fino desaparece en vez de insinuarse, y más gordo se come el
 * detalle —y sin detalle la lapa, el tucán y el colibrí son el mismo bulto con
 * pico—.
 */
const trazo = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/* ────────────────────────── Los bichos ────────────────────────── */

/**
 * LAPA ROJA posada, de perfil.
 *
 * ============ LAS TRES COSAS QUE LA HACEN UNA LAPA ============
 * Un loro genérico es una pera con pico. Lo que distingue a la lapa roja y
 * está dibujado aquí:
 *
 *   1. EL PICO GANCHUDO Y ALTO. No es un triangulito: la mandíbula superior
 *      arranca casi en la frente y baja curvándose hasta pasarse de la
 *      inferior. Es la mitad de la silueta de la cabeza.
 *   2. LA CARA BLANCA. El parche desnudo alrededor del ojo, que en el dibujo
 *      es el óvalo que rodea la pupila. Sin él la cabeza se lee como la de una
 *      paloma.
 *   3. LA COLA LARGUÍSIMA. En la lapa mide más que el cuerpo entero. Si se
 *      dibuja corta sale un perico, que es otro pájaro.
 * ==============================================================
 */
export function Lapa({ className }: Dibujo) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...trazo}>
      {/* Cabeza y cuerpo: una sola silueta, del pecho al arranque de la cola. */}
      <path d="M40 28c8-6 18-3 21 6 3 8 6 14 11 20 7 9 11 18 12 28" />
      <path d="M29 47c-1-9 3-16 11-19" />
      <path d="M31 52c3 9 10 15 19 17 8 2 15 6 19 12" />
      {/* El pico: mandíbula alta y ganchuda, y la de abajo más corta. */}
      <path d="M40 28c-7 1-13 6-14 13 0 4 1 6 3 7" />
      <path d="M29 47c-4 1-6 3-6 6 0 4 4 6 8 5" />
      <path d="M26 44c3 1 5 2 6 4" strokeWidth={2.2} />
      {/* La cara desnuda alrededor del ojo. */}
      <ellipse cx="39" cy="35" rx="7" ry="6" strokeWidth={2.2} />
      <circle cx="39" cy="35" r="2" fill="currentColor" stroke="none" />
      {/* El ala plegada sobre el costado. */}
      <path d="M52 40c8 3 13 10 15 19" strokeWidth={2.4} />
      <path d="M48 46c6 3 10 8 12 14" strokeWidth={2} />
      {/* La cola: dos plumas largas cruzando hasta la esquina. */}
      <path d="M69 81c8 5 16 8 25 9-8 3-17 3-25 1" />
      <path d="M84 82c4 4 7 6 10 8" strokeWidth={2.2} />
      {/* Las patas y la rama. */}
      <path d="M47 69v8M56 73v6" strokeWidth={2.4} />
      <path d="M40 79c6-3 14-4 22-2" strokeWidth={2.6} />
    </svg>
  );
}

/**
 * TUCÁN posado.
 *
 * Todo el dibujo está al servicio del PICO: ocupa cuatro décimas del lienzo y
 * es lo único que hay que acertar. Un tucán con el pico discreto es un mirlo.
 * Por eso el cuerpo va casi sin detalle —dos líneas de ala y nada más—: si el
 * cuerpo compite, el pico deja de ser lo primero que se ve.
 */
export function Tucan({ className }: Dibujo) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...trazo}>
      {/*
        El cuerpo va CORRIDO A LA DERECHA y más estrecho de lo que pide el
        instinto. La primera versión lo puso centrado y ocupando casi el
        lienzo: el pico le nacía dentro y solo asomaba un pico de gorrión. Un
        tucán es medio pájaro y medio pico, y el reparto tiene que verse.
      */}
      <path d="M64 30c13 0 22 12 22 28S77 86 64 86 42 74 42 58c0-8 3-16 8-21" />
      {/* El pico: casi tan largo como el cuerpo, con la punta hacia abajo. */}
      <path d="M48 34C35 29 16 31 5 40c1 5 5 9 10 12" />
      <path d="M15 52c11 4 24 4 32-2" />
      {/* La línea que separa las dos mandíbulas. */}
      <path d="M7 44c12 3 26 4 38 1" strokeWidth={2} />
      {/* El ojo. */}
      <circle cx="61" cy="41" r="3.4" fill="currentColor" stroke="none" />
      {/* El ala plegada. */}
      <path d="M70 50c6 5 9 13 8 22" strokeWidth={2.4} />
      {/* Patas y rama. */}
      <path d="M57 85v6M70 85v6" strokeWidth={2.4} />
      <path d="M46 91c11-3 24-3 35 0" strokeWidth={2.6} />
    </svg>
  );
}

/**
 * MARIPOSA MORPHO.
 *
 * Se dibuja MEDIA y se espeja con `scale(-1 1)`. Escritas las dos alas a mano,
 * el día que se retoque una el otro lado se queda como estaba y la mariposa
 * sale coja — y en una mariposa la simetría es literalmente lo único que hay
 * que mirar.
 */
/*
 * ============ LAS ALAS SON ANGULARES, NO REDONDAS ============
 * La primera versión las escribió con curvas suaves de lado a lado y el
 * resultado fueron cuatro círculos: un trébol, no una mariposa. Un ala tiene
 * un HOMBRO recto pegado al cuerpo y una ESQUINA EXTERIOR marcada; en cuanto
 * las dos se redondean, la silueta pierde lo único que la identifica.
 *
 * Por eso aquí hay tramos rectos (`L`) y curvas cortas (`Q`) en vez de cúbicas
 * largas: la esquina de afuera queda, y el `stroke-linejoin: round` del trazo
 * común le quita la dureza sin deshacerla.
 * =============================================================
 */
const ALA_MORPHO =
  // Ala de arriba: sube pegada al cuerpo, se abre y baja en pico.
  "M50 50 L55 17 Q59 8 70 10 Q89 14 87 32 Q85 48 64 52 Z";
const ALA_BAJA =
  // Ala de abajo, más corta y con el borde ondulado.
  "M50 55 Q71 55 77 66 Q83 79 70 84 Q57 87 50 68 Z";

export function Mariposa({ className }: Dibujo) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...trazo}>
      <g strokeWidth={2.6}>
        <path d={ALA_MORPHO} />
        <path d={ALA_BAJA} />
        <path d={ALA_MORPHO} transform="translate(100 0) scale(-1 1)" />
        <path d={ALA_BAJA} transform="translate(100 0) scale(-1 1)" />
      </g>
      {/* El cuerpo, la cabeza y las antenas. */}
      <path d="M50 30v48" strokeWidth={4} />
      <circle cx="50" cy="26" r="4" strokeWidth={2.4} />
      <path d="M47 23c-3-5-7-8-12-9M53 23c3-5 7-8 12-9" strokeWidth={2} />
    </svg>
  );
}

/* ────────────────────────── La tierra ────────────────────────── */

/**
 * EL VOLCÁN. Es el perfil del Arenal: cono recto, cima cortada y la fumarola.
 *
 * La banda de selva a media ladera no es adorno. Un triángulo con humo es un
 * volcán de cualquier sitio; lo que sitúa a este en Costa Rica es que la selva
 * le sube hasta la mitad del cono. Es lo que se ve en la fotografía de
 * `/fotos/arenal.jpg`, y el dibujo y la foto tienen que contar lo mismo.
 */
export function Volcan({ className }: Dibujo) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...trazo}>
      {/* Las dos laderas y la cima cortada. */}
      <path d="M8 86 38 34h22l32 52" />
      <path d="M38 34c8 7 14 7 22 0" strokeWidth={2.4} />
      {/*
        La fumarola sale del cráter y CABE EN EL LIENZO. La primera versión
        arrancaba a 19 y se iba a -8: el SVG recorta lo que sale del viewBox,
        así que el volcán salía sin humo y quedaba un monte.
      */}
      <path d="M50 28c-7-4-7-9 0-13 7-4 7-9 0-13" strokeWidth={2.4} />
      {/* La selva que le sube por la ladera. */}
      <path d="M23 68c9 6 17 6 25 0s16-6 25 0" strokeWidth={2.2} />
      {/* El suelo. */}
      <path d="M4 86h92" strokeWidth={2.6} />
    </svg>
  );
}

/**
 * RUEDA DE CARRETA.
 *
 * ============ LOS SEGMENTOS SE DIBUJAN UNA VEZ ============
 * Hay UN pétalo y ocho rotaciones de 45°, no ocho paths a mano. Escritos uno
 * por uno habría que calcular dieciséis pares de coordenadas con senos y
 * cosenos, y el primero con un decimal de más deja un segmento torcido: el
 * tipo de fallo que no se ve en el código y salta en pantalla.
 *
 * Con la rotación la simetría está GARANTIZADA por construcción, que es justo
 * lo que se necesita en una rueda.
 * ==========================================================
 */
const RADIOS = [0, 45, 90, 135, 180, 225, 270, 315];
/** El rombo pintado de cada segmento, con la punta hacia el eje. */
const SEGMENTO = "M0-14 8-26 0-38-8-26Z";

export function RuedaCarreta({ className }: Dibujo) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...trazo}>
      {/* La llanta: dos aros, que es la madera vista de canto. */}
      <circle cx="50" cy="50" r="46" />
      <circle cx="50" cy="50" r="40" strokeWidth={2.2} />
      {/* El cubo. */}
      <circle cx="50" cy="50" r="9" strokeWidth={2.4} />
      <g transform="translate(50 50)" strokeWidth={2.2}>
        {RADIOS.map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            {/* El radio. */}
            <path d="M0-9v-31" />
            {/* Y la pintura, que es lo que hace que sea una carreta tica y no
                la rueda de un carro cualquiera. */}
            <path d={SEGMENTO} />
          </g>
        ))}
      </g>
    </svg>
  );
}

/**
 * RAMA DE CAFÉ con el grano maduro.
 *
 * Las hojas van EN PARES ENFRENTADOS, que es como crecen en el cafeto, y los
 * granos en racimo pegados al tallo, no colgando como cerezas. Dibujado al
 * revés parece un cerezo, que es un árbol de otro clima y de otra historia.
 */
export function RamaCafe({ className }: Dibujo) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...trazo}>
      {/* El tallo. */}
      <path d="M22 90C36 70 48 46 54 16" strokeWidth={2.8} />
      {/* Tres pares de hojas enfrentadas, cada par más chico que el de abajo. */}
      <g strokeWidth={2.4}>
        <path d="M44 51c-8-9-20-11-28-6 5 10 19 14 28 6Z" />
        <path d="M44 51c10-6 22-4 28 4-9 7-23 5-28-4Z" />
        <path d="M51 30c-7-7-16-9-23-5 4 8 16 11 23 5Z" />
        <path d="M51 30c8-5 18-3 23 3-8 6-19 4-23-3Z" />
      </g>
      {/* El racimo de granos, pegado al tallo. */}
      <g strokeWidth={2.2}>
        <circle cx="41" cy="68" r="5" />
        <circle cx="51" cy="73" r="4.4" />
        <circle cx="34" cy="78" r="4" />
      </g>
    </svg>
  );
}

/* ────────────────────────── La vegetación ────────────────────────── */

/**
 * Hoja de palma.
 *
 * Los folíolos son elipses rotadas sobre el raquis, no un peine de líneas: una
 * penca real tiene las hojitas más largas en el centro y más cortas hacia la
 * punta, y esa degradación es la mitad de lo que la hace reconocible.
 */
const FOLIOLOS = [
  { cx: 12.8, cy: 53.3, a: -140, rx: 14 },
  { cx: 31.2, cy: 53.3, a: -40, rx: 14 },
  { cx: 23.8, cy: 39.3, a: -140, rx: 12.5 },
  { cx: 42.2, cy: 39.3, a: -40, rx: 12.5 },
  { cx: 37.8, cy: 27.3, a: -140, rx: 10.5 },
  { cx: 56.2, cy: 27.3, a: -40, rx: 10.5 },
  { cx: 66, cy: 24, a: -62, rx: 9 },
];

export function HojaPalma({ className }: Dibujo) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      {FOLIOLOS.map(({ cx, cy, a, rx }, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={rx}
          ry="3.6"
          transform={`rotate(${a} ${cx} ${cy})`}
        />
      ))}
      {/* El raquis, que es lo que las ensarta a todas. */}
      <path
        d="M14 92C14 64 32 40 66 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Hoja tipo costilla de Adán.
 *
 * ============ LOS CORTES VAN EN EL CONTORNO ============
 * Un óvalo cerrado con rayas cruzándolo por dentro no es una monstera: es un
 * globo con una red encima. Los cortes de esta planta se MUERDEN EL BORDE —
 * entran desde afuera y se paran antes del nervio central. Si el contorno
 * sigue siendo liso, no hay dibujo que lo arregle.
 *
 * Aquí el contorno los lleva dentro, y se dibuja UNA MITAD espejada con
 * `scale(-1 1)`: escrita dos veces a mano, el día que se retoque un lóbulo el
 * otro lado se queda como estaba y la hoja sale coja.
 * =======================================================
 */
const MITAD_MONSTERA =
  "M50 10 C64 10 73 17 74 28 L57 32 C75 34 86 40 86 50 L58 54 " +
  "C74 56 81 60 79 68 L57 70 C65 72 69 75 67 81 C62 86 54 88 50 88";

export function Monstera({ className }: Dibujo) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...trazo}>
      <path d={MITAD_MONSTERA} />
      <path d={MITAD_MONSTERA} transform="translate(100 0) scale(-1 1)" />
      {/* Nervio central y peciolo. */}
      <path d="M50 12v76" strokeWidth={2.4} />
      <path d="M50 88q0 6-4 9" strokeWidth={2.6} />
    </svg>
  );
}

/** Palmera entera, con los cocos en la corona. */
export function Palmera({ className }: Dibujo) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...trazo}>
      {/* El tronco, con sus anillos. Dos curvas que se abren hacia abajo. */}
      <path d="M43 92q0-30 5-54M57 92q0-30-5-54" />
      <g strokeWidth={2.2}>
        <path d="M45 80h10M44 70h11M45 60h9M46 51h8M47 44h6" />
      </g>
      {/* Cinco pencas desde la corona. */}
      <g strokeWidth={2.6}>
        <path d="M50 38c-15-2-29 2-37 11 2-15 21-24 37-11Z" />
        <path d="M50 38c-11-11-25-17-37-15 8-11 29-7 37 15Z" />
        <path d="M50 38c15-2 29 2 37 11-2-15-21-24-37-11Z" />
        <path d="M50 38c11-11 25-17 37-15-8-11-29-7-37 15Z" />
        <path d="M50 38c-3-13 1-25 9-31 7 13 2 25-9 31Z" />
      </g>
      {/* Los cocos de la corona. */}
      <circle cx="44" cy="43" r="3" strokeWidth={2.4} />
      <circle cx="55" cy="44" r="3" strokeWidth={2.4} />
    </svg>
  );
}

/**
 * Hibisco.
 *
 * Cinco pétalos, UNO dibujado y cinco rotaciones de 72°, por la misma razón
 * que la rueda: a mano, un pétalo con un decimal de más deja la flor torcida.
 * El estambre largo que se asoma por delante es lo que la separa de una
 * margarita.
 */
/*
 * ============ EL PÉTALO ES ESTRECHO POR GEOMETRÍA, NO POR GUSTO ============
 * La primera versión medía 40 de ancho. Con cinco pétalos a 72°, la cuerda
 * entre dos centros a la altura más ancha —radio 25— es 2·25·sen36° ≈ 29. Un
 * pétalo de 40 en un hueco de 29 se monta sobre sus dos vecinos, y cinco
 * óvalos montados no son una flor: son una mancha con agujeros. Es exactamente
 * lo que se veía.
 *
 * A 26 de ancho se tocan sin taparse, que es lo que hace un hibisco.
 * ==========================================================================
 */
const PETALO =
  "M0-8C-7-16-11-27-8-36Q-4-44 0-44Q4-44 8-36C11-27 7-16 0-8Z";
/** El nervio. Sin él, cinco óvalos alrededor de un círculo son una margarita
    de guardería; la raya que baja del centro a la punta es lo que los vuelve
    pétalos. */
const NERVIO = "M0-13V-38";

export function Hibisco({ className }: Dibujo) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...trazo}>
      <g transform="translate(50 54)" strokeWidth={2.6}>
        {[0, 72, 144, 216, 288].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d={PETALO} />
            <path d={NERVIO} strokeWidth={1.8} />
          </g>
        ))}
        <circle cx="0" cy="0" r="6" strokeWidth={2.2} />
      </g>
      {/* El estambre, por delante de los pétalos. */}
      <path d="M50 54c8 6 14 14 16 24" strokeWidth={2.2} />
      <circle cx="67" cy="80" r="3" strokeWidth={2.2} />
    </svg>
  );
}

/* ────────────────────────── El mar y el cielo ────────────────────────── */

/** Una ola que rompe. Va donde se habla de playa y de Manuel Antonio. */
export function Ola({ className }: Dibujo) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...trazo}>
      {/* El labio, que se enrosca sobre sí mismo. */}
      <path d="M8 62c6-22 24-36 44-34 15 2 24 14 21 26-3 10-14 14-21 9-6-4-6-12 0-16" />
      {/* La espuma que suelta al romper. */}
      <path d="M30 70c8 4 18 4 27 0" strokeWidth={2.2} />
      {/* El agua de abajo. */}
      <path d="M6 82q9-6 18 0t18 0 18 0 18 0" strokeWidth={2.4} />
    </svg>
  );
}

/** Sol de rayos alternos. */
export function Sol({ className }: Dibujo) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...trazo}>
      <circle cx="50" cy="50" r="22" />
      <g transform="translate(50 50)" strokeWidth={2.6}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
          <path
            key={a}
            /* Alternos, largo y corto: ocho rayos iguales se leen como una
               rueda dentada. */
            d={i % 2 ? "M0-28v-8" : "M0-28v-14"}
            transform={`rotate(${a})`}
          />
        ))}
      </g>
    </svg>
  );
}

/** Estrella de cuatro puntas cóncavas: el destello suelto entre lo demás. */
export function Estrella({ className }: Dibujo) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="currentColor">
      {/* Cóncavas: una estrella de rombos se lee como diamante. */}
      <path d="M20 0q4 16 20 20-16 4-20 20-4-16-20-20 16-4 20-20Z" />
    </svg>
  );
}

/* ────────────────────────── El envoltorio ────────────────────────── */

/**
 * Las animaciones disponibles. Los `@keyframes` viven en globals.css.
 *
 * TODAS mueven SOLO `transform` y `opacity`, que van en el compositor y no
 * provocan reflow. Cualquiera que tocase ancho, alto o posición obligaría al
 * navegador a recalcular la maqueta en cada fotograma — con quince adornos en
 * pantalla, eso se siente en un teléfono.
 *
 * `prefers-reduced-motion` las para todas (regla global en globals.css).
 */
export type AnimacionDecorado =
  | "respirar"
  | "giro"
  | "vaiven"
  | "flotar"
  | "deriva"
  | "destello";

export type Decorado = {
  /** El dibujo. */
  children: ReactNode;
  /** Posición del CENTRO del adorno, en porcentaje de la sección. */
  x: number;
  y: number;
  /** Ancho en `rem`. El alto sale solo: todos los dibujos son cuadrados. */
  tam: number;
  /** Inclinación fija, en grados. Rompe la sensación de sello estampado. */
  giro?: number;
  animacion?: AnimacionDecorado;
  /** Segundos. Escalona los adornos para que no se muevan a coro. */
  retraso?: number;
  /** Segundos que dura un ciclo. Por defecto, uno lento por animación. */
  duracion?: number;
  /** 0 a 1. Son fondo: con este trazo fino se mueven entre 0,2 y 0,5. */
  opacidad?: number;
  /** Token de color de la paleta. Por defecto, el teal. */
  color?: string;
};

type EstiloDecorado = CSSProperties & Record<`--${string}`, string>;

/**
 * Coloca y anima UN adorno.
 *
 * ============ POR QUÉ SON DOS ELEMENTOS Y NO UNO ============
 * `transform` es una sola propiedad. El de fuera ya gasta la suya en centrar
 * el adorno sobre su punto (`translate(-50%,-50%)`) y en la inclinación fija;
 * si la animación se declarara ahí, la pisaría y el adorno aparecería
 * descolocado y sin girar.
 *
 * El de fuera posiciona. El de dentro anima. Ninguno le toca la propiedad al
 * otro.
 * ============================================================
 *
 * ============ POSICIÓN EN LÍNEA Y NO EN UNA CLASE ============
 * Cada adorno está en un sitio distinto: una clase por adorno serían decenas
 * de reglas de un solo uso en `globals.css`, que es justo lo que esa hoja
 * evita. Lo que SÍ vive en la hoja es todo lo repetible —las animaciones, el
 * recorte, la capa—; en línea va solo el dato, que es dónde y cuánto.
 * =============================================================
 */
export function Adorno({
  children,
  x,
  y,
  tam,
  giro = 0,
  animacion,
  retraso = 0,
  duracion,
  opacidad = 0.34,
  color = "var(--color-teal)",
}: Decorado) {
  return (
    <span
      className="adorno"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${tam}rem`,
        opacity: opacidad,
        color,
        transform: `translate(-50%, -50%) rotate(${giro}deg)`,
      }}
    >
      <span
        className={animacion ? `adorno__dibujo deco-${animacion}` : undefined}
        style={
          {
            "--deco-retraso": `${retraso}s`,
            ...(duracion ? { "--deco-duracion": `${duracion}s` } : {}),
          } as EstiloDecorado
        }
      >
        {children}
      </span>
    </span>
  );
}

/**
 * La capa de adornos de una sección.
 *
 * `overflow: hidden`: un adorno colocado cerca del borde asoma fuera, y sin
 * recorte el documento gana ancho y aparece scroll horizontal. Ya pasó con las
 * olas del hero.
 *
 * Va DETRÁS del contenido. La sección que la use necesita `position: relative`
 * y `isolation: isolate` —lo da la clase `.con-adornos`— para que ese z-index
 * negativo no se escape a la página entera y se meta debajo del fondo.
 */
export function CapaDecorados({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" className="capa-adornos">
      {children}
    </div>
  );
}
