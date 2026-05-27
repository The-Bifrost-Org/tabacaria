"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { buildWhatsAppMessage } from "@/lib/whatsapp";

export default function ConfirmacaoPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("tabacaria_order");
    if (!raw) {
      router.replace("/");
      return;
    }
    const order = JSON.parse(raw);
    setUrl(buildWhatsAppMessage(order));
  }, [router]);

  function handleWhatsApp() {
    if (!url) return;
    const opened = window.open(url, "_blank");
    if (!opened) window.location.href = url;
    clearCart();
    sessionStorage.removeItem("tabacaria_order");
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-6">✅</div>

      <h1 className="font-display text-2xl font-bold text-ink-primary mb-2">
        Pedido Pronto!
      </h1>
      <p className="text-ink-secondary mb-2">
        Finalize seu pedido diretamente pelo WhatsApp.
      </p>
      <p className="text-xs text-ink-muted mb-10">
        Seu pedido fica salvo por 1 hora.
      </p>

      <button
        onClick={handleWhatsApp}
        className="w-full max-w-sm bg-gold hover:bg-gold-dark text-white font-bold py-4 rounded-2xl animate-pulse mb-4 transition-colors"
      >
        Enviar Pedido 📲
      </button>

      <button
        onClick={() => router.push("/")}
        className="text-sm text-ink-muted hover:text-ink-secondary transition-colors"
      >
        ← Voltar ao Catálogo
      </button>
    </div>
  );
}
