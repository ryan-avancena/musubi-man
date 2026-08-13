"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { MENU_ITEMS } from "./menu-data";

interface CartContextValue {
  quantities: Record<string, number>;
  addToCart: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartItems: { id: string; name: string; price: number; quantity: number }[];
  cartCount: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const addToCart = (id: string, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + quantity }));
  };

  const removeFromCart = (id: string) => {
    setQuantities((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const clearCart = () => setQuantities({});

  const cartItems = useMemo(
    () =>
      MENU_ITEMS.filter((item) => (quantities[item.id] ?? 0) > 0).map(
        (item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: quantities[item.id],
        }),
      ),
    [quantities],
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        quantities,
        addToCart,
        removeFromCart,
        clearCart,
        cartItems,
        cartCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
