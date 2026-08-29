"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: string;
  active: boolean;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    const res = await fetch("/api/coupons");
    setCoupons(await res.json());
  }

  function resetForm() {
    setCode("");
    setDiscount("");
    setType("percent");
    setMaxUses("");
    setExpiresAt("");
    setActive(true);
    setError("");
    setEditingId(null);
  }

  function openEdit(coupon: Coupon) {
    setCode(coupon.code);
    setDiscount(String(coupon.discount));
    setType(coupon.type as "percent" | "fixed");
    setMaxUses(coupon.maxUses ? String(coupon.maxUses) : "");
    setExpiresAt(coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "");
    setActive(coupon.active);
    setEditingId(coupon.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!code.trim() || !discount) {
      setError("Preencha código e desconto");
      return;
    }
    setLoading(true);
    setError("");

    const body = {
      code,
      discount,
      type,
      maxUses: maxUses || null,
      expiresAt: expiresAt || null,
      active
    };

    const res = await fetch(
      editingId ? `/api/coupons/${editingId}` : "/api/coupons",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    if (res.ok) {
      resetForm();
      setShowForm(false);
      fetchCoupons();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erro ao salvar");
    }
    setLoading(false);
  }

  async function toggleActive(id: string, current: boolean) {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !current } : c))
    );
    await fetch(`/api/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current })
    });
  }

  async function deleteCoupon(id: string) {
    if (!confirm("Excluir este cupom?")) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  function isExpired(coupon: Coupon) {
    return coupon.expiresAt ? new Date() > new Date(coupon.expiresAt) : false;
  }

  function isExhausted(coupon: Coupon) {
    return coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;
  }

  function getStatus(coupon: Coupon) {
    if (!coupon.active)
      return { label: "Inativo", color: "bg-gray-100 text-gray-500" };
    if (isExpired(coupon))
      return { label: "Expirado", color: "bg-red-100 text-red-600" };
    if (isExhausted(coupon))
      return { label: "Esgotado", color: "bg-orange-100 text-orange-600" };
    return { label: "Ativo", color: "bg-green-100 text-green-700" };
  }

  return (
    <section className="bg-white rounded-2xl border border-brand-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-brand-border">
        <h2 className="font-semibold text-ink-primary">
          🎟️ Cupons de Desconto
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm((s) => !s);
          }}
          className="text-sm text-gold hover:text-gold-dark font-medium transition-colors"
        >
          + Novo
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="p-4 bg-brand-bg border-b border-brand-border space-y-3 animate-fade-in">
          <h3 className="font-medium text-ink-primary text-sm">
            {editingId ? "Editar Cupom" : "Novo Cupom"}
          </h3>

          {/* Código */}
          <input
            placeholder="Código (ex: SUAVE10)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full border border-brand-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold font-mono tracking-widest"
          />

          {/* Tipo e desconto */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "percent" | "fixed")}
                className="w-full border border-brand-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold"
              >
                <option value="percent">Percentual (%)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">
                Desconto {type === "percent" ? "(%)" : "(R$)"}
              </label>
              <input
                type="number"
                placeholder={type === "percent" ? "Ex: 10" : "Ex: 5.00"}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full border border-brand-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Limite e validade */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-ink-muted mb-1 block">
                Limite de usos
              </label>
              <input
                type="number"
                placeholder="Ilimitado"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full border border-brand-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">
                Validade
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full border border-brand-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Ativo */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-secondary">Cupom ativo</span>
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

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-gold hover:bg-gold-dark text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Salvando..." : editingId ? "Salvar" : "Criar Cupom"}
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="px-4 py-2.5 rounded-xl border border-brand-border text-sm text-ink-secondary hover:border-gold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de cupons */}
      {coupons.length === 0 ? (
        <p className="text-sm text-ink-muted p-4 text-center">
          Nenhum cupom criado
        </p>
      ) : (
        <div className="divide-y divide-brand-border">
          {coupons.map((coupon) => {
            const status = getStatus(coupon);
            return (
              <div key={coupon.id} className="p-4 flex items-center gap-3">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-ink-primary tracking-widest text-sm">
                      {coupon.code}
                    </span>
                    <span
                      className={clsx(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        status.color
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-gold font-bold">
                    {coupon.type === "percent"
                      ? `${coupon.discount}% de desconto`
                      : `R$ ${coupon.discount.toFixed(2).replace(".", ",")} de desconto`}
                  </p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-ink-muted">
                      {coupon.usedCount}/{coupon.maxUses ?? "∞"} usos
                    </span>
                    {coupon.expiresAt && (
                      <span className="text-xs text-ink-muted">
                        Válido até{" "}
                        {new Date(coupon.expiresAt).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Toggle ativo */}
                <button
                  onClick={() => toggleActive(coupon.id, coupon.active)}
                  className={clsx(
                    "w-11 h-6 rounded-full transition-colors relative flex-shrink-0",
                    coupon.active ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                      coupon.active ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>

                {/* Ações */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(coupon)}
                    className="text-xs bg-amber-50 hover:bg-amber-100 text-gold font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => deleteCoupon(coupon.id)}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-500 font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
