"use client";
import { useContext } from 'react';
import CartContext from '@/context/CartContext';
import WishlistContext from '@/context/WishlistContext';
// --- 1. Import MinusIcon and PlusIcon ---
import { PlusIcon, MinusIcon, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ProductCard({ product }) {
  // --- 2. Get the full cart and the new decrement function ---
  const { cart, addToCart, decrementFromCart } = useContext(CartContext);
  const { toggleWishlist, isProductInWishlist } = useContext(WishlistContext);

  // --- 3. Find this specific product in the cart ---
  const itemInCart = cart.find(item => item.product._id === product._id);
  const quantityInCart = itemInCart ? itemInCart.quantity : 0;

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-transform duration-300 hover:-translate-y-1 flex flex-col">
      <button 
        onClick={() => toggleWishlist(product._id)}
        className="absolute top-3 right-3 z-10 p-1.5 bg-white/70 backdrop-blur-sm rounded-full"
        aria-label="Toggle Wishlist"
      >
        {isProductInWishlist(product._id) ? (
          <HeartSolid className="h-6 w-6 text-red-500" />
        ) : (
          <HeartOutline className="h-6 w-6 text-gray-600" />
        )}
      </button>
      
      <Link href={`/product/${product._id}`} className="flex-grow">
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
      
      <div className="px-4 pb-4 flex items-center justify-between mt-auto">
        <p className="text-xl font-bold text-gray-900">
          ₹{product.price}
          <span className="text-base font-medium text-gray-500"> / {product.unit}</span>
        </p>

        {/* --- 4. Conditional Rendering Logic --- */}
        <div className="w-28 flex justify-end">
            {quantityInCart > 0 ? (
                // If item is in cart, show the counter
                <div className="flex items-center justify-between w-full h-11 bg-green-600 text-white rounded-lg font-semibold">
                    <button 
                        onClick={() => decrementFromCart(product._id)}
                        className="px-3 py-1"
                        aria-label={`Decrease quantity of ${product.name}`}
                    >
                        <MinusIcon className="h-5 w-5" />
                    </button>
                    <span className="px-2">{quantityInCart}</span>
                    <button 
                        onClick={() => addToCart(product._id)}
                        className="px-3 py-1"
                        aria-label={`Increase quantity of ${product.name}`}
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                </div>
            ) : (
                // If item is not in cart, show the "ADD" button
                <button 
                    onClick={() => addToCart(product._id)}
                    className="flex items-center justify-center w-full h-11 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200 transition-colors"
                    aria-label={`Add ${product.name} to cart`}
                >
                    ADD
                </button>
            )}
        </div>

      </div>
    </div>
  );
}
