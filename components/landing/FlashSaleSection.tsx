"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ProductModal } from "@/components/modals/ProductModal";
import type { ProductWithRelations } from "@/types";
import { clsx } from "clsx";

interface FlashSaleItem {
  id: string;
  productId: string;
  variationId: string | null;
  originalPrice: number;
  salePrice: number;
  product: ProductWithRelations;
  variation: { id: string; name: string; price: number } | null;
}

interface FlashSale {
  id: string;
  title: string;
  description: string | null;
  endAt: string;
  items: FlashSaleItem[];
}

function useCountdown(endAt: string) {
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    function update() {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: "00", m: "00", s: "00" });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0")
      });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  return timeLeft;
}

function CountdownBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-ink-primary text-gold font-mono font-bold text-2xl w-14 h-14 rounded-xl flex items-center justify-center shadow-inner">
        {value}
      </div>
      <span className="text-xs text-ink-muted mt-1">{label}</span>
    </div>
  );
}

export function FlashSaleSection() {
  const { addToCart } = useCart();
  const [sale, setSale] = useState<FlashSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ProductWithRelations | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/flash-sale/active")
      .then((r) => r.json())
      .then((data) => {
        setSale(data);
        setLoading(false);
      });
  }, []);

  const { h, m, s } = useCountdown(sale?.endAt ?? "");

  function handleAdd(item: FlashSaleItem) {
    if (item.variation) {
      addToCart({
        productId: item.productId,
        name: item.product.name,
        unitPrice: item.salePrice,
        qty: 1,
        variation: item.variation.name
      });
    } else if (item.product.variations.length > 0) {
      setSelected(item.product);
      return;
    } else {
      addToCart({
        productId: item.productId,
        name: item.product.name,
        unitPrice: item.salePrice,
        qty: 1
      });
    }
    setAdded(item.id);
    setTimeout(() => setAdded(null), 1500);
  }

  if (loading || !sale) return null;

  return (
    <section className="py-8 px-4">
      {/* Card principal */}
      <div className="bg-ink-primary rounded-3xl overflow-hidden shadow-xl">
        {/* Header com countdown */}
        <div className="px-6 pt-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">⚡</span>
              <h2 className="font-display text-2xl font-bold text-white">
                {sale.title}
              </h2>
            </div>
            {sale.description && (
              <p className="text-white/60 text-sm">{sale.description}</p>
            )}
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-white/50 text-xs uppercase tracking-widest">
              Termina em
            </p>
            <div className="flex items-end gap-2">
              <CountdownBlock value={h} label="horas" />
              <span className="text-gold font-bold text-2xl mb-3">:</span>
              <CountdownBlock value={m} label="min" />
              <span className="text-gold font-bold text-2xl mb-3">:</span>
              <CountdownBlock value={s} label="seg" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mx-6" />

        {/* Produtos */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sale.items.map((item) => {
              const discount = Math.round(
                ((item.originalPrice - item.salePrice) / item.originalPrice) *
                  100
              );
              const img =
                item.product.images?.[0]?.url ?? item.product.imageUrl;
              const isAdded = added === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelected(item.product)}
                  className="bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] border border-white/10"
                >
                  {/* Imagem */}
                  <div className="relative aspect-square bg-white/5">
                    {img ? (
                      <img
                        src={img}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🪄
                      </div>
                    )}

                    {/* Badge desconto */}
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      -{discount}%
                    </div>

                    {/* Badge flash */}
                    <div className="absolute top-2 right-2 bg-gold text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      ⚡ Oferta
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-white text-sm font-medium line-clamp-2 mb-1">
                      {item.product.name}
                      {item.variation ? ` (${item.variation.name})` : ""}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-white/40 text-xs line-through">
                        R$ {item.originalPrice.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-gold font-bold text-base">
                        R$ {item.salePrice.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(item);
                      }}
                      className={clsx(
                        "w-full py-2 rounded-xl text-sm font-bold transition-all",
                        isAdded
                          ? "bg-green-500 text-white"
                          : "bg-gold hover:bg-gold-dark text-white"
                      )}
                    >
                      {isAdded ? "✓ Adicionado!" : "Adicionar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <a
            href="/catalogo"
            className="text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            Ver todos os produtos →
          </a>
        </div>
      </div>

      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
