import { Header } from "@/components/layout/Header";
import { NavBar } from "@/components/landing/NavBar";
import { HeroBanner } from "@/components/landing/HeroBanner";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { Brands } from "@/components/landing/Brands";
import { StoreMap } from "@/components/landing/StoreMap";
import { FlashSaleSection } from "@/components/landing/FlashSaleSection";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-brand-bg pb-24">
      <Header />
      <NavBar />
      <HeroBanner />
      <FeaturedProducts />
      <FlashSaleSection />
      {/* <Brands /> */}
      <StoreMap />
    </main>
  );
}
