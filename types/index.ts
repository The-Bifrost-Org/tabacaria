import type {
  Product,
  Category,
  Variation,
  ProductImage
} from "@prisma/client";

export type ProductWithRelations = Product & {
  category: Category;
  variations: Variation[];
  images: ProductImage[];
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
  discountAmount?: number;
  couponCode?: string;
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
