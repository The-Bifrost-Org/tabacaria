import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { type, message, name, honeypot } = await req.json();

  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!message?.trim()) {
    return NextResponse.json(
      { error: "Mensagem obrigatória" },
      { status: 400 }
    );
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.feedback.count({
    where: {
      type,
      createdAt: { gte: oneHourAgo }
    }
  });

  if (recent >= 10) {
    return NextResponse.json({ ok: true });
  }

  const feedback = await prisma.feedback.create({
    data: { type, message, name }
  });
  return NextResponse.json(feedback);
}

export async function GET() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(feedbacks);
}
