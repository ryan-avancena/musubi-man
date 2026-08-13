"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Minus, Plus } from "lucide-react";
import { MENU_ITEMS, currency } from "../menu-data";
import { useCart } from "../cart-context";

const ANGLE_STEP = 360 / MENU_ITEMS.length;
const SCROLL_COOLDOWN_MS = 220;

/** Shortest signed distance (in item-steps) from `selected` to `index` on the ring. */
function ringDiff(index: number, selected: number, length: number) {
  let diff = index - selected;
  const half = length / 2;
  while (diff > half) diff -= length;
  while (diff <= -half) diff += length;
  return diff;
}

export default function MusubiWheel() {
  const { addToCart, cartItems, cartCount, total } = useCart();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pickQuantity, setPickQuantity] = useState(1);
  const [radius, setRadius] = useState(170);
  const [isMobile, setIsMobile] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const lastStepAtRef = useRef(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = MENU_ITEMS[selectedIndex];

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const mobile = width < 640;
      setIsMobile(mobile);
      setIsWide(width >= 1024);
      setRadius(mobile ? 110 : 170);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!justAdded) return;
    const timeout = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(timeout);
  }, [justAdded]);

  const selectIndex = (index: number) => {
    setSelectedIndex(index);
    setPickQuantity(1);
  };

  const step = (direction: 1 | -1) => {
    setSelectedIndex(
      (prev) => (prev + direction + MENU_ITEMS.length) % MENU_ITEMS.length,
    );
    setPickQuantity(1);
  };

  // React attaches wheel listeners as passive by default, which silently
  // ignores preventDefault — so this needs a real DOM listener to stop the
  // page from scrolling while the wheel is being spun.
  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 8) return;
      const now = Date.now();
      if (now - lastStepAtRef.current < SCROLL_COOLDOWN_MS) return;
      lastStepAtRef.current = now;
      step(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Roving-tabindex radiogroup: arrow keys move both selection and focus,
  // matching how a native <input type="radio"> group behaves.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let nextIndex: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (selectedIndex + 1) % MENU_ITEMS.length;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (selectedIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
    }
    if (nextIndex !== null) {
      selectIndex(nextIndex);
      itemRefs.current[nextIndex]?.focus();
    }
  };

  const handleAdd = () => {
    addToCart(selected.id, pickQuantity);
    setJustAdded(true);
  };

  return (
    <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[360px_1fr] lg:items-center">
      {/* Selected item panel */}
      <div className="flex flex-col gap-6 sm:gap-2" aria-live="polite" aria-atomic="true">
        <div className="flex justify-center">
          <ImageIcon className="h-120 w-120 text-musubi-maroon/70" aria-hidden />
        </div>
        <h2 className="font-dela text-2xl text-musubi-maroon">
          {selected.name}
        </h2>
        <p className="text-sm text-musubi-brown/80 w-full line-clamp-2 sm:text-base sm:line-clamp-none">
          {selected.description}
        </p>
        <p className="font-semibold text-musubi-maroon sm:mt-1">
          {currency(selected.price)}
        </p>

        <div className="mt-2 flex w-full items-center gap-3 sm:mt-4">
          <div className="flex items-center rounded-md border border-musubi-maroon/40">
            <button
              type="button"
              onClick={() => setPickQuantity((q) => Math.max(1, q - 1))}
              className="p-2 text-musubi-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-musubi-maroon"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-musubi-brown" aria-live="polite">
              {pickQuantity}
            </span>
            <button
              type="button"
              onClick={() => setPickQuantity((q) => q + 1)}
              className="p-2 text-musubi-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-musubi-maroon"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 rounded-md bg-musubi-maroon p-2.5 font-league text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-musubi-maroon focus-visible:ring-offset-2"
          >
            {justAdded ? "Added!" : "Add to Order"}
          </button>
        </div>
        <p className="mt-2 hidden text-xs text-musubi-brown/80 sm:block">
          Scroll, use arrow keys, or click a musubi to browse.
        </p>
      </div>

      {/* The wheel, plus a small cart summary beside it on wide desktop */}
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-10">
      <div className="flex flex-col items-center lg:items-start">
        <div
          ref={wheelRef}
          role="radiogroup"
          aria-label="Choose a musubi"
          onKeyDown={handleKeyDown}
          className={`relative w-full max-w-[440px] lg:max-w-[280px] ${
            isMobile ? "h-[230px] mx-auto" : "h-[340px] mx-auto sm:h-[420px] lg:mx-0"
          }`}
        >
          {/* decorative ring — a half dome on mobile, a half dome opening
              right on wide desktop (facing the panel), a full ring otherwise */}
          <div
            aria-hidden="true"
            className={
              isMobile
                ? "pointer-events-none absolute left-1/2 top-full rounded-t-full border-x border-t border-dashed border-musubi-maroon/15"
                : isWide
                  ? "pointer-events-none absolute left-full top-1/2 rounded-l-full border-y border-l border-dashed border-musubi-maroon/15"
                  : "pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-dashed border-musubi-maroon/15"
            }
            style={
              isMobile
                ? {
                    width: radius * 2,
                    height: radius,
                    transform: "translate(-50%, -100%)",
                  }
                : isWide
                  ? {
                      width: radius,
                      height: radius * 2,
                      transform: "translate(-100%, -50%)",
                    }
                  : {
                      width: radius * 2,
                      height: radius * 2,
                      transform: "translate(-50%, -50%)",
                    }
            }
          />

          {/* pointer marking the selected slot — above the ring normally,
              to the left of it on wide screens where the ring faces the panel */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute flex text-musubi-maroon"
            style={
              isWide
                ? {
                    top: "50%",
                    left: `calc(100% - ${radius + 80}px)`,
                    transform: "translate(-50%, -50%)",
                  }
                : {
                    top: isMobile
                      ? `calc(100% - ${radius + 100}px)`
                      : `calc(50% - ${radius + 100}px)`,
                    left: "50%",
                    transform: "translate(-50%, 0)",
                  }
            }
          >
            <span
              className={
                isWide
                  ? "h-0 w-0 border-y-8 border-l-8 border-y-transparent border-l-musubi-maroon"
                  : "h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-musubi-maroon"
              }
            />
          </div>

          {MENU_ITEMS.map((item, index) => {
            const diff = ringDiff(index, selectedIndex, MENU_ITEMS.length);
            const baseAngle = isMobile ? -90 : isWide ? 180 : -90;
            const angleDeg = baseAngle + diff * ANGLE_STEP;
            const rad = (angleDeg * Math.PI) / 180;
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad);
            const isSelected = diff === 0;
            // On mobile only the upper semicircle (y <= 0) is shown, so the
            // lower half stays free for the big selected-item image below.
            // On wide desktop only the left semicircle (x <= 0) is shown,
            // facing the panel, so the wheel doesn't sprawl rightward.
            const hidden = (isMobile && y > 4) || (isWide && x > 4);

            return (
              <button
                key={item.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={item.name}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => selectIndex(index)}
                style={{
                  top: isMobile ? "100%" : "50%",
                  left: isWide ? "100%" : "50%",
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
                className={`absolute flex flex-col items-center gap-1.5 rounded-lg transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-musubi-maroon focus-visible:ring-offset-2 ${
                  hidden ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <span
                  className={`flex items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    isSelected
                      ? "h-28 w-28 border-musubi-maroon bg-musubi-gold/20 text-musubi-maroon shadow-md sm:h-32 sm:w-32"
                      : "h-16 w-16 border-dashed border-musubi-maroon/25 bg-white text-musubi-brown/40 sm:h-20 sm:w-20"
                  }`}
                >
                  <ImageIcon
                    className={isSelected ? "h-7 w-7" : "h-5 w-5"}
                    aria-hidden
                  />
                </span>
                <span
                  className={`whitespace-nowrap font-league ${
                    isSelected
                      ? "text-sm text-musubi-maroon"
                      : "text-xs text-musubi-brown/80"
                  }`}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Big centered image of the selected musubi, shown in the space
            freed up by the half-circle on mobile. */}
        {isMobile && (
          <div className="mt-2 flex flex-col items-center">
            <ImageIcon className="h-24 w-24 text-musubi-maroon/70" aria-hidden />
          </div>
        )}
      </div>

      {isWide && cartCount > 0 && (
        <div className="w-full max-w-[220px] rounded-lg border border-musubi-maroon/20 bg-white/70 p-3 text-left text-sm text-musubi-brown">
          <p className="mb-1.5 font-league text-xs uppercase tracking-wide text-musubi-brown/70">
            Your order
          </p>
          <ul className="flex flex-col gap-1">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex items-baseline justify-between gap-2"
              >
                <span className="truncate">
                  {item.quantity}x {item.name}
                </span>
                <span className="shrink-0">
                  {currency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex justify-between border-t border-musubi-maroon/20 pt-1.5 font-semibold text-musubi-maroon">
            <span>Total</span>
            <span>{currency(total)}</span>
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
