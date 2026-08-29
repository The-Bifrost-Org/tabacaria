import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { type, message, name, rating, honeypot } = await req.json();

  if (honeypot) return NextResponse.json({ ok: true });

  if (!message?.trim()) {
    return NextResponse.json(
      { error: "Mensagem obrigatória" },
      { status: 400 }
    );
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.feedback.count({
    where: { type, createdAt: { gte: oneHourAgo } }
  });
  if (recent >= 10) return NextResponse.json({ ok: true });

  await prisma.feedback.create({
    data: {
      type,
      message,
      name,
      rating: type === "feedback" && rating ? Number(rating) : null
    }
  });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(feedbacks);
}
