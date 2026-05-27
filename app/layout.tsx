import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartBar } from "@/components/cart/CartBar";
import { AgeGateModal } from "@/components/modals/AgeGateModal";
import { CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: CONFIG.STORE_NAME,
  description: CONFIG.STORE_TAGLINE
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          <AgeGateModal />
          {children}
          <CartBar />
        </CartProvider>
      </body>
    </html>
  );
}
