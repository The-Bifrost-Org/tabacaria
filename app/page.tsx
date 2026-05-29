import { HeroBanner } from "@/components/landing/HeroBanner";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { Brands } from "@/components/landing/Brands";
import { Header } from "@/components/layout/Header";
import { NavBar } from "@/components/landing/NavBar";
import { StoreMap } from "@/components/landing/StoreMap";


export default function LandingPage() {
  return (
    <main className="bg-brand-bg">
      {/* Seções vão entrar aqui */}
      <Header />
      <NavBar />
      <HeroBanner />
      <FeaturedProducts />  
      <Brands />
      <StoreMap />
    </main>
    );
}