import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, variations: true }
  });
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.price !== undefined) data.price = body.price;
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
  if (body.available !== undefined) data.available = body.available;
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;

  if (body.variations !== undefined) {
    data.variations = {
      deleteMany: {},
      create: body.variations.map((v: any, i: number) => ({
        name: v.name,
        price: v.price,
        order: i
      }))
    };
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data,
    include: { category: true, variations: true }
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}


