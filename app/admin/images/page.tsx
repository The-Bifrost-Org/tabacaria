"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

interface BlobImage {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  inUse: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImagesPage() {
  const router = useRouter();
  const [images, setImages] = useState<BlobImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "used" | "unused">("all");
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<BlobImage | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    setLoading(true);
    const res = await fetch("/api/admin/images");
    setImages(await res.json());
    setLoading(false);
  }

  function toggleSelect(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      return next;
    });
  }

  function selectAll() {
    const visible = filtered.map((i) => i.url);
    const allSelected = visible.every((url) => selected.has(url));
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        visible.forEach((url) => next.delete(url));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...visible]));
    }
  }

  function selectUnused() {
    const unused = images.filter((i) => !i.inUse).map((i) => i.url);
    setSelected(new Set(unused));
  }

  async function deleteSelected() {
    if (selected.size === 0) return;
    if (
      !confirm(
        `Excluir ${selected.size} imagem(ns)? Esta ação não pode ser desfeita.`
      )
    )
      return;

    setDeleting(true);
    await fetch("/api/admin/images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: [...selected] })
    });
    setSelected(new Set());
    await fetchImages();
    setDeleting(false);
  }

  const filtered = images.filter((img) => {
    if (filter === "used") return img.inUse;
    if (filter === "unused") return !img.inUse;
    return true;
  });

  const totalSize = images.reduce((acc, i) => acc + i.size, 0);
  const unusedSize = images
    .filter((i) => !i.inUse)
    .reduce((acc, i) => acc + i.size, 0);
  const unusedCount = images.filter((i) => !i.inUse).length;
  const selectedSize = images
    .filter((i) => selected.has(i.url))
    .reduce((acc, i) => acc + i.size, 0);

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
            🖼️ Galeria de Imagens
          </h1>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={deleteSelected}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              🗑️{" "}
              {deleting
                ? "Excluindo..."
                : `Excluir ${selected.size} (${formatSize(selectedSize)})`}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Cards resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-brand-border p-4 text-center">
            <p className="text-2xl font-bold text-ink-primary">
              {images.length}
            </p>
            <p className="text-sm text-ink-muted mt-1">Total de imagens</p>
          </div>
          <div className="bg-white rounded-2xl border border-brand-border p-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {images.filter((i) => i.inUse).length}
            </p>
            <p className="text-sm text-ink-muted mt-1">Em uso</p>
          </div>
          <div className="bg-white rounded-2xl border border-brand-border p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{unusedCount}</p>
            <p className="text-sm text-ink-muted mt-1">Não utilizadas</p>
          </div>
          <div className="bg-white rounded-2xl border border-brand-border p-4 text-center">
            <p className="text-2xl font-bold text-ink-primary">
              {formatSize(totalSize)}
            </p>
            <p className="text-sm text-ink-muted mt-1">Espaço total</p>
          </div>
        </div>

        {/* Alerta de imagens não utilizadas */}
        {unusedCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-800">
                  {unusedCount} imagem(ns) não utilizadas ocupando{" "}
                  {formatSize(unusedSize)}
                </p>
                <p className="text-sm text-amber-600">
                  Você pode excluir estas imagens para liberar espaço
                </p>
              </div>
            </div>
            <button
              onClick={selectUnused}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors flex-shrink-0"
            >
              Selecionar todas não utilizadas
            </button>
          </div>
        )}

        {/* Filtros e ações em massa */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtros */}
          <div className="flex gap-2">
            {(["all", "used", "unused"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-3 py-2 rounded-xl border text-sm font-medium transition-colors",
                  filter === f
                    ? "bg-ink-primary text-white border-ink-primary"
                    : "bg-white border-brand-border text-ink-secondary hover:border-gold"
                )}
              >
                {f === "all"
                  ? `Todas (${images.length})`
                  : f === "used"
                    ? `✅ Em uso (${images.filter((i) => i.inUse).length})`
                    : `🗑️ Não usadas (${unusedCount})`}
              </button>
            ))}
          </div>

          <button
            onClick={selectAll}
            className="ml-auto text-sm text-gold hover:text-gold-dark font-medium transition-colors"
          >
            {filtered.every((i) => selected.has(i.url))
              ? "Desmarcar todas"
              : "Selecionar todas"}
          </button>
        </div>

        {/* Grid de imagens */}
        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-ink-muted bg-white rounded-2xl border border-brand-border">
            <p className="text-4xl mb-3">🖼️</p>
            <p className="text-sm">Nenhuma imagem encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map((img) => {
              const isSelected = selected.has(img.url);
              return (
                <div
                  key={img.url}
                  className={clsx(
                    "relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all group",
                    isSelected
                      ? "border-red-500 ring-2 ring-red-200"
                      : img.inUse
                        ? "border-green-300 hover:border-green-500"
                        : "border-gray-200 hover:border-red-300"
                  )}
                  onClick={() => toggleSelect(img.url)}
                >
                  {/* Imagem */}
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={img.url}
                      alt={img.pathname}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Overlay selecionado */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">✓</span>
                      </div>
                    </div>
                  )}

                  {/* Badge status */}
                  <div
                    className={clsx(
                      "absolute top-1 left-1 text-xs font-bold px-1.5 py-0.5 rounded-full",
                      img.inUse
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    )}
                  >
                    {img.inUse ? "✓" : "✕"}
                  </div>

                  {/* Info no hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="truncate">{img.pathname.split("/").pop()}</p>
                    <p>{formatSize(img.size)}</p>
                  </div>

                  {/* Botão preview */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(img);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/80 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    🔍
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal preview */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-lg w-full animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={preview.url}
              alt={preview.pathname}
              className="w-full object-contain max-h-96"
            />
            <div className="p-4 space-y-2">
              <p className="text-sm font-medium text-ink-primary truncate">
                {preview.pathname}
              </p>
              <div className="flex items-center gap-3 text-xs text-ink-muted">
                <span>{formatSize(preview.size)}</span>
                <span>
                  {new Date(preview.uploadedAt).toLocaleDateString("pt-BR")}
                </span>
                <span
                  className={clsx(
                    "font-bold px-2 py-0.5 rounded-full",
                    preview.inUse
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  )}
                >
                  {preview.inUse ? "✅ Em uso" : "⚠️ Não utilizada"}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-ink-primary text-white py-2 rounded-xl text-sm font-medium hover:bg-ink-secondary transition-colors"
                >
                  Abrir original
                </a>
                {!preview.inUse && (
                  <button
                    onClick={() => {
                      toggleSelect(preview.url);
                      setPreview(null);
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Selecionar para excluir
                  </button>
                )}
                <button
                  onClick={() => setPreview(null)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-ink-secondary hover:border-gold transition-colors text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
