import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

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
  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate"
    }
  });
}
