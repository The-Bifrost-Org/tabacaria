import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", user.id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 horas
    path: "/"
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("admin_session");
  return res;
}
