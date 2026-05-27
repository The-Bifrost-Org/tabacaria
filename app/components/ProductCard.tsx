"use client";
import { useCart } from "../context/CartContext";

type Product = {
  id: number;
  name: string;
  price: number;
  available: boolean;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-sm border border-[#E8E5DF] relative ${!product.available ? "opacity-60" : ""}`}>
      <div className="aspect-square bg-[#F0EDE7] flex items-center justify-center text-4xl">
        🪴
      </div>

      <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${
        product.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}>
        {product.available ? "Disponível" : "Esgotado"}
      </span>

      <div className="p-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#1A1814] line-clamp-2">{product.name}</p>
          <p className="text-[#C9A84C] font-bold text-base">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </p>
        </div>
        <button
          disabled={!product.available}
          onClick={() => addItem({ id: product.id, name: product.name, price: product.price })}
          className="w-10 h-10 rounded-full bg-[#C9A84C] text-white text-xl font-bold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#E8C97A] transition-colors flex-shrink-0"
        >
          +
        </button>
      </div>
    </div>
  );
}