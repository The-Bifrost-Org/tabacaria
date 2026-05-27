import Image from "next/image";
import { CONFIG } from "@/lib/config";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-brand-border shadow-sm">
      <div className="px-4 h-16 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt={CONFIG.STORE_NAME}
            width={48}
            height={48}
            className="object-contain"
          />
          <div className="text-center">
            <h1 className="font-display text-xl font-bold text-ink-primary leading-tight">
              {CONFIG.STORE_NAME}
            </h1>
            <p className="text-xs text-ink-muted">{CONFIG.STORE_TAGLINE}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
