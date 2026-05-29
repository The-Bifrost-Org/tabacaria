"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { CouponManager } from "@/components/admin/CouponManager";
import { StoreHoursManager } from "@/components/admin/StoreHoursManager";

interface Variation {
  id: string;
  name: string;
  price: number;
  available: boolean;
}
interface Category {
  id: string;
  name: string;
  slug: string;
}
interface Product {
  id: string;
  name: string;
  price: number;
  available: boolean;
  imageUrl: string | null;
  category: Category;
  variations: Variation[];
}

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [showCatForm, setShowCatForm] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [showFeedbacks, setShowFeedbacks] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "todos" | "ativos" | "esgotados"
  >("todos");
  const [sortBy, setSortBy] = useState<
    "name" | "price_asc" | "price_desc" | "category"
  >("name");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetch("/api/feedback")
      .then((r) => r.json())
      .then(setFeedbacks);
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch("/api/products");
    setProducts(await res.json());
    setLoading(false);
  }

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }

  async function addCategory() {
    if (!newCatName.trim()) return;
    setCatLoading(true);
    const slug = newCatName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName, slug })
    });
    setNewCatName("");
    setShowCatForm(false);
    fetchCategories();
    setCatLoading(false);
  }

  async function deleteCategory(id: string) {
    if (!confirm("Excluir esta categoria?")) return;
    await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetchCategories();
  }

  async function toggleAvailable(id: string, current: boolean) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, available: !current } : p))
    );
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !current })
    });
  }

  async function toggleVariation(
    productId: string,
    variationId: string,
    current: boolean
  ) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              variations: p.variations.map((v) =>
                v.id === variationId ? { ...v, available: !current } : v
              )
            }
          : p
      )
    );
    await fetch(`/api/variations/${variationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !current })
    });
  }

  async function deleteProduct(id: string) {
    if (!confirm("Excluir este produto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) =>
      selectedCategory ? p.category.id === selectedCategory : true
    )
    .filter((p) => {
      if (statusFilter === "ativos") return p.available;
      if (statusFilter === "esgotados") return !p.available;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "category")
        return a.category.name.localeCompare(b.category.name);
      return 0;
    });
  const totalEsgotados = products.filter((p) => !p.available).length;

  function Toggle({
    on,
    onToggle,
    size = "md"
  }: {
    on: boolean;
    onToggle: () => void;
    size?: "sm" | "md";
  }) {
    const isSm = size === "sm";
    return (
      <button
        onClick={onToggle}
        className={clsx(
          "rounded-full transition-colors relative flex-shrink-0",
          isSm ? "w-8 h-4" : "w-11 h-6",
          on ? "bg-green-500" : "bg-gray-300"
        )}
      >
        <span
          className={clsx(
            "absolute bg-white rounded-full shadow transition-transform",
            isSm ? "top-0.5 left-0.5 w-3 h-3" : "top-0.5 left-0.5 w-5 h-5",
            on ? (isSm ? "translate-x-4" : "translate-x-5") : "translate-x-0"
          )}
        />
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <div className="bg-white border-b border-brand-border px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        <h1 className="font-display text-lg font-bold text-ink-primary">
          🏪 Painel Admin
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-ink-muted hover:text-ink-primary transition-colors"
        >
          Sair
        </button>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ═══════════════════════════ */}
          {/* COLUNA ESQUERDA            */}
          {/* ═══════════════════════════ */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
            {/* Cards resumo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-brand-border p-4">
                <p className="text-3xl font-bold text-ink-primary">
                  {products.length}
                </p>
                <p className="text-sm text-ink-muted mt-1">Produtos</p>
              </div>
              <div className="bg-white rounded-2xl border border-brand-border p-4">
                <p
                  className={clsx(
                    "text-3xl font-bold",
                    totalEsgotados > 0 ? "text-amber-500" : "text-green-500"
                  )}
                >
                  {totalEsgotados}
                </p>
                <p className="text-sm text-ink-muted mt-1">Esgotados</p>
              </div>
            </div>

            {/* Feedbacks  */}
            <button
              onClick={() => router.push("/admin/feedbacks")}
              className="w-full bg-white rounded-2xl border border-brand-border p-4 flex items-center justify-between hover:border-gold transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink-primary">
                  💬 Feedbacks
                </span>
                {feedbacks.length > 0 && (
                  <span className="bg-gold text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {feedbacks.length}
                  </span>
                )}
              </div>
              <span className="text-ink-muted text-sm">Ver todos →</span>
            </button>

            {/* Categorias */}
            <section className="bg-white rounded-2xl border border-brand-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-ink-primary">Categorias</h2>
                <button
                  onClick={() => setShowCatForm((s) => !s)}
                  className="text-sm text-gold hover:text-gold-dark font-medium transition-colors"
                >
                  + Nova
                </button>
              </div>
              {showCatForm && (
                <div className="flex gap-2 animate-fade-in">
                  <input
                    placeholder="Nome da categoria"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCategory()}
                    className="flex-1 border border-brand-border rounded-xl px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                  <button
                    onClick={addCategory}
                    disabled={catLoading}
                    className="bg-gold hover:bg-gold-dark text-white px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                  >
                    {catLoading ? "..." : "Salvar"}
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-3 py-1"
                  >
                    <span className="text-sm text-ink-primary">{cat.name}</span>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="text-ink-muted hover:text-red-500 ml-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-ink-muted">Nenhuma categoria</p>
                )}
              </div>
            </section>

            {/* Cupons */}
            <CouponManager />

            {/* Horários */}
            <StoreHoursManager />
          </div>

          {/* ═══════════════════════════ */}
          {/* COLUNA DIREITA — PRODUTOS  */}
          {/* ═══════════════════════════ */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Busca + novo */}
            <div className="flex gap-3">
              <input
                placeholder="🔍 Buscar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold bg-white"
              />
              <button
                onClick={() => router.push("/admin/produto/novo")}
                className="bg-gold hover:bg-gold-dark text-white font-semibold px-5 py-3 rounded-xl text-sm whitespace-nowrap transition-colors"
              >
                + Novo Produto
              </button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              {/* Categoria */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-brand-border rounded-xl px-3 py-2 text-sm outline-none focus:border-gold bg-white text-ink-secondary"
              >
                <option value="">Todas categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Status */}
              {(["todos", "ativos", "esgotados"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={clsx(
                    "px-3 py-2 rounded-xl border text-sm font-medium transition-colors",
                    statusFilter === s
                      ? "bg-ink-primary text-white border-ink-primary"
                      : "bg-white border-brand-border text-ink-secondary hover:border-gold"
                  )}
                >
                  {s === "todos"
                    ? "📦 Todos"
                    : s === "ativos"
                      ? "✅ Ativos"
                      : "⚠️ Esgotados"}
                </button>
              ))}

              {/* Ordenação */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-brand-border rounded-xl px-3 py-2 text-sm outline-none focus:border-gold bg-white text-ink-secondary ml-auto"
              >
                <option value="name">A-Z</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="category">Categoria</option>
              </select>
            </div>

            {/* Contador */}
            <p className="text-xs text-ink-muted">
              {filtered.length} produto{filtered.length !== 1 ? "s" : ""}{" "}
              encontrado{filtered.length !== 1 ? "s" : ""}
              {(search || selectedCategory || statusFilter !== "todos") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("");
                    setStatusFilter("todos");
                  }}
                  className="ml-2 text-gold hover:text-gold-dark underline"
                >
                  Limpar filtros
                </button>
              )}
            </p>

            {/* Lista */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-brand-border p-4 animate-pulse h-24"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-ink-muted bg-white rounded-2xl border border-brand-border">
                <p className="text-4xl mb-3">📦</p>
                <p className="text-sm">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-brand-border overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "🪄"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-ink-primary truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {product.category.name}
                        </p>
                        <p className="text-xs font-bold text-gold mt-0.5">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                          {product.variations.length > 0 &&
                            ` · ${product.variations.length} variações`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex flex-col items-center gap-1">
                          <Toggle
                            on={product.available}
                            onToggle={() =>
                              toggleAvailable(product.id, product.available)
                            }
                          />
                          <span className="text-xs text-ink-muted">
                            {product.available ? "Ativo" : "Esgotado"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/produto/${product.id}`)
                            }
                            className="text-xs bg-amber-50 hover:bg-amber-100 text-gold font-medium px-3 py-2 rounded-lg transition-colors"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-500 font-medium px-3 py-2 rounded-lg transition-colors"
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </div>
                    </div>

                    {product.variations.length > 0 && (
                      <>
                        <button
                          onClick={() =>
                            setExpanded(
                              expanded === product.id ? null : product.id
                            )
                          }
                          className="w-full flex items-center justify-between px-4 py-2 bg-brand-bg border-t border-brand-border text-xs text-ink-secondary hover:text-ink-primary transition-colors"
                        >
                          <span>
                            {product.variations.filter((v) => !v.available)
                              .length > 0
                              ? `⚠️ ${product.variations.filter((v) => !v.available).length} variação(ões) esgotada(s)`
                              : "✅ Todas variações disponíveis"}
                          </span>
                          <span>
                            {expanded === product.id
                              ? "▲ Fechar"
                              : "▼ Gerenciar variações"}
                          </span>
                        </button>
                        {expanded === product.id && (
                          <div className="px-4 pb-4 pt-2 grid grid-cols-1 md:grid-cols-2 gap-2 animate-fade-in">
                            {product.variations.map((v) => (
                              <div
                                key={v.id}
                                className="flex items-center justify-between bg-brand-bg rounded-xl px-3 py-2"
                              >
                                <div>
                                  <p
                                    className={clsx(
                                      "text-sm font-medium",
                                      !v.available &&
                                        "line-through text-ink-muted"
                                    )}
                                  >
                                    {v.name}
                                  </p>
                                  <p className="text-xs text-gold font-bold">
                                    R$ {v.price.toFixed(2).replace(".", ",")}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={clsx(
                                      "text-xs font-medium",
                                      v.available
                                        ? "text-green-600"
                                        : "text-red-400"
                                    )}
                                  >
                                    {v.available ? "Disponível" : "Esgotado"}
                                  </span>
                                  <Toggle
                                    on={v.available}
                                    onToggle={() =>
                                      toggleVariation(
                                        product.id,
                                        v.id,
                                        v.available
                                      )
                                    }
                                    size="sm"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
