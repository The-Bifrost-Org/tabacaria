import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const variation = await prisma.variation.update({
    where: { id: params.id },
    data: { available: body.available }
  });
  return NextResponse.json(variation);
}
