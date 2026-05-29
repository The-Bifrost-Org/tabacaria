"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import type { ProductWithRelations } from "@/types";
import { useCart } from "@/components/cart/CartProvider";
import { ProductModal } from "@/components/modals/ProductModal";

export function FeaturedProducts() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ProductWithRelations | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products/featured")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex-1" />
        <h2 className="text-xl font-bold text-ink-primary font-display">
          Produtos em Destaque
        </h2>
        <div className="flex-1 flex justify-end">
          <a
            href="/catalogo"
            className="text-sm text-gold font-medium hover:underline"
          >
            Ver todos →
          </a>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() =>
            scrollRef.current?.scrollBy({ left: -220, behavior: "smooth" })
          }
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-brand-border rounded-full shadow flex items-center justify-center hover:bg-brand-bg transition-colors"
        >
          ‹
        </button>

        {loading ? (
          <div className="flex gap-4 px-10 overflow-x-auto scrollbar-hide">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[200px] rounded-xl bg-white shadow-sm overflow-hidden animate-pulse"
              >
                <div className="w-full h-48 bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 px-10 overflow-x-auto scrollbar-hide pb-2"
          >
            <div className="flex gap-4 mx-auto">
              {products.map((product) => {
                const img = product.images?.[0]?.url ?? product.imageUrl;
                return (
                  <div
                    key={product.id}
                    onClick={() => setSelected(product)}
                    className={clsx(
                      "flex-shrink-0 w-[200px] bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden relative cursor-pointer hover:shadow-md transition-shadow",
                      !product.available && "opacity-60"
                    )}
                  >
                    {/* Imagem */}
                    <div className="w-full h-48 bg-brand-bg overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          🪄
                        </div>
                      )}
                    </div>

                    {/* Badge */}
                    <span
                      className={clsx(
                        "absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full",
                        product.available
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {product.available ? "Disponível" : "Esgotado"}
                    </span>

                    {/* Badge destaque */}
                    <span className="absolute top-2 right-2 text-sm">👑</span>

                    <div className="p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-primary line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-gold font-bold text-base mt-1">
                          {product.variations.length > 0 ? "A partir de " : ""}
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      <button
                        disabled={!product.available}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.variations.length > 0) {
                            setSelected(product);
                          } else {
                            addToCart({
                              productId: product.id,
                              name: product.name,
                              unitPrice: product.price,
                              qty: 1
                            });
                          }
                        }}
                        className="w-9 h-9 rounded-full bg-gold text-white text-xl font-bold flex items-center justify-center disabled:opacity-40 hover:bg-gold-dark transition-colors flex-shrink-0"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() =>
            scrollRef.current?.scrollBy({ left: 220, behavior: "smooth" })
          }
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-brand-border rounded-full shadow flex items-center justify-center hover:bg-brand-bg transition-colors"
        >
          ›
        </button>
      </div>

      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
