"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

interface Feedback {
  id: string;
  type: string;
  message: string;
  name: string | null;
  rating: number | null;
  createdAt: string;
}

export default function FeedbacksPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todos" | "sugestao" | "feedback">(
    "todos"
  );

  useEffect(() => {
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((data) => {
        setFeedbacks(data);
        setLoading(false);
      });
  }, []);

  const filtered = feedbacks.filter((f) =>
    filter === "todos" ? true : f.type === filter
  );

  const avgRating = feedbacks
    .filter((f) => f.rating !== null)
    .reduce((acc, f, _, arr) => acc + (f.rating ?? 0) / arr.length, 0);

  const totalSugestoes = feedbacks.filter((f) => f.type === "sugestao").length;
  const totalFeedbacks = feedbacks.filter((f) => f.type === "feedback").length;

  function Stars({ rating }: { rating: number }) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            className={clsx(
              "text-lg",
              s <= rating ? "text-gold" : "text-gray-200"
            )}
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <div className="bg-white border-b border-brand-border px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin")}
            className="text-ink-secondary hover:text-ink-primary"
          >
            ← Voltar
          </button>
          <h1 className="font-display text-lg font-bold text-ink-primary">
            💬 Feedbacks e Sugestões
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Cards resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-brand-border p-4 text-center">
            <p className="text-3xl font-bold text-ink-primary">
              {feedbacks.length}
            </p>
            <p className="text-sm text-ink-muted mt-1">Total</p>
          </div>
          <div className="bg-white rounded-2xl border border-brand-border p-4 text-center">
            <p className="text-3xl font-bold text-blue-500">{totalSugestoes}</p>
            <p className="text-sm text-ink-muted mt-1">Sugestões</p>
          </div>
          <div className="bg-white rounded-2xl border border-brand-border p-4 text-center">
            <p className="text-3xl font-bold text-green-500">
              {totalFeedbacks}
            </p>
            <p className="text-sm text-ink-muted mt-1">Avaliações</p>
          </div>
          <div className="bg-white rounded-2xl border border-brand-border p-4 text-center">
            <p className="text-3xl font-bold text-gold">
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-ink-muted mt-1">Média ⭐</p>
          </div>
        </div>

        {/* Distribuição de estrelas */}
        {totalFeedbacks > 0 && (
          <div className="bg-white rounded-2xl border border-brand-border p-6">
            <h2 className="font-semibold text-ink-primary mb-4">
              Distribuição de avaliações
            </h2>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = feedbacks.filter((f) => f.rating === star).length;
                const pct =
                  totalFeedbacks > 0 ? (count / totalFeedbacks) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20 flex-shrink-0">
                      <span className="text-sm text-gold">★</span>
                      <span className="text-sm text-ink-secondary">
                        {star} estrela{star !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-ink-muted w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2">
          {(["todos", "sugestao", "feedback"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-4 py-2 rounded-xl border text-sm font-medium transition-colors",
                filter === f
                  ? "bg-ink-primary text-white border-ink-primary"
                  : "bg-white border-brand-border text-ink-secondary hover:border-gold"
              )}
            >
              {f === "todos"
                ? `📋 Todos (${feedbacks.length})`
                : f === "sugestao"
                  ? `💡 Sugestões (${totalSugestoes})`
                  : `⭐ Avaliações (${totalFeedbacks})`}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-brand-border p-4 animate-pulse h-24"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-ink-muted bg-white rounded-2xl border border-brand-border">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-sm">Nenhuma mensagem ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl border border-brand-border p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={clsx(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          f.type === "sugestao"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        )}
                      >
                        {f.type === "sugestao" ? "💡 Sugestão" : "⭐ Avaliação"}
                      </span>
                      {f.name && (
                        <span className="text-sm font-medium text-ink-primary">
                          {f.name}
                        </span>
                      )}
                      <span className="text-xs text-ink-muted ml-auto">
                        {new Date(f.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    {f.rating && <Stars rating={f.rating} />}

                    <p className="text-sm text-ink-primary mt-2 leading-relaxed">
                      {f.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
