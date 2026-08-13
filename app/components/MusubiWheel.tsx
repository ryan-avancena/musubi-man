'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

// --- Types ---
export interface MusubiItem {
  id: string;
  name: string;
  ingredients: string;
  price: number;
  color: string;
}

// --- Mock Data ---
const MUSUBI_ITEMS: MusubiItem[] = [
  {
    id: '1',
    name: 'ORIGINAL',
    ingredients: 'Grilled Spam, Seasoned Sushi Rice, Nori Wrap, Sweet Teriyaki Glaze',
    price: 4.5,
    color: '#E86A17',
  },
  {
    id: '2',
    name: 'SPICY MAYO',
    ingredients: 'Crispy Spam, Sriracha Mayo, Toasted Sesame, Furikake, Nori',
    price: 5.0,
    color: '#D9381E',
  },
  {
    id: '3',
    name: 'EGG & SPAM',
    ingredients: 'Tamagoyaki Fried Egg, Glazed Spam, Sushi Rice, Nori Wrap',
    price: 5.5,
    color: '#ECA825',
  },
  {
    id: '4',
    name: 'TERIYAKI CHICKEN',
    ingredients: 'Pulled Teriyaki Chicken, Scallions, Rice, Toasted Nori',
    price: 5.25,
    color: '#8B4513',
  },
  {
    id: '5',
    name: 'KIMCHI CRUNCH',
    ingredients: 'Spicy Kimchi, Spam, Sesame Oil, Furikake, Crispy Garlic',
    price: 5.75,
    color: '#C0392B',
  },
];

// Configuration constants for geometry
const STEP_ANGLE = 22; // Degrees between each item on the arc
const WHEEL_SIZE = 650; // Diameter of wheel in pixels
const RADIUS = WHEEL_SIZE / 2; // 325px
const VISIBLE_OFFSETS = [-3, -2, -1, 0, 1, 2, 3]; // Active window of dots to render on wheel

