# Imágenes: de dónde salen y qué se puede hacer con ellas

Esto es un **negocio real**, así que cada imagen del sitio tiene que poder
publicarse con fines comerciales sin pedirle permiso a nadie y sin pagar por
ella. Este documento dice de dónde sale cada una y por qué esa fuente vale.

No es una opinión legal. Es el registro de las decisiones que se tomaron y de
la razón de cada una, para que dentro de un año se pueda revisar o cambiar sin
tener que reconstruirlo de memoria.

---

## Resumen

| Tipo | Fuente | Licencia | ¿Atribución obligatoria? |
|---|---|---|---|
| Paisajes y lugares (10) | Unsplash | Unsplash License | **No**, pero se registra igual |
| Clases (5) | Cedidas por el cliente | ⚠️ **Permiso sin confirmar** | Sí, y falta |
| Iconos y adornos | Dibujados aquí | Propios | No aplica |
| Logo (perezoso) | Del cliente | Del cliente | No aplica |

---

## 1. Las fotografías — Unsplash

Diez de las quince fotografías del sitio vienen de
[Unsplash](https://unsplash.com) y se descargan con
`node scripts/descargar-fotos.mjs`. El script deja la autoría de cada una en
`src/shared/data/creditos-fotos.json`, que es una de las dos listas que pinta
la página `/creditos`. Las otras cinco son las de clase — siguiente apartado.

### Qué permite la Unsplash License

En resumen: usarlas gratis, también **con fines comerciales**, sin pedir
permiso. La atribución **no es obligatoria**.

Lo que **no** permite, y conviene tener presente:

- **Vender las fotos tal cual**, o montar con ellas un servicio que compita con
  Unsplash. No es el caso de este sitio.
- Dar por hecho que **las personas, marcas o propiedades que aparecen** han
  dado permiso. La licencia cubre los derechos de autor del fotógrafo, **no los
  derechos de imagen de quien salga retratado**. Por eso ninguna de las
  fotografías elegidas tiene una cara reconocible: la calle de San José está
  vacía y las demás son paisaje, costa o un ave.

El texto oficial está en <https://unsplash.com/license>.

### Por qué se registra la autoría igual que si fuera obligatoria

Tres razones, y ninguna es de cortesía:

1. **Para poder defenderla.** Si algún día alguien reclama por una imagen, la
   única respuesta útil es «de aquí salió, esta licencia tenía, este día se
   descargó». Sin registro no hay respuesta.
2. **Para poder reemplazarla.** Saber qué foto es cuál permite cambiar una sin
   tocar las otras.
3. **Porque es lo correcto.** Alguien hizo la foto.

### ⚠️ Unsplash+ no es Unsplash

La búsqueda de Unsplash **mezcla en la misma rejilla** las fotos gratuitas y
las de **Unsplash+**, que son de pago y llevan otra licencia. Se ven iguales.

La forma de distinguirlas es el autor: las de pago salen a nombre de
**«Unsplash+ Community»**, con el usuario `plus`.

Pasó eligiendo la lapa roja: el primer resultado de «scarlet macaw costa rica»
era de Unsplash+ y se descartó por eso, no por la foto. El script de descarga
lleva la advertencia escrita al lado de la lista.

### Cada foto se verifica dos veces

1. **Que sea el sitio que dice ser.** Una búsqueda por «Arenal» devuelve
   montañas que no son el Arenal, y media internet etiqueta como «lapa de Costa
   Rica» guacamayos fotografiados en Perú. Cuando el autor lo dice en la
   descripción de la foto, esa es la prueba; si no lo dice, la foto no entra.
   La lapa entró porque su autor escribió que está hecha en Isla Tortuga.
2. **Que aguante el recorte.** Todas van con `object-fit: cover`, así que una
   composición centrada se parte por la mitad en un teléfono.

---

## 1 bis. Las fotos de clase — cedidas por el cliente

Las cinco fotografías de estudiantes en clase **no son de Unsplash**. Las
entregó el cliente por WhatsApp el 21 de septiembre de 2026 y salen de las webs
de las escuelas socias. Viven en `src/shared/data/creditos-cedidas.json`, en un
archivo aparte porque `descargar-fotos.mjs` reescribe el otro entero cada vez
que corre.

### Los dos permisos que hacen falta, y que no son el mismo

1. **El de la escuela**, que tiene los derechos de autor sobre la fotografía.
2. **El de cada persona que aparece**, que tiene derechos sobre su propia
   imagen. Una autorización de la escuela no cubre esto: la escuela no puede
   ceder un derecho que no es suyo.

En las cinco hay caras reconocibles. **Ninguno de los dos permisos está por
escrito todavía.** El cliente pidió publicarlas igual y asumió esa
responsabilidad; queda anotado aquí, en `PENDIENTE.md` y en el propio dato
(`"permisoConfirmado": false`), y `/creditos` lo muestra con la etiqueta
amarilla.

Si alguna escuela reclama, la salida es quitar esa foto: la ficha del destino
sigue funcionando sin ella, porque el atractivo va en otra imagen.

### Y la resolución

Tres de las cinco están por debajo de lo utilizable a ancho de tarjeta:

| Foto | Tamaño | Sirve |
|---|---|---|
| Manuel Antonio | 1600×694 | Sí, aunque es un recorte de banner |
| La Fortuna | 1360×954 | Sí |
| Máximo Nivel | 800×500 | Justo |
| San José | 800×600 | Justo |
| Sámara | 510×288 | **No** — se ve blanda |

Pedirlas de nuevo a las escuelas está en `PENDIENTE.md`.

## 2. Los iconos tropicales — dibujados aquí

Las lapas, el tucán, el volcán, la rueda de carreta, la rama de café y el resto
de adornos **no salen de ningún paquete de iconos**: son SVG escritos a mano en
`src/shared/components/ui/Decorados.tsx`.

Se hicieron así a propósito, y una de las razones es esta misma página. Casi
todas las licencias gratuitas de paquetes de iconos —la de Font Awesome Free, la
CC BY de Noun Project, varias de Flaticon— **exigen atribución visible** o
limitan el uso comercial, y algunas cambian de condiciones entre versiones. Un
dibujo propio no arrastra nada de eso.

Las otras razones son técnicas y están explicadas en el propio archivo:
heredan `currentColor`, escalan sin pixelarse y no cuestan una petición de red
por pieza.

---

## 3. Sobre generar imágenes con IA

Se preguntó si se podían gastar créditos en generar imágenes. **Hoy no se ha
generado ninguna**, y conviene saber qué hay detrás de esa decisión antes de
cambiarla:

- **El servicio de generación que hay configurado en el entorno no está
  autorizado en esta sesión**, así que técnicamente no era una opción.
- **La ley no está asentada.** En Estados Unidos, la Oficina de Copyright viene
  sosteniendo que una imagen generada sin intervención humana suficiente **no
  es registrable**: se puede usar, pero no se puede impedir que otro la use. En
  la práctica eso significa que una imagen generada **no es un activo de la
  marca**, aunque sirva de ilustración.
- **Para lo que pide este sitio es peor herramienta.** Las fotos de aquí no son
  decoración: son Manuel Antonio, el Arenal, el Río Celeste, una calle de San
  José. Una imagen generada de «un volcán tropical» es un volcán que no existe,
  y publicarla en el sitio de una escuela costarricense es exactamente el tipo
  de cosa que un costarricense detecta en dos segundos.

**Dónde sí tendría sentido:** fondos abstractos, texturas, ilustraciones que no
representen un lugar real. Si se llega a usar para eso, se anota aquí con la
herramienta, la fecha y el prompt.

---

## 4. Qué hacer al añadir una imagen nueva

1. Comprobar la licencia **y el autor** (ojo con Unsplash+).
2. Verificar que sea el lugar que dice ser.
3. Añadirla a la lista de `scripts/descargar-fotos.mjs` y volver a correrlo. Eso
   actualiza `creditos-fotos.json` solo, y con él la página `/creditos`.
4. Escribir el `alt`. En `destinos.json` y en los heroes es **obligatorio por
   esquema**: una foto sin `alt` rompe el build antes de llegar a producción.
