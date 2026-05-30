import { NextResponse } from "next/server";
import { list, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const token = process.env.BLOB_READ_WRITE_TOKEN;

export async function GET() {
  const { blobs } = await list({ token });

  const [products, variations, productImages] = await Promise.all([
    prisma.product.findMany({ select: { imageUrl: true } }),
    prisma.variation.findMany({ select: { imageUrl: true } }),
    prisma.productImage.findMany({ select: { url: true } })
  ]);

  const usedUrls = new Set([
    ...products.map((p) => p.imageUrl).filter(Boolean),
    ...variations.map((v) => v.imageUrl).filter(Boolean),
    ...productImages.map((i) => i.url)
  ]);

  const images = blobs.map((blob) => ({
    url: blob.url,
    pathname: blob.pathname,
    size: blob.size,
    uploadedAt: blob.uploadedAt,
    inUse: usedUrls.has(blob.url)
  }));

  return NextResponse.json(images);
}

export async function DELETE(req: Request) {
  const { urls } = await req.json();
  await Promise.all(urls.map((url: string) => del(url, { token })));
  return NextResponse.json({ ok: true, deleted: urls.length });
}
