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
  const { items, subtotal, clearCart } = useCart();

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

  const deliveryFee = delivery === "entrega" ? CONFIG.DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

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

  function handleSubmit() {
    if (!validate()) return;

    const paymentLabel =
      CONFIG.PAYMENT_OPTIONS.find((p) => p.id === payment)?.label ?? "";

    const order = {
      items,
      subtotal,
      deliveryFee,
      total,
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

  return (
    <div className="min-h-screen bg-brand-bg pb-40">
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
            <div key={i} className="flex justify-between text-sm">
              <span className="text-ink-secondary">
                {item.qty}x {item.name}
                {item.variation ? ` (${item.variation})` : ""}
              </span>
              <span className="font-medium text-ink-primary">
                R$ {(item.unitPrice * item.qty).toFixed(2).replace(".", ",")}
              </span>
            </div>
          ))}
          <div className="border-t border-amber-200 pt-2 mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-ink-secondary">Subtotal</span>
              <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-secondary">Taxa de entrega</span>
              <span>
                {deliveryFee > 0
                  ? `R$ ${deliveryFee.toFixed(2).replace(".", ",")}`
                  : "Grátis"}
              </span>
            </div>
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
                    "w-12 h-6 rounded-full transition-colors relative",
                    needsChange ? "bg-gold" : "bg-gray-200"
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      needsChange ? "translate-x-7" : "translate-x-1"
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
