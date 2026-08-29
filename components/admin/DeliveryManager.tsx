"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

export function DeliveryManager() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [cutoff, setCutoff] = useState("20:00");
  const [withinTime, setWithinTime] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/delivery-config")
      .then((r) => r.json())
      .then((data) => {
        setEnabled(data.manualEnabled);
        setCutoff(data.cutoff);
        setWithinTime(data.withinTime);
        setLoading(false);
      });
  }, []);

  async function toggleEnabled() {
    setSaving(true);
    const newValue = !enabled;
    setEnabled(newValue);
    await fetch("/api/delivery-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: newValue }),
    });
    setSaving(false);
  }

  async function saveCutoff() {
    setSaving(true);
    await fetch("/api/delivery-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cutoff }),
    });
    setSaving(false);
  }

  const deliveryActive = enabled && withinTime;

  return (
    <section className="bg-white rounded-2xl border border-brand-border overflow-hidden">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between p-4 hover:bg-brand-bg transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink-primary">🛵 Entregas</span>
          <span className={clsx(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            deliveryActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          )}>
            {deliveryActive ? "Ativa" : "Inativa"}
          </span>
        </div>
        <span className="text-ink-muted text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-brand-border p-4 space-y-4">
          {loading ? (
            <p className="text-sm text-ink-muted text-center">Carregando...</p>
          ) : (
            <>
              {/* Toggle manual */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-primary">Entrega habilitada</p>
                  <p className="text-xs text-ink-muted">Ativar ou desativar manualmente</p>
                </div>
                <button
                  onClick={toggleEnabled}
                  disabled={saving}
                  className={clsx(
                    "w-11 h-6 rounded-full transition-colors relative flex-shrink-0",
                    enabled ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  <span className={clsx(
                    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                    enabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>

              {/* Horário limite */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink-primary">Horário limite</p>
                  <p className="text-xs text-ink-muted">Entrega desativa automaticamente após este horário</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={cutoff}
                    onChange={(e) => setCutoff(e.target.value)}
                    className="border border-brand-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-gold"
                  />
                  <button
                    onClick={saveCutoff}
                    disabled={saving}
                    className="bg-gold hover:bg-gold-dark text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? "..." : "Salvar"}
                  </button>
                </div>
              </div>

              {/* Status atual */}
              <div className={clsx(
                "rounded-xl p-3 text-sm",
                deliveryActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              )}>
                {deliveryActive
                  ? `✅ Entrega ativa até ${cutoff}`
                  : !enabled
                    ? "🚫 Entrega desativada manualmente"
                    : `⏰ Fora do horário de entrega (limite: ${cutoff})`
                }
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}