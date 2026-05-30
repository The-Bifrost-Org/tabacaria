"use client";
import { useEffect, useState, useRef } from "react";
import type { ProductWithRelations } from "@/types";
import { useCart } from "@/components/cart/CartProvider";

export function FeaturedProducts() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/products");
      const data: ProductWithRelations[] = await res.json();
      const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 10);
      setProducts(shuffled);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <section className="py-8">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex-1" />
        <h2 className="text-xl font-bold text-ink-primary font-['Playfair_Display']">
          Produtos em Destaque
        </h2>
         <div className="flex-1 flex justify-end">
          <a href="/catalogo" className="text-sm text-[#C9A84C] font-medium hover:underline">
            Ver todos →
          </a>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-[#E8E5DF] rounded-full shadow flex items-center justify-center hover:bg-[#F0EDE7] transition-colors"
        >
          ‹
        </button>

        {loading ? (
          <div className="flex gap-4 px-10 overflow-x-auto scrollbar-hide">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[200px] rounded-xl bg-white shadow-sm overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div ref={scrollRef} className="flex gap-4 px-10 overflow-x-auto scrollbar-hide pb-2">
            {products.map((product) => (
              <div
                key={product.id}
                className={`flex-shrink-0 w-[200px] bg-white rounded-xl shadow-sm border border-[#E8E5DF] overflow-hidden relative ${
                  !product.available ? "opacity-60" : ""
                }`}
              >
                <div className="w-full h-48 bg-[#F0EDE7] overflow-hidden">
  {product.imageUrl ? (
    <img
      src={product.imageUrl}
      alt={product.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-5xl">
      🪴
    </div>
  )}
</div>
                <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                  product.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {product.available ? "Disponível" : "Esgotado"}
                </span>

                <div className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-primary line-clamp-2">{product.name}</p>
                    <p className="text-[#C9A84C] font-bold text-base mt-1">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <button
                    disabled={!product.available}
                    onClick={() => addToCart({productId: product.id, name: product.name, unitPrice: product.price, qty: 1 })}
                    className="w-9 h-9 rounded-full bg-[#C9A84C] text-white text-xl font-bold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#E8C97A] transition-colors flex-shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => scrollRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-[#E8E5DF] rounded-full shadow flex items-center justify-center hover:bg-[#F0EDE7] transition-colors"
        >
          ›
        </button>
      </div>
    </section>
  );
}