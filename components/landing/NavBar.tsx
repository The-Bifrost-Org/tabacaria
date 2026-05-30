"use client";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <nav className="bg-white shadow-sm px-4 py-2 flex items-center justify-center gap-6">
      <a
        href="/"
        className={`text-base font-medium transition-colors px-6 py-3 rounded-full ${
          isLanding
            ? "bg-[#C9A84C] text-white"
            : "text-black/70 hover:text-[#C9A84C]"
        }`}
      >
        Início
      </a>
      <a
        href="/catalogo"
        className={`text-base font-medium transition-colors px-6 py-3 rounded-full ${
          !isLanding
            ? "bg-[#C9A84C] text-white"
            : "text-black/70 hover:text-[#C9A84C]"
        }`}
      >
        Produtos
      </a>
    </nav>
  );
}