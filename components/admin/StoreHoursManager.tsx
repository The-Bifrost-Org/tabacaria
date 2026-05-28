"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface StoreHour {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  active: boolean;
}

const DAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado"
];

export function StoreHoursManager() {
  const [hours, setHours] = useState<StoreHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchHours();
  }, []);

  async function fetchHours() {
    const res = await fetch("/api/hours");
    setHours(await res.json());
    setLoading(false);
  }

  async function updateHour(id: string, data: Partial<StoreHour>) {
    setSaving(id);
    setHours((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)));
    await fetch("/api/hours", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data })
    });
    setSaving(null);
  }

  return (
    <section className="bg-white rounded-2xl border border-brand-border overflow-hidden">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between p-4 hover:bg-brand-bg transition-colors"
      >
        <span className="font-semibold text-ink-primary">
          🕐 Horário de Funcionamento
        </span>
        <span className="text-ink-muted text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-brand-border">
          {loading ? (
            <p className="text-sm text-ink-muted p-4 text-center">
              Carregando...
            </p>
          ) : (
            <div className="divide-y divide-brand-border">
              {hours.map((hour) => (
                <div key={hour.id} className="p-4 flex items-center gap-3">
                  {/* Toggle ativo */}
                  <button
                    onClick={() =>
                      updateHour(hour.id, { active: !hour.active })
                    }
                    className={clsx(
                      "w-11 h-6 rounded-full transition-colors relative flex-shrink-0",
                      hour.active ? "bg-green-500" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={clsx(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                        hour.active ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>

                  {/* Dia */}
                  <span
                    className={clsx(
                      "text-sm font-medium w-16 flex-shrink-0",
                      hour.active ? "text-ink-primary" : "text-ink-muted"
                    )}
                  >
                    {DAYS[hour.dayOfWeek]}
                  </span>

                  {/* Horários */}
                  {hour.active ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={hour.openTime}
                        onChange={(e) =>
                          updateHour(hour.id, { openTime: e.target.value })
                        }
                        className="border border-brand-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-gold"
                      />
                      <span className="text-ink-muted text-sm">até</span>
                      <input
                        type="time"
                        value={hour.closeTime}
                        onChange={(e) =>
                          updateHour(hour.id, { closeTime: e.target.value })
                        }
                        className="border border-brand-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-gold"
                      />
                      {saving === hour.id && (
                        <span className="text-xs text-ink-muted">
                          Salvando...
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-ink-muted italic">
                      Fechado
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
