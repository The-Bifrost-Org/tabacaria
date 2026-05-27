"use client";

import { useCart } from "@/components/cart/CartProvider";
import { useRouter, usePathname } from "next/navigation";

export function CartBar() {
  const { totalItems, subtotal } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  // Esconde no checkout e confirmação
  if (totalItems === 0) return null;
  if (pathname === "/checkout" || pathname === "/confirmacao") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-brand-border shadow-lg px-4 h-16 flex items-center justify-between animate-slide-up">
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
          onClick={() => router.push("/checkout")}
          className="bg-gold hover:bg-gold-dark text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
        >
          Ver pedido →
        </button>
      </div>
    </div>
  );
}
