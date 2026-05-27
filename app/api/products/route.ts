import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variations: true,
      images: { orderBy: { order: "asc" } }
    },
    orderBy: { order: "asc" }
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      adminNote: body.adminNote,
      price: body.price,
      imageUrl: body.imageUrl,
      available: body.available ?? true,
      category: { connect: { id: body.categoryId } },
      variations:
        body.variations?.length > 0
          ? {
              create: body.variations.map((v: any, i: number) => ({
                name: v.name,
                price: v.price,
                imageUrl: v.imageUrl ?? null,
                order: i
              }))
            }
          : undefined
    },
    include: {
      category: true,
      variations: true,
      images: { orderBy: { order: "asc" } }
    }
  });
  return NextResponse.json(product);
}
