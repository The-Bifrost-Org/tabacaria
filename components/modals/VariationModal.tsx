"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import type { ProductWithRelations } from "@/types";
import { useCart } from "@/components/cart/CartProvider";
import Image from "next/image";

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
  const [currentImage, setCurrentImage] = useState<string | null>(
    product.images?.[0]?.url ?? product.imageUrl ?? null
  );

  const availableVariations = product.variations.filter((v) => v.available);
  const selectedVariation = product.variations.find(
    (v) => v.id === selectedVariationId
  );

  useEffect(() => {
    if (selectedVariation?.imageUrl) {
      setCurrentImage(selectedVariation.imageUrl);
    } else {
      setCurrentImage(product.images?.[0]?.url ?? product.imageUrl ?? null);
    }
  }, [selectedVariationId]);

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
        {/* Header com imagem */}
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

        {/* Galeria de imagens */}
        {(product.images?.length > 0 || product.imageUrl) && (
          <div className="mb-4">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-2">
              <Image
                src={
                  currentImage ??
                  product.images?.[0]?.url ??
                  product.imageUrl ??
                  ""
                }
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(img.url)}
                    className={clsx(
                      "flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                      currentImage === img.url
                        ? "border-gold"
                        : "border-transparent"
                    )}
                  >
                    <img
                      src={img.url}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Observação do admin */}
        {product.adminNote && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs text-amber-700 font-medium">📌 Observação</p>
            <p className="text-sm text-ink-secondary mt-1">
              {product.adminNote}
            </p>
          </div>
        )}

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
        <div className="flex items-center justify-center gap-8 mb-6 bg-brand-bg rounded-2xl py-4">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-11 h-11 rounded-full border-2 border-brand-border bg-white flex items-center justify-center text-xl font-bold text-ink-secondary hover:border-gold hover:text-gold transition-all active:scale-90"
          >
            −
          </button>
          <span className="text-2xl font-bold text-ink-primary w-10 text-center">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-11 h-11 rounded-full bg-gold hover:bg-gold-dark flex items-center justify-center text-xl font-bold text-white transition-all active:scale-90"
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
