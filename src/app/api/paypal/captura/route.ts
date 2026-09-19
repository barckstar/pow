import { z } from "zod";
import { capturarOrden, PagosNoConfigurados } from "@/features/pagos/lib/paypal";

export const dynamic = "force-dynamic";

const esquemaCuerpo = z
  .object({
    idOrden: z.string().min(1).max(64),
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
    const captura = await capturarOrden(resultado.data.idOrden);

    if (captura.estado !== "COMPLETED") {
      return Response.json(
        { error: "El pago no se completó", estado: captura.estado },
        { status: 402 }
      );
    }

    return Response.json({ id: captura.id, estado: captura.estado });
  } catch (error) {
    if (error instanceof PagosNoConfigurados) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    console.error("Error capturando la orden de PayPal:", error);
    return Response.json(
      { error: "No se pudo capturar el pago" },
      { status: 502 }
    );
  }
}
