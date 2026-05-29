import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const sale = await prisma.flashSale.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: { include: { images: true } },
          variation: true
        }
      }
    }
  });
  if (!sale) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sale);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const data: any = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.startAt !== undefined) data.startAt = new Date(body.startAt);
  if (body.endAt !== undefined) data.endAt = new Date(body.endAt);
  if (body.active !== undefined) data.active = body.active;

  if (body.items !== undefined) {
    data.items = {
      deleteMany: {},
      create: body.items.map((item: any) => ({
        productId: item.productId,
        variationId: item.variationId ?? null,
        originalPrice: item.originalPrice,
        salePrice: item.salePrice
      }))
    };
  }

  const sale = await prisma.flashSale.update({
    where: { id: params.id },
    data,
    include: {
      items: {
        include: {
          product: { include: { images: true } },
          variation: true
        }
      }
    }
  });
  return NextResponse.json(sale);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.flashSale.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
