import { AvaliacaoForm } from "@/components/avaliacao/AvaliacaoForm";
import { Suspense } from "react";

export default function AvaliacaoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
      <AvaliacaoForm />
    </Suspense>
  );
}
