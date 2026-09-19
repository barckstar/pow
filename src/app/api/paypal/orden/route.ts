import { z } from "zod";
import { crearOrden, PagosNoConfigurados } from "@/features/pagos/lib/paypal";

export const dynamic = "force-dynamic";

/**
 * El cuerpo NO lleva monto. A propósito.
 *
 * El importe del depósito lo pone el servidor desde la configuración. Si
 * viniera del cliente, cualquiera podría editarlo antes de enviarlo y
 * reservar una clase por un céntimo.
 */
const esquemaCuerpo = z
  .object({
    /** Instante ISO de la franja elegida, solo como referencia del pago. */
    inicio: z.string().datetime(),
  })
  .strict();

export async function POST(peticion: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await peticion.json();
  } catch {
    return Response.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const resultado = esquemaCuerpo.safeParse(cuerpo);
  if (!resultado.success) {
    return Response.json(
      { error: "Petición inválida", detalle: resultado.error.issues },
      { status: 400 }
    );
  }

  try {
    const orden = await crearOrden(`clase-${resultado.data.inicio}`);
    return Response.json({ id: orden.id });
  } catch (error) {
    if (error instanceof PagosNoConfigurados) {
      // 503 y no 500: no es un fallo, es que todavía no está montado.
      return Response.json({ error: error.message }, { status: 503 });
    }

    console.error("Error creando la orden de PayPal:", error);
    return Response.json(
      { error: "No se pudo crear la orden" },
      { status: 502 }
    );
  }
}
