"use client";
import { useContext } from 'react';
import CartContext from '@/context/CartContext';
import { PlusIcon } from '@heroicons/react/24/solid';
import Link from 'next/link'; // Import Link

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-transform duration-300 hover:-translate-y-1">
      {/* This link will wrap the image and text */}
      <Link href={`/product/${product._id}`}>
        {product.tag && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            {product.tag}
          </div>
        )}
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-contain p-4"
          />
        </div>
        <div className="p-4 pt-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-3">{product.category}</p>
        </div>
      </Link>
      
      {/* The price and button remain outside the link */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <p className="text-xl font-bold text-gray-900">
          ₹{product.price}
        </p>
        <button 
          onClick={() => addToCart(product._id)}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label={`Add ${product.name} to cart`}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}