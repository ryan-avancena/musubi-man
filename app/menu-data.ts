export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

export const MENU_ITEMS: MenuItem[] = [
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

export const currency = (amount: number) =>
  amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
