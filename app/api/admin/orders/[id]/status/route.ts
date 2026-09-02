// app/api/admin/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildStatusMessage } from "@/lib/whatsapp";
import { requireAdmin } from "../../../auth/route";

const TIMESTAMP_FIELD: Record<string, string> = {
  CONFIRMADO: "confirmedAt",
  PRONTO_RETIRADA: "readyAt",
  A_CAMINHO: "readyAt",
  FINALIZADO: "finishedAt",
  CANCELADO: "cancelledAt"
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { status } = await request.json();

  const validStatuses = [
    "RECEBIDO",
    "CONFIRMADO",
    "PRONTO_RETIRADA",
    "A_CAMINHO",
    "FINALIZADO",
    "CANCELADO"
  ];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const timestampField = TIMESTAMP_FIELD[status];

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status,
      ...(timestampField ? { [timestampField]: new Date() } : {})
    }
  });

  const whatsappUrl = buildStatusMessage(order, status);

  return NextResponse.json({ order, whatsappUrl });
}
