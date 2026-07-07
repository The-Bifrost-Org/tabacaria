// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customerName,
      customerPhone,
      deliveryType, // 'RETIRADA' | 'ENTREGA'
      street,
      number,
      neighborhood,
      paymentType, // 'PIX' | 'CARTAO' | 'DINHEIRO'
      needsChange,
      changeFor,
      deliveryFee,
      couponCode,
      items // [{ productId, productName, variationId?, variationName?, unitPrice, qty }]
    } = body;

    // validação básica
    if (!customerName || !customerPhone || !items?.length) {
      return NextResponse.json(
        {
          error: "Dados incompletos: nome, telefone e itens são obrigatórios."
        },
        { status: 400 }
      );
    }
    if (deliveryType === "ENTREGA" && (!street || !number || !neighborhood)) {
      return NextResponse.json(
        { error: "Endereço obrigatório para entrega." },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum: number, i: { unitPrice: number; qty: number }) =>
        sum + i.unitPrice * i.qty,
      0
    );

    // cupom (opcional)
    let coupon = null;
    let discount = 0;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon?.active) {
        discount =
          coupon.type === "percentual"
            ? subtotal * (coupon.discount / 100)
            : coupon.discount;
      }
    }

    const total = subtotal + (deliveryFee ?? 0) - discount;

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        deliveryType,
        street: deliveryType === "ENTREGA" ? street : null,
        number: deliveryType === "ENTREGA" ? number : null,
        neighborhood: deliveryType === "ENTREGA" ? neighborhood : null,
        paymentType,
        needsChange: paymentType === "DINHEIRO" ? !!needsChange : false,
        changeFor: needsChange ? changeFor : null,
        subtotal,
        deliveryFee: deliveryFee ?? 0,
        discount,
        total,
        couponId: coupon?.id,
        items: {
          create: items.map((i: any) => ({
            productId: i.productId,
            productName: i.productName,
            variationId: i.variationId,
            variationName: i.variationName,
            unitPrice: i.unitPrice,
            qty: i.qty
          }))
        }
      },
      include: { items: true }
    });

    // incrementa uso do cupom, se aplicável
    if (coupon) {
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } }
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido." },
      { status: 500 }
    );
  }
}
