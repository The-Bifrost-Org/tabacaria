"use client";

import Image from "next/image";
import { useState } from "react";
import { clsx } from "clsx";
import type { ProductWithRelations } from "@/types";
import { ProductModal } from "@/components/modals/ProductModal";

interface Props {
  product: ProductWithRelations;
}

export function ProductCard({ product }: Props) {
  const [showModal, setShowModal] = useState(false);

  const mainImage = product.images?.[0]?.url ?? product.imageUrl;

  return (
    <>
      <div
        className="relative rounded-xl overflow-hidden shadow-sm bg-white flex flex-col cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowModal(true)}
      >
        {/* Imagem */}
        <div className="relative aspect-square bg-gray-100">
          {mainImage ? (
            <Image
              src={mainImage}
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

          {/* Indicador de múltiplas fotos */}
          {product.images?.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              +{product.images.length - 1} fotos
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex items-end justify-between gap-2 flex-1">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-ink-primary leading-snug line-clamp-2">
              {product.name}
            </p>
            {product.adminNote && (
              <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">
                📌 {product.adminNote}
              </p>
            )}
            <p className="text-sm font-bold text-gold mt-1">
              {product.variations.length > 0 ? "A partir de " : ""}
              R$ {product.price.toFixed(2).replace(".", ",")}
            </p>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            className={clsx(
              "flex-shrink-0 min-w-[36px] w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-all",
              product.available
                ? "bg-gold text-white hover:bg-gold-dark active:scale-90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
            )}
          >
            +
          </div>
        </div>
      </div>

      {showModal && (
        <ProductModal product={product} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
