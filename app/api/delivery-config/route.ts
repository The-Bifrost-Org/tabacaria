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

  // Verifica horário limite
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);
  const withinTime = timeStr <= cutoffTime;

  return NextResponse.json({
    enabled: isEnabled && withinTime,
    manualEnabled: isEnabled,
    cutoff: cutoffTime,
    withinTime,
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