"use client";
import { useState } from "react";

const categories = ["Todos", "Narguilés", "Essências", "Acessórios", "Carvão"];

export default function CategoryFilter() {
  const [active, setActive] = useState("Todos");

  return (
    <div className="sticky top-[60px] z-30 bg-white border-b border-[#E8E5DF] px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === cat
              ? "bg-[#C9A84C] text-[#1A1814]"
              : "bg-[#F0EDE7] text-[#6B6560] hover:bg-[#E8C97A]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}