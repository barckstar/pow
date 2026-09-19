# Variables de entorno

> No hay `.env.example` en el repositorio: el workspace tiene una regla que
> prohíbe tocar archivos `.env*`. Este documento cumple la misma función.
> Creá `.env.local` a mano con estas claves.

```bash
# --- PayPal ---------------------------------------------------------------
# Solo se leen en el servidor, en src/features/pagos/lib/paypal.ts.
# Nunca llegan al navegador: si el secreto se expusiera, cualquiera podría
# crear órdenes a nombre del negocio.
#
# Se sacan de https://developer.paypal.com/dashboard/applications
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# "sandbox" o "produccion"
PAYPAL_ENTORNO=sandbox

# --- Calendario -----------------------------------------------------------
# Sin proveedor decidido todavía. Cuando lo haya, la clave va aquí y la lee
# src/features/reservas/lib/calendario/remoto.ts
CALENDARIO_API_KEY=
```

## Qué pasa si faltan

El sitio **compila y funciona sin ninguna de ellas**. Las rutas de PayPal
devuelven `503` con un mensaje explicando que los pagos no están configurados,
y la página de reserva muestra el aviso de pendiente en vez de un botón de
pago que no llevaría a ninguna parte.

Eso es deliberado: es preferible un hueco visible a un botón que falla.

## Para producción

1. Crear la app de PayPal con la cuenta de **negocio** (las credenciales de
   producción requieren cuenta verificada).
2. Poner `PAYPAL_ENTORNO=produccion`.
3. Confirmar el monto del depósito en `src/shared/config/sitio.ts` — hoy está
   en `null` a propósito.

Ver [`PENDIENTE.md`](../PENDIENTE.md) para la lista completa de lo que falta.
