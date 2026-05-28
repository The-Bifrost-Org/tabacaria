import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const data: any = {};
  if (body.code !== undefined) data.code = body.code.toUpperCase().trim();
  if (body.discount !== undefined) data.discount = Number(body.discount);
  if (body.type !== undefined) data.type = body.type;
  if (body.active !== undefined) data.active = body.active;
  if (body.maxUses !== undefined)
    data.maxUses = body.maxUses ? Number(body.maxUses) : null;
  if (body.expiresAt !== undefined)
    data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  const coupon = await prisma.coupon.update({
    where: { id: params.id },
    data
  });
  return NextResponse.json(coupon);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.coupon.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
