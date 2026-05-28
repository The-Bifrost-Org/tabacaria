"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { CONFIG } from "@/lib/config";
import { clsx } from "clsx";

type Delivery = "retirada" | "entrega";
type Payment = "pix" | "card" | "cash";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, removeFromCart, updateQty } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState<Delivery>("retirada");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [payment, setPayment] = useState<Payment>("pix");
  const [needsChange, setNeedsChange] = useState(false);
  const [changeFor, setChangeFor] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const discountAmount = couponData?.discountAmount ?? 0;
  const deliveryFee =
    delivery === "entrega"
      ? subtotal - discountAmount >= CONFIG.FREE_DELIVERY_ABOVE
        ? 0
        : CONFIG.DELIVERY_FEE
      : 0;
  const total = subtotal - discountAmount + deliveryFee;

  useEffect(() => {
    if (items.length === 0) router.replace("/");
  }, [items, router]);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Informe seu nome";
    if (!phone.trim()) e.phone = "Informe seu telefone";
    if (delivery === "entrega") {
      if (!street.trim()) e.street = "Informe a rua";
      if (!number.trim()) e.number = "Informe o número";
      if (!neighborhood.trim()) e.neighborhood = "Informe o bairro";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    if (couponData) {
      await fetch(`/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponData.code,
          subtotal,
          increment: true
        })
      });
    }
    const paymentLabel =
      CONFIG.PAYMENT_OPTIONS.find((p) => p.id === payment)?.label ?? "";
    const order = {
      items,
      subtotal,
      discountAmount,
      deliveryFee,
      total,
      couponCode: couponData?.code,
      name,
      phone,
      delivery,
      payment,
      paymentLabel,
      street,
      number,
      neighborhood,
      needsChange,
      changeFor: changeFor ? Number(changeFor) : undefined
    };
    sessionStorage.setItem("tabacaria_order", JSON.stringify(order));
    router.push("/confirmacao");
  }

  const inputClass = (field: string) =>
    clsx(
      "w-full border rounded-xl px-4 py-3 text-sm text-ink-primary outline-none transition-colors",
      errors[field]
        ? "border-red-400 focus:border-red-400"
        : "border-brand-border focus:border-gold"
    );

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponData(null);

    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal })
    });

    const data = await res.json();
    if (res.ok) {
      setCouponData(data);
    } else {
      setCouponError(data.error);
    }
    setCouponLoading(false);
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-40">
      {/* Drawer editar carrinho */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setCartOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl p-6 h-[60vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-ink-primary">
                Editar Pedido
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-ink-muted hover:text-ink-primary text-xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-brand-bg rounded-xl p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-ink-primary truncate">
                      {item.name}
                    </p>
                    {item.variation && (
                      <p className="text-xs text-ink-muted">{item.variation}</p>
                    )}
                    <p className="text-xs font-bold text-gold mt-0.5">
                      R${" "}
                      {(item.unitPrice * item.qty).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateQty(item.productId, item.qty - 1, item.variation)
                      }
                      className="w-7 h-7 rounded-full border border-brand-border flex items-center justify-center text-sm font-bold text-ink-secondary hover:border-red-400 hover:text-red-400 transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={item.qty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val))
                          updateQty(item.productId, val, item.variation);
                      }}
                      className="w-10 text-center text-sm font-bold text-ink-primary bg-white border border-brand-border rounded-lg py-1 outline-none focus:border-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() =>
                        updateQty(item.productId, item.qty + 1, item.variation)
                      }
                      className="w-7 h-7 rounded-full border border-brand-border flex items-center justify-center text-sm font-bold text-ink-secondary hover:border-gold hover:text-gold transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      removeFromCart(item.productId, item.variation)
                    }
                    className="text-ink-muted hover:text-red-500 transition-colors text-lg"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-brand-border px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-ink-secondary hover:text-ink-primary"
        >
          ← Voltar
        </button>
        <h1 className="font-display font-bold text-ink-primary">
          Finalizar Pedido
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Resumo */}
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
          <h2 className="font-semibold text-ink-primary mb-3">
            Resumo do Pedido
          </h2>

          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white rounded-xl p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-ink-primary truncate">
                  {item.name}
                </p>
                {item.variation && (
                  <p className="text-xs text-ink-muted">{item.variation}</p>
                )}
                <p className="text-xs font-bold text-gold mt-0.5">
                  R$ {(item.unitPrice * item.qty).toFixed(2).replace(".", ",")}
                </p>
              </div>

              {/* Quantidade inline */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    updateQty(item.productId, item.qty - 1, item.variation)
                  }
                  className="w-7 h-7 rounded-full border border-brand-border flex items-center justify-center text-sm font-bold text-ink-secondary hover:border-red-400 hover:text-red-400 transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  value={item.qty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val))
                      updateQty(item.productId, val, item.variation);
                  }}
                  className="w-10 text-center text-sm font-bold text-ink-primary bg-brand-bg border border-brand-border rounded-lg py-1 outline-none focus:border-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() =>
                    updateQty(item.productId, item.qty + 1, item.variation)
                  }
                  className="w-7 h-7 rounded-full border border-brand-border flex items-center justify-center text-sm font-bold text-ink-secondary hover:border-gold hover:text-gold transition-colors"
                >
                  +
                </button>
              </div>

              {/* Remover */}
              <button
                onClick={() => removeFromCart(item.productId, item.variation)}
                className="text-ink-muted hover:text-red-500 transition-colors text-lg"
              >
                🗑️
              </button>
            </div>
          ))}

          <div className="border-t border-amber-200 pt-2 mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-ink-secondary">Subtotal</span>
              <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            </div>
            {couponData && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span>Desconto ({couponData.code})</span>
                <span>
                  - R$ {couponData.discountAmount.toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-ink-secondary">Taxa de entrega</span>
              <span
                className={
                  deliveryFee === 0 && delivery === "entrega"
                    ? "text-green-600 font-medium"
                    : ""
                }
              >
                {delivery === "retirada"
                  ? "Grátis"
                  : deliveryFee === 0
                    ? "🎉 Grátis"
                    : `R$ ${deliveryFee.toFixed(2).replace(".", ",")}`}
              </span>
            </div>
            {delivery === "entrega" && deliveryFee > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Faltam R${" "}
                {(CONFIG.FREE_DELIVERY_ABOVE - subtotal)
                  .toFixed(2)
                  .replace(".", ",")}{" "}
                para entrega grátis!
              </p>
            )}
            <div className="flex justify-between font-bold text-gold text-base pt-1">
              <span>Total</span>
              <span>R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </section>

        {/* Dados */}
        <section className="space-y-3">
          <h2 className="font-semibold text-ink-primary">Seus Dados</h2>
          <div>
            <input
              className={inputClass("name")}
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <input
              className={inputClass("phone")}
              placeholder="Telefone / WhatsApp"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
        </section>

        {/* Entrega */}
        <section className="space-y-3">
          <h2 className="font-semibold text-ink-primary">Método de Entrega</h2>
          <div className="grid grid-cols-2 gap-3">
            {(["retirada", "entrega"] as Delivery[]).map((d) => (
              <button
                key={d}
                onClick={() => setDelivery(d)}
                className={clsx(
                  "py-3 rounded-xl border text-sm font-medium transition-all",
                  delivery === d
                    ? "border-gold bg-amber-50 text-gold ring-2 ring-gold"
                    : "border-brand-border text-ink-secondary hover:border-gold"
                )}
              >
                {d === "retirada" ? "🏪 Retirada" : "🛵 Entrega"}
              </button>
            ))}
          </div>

          {delivery === "entrega" && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <input
                  className={inputClass("street")}
                  placeholder="Rua"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
                {errors.street && (
                  <p className="text-red-500 text-xs mt-1">{errors.street}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    className={inputClass("number")}
                    placeholder="Número"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                  {errors.number && (
                    <p className="text-red-500 text-xs mt-1">{errors.number}</p>
                  )}
                </div>
                <div>
                  <input
                    className={inputClass("neighborhood")}
                    placeholder="Bairro"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                  />
                  {errors.neighborhood && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.neighborhood}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Pagamento */}
        <section className="space-y-3">
          <h2 className="font-semibold text-ink-primary">Forma de Pagamento</h2>
          <div className="grid grid-cols-3 gap-2">
            {CONFIG.PAYMENT_OPTIONS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPayment(p.id as Payment)}
                className={clsx(
                  "py-3 rounded-xl border text-sm font-medium transition-all",
                  payment === p.id
                    ? "border-gold bg-amber-50 text-gold ring-2 ring-gold"
                    : "border-brand-border text-ink-secondary hover:border-gold"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {payment === "cash" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-secondary">
                  Precisa de troco?
                </span>
                <button
                  onClick={() => setNeedsChange((n) => !n)}
                  className={clsx(
                    "w-11 h-6 rounded-full transition-colors relative",
                    needsChange ? "bg-gold" : "bg-gray-200"
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                      needsChange ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
              {needsChange && (
                <input
                  className={inputClass("changeFor")}
                  placeholder="Troco para R$"
                  type="number"
                  value={changeFor}
                  onChange={(e) => setChangeFor(e.target.value)}
                />
              )}
            </div>
          )}
        </section>
        {/* Cupom */}
        <section className="space-y-3">
          <h2 className="font-semibold text-ink-primary">Cupom de Desconto</h2>
          <div className="flex gap-2">
            <input
              placeholder="Código do cupom"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setCouponData(null);
                setCouponError("");
              }}
              disabled={!!couponData}
              className="flex-1 border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold font-mono tracking-widest disabled:bg-gray-50 disabled:text-ink-muted"
            />
            {couponData ? (
              <button
                onClick={() => {
                  setCouponData(null);
                  setCouponCode("");
                }}
                className="px-4 py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Remover
              </button>
            ) : (
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="px-4 py-3 rounded-xl bg-ink-primary text-white text-sm font-medium hover:bg-ink-secondary transition-colors disabled:opacity-50"
              >
                {couponLoading ? "..." : "Aplicar"}
              </button>
            )}
          </div>

          {couponError && <p className="text-red-500 text-xs">{couponError}</p>}

          {couponData && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-green-600 text-lg">🎟️</span>
              <div>
                <p className="text-sm font-semibold text-green-700">
                  {couponData.code} aplicado!
                </p>
                <p className="text-xs text-green-600">
                  Desconto de R${" "}
                  {couponData.discountAmount.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Botão fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-border p-4">
        <button
          onClick={handleSubmit}
          className="w-full max-w-lg mx-auto block bg-gold hover:bg-gold-dark text-white font-bold py-4 rounded-2xl transition-colors"
        >
          Finalizar Pedido 📱
        </button>
      </div>
    </div>
  );
}
