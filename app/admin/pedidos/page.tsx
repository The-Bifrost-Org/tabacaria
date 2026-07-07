"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { OrderCard } from "@/components/admin/OrderCard";

type StatusFilter =
  | "TODOS"
  | "RECEBIDO"
  | "CONFIRMADO"
  | "EM_ANDAMENTO"
  | "FINALIZADO"
  | "CANCELADO";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "RECEBIDO", label: "Recebidos" },
  { value: "CONFIRMADO", label: "Confirmados" },
  { value: "EM_ANDAMENTO", label: "Em Andamento" },
  { value: "FINALIZADO", label: "Finalizados" },
  { value: "CANCELADO", label: "Cancelados" }
];

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("TODOS");
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "EM_ANDAMENTO") {
        // pedidos PRONTO_RETIRADA ou A_CAMINHO — filtra client-side já que a API aceita 1 status por vez
      } else if (filter !== "TODOS") {
        params.set("status", filter);
      }

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();

      let result = data.orders ?? [];
      if (filter === "EM_ANDAMENTO") {
        result = result.filter((o: any) =>
          ["PRONTO_RETIRADA", "A_CAMINHO"].includes(o.status)
        );
      }

      setOrders(result);
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [filter]);

  function handleStatusChange(orderId: string, updatedOrder: any) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updatedOrder } : o))
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-10">
      <div className="sticky top-0 z-40 bg-white border-b border-brand-border px-4 h-14 flex items-center">
        <h1 className="font-display font-bold text-ink-primary">🏪 Pedidos</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={clsx(
                "px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors",
                filter === f.value
                  ? "bg-gold text-white border-gold"
                  : "border-brand-border text-ink-secondary hover:border-gold"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <p className="text-center text-ink-muted py-10">
            Carregando pedidos...
          </p>
        ) : orders.length === 0 ? (
          <p className="text-center text-ink-muted py-10">
            Nenhum pedido encontrado.
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
