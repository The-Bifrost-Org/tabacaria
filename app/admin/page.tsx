"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

interface Variation {
  id: string;
  name: string;
  price: number;
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

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch("/api/products");
    setProducts(await res.json());
    setLoading(false);
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

  async function deleteProduct(id: string) {
    if (!confirm("Excluir este produto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalEsgotados = products.filter((p) => !p.available).length;

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <div className="bg-white border-b border-brand-border px-4 h-16 flex items-center justify-between">
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

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Cards resumo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-brand-border p-4">
            <p className="text-3xl font-bold text-ink-primary">
              {products.length}
            </p>
            <p className="text-sm text-ink-muted mt-1">Produtos Total</p>
          </div>
          <div className="bg-white rounded-2xl border border-brand-border p-4">
            <p className="text-3xl font-bold text-amber-500">
              {totalEsgotados}
            </p>
            <p className="text-sm text-ink-muted mt-1">Esgotados ⚠️</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3">
          <input
            placeholder="🔍 Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
          />
          <button
            onClick={() => router.push("/admin/produto/novo")}
            className="bg-gold hover:bg-gold-dark text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            + Novo
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-brand-border p-4 animate-pulse h-20"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-ink-muted">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-sm">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-brand-border p-4 flex items-center gap-4"
              >
                {/* Imagem */}
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-2xl overflow-hidden">
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

                {/* Info */}
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

                {/* Toggle disponível */}
                <button
                  onClick={() => toggleAvailable(product.id, product.available)}
                  className={clsx(
                    "w-11 h-6 rounded-full transition-colors relative flex-shrink-0",
                    product.available ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                      product.available ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>

                {/* Ações */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/admin/produto/${product.id}`)}
                    className="text-xs text-ink-secondary hover:text-gold transition-colors px-2 py-1 rounded-lg hover:bg-amber-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-xs text-ink-secondary hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
