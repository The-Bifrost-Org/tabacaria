"use client";
import { useCart } from "../context/CartContext";

export default function CartBar() {
  const { itemCount, total } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#C9A84C] px-4 py-3 flex items-center justify-between shadow-lg">
      <span className="text-[#1A1814] font-medium">
        🛒 {itemCount} {itemCount === 1 ? "item" : "itens"}
      </span>
      <span className="text-[#1A1814] font-bold">
        R$ {total.toFixed(2).replace(".", ",")}
      </span>
      <button className="bg-[#1A1814] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#333] transition-colors">
        VER →
      </button>
    </div>
  );
}