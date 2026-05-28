import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const existing = await prisma.coupon.findUnique({
    where: { code: body.code.toUpperCase() }
  });
  if (existing) {
    return NextResponse.json({ error: "Código já existe" }, { status: 400 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: body.code.toUpperCase().trim(),
      discount: Number(body.discount),
      type: body.type,
      active: body.active ?? true,
      maxUses: body.maxUses ? Number(body.maxUses) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null
    }
  });
  return NextResponse.json(coupon);
}
