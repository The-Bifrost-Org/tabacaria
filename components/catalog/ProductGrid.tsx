"use client";

import { useMemo, useState } from "react";
import type { ProductWithRelations } from "@/types";
import type { Category } from "@prisma/client";
import { ProductCard } from "./ProductCard";
import { CategoryFilter } from "./CategoryFilter";

interface Props {
  products: ProductWithRelations[];
  categories: Category[];
}

export function ProductGrid({ products, categories }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = selected
      ? products.filter((p) => p.category.slug === selected)
      : products;

    if (search.trim()) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [products, selected, search]);

  return (
    <>
      <CategoryFilter
        categories={categories}
        selected={selected}
        onSelect={setSelected}
        onSearch={setSearch}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-ink-muted">
          <span className="text-5xl mb-4">📦</span>
          <p className="text-sm">
            {search ? `Nenhum produto encontrado para "${search}"` : "Nenhum produto nesta categoria"}
          </p>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 py-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}