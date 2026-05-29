"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { useCart } from "@/components/cart/CartProvider";

interface FlashSaleItem {
  id: string;
  productId: string;
  variationId: string | null;
  originalPrice: number;
  salePrice: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    images: { url: string }[];
    variations: { id: string; name: string; price: number }[];
  };
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
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function update() {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Encerrada");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  return timeLeft;
}

export function FlashSaleBanner() {
  const { addToCart } = useCart();
  const [sale, setSale] = useState<FlashSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/flash-sale/active")
      .then((r) => r.json())
      .then((data) => {
        setSale(data);
        setLoading(false);
      });
  }, []);

  const timeLeft = useCountdown(sale?.endAt ?? "");

  function handleAdd(item: FlashSaleItem) {
    addToCart({
      productId: item.productId,
      name: item.product.name,
      unitPrice: item.salePrice,
      qty: 1,
      variation: item.variation?.name
    });
    setAdded(item.id);
    setTimeout(() => setAdded(null), 1500);
  }

  if (loading || !sale) return null;

  return (
    <div className="mx-4 mt-4 bg-ink-primary rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h2 className="font-display font-bold text-white text-lg">
              {sale.title}
            </h2>
          </div>
          {sale.description && (
            <p className="text-xs text-white/70 mt-0.5">{sale.description}</p>
          )}
        </div>
        {/* Countdown */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-white/60 mb-1">Termina em</p>
          <div className="font-mono font-bold text-gold text-xl tracking-widest">
            {timeLeft}
          </div>
        </div>
      </div>

      {/* Itens */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-5">
        {sale.items.map((item) => {
          const discount = Math.round(
            ((item.originalPrice - item.salePrice) / item.originalPrice) * 100
          );
          const img = item.product.images?.[0]?.url ?? item.product.imageUrl;
          const isAdded = added === item.id;

          return (
            <div
              key={item.id}
              className="flex-shrink-0 w-40 bg-white/10 rounded-xl overflow-hidden"
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
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    🪄
                  </div>
                )}
                {/* Badge desconto */}
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  -{discount}%
                </span>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-white text-xs font-medium leading-snug line-clamp-2 mb-1">
                  {item.product.name}
                  {item.variation ? ` (${item.variation.name})` : ""}
                </p>
                <p className="text-white/50 text-xs line-through">
                  R$ {item.originalPrice.toFixed(2).replace(".", ",")}
                </p>
                <p className="text-gold font-bold text-sm mb-2">
                  R$ {item.salePrice.toFixed(2).replace(".", ",")}
                </p>
                <button
                  onClick={() => handleAdd(item)}
                  className={clsx(
                    "w-full py-1.5 rounded-lg text-xs font-bold transition-all",
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
  );
}
