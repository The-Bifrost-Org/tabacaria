import type { Metadata } from "next";
import "./globals.css";
import { CONFIG } from "@/lib/config";
import { CartProvider } from "./components/cart/CartProvider";

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
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
