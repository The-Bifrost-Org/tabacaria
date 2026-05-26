import type { Product, Category, Variation } from "@prisma/client";

export type ProductWithRelations = Product & {
  category: Category;
  variations: Variation[];
};

export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
  variation?: string;
}

export interface Order {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  name: string;
  phone: string;
  delivery: "retirada" | "entrega";
  payment: "pix" | "card" | "cash";
  paymentLabel: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  needsChange?: boolean;
  changeFor?: number;
}
