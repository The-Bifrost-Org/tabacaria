"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CONFIG } from "@/lib/config";

interface StoreHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  active: boolean;
}

function useStoreStatus() {
  const [status, setStatus] = useState<"open" | "closed" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function check() {
      const res = await fetch("/api/hours");
      const hours: StoreHour[] = await res.json();
      const now = new Date();
      const day = now.getDay();
      const timeStr = now.toTimeString().slice(0, 5);
      const today = hours.find((h) => h.dayOfWeek === day);
      const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

      if (!today || !today.active) {
        setStatus("closed");
        const next =
          hours.filter((h) => h.active).find((h) => h.dayOfWeek > day) ??
          hours.find((h) => h.active);
        setMessage(
          next ? `Abre ${DAYS[next.dayOfWeek]} ${next.openTime}` : "Fechado"
        );
        return;
      }

      if (timeStr >= today.openTime && timeStr <= today.closeTime) {
        setStatus("open");
        setMessage(`Até ${today.closeTime}`);
      } else if (timeStr < today.openTime) {
        setStatus("closed");
        setMessage(`Abre ${today.openTime}`);
      } else {
        setStatus("closed");
        const next =
          hours.filter((h) => h.active).find((h) => h.dayOfWeek > day) ??
          hours.find((h) => h.active);
        setMessage(
          next ? `Abre ${DAYS[next.dayOfWeek]} ${next.openTime}` : "Fechado"
        );
      }
    }
    check();
  }, []);

  return { status, message };
}

export function Header() {
  const { status, message } = useStoreStatus();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-brand-border shadow-sm">
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Badge de status — esquerda */}
        <div className="w-24 flex-shrink-0">
          {status && (
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                status === "open"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  status === "open" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="truncate">
                {status === "open" ? "Aberto" : "Fechado"}
              </span>
            </div>
          )}
        </div>

        {/* Logo — centro */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt={CONFIG.STORE_NAME}
            width={40}
            height={40}
            className="object-contain"
          />
          <div className="text-center">
            <h1 className="font-display text-xl font-bold text-ink-primary leading-tight">
              {CONFIG.STORE_NAME}
            </h1>
            <p className="text-xs text-ink-muted">{CONFIG.STORE_TAGLINE}</p>
          </div>
        </div>

        {/* Horário — direita */}
        <div className="w-24 flex-shrink-0 flex justify-end">
          {message && (
            <span className="text-xs text-ink-muted text-right leading-tight">
              {message}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
