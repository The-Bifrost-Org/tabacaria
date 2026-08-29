import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { code, subtotal, increment } = await req.json();

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() }
  });

  if (!coupon) {
    return NextResponse.json(
      { error: "Cupom não encontrado" },
      { status: 404 }
    );
  }

  if (!coupon.active) {
    return NextResponse.json({ error: "Cupom inativo" }, { status: 400 });
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return NextResponse.json({ error: "Cupom expirado" }, { status: 400 });
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "Cupom esgotado" }, { status: 400 });
  }

  const discount =
    coupon.type === "percent"
      ? (subtotal * coupon.discount) / 100
      : coupon.discount;

  const discountAmount = Math.min(discount, subtotal);

  if (increment) {
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } }
    });
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    discount: coupon.discount,
    discountAmount,
    id: coupon.id
  });
}
