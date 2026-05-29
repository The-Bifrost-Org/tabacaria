import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { featured: true, available: true },
    include: {
      category: true,
      variations: true,
      images: { orderBy: { order: "asc" } }
    },
    orderBy: { order: "asc" }
  });
  return NextResponse.json(products);
}
