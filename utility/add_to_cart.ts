'use client';

import { Dispatch, SetStateAction } from 'react';

// Define the cart item interface
interface CartItem {
  product_id: number;
  quantity: number;
}

// Define the cart interface
interface Cart {
  items: CartItem[];
}

// Reusable function to handle adding to cart
export function handleAddToCart(
  productId: number,
  quantity: number,
  setCart?: Dispatch<SetStateAction<Cart>>
): Cart {
  let updatedCart: Cart = { items: [] };
  const existingCart = document.cookie
    .split('; ')
    .find((row) => row.startsWith('cart='))
    ?.split('=')[1];

  if (existingCart) {
    updatedCart = JSON.parse(existingCart);
  }

  const existingItem = updatedCart.items.find((item) => item.product_id === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    updatedCart.items.push({ product_id: productId, quantity });
  }

  // Set cookie with 30-day expiry
  const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `cart=${JSON.stringify(updatedCart)}; expires=${expiryDate}; path=/`;

  // Update state if setCart is provided
  if (setCart) {
    setCart(updatedCart);
  }

  return updatedCart;
}