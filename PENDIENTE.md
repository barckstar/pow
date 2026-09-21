# PENDIENTE — Costa Rica Spanish Experience

Lo que falta para poder publicar. **Nada de esto se inventa**: mientras no
esté confirmado, el dato vive en `null` y el hueco **se ve en la página**, con
una etiqueta amarilla de «Pendiente».

Un hueco visible se arregla. Uno invisible se publica.

---

## 1. Datos del negocio — bloquean la publicación

| Dato | Dónde va | Qué pasa mientras falta |
|---|---|---|
| **Precios** de las clases online y presenciales | `src/features/precios/` | `/precios` muestra el aviso en vez de una tabla |
| **Cuenta de Calendly** | `CALENDLY` en `src/shared/config/sitio.ts` | `/reservar` explica los tres pasos y dice que no se puede reservar todavía. **Bloquea la vía en línea entera** |
| **Monto del depósito** de reserva | `DEPOSITO` en `sitio.ts`, y en Calendly | `/precios` no enseña cifra. Va en los dos sitios: Calendly cobra, el sitio lo anuncia |
| **Nombre, foto y biografía del profesor** | `/online` | La página habla de él en genérico y marca el pendiente |
| **Correo y teléfono** de contacto | `CONTACTO` en `sitio.ts` | El pie muestra la etiqueta de pendiente |
| **Redes sociales** del negocio | `REDES` en `sitio.ts` | La barra lateral solo lleva la marca y el botón de compartir; `/comunidad` lo dice |
| **Dominio** | `URL_BASE` en `sitio.ts` | Provisional. Afecta a canónicas, `og:url` y sitemap |
| **Qué destinos son de verdad** | `destinos.json` | Los cuatro de hoy son los que el cliente puso «por ejemplo». `/costa-rica` lo avisa antes de las tarjetas |
| **Acuerdos con las escuelas** | `escuela.confirmada` en `destinos.json` | El nombre sale en la ficha con la etiqueta amarilla. El cliente escribió que «la info de las escuelas tengo que conseguirla bien» |
| **Condiciones del hospedaje** | `paginas.costaRica.hospedajeTexto` | La página dice que lo resuelve la escuela, sin concretar modalidad ni precio, porque no se sabe |
| **A dónde llegan las solicitudes** | `features/solicitud/` | El formulario se ve entero y el botón está `disabled`, con el aviso de por qué. Faltan proveedor, aviso de privacidad y correo de destino |
| **Permiso de las fotos de clase** | `creditos-cedidas.json` | Las cinco están publicadas por decisión del cliente, con `"permisoConfirmado": false`. Falta el permiso por escrito de cada escuela y de las personas que salen |
| **Reseñas de estudiantes** | sin sección todavía | No hay sección de reseñas. **Se transcriben de fuentes reales, no se inventan** |

## 2. Credenciales

El sitio ya **no necesita ninguna variable de entorno**. Lo que hace falta son
tres cosas fuera del repositorio, y las tres se configuran en el mismo sitio:

- **Calendly**, con el plan que cubra dos funciones de pago: **cobrar dentro
  del flujo de reserva** y la **integración con Zoom**. Sin la primera,
  cualquiera aparta una franja sin pagar; sin la segunda, el enlace de la
  videollamada hay que mandarlo a mano.
- **PayPal**: cuenta de negocio verificada, para conectarla *a Calendly*. Ya no
  hace falta ninguna credencial en el código.
- **Zoom**: cuenta que se conecta a Calendly desde su panel.

El proveedor de calendario **ya está decidido** —era una decisión abierta y lo
eligió el cliente: Calendly— y con ella se quitó el puerto de calendario, el
selector de franjas propio y las rutas de PayPal.
Ver [`docs/variables-de-entorno.md`](docs/variables-de-entorno.md).

## 3. Contenido

- **Artículos del blog**: la maquinaria está completa y hay **dos artículos de
  ejemplo** escritos sobre hechos verificables del español costarricense
  («pura vida» y el voseo). Todo lo que sea experiencia personal del profesor
  o de sus estudiantes **lo escribe él**.
  La portada de un artículo es **opcional a propósito**: obligar a buscar una
  imagen con licencia para cada texto es la forma segura de que el profesor
  deje de escribir. Cuando falta, la tarjeta pinta un panel de la paleta del
  mismo alto, así la rejilla no se descuadra.
- **Anunciantes de los destinos**: `/destinos` está preparada para vender
  espacio a hoteles y operadores. Hoy las cuatro fichas son contenido propio
  (`"patrocinado": false`). El aviso visible ya está hecho y con estilo; falta
  el primer anunciante.
- **Fotos de clase de más resolución**. Tres de las cinco que mandó el cliente
  no dan la talla: Sámara es 510×288, San José 800×600 y la segunda de Manuel
  Antonio 800×500. A ancho de tarjeta se ven blandas. Pedirlas a las escuelas.
