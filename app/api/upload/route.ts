import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { error: "Nenhum arquivo enviado" },
      { status: 400 }
    );
  }

  const blob = await put(`produtos/${Date.now()}-${file.name}`, file, {
    access: "public"
  });

  return NextResponse.json({ url: blob.url });
}
