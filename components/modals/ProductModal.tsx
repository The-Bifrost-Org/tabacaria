"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import Image from "next/image";
import type { ProductWithRelations } from "@/types";
import { useCart } from "@/components/cart/CartProvider";

interface Props {
  product: ProductWithRelations;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: Props) {
  const { addToCart } = useCart();
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(
    null
  );
  const [qty, setQty] = useState(1);

  // Monta lista de todas as imagens disponíveis
  const allImages = [
    ...(product.images?.map((i) => i.url) ?? []),
    ...(product.imageUrl && !product.images?.length ? [product.imageUrl] : [])
  ];

  const [currentImage, setCurrentImage] = useState<string | null>(
    allImages[0] ?? null
  );

  const selectedVariation = product.variations.find(
    (v) => v.id === selectedVariationId
  );

  // Troca foto ao selecionar variação
  useEffect(() => {
    if (selectedVariation?.imageUrl) {
      setCurrentImage(selectedVariation.imageUrl);
    } else {
      setCurrentImage(allImages[0] ?? null);
    }
  }, [selectedVariationId]);

  function handleAdd() {
    if (product.variations.length > 0 && !selectedVariation) return;

    addToCart({
      productId: product.id,
      name: product.name,
      unitPrice: selectedVariation?.price ?? product.price,
      qty,
      variation: selectedVariation?.name
    });
    onClose();
  }

  const canAdd =
    product.available &&
    (product.variations.length === 0 || !!selectedVariation);

  const displayPrice = selectedVariation?.price ?? product.price;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md flex flex-col max-h-[92vh] animate-slide-up md:animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fixo */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2 flex-shrink-0">
          <div className="flex-1 pr-4">
            <h3 className="font-display text-lg font-bold text-ink-primary leading-snug">
              {product.name}
            </h3>
            <p className="text-gold font-bold text-base mt-1">
              {product.variations.length > 0 && !selectedVariation
                ? "A partir de "
                : ""}
              R$ {displayPrice.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary text-xl leading-none flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="overflow-y-auto flex-1 px-6 space-y-4 pb-2">
          {/* Galeria */}
          {allImages.length > 0 && (
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <Image
                  src={currentImage ?? allImages[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 448px"
                />
                {!product.available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white text-ink-primary font-bold px-4 py-2 rounded-full text-sm">
                      Esgotado
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
                  {allImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(url)}
                      className={clsx(
                        "flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
                        currentImage === url
                          ? "border-gold"
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img
                        src={url}
                        alt={`Foto ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Observação */}
          {product.adminNote && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-700 font-medium">
                📌 Observação
              </p>
              <p className="text-sm text-ink-secondary mt-1">
                {product.adminNote}
              </p>
            </div>
          )}

          {/* Variações */}
          {product.variations.length > 0 && (
            <div>
              <p className="text-sm font-medium text-ink-secondary mb-2">
                Escolha a variação:
              </p>
              <div className="space-y-2">
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
                      {v.imageUrl && (
                        <img
                          src={v.imageUrl}
                          alt={v.name}
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
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
            </div>
          )}

          {/* Quantidade */}
          <div>
            <p className="text-sm font-medium text-ink-secondary mb-2">
              Quantidade:
            </p>
            <div className="flex items-center justify-center gap-8 bg-brand-bg rounded-2xl py-4">
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
          </div>
        </div>

        {/* Botão fixo */}
        <div className="px-6 py-4 flex-shrink-0 border-t border-brand-border">
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={clsx(
              "w-full py-4 rounded-2xl font-bold text-sm transition-colors",
              canAdd
                ? "bg-gold hover:bg-gold-dark text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {!product.available
              ? "Produto Esgotado"
              : product.variations.length > 0 && !selectedVariation
                ? "Selecione uma variação"
                : `Adicionar — R$ ${(displayPrice * qty).toFixed(2).replace(".", ",")}`}
          </button>
        </div>
      </div>
    </div>
  );
}
