"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error ?? "Erro ao fazer login");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-8 w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-ink-primary text-center mb-2">
          Painel Admin
        </h1>
        <p className="text-sm text-ink-muted text-center mb-8">
          Acesso restrito
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-dark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
