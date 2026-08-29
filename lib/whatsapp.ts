import { CONFIG } from "./config";
import type { Order } from "@/types";

const fmt = (v: number) => v.toFixed(2).replace(".", ",");

export function buildWhatsAppMessage(order: Order): string {
  const itemLines = order.items
    .map((item) => {
      const variationPart = item.variation ? ` (${item.variation})` : "";
      const total = fmt(item.unitPrice * item.qty);
      return `- ${item.qty}x ${item.name}${variationPart} — R$ ${total}`;
    })
    .join("\n");

  const couponPart =
    order.discountAmount && order.discountAmount > 0
      ? `Cupom (${order.couponCode}): - R$ ${fmt(order.discountAmount)}`
      : "";

  const changePart =
    order.payment === "cash" && order.needsChange && order.changeFor
      ? `Troco para: R$ ${fmt(order.changeFor)}`
      : "";

  let entregaPart = "";
  let addressPart = "";

  if (order.delivery === "retirada") {
    entregaPart = "Entrega: Retirada no balcão";
  } else if (order.isOutsideCity) {
    // Cliente de outra cidade — frete pelos Correios
    entregaPart = `Frete (Correios): R$ ${fmt(order.deliveryFee)}`;
    addressPart = [
      order.street && order.number
        ? `Endereço: ${order.street}, ${order.number}${order.neighborhood ? ` — ${order.neighborhood}` : ""}`
        : "",
      order.destinoCity && order.destinoUF
        ? `Cidade: ${order.destinoCity} - ${order.destinoUF}`
        : "",
      order.destinoCEP
        ? `CEP: ${order.destinoCEP}`
        : "",
    ].filter(Boolean).join("\n");
  } else {
    // Cliente local
    entregaPart = `Entrega: R$ ${fmt(order.deliveryFee)}`;
    addressPart =
      order.street && order.number
        ? `Endereço: ${order.street}, ${order.number}${order.neighborhood ? ` — ${order.neighborhood}` : ""}`
        : "";
  }

  const lines = [
    "Olá! Gostaria de fazer o seguinte pedido:",
    "",
    itemLines,
    "",
    `Subtotal: R$ ${fmt(order.subtotal)}`,
    couponPart,
    entregaPart,
    `Total: R$ ${fmt(order.total)}`,
    "",
    `Pagamento: ${order.paymentLabel}`,
    changePart,
    addressPart,
    "",
    `Nome: ${order.name}`,
    `Telefone: ${order.phone}`,
  ].filter(Boolean);

  const msg = lines.join("\n");
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}