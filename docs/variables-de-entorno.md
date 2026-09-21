# Variables de entorno

**Hoy no hace falta ninguna.** El sitio compila, corre y se despliega sin un
solo secreto.

No siempre fue así, y el cambio merece una línea: la reserva llegó a estar
construida aquí dentro —selector de franjas, rutas de servidor para PayPal y
las credenciales que eso pedía— y ahora la lleva **Calendly** entera. Con ella
se fueron las dos claves de PayPal y la del calendario.

---

## Lo que sí hay que configurar, y dónde

No son variables de entorno: son cuentas y ajustes fuera del repositorio.

| Qué | Dónde se configura | Dónde entra en el código |
|---|---|---|
| Enlace del calendario | Panel de Calendly | `CALENDLY` en `src/shared/config/sitio.ts` |
| Cobro del depósito | Calendly → Payments → PayPal | nada: lo hace Calendly |
| Enlace de la videollamada | Calendly → Integrations → Zoom | nada: lo hace Calendly |
| Monto del depósito | Calendly, y además `DEPOSITO` en `sitio.ts` | `/precios`, para enseñarlo |

El monto aparece **dos veces a propósito**: Calendly es quien cobra, y
`DEPOSITO` es lo que el sitio le enseña al visitante en `/precios` antes de
que llegue a reservar. Si se cambia uno hay que cambiar el otro — es el único
dato duplicado del proyecto y está aquí anotado para que no se olvide.

## Lo que hace falta de Calendly

Cobrar dentro del flujo de reserva y conectar Zoom **son funciones de plan de
pago**. Hay que comprobar qué nivel cubre las dos antes de contratar: sin
cobro, cualquiera aparta una franja sin pagar, que es justo lo que el cliente
pidió evitar.

## Qué pasa mientras no esté

Mientras `CALENDLY` sea `null`, `/reservar` explica los tres pasos y dice que
todavía no se puede reservar en línea, con la etiqueta amarilla de pendiente.
No se pinta un calendario que no aparta nada.

## Si algún día vuelve el PayPal propio

La implementación anterior —rutas de servidor con el monto validado siempre en
el servidor, nunca aceptando el del cliente— está en el historial, en el commit
`0dcca7e`. Las claves que pedía eran `PAYPAL_CLIENT_ID`,
`PAYPAL_CLIENT_SECRET` y `PAYPAL_ENTORNO`.

> El workspace prohíbe tocar archivos `.env*`, así que si algún día hacen falta
> variables, se documentan aquí y el `.env.local` se crea a mano.
