"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CartItem } from "@/types";
import { CONFIG } from "@/lib/config";

const CART_KEY = "tabacaria_cart";

interface CartStore {
  items: CartItem[];
  timestamp: number;
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const store: CartStore = JSON.parse(raw);
    if (Date.now() - store.timestamp > CONFIG.CART_TTL_MS) {
      localStorage.removeItem(CART_KEY);
      return [];
    }
    return store.items;
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  const store: CartStore = { items, timestamp: Date.now() };
  localStorage.setItem(CART_KEY, JSON.stringify(store));
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variation?: string) => void;
  updateQty: (productId: string, qty: number, variation?: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  function addToCart(item: CartItem) {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.variation === item.variation
      );
      const updated = existing
        ? prev.map((i) =>
            i.productId === item.productId && i.variation === item.variation
              ? { ...i, qty: i.qty + item.qty }
              : i
          )
        : [...prev, item];
      saveCart(updated);
      return updated;
    });
  }

  function removeFromCart(productId: string, variation?: string) {
    setItems((prev) => {
      const updated = prev.filter(
        (i) => !(i.productId === productId && i.variation === variation)
      );
      saveCart(updated);
      return updated;
    });
  }

  function updateQty(productId: string, qty: number, variation?: string) {
    if (qty <= 0) {
      removeFromCart(productId, variation);
      return;
    }
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.productId === productId && i.variation === variation
          ? { ...i, qty }
          : i
      );
      saveCart(updated);
      return updated;
    });
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    setItems([]);
  }

  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);
  const totalItems = items.reduce((acc, i) => acc + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        subtotal,
        totalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
