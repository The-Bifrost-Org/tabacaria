"use client";
import { useState } from "react";

export default function AgeGateModal() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl p-8 mx-4 max-w-sm w-full text-center shadow-xl">
        <h1 className="text-2xl font-bold text-[#1A1814] mb-2">
          Você tem mais de 18 anos?
        </h1>
        <p className="text-[#6B6560] text-sm mb-6">
          Este site contém produtos para adultos.
        </p>
        <button
          onClick={() => setVisible(false)}
          className="w-full bg-[#C9A84C] text-[#1A1814] font-semibold py-3 rounded-lg mb-3 hover:bg-[#E8C97A] transition-colors"
        >
          SIM, TENHO 18+
        </button>
        
          <a>href="about:blank"
          className="text-sm text-[#6B6560] hover:underline"
        >
          Não, quero sair
        </a>
      </div>
    </div>
  );
}