import { DEPOSITO } from "@/shared/config/sitio";

/**
 * Cliente de la API REST de PayPal.
 *
 * Todo esto corre EN EL SERVIDOR. El `client secret` no sale de aquí: si
 * llegara al navegador, cualquiera podría crear órdenes en nombre del
 * negocio.
 */

const BASES = {
  sandbox: "https://api-m.sandbox.paypal.com",
  produccion: "https://api-m.paypal.com",
} as const;

export type EntornoPayPal = keyof typeof BASES;

export class PagosNoConfigurados extends Error {
  constructor(motivo: string) {
    super(motivo);
    this.name = "PagosNoConfigurados";
  }
}

function credenciales(): {
  id: string;
  secreto: string;
  entorno: EntornoPayPal;
} {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secreto = process.env.PAYPAL_CLIENT_SECRET;
  const entorno = (process.env.PAYPAL_ENTORNO ?? "sandbox") as EntornoPayPal;

  if (!id || !secreto) {
    throw new PagosNoConfigurados(
      "Faltan PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET. Ver .env.example."
    );
  }

  if (!(entorno in BASES)) {
    throw new PagosNoConfigurados(
      `PAYPAL_ENTORNO debe ser "sandbox" o "produccion", no "${entorno}".`
    );
  }

  return { id, secreto, entorno };
}

async function token(): Promise<{ valor: string; base: string }> {
  const { id, secreto, entorno } = credenciales();
  const base = BASES[entorno];

  const respuesta = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secreto}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!respuesta.ok) {
    throw new Error(`PayPal rechazó las credenciales (${respuesta.status})`);
  }

  const datos = (await respuesta.json()) as { access_token: string };
  return { valor: datos.access_token, base };
}

/**
 * El monto del depósito lo decide SIEMPRE el servidor.
 *
 * Nunca se acepta el que manda el cliente: si se aceptara, cualquiera podría
 * abrir las herramientas del navegador y reservar una clase por un céntimo.
 */
export function depositoObligatorio(): { monto: number; moneda: string } {
  if (!DEPOSITO) {
    throw new PagosNoConfigurados(
      "El monto del depósito no está confirmado por el cliente. Ver PENDIENTE.md."
    );
  }
  return DEPOSITO;
}

export async function crearOrden(referencia: string): Promise<{ id: string }> {
  const { monto, moneda } = depositoObligatorio();
  const { valor, base } = await token();

  const respuesta = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${valor}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: referencia,
          amount: { currency_code: moneda, value: monto.toFixed(2) },
        },
      ],
    }),
    cache: "no-store",
  });

  if (!respuesta.ok) {
    throw new Error(`PayPal no pudo crear la orden (${respuesta.status})`);
  }

  const datos = (await respuesta.json()) as { id: string };
  return { id: datos.id };
}

export async function capturarOrden(
  idOrden: string
): Promise<{ id: string; estado: string }> {
  const { valor, base } = await token();

  const respuesta = await fetch(
    `${base}/v2/checkout/orders/${encodeURIComponent(idOrden)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${valor}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!respuesta.ok) {
    throw new Error(`PayPal no pudo capturar la orden (${respuesta.status})`);
  }

  const datos = (await respuesta.json()) as { id: string; status: string };
  return { id: datos.id, estado: datos.status };
}
