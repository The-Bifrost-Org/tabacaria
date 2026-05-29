const brands = [
  "Raw", "Smoking", "Pay-Pay", "OCB", "Papelito",
  "Clipper", "Sadhu", "Guru Spirit", "aLeda",
  "Bem Bolado", "TonaBê", "Zomo", "KingPapper",
  "Seda", "YellowFinger"
];

export function Brands() {
  return (
    <section className="py-8 bg-white border-t border-b border-[#E8E5DF]">
      <div className="px-4 mb-6 text-center">
        <h2 className="text-xl font-bold text-ink-primary font-['Playfair_Display']">
          Marcas que Trabalhamos
        </h2>
        <p className="text-sm text-ink-muted mt-1">Produtos selecionados com qualidade</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 px-4">
        {brands.map((brand) => (
          <span
            key={brand}
            className="px-4 py-2 bg-[#F0EDE7] text-[#1A1814] text-sm font-medium rounded-full border border-[#E8E5DF] hover:bg-[#C9A84C] hover:text-white hover:border-[#C9A84C] transition-colors cursor-default"
          >
            {brand}
          </span>
        ))}
      </div>
    </section>
  );
}