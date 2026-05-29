"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import type { ProductWithRelations } from "@/types";
import type { Category } from "@prisma/client";
import { FlashSaleBanner } from "@/components/catalog/FlashSaleBanner";

export default function CatalogPage() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories")
      ]);
      setProducts(await productsRes.json());
      setCategories(await categoriesRes.json());
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      <Header />
      <FlashSaleBanner />
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-white shadow-sm overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={products} categories={categories} />
      )}
    </div>
  );
}
