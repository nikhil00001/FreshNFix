"use client";

import { useContext } from 'react';
import CartContext from '@/context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';

export default function AddToCartButton({ productId }) {
  const { addToCart } = useContext(CartContext);

  return (
    <button 
      onClick={() => addToCart(productId)}
      className="w-full md:w-auto mt-6 flex items-center justify-center px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700"
    >
      <ShoppingCartIcon className="h-6 w-6 mr-2" />
      Add to Cart
    </button>
  );
}