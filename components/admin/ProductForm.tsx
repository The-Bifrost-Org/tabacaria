"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

interface Variation {
  name: string;
  price: string;
}
interface Category {
  id: string;
  name: string;
}

interface Props {
  productId?: string;
}

export function ProductForm({ productId }: Props) {
  const router = useRouter();
  const isEdit = !!productId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [hasVariations, setHasVariations] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([
    { name: "", price: "" }
  ]);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((p) => {
        setName(p.name);
        setCategoryId(p.categoryId);
        setPrice(String(p.price));
        setAvailable(p.available);
        setImageUrl(p.imageUrl ?? null);
        if (p.variations?.length > 0) {
          setHasVariations(true);
          setVariations(
            p.variations.map((v: any) => ({
              name: v.name,
              price: String(v.price)
            }))
          );
        }
        setLoadingData(false);
      });
  }, [productId, isEdit]);

  function addVariation() {
    setVariations((prev) => [...prev, { name: "", price: "" }]);
  }

  function removeVariation(i: number) {
    setVariations((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateVariation(i: number, field: "name" | "price", value: string) {
    setVariations((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v))
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Informe o nome";
    if (!categoryId) e.categoryId = "Selecione a categoria";
    if (!hasVariations && !price) e.price = "Informe o preço";
    if (hasVariations) {
      variations.forEach((v, i) => {
        if (!v.name.trim()) e[`var_name_${i}`] = "Nome obrigatório";
        if (!v.price) e[`var_price_${i}`] = "Preço obrigatório";
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setLoading(true);

    const body = {
      name,
      categoryId,
      available,
      imageUrl,
      price: hasVariations
        ? Math.min(...variations.map((v) => Number(v.price)))
        : Number(price),
      variations: hasVariations
        ? variations.map((v) => ({ name: v.name, price: Number(v.price) }))
        : []
    };

    const res = await fetch(
      isEdit ? `/api/products/${productId}` : "/api/products",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    if (res.ok) {
      router.push("/admin");
    } else {
      setErrors({ global: "Erro ao salvar produto" });
    }
    setLoading(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setImageUrl(data.url);
    setUploading(false);
  }

  const inputClass = (field: string) =>
    clsx(
      "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors",
      errors[field]
        ? "border-red-400 focus:border-red-400"
        : "border-brand-border focus:border-gold"
    );

  if (loadingData) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <p className="text-ink-muted">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-brand-border px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-ink-secondary hover:text-ink-primary"
        >
          ← Voltar
        </button>
        <h1 className="font-display font-bold text-ink-primary">
          {isEdit ? "Editar Produto" : "Novo Produto"}
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Nome */}
        <div>
          <label className="text-sm font-medium text-ink-secondary mb-1 block">
            Nome do produto
          </label>
          <input
            className={inputClass("name")}
            placeholder="Ex: Essência Premium"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>
        {/* Upload de imagem */}
        <div>
          <label className="text-sm font-medium text-ink-secondary mb-1 block">
            Foto do produto
          </label>
          <div className="border-2 border-dashed border-brand-border rounded-xl p-4 text-center">
            {imageUrl ? (
              <div>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <button
                  onClick={() => setImageUrl(null)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remover foto
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm text-ink-muted mb-1">
                  {uploading ? "Enviando..." : "Clique para enviar uma foto"}
                </p>
                <p className="text-xs text-ink-muted">JPG, PNG ou WEBP</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className="text-sm font-medium text-ink-secondary mb-1 block">
            Categoria
          </label>
          <select
            className={inputClass("categoryId")}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
          )}
        </div>

        {/* Disponível */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-secondary">
            Disponível
          </span>
          <button
            onClick={() => setAvailable((a) => !a)}
            className={clsx(
              "w-11 h-6 rounded-full transition-colors relative",
              available ? "bg-green-500" : "bg-gray-300"
            )}
          >
            <span
              className={clsx(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                available ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Variações toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-secondary">
            Tem variações? (ex: sabores)
          </span>
          <button
            onClick={() => setHasVariations((v) => !v)}
            className={clsx(
              "w-11 h-6 rounded-full transition-colors relative",
              hasVariations ? "bg-gold" : "bg-gray-300"
            )}
          >
            <span
              className={clsx(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                hasVariations ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Preço único */}
        {!hasVariations && (
          <div className="animate-fade-in">
            <label className="text-sm font-medium text-ink-secondary mb-1 block">
              Preço (R$)
            </label>
            <input
              className={inputClass("price")}
              placeholder="0,00"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            )}
          </div>
        )}

        {/* Variações */}
        {hasVariations && (
          <div className="space-y-3 animate-fade-in">
            <label className="text-sm font-medium text-ink-secondary block">
              Variações
            </label>
            {variations.map((v, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1">
                  <input
                    className={inputClass(`var_name_${i}`)}
                    placeholder="Nome (ex: Mint)"
                    value={v.name}
                    onChange={(e) => updateVariation(i, "name", e.target.value)}
                  />
                  {errors[`var_name_${i}`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`var_name_${i}`]}
                    </p>
                  )}
                </div>
                <div className="w-28">
                  <input
                    className={inputClass(`var_price_${i}`)}
                    placeholder="R$"
                    type="number"
                    step="0.01"
                    value={v.price}
                    onChange={(e) =>
                      updateVariation(i, "price", e.target.value)
                    }
                  />
                  {errors[`var_price_${i}`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`var_price_${i}`]}
                    </p>
                  )}
                </div>
                {variations.length > 1 && (
                  <button
                    onClick={() => removeVariation(i)}
                    className="mt-3 text-red-400 hover:text-red-600 text-lg"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addVariation}
              className="text-sm text-gold hover:text-gold-dark font-medium transition-colors"
            >
              + Adicionar variação
            </button>
          </div>
        )}

        {errors.global && (
          <p className="text-red-500 text-sm text-center">{errors.global}</p>
        )}
      </div>

      {/* Botão fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-border p-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full max-w-lg mx-auto block bg-gold hover:bg-gold-dark text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50"
        >
          {loading
            ? "Salvando..."
            : isEdit
              ? "Salvar Alterações"
              : "Criar Produto"}
        </button>
      </div>
    </div>
  );
}
