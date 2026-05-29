import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartBar } from "@/components/cart/CartBar";
import { AgeGateModal } from "@/components/modals/AgeGateModal";
import { Footer } from "@/components/layout/Footer";
import { CONFIG } from "@/lib/config";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";

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
          <div className="flex flex-col min-h-screen">
            <main className="flex-1 pb-24">
              {children}
            </main>
            <Footer />
          </div>
          <CartBar />
          <FeedbackButton />
        </CartProvider>
      </body>
    </html>
  );
}