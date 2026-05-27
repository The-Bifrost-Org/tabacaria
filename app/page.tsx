import { prisma } from "@/lib/prisma";

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, variations: true },
      orderBy: { order: "asc" }
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" }
    })
  ]);

  return (
    <main className="min-h-screen bg-brand-bg">
      <h1 className="font-display text-2xl font-bold text-center py-8 text-ink-primary">
        Catálogo
      </h1>
      <pre className="p-4 text-xs text-ink-secondary">
        {JSON.stringify({ products, categories }, null, 2)}
      </pre>
    </main>
  );
}
