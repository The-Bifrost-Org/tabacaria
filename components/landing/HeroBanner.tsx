"use client";
import { CONFIG } from "@/lib/config";
import { useState, useEffect } from "react";

const banners = [
  {
    id: 1,
    emoji: "🚚",
    tag: "Promoção",
    title: "Frete Grátis",
    subtitle: `Em compras acima de R$ ${CONFIG.FREE_DELIVERY_ABOVE}`,
    cta: "Comprar Agora",
    ctaLink: "/catalogo",
    bg: "from-[#1A1814] via-[#2D2820] to-[#1A1814]",
    btnPrimary: "bg-[#C9A84C] hover:bg-[#E8C97A] text-[#1A1814]",
    btnSecondary: "bg-white/10 hover:bg-white/20 text-white border border-white/30",
  },
  {
    id: 2,
    emoji: "🎟️",
    tag: "Novidade",
    title: "Fique de Olho nos Cupons",
    subtitle: "Descontos exclusivos toda semana para você",
    cta: "Ver Cupons",
    ctaLink: "/catalogo",
    bg: "from-[#7A5C1E] via-[#9A7A2E] to-[#C9A84C]",
    btnPrimary: "bg-[#1A1814] hover:bg-[#2D2820] text-white",
    btnSecondary: "bg-white/20 hover:bg-white/30 text-[#1A1814] border border-[#1A1814]/30",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % banners.length);
        setVisible(true);
      }, 500);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const banner = banners[current];

  return (
    <div className={`relative bg-gradient-to-br ${banner.bg} overflow-hidden`}>
      {/* Fundo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div
        className={`relative px-6 py-16 md:py-20 flex flex-col items-center justify-center text-center transition-opacity duration-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Tag */}
        <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-widest uppercase">
          {banner.tag}
        </span>

        {/* Emoji */}
        <span className="text-7xl mb-4 drop-shadow-lg">{banner.emoji}</span>

        {/* Título */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 font-['Playfair_Display'] drop-shadow">
          {banner.title}
        </h2>

        {/* Subtítulo */}
        <p className="text-white/80 text-lg italic font-['Playfair_Display'] mb-8 max-w-md">
          {banner.subtitle}
        </p>

        {/* Botões */}
        <div className="flex gap-3 flex-wrap justify-center">
<a href={banner.ctaLink} className={`${banner.btnPrimary} font-bold px-8 py-3 rounded-full text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5`}>
  {banner.cta}
</a>
          
<a href="/catalogo" className={`${banner.btnSecondary} font-semibold px-8 py-3 rounded-full text-sm transition-all hover:-translate-y-0.5`}>
  Ver Produtos
</a>
        </div>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "bg-white w-8" : "bg-white/40 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  </div>
  );
}