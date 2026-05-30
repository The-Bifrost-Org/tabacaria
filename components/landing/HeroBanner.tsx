"use client";
import { useState, useEffect } from "react";

const banners = [
  {
    id: 1,
    title: "Frete Grátis",
    subtitle: "Em compras acima de R$ 20,00",
    bg: "from-[#1A1814] to-[#2D2820]",
  },
  {
    id: 2,
    title: "Fique de Olho nos Cupons",
    subtitle: "Ofertas boladas pra você",
    bg: "from-[#9A7A2E] to-[#C9A84C]",
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
    <div className={`relative bg-gradient-to-br ${banner.bg} min-h-[200px]`}>
      <div
        className={`px-6 py-10 flex flex-col items-center justify-center text-center transition-opacity duration-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2 className="text-3xl font-bold text-white mb-2 font-['Playfair_Display']">{banner.title}</h2>
<p className="text-white/70 text-base italic font-['Playfair_Display']">{banner.subtitle}</p>
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-white w-4" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}