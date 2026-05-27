"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useRouter, usePathname } from "next/navigation";

export function CartBar() {
  const { totalItems, subtotal, items, removeFromCart, updateQty } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (totalItems === 0) return null;
  if (pathname === "/checkout" || pathname === "/confirmacao") return null;

  return (
    <>
      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl p-6 max-h-[80vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-ink-primary">
                Seu Pedido
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-ink-muted hover:text-ink-primary text-xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 mb-4">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-brand-bg rounded-xl p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-ink-primary truncate">
                      {item.name}
                    </p>
                    {item.variation && (
                      <p className="text-xs text-ink-muted">{item.variation}</p>
                    )}
                    <p className="text-xs font-bold text-gold mt-0.5">
                      R${" "}
                      {(item.unitPrice * item.qty).toFixed(2).replace(".", ",")}
                    </p>
                  </div>

                  {/* Quantidade */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateQty(item.productId, item.qty - 1, item.variation)
                      }
                      className="w-7 h-7 rounded-full border border-brand-border flex items-center justify-center text-sm font-bold text-ink-secondary hover:border-red-400 hover:text-red-400 transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={item.qty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val))
                          updateQty(item.productId, val, item.variation);
                      }}
                      className="w-10 text-center text-sm font-bold text-ink-primary bg-white border border-brand-border rounded-lg py-1 outline-none focus:border-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() =>
                        updateQty(item.productId, item.qty + 1, item.variation)
                      }
                      className="w-7 h-7 rounded-full border border-brand-border flex items-center justify-center text-sm font-bold text-ink-secondary hover:border-gold hover:text-gold transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Remover */}
                  <button
                    onClick={() =>
                      removeFromCart(item.productId, item.variation)
                    }
                    className="text-ink-muted hover:text-red-500 transition-colors text-lg ml-1"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Total e botão */}
            <div className="border-t border-brand-border pt-4 space-y-3">
              <div className="flex justify-between font-bold text-ink-primary">
                <span>Total</span>
                <span className="text-gold">
                  R$ {subtotal.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/checkout");
                }}
                className="w-full bg-gold hover:bg-gold-dark text-white font-bold py-4 rounded-2xl transition-colors"
              >
                Finalizar Pedido →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra fixa — clique em qualquer lugar abre o drawer, exceto no botão */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-brand-border shadow-lg px-4 h-16 flex items-center justify-between cursor-pointer animate-slide-up"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🛒</span>
          <span className="text-sm text-ink-secondary font-medium">
            {totalItems} {totalItems === 1 ? "item" : "itens"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-bold text-ink-primary">
            R$ {subtotal.toFixed(2).replace(".", ",")}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push("/checkout");
            }}
            className="bg-gold hover:bg-gold-dark text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
          >
            Ver pedido →
          </button>
        </div>
      </div>
    </>
  );
}
