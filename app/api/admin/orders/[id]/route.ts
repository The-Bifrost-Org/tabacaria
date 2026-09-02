// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "../../auth/route";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, coupon: true }
  });

  if (!order) {
    return NextResponse.json(
      { error: "Pedido não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json({ order });
}
