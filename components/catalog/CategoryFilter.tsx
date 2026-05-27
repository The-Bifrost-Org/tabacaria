"use client";

import { useState } from "react";
import type { Category } from "@prisma/client";
import { clsx } from "clsx";

interface Props {
  categories: Category[];
  onSelect: (slug: string | null) => void;
  selected: string | null;
}

export function CategoryFilter({ categories, onSelect, selected }: Props) {
  return (
    <div className="sticky top-16 z-30 bg-white border-b border-brand-border">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3">
        <button
          onClick={() => onSelect(null)}
          className={clsx(
            "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
            selected === null
              ? "bg-gold text-white border-gold"
              : "bg-white text-ink-secondary border-brand-border hover:border-gold"
          )}
        >
          Todos
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(selected === cat.slug ? null : cat.slug)}
            className={clsx(
              "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
              selected === cat.slug
                ? "bg-gold text-white border-gold"
                : "bg-white text-ink-secondary border-brand-border hover:border-gold"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
