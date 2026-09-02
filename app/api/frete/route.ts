import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { cep } = await req.json();

  const cepLimpo = cep?.replace(/\D/g, "");
  if (!cepLimpo || cepLimpo.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.superfrete.com/api/v0/calculator", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SUPERFRETE_TOKEN}`,
        "User-Agent": "SuaveTabacaria/1.0 (integracao@superfrete.com)",
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify({
        from: { postal_code: process.env.SUPERFRETE_CEP_ORIGEM },
        to: { postal_code: cepLimpo },
        services: "1,2",
        options: {
          own_hand: false,
          receipt: false,
          insurance_value: 0,
          use_insurance_value: false,
        },
        package: {
          weight: 0.5,
          height: 10,
          width: 16,
          length: 20,
        },
      }),
    });

    const data = await res.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Erro ao calcular frete" }, { status: 500 });
    }

    const correios = data.filter((o: any) => !o.error && o.price);

    if (correios.length === 0) {
      return NextResponse.json({ error: "Frete indisponível para este CEP" }, { status: 400 });
    }

    return NextResponse.json(correios);
  } catch {
    return NextResponse.json({ error: "Erro ao calcular frete" }, { status: 500 });
  }
}