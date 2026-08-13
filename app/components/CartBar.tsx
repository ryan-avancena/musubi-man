"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../cart-context";
import { currency } from "../menu-data";

export default function CartBar() {
  const { cartCount, total } = useCart();

  if (cartCount === 0) return null;

  return (
    <Link
      href="/checkout"
      aria-label={`Go to checkout, ${cartCount} item${cartCount === 1 ? "" : "s"}, total ${currency(total)}`}
      className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-musubi-maroon/15 bg-musubi-gold/30 px-4 py-3 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-musubi-maroon sm:inset-x-auto sm:bottom-6 sm:right-6 sm:rounded-lg sm:border sm:px-5 sm:py-3 sm:shadow-md"
    >
      <span className="flex items-center gap-2 font-league text-base text-musubi-maroon">
        <ShoppingBag className="h-4 w-4" aria-hidden />
        {cartCount} item{cartCount === 1 ? "" : "s"} · {currency(total)}
      </span>
      <span className="rounded-md bg-musubi-maroon px-3 py-1.5 text-sm font-semibold text-white">
        Checkout
      </span>
    </Link>
  );
}
