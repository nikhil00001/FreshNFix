"use client";

import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import CartContext from '@/context/CartContext';

export default function CheckoutPage() {
  const { cart } = useContext(CartContext);
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState(null); // In a real app, you'd fetch saved addresses
  const [deliverySlot, setDeliverySlot] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = subtotal + 50; // Hardcoded delivery fee

  // ... inside the CheckoutPage component ...

const handlePlaceOrder = async () => {
    if (!deliverySlot) {
      alert('Please select a delivery slot.');
      return;
    }
    const shippingAddress = {
      street: '123 Fresh St',
      city: 'Groville',
      pincode: '12345',
    };
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
          body: JSON.stringify({ shippingAddress, fixedDeliverySlot: deliverySlot }),
      });
  
      // This is the key change:
      if (!res.ok) {
        // If the response is not OK, get the error message from the backend
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Failed to place order.');
      }
  
      alert('Order placed successfully!');
      router.push('/order-success');
      
    } catch (error) {
      console.error(error);
      // Now the alert will show the specific error from the backend
      alert(`Error: ${error.message}`);
    }
  };
  
  // ... rest of the component

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">1. Select Delivery Slot</h2>
          <select
            value={deliverySlot}
            onChange={(e) => setDeliverySlot(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">-- Choose a time --</option>
            <option value="Today, 5 PM - 7 PM">Today, 5 PM - 7 PM</option>
            <option value="Tomorrow, 9 AM - 11 AM">Tomorrow, 9 AM - 11 AM</option>
          </select>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Shipping Address</h2>
          <div className="p-4 border-2 border-blue-500 rounded-md bg-blue-50">
            <p className="font-bold">Home</p>
            <p>123 Fresh St, Groville, 12345</p>
            <p className="text-sm text-gray-600 mt-2">Address selection UI would go here.</p>
          </div>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          {cart.map(item => (
            <div key={item.product._id} className="flex justify-between text-sm mb-1">
              <span>{item.product.name} x {item.quantity}</span>
              <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between mb-1">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={handlePlaceOrder}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold"
          >
            Place Order & Pay
          </button>
          <p className="text-xs text-center mt-2">Payment integration with Stripe/Razorpay would happen here.</p>
        </div>
      </div>
    </div>
  );
}