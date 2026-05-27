"use client";

import Image from "next/image";
import { useState } from "react";
import { clsx } from "clsx";
import type { ProductWithRelations } from "@/types";
import { useCart } from "@/components/cart/CartProvider";
import { VariationModal } from "@/components/modals/VariationModal";

interface Props {
  product: ProductWithRelations;
}

export function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);

  function handleAdd() {
    if (!product.available) return;
    if (product.variations.length > 0) {
      setShowModal(true);
    } else {
      addToCart({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        qty: 1
      });
    }
  }

  return (
    <>
      <div className="relative rounded-xl overflow-hidden shadow-sm bg-white flex flex-col">
        {/* Imagem */}
        <div className="relative aspect-square bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className={clsx(
                "object-cover",
                !product.available && "opacity-60"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🪄
            </div>
          )}

          {/* Badge */}
          <span
            className={clsx(
              "absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium",
              product.available
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            )}
          >
            {product.available ? "Disponível" : "Esgotado"}
          </span>
        </div>

        {/* Info */}
        <div className="p-3 flex items-end justify-between gap-2 flex-1">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-ink-primary leading-snug line-clamp-2">
              {product.name}
            </p>
            <p className="text-sm font-bold text-gold mt-1">
              {product.variations.length > 0 ? "A partir de " : ""}
              R$ {product.price.toFixed(2).replace(".", ",")}
            </p>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.available}
            className={clsx(
              "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-all",
              product.available
                ? "bg-gold text-white hover:bg-gold-dark active:scale-90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
            )}
            aria-label={
              product.available
                ? `Adicionar ${product.name}`
                : "Produto esgotado"
            }
          >
            +
          </button>
        </div>
      </div>

      {showModal && (
        <VariationModal product={product} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
