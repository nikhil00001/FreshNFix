"use client";
import { useContext } from 'react';
import CartContext from '@/context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  return (
    // The main card container
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col">
      
      {/* Product Image */}
      <div className="w-full h-48">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover" // Ensures the image covers the area without distortion
        />
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2 capitalize">{product.category}</p>
        
        {/* Spacer to push the button to the bottom */}
        <div className="flex-grow" />

        <div className="flex items-baseline justify-between mt-4">
          <p className="text-xl font-extrabold text-gray-900">
            ₹{product.price}
            <span className="text-sm font-medium text-gray-500"> / {product.unit}</span>
          </p>
        </div>
        
        <button 
          onClick={() => addToCart(product._id)}
          className="w-full mt-3 px-4 py-2 text-md font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}