- **La segunda escuela de Manuel Antonio**. El cliente nombró dos ahí —Manuel
  Antonio Spanish School y Máximo Nivel— y el esquema solo admite una por
  destino. Hay que decidir si se elige una o si un destino puede tener varias.
- **Más artículos del cliente**. Mandó el primero («Why Online Spanish Classes
  Are the Smartest Way to Learn Spanish in 2026»), ya publicado en los dos
  idiomas y usado como fuente de `/online`. Todo lo que sea experiencia
  personal suya o de sus estudiantes lo escribe él.
- **Audio de los tiquismos**: el componente los contempla; faltan las
  grabaciones del profesor.
- **Más tiquismos**. Hay ocho, y el de la portada rota a diario sin repetir
  ninguno antes de tres días — que es el máximo que se puede garantizar con
  ocho. Con veinte, la separación mínima sube sola y el sitio deja de dar la
  sensación de que se repite. Es contenido que escribe el profesor y va en
  `src/features/tiquismos/data/tiquismos.json`.
- **Logo en alta resolución**: el perezoso actual está recortado del concept
  board, donde mide 155×120 px. Alcanza de sobra para el navbar y la barra
  social, pero el icono de 512 para PWA sale de un reescalado y se nota.
  Si existe el archivo original, reemplazarlo y volver a correr
  `python scripts/recortar-logo.py`.

## 4. Decisiones abiertas

### El nombre es largo para dominio y marca

«Costa Rica Spanish Experience» son 29 caracteres. En el `<title>` hubo que
usar la versión corta «Costa Rica Spanish» para que los títulos de página
cupieran en los 65 caracteres que muestran los buscadores. Conviene decidir el
nombre definitivo **antes** de comprar dominio.

### Rendimiento en móvil: 86, no 95

Medido sobre el build de producción, mediana de tres corridas. Escritorio da
100 en las cuatro categorías; móvil da 100 en accesibilidad, prácticas
recomendadas y SEO, y **86 en rendimiento**.

El techo es el LCP: ~3,0 s simulados por la fotografía a pantalla completa del
hero. **Está medido que no es cuestión de peso**: la imagen se redujo de 30 KB
a 16 KB y la puntuación no se movió (87 antes, 87 después del cambio). Lo que pesa es la
cadena de latencia que Lighthouse simula en móvil — 150 ms de ida y vuelta y
CPU cuatro veces más lenta.

Las tres salidas posibles, en orden de coste:

1. **Aceptar 86 en móvil.** Es una puntuación normal para una página con foto
   a sangre; el sitio carga la imagen en 286 ms sin simulación.
2. **Sacar la foto del camino del LCP**: hero con degradado de la paleta y la
   fotografía entrando después. Sube la puntuación y cambia el diseño.
3. **Hero distinto en móvil**: una composición más ligera por debajo de 768 px.

Es una decisión de diseño, no una optimización. Queda para el usuario.

---

## Lo que SÍ está terminado

- Sitio bilingüe es/en completo: home, online, presencial, destinos, blog,
  precios, comunidad, reservar, créditos y 404.
- Blog en Markdown con frontmatter validado, RSS por idioma, filtrado por
  etiqueta y `hreflang` recíproco solo donde la traducción existe.
- `/reservar` con los tres pasos explicados y el calendario de Calendly
  cargándose solo al pulsar, para no gastar rendimiento en quien pasa de
  largo.
- Metadatos completos verificados por script en `postbuild` (26 páginas).
- Paleta 70/30/10 con contraste WCAG AA medido y verificado por script.
- Preguntas frecuentes con `<details>` nativos y JSON-LD de `FAQPage`.
  Las cuatro preguntas cuya respuesta depende de un dato sin confirmar se
  muestran con la etiqueta de pendiente y **quedan fuera del JSON-LD**.
- Olas animadas cerrando el hero de la portada, en bucle sin costura y solo con
  `transform`.
- Navbar de una sola altura, sin zoom, con CLS 0 por construcción.
- Heroes con fotografía en `/online` (lapa roja) y `/presencial` (una calle de
  San José).
- Trece adornos tropicales propios repartidos por secciones, apagados en móvil.
- `/destinos` con los cuatro destinos de inmersión que pidió el cliente, cada
  uno con foto del atractivo, foto de clase, escuela marcada como pendiente y
  botón al formulario. Hueco legal para anuncios pagados, verificado por
  esquema.
- Formulario de solicitud con los ocho campos que dictó el cliente, en diez
  páginas estáticas (cuatro destinos + una genérica, por idioma). El envío,
  desactivado a propósito y con el aviso a la vista.
- Barra de scroll con los colores de la paleta.
- Rotación diaria de tiquismos: baraja por ciclos, sin repetir ninguno
  antes de tres días.
- 43 tests en verde, 27 pares de contraste en AA, ESLint sin avisos y 40
  páginas con los metadatos verificados.
