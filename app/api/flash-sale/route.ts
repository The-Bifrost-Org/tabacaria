import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sales = await prisma.flashSale.findMany({
    include: {
      items: {
        include: {
          product: { include: { images: true } },
          variation: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(sales);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const sale = await prisma.flashSale.create({
    data: {
      title: body.title,
      description: body.description,
      startAt: new Date(body.startAt),
      endAt: new Date(body.endAt),
      active: body.active ?? true,
      items: {
        create: body.items.map((item: any) => ({
          productId: item.productId,
          variationId: item.variationId ?? null,
          originalPrice: item.originalPrice,
          salePrice: item.salePrice
        }))
      }
    },
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
