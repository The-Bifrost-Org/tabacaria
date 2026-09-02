"use client";

import { clsx } from "clsx";
import { useState } from "react";

type OrderStatus =
  | "RECEBIDO"
  | "CONFIRMADO"
  | "PRONTO_RETIRADA"
  | "A_CAMINHO"
  | "FINALIZADO"
  | "CANCELADO";

interface OrderItem {
  id: string;
  productName: string;
  variationName?: string | null;
  unitPrice: number;
  qty: number;
}

const NOTIFY_STATUSES: OrderStatus[] = [
  "PRONTO_RETIRADA",
  "A_CAMINHO",
  "FINALIZADO",
  "CANCELADO"
];

interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  deliveryType: "RETIRADA" | "ENTREGA";
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  paymentType: "PIX" | "CARTAO" | "DINHEIRO";
  needsChange: boolean;
  changeFor?: number | null;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  RECEBIDO: "Recebido",
  CONFIRMADO: "Confirmado",
  PRONTO_RETIRADA: "Pronto p/ Retirada",
  A_CAMINHO: "A Caminho",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado"
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  RECEBIDO: "bg-blue-100 text-blue-700",
  CONFIRMADO: "bg-indigo-100 text-indigo-700",
  PRONTO_RETIRADA: "bg-amber-100 text-amber-700",
  A_CAMINHO: "bg-amber-100 text-amber-700",
  FINALIZADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700"
};

// próximo status possível a partir do atual, considerando retirada vs entrega
function getNextAction(
  order: Order
): { status: OrderStatus; label: string } | null {
  switch (order.status) {
    case "RECEBIDO":
      return { status: "CONFIRMADO", label: "Confirmar Pedido" };
    case "CONFIRMADO":
      return order.deliveryType === "RETIRADA"
        ? { status: "PRONTO_RETIRADA", label: "Marcar Pronto p/ Retirada" }
        : { status: "A_CAMINHO", label: "Marcar Saiu p/ Entrega" };
    case "PRONTO_RETIRADA":
    case "A_CAMINHO":
      return { status: "FINALIZADO", label: "Finalizar Pedido" };
    default:
      return null;
  }
}

const fmt = (v: number) => v.toFixed(2).replace(".", ",");

export function OrderCard({
  order,
  onStatusChange
}: {
  order: Order;
  onStatusChange: (orderId: string, newOrder: Order) => void;
}) {
  const [loading, setLoading] = useState<"advance" | "cancel" | null>(null);
  const [expanded, setExpanded] = useState(false);

  const nextAction = getNextAction(order);
  const canCancel =
    order.status !== "FINALIZADO" && order.status !== "CANCELADO";

  async function updateStatus(status: OrderStatus) {
    setLoading(status === "CANCELADO" ? "cancel" : "advance");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erro ao atualizar pedido.");
        return;
      }

      const { order: updatedOrder, whatsappUrl } = await res.json();
      onStatusChange(order.id, updatedOrder);

      // só abre WhatsApp para status que o cliente realmente precisa saber
      if (whatsappUrl && NOTIFY_STATUSES.includes(status)) {
        window.open(whatsappUrl, "_blank");
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Não foi possível atualizar o pedido. Verifique sua conexão.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-white border border-brand-border rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display font-bold text-ink-primary">
            Pedido #{order.orderNumber}
          </p>
          <p className="text-sm text-ink-secondary">{order.customerName}</p>
          <p className="text-xs text-ink-muted">{order.customerPhone}</p>
        </div>
        <span
          className={clsx(
            "text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap",
            STATUS_STYLES[order.status]
          )}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        className="text-xs text-gold hover:text-gold-dark font-medium"
      >
        {expanded ? "Ocultar itens ▲" : `Ver ${order.items.length} item(s) ▼`}
      </button>

      {expanded && (
        <div className="bg-brand-bg rounded-xl p-3 space-y-1 text-sm">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-ink-secondary"
            >
              <span>
                {item.qty}x {item.productName}
                {item.variationName ? ` (${item.variationName})` : ""}
              </span>
              <span>R$ {fmt(item.unitPrice * item.qty)}</span>
            </div>
          ))}
          {order.deliveryType === "ENTREGA" && (
            <p className="text-xs text-ink-muted pt-2 border-t border-brand-border mt-2">
              📍 {order.street}, {order.number} — {order.neighborhood}
            </p>
          )}
          {order.needsChange && order.changeFor && (
            <p className="text-xs text-ink-muted">
              💵 Troco para R$ {fmt(order.changeFor)}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-brand-border">
        <span className="font-bold text-gold">R$ {fmt(order.total)}</span>
        <div className="flex gap-2">
          {canCancel && (
            <button
              onClick={() => updateStatus("CANCELADO")}
              disabled={loading !== null}
              className="text-xs px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {loading === "cancel" ? "..." : "Cancelar"}
            </button>
          )}
          {nextAction && (
            <button
              onClick={() => updateStatus(nextAction.status)}
              disabled={loading !== null}
              className="text-xs px-3 py-2 rounded-lg bg-gold hover:bg-gold-dark text-white font-medium transition-colors disabled:opacity-50"
            >
              {loading === "advance" ? "..." : `${nextAction.label} 📲`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
