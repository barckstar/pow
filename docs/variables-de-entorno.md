# Variables de entorno

**Hoy hace falta una, y no es un secreto.** El sitio compila, corre y se
despliega sin ninguna; con ella, la reserva en línea se enciende.

La plantilla está en [`env.example`](../env.example), en la raíz. Se copia y se
rellena la copia:

```bash
cp env.example .env.local
```

`.env.local` está en el `.gitignore` y no sube nunca. El `.gitignore` cubre
además `.env.*`, `*.env`, `*.pem` y `*.key`, porque un secreto se filtra por la
variante que nadie listó.

> Se llama `env.example` sin punto porque el workspace bloquea escribir
> cualquier archivo que empiece por `.env` — y esa regla es buena: es lo que
> impide que un valor real se cuele por descuido.

No siempre fue así, y el cambio merece una línea: la reserva llegó a estar
construida aquí dentro —selector de franjas, rutas de servidor para PayPal y
las credenciales que eso pedía— y ahora la lleva **Calendly** entera. Con ella
se fueron las dos claves de PayPal y la del calendario.

---

## Lo que sí hay que configurar, y dónde

Dos variables, y tres cosas que se configuran en paneles ajenos.

### Las que lee el código

| Variable | Qué es | Si falta |
|---|---|---|
| `URL_BASE` | El dominio del que cuelgan canónicas, sitemap y RSS | se usa el provisional de `sitio.ts` |

Una sola, y **rompe el build si se pega mal**.

Los enlaces de Calendly **ya no son variable de entorno**: viven en
`src/features/reservas/data/clases.json`, porque son varios —uno por duración
de clase— y cada uno lleva etiqueta y descripción. Eso es contenido, y el
contenido de este sitio va en `.json` validado.

`URL_BASE` existe porque cambia según dónde corra: en una previsualización de
Vercel el dominio es otro, y ahí las canónicas tienen que apuntar a esa
preview. Con el valor escrito en el código, una preview se anuncia como si
fuera el sitio de verdad — que es como Google acaba indexando una preview.

### Lo que se configura fuera del repositorio

| Qué | Dónde |
|---|---|
| Cobro del depósito | Calendly → Payments → PayPal |
| Enlace de la videollamada | Calendly → Integrations → Zoom |
| Monto del depósito | Calendly, y además `DEPOSITO` en `sitio.ts` para enseñarlo |

El monto aparece **dos veces a propósito**: Calendly es quien cobra, y
`DEPOSITO` es lo que el sitio le enseña al visitante en `/pricing` antes de
que llegue a reservar. Si se cambia uno hay que cambiar el otro — es el único
dato duplicado del proyecto y está aquí anotado para que no se olvide.

## Por qué ese `NEXT_PUBLIC_`

Porque el valor **tiene que llegar al navegador**: es la URL a la que apunta el
widget y acaba en el HTML de todas formas. No hay nada que esconder.

Ese prefijo es también **cómo se filtran las claves en Next**, así que conviene
tenerlo claro: un secreto de verdad va sin prefijo, se lee solo en el servidor
y no se toca desde un componente de cliente. Aquí no hay ninguno.

## Si lo pegás mal, rompe el build

`comprobarCalendly()` en `src/shared/config/sitio.ts` valida el enlace al
importar. Caza los dos errores de verdad:

- **Pegar un token.** Calendly llama «API» tanto a la clave como a los enlaces
  en su panel, y es la confusión más fácil de tener.
- **Pegar la URL del panel** (`calendly.com/event_types/…` o
  `calendly.com/app/…`). Encaja en el patrón de dos segmentos, es la que uno
  tiene en la barra mientras configura el evento, y embebida carga una pantalla
  de login.

El mensaje del error dice cuál es la buena.

## Lo que hace falta de Calendly

Cobrar dentro del flujo de reserva y conectar Zoom **son funciones de plan de
pago**. Hay que comprobar qué nivel cubre las dos antes de contratar: sin
cobro, cualquiera aparta una franja sin pagar, que es justo lo que el cliente
pidió evitar.

## Qué pasa mientras no esté

Mientras `CALENDLY` sea `null`, `/book` explica los tres pasos y dice que
todavía no se puede reservar en línea, con la etiqueta amarilla de pendiente.
No se pinta un calendario que no aparta nada.

## Si algún día vuelve el PayPal propio

La implementación anterior —rutas de servidor con el monto validado siempre en
el servidor, nunca aceptando el del cliente— está en el historial, en el commit
`0dcca7e`. Las claves que pedía eran `PAYPAL_CLIENT_ID`,
`PAYPAL_CLIENT_SECRET` y `PAYPAL_ENTORNO`.

> El workspace prohíbe tocar archivos `.env*`, así que si algún día hacen falta
> variables, se documentan aquí y el `.env.local` se crea a mano.
