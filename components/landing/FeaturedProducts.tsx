"use client";

import { useEffect, useState, useRef } from "react";
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

  useEffect(() => {
    fetch("/api/products/featured")
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); });
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-14 bg-brand-bg">
      {/* Título */}
      <div className="px-6 mb-8 flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex-1" />
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-gold mb-1">Selecionados para você</p>
          <h2 className="text-2xl md:text-3xl font-bold text-ink-primary font-['Playfair_Display']">
            Produtos em Destaque
          </h2>
        </div>
        <div className="flex-1 flex justify-end">
          <a href="/catalogo" className="text-sm text-gold font-medium hover:underline transition-colors">
            Ver todos →
          </a>
        </div>
      </div>

      {/* Carrossel */}
      <div className="relative max-w-[1600px] mx-auto">
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: -240, behavior: "smooth" })}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-brand-border rounded-full shadow-md flex items-center justify-center hover:bg-brand-bg hover:shadow-lg transition-all text-lg"
        >
          ‹
        </button>

        {loading ? (
          <div className="flex gap-5 px-12 overflow-x-auto scrollbar-hide">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[220px] rounded-2xl bg-white shadow-sm overflow-hidden animate-pulse">
                <div className="w-full h-52 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div ref={scrollRef} className="flex gap-5 px-12 overflow-x-auto scrollbar-hide pb-2">
            {products.map((product) => {
              const img = product.images?.[0]?.url ?? product.imageUrl;
              return (
                <div
                  key={product.id}
                  onClick={() => setSelected(product)}
                  className={clsx(
                    "flex-shrink-0 w-[220px] bg-white rounded-2xl shadow-sm border border-brand-border overflow-hidden relative cursor-pointer group transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                    !product.available && "opacity-60"
                  )}
                >
                  {/* Imagem */}
                  <div className="w-full h-52 bg-brand-bg overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🪄</div>
                    )}
                  </div>

                  {/* Badge disponível */}
                  <span className={clsx(
                    "absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm",
                    product.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  )}>
                    {product.available ? "Disponível" : "Esgotado"}
                  </span>

                  {/* Badge destaque */}
                  <span className="absolute top-3 right-3 text-base drop-shadow">👑</span>

                  <div className="p-4 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-primary line-clamp-2 leading-snug">
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
                          addToCart({ productId: product.id, name: product.name, unitPrice: product.price, qty: 1 });
                        }
                      }}
                      className="w-10 h-10 rounded-full bg-gold text-white text-xl font-bold flex items-center justify-center disabled:opacity-40 hover:bg-gold-dark transition-all hover:scale-110 flex-shrink-0 shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => scrollRef.current?.scrollBy({ left: 240, behavior: "smooth" })}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-brand-border rounded-full shadow-md flex items-center justify-center hover:bg-brand-bg hover:shadow-lg transition-all text-lg"
        >
          ›
        </button>
      </div>

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}