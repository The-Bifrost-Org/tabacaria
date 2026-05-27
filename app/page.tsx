import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { ProductGrid } from "@/components/catalog/ProductGrid";

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
    <div className="min-h-screen bg-brand-bg pb-24">
      <Header />
      <ProductGrid products={products} categories={categories} />
    </div>
  );
}
