"use client";

import { useState } from "react";
import { clsx } from "clsx";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"sugestao" | "feedback">("sugestao");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  async function handleSend() {
    if (!message.trim()) return;
    if (honeypot) return;
    if (type === "feedback" && rating === 0) return;

    setLoading(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        message,
        name,
        rating: type === "feedback" ? rating : null,
        honeypot
      })
    });
    setSent(true);
    setLoading(false);
    setTimeout(() => {
      setSent(false);
      setOpen(false);
      setMessage("");
      setName("");
      setRating(0);
    }, 2500);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 bottom-20 z-40 bg-ink-primary hover:bg-ink-secondary text-white rounded-full px-4 py-2.5 text-sm font-medium shadow-lg transition-all flex items-center gap-2"
      >
        💬 Sugestão
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl md:rounded-2xl p-6 w-full max-w-md animate-slide-up">
            {sent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🙏</div>
                <h3 className="font-display text-xl font-bold text-ink-primary mb-2">
                  Obrigado!
                </h3>
                <p className="text-ink-secondary text-sm">
                  Sua mensagem foi enviada com sucesso.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-bold text-ink-primary">
                    Fala com a gente 💬
                  </h3>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-ink-muted hover:text-ink-primary text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Tipo */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {(["sugestao", "feedback"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setType(t);
                        setRating(0);
                      }}
                      className={clsx(
                        "py-2.5 rounded-xl border text-sm font-medium transition-all",
                        type === t
                          ? "border-gold bg-amber-50 text-gold ring-2 ring-gold"
                          : "border-brand-border text-ink-secondary hover:border-gold"
                      )}
                    >
                      {t === "sugestao" ? "💡 Sugestão" : "⭐ Avaliação"}
                    </button>
                  ))}
                </div>

                {/* Estrelas — só para feedback */}
                {type === "feedback" && (
                  <div className="mb-4 animate-fade-in">
                    <p className="text-sm text-ink-secondary mb-2 font-medium">
                      Sua avaliação:
                    </p>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(0)}
                          className="text-3xl transition-transform hover:scale-110 active:scale-95"
                        >
                          {star <= (hover || rating) ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-center text-xs text-ink-muted mt-1">
                        {
                          [
                            "",
                            "Muito ruim",
                            "Ruim",
                            "Regular",
                            "Bom",
                            "Excelente!"
                          ][rating]
                        }
                      </p>
                    )}
                  </div>
                )}

                {/* Nome */}
                <input
                  placeholder="Seu nome (opcional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold mb-3"
                />

                {/* Mensagem */}
                <textarea
                  placeholder={
                    type === "sugestao"
                      ? "Qual produto você gostaria de ver aqui?"
                      : "Conta o que achou da Suave Tabacaria..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold resize-none mb-4"
                />

                {/* Honeypot */}
                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ display: "none" }}
                />

                {type === "feedback" && rating === 0 && (
                  <p className="text-xs text-amber-600 mb-3">
                    ⭐ Selecione uma avaliação para continuar
                  </p>
                )}

                <button
                  onClick={handleSend}
                  disabled={
                    loading ||
                    !message.trim() ||
                    (type === "feedback" && rating === 0)
                  }
                  className="w-full bg-gold hover:bg-gold-dark text-white font-bold py-3 rounded-2xl transition-colors disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
