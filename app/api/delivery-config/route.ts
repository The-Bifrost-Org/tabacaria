import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export async function GET() {
  const [enabled, cutoff] = await Promise.all([
    prisma.storeConfig.findUnique({ where: { key: "delivery_enabled" } }),
    prisma.storeConfig.findUnique({ where: { key: "delivery_cutoff" } }),
  ]);

  const cutoffTime = cutoff?.value ?? "20:00";
  const isEnabled = enabled?.value === "true";

  // Usa horário de Brasília (UTC-3) independente do servidor
  const now = new Date();
  const brasiliaOffset = -3 * 60; // UTC-3 em minutos
  const localMinutes = now.getUTCHours() * 60 + now.getUTCMinutes() + brasiliaOffset;
  const localHours = Math.floor(((localMinutes % 1440) + 1440) % 1440 / 60);
  const localMins = ((localMinutes % 1440) + 1440) % 1440 % 60;
  const timeStr = `${String(localHours).padStart(2, "0")}:${String(localMins).padStart(2, "0")}`;

  // Desativa SOMENTE a partir do horário limite (não antes)
  const withinTime = timeStr < cutoffTime;

  return NextResponse.json({
    enabled: isEnabled && withinTime,
    manualEnabled: isEnabled,
    cutoff: cutoffTime,
    withinTime,
    serverTime: timeStr, // útil para debug
  }, {
    headers: { "Cache-Control": "no-store" }
  });
}

export async function PATCH(req: Request) {
  const body = await req.json();

  if (body.enabled !== undefined) {
    await prisma.storeConfig.upsert({
      where: { key: "delivery_enabled" },
      update: { value: String(body.enabled) },
      create: { key: "delivery_enabled", value: String(body.enabled) },
    });
  }

  if (body.cutoff !== undefined) {
    await prisma.storeConfig.upsert({
      where: { key: "delivery_cutoff" },
      update: { value: body.cutoff },
      create: { key: "delivery_cutoff", value: body.cutoff },
    });
  }

  return NextResponse.json({ ok: true });
}