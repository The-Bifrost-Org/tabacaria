"use client";

const brands = [
  { name: "Raw", logo: "/brands/raw.png" },
  { name: "Smoking", logo: "/brands/smoking.png" },
  { name: "Pay-Pay", logo: "/brands/paypay.png" },
  { name: "OCB", logo: "/brands/ocb.png" },
  { name: "Papelito", logo: "/brands/papelito.png" },
  { name: "Clipper", logo: "/brands/clipper.png" },
  { name: "Sadhu", logo: "/brands/sadhu.png" },
  { name: "aLeda", logo: "/brands/aleda.png" },
  { name: "Bem Bolado", logo: "/brands/bembolado.png" },
  { name: "TonaBê", logo: "/brands/tonab.png" },
  { name: "Zomo", logo: "/brands/zomo.png" },
  { name: "KingPapper", logo: "/brands/king.png" },
  { name: "YellowFinger", logo: "/brands/yf.png" },
];

const infiniteBrands = [...brands, ...brands, ...brands];

export function Brands() {
  return (
    <section className="py-12 bg-white border-t border-b border-[#E8E5DF] overflow-hidden">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-gold mb-1">Parceiros</p>
        <h2 className="text-2xl font-bold text-ink-primary font-['Playfair_Display']">
          Marcas que Trabalhamos
        </h2>
        <p className="text-sm text-ink-muted mt-1">Produtos selecionados com qualidade</p>
      </div>

      <div
        className="flex group"
        style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
      >
        <div className="flex gap-8 animate-marquee group-hover:[animation-play-state:paused]">
          {infiniteBrands.map((brand, i) => (
            <div
  key={i}
  className="flex-shrink-0 flex flex-col items-center gap-2 group/item"
>
  <div className="w-20 h-20 flex items-center justify-center p-2">
    <img
      src={brand.logo}
      alt={brand.name}
      className="w-full h-full object-contain"
    />
  </div>
  <span className="text-xs font-medium text-ink-muted group-hover/item:text-[#C9A84C] transition-colors whitespace-nowrap">
    {brand.name}
  </span>
</div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}