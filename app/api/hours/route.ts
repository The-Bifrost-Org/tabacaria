import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado"
];

export async function GET() {
  const hours = await prisma.storeHours.findMany({
    orderBy: { dayOfWeek: "asc" }
  });

  // Se não tiver nenhum, cria os 7 dias com horário padrão
  if (hours.length === 0) {
    const defaults = DAYS.map((_, i) => ({
      dayOfWeek: i,
      openTime: "09:00",
      closeTime: "22:00",
      active: i !== 0 // domingo fechado por padrão
    }));
    await prisma.storeHours.createMany({ data: defaults });
    return NextResponse.json(
      await prisma.storeHours.findMany({ orderBy: { dayOfWeek: "asc" } })
    );
  }

  return NextResponse.json(hours);
}

export async function PATCH(req: NextRequest) {
  const { id, openTime, closeTime, active } = await req.json();

  const hour = await prisma.storeHours.update({
    where: { id },
    data: { openTime, closeTime, active }
  });
  return NextResponse.json(hour);
}
