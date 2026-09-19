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
| **Monto del depósito** de reserva | `DEPOSITO` en `src/shared/config/sitio.ts` | `/reservar` no ofrece pagar; las rutas de PayPal devuelven 503 |
| **Nombre, foto y biografía del profesor** | `/online` | La página habla de él en genérico y marca el pendiente |
| **Horario real del profesor** | `src/features/reservas/data/horario-profesor.json` | Hay un horario provisional (`"confirmado": false`) y la página lo dice |
| **Correo y teléfono** de contacto | `CONTACTO` en `sitio.ts` | El pie muestra la etiqueta de pendiente |
| **Redes sociales** del negocio | `REDES` en `sitio.ts` | La barra lateral solo lleva la marca y el botón de compartir; `/comunidad` lo dice |
| **Dominio** | `URL_BASE` en `sitio.ts` | Provisional. Afecta a canónicas, `og:url` y sitemap |
| **Sedes presenciales** confirmadas | `src/features/destinos/data/destinos.json` | Las dos tarjetas llevan `"disponible": false` y lo indican |
| **Reseñas de estudiantes** | sin sección todavía | No hay sección de reseñas. **Se transcriben de fuentes reales, no se inventan** |

## 2. Credenciales

- **PayPal**: cuenta de negocio verificada para las credenciales de
  producción. Hoy el código está preparado para sandbox.
  Ver [`docs/variables-de-entorno.md`](docs/variables-de-entorno.md).
- **Calendario**: falta decidir el proveedor (los candidatos hablados son
  Cal.com y Google Calendar). El adaptador está escrito con el contrato ya
  firmado en `src/features/reservas/lib/calendario/remoto.ts`; conectarlo es
  rellenar tres métodos y cambiar una línea en `calendario/index.ts`.

## 3. Contenido

- **Artículos del blog**: la maquinaria está completa y hay **dos artículos de
  ejemplo** escritos sobre hechos verificables del español costarricense
  («pura vida» y el voseo). Todo lo que sea experiencia personal del profesor
  o de sus estudiantes **lo escribe él**.
- **Audio de los tiquismos**: el componente los contempla; faltan las
  grabaciones del profesor.
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
a 16 KB y la puntuación no se movió (87 antes, 87 despues del cambio de peso). Lo que pesa es la
cadena de latencia que Lighthouse simula en móvil — 150 ms de ida y vuelta y
CPU cuatro veces más lenta.

Las tres salidas posibles, en orden de coste:

1. **Aceptar 87 en móvil.** Es una puntuación normal para una página con foto
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
- Navbar de tres estados con CLS 0, verificado en el navegador.
- Conversión de husos horarios Suiza↔Costa Rica con tests del cambio de
  horario de verano.
- Puerto de calendario con adaptador local funcionando y remoto contratado.
- Rutas de PayPal con el monto validado en servidor.
- Metadatos completos verificados por script en `postbuild` (26 páginas).
- Paleta 70/30/10 con contraste WCAG AA medido y verificado por script.
- Preguntas frecuentes con `<details>` nativos y JSON-LD de `FAQPage`.
  Las cuatro preguntas cuya respuesta depende de un dato sin confirmar se
  muestran con la etiqueta de pendiente y **quedan fuera del JSON-LD**.
- Olas animadas cerrando el hero, en bucle sin costura y solo con
  `transform`.
- 63 tests en verde.
