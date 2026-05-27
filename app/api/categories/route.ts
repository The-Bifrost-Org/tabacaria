import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" }
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { name, slug } = await req.json();

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug já existe" }, { status: 400 });
  }

  const count = await prisma.category.count();
  const category = await prisma.category.create({
    data: { name, slug, order: count }
  });
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
