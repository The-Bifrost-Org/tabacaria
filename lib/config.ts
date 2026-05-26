export const CONFIG = {
  STORE_NAME: "Tabacaria",
  STORE_TAGLINE: "Os melhores produtos para você",
  WHATSAPP_NUMBER: "5516992782165",
  DELIVERY_FEE: 5.0,
  CART_TTL_MS: 60 * 60 * 1000,
  PAYMENT_OPTIONS: [
    { id: "pix", label: "Pix" },
    { id: "card", label: "Cartão na Entrega" },
    { id: "cash", label: "Dinheiro" }
  ] as const
} as const;
