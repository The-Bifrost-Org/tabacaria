"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  images: { url: string }[];
  category: { name: string };
  variations: { id: string; name: string; price: number }[];
}

interface FlashSaleItem {
  id?: string;
  productId: string;
  variationId?: string | null;
  originalPrice: number;
  salePrice: number;
  product?: Product;
  variation?: { id: string; name: string; price: number } | null;
}

interface FlashSale {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  active: boolean;
  items: FlashSaleItem[];
}

export default function FlashSalePage() {
  const router = useRouter();
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selSearch, setSelSearch] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [active, setActive] = useState(true);
  const [items, setItems] = useState<FlashSaleItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Adicionar item
  const [selProduct, setSelProduct] = useState("");
  const [selVariation, setSelVariation] = useState("");
  const [selSalePrice, setSelSalePrice] = useState("");

  const [selCategory, setSelCategory] = useState("");
  const [showVariationPicker, setShowVariationPicker] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  async function fetchSales() {
    setLoading(true);
    const res = await fetch("/api/flash-sale");
    setSales(await res.json());
    setLoading(false);
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setStartAt("");
    setEndAt("");
    setActive(true);
    setItems([]);
    setError("");
    setEditingId(null);
    setSelProduct("");
    setSelVariation("");
    setSelSalePrice("");
  }

  function openEdit(sale: FlashSale) {
    setTitle(sale.title);
    setDescription(sale.description ?? "");
    setStartAt(sale.startAt.slice(0, 16));
    setEndAt(sale.endAt.slice(0, 16));
    setActive(sale.active);
    setItems(
      sale.items.map((i) => ({
        productId: i.productId,
        variationId: i.variationId ?? null,
        originalPrice: i.originalPrice,
        salePrice: i.salePrice,
        product: i.product,
        variation: i.variation
      }))
    );
    setEditingId(sale.id);
    setShowForm(true);
  }

  function addItem() {
    const product = products.find((p) => p.id === selProduct);
    if (!product) return;

    const variation = selVariation
      ? product.variations.find((v) => v.id === selVariation)
      : null;

    const originalPrice = variation?.price ?? product.price;
    const salePrice = Number(selSalePrice);

    if (!salePrice || salePrice >= originalPrice) {
      setError("Preço promocional deve ser menor que o preço original");
      return;
    }

    // Verifica se já foi adicionado
    const exists = items.find(
      (i) =>
        i.productId === selProduct &&
        (i.variationId ?? null) === (selVariation || null)
    );
    if (exists) {
      setError("Item já adicionado");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId: selProduct,
        variationId: selVariation || null,
        originalPrice,
        salePrice,
        product,
        variation: variation ?? null
      }
    ]);
    setSelProduct("");
    setSelVariation("");
    setSelSalePrice("");
    setError("");
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Informe o título");
      return;
    }
    if (!startAt) {
      setError("Informe o início");
      return;
    }
    if (!endAt) {
      setError("Informe o fim");
      return;
    }
    if (items.length === 0) {
      setError("Adicione pelo menos um item");
      return;
    }
    if (new Date(endAt) <= new Date(startAt)) {
      setError("Fim deve ser após o início");
      return;
    }

    setSaving(true);
    setError("");

    const body = { title, description, startAt, endAt, active, items };

    const res = await fetch(
      editingId ? `/api/flash-sale/${editingId}` : "/api/flash-sale",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    if (res.ok) {
      resetForm();
      setShowForm(false);
      fetchSales();
    } else {
      setError("Erro ao salvar");
    }
    setSaving(false);
  }

  async function toggleActive(id: string, current: boolean) {
    setSales((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !current } : s))
    );
    await fetch(`/api/flash-sale/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current })
    });
  }

  async function deleteSale(id: string) {
    if (!confirm("Excluir esta promoção?")) return;
    await fetch(`/api/flash-sale/${id}`, { method: "DELETE" });
    setSales((prev) => prev.filter((s) => s.id !== id));
  }

  function getStatus(sale: FlashSale) {
    const now = new Date();
    const start = new Date(sale.startAt);
    const end = new Date(sale.endAt);
    if (!sale.active)
      return { label: "Inativa", color: "bg-gray-100 text-gray-500" };
    if (now < start)
      return { label: "Agendada", color: "bg-blue-100 text-blue-700" };
    if (now > end)
      return { label: "Encerrada", color: "bg-red-100 text-red-600" };
    return { label: "🔥 Ao vivo", color: "bg-green-100 text-green-700" };
  }

  const selectedProduct = products.find((p) => p.id === selProduct);

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
            ⚡ Promoções Relâmpago
          </h1>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-gold hover:bg-gold-dark text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          + Nova Promoção
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Formulário */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-brand-border flex items-center justify-between">
              <h2 className="font-semibold text-ink-primary text-lg">
                {editingId ? "Editar Promoção" : "Nova Promoção Relâmpago"}
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="text-ink-muted hover:text-ink-primary text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Título */}
              <div>
                <label className="text-sm font-medium text-ink-secondary mb-1 block">
                  Título da promoção
                </label>
                <input
                  placeholder="Ex: Black Friday Suave 🔥"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="text-sm font-medium text-ink-secondary mb-1 block">
                  Descrição (opcional)
                </label>
                <input
                  placeholder="Ex: Aproveite os melhores preços por tempo limitado!"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold"
                />
              </div>

              {/* Período */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-ink-secondary mb-1 block">
                    Início
                  </label>
                  <input
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-secondary mb-1 block">
                    Fim
                  </label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Ativo */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-secondary">
                  Promoção ativa
                </span>
                <button
                  onClick={() => setActive((a) => !a)}
                  className={clsx(
                    "w-11 h-6 rounded-full transition-colors relative",
                    active ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                      active ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Adicionar itens */}
              {/* Adicionar itens */}
              <div className="border border-brand-border rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-brand-border bg-brand-bg">
                  <h3 className="font-medium text-ink-primary mb-3">
                    Selecione os produtos
                  </h3>

                  {/* Filtro por categoria + busca */}
                  <div className="space-y-2">
                    {/* Busca por texto */}
                    <input
                      placeholder="🔍 Buscar produto..."
                      value={selSearch}
                      onChange={(e) => setSelSearch(e.target.value)}
                      className="w-full border border-brand-border rounded-xl px-3 py-2 text-sm outline-none focus:border-gold"
                    />

                    {/* Categorias com scroll */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      <button
                        onClick={() => setSelCategory("")}
                        className={clsx(
                          "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                          selCategory === ""
                            ? "bg-ink-primary text-white border-ink-primary"
                            : "bg-white border-brand-border text-ink-secondary hover:border-gold"
                        )}
                      >
                        Todos
                      </button>
                      {[...new Set(products.map((p: any) => p.category?.name))]
                        .filter(Boolean)
                        .map((cat: any) => (
                          <button
                            key={cat}
                            onClick={() => setSelCategory(cat)}
                            className={clsx(
                              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                              selCategory === cat
                                ? "bg-ink-primary text-white border-ink-primary"
                                : "bg-white border-brand-border text-ink-secondary hover:border-gold"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Grid de produtos */}
                <div className="p-4 max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {products
                      .filter((p) =>
                        selCategory ? p.category?.name === selCategory : true
                      )
                      .filter((p) =>
                        selCategory ? p.category?.name === selCategory : true
                      )
                      .filter((p) =>
                        selSearch
                          ? p.name
                              .toLowerCase()
                              .includes(selSearch.toLowerCase())
                          : true
                      )
                      .map((p) => {
                        const img = p.images?.[0]?.url ?? p.imageUrl;
                        const isSelected = items.some(
                          (i) => i.productId === p.id && !i.variationId
                        );
                        const hasVariations = p.variations.length > 0;

                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (hasVariations) {
                                setSelProduct(p.id);
                                setShowVariationPicker(true);
                              } else {
                                setSelProduct(p.id);
                                setSelVariation("");
                                setShowPriceModal(p.id);
                              }
                            }}
                            className={clsx(
                              "relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-105",
                              isSelected
                                ? "border-gold ring-2 ring-gold/30"
                                : "border-transparent hover:border-gold/50"
                            )}
                          >
                            {/* Imagem */}
                            <div className="aspect-square bg-gray-100">
                              {img ? (
                                <img
                                  src={img}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                  🪄
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="p-1.5 bg-white">
                              <p className="text-xs font-medium text-ink-primary truncate">
                                {p.name}
                              </p>
                              <p className="text-xs text-gold font-bold">
                                R$ {p.price.toFixed(2).replace(".", ",")}
                              </p>
                              {hasVariations && (
                                <p className="text-xs text-ink-muted">
                                  {p.variations.length} variações
                                </p>
                              )}
                            </div>

                            {/* Check se selecionado */}
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Modal de variações */}
              {showVariationPicker && selProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-ink-primary">
                        {products.find((p) => p.id === selProduct)?.name}
                      </h3>
                      <button
                        onClick={() => {
                          setShowVariationPicker(false);
                          setSelProduct("");
                        }}
                        className="text-ink-muted hover:text-ink-primary"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-sm text-ink-secondary mb-3">
                      Selecione a variação ou adicione o produto inteiro:
                    </p>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {/* Produto inteiro */}
                      <button
                        onClick={() => {
                          setSelVariation("");
                          setShowVariationPicker(false);
                          setShowPriceModal(selProduct);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-brand-border hover:border-gold transition-colors text-left"
                      >
                        <span className="text-sm font-medium text-ink-primary">
                          Produto inteiro (todas variações)
                        </span>
                        <span className="text-xs text-gold font-bold">
                          R${" "}
                          {products
                            .find((p) => p.id === selProduct)
                            ?.price.toFixed(2)
                            .replace(".", ",")}
                        </span>
                      </button>

                      {/* Variações individuais */}
                      {products
                        .find((p) => p.id === selProduct)
                        ?.variations.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => {
                              setSelVariation(v.id);
                              setShowVariationPicker(false);
                              setShowPriceModal(selProduct);
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-xl border border-brand-border hover:border-gold transition-colors text-left"
                          >
                            <span className="text-sm font-medium text-ink-primary">
                              {v.name}
                            </span>
                            <span className="text-xs text-gold font-bold">
                              R$ {v.price.toFixed(2).replace(".", ",")}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal de preço promocional */}
              {showPriceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 animate-fade-in">
                    {(() => {
                      const product = products.find(
                        (p) => p.id === showPriceModal
                      );
                      const variation = product?.variations.find(
                        (v) => v.id === selVariation
                      );
                      const origPrice = variation?.price ?? product?.price ?? 0;
                      return (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-ink-primary">
                              Definir preço promocional
                            </h3>
                            <button
                              onClick={() => {
                                setShowPriceModal(null);
                                setSelProduct("");
                                setSelVariation("");
                              }}
                              className="text-ink-muted hover:text-ink-primary"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="bg-brand-bg rounded-xl p-3 mb-4">
                            <p className="text-sm font-medium text-ink-primary">
                              {product?.name}
                            </p>
                            {variation && (
                              <p className="text-xs text-ink-muted">
                                {variation.name}
                              </p>
                            )}
                            <p className="text-xs text-ink-secondary mt-1">
                              Preço original:{" "}
                              <span className="font-bold text-ink-primary">
                                R$ {origPrice.toFixed(2).replace(".", ",")}
                              </span>
                            </p>
                          </div>

                          <div className="mb-4">
                            <label className="text-sm font-medium text-ink-secondary mb-1 block">
                              Preço promocional (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              value={selSalePrice}
                              onChange={(e) => setSelSalePrice(e.target.value)}
                              className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold"
                              autoFocus
                            />
                            {selSalePrice &&
                              Number(selSalePrice) < origPrice && (
                                <p className="text-xs text-green-600 mt-1 font-medium">
                                  Desconto de{" "}
                                  {Math.round(
                                    ((origPrice - Number(selSalePrice)) /
                                      origPrice) *
                                      100
                                  )}
                                  % 🎉
                                </p>
                              )}
                            {selSalePrice &&
                              Number(selSalePrice) >= origPrice && (
                                <p className="text-xs text-red-500 mt-1">
                                  Preço promocional deve ser menor que o
                                  original
                                </p>
                              )}
                          </div>

                          {error && (
                            <p className="text-red-500 text-xs mb-3">{error}</p>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                addItem();
                                if (!error) setShowPriceModal(null);
                              }}
                              disabled={
                                !selSalePrice ||
                                Number(selSalePrice) >= origPrice
                              }
                              className="flex-1 bg-gold hover:bg-gold-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                            >
                              Adicionar à promoção
                            </button>
                            <button
                              onClick={() => {
                                setShowPriceModal(null);
                                setSelProduct("");
                                setSelVariation("");
                              }}
                              className="px-4 py-3 rounded-xl border border-brand-border text-ink-secondary hover:border-gold transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Itens adicionados */}
              {items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-ink-secondary">
                    {items.length} item(ns) na promoção:
                  </p>
                  {items.map((item, i) => {
                    const discount = Math.round(
                      ((item.originalPrice - item.salePrice) /
                        item.originalPrice) *
                        100
                    );
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-brand-bg rounded-xl p-3"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.product?.images?.[0]?.url ||
                          item.product?.imageUrl ? (
                            <img
                              src={
                                item.product?.images?.[0]?.url ??
                                item.product?.imageUrl ??
                                ""
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg flex items-center justify-center h-full">
                              🪄
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-primary truncate">
                            {item.product?.name}
                            {item.variation ? ` (${item.variation.name})` : ""}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-ink-muted line-through">
                              R${" "}
                              {item.originalPrice.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-xs font-bold text-green-600">
                              R$ {item.salePrice.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">
                              -{discount}%
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setItems((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                          className="text-ink-muted hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gold hover:bg-gold-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving
                    ? "Salvando..."
                    : editingId
                      ? "Salvar Alterações"
                      : "Criar Promoção"}
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-6 py-3 rounded-xl border border-brand-border text-ink-secondary hover:border-gold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de promoções */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-brand-border p-6 animate-pulse h-32"
              />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-24 text-ink-muted bg-white rounded-2xl border border-brand-border">
            <p className="text-5xl mb-4">⚡</p>
            <p className="font-medium text-ink-primary mb-1">
              Nenhuma promoção criada
            </p>
            <p className="text-sm">Crie sua primeira promoção relâmpago!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => {
              const status = getStatus(sale);
              return (
                <div
                  key={sale.id}
                  className="bg-white rounded-2xl border border-brand-border overflow-hidden"
                >
                  {/* Header da promoção */}
                  <div className="p-5 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-ink-primary">
                          {sale.title}
                        </h3>
                        <span
                          className={clsx(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            status.color
                          )}
                        >
                          {status.label}
                        </span>
                      </div>
                      {sale.description && (
                        <p className="text-sm text-ink-secondary mb-2">
                          {sale.description}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-ink-muted">
                        <span>
                          ⏰ Início:{" "}
                          {new Date(sale.startAt).toLocaleString("pt-BR")}
                        </span>
                        <span>
                          🏁 Fim: {new Date(sale.endAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted mt-1">
                        {sale.items.length} produto
                        {sale.items.length !== 1 ? "s" : ""} em promoção
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Toggle ativo */}
                      <button
                        onClick={() => toggleActive(sale.id, sale.active)}
                        className={clsx(
                          "w-11 h-6 rounded-full transition-colors relative",
                          sale.active ? "bg-green-500" : "bg-gray-300"
                        )}
                      >
                        <span
                          className={clsx(
                            "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                            sale.active ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(sale)}
                          className="text-xs bg-amber-50 hover:bg-amber-100 text-gold font-medium px-3 py-2 rounded-lg transition-colors"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => deleteSale(sale.id)}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-500 font-medium px-3 py-2 rounded-lg transition-colors"
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Itens da promoção */}
                  <div className="border-t border-brand-border px-5 py-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {sale.items.map((item, i) => {
                        const discount = Math.round(
                          ((item.originalPrice - item.salePrice) /
                            item.originalPrice) *
                            100
                        );
                        const img =
                          item.product?.images?.[0]?.url ??
                          item.product?.imageUrl;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-brand-bg rounded-xl p-2"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {img ? (
                                <img
                                  src={img}
                                  alt={item.product?.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg flex items-center justify-center h-full">
                                  🪄
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-ink-primary truncate">
                                {item.product?.name}
                                {item.variation
                                  ? ` (${item.variation.name})`
                                  : ""}
                              </p>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-ink-muted line-through">
                                  R${" "}
                                  {item.originalPrice
                                    .toFixed(2)
                                    .replace(".", ",")}
                                </span>
                                <span className="text-xs font-bold text-green-600">
                                  R${" "}
                                  {item.salePrice.toFixed(2).replace(".", ",")}
                                </span>
                              </div>
                              <span className="text-xs bg-red-100 text-red-600 font-bold px-1 rounded">
                                -{discount}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
