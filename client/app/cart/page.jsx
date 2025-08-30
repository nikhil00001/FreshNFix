"use client";

import { useContext } from 'react';
import CartContext from '@/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, loading } = useContext(CartContext);

  // 💡 SOLUTION: Wait for the data to be ready
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold">Loading Your Shopping Cart...</h1>
      </div>
    );
  }

  // If loading is false, it's safe to proceed
  if (!cart || cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
        <Link href="/" className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {cart.map(item => (
            <div key={item.product._id} className="flex items-center border-b py-4">
              <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover rounded-md" />
              <div className="flex-grow ml-4">
                <h2 className="font-semibold">{item.product.name}</h2>
                <p className="text-gray-600">₹{item.product.price}</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value))}
                  className="w-16 text-center border rounded-md py-2 font-semibold"
                />
                <button onClick={() => removeFromCart(item.product._id)} className="text-red-500 hover:text-red-700">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Delivery Fee</span>
            <span>₹50.00</span>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{(subtotal + 50).toFixed(2)}</span>
          </div>
          <Link href="/checkout" className="w-full">
            <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold">
              Proceed to Checkout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}