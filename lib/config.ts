export const CONFIG = {
  STORE_NAME: "Suave Tabacaria",
  STORE_TAGLINE: "Os melhores produtos para você On-line - Delivery",
  WHATSAPP_NUMBER: "5516988226437",
  DELIVERY_FEE: 5.0,
  FREE_DELIVERY_ABOVE: 25.0,
  CART_TTL_MS: 60 * 60 * 1000,
  PAYMENT_OPTIONS: [
    { id: "pix", label: "Pix" },
    { id: "card", label: "Cartão na Entrega" },
    { id: "cash", label: "Dinheiro" }
  ] as const
} as const;
