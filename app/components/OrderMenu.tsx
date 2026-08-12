"use client";

import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { ORDER_EMAIL } from "../site-config";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: "classic-spam",
    name: "Classic Spam Musubi",
    description: "Grilled Spam, sushi rice, nori.",
    price: 3.5,
    image: "/images/menu/classic-spam.jpg",
  },
  {
    id: "furikake-spam",
    name: "Furikake Spam Musubi",
    description: "Classic musubi rolled in furikake seasoning.",
    price: 3.75,
    image: "/images/menu/furikake-spam.jpg",
  },
  {
    id: "teriyaki-chicken",
    name: "Teriyaki Chicken Musubi",
    description: "Grilled teriyaki chicken thigh, sushi rice, nori.",
    price: 4.25,
    image: "/images/menu/teriyaki-chicken.jpg",
  },
  {
    id: "spicy-tuna",
    name: "Spicy Tuna Musubi",
    description: "Spicy tuna, sushi rice, nori.",
    price: 4.5,
    image: "/images/menu/spicy-tuna.jpg",
  },
  {
    id: "egg-spam",
    name: "Egg & Spam Musubi",
    description: "Grilled Spam, fried egg, sushi rice, nori.",
    price: 4.0,
    image: "/images/menu/egg-spam.jpg",
  },
  {
    id: "vegetable",
    name: "Vegetable Musubi",
    description: "Pickled radish, cucumber, avocado, sushi rice, nori.",
    price: 3.75,
    image: "/images/menu/vegetable.jpg",
  },
];

const currency = (amount: number) =>
  amount.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function OrderMenu() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    MENU_ITEMS.forEach((item) => {
      const img = new window.Image();
      img.onload = () =>
        setLoadedImages((prev) => ({ ...prev, [item.id]: true }));
      img.src = item.image;
    });
  }, []);

  const setQuantity = (id: string, raw: string) => {
    if (raw === "") {
      setQuantities((prev) => ({ ...prev, [id]: 0 }));
      return;
    }
    const parsed = Math.floor(Number(raw));
    if (Number.isNaN(parsed)) return;
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, parsed) }));
  };

  const cartItems = useMemo(
    () =>
      MENU_ITEMS.filter((item) => (quantities[item.id] ?? 0) > 0).map(
        (item) => ({ ...item, quantity: quantities[item.id] }),
      ),
    [quantities],
  );

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

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
      setQuantities({});
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
    <>
      <section id="menu" className="w-full">
        <h2 className="font-dela text-xl text-musubi-maroon">Menu</h2>
        <p className="mb-2 text-sm text-musubi-brown/70">
          Enter the quantity you&apos;d like of each item.
        </p>
        <ul className="divide-y divide-musubi-maroon/15">
          {MENU_ITEMS.map((item) => {
            const quantity = quantities[item.id] ?? 0;
            return (
              <li key={item.id} className="flex items-center gap-4 py-4">
                {loadedImages[item.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-14 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-dashed border-musubi-maroon/30 text-center text-[9px] leading-tight text-musubi-brown/60">
                    Add photo
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="whitespace-nowrap font-league text-lg text-musubi-brown">
                      {item.name}
                    </p>
                    <span className="h-0 flex-1 -translate-y-1 border-b border-dotted border-musubi-maroon/30" />
                    <p className="whitespace-nowrap font-semibold text-musubi-maroon">
                      {currency(item.price)}
                    </p>
                  </div>
                  <p className="text-sm text-musubi-brown/80">
                    {item.description}
                  </p>
                </div>
                <label className="sr-only" htmlFor={`qty-${item.id}`}>
                  Quantity for {item.name}
                </label>
                <input
                  id={`qty-${item.id}`}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="0"
                  value={quantity === 0 ? "" : quantity}
                  onChange={(e) => setQuantity(item.id, e.target.value)}
                  className="w-14 shrink-0 rounded-md border border-musubi-maroon/30 bg-white p-2 text-center text-musubi-brown"
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section
        id="order"
        className="w-full rounded-lg bg-musubi-gold/20 p-5 lg:sticky lg:top-4"
      >
        <h2 className="font-dela text-xl text-musubi-maroon mb-3">
          Your Order
        </h2>
        {cartItems.length === 0 ? (
          <p className="text-musubi-brown/80">
            Add some musubi from the menu above to get started.
          </p>
        ) : (
          <ul className="flex flex-col gap-2 mb-6">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between text-musubi-brown"
              >
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{currency(item.price * item.quantity)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-musubi-maroon/30 pt-2 font-semibold text-musubi-maroon">
              <span>Total</span>
              <span>{currency(total)}</span>
            </li>
          </ul>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name for pickup"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-musubi-maroon/30 bg-white p-2 text-musubi-brown placeholder:text-musubi-brown/50"
          />
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-musubi-maroon/30 bg-white p-2 text-musubi-brown placeholder:text-musubi-brown/50"
          />
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-md border border-musubi-maroon/30 bg-white p-2 text-musubi-brown placeholder:text-musubi-brown/50"
            rows={2}
          />
          <button
            type="submit"
            disabled={cartItems.length === 0 || status === "sending"}
            className={`rounded-md bg-musubi-maroon p-3 text-center font-league text-lg text-white ${
              cartItems.length === 0 || status === "sending"
                ? "pointer-events-none opacity-40"
                : ""
            }`}
          >
            {status === "sending" ? "Sending…" : "Place Order"}
          </button>
          {status === "sent" && (
            <p className="text-sm font-semibold text-musubi-green">
              Order sent! We&apos;ll see you soon.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          )}
          <p className="text-xs text-musubi-brown/70">
            This sends your order straight to {ORDER_EMAIL} for pickup.
            Payment happens in store.
          </p>
        </form>
      </section>
    </>
  );
}
