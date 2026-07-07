import { CONFIG } from "./config";
import type { Order } from "@/types";
import type { Order as PrismaOrder, OrderStatus } from "@prisma/client";

const fmt = (v: number) => v.toFixed(2).replace(".", ",");

export function buildWhatsAppMessage(order: Order): string {
  const itemLines = order.items
    .map((item) => {
      const variationPart = item.variation ? ` (${item.variation})` : "";
      const total = fmt(item.unitPrice * item.qty);
      return `- ${item.qty}x ${item.name}${variationPart} — R$ ${total}`;
    })
    .join("\n");

  const addressPart =
    order.delivery === "entrega"
      ? `Endereço: ${order.street}, ${order.number} — ${order.neighborhood}`
      : "";

  const changePart =
    order.payment === "cash" && order.needsChange && order.changeFor
      ? `Troco para: R$ ${fmt(order.changeFor)}`
      : "";

  const couponPart =
    order.discountAmount && order.discountAmount > 0
      ? `Cupom (${order.couponCode}): - R$ ${fmt(order.discountAmount)}`
      : "";

  const orderNumberPart = order.orderNumber
    ? `Pedido #${order.orderNumber}`
    : "";

  const lines = [
    "Olá! Gostaria de fazer o seguinte pedido:",
    orderNumberPart,
    "",
    itemLines,
    "",
    `Subtotal: R$ ${fmt(order.subtotal)}`,
    couponPart,
    `Entrega: ${order.delivery === "entrega" ? `R$ ${fmt(order.deliveryFee)}` : "Retirada no balcão"}`,
    `Total: R$ ${fmt(order.total)}`,
    "",
    `Pagamento: ${order.paymentLabel}`,
    changePart,
    addressPart,
    "",
    `Nome: ${order.name}`,
    `Telefone: ${order.phone}`
  ].filter(Boolean);

  const msg = lines.join("\n");

  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

const STATUS_TEMPLATES: Partial<
  Record<OrderStatus, (order: PrismaOrder) => string>
> = {
  PRONTO_RETIRADA: (order) =>
    `Seu pedido #${order.orderNumber} está pronto para retirada! Te esperamos.`,
  A_CAMINHO: (order) =>
    `Seu pedido #${order.orderNumber} saiu para entrega! Chega em breve.`,
  FINALIZADO: (order) =>
    `Pedido #${order.orderNumber} finalizado. Obrigado pela preferência!\n\nQue tal deixar uma avaliação? ${CONFIG.SITE_URL}/avaliacao?pedido=${order.orderNumber}`,
  CANCELADO: (order) =>
    `Seu pedido #${order.orderNumber} foi cancelado. Qualquer dúvida, fale com a gente.`
};

export function buildStatusMessage(
  order: PrismaOrder,
  status: OrderStatus
): string {
  const buildText = STATUS_TEMPLATES[status];
  const text = buildText
    ? buildText(order)
    : `Atualização do seu pedido #${order.orderNumber}.`;

  const phone = order.customerPhone.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