export default function MusubiWheel() {
  // Continuous unbounded index allowing infinite rotation (e.g. -2, -1, 0, 1, 2, 3...)
  const [rotationIndex, setRotationIndex] = useState<number>(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({
    '1': 1, '2': 1, '3': 1, '4': 1, '5': 1,
  });
  const [cartCount, setCartCount] = useState<number>(2);
  const [direction, setDirection] = useState<number>(0);

  // Helper to map unbounded rotationIndex to valid 0-4 array index
  const getModuloIndex = (index: number) => {
    const len = MUSUBI_ITEMS.length;
    return ((index % len) + len) % len;
  };

  const activeItemIndex = getModuloIndex(rotationIndex);
  const activeItem = MUSUBI_ITEMS[activeItemIndex];
  const currentQty = quantities[activeItem.id] || 1;

  // Rotation angle for the wheel container
  const wheelRotation = -rotationIndex * STEP_ANGLE;

  // Navigation Handlers (Infinite)
  const handleNext = () => {
    setDirection(1);
    setRotationIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setDirection(-1);
    setRotationIndex((prev) => prev - 1);
  };

  const handleSelectVirtual = (targetVirtualIndex: number) => {
    setDirection(targetVirtualIndex > rotationIndex ? 1 : -1);
    setRotationIndex(targetVirtualIndex);
  };

  // Drag swipe handler
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 35;
    if (info.offset.x < -threshold) {
      handleNext();
    } else if (info.offset.x > threshold) {
      handlePrev();
    }
  };

  // Quantity control
  const updateQuantity = (delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [activeItem.id]: Math.max(1, (prev[activeItem.id] || 1) + delta),
    }));
  };

  // Animation variants for central display transition
  const imageVariants = {
    enter: (dir: number) => ({
      rotate: dir > 0 ? 30 : -30,
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.85,
    }),
    center: {
      rotate: 0,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 240, damping: 22 },
    },
    exit: (dir: number) => ({
      rotate: dir < 0 ? 30 : -30,
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.85,
      transition: { duration: 0.18 },
    }),
  };

  return (
    <div className="relative w-full h-screen bg-[#FFF8E7] text-[#F1811F] flex flex-col justify-between p-6 overflow-hidden select-none font-sans">
      
      {/* --- TOP HEADER --- */}
      <header className="flex justify-between items-center w-full max-w-md mx-auto z-20">
        <div className="text-black font-extrabold px-6 py-4 tracking-wider text-xl flex items-center justify-center">
          LOGO
        </div>

        <button 
          onClick={() => setCartCount(prev => prev + currentQty)}
          className="relative p-2 focus:outline-none hover:scale-105 transition-transform"
        >
          <ShoppingCart className="w-12 h-12 stroke-[2.5] text-[#F1811F]" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-2 font-black text-lg text-[#F1811F]">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* --- CENTER CAROUSEL SHOWCASE --- */}
      <main className="flex-1 flex flex-col items-center justify-center z-10 my-2">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          className="w-full max-w-sm flex flex-col items-center cursor-grab active:cursor-grabbing touch-none"
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={rotationIndex}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center w-full"
            >
              {/* Custom SVG Image Placeholder */}
              <div className="w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center relative mb-4">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 465 465"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-sm"
                >
                  <path
                    d="M15.0105 169.156C18.6668 261.405 5.74489 264.677 7.6979 295.571C9.65092 326.466 18.6674 346.821 18.6667 374.154C47.9182 401.487 68.1097 398.381 106.419 411.737C161.263 411.737 186.857 445.903 285.575 452.736M453.765 76.907L450.109 189.656C450.109 189.656 453.234 199.954 453.765 206.739C454.606 217.468 450.109 234.072 450.109 234.072M457.422 271.655C457.422 271.655 458.753 313.393 450.109 333.154C441.465 352.915 406.234 384.404 406.234 384.404C406.234 384.404 307.722 501.763 296.545 439.07C294.434 427.224 296.545 404.903 296.545 404.903M285.577 254.572V298.988C285.577 298.988 281.932 328.454 285.577 346.821C287.472 356.372 292.89 370.737 292.89 370.737M124.7 63.239C124.7 63.239 146.638 56.4068 168.576 66.6562C199.371 81.044 196.057 73.7955 230.001 79.1833C265.099 84.7542 278.264 80.3236 311.17 87.1569C354.297 96.1125 391.609 107.655 391.609 107.655M369.671 141.824L270.951 227.239C270.951 227.239 15.0117 169.157 15.0117 155.49C51.5745 114.49 110.075 66.6571 161.263 8.57516C179.644 6.15605 208.795 8.57516 208.795 8.57516M380.64 131.574C398.921 100.824 457.422 66.6579 442.797 49.5747C369.671 35.9082 322.139 18.825 249.014 22.2417"
                    stroke="#F1811F"
                    strokeWidth="15"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Item Name */}
              <h2 className="text-3xl sm:text-4xl font-black tracking-wider uppercase mb-2 text-center">
                {activeItem.name}
              </h2>

              {/* Ingredients */}
              <p className="text-center lowercase text-xs sm:text-sm font-semibold text-[#F1811F]/80 max-w-xs leading-relaxed mb-5 px-4">
                {activeItem.ingredients}
              </p>

              {/* Quantity Grid (+ [QTY] -) */}
              <div className="grid grid-cols-3 items-center border-4 border-[#F1811F] rounded-full w-48 h-12 px-2 shadow-sm bg-[#FFF8E7]">
                <button
                  onClick={() => updateQuantity(1)}
                  className="flex items-center justify-center text-[#F1811F] hover:scale-110 active:scale-95 transition-transform"
                >
                  <Plus className="w-6 h-6 stroke-[3]" />
                </button>
                <span className="text-center font-black text-xl text-[#F1811F]">
                  {currentQty}
                </span>
                <button
                  onClick={() => updateQuantity(-1)}
                  className="flex items-center justify-center text-[#F1811F] hover:scale-110 active:scale-95 transition-transform"
                >
                  <Minus className="w-6 h-6 stroke-[3]" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>

      {/* --- INFINITE ROTATING STEERING WHEEL --- */}
      <footer className="relative w-full flex items-center justify-center h-48 overflow-hidden">
        {/*
          Perfect 1:1 Circle Container centered absolutely via transform.
          Pivot point is explicitly 'center center'.
        */}
        <motion.div
          animate={{ rotate: wheelRotation }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          style={{
            width: `${WHEEL_SIZE}px`,
            height: `${WHEEL_SIZE}px`,
            transformOrigin: 'center center',
          }}
          className="absolute top-12 left-1/2 -translate-x-1/2 rounded-full border-4 border-[#F1811F] flex-shrink-0"
        >
          {/* Render active window of dots along the perimeter using polar coordinates */}
          {VISIBLE_OFFSETS.map((offset) => {
            const virtualIndex = rotationIndex + offset;
            const itemIndex = getModuloIndex(virtualIndex);
            const item = MUSUBI_ITEMS[itemIndex];

            // Angle on the circle for this virtual dot
            const angleDeg = virtualIndex * STEP_ANGLE;
            const angleRad = (angleDeg * Math.PI) / 180;

            // Trigonometric positioning (0 deg is top center)
            const x = RADIUS + RADIUS * Math.sin(angleRad);
            const y = RADIUS - RADIUS * Math.cos(angleRad);

            const isActive = offset === 0;

            return (
              <div
                key={virtualIndex}
                className="absolute pointer-events-auto"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <button
                  onClick={() => handleSelectVirtual(virtualIndex)}
                  aria-label={`Select ${item.name}`}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-md ${
                    isActive
                      ? 'bg-[#F1811F] scale-125 ring-4 ring-[#FFF8E7]'
                      : 'bg-[#D9D9D9] hover:bg-[#c2c2c2] hover:scale-105'
                  }`}
                >
                  {isActive && (
                    <div className="w-4 h-4 rounded-full bg-[#FFF8E7]" />
                  )}
                </button>
              </div>
            );
          })}
        </motion.div>
      </footer>
    </div>
  );
}