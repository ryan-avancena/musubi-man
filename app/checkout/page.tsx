"use client";

import { useState, type SubmitEvent } from "react";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { useCart } from "../cart-context";
import { currency } from "../menu-data";
import { ORDER_EMAIL } from "../site-config";

export default function CheckoutPage() {
  const { cartItems, total, removeFromCart, clearCart } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          name,
          email,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("sent");
      clearCart();
      setName("");
      setEmail("");
      setNotes("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 py-6 text-center sm:px-8">
      <Link
        href="/"
        className="flex items-center gap-1 self-start text-sm text-musubi-brown/80 hover:text-musubi-maroon"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to menu
      </Link>

      <h1 className="font-dela text-2xl text-musubi-maroon sm:text-3xl">
        Checkout
      </h1>

      {status === "sent" ? (
        <p
          role="status"
          className="w-full rounded-lg bg-musubi-gold/20 p-5 font-semibold text-musubi-green"
        >
          Order sent! We&apos;ll see you soon.
        </p>
      ) : cartItems.length === 0 ? (
        <p className="text-musubi-brown/80">
          Your order is empty.{" "}
          <Link href="/" className="underline hover:text-musubi-maroon">
            Go pick some musubi
          </Link>
          .
        </p>
      ) : (
        <>
          <ul className="flex w-full flex-col gap-2 text-left">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 text-musubi-brown"
              >
                <span>
                  {item.quantity}x {item.name}
                </span>
                <div className="flex items-center gap-3">
                  <span>{currency(item.price * item.quantity)}</span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-musubi-brown/80 hover:text-musubi-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-musubi-maroon"
                    aria-label={`Remove ${item.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
            <li className="flex justify-between border-t border-musubi-maroon/30 pt-2 font-semibold text-musubi-maroon">
              <span>Total</span>
              <span>{currency(total)}</span>
            </li>
          </ul>

          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-3 text-left"
          >
            <label htmlFor="checkout-name" className="sr-only">
              Name for pickup
            </label>
            <input
              id="checkout-name"
              type="text"
              placeholder="Name for pickup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-musubi-maroon/40 bg-white p-2 text-musubi-brown placeholder:text-musubi-brown/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-musubi-maroon"
            />
            <label htmlFor="checkout-email" className="sr-only">
              Your email
            </label>
            <input
              id="checkout-email"
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-musubi-maroon/40 bg-white p-2 text-musubi-brown placeholder:text-musubi-brown/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-musubi-maroon"
            />
            <label htmlFor="checkout-notes" className="sr-only">
              Notes (optional)
            </label>
            <textarea
              id="checkout-notes"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-md border border-musubi-maroon/40 bg-white p-2 text-musubi-brown placeholder:text-musubi-brown/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-musubi-maroon"
              rows={2}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className={`rounded-md bg-musubi-maroon p-3 text-center font-league text-lg text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-musubi-maroon focus-visible:ring-offset-2 ${
                status === "sending" ? "pointer-events-none opacity-40" : ""
              }`}
            >
              {status === "sending" ? "Sending…" : "Place Order"}
            </button>
            {status === "error" && (
              <p role="alert" className="text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            )}
            <p className="text-xs text-musubi-brown/80">
              This sends your order straight to {ORDER_EMAIL} for pickup.
              Payment happens in store.
            </p>
          </form>
        </>
      )}
    </main>
  );
}
