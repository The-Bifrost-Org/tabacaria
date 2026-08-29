"use client";

import { useEffect, useState, useMemo } from "react";
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

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={clsx("text-base", s <= rating ? "text-gold" : "text-gray-200")}>★</span>
      ))}
    </div>
  );
}

export default function FeedbacksPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todos" | "sugestao" | "feedback">("todos");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recente" | "antigo" | "melhor" | "pior">("recente");

  useEffect(() => {
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((data) => { setFeedbacks(data); setLoading(false); });
  }, []);

  const avgRating = useMemo(() => {
    const rated = feedbacks.filter((f) => f.rating !== null);
    if (!rated.length) return 0;
    return rated.reduce((acc, f) => acc + (f.rating ?? 0), 0) / rated.length;
  }, [feedbacks]);

  const totalSugestoes = feedbacks.filter((f) => f.type === "sugestao").length;
  const totalFeedbacks = feedbacks.filter((f) => f.type === "feedback").length;

  const thisMonth = useMemo(() => {
    const now = new Date();
    return feedbacks.filter((f) => {
      const d = new Date(f.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [feedbacks]);

  const lastFeedback = feedbacks[0] ?? null;

  const filtered = useMemo(() => {
    let list = feedbacks.filter((f) => filter === "todos" ? true : f.type === filter);
    if (search.trim()) {
      list = list.filter((f) =>
        f.message.toLowerCase().includes(search.toLowerCase()) ||
        (f.name ?? "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return list.sort((a, b) => {
      if (sortBy === "recente") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "antigo") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "melhor") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortBy === "pior") return (a.rating ?? 0) - (b.rating ?? 0);
      return 0;
    });
  }, [feedbacks, filter, search, sortBy]);

  const avaliacoes = filtered.filter((f) => f.type === "feedback");
  const sugestoes = filtered.filter((f) => f.type === "sugestao");

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <div className="bg-white border-b border-brand-border px-6 h-16 flex items-center sticky top-0 z-40">
        <button onClick={() => router.push("/admin")} className="text-ink-secondary hover:text-ink-primary mr-4">
          ← Voltar
        </button>
        <div>
          <h1 className="font-display text-lg font-bold text-ink-primary">💬 Feedbacks e Sugestões</h1>
          <p className="text-xs text-ink-muted">Acompanhe avaliações dos clientes e sugestões de melhoria.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: "📋", value: feedbacks.length, label: "Total", color: "text-ink-primary" },
            { icon: "💡", value: totalSugestoes, label: "Sugestões", color: "text-blue-500" },
            { icon: "⭐", value: totalFeedbacks, label: "Avaliações", color: "text-green-500" },
            { icon: "📊", value: avgRating > 0 ? avgRating.toFixed(1) : "—", label: "Média", color: "text-gold" },
            { icon: "📅", value: thisMonth, label: "Este mês", color: "text-ink-primary" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-brand-border p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl mb-1">{card.icon}</div>
              <p className={clsx("text-3xl font-bold", card.color)}>{card.value}</p>
              <p className="text-xs text-ink-muted mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Dashboard duas colunas */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Coluna esquerda — 65% */}
          <div className="flex-1 space-y-4">

            {/* Busca e ordenação */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">🔍</span>
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou comentário..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-border text-sm outline-none focus:border-gold bg-white"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 rounded-xl border border-brand-border text-sm outline-none focus:border-gold bg-white text-ink-secondary"
              >
                <option value="recente">Mais recente</option>
                <option value="antigo">Mais antigo</option>
                <option value="melhor">Melhor avaliação</option>
                <option value="pior">Pior avaliação</option>
              </select>
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              {([
                { key: "todos", label: "Todos", count: feedbacks.length, icon: "📋" },
                { key: "feedback", label: "Avaliações", count: totalFeedbacks, icon: "⭐" },
                { key: "sugestao", label: "Sugestões", count: totalSugestoes, icon: "💡" },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={clsx(
                    "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                    filter === f.key
                      ? "bg-ink-primary text-white border-ink-primary shadow-sm"
                      : "bg-white border-brand-border text-ink-secondary hover:border-gold"
                  )}
                >
                  {f.icon} {f.label} ({f.count})
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-brand-border p-4 animate-pulse h-24" />
                ))}
              </div>
            ) : (
              <>
                {/* Bloco Avaliações */}
                {(filter === "todos" || filter === "feedback") && (
                  <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
                    <div className="bg-green-50 border-b border-green-100 px-5 py-3 flex items-center gap-2">
                      <span className="text-green-600">⭐</span>
                      <h2 className="font-semibold text-green-700 text-sm">Avaliações ({avaliacoes.length})</h2>
                    </div>
                    {avaliacoes.length === 0 ? (
                      <p className="text-center text-ink-muted text-sm py-8">Nenhuma avaliação</p>
                    ) : (
                      <div className="divide-y divide-brand-border">
                        {avaliacoes.map((f) => (
                          <div key={f.id} className="p-5 hover:bg-green-50/30 transition-colors border-l-4 border-l-green-400">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">⭐ Avaliação</span>
                                {f.name && <span className="text-sm font-medium text-ink-primary">{f.name}</span>}
                              </div>
                              <span className="text-xs text-ink-muted">
                                {new Date(f.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            {f.rating && <Stars rating={f.rating} />}
                            <p className="text-sm text-ink-primary mt-2 leading-relaxed">{f.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bloco Sugestões */}
                {(filter === "todos" || filter === "sugestao") && (
                  <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
                    <div className="bg-blue-50 border-b border-blue-100 px-5 py-3 flex items-center gap-2">
                      <span className="text-blue-600">💡</span>
                      <h2 className="font-semibold text-blue-700 text-sm">Sugestões ({sugestoes.length})</h2>
                    </div>
                    {sugestoes.length === 0 ? (
                      <p className="text-center text-ink-muted text-sm py-8">Nenhuma sugestão</p>
                    ) : (
                      <div className="divide-y divide-brand-border">
                        {sugestoes.map((f) => (
                          <div key={f.id} className="p-5 hover:bg-blue-50/30 transition-colors border-l-4 border-l-blue-400">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">💡 Sugestão</span>
                                {f.name && <span className="text-sm font-medium text-ink-primary">{f.name}</span>}
                              </div>
                              <span className="text-xs text-ink-muted">
                                {new Date(f.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-sm text-ink-primary mt-1 leading-relaxed">{f.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Coluna direita — 35% */}
          <div className="lg:w-80 space-y-4">

            {/* Distribuição de estrelas */}
            <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-sm">
              <h2 className="font-semibold text-ink-primary mb-4 text-sm">📊 Distribuição de notas</h2>
              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = feedbacks.filter((f) => f.rating === star).length;
                  const pct = totalFeedbacks > 0 ? (count / totalFeedbacks) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-xs text-ink-muted w-16 flex-shrink-0">{star} ★</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-ink-muted w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumo rápido */}
            <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-sm">
              <h2 className="font-semibold text-ink-primary mb-4 text-sm">⚡ Resumo rápido</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted">⭐ Nota média</span>
                  <span className="text-sm font-bold text-gold">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted">💬 Comentários</span>
                  <span className="text-sm font-bold text-ink-primary">{feedbacks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted">💡 Sugestões</span>
                  <span className="text-sm font-bold text-blue-500">{totalSugestoes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted">📅 Este mês</span>
                  <span className="text-sm font-bold text-ink-primary">{thisMonth}</span>
                </div>
              </div>
            </div>

            {/* Último feedback */}
            {lastFeedback && (
              <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-sm">
                <h2 className="font-semibold text-ink-primary mb-3 text-sm">🕐 Último feedback</h2>
                <div className="flex items-center gap-2 mb-2">
                  <span className={clsx(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    lastFeedback.type === "sugestao" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                  )}>
                    {lastFeedback.type === "sugestao" ? "💡 Sugestão" : "⭐ Avaliação"}
                  </span>
                  {lastFeedback.name && <span className="text-sm font-medium text-ink-primary">{lastFeedback.name}</span>}
                </div>
                <p className="text-xs text-ink-muted">
                  {new Date(lastFeedback.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}