"use client";

import { useState, useMemo } from "react";
import type { Category } from "@prisma/client";
import { clsx } from "clsx";

interface Props {
  categories: Category[];
  onSelect: (slug: string | null) => void;
  selected: string | null;
  onSearch?: (term: string) => void;
}

export function CategoryFilter({ categories, onSelect, selected, onSearch }: Props) {
  const [search, setSearch] = useState("");

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [categories]);

  function handleSearch(value: string) {
    setSearch(value);
    onSearch?.(value);
  }

  return (
    <div className="sticky top-16 z-30 bg-white border-b border-brand-border">
      <div className="max-w-[1600px] mx-auto">
        {/* Barra de pesquisa */}
        <div className="px-6 pt-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Pesquisar produto..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-border text-sm outline-none focus:border-gold bg-brand-bg transition-colors"
            />
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Categorias */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-6 py-3">
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

          {sortedCategories.map((cat) => (
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
    </div>
  );
}