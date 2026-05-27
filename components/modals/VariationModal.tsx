"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { ProductWithRelations } from "@/types";
import { useCart } from "@/components/cart/CartProvider";

interface Props {
  product: ProductWithRelations;
  onClose: () => void;
}

export function VariationModal({ product, onClose }: Props) {
  const { addToCart } = useCart();
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(
    null
  );
  const [qty, setQty] = useState(1);

  const availableVariations = product.variations.filter((v) => v.available);
  const selectedVariation = product.variations.find(
    (v) => v.id === selectedVariationId
  );

  function handleAdd() {
    if (!selectedVariation) return;
    addToCart({
      productId: product.id,
      name: product.name,
      unitPrice: selectedVariation.price,
      qty,
      variation: selectedVariation.name
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-2xl p-6 w-full max-w-md animate-slide-up md:animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-ink-primary pr-4">
            {product.name}
          </h3>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Variações */}
        <p className="text-sm text-ink-secondary mb-3 font-medium">
          Escolha a variação:
        </p>
        <div className="space-y-2 mb-6">
          {product.variations.map((v) => (
            <button
              key={v.id}
              onClick={() => v.available && setSelectedVariationId(v.id)}
              disabled={!v.available}
              className={clsx(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all",
                !v.available
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                  : selectedVariationId === v.id
                    ? "border-gold bg-amber-50 ring-2 ring-gold"
                    : "border-brand-border hover:border-gold"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    "font-medium",
                    !v.available ? "text-ink-muted" : "text-ink-primary"
                  )}
                >
                  {v.name}
                </span>
                {!v.available && (
                  <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                    Esgotado
                  </span>
                )}
              </div>
              <span
                className={clsx(
                  "font-bold",
                  !v.available ? "text-ink-muted" : "text-gold"
                )}
              >
                R$ {v.price.toFixed(2).replace(".", ",")}
              </span>
            </button>
          ))}
        </div>

        {/* Quantidade */}
        <p className="text-sm text-ink-secondary mb-3 font-medium">
          Quantidade:
        </p>
        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center text-lg font-bold text-ink-secondary hover:border-gold transition-colors"
          >
            −
          </button>
          <span className="text-xl font-bold text-ink-primary w-8 text-center">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center text-lg font-bold text-ink-secondary hover:border-gold transition-colors"
          >
            +
          </button>
        </div>

        {/* Botão adicionar */}
        <button
          onClick={handleAdd}
          disabled={!selectedVariation}
          className={clsx(
            "w-full py-3 rounded-xl font-semibold text-sm transition-colors",
            selectedVariation
              ? "bg-gold hover:bg-gold-dark text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          {selectedVariation
            ? `Adicionar — R$ ${(selectedVariation.price * qty).toFixed(2).replace(".", ",")}`
            : "Selecione uma variação"}
        </button>
      </div>
    </div>
  );
}
