import AgeGateModal from "./components/AgeGateModal";
import Header from "./components/Header";
import CategoryFilter from "./components/CategoryFilter";
import ProductGrid from "./components/ProductGrid";
import CartBar from "./components/CartBar";

export default function Home() {
  return (
    <>
      <AgeGateModal />
      <div className="flex flex-col min-h-screen bg-[#FAFAF8]">
        <Header />
        <CategoryFilter />
        <main className="flex-1 px-4 py-4 pb-24">
          <ProductGrid />
        </main>
        <CartBar />
      </div>
    </>
  );
}