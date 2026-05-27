import ProductCard from "./ProductCard";

// Produtos mock para visualizar o layout
const mockProducts = [
  { id: 1, name: "Essência Mint", price: 12.0, available: true, category: "Essências" },
  { id: 2, name: "Rosh Premium", price: 35.0, available: true, category: "Narguilés" },
  { id: 3, name: "Carvão Natural", price: 18.0, available: false, category: "Carvão" },
  { id: 4, name: "Mangueira Silicone", price: 45.0, available: true, category: "Acessórios" },
];

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {mockProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}