"use client";

import { useEffect, useState } from "react";

interface StoreHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  active: boolean;
}

export function StoreStatus() {
  const [status, setStatus] = useState<"open" | "closed" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function check() {
      const res = await fetch("/api/hours");
      const hours: StoreHour[] = await res.json();

      const now = new Date();
      const day = now.getDay();
      const timeStr = now.toTimeString().slice(0, 5); // "HH:MM"
      const todayHour = hours.find((h) => h.dayOfWeek === day);

      if (!todayHour || !todayHour.active) {
        setStatus("closed");
        // Encontra próximo dia aberto
        const next =
          hours.filter((h) => h.active).find((h) => h.dayOfWeek > day) ??
          hours.find((h) => h.active);
        const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        setMessage(
          next ? `Abre ${DAYS[next.dayOfWeek]} às ${next.openTime}` : "Fechado"
        );
        return;
      }

      if (timeStr >= todayHour.openTime && timeStr <= todayHour.closeTime) {
        setStatus("open");
        setMessage(`Aberto até ${todayHour.closeTime}`);
      } else if (timeStr < todayHour.openTime) {
        setStatus("closed");
        setMessage(`Abre hoje às ${todayHour.openTime}`);
      } else {
        setStatus("closed");
        // Próximo dia
        const next =
          hours.filter((h) => h.active).find((h) => h.dayOfWeek > day) ??
          hours.find((h) => h.active);
        const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        setMessage(
          next ? `Abre ${DAYS[next.dayOfWeek]} às ${next.openTime}` : "Fechado"
        );
      }
    }
    check();
  }, []);

  if (!status) return null;

  return (
    <div
      className={`px-4 py-2 text-center text-sm font-medium ${
        status === "open"
          ? "bg-green-50 text-green-700 border-b border-green-100"
          : "bg-red-50 text-red-600 border-b border-red-100"
      }`}
    >
      {status === "open" ? "🟢" : "🔴"} {message}
    </div>
  );
}
