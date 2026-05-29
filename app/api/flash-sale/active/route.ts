import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();

  const sale = await prisma.flashSale.findFirst({
    where: {
      active: true,
      startAt: { lte: now },
      endAt: { gte: now }
    },
    include: {
      items: {
        include: {
          product: {
            include: { images: true, category: true, variations: true }
          },
          variation: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(sale);
}
