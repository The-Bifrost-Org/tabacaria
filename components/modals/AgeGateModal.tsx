"use client";

import { useEffect, useState } from "react";
import { CONFIG } from "@/lib/config";

export function AgeGateModal() {
  const [confirmed, setConfirmed] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("age_confirmed");
    setConfirmed(stored === "true");
  }, []);

  function handleConfirm() {
    sessionStorage.setItem("age_confirmed", "true");
    setConfirmed(true);
  }

  // null = ainda carregando (evita flash do modal)
  if (confirmed === null || confirmed === true) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in">
        <div className="text-4xl mb-4">🪪</div>
        <h2 className="font-display text-2xl font-bold text-ink-primary mb-2">
          {CONFIG.STORE_NAME}
        </h2>
        <p className="text-ink-secondary mb-8">
          Este site vende produtos para maiores de 18 anos. Confirme sua idade
          para continuar.
        </p>

        <button
          onClick={handleConfirm}
          className="w-full bg-gold hover:bg-gold-dark text-white font-semibold py-3 rounded-xl mb-3 transition-colors"
        >
          Sim, tenho 18 anos ou mais
        </button>

        <button
          onClick={() => (window.location.href = "https://google.com")}
          className="text-sm text-ink-muted hover:text-ink-secondary transition-colors"
        >
          Não, quero sair
        </button>
      </div>
    </div>
  );
}
